/*------------------------------------
Controller for admin quiz pages.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller   = require('../Controller');
const File         = require('../../Models/File');
const asyncForEach = require('../../Utils/asyncForEach');
const async        = require('async');
const path         = require('path');
const fs           = require('fs-extra');
const config       = require('../../Utils/config');

// TODO: File system need serious refactoring, currently it only supports storing file into local FS.

/**
 * Controller singleton for admin quiz pages.
 * @extends Controller
 * @memberOf Controller.AdminController
 */
class FileController extends Controller {

    /**
     * Get all files in a course.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async getFiles(req, res, next) {
        try {
            await req.course.withFiles().execPopulate();
            res.render('Admin/Pages/CourseFiles', {
                bodyClass: 'files-page',
                title: 'Files',
                course: req.course
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Update database entries to reflect file uploads.
     * This ENDPOINT DOES NOT actually upload files.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async addFiles(req, res, next) {
        try {
            await asyncForEach(req.files, async (obj) => {
                let file = new File();
                await file.store(obj).save();
                await req.course.update({$push: {files: file._id}});
            });
            req.flash('success', 'The files have been added.');
            res.redirect(`/admin/courses/${req.course._id}/files`);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Delete files from both database and file system.
     * TODO: This function need to be rewritten.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async deleteFiles(req, res, next) {
        const dir = path.join(__dirname, '../..', config.upload.path, req.course.id);
        async.eachSeries(req.body['-files'], (id, done) => {
            async.waterfall([
                function (done) {
                    File.findById(id, (err, file) => {
                        if (err)
                            return done(err);
                        if (!file)
                            return done(new Error('no file'));
                        done(null, file);
                    });
                },
                function (file, done) {
                    file.remove(err => {
                        if (err)
                            return done(err);
                        done(null, file);
                    });
                },
                function (file, done) {
                    let filename = path.resolve(dir, file.name);
                    fs.stat(filename, (err, stats) => {
                        if (err && err.code === 'ENOENT')
                            return done();
                        else if (err)
                            return done(err);
                        else if (stats.isFile())
                            fs.remove(filename, done);
                        else
                            return done();
                    });
                }
            ], done);
        }, err => {
            if (err)
                return next(err);
            req.flash('success', 'The files have been deleted.');
            res.redirect('back');
        });
    }

}

module.exports = FileController;
