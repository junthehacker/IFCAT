const REQUEST_QUIZ = "REQUEST_QUIZ";
const NOMINATE_SELF_AS_DRIVER = "NOMINATE_SELF_AS_DRIVER";
const ANSWER_ATTEMPT = "ANSWER_ATTEMPT";

export function requestQuizData(quizId) {
    console.log("Requesting quiz data...", quizId);
    window.quizSocket.emit(REQUEST_QUIZ, quizId);
}

export function nominateSelfAsDriver(groupId) {
    console.log("Setting self as driver...", groupId);
    window.quizSocket.emit(NOMINATE_SELF_AS_DRIVER, groupId);
}

export function attemptAnswer(questionId, groupId, answer) {
    console.log("Attempting question", questionId, "for group", groupId, "with answer", answer);
    window.quizSocket.emit(ANSWER_ATTEMPT, {
        questionId, groupId, answer
    })
}