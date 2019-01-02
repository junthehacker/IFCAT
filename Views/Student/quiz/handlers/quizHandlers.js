const EVENT_QUIZ_DATA = 'QUIZ_DATA';
const EVENT_QUIZ_ACTIVE_STATUS_CHANGE = 'QUIZ_ACTIVE_STATUS_CHANGE';
const EVENT_QUIZ_GROUP_DRIVER_CHANGED = "GROUP_DRIVER_CHANGED";

export function registerReceiveQuizData(socket, reduce, getData) {
    socket.on(EVENT_QUIZ_DATA, data => {
        console.log("Quiz data received", data);
        reduce({
            user: data.user,
            quiz: data.quiz,
            selectedQuestion: 0,
            group: data.group
        });
        // If the quiz already has a driver, we simply proceed to quiz without setup
        if(data.group.driver && data.quiz.active) {
            console.log("Driver already set", data.group.driver);
            reduce({route: "quiz"});
        }
    })
}

export function registerQuizActiveStatusChange(socket, reduce, getData) {
    socket.on(EVENT_QUIZ_ACTIVE_STATUS_CHANGE, data => {
        console.log("Quiz active status changed to", data.active);
        let newTutorialQuiz = {...getData().quiz};
        newTutorialQuiz.active = data.active;
        reduce({quiz: newTutorialQuiz});
        if(getData().group.driver && data.active) {
            reduce({route: "quiz"});
        }
    });
}

export function registerQuizGroupDriverChanged(socket, reduce, getData) {
    socket.on(EVENT_QUIZ_GROUP_DRIVER_CHANGED, data => {
        console.log("Group driver changed...", data);
        if(getData().route === 'quizSetup') {
            reduce({route: "quiz"});
        }
        reduce({group: data});
    })
}


export function register(socket, reduce, getData) {

    console.log("quizHandlers registered.");
    registerReceiveQuizData(socket, reduce, getData);
    registerQuizActiveStatusChange(socket, reduce, getData);
    registerQuizGroupDriverChanged(socket, reduce, getData);

}