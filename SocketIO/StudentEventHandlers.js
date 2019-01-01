const quizSocketController = require('../Controllers/Admin/QuizSocketController').getInstance();

module.exports = (io, connection) => {
    console.log("Student handlers mounted...");

    connection.onEvent("REQUEST_QUIZ").invoke(quizSocketController.requestQuizData);
};