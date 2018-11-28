/*------------------------------------
Controller for admin pages that conducts quizzes.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const _         = require('lodash');
const async     = require('async');
const getAbsUrl = require('../../Utils/getAbsUrl');

const TutorialQuiz = require('../../Models/TutorialQuiz');
const models       = require('../../Models');

// Retrieve quizzes within course OR by tutorial
exports.getTutorialsQuizzes = (req, res, next) => {
    let page    = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 10;

    let query = {quiz: {$in: req.course.quizzes}};
    if (req.tutorial)
        query = {tutorial: req.tutorial};

    let tutorialQuizzes;
    models.TutorialQuiz.find({})
        .populate('quiz')
        .then(result => {
            tutorialQuizzes = result;
            let chain       = [];
            tutorialQuizzes.forEach(tutorialQuiz => {
                chain.push(tutorialQuiz.fillTutorialFromRemote());
            });
            return Promise.all(chain);
        })
        .then(() => {
            res.render('admin/pages/tutorials-quizzes', {
                bodyClass: 'tutorials-quizzes-page',
                title: 'Conduct Quizzes',
                course: req.course,
                // tutorial: req.tutorial,
                tutorialQuizzes
            });
        })
        .catch(e => {
            next(e);
        })

    // models.TutorialQuiz.findAndCount(query, {
    //     page: page,
    //     perPage: perPage
    // }, (err, tutorialsQuizzes, count, pages) => {
    //     if (err)
    //         return next(err);
    //     res.render('admin/pages/tutorials-quizzes', {
    //         bodyClass: 'tutorials-quizzes-page',
    //         title: 'Conduct Quizzes',
    //         course: req.course,
    //         tutorial: req.tutorial,
    //         tutorialsQuizzes: tutorialsQuizzes,
    //         pagination: {
    //             page: page,
    //             pages: pages,
    //             perPage: perPage
    //         }
    //     });
    // });
};

// Edit quizzes 
exports.editTutorialsQuizzes = (req, res, next) => {
    let items  = req.body.tutorialsQuizzes || [];
    let update = _.reduce(req.body.update, (obj, field) => {
        obj[field] = /^(published|active|archived)$/.test(field) ? !!req.body[field] : req.body[field];
        return obj;
    }, {});
    // update each tutorial-quiz
    async.eachSeries(items, (id, done) => {
        models.TutorialQuiz.findByIdAndUpdate(id, update, {new: true}, (err, tutorialQuiz) => {
            if (err)
                return done(err);
            // send notification
            req.app.locals.io.in('tutorialQuiz:' + tutorialQuiz._id).emit('quizActivated', tutorialQuiz);
            done();
        });
    }, err => {
        if (err)
            return next(err);
        req.flash('success', 'List of quizzes have been updated.');
        res.redirect('back');
    });
};

/**
 * Retrieve one quiz for the tutorial
 * @param req
 * @param res
 * @param next
 */
exports.getTutorialQuiz = async (req, res, next) => {
    try {
        await req.tutorialQuiz.populate([
            {path: 'quiz'},
            {path: 'groups'}
        ]).execPopulate();
        await req.tutorialQuiz.tutorial.fillStudentsFromRemote();
        res.render('admin/pages/tutorial-quiz', {
            bodyClass: 'tutorial-quiz-page',
            title: `Conduct ${req.tutorialQuiz.quiz.name} in ${req.tutorialQuiz.tutorial.getDisplayName()}`,
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            tutorial: req.tutorialQuiz.tutorial,
            quiz: req.tutorialQuiz.quiz,
            students: req.tutorialQuiz.tutorial.getStudents(),
            groups: _.sortBy(req.tutorialQuiz.groups, group => _.toInteger(group.name))
        });
    } catch (e) {
        next(e);
    }
};


/**
 * Edit tutorial quiz settings
 * @param req
 * @param res
 * @param next
 */
exports.editTutorialQuiz = async (req, res, next) => {

    try {
        await req.tutorialQuiz.fillTutorialFromRemote();
        await req.tutorialQuiz.populate('quiz').execPopulate();

        // update tutorial-quiz
        await req.tutorialQuiz.set({
            allocateMembers: req.body.allocateMembers,
            maxMembersPerGroup: req.body.maxMembersPerGroup,
            published: !!req.body.published,
            active: !!req.body.active,
            archived: !!req.body.archived
        }).save();

        // TODO: This part makes no sense, double check later with student UI
        req.app.locals.io.in('tutorialQuiz:' + req.tutorialQuiz._id).emit('quizActivated', req.tutorialQuiz);
        req.flash('success', '<b>%s</b> settings have been updated for <b>TUT %s</b>.', req.tutorialQuiz.quiz.name, req.tutorialQuiz.tutorial.getDisplayName());
        res.redirect(getAbsUrl(`/admin/courses/${req.course.getId()}/tutorials-quizzes/${req.tutorialQuiz._id}`));
    } catch (e) {
        next(e);
    }

};