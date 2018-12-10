const adminSocketController = require('../Controllers/Admin/AdminSocketController').getInstance();

module.exports = (io, connection) => {
    console.log("Admin handlers mounted...");

    connection.onEvent("ADMIN_JOIN_TUTORIAL_QUIZ").invoke(adminSocketController.requestJoinTutorialQuiz);
    connection.onEvent("ADMIN_GET_JOINED_STUDENTS").invoke(adminSocketController.getJoinedStudents);
};