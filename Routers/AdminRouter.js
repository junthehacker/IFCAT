const _           = require('lodash'),
      controllers = require('../Controllers/Admin'),
      upload      = require('../Utils/upload');

let router = require('express').Router();

const GetCourseByParameterMiddleware       = require('../Middlewares/ParameterMiddlewares/GetCourseByParameterMiddleware');
const GetFileByParameterMiddleware         = require('../Middlewares/ParameterMiddlewares/GetFileByParameterMiddleware');
const GetQuizByParameterMiddleware         = require('../Middlewares/ParameterMiddlewares/GetQuizByParameterMiddleware');
const GetQuestionByParameterMiddleware     = require('../Middlewares/ParameterMiddlewares/GetQuestionByParameterMiddleware');
const GetGroupByParameterMiddleware        = require('../Middlewares/ParameterMiddlewares/GetGroupByParameterMiddleware');
const GetTutorialByParameterMiddleware     = require('../Middlewares/ParameterMiddlewares/GetTutorialByParameterMiddleware');
const GetTutorialQuizByParameterMiddleware = require('../Middlewares/ParameterMiddlewares/GetTutorialQuizByParameterMiddleware');
const EnsureAdminMiddleware                = require('../Middlewares/EnsureAdminMiddleware');

// Apply all middlewares
GetTutorialByParameterMiddleware.applyToRouter('tutorial', router);
GetTutorialQuizByParameterMiddleware.applyToRouter('tutorialQuiz', router);
GetQuestionByParameterMiddleware.applyToRouter('question', router);
GetQuizByParameterMiddleware.applyToRouter('quiz', router);
GetCourseByParameterMiddleware.applyToRouter('course', router);
GetFileByParameterMiddleware.applyToRouter('fil3', router);
GetGroupByParameterMiddleware.applyToRouter('group', router);
EnsureAdminMiddleware.applyToRouter(router);

const AdminController = require('../Controllers/Admin/AdminController');
const QuizController  = require('../Controllers/Admin/QuizController');

let adminController = AdminController.getInstance();
let quizController  = QuizController.getInstance();

router.get('/courses', adminController.getCourses);

router.get('/courses/:course/files', controllers.File.getFiles);
router.post('/courses/:course/files', upload.any.array('files'), controllers.File.addFiles);
router.delete('/courses/:course/files', controllers.File.deleteFiles);

router.get('/courses/:course/tutorials', controllers.Tutorial.getTutorials);
router.post('/courses/:course/tutorials', controllers.Tutorial.addTutorials);
router.get('/courses/:course/tutorials/:tutorial/edit', controllers.Tutorial.getTutorial);
router.put('/courses/:course/tutorials/:tutorial', controllers.Tutorial.editTutorial);
router.delete('/courses/:course/tutorials/:tutorial', controllers.Tutorial.deleteTutorial);

router.get('/courses/:course/quizzes', quizController.getQuizzes);
router.get('/courses/:course/quizzes/new', quizController.getQuiz);
router.get('/courses/:course/quizzes/:quiz/edit', quizController.getQuiz);
router.post('/courses/:course/quizzes', quizController.addQuiz);
router.post('/courses/:course/quizzes/:quiz/copy', quizController.copyQuiz);
router.put('/courses/:course/quizzes/:quiz', quizController.editQuiz);
router.delete('/courses/:course/quizzes/:quiz', quizController.deleteQuiz);

router.get('/courses/:course/quizzes/:quiz/questions', controllers.Question.getQuestions);
router.patch('/courses/:course/quizzes/:quiz/questions/sort', controllers.Question.sortQuestions);
router.get('/courses/:course/quizzes/:quiz/questions/new', controllers.Question.getQuestion);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', controllers.Question.getQuestion);
router.post('/courses/:course/quizzes/:quiz/questions', controllers.Question.addQuestion);
router.get('/courses/:course/quizzes/:quiz/questions/preview', controllers.Question.previewQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.editQuestion);
router.delete('/courses/:course/quizzes/:quiz/questions/:question', controllers.Question.deleteQuestion);


router.get('/courses/:course/tutorials-quizzes', controllers.TutorialQuiz.getTutorialsQuizzes);
router.patch('/courses/:course/tutorials-quizzes', controllers.TutorialQuiz.editTutorialsQuizzes);
router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz', controllers.TutorialQuiz.getTutorialQuiz);
router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz', controllers.TutorialQuiz.editTutorialQuiz);
router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups', controllers.Group.saveGroups);
router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/generate', controllers.Group.generateGroups);

router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses', controllers.Response.getResponses);
router.post('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses', controllers.Response.addResponse);
router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses/:response', controllers.Response.editResponse);

router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/marks', controllers.Response.getMarksByTutorialQuiz);

router.post('/courses/:course/marks', controllers.Response.getMarksByCourse);
router.get('/courses/:course/students/:student/marks', controllers.Response.getMarksByStudent);


module.exports = router;