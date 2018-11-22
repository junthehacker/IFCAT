const passport = require('passport');
const IAServiceProvider = require('../providers/IAServiceProvider');
const CustomStrategy = require('passport-custom').Strategy;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    IAServiceProvider.getUserByToken(id)
        .then(user => done(null, user))
        .catch(e => done(e, false));
});

passport.use('ia-auth', new CustomStrategy((req, done) => {
    if(req.query.token) {
        try {
            IAServiceProvider.getUserByToken(req.query.token);
            done(null, req.query.token)
        } catch (e) {
            done(null, false)
        }
    } else {
        done(null, false);
    }
}));

module.exports = passport;