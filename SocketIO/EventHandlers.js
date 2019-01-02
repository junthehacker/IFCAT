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
        require('./StudentEventHandlers')(io, connection);
        // If user is admin, mount all admin event handlers
        if (connection.getUser().isAdmin()) {
            require('./AdminEventHandlers')(io, connection);
        }
        connection.onEvent("PING").invoke(guestSocketController.ping);

    } else {
        connection.disconnectAndRemoveFromPool();
    }

    const emitters     = require('./emitters')(io);
    const fetchHandler = (handlerName) => (controllers.TutorialQuiz[handlerName])(socket, emitters);

    socket.on('AWARD_POINT', fetchHandler('awardPoint'));
    socket.on('QUIZ_COMPLETE', fetchHandler('quizComplete'));
    socket.on('JOIN_GROUP', fetchHandler('joinGroup'));
    socket.on('CREATE_GROUP', fetchHandler('createGroup'));
    socket.on('CODE_TRACING_ANSWER_ATTEMPT', fetchHandler('codeTracingAttempt'));

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
