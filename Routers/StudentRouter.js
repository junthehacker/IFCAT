const controllers = require('../Controllers/Student');

let router         = require('express').Router(),
    ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

const GetCourseByParameterMiddleware       = require('../Middlewares/ParameterMiddlewares/GetCourseByParameterMiddleware');
const GetQuestionByParameterMiddleware     = require('../Middlewares/ParameterMiddlewares/GetQuestionByParameterMiddleware');
const GetTutorialQuizByParameterMiddleware = require('../Middlewares/ParameterMiddlewares/GetTutorialQuizByParameterMiddleware');

// Mount all parameter middlewares
GetCourseByParameterMiddleware.applyToRouter('course', router);
GetQuestionByParameterMiddleware.applyToRouter('question', router);
GetTutorialQuizByParameterMiddleware.applyToRouter('tutorialQuiz', router);

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