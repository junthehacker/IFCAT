const Controller     = require('../Controller');
const TutorialQuiz   = require('../../Models/TutorialQuiz');
const Group          = require('../../Models/Group');
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

                if(quizData.group) connection.join(`group:${quizData.group._id}`);
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
            let group = await Group.findOne({_id: groupId});
            group.driver = connection.getUser().getId();
            await group.save();

            connectionPool.emitToRoom(`group:${groupId}`, 'GROUP_DRIVER_CHANGED', group);
        }
    }
}

module.exports = QuizSocketController;
