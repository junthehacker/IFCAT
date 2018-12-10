/*------------------------------------
UserEventEmitter super class.
Emit event to user(s).

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const SocketIOEventEmitter = require('../SocketIOEventEmitter');

/**
 * Super class for all SocketIOEventEmitter.
 * @memberOf EventEmitter.SocketIOEventEmitter
 */
class UserEventEmitter extends SocketIOEventEmitter {

    /**
     * Emit an event to user(s).
     * @param {(string[]|string)} to Target to emit to.
     * @param {String} event Event name.
     * @param {String} data Data to send.
     */
    emit(to, event, data) {
        if (to instanceof Array) {
            for (let i = 0; i < to.length; i++) {
                let userId = to[i];
                io.to('user:' + userId).emit(event, data);
            }
        } else {
            io.to('user:' + to).emit(event, data);
        }

    }
}

module.exports = UserEventEmitter;
