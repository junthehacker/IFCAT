const models = require('../../models');
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
// Get form for course
exports.getCourse = (req, res, next) => {
    let course = req.course || new models.Course();
    res.render('admin/pages/course', {
        bodyClass: 'course-page',
        title: course.isNew ? 'Add New Course' : 'Edit Course',
        course: course 
    });
};
// Add course
exports.addCourse = (req, res, next) => {
    models.Course.create(req.body, (err, course) => {
        if (err)
            return next(err);
        req.flash('success', 'Course <b>%s</b> has been created.', course.name);
        res.redirect('/admin/courses');
    });
};
// Update course
exports.editCourse = (req, res, next) => {
    req.course.set(req.body).save(err => {
        if (err)
            return next(err);
        req.flash('success', 'Course <b>%s</b> has been updated.', req.course.name);
        res.redirect('back');
    });
};
// Delete course
exports.deleteCourse = (req, res, next) => {
    req.course.remove(err => {
        if (err)
            return next(err);
        req.flash('success', 'Course <b>%s</b> has been deleted.', req.course.name);
        res.redirect('back');
    });
};