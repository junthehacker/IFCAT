const upload      = require('../Utils/upload');

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

const AdminController        = require('../Controllers/Admin/AdminController');
const QuizController         = require('../Controllers/Admin/QuizController');
const FileController         = require('../Controllers/Admin/FileController');
const QuestionController     = require('../Controllers/Admin/QuestionController');
const TutorialQuizController = require('../Controllers/Admin/TutorialQuizController');
const GroupController        = require('../Controllers/Admin/GroupController');
const ResponseController     = require('../Controllers/Admin/ResponseController');


let adminController        = AdminController.getInstance();
let quizController         = QuizController.getInstance();
let fileController         = FileController.getInstance();
let questionController     = QuestionController.getInstance();
let tutorialQuizController = TutorialQuizController.getInstance();
let groupController        = GroupController.getInstance();
let responseController     = ResponseController.getInstance();

// Mount all controller methods
router.get('/courses', adminController.getCourses);

router.get('/courses/:course/files', fileController.getFiles);
router.post('/courses/:course/files', upload.any.array('files'), fileController.addFiles);
router.delete('/courses/:course/files', fileController.deleteFiles);

router.get('/courses/:course/quizzes', quizController.getQuizzes);
router.get('/courses/:course/quizzes/new', quizController.getQuiz);
router.get('/courses/:course/quizzes/:quiz/edit', quizController.getQuiz);
router.post('/courses/:course/quizzes', quizController.addQuiz);
router.post('/courses/:course/quizzes/:quiz/copy', quizController.copyQuiz);
router.put('/courses/:course/quizzes/:quiz', quizController.editQuiz);
router.delete('/courses/:course/quizzes/:quiz', quizController.deleteQuiz);

router.get('/courses/:course/quizzes/:quiz/questions', questionController.getQuestions);
router.patch('/courses/:course/quizzes/:quiz/questions/sort', questionController.sortQuestions);
router.get('/courses/:course/quizzes/:quiz/questions/new', questionController.getQuestion);
router.get('/courses/:course/quizzes/:quiz/questions/:question/edit', questionController.getQuestion);
router.post('/courses/:course/quizzes/:quiz/questions', questionController.addQuestion);
router.get('/courses/:course/quizzes/:quiz/questions/preview', questionController.previewQuestion);
router.put('/courses/:course/quizzes/:quiz/questions/:question', questionController.editQuestion);
router.delete('/courses/:course/quizzes/:quiz/questions/:question', questionController.deleteQuestion);

router.get('/courses/:course/tutorials-quizzes', tutorialQuizController.getTutorialsQuizzes);
router.patch('/courses/:course/tutorials-quizzes', tutorialQuizController.editTutorialsQuizzes);
router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz', tutorialQuizController.getTutorialQuiz);
router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz', tutorialQuizController.editTutorialQuiz);

router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups', groupController.saveGroups);
router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/generate', groupController.generateGroups);

router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses', responseController.getResponses);
router.post('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses', responseController.addResponse);
router.patch('/courses/:course/tutorials-quizzes/:tutorialQuiz/groups/:group/responses/:response', responseController.editResponse);
router.get('/courses/:course/tutorials-quizzes/:tutorialQuiz/marks', responseController.getMarksByTutorialQuiz);
router.post('/courses/:course/marks', responseController.getMarksByCourse);
router.get('/courses/:course/students/:student/marks', responseController.getMarksByStudent);

module.exports = router;