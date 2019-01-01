const EVENT_QUIZ_DATA = 'QUIZ_DATA';
const EVENT_QUIZ_ACTIVE_STATUS_CHANGE = 'QUIZ_ACTIVE_STATUS_CHANGE';

export function registerReceiveQuizData(socket, reduce, getData) {
    socket.on(EVENT_QUIZ_DATA, data => {
        console.log("Quiz data received", data);
        reduce({
            quiz: data.quiz,
            selectedQuestion: 0,
            groupName: data.groupName
        })
    })
}

export function registerQuizActiveStatusChange(socket, reduce, getData) {
    socket.on(EVENT_QUIZ_ACTIVE_STATUS_CHANGE, data => {
        console.log("Quiz active status changed to", data.active);
        let newTutorialQuiz = {...getData().quiz};
        newTutorialQuiz.active = data.active;
        reduce({quiz: newTutorialQuiz});
    });
}

export function register(socket, reduce, getData) {

    console.log("quizHandlers registered.");
    registerReceiveQuizData(socket, reduce, getData);
    registerQuizActiveStatusChange(socket, reduce, getData);

}