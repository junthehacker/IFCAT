/*------------------------------------
Controller for general socket.io actions.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller        = require('../Controller');
const IAServiceProvider = require('../../Providers/IAServiceProvider');

/**
 * Controller singleton for admin socket actions.
 * @extends Controller
 * @memberOf Controller.GuestController
 */
class GuestSocketController extends Controller {
    ping(connection) {
        return async data => {
            connection.getSocket().emit("PONG", data);
        };
    }
}

module.exports = GuestSocketController;
