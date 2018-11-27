/*------------------------------------
Controller for logout actions.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller        = require('../Controller');
const IAServiceProvider = require('../../providers/IAServiceProvider');

let instance = null;

/**
 * Controller singleton for logout actions.
 * @extends Controller
 */
class LogoutController extends Controller {

    /**
     * @hideconstructor
     */
    constructor() {
        super();
        instance = this;
    }

    /**
     * Get the singleton instance.
     * @returns {LogoutController}
     */
    static getInstance() {
        return instance || new LogoutController();
    }

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
