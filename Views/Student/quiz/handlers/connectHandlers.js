import {requestQuizData} from "../actions/quizActions";

export const EVENT_CONNECT       = 'connect';
export const EVENT_CONNECT_ERROR = 'connect_error';
export const EVENT_DISCONNECT    = 'disconnect';

const url    = window.location.href;
const quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/start'));

/**
 * Handle server connection
 * @param socket
 * @param reduce
 * @param getData
 */
export function registerSocketConnect(socket, reduce, getData) {
    socket.on(EVENT_CONNECT, () => {
        console.log("Socket connected...");
        reduce({connected: true});
        // If we are not at connect page, do nothing, otherwise, move to quiz setup
        const data = getData();
        if (data.route === 'connect') {
            reduce({route: 'quizSetup'});
        }
        // Upon connection, we request full quiz data
        requestQuizData(quizId);
    })
}

/**
 * Handler server connection failure
 * @param socket
 * @param reduce
 * @param getData
 */
export function registerSocketConnectError(socket, reduce, getData) {
    socket.on(EVENT_CONNECT_ERROR, () => {
        console.log("Socket connection failure...");
        reduce({
            connected: false,
            connectionFailure: true,
            route: "connect"
        });
    })
}

export function registerSocketDisconnect(socket, reduce, getData) {
    socket.on(EVENT_DISCONNECT, () => {
        console.log("Socket disconnected...");
        reduce({
            connected: false
        });
    })
}

export function register(socket, reduce, getData) {

    console.log("connectHandlers registered.");

    registerSocketConnect(socket, reduce, getData);
    registerSocketConnectError(socket, reduce, getData);
    registerSocketDisconnect(socket, reduce, getData);

}