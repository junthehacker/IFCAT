/*------------------------------------
Controller for student files.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller = require('../Controller');
const Course     = require('../../Models/Course');
const File       = require('../../Models/File');

/**
 * Controller singleton for student files.
 * @extends Controller
 * @memberOf Controller.StudentController
 */
class FileController extends Controller {

    /**
     * Get course file by ID.
     * TODO: No way this function is working, need to fix
     * @param {Object} req Express request
     * @param {Object} res Express response
     * @returns {Promise<void>}
     */
    async getFileLinkById(req, res) {
        Course.findOne({files: req.params.id}, course => {
            File.findById(req.params.id, file => {
                res.redirect(`/uploads/${course._id}/${file.name}`);
            });
        });
    }

}

module.exports = FileController;
