const config = require('../../utils/config');
// Retrieve login form
exports.getLogin = (req, res) => {
    if (req.user)
        return res.redirect('/student/courses');
    res.render('login', {
        bodyClass: 'login',
        title: 'Login',
        auth0lock: config.auth0
    });
};
// Logout user
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};