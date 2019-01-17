/*------------------------------------
Controller for admin question pages.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller = require('../Controller');
const Question   = require('../../Models/Question');
const _          = require('lodash');
const getAbsUrl  = require('../../Utils/getAbsUrl');

/**
 * Controller singleton for admin question pages.
 * @extends Controller
 * @memberOf Controller.AdminController
 */
class QuestionController extends Controller {

    /**
     * List all questions within a quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async getQuestions(req, res, next) {
        try {
            let options = {
                // populate: { path: 'submitter', model: 'User' }
            };
            if (req.query.sort && req.query.sort !== 'votes') {
                options.options = {sort: req.query.sort};
            }
            await req.quiz.withQuestions(options).execPopulate();
            let questions = req.quiz.questions;
            // sort questions by voting score
            if (req.query.sort === 'votes')
                questions = _.orderBy(questions, 'votes.score', 'desc');
            // group questions by status
            questions = _.groupBy(questions, question => question.submitter && !question.approved ? 'pending' : 'approved');
            res.render('Admin/Pages/QuizQuestions', {
                mathjax: true,
                bodyClass: 'questions-page',
                title: 'Questions',
                course: req.course,
                quiz: req.quiz,
                questions: questions
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Sort questions within a quiz, and save the order to database.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async sortQuestions(req, res, next) {
        try {
            let o = req.body.questions || [];
            // sort questions based off order given
            req.quiz.questions.sort((a, b) => o.indexOf(a.toString()) < o.indexOf(b.toString()) ? -1 : 1);
            await req.quiz.save();
            req.flash('success', 'List of questions have been reordered.');
            res.redirect('back');
        } catch (e) {
            next(e);
        }
    }

    /**
     * Get one question within the quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async getQuestion(req, res, next) {
        try {
            let question = req.question || new Question();
            // set default options
            _.forOwn(req.quiz.default, (v, k) => {
                if (_.isUndefined(question[k]) || _.isNull(question[k]) || _.isEmptyArray(question[k]))
                    question[k] = v;
            });

            await req.course.fillFiles();
            await question.populate('submitter').execPopulate();
            res.render('Admin/Pages/QuizQuestion', {
                bodyClass: 'question-page',
                title: question.isNew ? 'Add New Question' : 'Edit Question',
                course: req.course,
                quiz: req.quiz,
                question: question
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Add a new question to the quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async addQuestion(req, res, next) {
        let question = new Question();
        let url      = getAbsUrl(`/admin/courses/${req.course.getId()}/quizzes/${req.quiz._id}/questions`);
        try {
            await question.store(req.body).save();
            await req.quiz.update({$addToSet: {questions: question._id}});
            req.flash('success', 'Question <b>%s</b> has been created.', question.number);
            res.redirect(req.body.back === '1' ? url : 'back');
        } catch (e) {
            next(e);
        }
    }

    /**
     * Render question preview page.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @returns {Promise<void>}
     */
    async previewQuestion(req, res) {
        res.render('Admin/Pages/PreViewQuestion/PreviewQuestion.ejs', {});
    }

    /**
     * Update an existing question within a quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async editQuestion(req, res, next) {
        try {
            console.log(req.question);
            await req.question.store(req.body).save();
            req.flash('success', 'Question <b>%s</b> has been updated.', req.question.number);
            res.redirect('back');
        } catch (e) {
            next(e);
        }
    }

    /**
     * Remove a question from quiz.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {function} next Next callback.
     * @returns {Promise<void>}
     */
    async deleteQuestion(req, res, next) {
        try {
            await req.question.remove();
            req.flash('success', 'Question <b>%s</b> has been deleted.', req.question.number);
            res.redirect('back');
        } catch (e) {
            next(e);
        }
    }
}

module.exports = QuestionController;
