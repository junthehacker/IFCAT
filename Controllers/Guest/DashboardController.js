/*------------------------------------
Controller for guest dashboard.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller = require('../Controller');
const IAServiceProvider = require('../../providers/IAServiceProvider');

let instance = null;

/**
 * Controller singleton for guest dashboard.
 * @extends Controller
 */
class DashboardController extends Controller {

    /**
     * @hideconstructor
     */
    constructor() {
        super();
        instance = this;
    }

    /**
     * Get the singleton instance.
     * @returns {DashboardController}
     */
    static getInstance() {
        return instance || new DashboardController();
    }

    /**
     * Express handler to get guest dashboard home.
     * @param {Object} req Express request
     * @param {Object} res Express response
     */
    getHome(req, res) {
        res.render('guest/dashboard', {
            logoutUrl: IAServiceProvider.getLogoutUrl()
        });
    }

}

module.exports = DashboardController;
