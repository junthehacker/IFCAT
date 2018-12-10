/*------------------------------------
Connection pool singleton to store all connections.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * SocketIO namespace.
 * @namespace SocketIO
 */

/**
 * Pool to store all socket connections.
 * @memberOf SocketIO
 */
class ConnectionPool {

    /**
     * @hideconstructor
     */
    constructor() {
        ConnectionPool.instance = this;
        this.connections = [];
    }

    /**
     * Get all socket.io connections.
     * @returns {Array}
     */
    getAllConnections() {
        return this.connections;
    }

    /**
     * Set socket.io instance.
     * @param io
     */
    setSocketIOInstance(io) {
        this.io = io;
    }

    /**
     * Add a new connection.
     * @param {Connection} connection
     */
    addConnection(connection) {
        this.connections.push(connection);
    }

    /**
     * Remove a connection from pool.
     * @param {Connection} connection
     */
    removeConnection(connection) {
        let index = this.connections.indexOf(connection);
        if(index > -1) {
            this.connections.splice(index, 1);
        }
    }

    /**
     * Get all connections that is in a room.
     * @param roomName
     * @returns {any[]}
     */
    getConnectionsInRoom(roomName) {
        return this.connections.filter(connection => {
            if(connection.getRooms().indexOf(roomName) > -1) {
                return true;
            }
        });
    }

    /**
     * Emit an event to room.
     * @param roomName
     * @param eventName
     * @param data
     */
    emitToRoom(roomName, eventName, data) {
        this.io.to(roomName).emit(eventName, data);
    }

    /**
     * Get the singleton instance.
     * @returns {ConnectionPool} The singleton instance.
     */
    static getInstance() {
        return ConnectionPool.instance || new this();
    }
}

module.exports = ConnectionPool;
