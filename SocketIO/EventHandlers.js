var models      = require('../Models'),
    _           = require('lodash'),
    controllers = require('../Controllers/Student');

const QuestionController = require('../Controllers/Student/QuestionController');
const Connection         = require('./Connection');

let questionController = QuestionController.getInstance();

const guestSocketController = require('../Controllers/Guest/GuestSocketController').getInstance();

const connectionPool = require('./ConnectionPool').getInstance();

module.exports = io => (socket => {
    let connection = new Connection.Builder(socket)
        .setUser(socket.request.user)
        .build();
    connectionPool.addConnection(connection);

    if (connection.getUser()) {
        console.log('Socket is authenticated as user', socket.request.user.getId());
        require('./StudentEventHandlers')(io, connection);
        // If user is admin, mount all admin event handlers
        if (connection.getUser().isAdmin()) {
            require('./AdminEventHandlers')(io, connection);
        }
        connection.onEvent("PING").invoke(guestSocketController.ping);

    } else {
        connection.disconnectAndRemoveFromPool();
    }

    const emitters     = require('./emitters')(io);
    const fetchHandler = (handlerName) => (controllers.TutorialQuiz[handlerName])(socket, emitters);

    socket.on('AWARD_POINT', fetchHandler('awardPoint'));
    socket.on('QUIZ_COMPLETE', fetchHandler('quizComplete'));
    socket.on('JOIN_GROUP', fetchHandler('joinGroup'));
    socket.on('CREATE_GROUP', fetchHandler('createGroup'));
    socket.on('CODE_TRACING_ANSWER_ATTEMPT', fetchHandler('codeTracingAttempt'));

    socket.on('UPVOTE_QUESTION', function (data) {
        questionController.upVoteQuestion(data.questionId, socket.request.user._id);
    });

    socket.on('DOWNVOTE_QUESTION', function (data) {
        questionController.downVoteQuestion(data.questionId, socket.request.user._id);
    })


});
