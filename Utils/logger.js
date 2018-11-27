const config = require('./config'),
    fs = require('fs-extra'),
    moment = require('moment'),
    path = require('path'),
    winston = require('winston');

const dir = path.join(__dirname, '..', config.log.path);
// create the log directory if it does not exist
fs.mkdirsSync(dir);

const date = moment().format('YYYY-MM-DD');
const time = () => moment().format('h:mm:ss A');

winston.emitErrs = true;

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        }),
        new winston.transports.File({
            level: 'error',
            filename: `${dir}/${date}.log`,
            timestamp: time
        })
    ],
    exitOnError: false
});

module.exports = logger;