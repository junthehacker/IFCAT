const _ = require('../../utils/lodash.mixin'),
    async = require('async'),
    models = require('../../Models');
// Retrieve list of teaching assistants for course
exports.getTeachingAssistantsByCourse = (req, res, next) => {
    req.course.withTutorials().withTeachingAssistants().execPopulate().then(() => {
        res.render('admin/pages/course-teaching-assistants', {
            bodyClass: 'teaching-assistants-page',
            title: 'Teaching Assistants',
            course: req.course
        });
    }, next);
};
// Retrieve list of teaching assistants matching search query
exports.getTeachingAssistantsBySearchQuery = (req, res, next) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 5,
        re = new RegExp(`(${req.query.q.replace(/\s/g, '|').trim()})`, 'i');
    models.User.findAndCount({
        $and: [
            { $or: [{ 'name.first': re },{ 'name.last': re },{ 'local.email': re }] },
            { roles: { $in: ['teachingAssistant'] }}
        ]
    }, {
        select: 'name local.email',
        page: page,
        perPage: perPage,
        sort: 'name.first name.last'
    }, (err, users, count, pages) => {
        if (err)
            return next(err);
        res.render('admin/partials/course-teaching-assistants-search-results', { 
            course: req.course, 
            teachingAssistants: users,
            pagination: {
                count: `${count} user${count !== 1 ? 's' : ''} matched`,
                page: page,
                pages: pages,
                params: {
                    q: req.query.q
                }
            }
        });
    });
};
// Add teaching assistants into course
exports.addTeachingAssistants = (req, res, next) => {
    let users = req.body.users || [];
    req.course.update({ $addToSet: { teachingAssistants: { $each: users }}}, err => {
        if (err)
            return next(err);
        req.flash('success', 'List of teaching assistants has been updated.');
        res.sendStatus(200);
    });
};
// Update teaching assistants in tutorials
exports.editTeachingAssistants = (req, res, next) => {
    let dict = _.transpose(req.body['+users'] || {});
    req.course.withTutorials().execPopulate().then(() => {
        async.eachSeries(req.course.tutorials, (tutorial, done) => {
            let users = tutorial.teachingAssistants.map(String);
                users = _.difference(users, req.body.users);
                users = _.union(users, dict[tutorial._id]);
            tutorial.update({ teachingAssistants: users }, done);
        }, err => {
            if (err)
                return next(err);
            req.flash('success', 'The list of tutorials has been updated.');
            res.redirect('back');
        });
    }, next);
};
// Delete teaching assistants from course and associated tutorials
exports.deleteTeachingAssistants = (req, res, next) => {
    let users = req.body['-users'] || [];
    async.series([
        done => {
            req.course.update({ $pull: { teachingAssistants: { $in: users }}}, done);
        },
        done => {
            models.Tutorial.update({ 
                _id: { $in: req.course.tutorials }
            }, { 
                $pull: { teachingAssistants: { $in: users }}
            }, {
                multi: true
            }, done);
        }
    ], err => {
        if (err)
            return next(err);
        req.flash('success', 'List of teaching assistants has been updated.');
        res.redirect('back');
    });
};