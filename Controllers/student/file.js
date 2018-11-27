const models = require('../../models');
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
// Retrieve a file by Id
exports.getFileLinkById = (req,res) => {
    models.Course.findOne({ files: req.params.id }, course => {
        models.File.findById(req.params.id, file => {
            res.redirect(`/uploads/${course._id}/${file.name}`);
        });
    });
};