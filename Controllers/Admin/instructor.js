const models = require('../../Models');
// Retrieve list of instructors for course
exports.getInstructorsByCourse = (req, res, next) => {
    req.course.withInstructors().execPopulate().then(() => {
        res.render('admin/pages/course-instructors', { 
            bodyClass: 'instructors-page',
            title: 'Instructors',
            course: req.course
        });
    }, next);
};
// Retrieve list of instructors matching search query
exports.getInstructorsBySearchQuery = (req, res, next) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 5,
        re = new RegExp(`(${req.query.q.replace(/\s/g, '|').trim()})`, 'i');
    models.User.findAndCount({
        $and: [
            { $or: [{ 'name.first': re },{ 'name.last': re },{ 'local.email': re }] },
            { roles: { $in: ['instructor'] }}
        ]
    }, {
        select: 'name local.email',
        page: page,
        perPage: perPage,
        sort: 'name.first name.last'
    }, (err, users, count, pages) => {
        if (err)
            return next(err);
        res.render('admin/partials/course-instructors-search-results', { 
            course: req.course, 
            instructors: users,
            pagination: {
                count: `${count} user${count !== 1 ? 's' : ''} matched`,
                page: page,
                pages: pages,
                params: {
                    q: req.query.q
                }
            }
        });
    });
};
// Add instructor to course
exports.addInstructors = (req, res, next) => {
    let users = req.body.users || [];
    req.course.update({ $addToSet: { instructors: { $each: users }}}, err => {
        if (err)
            return next(err);
        req.flash('success', 'The list of instructors has been updated for the course.');
        res.sendStatus(200);
    });
};
// Delete instructor from course
exports.deleteInstructors = (req, res, next) => {
    let users = req.body['-users'] || [];
    req.course.update({ $pull: { instructors: { $in: users }}}, err => {
        if (err)
            return next(err);
        req.flash('success', 'The list of instructors has been updated for the course.');
        res.redirect('back');
    }); 
};