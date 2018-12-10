/*------------------------------------
Controller for socket.io actions on admin
dashboard.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller   = require('../Controller');
const TutorialQuiz = require('../../Models/TutorialQuiz');

const connectionPool = require('../../SocketIO/ConnectionPool').getInstance();

/**
 * Controller singleton for admin socket actions.
 * @extends Controller
 * @memberOf Controller.AdminController
 */
class AdminSocketController extends Controller {
    /**
     * Handle ADMIN_JOIN_TUTORIAL_QUIZ event.
     * @param connection
     * @returns {Function}
     */
    requestJoinTutorialQuiz(connection) {
        return async data => {
            let tutorialQuiz = await TutorialQuiz.findOne({_id: data});
            if(tutorialQuiz) {
                connection.join(`admin:tutorialQuiz:${tutorialQuiz._id}`);
                connection.getSocket()
                    .emit("ADMIN_JOIN_TUTORIAL_QUIZ_SUCCESS", `Joined tutorial quiz group ${tutorialQuiz._id}.`);
            } else {
                connection.getSocket().emit("ADMIN_ERROR", "Unable to join, quiz instance not found.");
            }
        };
    }

    /**
     * Handle ADMIN_GET_JOINED_STUDENTS event.
     * @param connection
     * @returns {Function}
     */
    getJoinedStudents(connection) {
        return async data => {
            let tutorialQuiz = await TutorialQuiz.findOne({_id: data});
            if(tutorialQuiz) {
                let connections = connectionPool.getConnectionsInRoom(`tutorialQuiz:${tutorialQuiz._id}`);
                // Normalize connections to connection.user and send back.
                connection.getSocket().emit(
                    "ADMIN_GET_JOINED_STUDENTS_SUCCESS",
                    connections.map(connection => connection.user));
            } else {
                connection.getSocket().emit("ADMIN_ERROR", "Unable to join, quiz instance not found.");
            }
        }
    }
}

module.exports = AdminSocketController;
