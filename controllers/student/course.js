const models = require('../../models');
// Retrieve course
exports.getCourseByParam = (req, res, next, id) => {
    req.user.getCourse(id)
        .then(course => {
            req.course = course;
            next();
        })
        .catch(e => {
            next(e);
        });
};