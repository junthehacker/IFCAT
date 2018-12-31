const EVENT_QUIZ_DATA = 'QUIZ_DATA';

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

export function register(socket, reduce, getData) {

    console.log("quizHandlers registered.");
    registerReceiveQuizData(socket, reduce, getData);

}