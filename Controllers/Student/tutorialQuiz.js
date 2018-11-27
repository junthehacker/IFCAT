const models = require('../../Models');

exports.startQuiz = (req, res) => {
    if (req.tutorialQuiz.archived){
        req.tutorialQuiz.quiz.withQuestions().execPopulate()
        .then((quiz)=>{
            return models.Group.findOne({ _id : { $in : req.tutorialQuiz.groups }, members :  req.user._id })
            .exec()
            .then(function(group){
                models.Response.find({ group : group._id }).exec()
                .then(function(responses){
                    var responsesMap = {};
                    responses.forEach(res => {responsesMap[res.question] = res}); // easier to do rendering logic with a question to response map
                    res.render('student/archived-quiz.ejs',{
                    quiz : quiz,
                    responses: responsesMap,
                    group : group.name
                    });
                })
            })
        })
        
    }
    else{
        res.render('student/start-quiz.ejs', {
            course: req.course,
            tutorialQuiz: req.tutorialQuiz,
            quiz: req.tutorialQuiz.quiz,
            initSocket: true
        });
    }
};

// WebSocket event handler generators - these are curried functions that take
// the input (socket) and output (emitter) context, and return the actual handler
exports.nominateDriver = (socket, emitters) => (function(data) {
    models.Group.findById(data.groupId)
    .exec()
    .then(function(group) {
        models.Group.findByIdAndUpdate(data.groupId, { driver : socket.request.user.getId() })
        .exec()
        .then(function() {
            emitters.emitToGroup(data.groupId, 'resetDriver', { groupId : data.groupId });
            socket.emit('ASSIGNED_AS_DRIVER', { groupId : data.groupId } );
            emitters.emitToGroup(data.groupId, 'startQuiz', {});
        });
    });
});

exports.joinGroup = (socket, emitters) => (function(data) {
    models.TutorialQuiz.findById(data.quizId)
    .exec()
    .then(function(tutQuiz) {
        if (!tutQuiz.max.membersPerGroup) return;

        models.Group.findById(data.newGroup)
        .exec()
        .then(function(gr) {
            if (gr.members.length >= tutQuiz.max.membersPerGroup){
                socket.emit('info', {message : 'This group already has the maximum number of members for this activity'});
                return false;
            }
            else return true;
        })
        .then(function(proceed) {
            if (!proceed) return;
            models.Group.update({ _id : { $in :  tutQuiz.groups } },
            { $pull : { members : socket.request.user._id } },
            { multi : true} ) // ensure user isn't in 2 groups
            .exec()
            .then(function(){
                return models.Group.findByIdAndUpdate(data.newGroup, 
                { $push : { members : socket.request.user._id } }, 
                { new : true })
                .exec()
            })
            .then(function(group){
                models.TutorialQuiz.findById(data.quizId).populate('groups').exec()
                .then(function(populatedTQ){
                    socket.join('group:' + data.newGroup);
                    socket.emit('setGroup', data.newGroup)
                    socket.emit('info', {message : 'Joined Group ' + group.name });
                    emitters.emitToTutorialQuiz(tutQuiz._id, 'groupsUpdated', { groups : populatedTQ.groups })
                    socket.emit('quizData', 
                    { userId : socket.request.user._id,
                        quiz : populatedTQ,
                        groupName : group.name,
                        groupId: group._id 
                    });
                });
            });
        });
    });
});

exports.createGroup = (socket, emitters) => (function(data){
    models.TutorialQuiz.findById(data.quizId)
    .exec()
    .then(function(tutQuiz){
        
        var group = new models.Group();
        group.name = (tutQuiz.groups.length + 1).toString();
        group.members = [ socket.request.user._id ];

        group.save(function(err, group) {
            if (err) console.log (err);
            models.Group.update({ _id : { $in :  tutQuiz.groups } }, 
            { $pull : { members : socket.request.user._id } }, 
            { multi : true },
            function(err, doc) {
                return models.TutorialQuiz.findByIdAndUpdate(  data.quizId, 
                { $push : { groups : group._id } })
                .exec()
                .then(function(tq){
                    return models.TutorialQuiz.findById(tq._id)
                    .populate('groups')
                    .exec();
                })
            })
            .then(function(populatedTQ) {
                socket.join('group:'+ group._id);

                socket.emit('info', 
                {message : 'Created and joined Group ' + group.name });
                
                emitters.emitToTutorialQuiz(tutQuiz._id, 'groupsUpdated', 
                { groups : populatedTQ.groups })

                socket.emit('quizData', 
                { userId : socket.request.user._id,
                    quiz : populatedTQ,
                    groupName : group.name,
                    groupId: group._id
                });
            });
        });
    });
});


