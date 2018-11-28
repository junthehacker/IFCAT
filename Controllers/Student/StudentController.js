/*------------------------------------
Controller for student dashboard.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Student controller namespace.
 * @namespace Controller.StudentController
 */

const Controller   = require('../Controller');
const TutorialQuiz = require('../../Models/TutorialQuiz');
const asyncForEach = require('../../Utils/asyncForEach');

/**
 * Controller singleton for student dashboard.
 * @extends Controller
 * @memberOf Controller.StudentController
 */
class StudentController extends Controller {

    /**
     * Get a list of courses a student is enrolled in.
     * @param {Object} req Express request
     * @param {Object} res Express response
     * @returns {Promise<void>}
     */
    async getCourses(req, res) {
        let courses = await req.user.getCourses();
        res.render('Student/Courses', {courses});
    }

    /**
     * Get a list of quizzes the student have access to.
     * @param {Object} req Express request
     * @param {Object} res Express response
     * @returns {Promise<void>}
     */
    async getQuizzes(req, res) {
        try {
            let tutorials   = await req.course.getTutorialsEnrolledByUser(req.user);
            let tutorialIds = tutorials.map(tutorial => tutorial.getId());

            // Find all quizzes user has that is published
            let tutorialQuizzes = await TutorialQuiz.find({
                tutorialId: {$in: tutorialIds}, published: true
            }).populate('quiz').exec();

            await asyncForEach(tutorialQuizzes, async tutorialQuiz => await tutorialQuiz.fillTutorialFromRemote());

            res.render('Student/TutorialQuizzes', {
                course: req.course,
                tutorials,
                tutorialQuizzes
            });
        } catch (e) {
            next(e);
        }
    }

}

module.exports = StudentController;
