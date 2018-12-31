import {registerHandlers} from "../handlers/register";

const SOCKET_PATH = "/ifcat/socket.io";

/**
 * Attempt to connect to quiz server
 */
export function connectToQuizServer(reduce, getData) {
    window.quizSocket = window.io.connect({
        path: SOCKET_PATH
    });
    registerHandlers(window.quizSocket, reduce, getData);
}