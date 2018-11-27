/*------------------------------------
Controller for guest dashboard.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Guest controller namespace.
 * @namespace Controller.Guest
 */

const Controller = require('../Controller');

/**
 * Controller singleton for guest dashboard.
 * @extends Controller
 * @memberOf Controller.Guest
 */
class DashboardController extends Controller {

    /**
     * Express handler to get guest dashboard home.
     * @param {Object} req Express request
     * @param {Object} res Express response
     */
    getHome(req, res) {
        res.render('Guest/Dashboard');
    }

}

module.exports = DashboardController;
