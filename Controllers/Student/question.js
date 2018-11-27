const _ = require('../../utils/lodash.mixin'),
    async = require('async'),
    models = require('../../Models');


exports.getQuestionForm = (req, res) => {
    let question = new models.Question();
    res.render('student/submit-question', {
        title: 'Submit Question',
        course: req.course,
        tutorialQuiz: req.tutorialQuiz,
        question: question,
        initQuestionForm: true
    });
};

exports.addQuestion = (req, res) => {
    let question = new models.Question({ submitter: req.user._id });
    // set default options
    _.forOwn(req.tutorialQuiz.quiz.default, (v, k) => {
        question[k] = _.defaultTo(question[k], v);
    });

    async.series([
        done => question.store(req.body).save(done),
        done => req.tutorialQuiz.quiz.update({ $addToSet: { questions: question._id }}, done)
    ], err => {
        if (err)
            req.flash('error', 'An error has occurred while trying to perform operation.');
        else
            req.flash('success', 'Your question has been submitted for review.');
        res.redirect(`/student/courses/${req.course._id}/quizzes/${req.tutorialQuiz._id}/submit-question`);
    });
};

exports.upvoteQuestion = (questionId, voterId) => {
    models.Question.findById(questionId, (err, question) => {
        question.votes.up.push(voterId);
        question.save(err => {
            console.log(err);
        });
    });
} 

exports.downvoteQuestion = (questionId, voterId) => {
    models.Question.findById(questionId, (err, question) => {
        question.votes.down.push(voterId);
        question.save(err => {
            console.log(err);
        });
    });
}