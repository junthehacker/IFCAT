/*------------------------------------
Routes for guests and authentication callbacks

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

// Dependencies
const passport = require('passport');
const getAbsUrl = require('../utils/getAbsUrl');

// Service providers
const IAServiceProvider = require('../providers/IAServiceProvider');

let router = require('express').Router();

// non-authenticated routes
router.get('/quiz', (req, res)=>
{
    res.render('student/start-quiz.ejs');
});

router.get('/login', passport.authenticate('ia-auth', {
    successRedirect: getAbsUrl('/student/courses'),
    failureRedirect: IAServiceProvider.getLoginUrl()
}));

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: getAbsUrl('/student/courses'),
    failureRedirect: getAbsUrl('/login'),
    failureFlash: true
}));

router.get('/login/callback', passport.authenticate('auth0', { 
    failureRedirect: getAbsUrl('/login')
}), function(req, res) {
    res.redirect(req.session.returnTo || getAbsUrl('/student/courses'));
});

router.get('/', (req, res) => {
    if (!req.user) {
        return res.redirect(getAbsUrl('/login'));
    }
    if (req.user.canAccessAdminPanel()) {
        return res.redirect(getAbsUrl('/admin/courses'));
    }
    res.redirect(getAbsUrl('/student/courses'));
});

module.exports = router;