exports.codeTracingAttempt = (socket, emitters) => (function(data) {
    models.Question.findById(data.questionId)
    .exec()
    .then(function(question) {
        models.Response.findOne({ group : data.groupId, question: data.questionId })
        .exec()
        .then(function(response) {
            var lineByLineSummary = buildCodeTracingAnswerSummary(question, response, data.answer);
            var numLinesCorrect = lineByLineSummary.reduce((acc, curr) => (acc + (curr.correct ? 1 : 0)), 0);
            var questionComplete = (numLinesCorrect == question.answers.length || question.immediateFeedbackDisabled);
            var revealedLines = question.answers.slice(0, numLinesCorrect);

            if (!response) {
                response =  new models.Response();
                response.group = data.groupId;
                response.question = data.questionId;
            }
            response.lineByLineSummary = lineByLineSummary;
            response.correct = questionComplete;
            response.codeTracingAnswers = question.immediateFeedbackDisabled ? question.answers : revealedLines;
            response.points = questionComplete ? calculateCTQPoints(lineByLineSummary, question) : calculateMaxPoints(question);
            return response.save();                      

        })
        .then(function(response) {
            emitters.emitToGroup(data.groupId, 'SYNC_RESPONSE', {
                response: response,
                questionId: data.questionId,
                question : question,
                groupId : data.groupId
            })
        })
        .catch(function(err){
            console.log(err);
        })
    })
});

exports.quizComplete = (socket, emitters) => (function(data) {
    models.Group.findById(data.groupId).populate('members')
    .exec()
    .then(function(group) {
        models.Response.find({ group : data.groupId }).exec()
        .then(function(groups) {
            return groups.reduce((pre, curr) => pre.points + curr.points)
        })
        .then(function(score) {
            emitters.emitToGroup(data.groupId, 'FINISH_QUIZ', {
                members : group.members,
                score : score,
                groupId : data.groupId
            })
        })
    });
});

exports.awardPoint = (socket, emitters) => (function(data) {
    models.Group.findByIdAndUpdate(data.groupId,
    { $push : { teachingPoints : data.receiverId } },{new:true}, function(err, group){
        if (err) throw err;
        socket.emit('info', {message : 'Teaching points successfully awarded'});
    })
});

// Utility functions
function buildCodeTracingAnswerSummary(question, existingResponseObject, answer) {
    existingResponseObject = existingResponseObject || { lineByLineSummary : [] };
    var lineByLineSummary = [];
    for (var i = 0; i < answer.length; i++) {
        var existingAnswer = existingResponseObject.lineByLineSummary[i];
        if (answer[i].trim() != question.answers[i].trim()) {
            lineByLineSummary.push({
                attempts :  (existingAnswer) ? existingAnswer.attempts + 1 : 1,
                correct : false,
                value : answer[i]
            }); 
            if (lineByLineSummary[i].attempts == question.maxAttemptsPerLine) {
                lineByLineSummary[i].correct = true;
                lineByLineSummary[i].value = question.answers[i].trim();
                lineByLineSummary[i].answerProvided = true;
            }   
        } else {
            lineByLineSummary.push({
                attempts :  existingAnswer ? existingAnswer.attempts + (existingAnswer.correct ? 0 : 1) : 1,
                correct : true,
                value : answer[i],
                answerProvided : false
            });
        }
    }
    return lineByLineSummary;
}

function calculateCTQPoints(lineByLineSummary, question) {
    var points = 0;
    var totalAttempts = 0;
    lineByLineSummary.forEach(function(line){
        var lineScoreLoss = question.immediateFeedbackDisabled ? 0 : (line.attempts - 1); 
        if (line.correct) {
            points += Math.max(0, question.maxPointsPerLine - lineScoreLoss);

            totalAttempts += line.attempts;
        }
    });
    if (totalAttempts == lineByLineSummary.length)
        points += question.firstTryBonus;
    return points;
}

function calculateMaxPoints(question) {
    return question.points;
}