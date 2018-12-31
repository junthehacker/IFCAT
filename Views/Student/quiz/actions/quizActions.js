const REQUEST_QUIZ = "REQUEST_QUIZ";

export function requestQuizData(quizId) {
    console.log("Requesting quiz data...", quizId);
    window.quizSocket.emit(REQUEST_QUIZ, quizId);
}
