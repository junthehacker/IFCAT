const controllers = require('../controllers/student'),
    passport = require('passport');
const IAServiceProvider = require('../providers/IAServiceProvider');

let router = require('express').Router();

// non-authenticated routes
router.get('/quiz', (req, res)=>
{
    res.render('student/start-quiz.ejs');
})
router.get('/login', passport.authenticate('ia-auth', {
    successRedirect: '/student/courses',
    failureRedirect: IAServiceProvider.getLoginUrl()
}));

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/student/courses',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/login/callback', passport.authenticate('auth0', { 
    failureRedirect: '/login' 
}), function(req, res) {
    res.redirect(req.session.returnTo || '/student/courses');
});

router.get('/', (req, res) => {
    if (!req.user) 
        return res.redirect('/login');
    if (req.user.hasAnyRole(['admin', 'instructor', 'teachingAssistant']))
        return res.redirect('/admin/courses');
    res.redirect('/student/courses');
})

module.exports = router;