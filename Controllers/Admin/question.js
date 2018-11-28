const _ = require('../../Utils/lodash.mixin'),
    async = require('async'),
    models = require('../../Models'),
    url = require('url');
const getAbsUrl = require('../../Utils/getAbsUrl');

/**
 * Question list page
 * @param req
 * @param res
 * @param next
 */
exports.getQuestions = (req, res, next) => {
    let options = { 
        // populate: { path: 'submitter', model: 'User' }
    };
    if (req.query.sort && req.query.sort !== 'votes') {
        options.options = { sort: req.query.sort };
    }
    req.quiz.withQuestions(options).execPopulate().then(() => {
        let questions = req.quiz.questions;
        // sort questions by voting score
        if (req.query.sort === 'votes')
            questions = _.orderBy(questions, 'votes.score', 'desc');
        // group questions by status
        questions = _.groupBy(questions, question => question.submitter && !question.approved ? 'pending' : 'approved');

        res.render('admin/pages/quiz-questions', {
            mathjax: true,
            bodyClass: 'questions-page',
            title: 'Questions',
            course: req.course,
            quiz: req.quiz,
            questions: questions
        });
    }, next);
};
// Sort list of questions
exports.sortQuestions = (req, res, next) => {
    let o = req.body.questions || [];
    // sort questions based off order given
    req.quiz.questions.sort((a, b) => o.indexOf(a.toString()) < o.indexOf(b.toString()) ? -1 : 1);
    req.quiz.save(err => {
        if (err) 
            return next(err);
        req.flash('success', 'List of questions have been reordered.');
        res.redirect('back');
    });
};

/**
 * Add or update question page
 * @param req
 * @param res
 * @param next
 */
exports.getQuestion = (req, res, next) => {
    let question = req.question || new models.Question();
    // set default options
    _.forOwn(req.quiz.default, (v, k) => {
        if (_.isUndefined(question[k]) || _.isNull(question[k]) || _.isEmptyArray(question[k]))
            question[k] = v;
    });

    req.course.fillFiles().then(() => {
        question.populate('submitter').execPopulate().then(() => {
            res.render('admin/pages/quiz-question', {
                bodyClass: 'question-page',
                title: question.isNew ? 'Add New Question' : 'Edit Question',
                course: req.course, 
                quiz: req.quiz, 
                question: question
            });
        }, next);
    }, next);
};

/**
 * Create a new question for the quiz
 * @param req
 * @param res
 * @param next
 */
exports.addQuestion = (req, res, next) => {
    let question = new models.Question();
    let url = getAbsUrl(`/admin/courses/${req.course.getId()}/quizzes/${req.quiz._id}/questions`);
    async.series([
        done => question.store(req.body).save(done),
        done => req.quiz.update({ $addToSet: { questions: question._id }}, done)
    ], err => {
        if (err) 
            return next(err);
        req.flash('success', 'Question <b>%s</b> has been created.', question.number);
        res.redirect(req.body.back === '1' ? url : 'back');
    });
};


// Update specific question for quiz
exports.editQuestion = (req, res, next) => {
    req.question.store(req.body).save(err => {
        if (err) 
            return next(err);
        req.flash('success', 'Question <b>%s</b> has been updated.', req.question.number);
        res.redirect('back');
    });
};

/**
 * Delete a question for the quiz
 * @param req
 * @param res
 * @param next
 */
exports.deleteQuestion = (req, res, next) => {
    req.question.remove(err => {
        if (err) 
            return next(err);
        req.flash('success', 'Question <b>%s</b> has been deleted.', req.question.number);
        res.redirect('back');
    });
};
// Preview question
exports.previewQuestion = (req, res, next) => {
    res.render('admin/pages/previewQuestion/preview-question.ejs', {});
};