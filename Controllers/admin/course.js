const models = require('../../Models');
const IAServiceProvider = require('../../providers/IAServiceProvider');

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

// Retrieve many courses
exports.getCourses = (req, res, next) => {

    IAServiceProvider.getAllCourses()
        .then(courses => {
            res.render('admin/pages/courses', {
                bodyClass: 'courses-page',
                title: 'Courses',
                courses
            });
        })

    // let conditions = {};
    // // filter courses based on role
    // if (!req.user.isAdmin()) {
    //     conditions.$or = [];
    //     if (req.user.isInstructor())
    //         conditions.$or.push({ instructors: { $in: [req.user._id] }});
    //     if (req.user.isTA())
    //         conditions.$or.push({ teachingAssistants: { $in: [req.user._id] }});
    // }
    // models.Course.find(conditions, 'name code').sort('code').lean().exec((err, courses) => {
    //     if (err)
    //         return next(err);
    //     res.render('admin/pages/courses', {
    //         bodyClass: 'courses-page',
    //         title: 'Courses',
    //         courses: courses
    //     });
    // });
};
