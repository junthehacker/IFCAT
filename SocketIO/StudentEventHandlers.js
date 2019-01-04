const quizSocketController = require('../Controllers/Admin/QuizSocketController').getInstance();

module.exports = (io, connection) => {
    console.log("Student handlers mounted...");

    connection.onEvent("REQUEST_QUIZ").invoke(quizSocketController.requestQuizData);
    connection.onEvent("NOMINATE_SELF_AS_DRIVER").invoke(quizSocketController.setCurrentConnectionAsDriver);
    connection.onEvent("ANSWER_ATTEMPT").invoke(quizSocketController.attemptAnswer);

};