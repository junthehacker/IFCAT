const lodash           = require('./Utils/lodash.mixin');
const bodyParser       = require('body-parser');
const config           = require('./Utils/config');
const cookieParser     = require('cookie-parser');
const express          = require('express');
const flash            = require('connect-flash');
const methodOverride   = require('method-override');
const moment           = require('moment');
const mongoose         = require('mongoose');
const morgan           = require('morgan');
const session          = require('express-session');
const MongoStore       = require('connect-mongo')(session);
const passportSocketIo = require('passport.socketio');
const Sentry           = require('@sentry/node');
const getZipkinTracer = require('./Tracers/ZipkinTracer');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const dotenv           = require('dotenv');

dotenv.load();

const IS_EDGE = true; // Is edge release?

if (process.env.SERVER_NAME !== 'local') {
    console.log("Sentry initialized...");
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SERVER_NAME
    });
}


const app  = express(),
      http = require('http').Server(app),
      io   = require('socket.io')(http, {path: config.baseDir + '/socket.io'});

const connectionPool = require('./SocketIO/ConnectionPool').getInstance();
connectionPool.setSocketIOInstance(io);

if (process.env.ZIPKIN_ENDPOINT) {
    let tracer = getZipkinTracer();
    app.use(zipkinMiddleware({ tracer, serviceName: process.env.ZIPKIN_SERVICE_NAME }));
    console.log('Zipkin tracing initialized...');
}


// local variables
app.locals._          = lodash;
app.locals.DATEFORMAT = 'YYYY-MM-DD';
app.locals.io         = io;
app.locals.moment     = moment;
app.locals.config     = config;
app.locals.IS_EDGE    = IS_EDGE;
app.locals.getAbsUrl  = require('./Utils/getAbsUrl');

// application settings
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/Views');

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
const passport = require('./Utils/passport');

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

if (process.env.MAINTENANCE === 'true') {
    mainRouter.use('*', (req, res) => res.render('Maintenance'));
}

mainRouter.use('/', express.static(__dirname + '/public'));

const routes = require('./Routers');
mainRouter.use('/', routes.GuestRouter);
mainRouter.use('/student', routes.StudentRouter);
mainRouter.use('/admin', routes.AdminRouter);


// error handling
mainRouter.use(Sentry.Handlers.errorHandler());
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
io.on('connection', require('./SocketIO/EventHandlers')(io));


// server
http.listen(app.get('port'), () => {
    console.log('IFCAT listening on port %d in %s mode', app.get('port'), app.get('env'));
});