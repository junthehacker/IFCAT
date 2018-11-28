/*------------------------------------
Controller for logout actions.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller        = require('../Controller');
const IAServiceProvider = require('../../providers/IAServiceProvider');

/**
 * Controller singleton for logout actions.
 * @extends Controller
 * @memberOf Controller.GuestController
 */
class LogoutController extends Controller {

    /**
     * Redirect to logout URL.
     * @param {Object} req Express request
     * @param {Object} res Express response
     */
    logout(req, res) {
        req.logout();
        res.redirect(IAServiceProvider.getLogoutUrl());
    }

}

module.exports = LogoutController;
