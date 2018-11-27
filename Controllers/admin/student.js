const _ = require('lodash'),
    async = require('async'),
    csv = require('csv'),
    models = require('../../models');
//
exports.getStudentByParam = (req, res, next, id) => {
    models.User.findOne({ _id: id, roles: { $in: ['student'] }}, (err, student) => {
        if (err) return next(err);
        if (!student) return next(new Error('No student is found.'));
        req.student = student;
        next();
    });
};
// Retrieve list of students for course
exports.getStudentsByCourse = (req, res, next) => {
    req.course.withTutorials().withStudents().execPopulate().then(() => {
        res.render('admin/pages/course-students', {
            bodyClass: 'students-page',
            title: 'Students',
            course: req.course,
            students: req.course.students
        });
    });
};
// Retrieve list of students matching search query
exports.getStudentsBySearchQuery = (req, res, next) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 20,
        re = new RegExp(`(${req.query.q.replace(/\s/g, '|').trim()})`, 'i');
    models.User.findAndCount({
        $and: [
            { $or: [{ 'name.first': re },{ 'name.last': re },{ 'UTORid': re },{ 'studentNumber': re }] },
            { roles: { $in: ['student'] }}
        ]
    }, {
        select: 'name UTORid studentNumber',
        page: page,
        perPage: perPage,
        sort: 'name.first name.last'
    }, (err, users, count, pages) => {
        if (err)
            return next(err);
        res.render('admin/partials/course-students-search-results', {
            course: req.course,
            students: users,
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
// Retrieve list of students for tutorial
exports.getStudentsByTutorial = (req, res, next) => {
    req.tutorial.withStudents().execPopulate().then(() => {
        res.render('admin/pages/tutorial-students', {
            title: 'Students',
            course: req.course,
            tutorial: req.tutorial
        });
    }, next);
};
// Add student to course
exports.addStudents = (req, res, next) => {
    let users = req.body.users || [];
    req.course.update({ $addToSet: { students: { $each: users }}}, err => {
        if (err)
            return next(err);
        req.flash('success', 'The list of students has been updated.');
        res.sendStatus(200);
    });
};
// Update students in tutorials
exports.editStudents = (req, res, next) => {
    let dict = _.transpose(req.body['+users'] || {});
    models.Tutorial.find({ _id: req.course.tutorials }, (err, tutorials) => {
        async.eachSeries(tutorials, (tutorial, done) => {
            let users = tutorial.students.map(String);
                users = _.difference(users, req.body.users);
                users = _.union(users, dict[tutorial._id]);
            tutorial.update({ students: users }, done);
        }, err => {
            if (err)
                return next(err);
            req.flash('success', 'The list of tutorials has been updated.');
            res.redirect('back');
        });
    });
};
// Delete students from course and associated tutorials
exports.deleteStudents = (req, res, next) => {
    let users = req.body['-users'] || [];
    async.series([
        done => {
            req.course.update({ $pull: { students: { $in: users }}}, done);
        },
        done => {
            models.Tutorial.update({
                _id: { $in: req.course.tutorials }
            }, {
                $pull: { students: { $in: users }}
            }, {
                multi: true
            }, done);
        }
    ], err => {
        if (err)
            return next(err);
        req.flash('success', 'The list of students has been updated.');
        res.redirect('back');
    });
};
// Import list of students
exports.importStudents = (req, res, next) => {
    async.series([
        done => csv.parse(req.file.buffer.toString(), { columns: true, delimiter: ',', skip_empty_lines: true }, done),
        done => models.Tutorial.find({ _id: { $in: req.course.tutorials }}, done)
    ], (err, results) => {
        if (err) {
            req.flash('error', 'An error occurred while trying to perform operation.');
            return res.redirect('back');
        }
        let [rows, tutorials] = results;
        // process records
        async.eachSeries(rows, (row, done) => {
            row.student = {};
            row.name = {};
            row.local = {};
            // normalize properties
            _.forOwn(row, (val, key) => {
                if (/^utorid/i.test(key))
                    row.UTORid = val;
                else if (/^student(.+)/i.test(key))
                    row.studentNumber = val;
                else if (/^first/i.test(key))
                    row.name.first = val;
                else if (/^last/i.test(key))
                    row.name.last = val;
                else if (/^e\-?mail/i.test(key))
                    row.local.email = val;
                else if (/^password/i.test(key))
                    row.local.password = val;
                else if (/^tutorial/i.test(key))
                    row.tutorial = val;
            });
            let student;
            // save
            async.series([
                done => {
                    models.User.findOne({ 'UTORid': row.UTORid }, (err, us3r) => {
                        if (err) return done(err);
                        student = us3r || new models.User();
                        student.set(row);
                        student.roles.addToSet('student');
                        student.save(done);
                    });
                },
                done => {
                    req.course.update({ $addToSet: { students: student._id }}, done);
                },
                done => {
                    if (row.tutorial) {
                        async.eachSeries(tutorials, (tutorial, done) => {
                            if (_.toInteger(tutorial.number) === _.toInteger(row.tutorial))
                                tutorial.update({ $addToSet: { students: student._id }}, done);
                            else
                                tutorial.update({ $pull: { students: student._id }}, done);
                        }, done);
                    } else
                        return done();
                }
            ], done);
        }, err => {
            if (err) return next(err);
            req.flash('success', 'The students have been imported.');
            res.redirect('back');
        });
    });
};