/*------------------------------------
Controller for quiz questions.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller = require('../Controller');
const Question   = require('../../Models/Question');
const getAbsUrl  = require('../../Utils/getAbsUrl');

/**
 * Controller singleton for quiz questions.
 * @extends Controller
 * @memberOf Controller.StudentController
 */
class QuestionController extends Controller {

    /**
     * Get question submission form.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @returns {Promise<void>}
     */
    async getQuestionForm(req, res) {
        let question = new Question();
        res.render('Student/SubmitQuestion', {
            title: 'Submit Question',
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            question: question,
            initQuestionForm: true
        });
    }

    /**
     * Submit a new question for review.
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @returns {Promise<void>}
     */
    async addQuestion(req, res) {
        let question = new Question({submitter: req.user._id});
        // set default options
        _.forOwn(req.tutorialQuiz.quiz.default, (v, k) => {
            question[k] = _.defaultTo(question[k], v);
        });

        async.series([
            done => question.store(req.body).save(done),
            done => req.tutorialQuiz.quiz.update({$addToSet: {questions: question._id}}, done)
        ], err => {
            if (err)
                req.flash('error', 'An error has occurred while trying to perform operation.');
            else
                req.flash('success', 'Your question has been submitted for review.');
            res.redirect(getAbsUrl(`/student/courses/${req.course.getId()}/quizzes/${req.tutorialQuiz._id}/submit-question`));
        });
    }

    /**
     * Up vote a question by question ID and voter ID.
     * @param {string} questionId Question ID to find.
     * @param {string} voterId User ID.
     * @returns {Promise<void>}
     */
    async upVoteQuestion(questionId, voterId) {
        let question = await Question.findOne({id: questionId});
        question.votes.up.push(voterId);
        await question.save();
    }

    /**
     * Down vote a question by question ID and voter ID.
     * @param {string} questionId Question ID to find.
     * @param {string} voterId User ID.
     * @returns {Promise<void>}
     */
    async downVoteQuestion(questionId, voterId) {
        let question = await Question.findOne({id: questionId});
        question.votes.down.push(voterId);
        await question.save();
    }

}

module.exports = QuestionController;
