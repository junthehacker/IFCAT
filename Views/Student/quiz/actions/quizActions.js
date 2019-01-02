const REQUEST_QUIZ = "REQUEST_QUIZ";
const NOMINATE_SELF_AS_DRIVER = "NOMINATE_SELF_AS_DRIVER";

export function requestQuizData(quizId) {
    console.log("Requesting quiz data...", quizId);
    window.quizSocket.emit(REQUEST_QUIZ, quizId);
}

export function nominateSelfAsDriver(groupId) {
    console.log("Setting self as driver...", groupId);
    window.quizSocket.emit(NOMINATE_SELF_AS_DRIVER, groupId);
}