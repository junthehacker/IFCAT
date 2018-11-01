const models = require('../../models');

// Retrieve courses enrolled for student
exports.getCourses = (req, res) => {
    req.user.getCourses()
        .then(courses => {
            res.render('student/courses', { courses: courses });
        });
};

// Retrieve quizzes within course
exports.getQuizzes = (req, res, next) => {
    req.course.getTutorialsEnrolledByUser(req.user)
        .then(tutorials => {
            res.render('student/tutorial-quizzes', {
                course: req.course,
                tutorials,
                tutorialQuizzes: []
            })
        })
        .catch(e => next(e));
    // req.course.populate({
    //     path: 'tutorials',
    //     match: {
    //         students: { $in: [req.user._id] }
    //     }
    // }).execPopulate().then(() => {
    //     // TODO: handle this better
    //     if (!req.course.tutorials.length) {
    //         req.flash('error', 'Course does not have any tutorials.');
    //         return res.redirect('/student/courses');
    //     }
    //     // find tutorial quizzes
    //     models.TutorialQuiz.find({ tutorial: req.course.tutorials[0]._id, published: true }).populate('quiz').exec((err, tutorialQuizzes) => {
    //         res.render('student/tutorial-quizzes', {
    //             course: req.course,
    //             tutorial: req.course.tutorials[0],
    //             tutorialQuizzes: tutorialQuizzes
    //         });
    //     });
    // });
};