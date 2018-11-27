const controllers = require('../Controllers/Student');

let router = require('express').Router();

const GetCourseByParameterMiddleware       = require('../Middlewares/ParameterMiddlewares/GetCourseByParameterMiddleware');
const GetQuestionByParameterMiddleware     = require('../Middlewares/ParameterMiddlewares/GetQuestionByParameterMiddleware');
const GetTutorialQuizByParameterMiddleware = require('../Middlewares/ParameterMiddlewares/GetTutorialQuizByParameterMiddleware');
const EnsureAuthenticatedMiddleware        = require('../Middlewares/EnsureAuthenticatedMiddleware');

// Mount all middlewares
GetCourseByParameterMiddleware.applyToRouter('course', router);
GetQuestionByParameterMiddleware.applyToRouter('question', router);
GetTutorialQuizByParameterMiddleware.applyToRouter('tutorialQuiz', router);
EnsureAuthenticatedMiddleware.applyToRouter(router);


const StudentController = require('../Controllers/Student/StudentController');

let studentController = StudentController.getInstance();

// authenticated routes
router.get('/courses', studentController.getCourses);
router.get('/courses/:course/quizzes', studentController.getQuizzes);
router.get('/courses/:course/quizzes/:tutorialQuiz/start', controllers.TutorialQuiz.startQuiz);
router.get('/courses/:course/quizzes/:tutorialQuiz/submit-question', controllers.Question.getQuestionForm);
router.post('/courses/:course/quizzes/:tutorialQuiz/submit-question', controllers.Question.addQuestion);
router.get('/file/:id', controllers.File.getFileLinkById);

module.exports = router;
