const _ = require('lodash'),
    async = require('async'),
    models = require('../../models');

// Retrieve tutorial quiz
exports.getTutorialQuizByParam = (req, res, next, id) => {
    models.TutorialQuiz.findById(id, (err, tutorialQuiz) => {
        if (err) 
            return next(err);
        if (!tutorialQuiz)
            return next(new Error('No tutorial quiz is found.'));
        req.tutorialQuiz = tutorialQuiz;
        next();
    });
};

// Retrieve quizzes within course OR by tutorial
exports.getTutorialsQuizzes = (req, res, next) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 10;

    let query = { quiz: { $in: req.course.quizzes }};
    if (req.tutorial)
        query = { tutorial: req.tutorial };

    models.TutorialQuiz.find({})
        .then(tutorialQuizzes => {
            res.render('admin/pages/tutorials-quizzes', {
                bodyClass: 'tutorials-quizzes-page',
                title: 'Conduct Quizzes',
                course: req.course,
                // tutorial: req.tutorial,
                tutorialQuizzes
            });
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
    let items = req.body.tutorialsQuizzes || [];
    let update = _.reduce(req.body.update, (obj, field) => {
        obj[field] = /^(published|active|archived)$/.test(field) ? !!req.body[field] : req.body[field];
        return obj;
    }, {});
    // update each tutorial-quiz
    async.eachSeries(items, (id, done) => {
        models.TutorialQuiz.findByIdAndUpdate(id, update, { new: true }, (err, tutorialQuiz) => {
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
exports.getTutorialQuiz = (req, res, next) => {
    req.tutorialQuiz.populate([{
        path: 'quiz'
    }, {
        path: 'groups'
    }]).execPopulate().then(() => {
        res.render('admin/pages/tutorial-quiz', {
            bodyClass: 'tutorial-quiz-page',
            title: `Conduct ${req.tutorialQuiz.quiz.name} in Tutorial ${req.tutorialQuiz.tutorial.number}`,
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            tutorial: req.tutorialQuiz.tutorial,
            quiz: req.tutorialQuiz.quiz,
            students: req.tutorialQuiz.tutorial.students,
            groups: _.sortBy(req.tutorialQuiz.groups, group => _.toInteger(group.name))
        });
    }, next);
};
// Edit settings for tutorial quiz
exports.editTutorialQuiz = (req, res, next) => {
    async.series([
        done => {
            req.tutorialQuiz.populate('tutorial quiz', done);
        },
        done => {
            // update tutorial-quiz
            req.tutorialQuiz.set({
                allocateMembers: req.body.allocateMembers,
                maxMembersPerGroup: req.body.maxMembersPerGroup,
                published: !!req.body.published,
                active: !!req.body.active,
                archived: !!req.body.archived
            }).save(done);
        }
    ], err => {
        if (err)
            return next(err);
        // send notification
        req.app.locals.io.in('tutorialQuiz:' + req.tutorialQuiz._id).emit('quizActivated', req.tutorialQuiz);
        req.flash('success', '<b>%s</b> settings have been updated for <b>TUT %s</b>.', req.tutorialQuiz.quiz.name, req.tutorialQuiz.tutorial.number);
        res.redirect(`/admin/courses/${req.course._id}/tutorials-quizzes/${req.tutorialQuiz._id}`);
    });
};