/*------------------------------------
SocketEventEmitters super class.
Used to emit socket.io events.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const EventEmitter = require('../EventEmitter');

/**
 * EventEmitter namespace.
 * @namespace SocketIOEventEmitter
 * @memberOf EventEmitter
 */

/**
 * Super class for all SocketIOEventEmitter.
 * @memberOf EventEmitter.SocketIOEventEmitter
 */
class SocketIOEventEmitter extends EventEmitter {

    /**
     * Construct the emitter with an socket.io instance.
     * @param {mixed} io Socket IO instance.
     */
    constructor(io) {
        super();
        this.io = io;
    }

    /**
     *
     * @param {(string[]|string)} to Target to emit to.
     * @param {String} event Event name.
     * @param {String} data Data to send.
     */
    emit(to, event, data) {
    }
}

module.exports = SocketIOEventEmitter;