/*------------------------------------
Controller for admin dashboard.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Admin controller namespace.
 * @namespace Controller.AdminController
 */

const Controller        = require('../Controller');
const IAServiceProvider = require('../../Providers/IAServiceProvider');

/**
 * Controller singleton for admin dashboard.
 * @extends Controller
 * @memberOf Controller.AdminController
 */
class AdminController extends Controller {

    /**
     * Get a list of courses within the system.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @returns {Promise<void>}
     */
    async getCourses(req, res) {
        let courses = await IAServiceProvider.getAllCourses();
        res.render('Admin/Pages/Courses', {courses});
    }

}

module.exports = AdminController;
