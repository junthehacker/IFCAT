/*------------------------------------
Controller for quizzes.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller   = require('../Controller');
const Quiz         = require('../../Models/Quiz');
const getAbsUrl    = require('../../Utils/getAbsUrl');
const asyncForEach = require('../../Utils/asyncForEach');
const mongoose     = require('mongoose');

/**
 * Controller singleton for quizzes.
 * @extends Controller
 * @memberOf Controller.AdminController
 */
class QuizController extends Controller {

    /**
     * Get a list of quizzes.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async getQuizzes(req, res, next) {
        await req.course.fillQuizzes();
        res.render('Admin/Pages/CourseQuizzes', {
            bodyClass: 'quizzes-page',
            title: 'Quizzes',
            course: req.course
        });
    }

    /**
     * Get one quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async getQuiz(req, res, next) {
        let quiz = req.quiz || new Quiz();
        await req.course.fillTutorials();
        await quiz.populate('tutorialQuizzes').execPopulate();
        res.render('Admin/Pages/CourseQuiz', {
            bodyClass: 'quiz-page',
            title: quiz.isNew ? 'Add New Quiz' : 'Edit Quiz',
            course: req.course,
            quiz: quiz
        });
    }

    /**
     * Add new quiz to the store.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async addQuiz(req, res, next) {
        try {
            let quiz = new Quiz();
            await quiz.store(req.body).save();
            await quiz.linkTutorials(req.body.tutorials);
            req.flash('success', '<b>%s</b> has been created.', quiz.name);
            res.redirect(getAbsUrl(`/admin/courses/${req.course.getId()}/quizzes`));
        } catch (e) {
            next(e);
        }
    }

    /**
     * Edit an existing quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async editQuiz(req, res, next) {
        try {
            await req.quiz.store(req.body).save();
            await req.quiz.linkTutorials(req.body.tutorials);
            req.flash('success', '<b>%s</b> has been updated.', req.quiz.name);
            res.redirect(getAbsUrl(`/admin/courses/${req.course.getId()}/quizzes/${req.quiz._id}/edit`));
        } catch (e) {
            next(e);
        }
    }

    /**
     * Delete an existing quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async deleteQuiz(req, res, next) {
        try {
            await req.quiz.remove();
            req.flash('success', '<b>%s</b> has been deleted.', req.quiz.name);
            res.redirect('back');
        } catch (e) {
            next(e);
        }
    }

    /**
     * Duplicate a quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async copyQuiz(req, res, next) {
        try {
            await req.quiz.withQuestions().execPopulate();
            let questionIds = [];
            asyncForEach(req.quiz.questions, async (question) => {
                question._id   = mongoose.Types.ObjectId();
                question.isNew = true;
                await question.save();
                questionIds.push(question._id);
            });
            req.quiz._id       = mongoose.Types.ObjectId();
            req.quiz.isNew     = true;
            req.quiz.name += ' (copy)';
            req.quiz.questions = questionIds;
            await req.quiz.save();
            req.flash('success', '<b>%s</b> has been added.', req.quiz.name);
            res.redirect('back');
        } catch (e) {
            next(e);
        }
    }
}

module.exports = QuizController;
