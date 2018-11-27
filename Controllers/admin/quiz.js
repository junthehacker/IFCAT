const _         = require('lodash');
const async     = require('async');
const mongoose  = require('mongoose');
const models    = require('../../Models');
const getAbsUrl = require('../../utils/getAbsUrl');


// Retrieve course
exports.getQuizByParam = (req, res, next, id) => {
    models.Quiz.findById(id, (err, quiz) => {
        if (err)
            return next(err);
        if (!quiz)
            return next(new Error('No quiz is found.'));
        req.quiz = quiz;
        next();
    });
};

/**
 * List of quizzes page
 * @param req
 * @param res
 * @param next
 */
exports.getQuizzes = (req, res, next) => {
    req.course.fillQuizzes().then(() => {
        res.render('admin/pages/course-quizzes', {
            bodyClass: 'quizzes-page',
            title: 'Quizzes',
            course: req.course
        });
    }, next);
};

/**
 * Get one quiz
 * @param req
 * @param res
 * @param next
 */
exports.getQuiz = (req, res, next) => {
    let quiz = req.quiz || new models.Quiz();
    req.course.fillTutorials().then(() => {
        quiz.populate('tutorialQuizzes').execPopulate().then(() => {
            res.render('admin/pages/course-quiz', {
                bodyClass: 'quiz-page',
                title: quiz.isNew ? 'Add New Quiz' : 'Edit Quiz',
                course: req.course,
                quiz: quiz
            });
        }, next);
    }, next);
};

/**
 * Add a new quiz to the store
 * @param req
 * @param res
 * @param next
 */
exports.addQuiz = async (req, res, next) => {
    try {
        let quiz = new models.Quiz();
        await quiz.store(req.body).save();
        await quiz.linkTutorials(req.body.tutorials);
        req.flash('success', '<b>%s</b> has been created.', quiz.name);
        res.redirect(getAbsUrl(`/admin/courses/${req.course.getId()}/quizzes`));
    } catch (e) {
        next(e);
    }
};

/**
 * Update a quiz
 * @param req
 * @param res
 * @param next
 */
exports.editQuiz = async (req, res, next) => {
    try {
        await req.quiz.store(req.body).save();
        await req.quiz.linkTutorials(req.body.tutorials);
        req.flash('success', '<b>%s</b> has been updated.', req.quiz.name);
        res.redirect(getAbsUrl(`/admin/courses/${req.course.getId()}/quizzes/${req.quiz._id}/edit`));
    } catch(e) {
        next(e);
    }
};

/**
 * Duplicate a quiz
 * @param req
 * @param res
 * @param next
 */
exports.copyQuiz = (req, res, next) => {
    async.waterfall([
        function (done) {
            req.quiz.withQuestions().execPopulate().then(() => {
                async.mapSeries(req.quiz.questions, (question, done) => {
                    question._id = mongoose.Types.ObjectId();
                    question.isNew = true;
                    question.save(err => {
                        if (err)
                            return done(err);
                        done(null, question._id);
                    });
                }, done);
            }, done);
        },
        function (questions, done) {
            req.quiz._id = mongoose.Types.ObjectId();
            req.quiz.isNew = true;
            req.quiz.name += ' (copy)';
            req.quiz.questions = questions;
            req.quiz.save(done);
        }
    ], err => {
        if (err)
            return next(err);
        req.flash('success', '<b>%s</b> has been added.', req.quiz.name);
        res.redirect('back');
    });
};

/**
 * Delete a quiz
 * @param req
 * @param res
 * @param next
 */
exports.deleteQuiz = (req, res, next) => {
    req.quiz.remove(err => {
        if (err)
            return next(err);
        req.flash('success', '<b>%s</b> has been deleted.', req.quiz.name);
        res.redirect('back');
    });
};

/**
 * Get quiz JSON export
 * @param req
 * @param res
 */
exports.fetchQuizJson = (req, res) => {
    models.Quiz
        .findById(req.params.quizId)
        .populate({path: 'questions', select: '-answers'})
        .then((quiz) => res.json(quiz))
        .catch(err => console.err(err));
};