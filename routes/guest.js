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
    successRedirect: getAbsUrl('/dashboard'),
    failureRedirect: IAServiceProvider.getLoginUrl()
}));

module.exports = router;