/*------------------------------------
Controller for guest dashboard.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller = require('../Controller');
const IAServiceProvider = require('../../providers/IAServiceProvider');

/**
 * Controller singleton for guest dashboard.
 * @extends Controller
 */
class DashboardController extends Controller {

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
