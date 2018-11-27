const async = require('async'),
    config = require('../../utils/config'),
    fs = require('fs-extra'),
    models = require('../../models'),
    path = require('path');
// Retrieve file
exports.getFileByParam = (req, res, next, id) => {
    models.File.findById(id, (err, file) => {
        if (err)
            return next(err);
        if (!file)
            return next(new Error('No file is found.'));
        req.fil3 = file; // careful: req.file is used by multer
        next();
    });
};
// Retrieve all files in the course
exports.getFiles = (req, res, next) => {
    req.course.withFiles().execPopulate().then(() => {
        res.render('admin/pages/course-files', {
            bodyClass: 'files-page',
            title: 'Files',
            course: req.course
        });
    }, next);
};
// Add new files
exports.addFiles = (req, res, next) => {
    async.eachSeries(req.files, (obj, done) => {
        let file = new models.File();
        file.store(obj).save(err => {
            if (err) return done(err);
            req.course.update({ $push: { files: file._id }}, done);
        });
    }, err => {
        if (err)
            return next(err);
        req.flash('success', 'The files have been added.');
        res.redirect(`/admin/courses/${req.course._id}/files`);
    });
};
// Delete specific files from course
exports.deleteFiles = (req, res, next) => {
    const dir = path.join(__dirname, '../..', config.upload.path, req.course.id);
    async.eachSeries(req.body['-files'], (id, done) => {
        async.waterfall([
            function (done) {
                models.File.findById(id, (err, file) => {
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
};