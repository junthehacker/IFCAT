var models      = require('../Models'),
    _           = require('lodash'),
    controllers = require('../Controllers/Student');

const QuestionController = require('../Controllers/Student/QuestionController');
const Connection         = require('./Connection');

let questionController = QuestionController.getInstance();

const guestSocketController = require('../Controllers/Guest/GuestSocketController').getInstance();

const connectionPool = require('./ConnectionPool').getInstance();

module.exports = io => (socket => {

    let connection = new Connection.Builder(socket)
        .setUser(socket.request.user)
        .build();
    connectionPool.addConnection(connection);

    if (connection.getUser()) {
        console.log('Socket is authenticated as user', socket.request.user.getId());
        // If user is admin, mount all admin event handlers
        if (connection.getUser().isAdmin()) require('./AdminEventHandlers')(io, connection);

        connection.onEvent("PING").invoke(guestSocketController.ping);

    } else {
        connection.disconnectAndRemoveFromPool();
    }

    const emitters     = require('./emitters')(io);
    const fetchHandler = (handlerName) => (controllers.TutorialQuiz[handlerName])(socket, emitters);



    socket.on('NOMINATE_SELF_AS_DRIVER', fetchHandler('nominateDriver'));
    socket.on('AWARD_POINT', fetchHandler('awardPoint'));
    socket.on('QUIZ_COMPLETE', fetchHandler('quizComplete'));
    socket.on('JOIN_GROUP', fetchHandler('joinGroup'));
    socket.on('CREATE_GROUP', fetchHandler('createGroup'));
    socket.on('CODE_TRACING_ANSWER_ATTEMPT', fetchHandler('codeTracingAttempt'));

    socket.on('REQUEST_QUIZ', function (tutQuizId) {

        models.TutorialQuiz.findById(tutQuizId)
            .populate([{
                path: 'quiz',
                model: 'Quiz',
                populate: {
                    path: 'questions',
                    model: 'Question',
                    select: '-answers',
                    populate: {
                        path: 'files',
                        model: 'File'
                    }
                }
            },
                {
                    path: 'groups',
                    model: 'Group'
                }
            ])
            .exec()
            .then(function (tutQuiz) {

                var studentsGroup, studentsGroupId = null;

                // Socket room for all students in this tutorial taking this quiz
                connection.join(`tutorialQuiz:${tutQuiz._id}`);
                connectionPool.emitToRoom(`admin:tutorialQuiz:${tutQuiz._id}`, "ADMIN_TUTORIAL_QUIZ_NEW_STUDENT", connection.user);
                connection.onEvent('disconnect').invoke(() => () => {
                    connectionPool.emitToRoom(`admin:tutorialQuiz:${tutQuiz._id}`, "ADMIN_TUTORIAL_QUIZ_LEAVE_STUDENT", connection.user);
                });

                // if student already in a group, add them to approriate socket.io room
                tutQuiz.groups.forEach(function (group) {
                    if (group.members.indexOf(connection.getUser().getId()) > -1) {
                        socket.join('group:' + group._id);

                        // Join enrolled group
                        studentsGroup   = group.name;
                        studentsGroupId = group._id;
                        socket.emit('QUIZ_DATA', {
                            userId: socket.request.user._id,
                            quiz: tutQuiz,
                            groupName: studentsGroup,
                            groupId: group._id
                        });
                    }
                })

                if (studentsGroup) return studentsGroupId;
                else if (tutQuiz.active) {
                    socket.emit('info', {message: 'You cannot join a group while the quiz is active. Please talk to your TA.'});
                    return; // don't allow new group joining if a quiz is active
                }

                // student doesn't already have a group - need to add them to one if selection automatic. Otherwise send them list of groups to pick from.
                if (tutQuiz.allocateMembers == 'self-selection') {
                    socket.emit('QUIZ_DATA', {userId: socket.request.user._id, quiz: tutQuiz});
                    return;
                }

                var groupsWithRoom = tutQuiz.groups.filter(function (group) {
                    if (!tutQuiz.max || !tutQuiz.max.membersPerGroup) {
                        tutQuiz.max = {membersPerGroup: 2}   // MAKE THIS DEFAULT BEHAVIOR IN SCHEMA
                    }
                    return (group.members.length < tutQuiz.max.membersPerGroup);
                })

                // if there's already a group with room, we can put the student there
                if (groupsWithRoom.length > 0) {
                    // there is a group with room, let's add the student to it
                    models.Group.findByIdAndUpdate(groupsWithRoom[0]._id, {$push: {members: socket.request.user._id}}, {new: true}, function (err, doc) {
                        if (err) throw err;

                        // Join an existing group with room
                        socket.join('group:' + groupsWithRoom[0]._id);
                        socket.emit('QUIZ_DATA', {
                            userId: socket.request.user._id,
                            quiz: tutQuiz,
                            groupName: groupsWithRoom[0].name,
                            groupId: groupsWithRoom[0]._id
                        });
                        return;
                    });
                }

                // if all existing groups are full, make a new group for the student
                else {
                    // there are no groups with room - let's make a new group
                    var group     = new models.Group();
                    group.name    = (tutQuiz.groups.length + 1).toString();
                    group.members = [socket.request.user._id];
                    group.save(function (err, group) {
                        if (err) console.log(err);
                        // we also need to add the group to this tutorialQuiz
                        models.TutorialQuiz.update({_id: tutQuiz._id}, {$push: {groups: group._id}}, {new: true}, function (err, doc) {
                            if (err) throw err;
                            // Create and join a new group
                            socket.join('group:' + group._id);
                            socket.emit('QUIZ_DATA', {
                                userId: socket.request.user._id,
                                quiz: tutQuiz,
                                groupName: group.name,
                                groupId: group._id
                            });
                            return;
                        })

                    });
                }
            })
            .then(function (groupId) {
                if (!groupId) return;
                models.Response.find({group: groupId})
                    .exec()
                    .then(function (responses) {
                        emitters.emitToGroup(groupId, 'updateScores', {
                            quizId: tutQuizId,
                            responses: responses,
                            groupId: groupId
                        })
                    })
            })
    })

    socket.on('attemptAnswer', function (data) {
        models.Question.findById(data.questionId)
            .exec()
            .then(function (question) {

                var answerIsCorrect;

                if (question.type == 'multiple choice') {
                    answerIsCorrect = (question.answers.indexOf(data.answer[0]) != -1); // mark
                } else if (question.type == 'multiple select') {
                    answerIsCorrect = false;
                    if (data.answer.length == question.answers.length) {
                        answerIsCorrect = true;
                        data.answer.forEach((ans) => {
                            if (question.answers.indexOf(ans) == -1) answerIsCorrect = false;
                        })
                    }
                } else if (question.isShortAnswer()) {
                    if (!question.caseSensitive) {
                        var answer         = data.answer[0].toLowerCase();
                        var correctAnswers = question.answers.map(ans => ans.toLowerCase())
                        answerIsCorrect    = (correctAnswers.indexOf(answer) > -1);
                    } else {
                        answerIsCorrect = (question.answers.indexOf(data.answer[0]) > -1);
                    }
                }

                models.Response.findOne({group: data.groupId, question: data.questionId})
                    .exec()
                    .then(function (response) {
                        if (!response) {
                            var res      = new models.Response();
                            res.group    = data.groupId;
                            res.question = data.questionId;
                            res.correct  = answerIsCorrect;
                            res.attempts = answerIsCorrect ? 0 : 1;
                            res.points   = answerIsCorrect ? (question.points + question.firstTryBonus) : 0;
                            res.answer   = data.answer;
                            return res.save();
                        } else {
                            // Some logic to prevent students from being dumb and reanswering correct questions and losing points
                            // Basically, if they get it right once, they can't worsen their score

                            var attemptsInc = (response.correct) ? 0 : (answerIsCorrect) ? 0 : 1;
                            var newScore    = (response.correct) ? response.points : (answerIsCorrect) ? (question.points - (response.attempts * question.penalty)) : 0;
                            // If they got it correct before, don't increment

                            return models.Response.findByIdAndUpdate(response._id,
                                {
                                    correct: (response.correct || answerIsCorrect), $inc: {attempts: attemptsInc},
                                    points: (newScore > 0) ? newScore : 0, answer: data.answer
                                },
                                {new: true})
                                .exec()
                        }
                    })
                    .then(function (response) {
                        emitters.emitToGroup(data.groupId, 'GROUP_ATTEMPT', {
                            response: response,
                            questionNumber: data.questionNumber,
                            groupId: data.groupId
                        })
                    })

            });

    })

    socket.on('UPVOTE_QUESTION', function (data) {
        questionController.upVoteQuestion(data.questionId, socket.request.user._id);
    });

    socket.on('DOWNVOTE_QUESTION', function (data) {
        questionController.downVoteQuestion(data.questionId, socket.request.user._id);
    })


});
