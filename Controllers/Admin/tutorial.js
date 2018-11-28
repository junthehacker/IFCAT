var _ = require('lodash'),
    async = require('async'),
    models = require('../../Models');

const IAServiceProvider = require('../../providers/IAServiceProvider');

/**
 * Retrieve tutorial from remote by param
 * @param req
 * @param res
 * @param next
 * @param id
 */
exports.getTutorialByParam = (req, res, next, id) => {
    IAServiceProvider.getTutorialByIdOrFail(id)
        .then(tutorial => {
            req.tutorial = tutorial;
            next();
        })
        .catch(e => {
            next(e);
        });
};


// Retrieve list of tutorials for course
exports.getTutorials = (req, res, next) => {
    models.Tutorial.find({ 
        _id: { $in: req.course.tutorials }
    }).populate('teachingAssistants').exec((err, tutorials) => {
        if (err)
            return next(err);
        res.render('admin/pages/course-tutorials', {
            bodyClass: 'tutorials-page',
            title: 'Tutorials',
            course: req.course,
            tutorials: tutorials
        });
    });
};
// Add multiple tutorials for course
exports.addTutorials = (req, res, next) => {
    let start = Math.abs(_.toInteger(req.body.start)),
        end = Math.abs(_.toInteger(req.body.end)),
        range = _.range(start, end + 1);
    async.waterfall([
        function (done) {
            // find old numbers
            models.Tutorial.distinct('number', { _id: { $in: req.course.tutorials }}, done);
        },
        function (numbers, done) {
            // filter and create new numbers
            _.pullAll(range, numbers.map(Number));
            range = _.map(range, number => { return { number: number }});
            models.Tutorial.create(range, done);
        },
        function (tutorials, done) {
            req.course.update({ $push: { tutorials: { $each: tutorials }}}, done);
        }
    ], err => {
        if (err)
            return next(err);
        req.flash('success', 'List of tutorials has been updated.');
        res.redirect(`/admin/courses/${req.course._id}/tutorials`);
    });
};
// Retrieve specific tutorial for tutorial
exports.getTutorial = (req, res, next) => {
    res.render('admin/pages/course-tutorial', {
        bodyClass: 'tutorial-page',
        title: 'Edit tutorial',
        course: req.course, 
        tutorial: req.tutorial 
    });
};
// Update specific tutorial for course
exports.editTutorial = (req, res, next) => {
    req.tutorial.set(req.body).save(err => {
        if (err)
            return next(err);
        req.flash('success', 'Tutorial <b>%s</b> has been updated.', req.tutorial.number);
        res.redirect('back');
    });
};
// Delete specific tutorial for course
exports.deleteTutorial = (req, res, next) => {
    req.tutorial.remove(err => {
        if (err)
            return next(err);
        req.flash('success', 'Tutorial <b>%s</b> has been deleted.', req.tutorial.number);
        res.redirect('back');
    });
};