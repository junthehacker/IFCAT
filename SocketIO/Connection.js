/*------------------------------------
Class represents a socket.io connection.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const connectionPool = require('./ConnectionPool').getInstance();

/**
 * Class represents a socket.io connection.
 * @memberOf SocketIO
 */
class Connection {
    /**
     * Construct with builder.
     * @param builder
     */
    constructor(builder) {
        this.socket = builder.socket;
        this.user   = builder.user;
        this.rooms  = [];
        this.socket.on('disconnect', () => {
            connectionPool.removeConnection(this);
        })
    }

    /**
     * Get user associated with this connection.
     * @returns {*|RemoteUser} The user.
     */
    getUser() {
        return this.user;
    }

    /**
     * Get socket instance.
     * @returns {*|socket|{type, describe, group}|null}
     */
    getSocket() {
        return this.socket;
    }

    /**
     * get a list of rooms.
     * @returns {Array}
     */
    getRooms() {
        return this.rooms;
    }

    /**
     * Join a new room.
     * @param roomName
     */
    join(roomName) {
        // Only join if not already joined.
        if(this.rooms.indexOf(roomName) < 0) {
            this.rooms.push(roomName);
            this.socket.join(roomName);
        }
    }

    /**
     * Link handler.
     * @param eventName
     * @returns {{invoke: function}}
     */
    onEvent(eventName) {
        return {
            /**
             * Upon receiving the event, fire handler.
             * @param {function} handler
             */
            invoke: (handler) => {
                this.socket.on(eventName, handler(this));
            }
        }
    }

    /**
     * Disconnect the socket, and remove self from pool.
     */
    disconnectAndRemoveFromPool() {
        this.socket.disconnect();
        connectionPool.removeConnection(this);
    }

    /**
     * Emit an event to this connection.
     * @param event
     * @param data
     */
    emit(event, data) {
        this.socket.emit(event, data);
    }
}

/**
 * Class used to build a new socket connection.
 * @type {Connection.Builder}
 */
Connection.Builder = class {
    /**
     * Create with socket.io connection.
     * @param socket
     */
    constructor(socket) {
        this.socket = socket;
    }

    /**
     * Set user scope.
     * @param {RemoteUser} user
     * @returns {Connection.Builder}
     */
    setUser(user) {
        this.user = user;
        return this;
    }

    /**
     * Build the instance.
     * @returns {SocketIO.Connection}
     */
    build() {
        return new Connection(this);
    }
};

module.exports = Connection;
