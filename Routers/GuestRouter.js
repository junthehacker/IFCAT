/*------------------------------------
Routes for guests and authentication callbacks

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const passport          = require('passport');
const getAbsUrl         = require('../utils/getAbsUrl');
const IAServiceProvider = require('../providers/IAServiceProvider');

let router = require('express').Router();

// non-authenticated routes
router.get('/quiz', (req, res) => {
    res.render('student/start-quiz.ejs');
});

router.get('/login', passport.authenticate('ia-auth', {
    failureRedirect: IAServiceProvider.getLoginUrl()
}), (req, res) => {
    // TODO: Redirect to a dashboard
    res.redirect(getAbsUrl('/'));
});

module.exports = router;
