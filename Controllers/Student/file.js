const models = require('../../Models');
// Retrieve a file by Id
exports.getFileLinkById = (req,res) => {
    models.Course.findOne({ files: req.params.id }, course => {
        models.File.findById(req.params.id, file => {
            res.redirect(`/uploads/${course._id}/${file.name}`);
        });
    });
};