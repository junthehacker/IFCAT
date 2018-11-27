const lodash           = require('./utils/lodash.mixin'),
      bodyParser       = require('body-parser'),
      config           = require('./utils/config'),
      cookieParser     = require('cookie-parser'),
      express          = require('express'),
      flash            = require('connect-flash'),
      methodOverride   = require('method-override'),
      moment           = require('moment'),
      mongoose         = require('mongoose'),
      morgan           = require('morgan'),
      session          = require('express-session'),
      MongoStore       = require('connect-mongo')(session),
      passportSocketIo = require('passport.socketio'),
      logger           = require('./utils/logger');

const IS_EDGE = true; // Is edge release?

const app  = express(),
      http = require('http').Server(app),
      io   = require('socket.io')(http, {path: config.baseDir + '/socket.io'});

// local variables
app.locals._          = lodash;
app.locals.DATEFORMAT = 'YYYY-MM-DD';
app.locals.io         = io;
app.locals.moment     = moment;
app.locals.config     = config;
app.locals.IS_EDGE    = IS_EDGE;
app.locals.getAbsUrl  = require('./utils/getAbsUrl');

// application settings
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// other middlewares
app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));
app.use(cookieParser());

// database
mongoose.Promise = global.Promise;
mongoose.connect(config.database.url, {useMongoClient: true});
//mongoose.set('debug', true);

// sessions
const sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

app.use(session({
    name: config.name,
    secret: config.session.secret,
    saveUninitialized: false,
    store: sessionStore,
    resave: false
}));

app.use(flash());

// authentication
const passport = require('./utils/passport');

app.use(passport.initialize());
app.use(passport.session());

// local variables
app.use((req, res, next) => {
    res.locals.flash = req.flash();
    res.locals.path  = req.path;
    res.locals.query = req.query;
    res.locals.user  = req.user;
    next();
});

// routes
const mainRouter = new express.Router();

mainRouter.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
mainRouter.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
mainRouter.use('/bootbox', express.static(__dirname + '/node_modules/bootbox'));
mainRouter.use('/bootstrap-switch', express.static(__dirname + '/node_modules/bootstrap-switch/dist'));
mainRouter.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome'));
mainRouter.use('/lodash', express.static(__dirname + '/node_modules/lodash'));
mainRouter.use('/socketioclient', express.static(__dirname + '/node_modules/socket.io-client/dist'));
mainRouter.use('/sweetalert', express.static(__dirname + '/node_modules/sweetalert/dist'));
mainRouter.use('/', express.static(__dirname + '/public'));

const routes = require('./Routers');
mainRouter.use('/', routes.GuestRouter);
mainRouter.use('/student', routes.StudentRouter);
mainRouter.use('/admin', routes.AdminRouter);

// error handling
mainRouter.use((err, req, res, next) => {
    if (app.get('env') !== 'development') {
        delete err.stack;
    }
    if (req.xhr) {
        return res.status(err.status || 500).json(err);
    }
    res.status(err.status || 500).render('error', {
        req,
        error: err
    });
});

// Mount the app with baseDir
app.use(config.baseDir, mainRouter);

// sockets
io.use(passportSocketIo.authorize({
    key: config.name,
    secret: config.session.secret,
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser
}));

// socket io handler for quizzes
io.on('connection', require('./socket.io/quizHandlers.js')(io));


// server
http.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});