import * as connectHandlers from './connectHandlers';
import * as quizHandlers    from "./quizHandlers";

export function registerHandlers(socket, reduce, getData) {
    connectHandlers.register(socket, reduce, getData);
    quizHandlers.register(socket, reduce, getData);
}