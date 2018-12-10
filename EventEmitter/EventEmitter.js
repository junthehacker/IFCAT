/*------------------------------------
EventEmitter super class.
Used to emit network events.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * EventEmitter namespace.
 * @namespace EventEmitter
 */

/**
 * Super class for all EventEmitters.
 * @memberOf EventEmitter
 */
class EventEmitter {
    /**
     *
     * @param {(string[]|string)} to Target to emit to.
     * @param {String} event Event name.
     * @param {String} data Data to send.
     */
    emit(to, event, data) {}
}

module.exports = EventEmitter;