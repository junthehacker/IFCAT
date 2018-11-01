const models = require('../models'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Auth0Strategy = require('passport-auth0'),
    auth0Config = require('./config').auth0;
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
        IAServiceProvider.getUserByToken(req.query.token)
            .then(() => done(null, req.query.token))
            .catch(e => done(e, false));
    } else {
        done(null, false);
    }
}));


// Configure Passport to use Auth0
passport.use(new Auth0Strategy({
    domain:       auth0Config.domain,
    clientID:     auth0Config.clientId,
    clientSecret: auth0Config.clientSecret,
    callbackURL:  auth0Config.callbackUrl || 'http://localhost:3000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    console.log('profile')
    console.log(profile._json)

    let UTORid = profile._json.user_metadata.UTORid ? profile._json.user_metadata.UTORid.trim().toLowerCase() : '';

    models.User.findOne({ 'UTORid': UTORid }, (err, user) => {
        if (err) 
            return done(err);
        if (user) 
            return done(null, user);
        user = new models.User();
        user.UTORid = UTORid;
        user.name.first = profile._json.user_metadata.first_name;
        user.name.last = profile._json.user_metadata.last_name;
        user.oauth.id = profile._json.clientID;
        user.roles = ['student'];
        user.save(done);
    });
}));

module.exports = passport;