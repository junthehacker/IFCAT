'use strict'

module.exports = function(io) {
    function emitToUsers(users, eventName, data) {
        for (let i = 0; i < users.length; i++) {
            let userId = users[i];
            io.to('user:' + userId).emit(eventName,data);
        }
    }
    
    function emitToTutorialQuiz(tutorialQuizId, eventName, data) {
        io.to('tutorialQuiz:' + tutorialQuizId).emit(eventName, data);
    }
    
    function emitToGroup (groupId, eventName, data) {
        io.to('group:' + groupId).emit(eventName, data);
    }
    
    return {
        emitToUsers : emitToUsers,
        emitToTutorialQuiz: emitToTutorialQuiz,
        emitToGroup : emitToGroup,
    }
}