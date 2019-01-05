const EVENT_QUIZ_DATA = 'QUIZ_DATA';
const EVENT_QUIZ_ACTIVE_STATUS_CHANGE = 'QUIZ_ACTIVE_STATUS_CHANGE';
const EVENT_QUIZ_GROUP_DRIVER_CHANGED = "GROUP_DRIVER_CHANGED";
const EVENT_GROUP_ATTEMPT = "GROUP_ATTEMPT";

export function registerReceiveQuizData(socket, reduce, getData) {
    socket.on(EVENT_QUIZ_DATA, data => {
        console.log("Quiz data received", data);
        reduce({
            user: data.user,
            quiz: data.quiz,
            selectedQuestion: 0,
            group: data.group,
            responses: data.responses
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
        if(!data.active) {
            console.log("Deactivating quiz...");
            reduce({route: "quizSetup"});
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

export function registerGroupAttempt(socket, reduce, getData) {
    socket.on(EVENT_GROUP_ATTEMPT, data => {
        console.log("New group attempt...", data);
        if(!data.response.correct) {
            swal("Incorrect answer :(", "Please try again.", "error");
        } else {
            swal("Answer is correct!", "Good job!", "success");
        }
        // Update the list of responses
        let newResponses = [...getData().responses];
        let i = 0;
        for(let response of newResponses) {
            if(response._id === data.response._id) break;
            i++;
        }

        if(i !== newResponses.length) newResponses.splice(i, 1);

        newResponses.push(data.response);
        reduce({responses: newResponses});
    })
}


export function register(socket, reduce, getData) {

    console.log("quizHandlers registered.");
    registerReceiveQuizData(socket, reduce, getData);
    registerQuizActiveStatusChange(socket, reduce, getData);
    registerQuizGroupDriverChanged(socket, reduce, getData);
    registerGroupAttempt(socket, reduce, getData);

}