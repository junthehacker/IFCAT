const _ = require('lodash'),
    async = require('async'),
    models = require('../../Models');
const IAServiceProvider = require('../../providers/IAServiceProvider');
//
exports.getUserByParam = (req, res, next, id) => {
    models.User.findById(id, (err, user) => {
        if (err)
            return next(err);
        if (!user)
            return next(new Error('No user is found.'));
        req.us3r = user; // careful: req.user is used by passport
        next();
    });
};
// Retrieve login form
exports.getLogin = (req, res, next) => {
    if (req.user)
        return res.redirect('/admin/courses');
    res.render('admin/pages/login', {
        bodyClass: 'login-page',
        title: 'Login'
    });
};

// Logout user
exports.logout = (req, res) => {
    req.logout();
    res.redirect(IAServiceProvider.getLogoutUrl());
};

// Retrieve list of users
exports.getUsers = (req, res, next) => {
    let page = parseInt(req.query.page, 10) || 1,
        perPage = parseInt(req.query.perPage, 10) || 10,
        sort = req.query.sort || 'name.first name.last';
    models.User.findAndCount({}, {
        select: 'local.email student oauth.id name roles',
        page: page,
        perPage: perPage,
        sort: sort
    }, (err, users, count, pages) => {
        if (err)
            return next(err);
        res.render('admin/pages/users', {
            bodyClass: 'users-page',
            title: 'Users',
            users: users,
            pagination: {
                count: `${count} user${count !== 1 ? 's' : ''}`,
                page: page,
                pages: pages,
                perPage: perPage
            }
        });
    });
};
// Retrieve user form
exports.getUser = (req, res, next) => {
    let user = req.us3r || new models.User();
    res.render('admin/pages/user', {
        title: user.isNew ? 'Add New User' : 'Edit User',
        us3r: user
    });
};
// Add new user
exports.addUser = (req, res, next) => {
    let user = new models.User(req.body);
    user.save(err => {
        if (err)
            return next(err);
        req.flash('success', 'User <b>%s</b> has been created.', user.name.full);
        res.redirect('/admin/users');
    });
};
// Update specific user
exports.editUser = (req, res, next) => {
    req.us3r.set(req.body).save(err => {
        if (err)
            return next(err);
        req.flash('success', 'User <b>%s</b> has been updated.', req.us3r.name.full);
        res.redirect('back');
    });
};
// Delete specific user
exports.deleteUser = (req, res, next) => {
    req.us3r.remove(err => {
        if (err)
            return next(err);
        req.flash('success', 'User <b>%s</b> has been deleted.', req.us3r.name.full);
        res.redirect('back');
    });
};
// Reset administrator
exports.install = (req, res, next) => {
    async.waterfall([
        function (done) {
            models.User.findOne({ 'local.email': 'admin' }, done);
        },
        function (user, done) {
            // create admin if they don't exist
            if (!user)
                user = new models.User();
            // update admin
            user.set({
                name: { first: 'Admin' },
                local: { email: 'admin', password: '@dm!n' },
                roles: ['admin']
            }).save(done);
        }
    ], err => {
        if (err)
            return next(err);
        res.send('Sweet Christmas.');
    });
};
