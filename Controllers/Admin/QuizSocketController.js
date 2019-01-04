const Controller     = require('../Controller');
const TutorialQuiz   = require('../../Models/TutorialQuiz');
const Group          = require('../../Models/Group');
const Question       = require('../../Models/Question');
const Response       = require('../../Models/Response');
const QuestionType   = require('../../Enums/QuestionType');
const connectionPool = require('../../SocketIO/ConnectionPool').getInstance();


class QuizSocketController extends Controller {
    /**
     * Emits:
     * - ADMIN_TUTORIAL_QUIZ_NEW_STUDENT
     * - ADMIN_TUTORIAL_QUIZ_LEAVE_STUDENT
     * - QUIZ_DATA
     * @param connection
     * @returns {Function}
     */
    requestQuizData(connection) {
        return async data => {
            // Fetch the tutorial quiz requested
            let tutorialQuiz = await TutorialQuiz.findById(data)
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
                    {path: 'groups', model: 'Group'}
                ]).exec();

            if (tutorialQuiz) {
                connection.join(`tutorialQuiz:${tutorialQuiz._id}`);
                connectionPool.emitToRoom(`admin:tutorialQuiz:${tutorialQuiz._id}`, "ADMIN_TUTORIAL_QUIZ_NEW_STUDENT", connection.user);
                connection.onEvent('disconnect').invoke(() => () => {
                    connectionPool.emitToRoom(`admin:tutorialQuiz:${tutorialQuiz._id}`, "ADMIN_TUTORIAL_QUIZ_LEAVE_STUDENT", connection.user);
                });

                let quizData = {
                    user: connection.getUser(),
                    group: null,
                    responses: [],
                    quiz: tutorialQuiz
                };

                tutorialQuiz.groups.forEach(group => {
                    if (group.members.indexOf(connection.getUser().getId()) > -1) {
                        quizData.group = group;
                    }
                });

                // If a student does not belong to any group
                if (!quizData.group) {
                    // If quiz is not yet active, we can auto join them to a group
                    if (!tutorialQuiz.active) {
                        // TODO: tutorialQuiz.allocateMembers = 'self-selection' case
                        // TODO: This logic should be within model
                        const groupsWithRoom = tutorialQuiz.groups.filter(group => {
                            if (!tutorialQuiz.max || !tutorialQuiz.max.membersPerGroup) {
                                tutorialQuiz.max = {membersPerGroup: 2}
                            }
                            return (group.members.length < tutorialQuiz.max.membersPerGroup);
                        });
                        if (groupsWithRoom.length > 0) {
                            // Some group still have room, add the student to first one
                            await Group.findByIdAndUpdate(
                                groupsWithRoom[0]._id,
                                {$push: {members: connection.getUser().getId()}},
                                {new: true});
                            quizData.group = groupsWithRoom[0];
                        } else {
                            // We have to make a new group
                            let group     = new Group();
                            group.name    = (tutorialQuiz.groups.length + 1).toString();
                            group.members = [connection.getUser().getId()];
                            await group.save();
                            await TutorialQuiz.update({_id: tutorialQuiz._id}, {$push: {groups: group._id}}, {new: true});
                            quizData.group = group;
                        }
                    } else {
                        // TODO: Emit an error if trying to enter a new group while session active
                    }
                }

                if (quizData.group) {
                    connection.join(`group:${quizData.group._id}`);
                    quizData.responses = await Response.find({group: quizData.group._id});
                }
                connection.emit("QUIZ_DATA", quizData);

            }
        }
    }

    /**
     * Handles:
     * - NOMINATE_SELF_AS_DRIVER
     * Emits:
     * - GROUP_DRIVER_CHANGED
     * @param connection
     * @returns {Function}
     */
    setCurrentConnectionAsDriver(connection) {
        return async groupId => {
            let group    = await Group.findOne({_id: groupId});
            group.driver = connection.getUser().getId();
            await group.save();

            connectionPool.emitToRoom(`group:${groupId}`, 'GROUP_DRIVER_CHANGED', group);
        }
    }

    /**
     * Attempt an answer for the quiz
     * Handles:
     * - ANSWER_ATTEMPT
     * {questionId: String, groupId: String, answer: String[]}
     * Emits:
     * - GROUP_ATTEMPT
     * @param connection
     * @returns {Function}
     */
    attemptAnswer(connection) {
        return async data => {
            console.log(data);
            let question = await Question.findById(data.questionId);
            let answerIsCorrect;
            if (question.type === QuestionType.MULTIPLE_CHOICE) {
                answerIsCorrect = (question.answers.indexOf(data.answer[0]) !== -1);
            } else if (question.type === QuestionType.MULTIPLE_SELECT) {
                answerIsCorrect = false;
                if (data.answer.length === question.answers.length) {
                    answerIsCorrect = true;
                    data.answer.forEach((ans) => {
                        if (question.answers.indexOf(ans) === -1) answerIsCorrect = false;
                    })
                }
            } else if (question.type === QuestionType.SHORT_ANSWER) {
                if (!question.caseSensitive) {
                    let answer         = data.answer[0].toLowerCase();
                    let correctAnswers = question.answers.map(ans => ans.toLowerCase());
                    answerIsCorrect    = (correctAnswers.indexOf(answer) > -1);
                } else {
                    answerIsCorrect = (question.answers.indexOf(data.answer[0]) > -1);
                }
            }

            let response = await Response.findOne({group: data.groupId, question: data.questionId});
            if (!response) {
                response          = new Response();
                response.group    = data.groupId;
                response.question = data.questionId;
                response.correct  = answerIsCorrect;
                response.attempts = answerIsCorrect ? 0 : 1;
                response.points   = answerIsCorrect ? (question.points + question.firstTryBonus) : 0;
                response.answer   = data.answer;
                await response.save();
            } else {
                // Some logic to prevent students from being dumb and reanswering correct questions and losing points
                // Basically, if they get it right once, they can't worsen their score
                let attemptsInc = (response.correct) ? 0 : (answerIsCorrect) ? 0 : 1;
                let newScore    = (response.correct) ? response.points : (answerIsCorrect) ? (question.points - (response.attempts * question.penalty)) : 0;
                // If they got it correct before, don't increment
                response = await Response.findByIdAndUpdate(
                    response._id,
                    {
                        correct: (response.correct || answerIsCorrect), $inc: {attempts: attemptsInc},
                        points: (newScore > 0) ? newScore : 0, answer: data.answer
                    },
                    {new: true}
                );
            }

            connectionPool.emitToRoom(`group:${data.groupId}`, 'GROUP_ATTEMPT', {
                response: response,
                groupId: data.groupId
            });
        }
    }
}

module.exports = QuizSocketController;
