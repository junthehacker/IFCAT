const controllers = require('../Controllers/student'),
    passport = require('passport'),
    models = require('../models');

let router = require('express').Router(),
    ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

// query single objects
router.param('course', controllers.Course.getCourseByParam);
router.param('question', controllers.Question.getQuestionByParam);
router.param('tutorialQuiz', controllers.TutorialQuiz.getTutorialQuizByParam);

// check if user is authenticated
router.use((req, res, next) => {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
});

// authenticated routes
router.get('/logout', controllers.User.logout);
router.get('/courses', controllers.Student.getCourses);
router.get('/courses/:course/quizzes', controllers.Student.getQuizzes);
router.get('/courses/:course/quizzes/:tutorialQuiz/start', controllers.TutorialQuiz.startQuiz);
router.get('/courses/:course/quizzes/:tutorialQuiz/submit-question', controllers.Question.getQuestionForm);
router.post('/courses/:course/quizzes/:tutorialQuiz/submit-question', controllers.Question.addQuestion);
router.get('/file/:id', controllers.File.getFileLinkById);

module.exports = router;