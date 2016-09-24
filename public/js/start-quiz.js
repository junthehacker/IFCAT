$('.quizBtn').attr('disabled', true); // Disable quiz buttons (enable if assigned as driver)
//
var url = window.location.href;
var quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/start'));
var socket = io();
var quizData, groupId,isDriver,  responses = {}, currentQuestionId, score = 0;
    
socket.emit('requestQuiz', quizId);

socket.on('quizData', function(tutorialQuiz){
  console.log(tutorialQuiz)
  quizData = tutorialQuiz.quiz;
  groupId = tutorialQuiz.groupId;
  
  $('#groupName').html(tutorialQuiz.groupName);
  
  if (quizData.active){
    $('#driverSelect').show();  
  }
  
})

// When a question is answered by leader, a 'groupAttempt' event is emitted
socket.on('groupAttempt', function(data){
  console.log(data)
  responses[data.response.question] = data.response;
  if (data.response.group != groupId) return;
  if (data.response.correct) {
    swal("Good job!", "Question "+ data.questionNumber +" was answered correctly!.\
     Received " + data.response.points + " points ", "success");
     score += parseInt(data.response.points);
     $('#'+(data.questionNumber-1)).addClass('btn-success');
     renderStars(data.questionNumber-1, data.response.attempts - 1, 6 - data.response.attempts);
      $('#currentScore').html(score);
  }
  else {
    swal("Yikes!", "Question "+ data.questionNumber +" was answered incorrectly!", "error");
    renderStars(data.questionNumber-1, data.response.attempts, 5 - data.response.attempts);
  }
  
})


$(document).on('click', '#selectDriverBtn', function(){
  emit('nominateSelfAsDriver');
})
$(document).on('click', '#deferDriverBtn', function(){
  if (quizData.active){
    renderQuestion(quizData.quiz, 0);
  }
})

function renderStars(question, empty, full){
    var fullStars = "<i class = 'fa fa-star' />&nbsp;".repeat(full),
      emptyStars = "<i class = 'fa fa-star-o' />&nbsp;".repeat(empty);
    var html = emptyStars + fullStars;
    $('#points-'+question).html(html);
}


socket.on('quizActivated', function(tutQuiz){ // active = start questions
  quizData.active = tutQuiz.active;
  if (tutQuiz.active){
    $('#postQuiz').hide();
    alert('The quiz is now active. Select a driver and proceed!')
    $('#driverSelect').show();
  }
  else{
    quizCompleted();
  }
})

socket.on('startQuiz', function(data){
    if (quizData.active)
        renderQuestion(quizData.quiz, 0);
})

socket.on('updateScores', function(data){
  data.responses.forEach(function(response, i){
    responses[response.question] = response;
  })
  if (data.responses.length){
  score = data.responses.reduce(function(prev, curr){
    return prev.points + curr.points;
  })
  }
})

socket.on('assignedAsDriver', function(){
  /*
  Emitted to the user assigned as a driver.
  Todo: When previous driver disconnects, assign next driver automatically
  */
  // enable choices and submit buttons (disabled by default)
  isDriver = true;
  $('.quizBtn').attr('disabled', false);
})

socket.on('renderQuestion', function(data){
  console.log(quizData)
  renderQuestion(quizData.quiz, data.questionNumber);
  
})


function emit(eventName, data) {
  /* Acts as wrapper for emitting events, attaching
   useful "header" properties */
   if (!data) {
     var data = {}
   }
  data.groupId = groupId;
  data.quizId = quizData._id;
  socket.emit(eventName, data);
}
 
var score = 0,
    currentQuizId = null;

// console.log(sessionStorage.getItem('currentQuiz'));
  
function renderQuestion(quiz, n){
  $('.quizBtn').attr('disabled', !isDriver);
  $('#driverSelect').hide();
  $('#assignGroup').hide();
  $('#activeQuiz').show();
  $('#currentScore').html(score || 0);
  

  
  
  if (n >= quiz.questions.length){
    quizCompleted();
    return;
  }

  
  $('#submitQuestion').off('click');
    
  currentQuestionId = quiz.questions[n]._id;
  
  
  // renders nth question (0 indexed) in quiz
  $("#text").html(quiz.questions[n].question);
  $("#choices").html("");
  
  $('#attachment').html('');
  if (quiz.questions[n].files){
    var file = quiz.questions[n].files[0];
    if (file && file.type.includes('image')){
      var courseId = url.slice(url.indexOf('/courses/') + 9, url.indexOf('/quizzes'));
      var fileUrl = '/upl/' + courseId + '/' + file.name;
      $('#attachment').html('<img class="attachedImg" src="' + fileUrl + '"/> <br/><hr/>')

    }
  }
  
  // shuffle choices if need be
  // var choices = quiz.randomizeChoices ? _.shuffle(quiz.questions[n].choices) : quiz.questions[n].choices
  var choices = quiz.questions[n].choices

  // render choices
  $.each(choices, function(i, choice){
    $("#choices").append("<div class = 'quizBtn choice'>"+ choice +"</div>")
  })
  
  $(".choice").click(function(e){
    $('.currentlyChosen').removeClass('currentlyChosen');
    $(e.target).addClass('currentlyChosen');
   })
  
    $("#submitQuestion").click(function(e){
      
      var currentlyChosen = $('.currentlyChosen');
      
      if (currentlyChosen.length === 0){
        return;
      }

      var chosenAnswer = currentlyChosen[0].textContent;
      
      console.log(chosenAnswer);
      
      
      $('.currentlyChosen').removeClass('currentlyChosen');
      
      emit('attemptAnswer', {
        questionId : quiz.questions[n]._id,
        answer : chosenAnswer,
        questionNumber : parseInt(n)+1
      })      
      
    })
    
  // questions list
  
  if($('#questionSelect').html().length == 0){ // at start or after refresh
    quiz.questions.forEach(function(question, i){
      var className = (i == n) ? 'btn-warning' : '';
      $('#questionSelect').append('<button id = "'+ i + '" class = "goToQuestion col-md-11 col-xs-2 col-sm-2 btn '+ className +'">'
      + (i+1)
      + '<br/><div class = "questionPoints" id = "points-'+ i +'">'
      +'</div>'
      + '</button>');
      $(document).on('click', '.goToQuestion', function(e){
        renderQuestion(quiz, e.target.id )
      })
      if (question._id in responses){
        if(responses[question._id].correct){
         renderStars(i, responses[question._id].attempts - 1, 6 - responses[question._id].attempts);
         $('#'+i).addClass('btn-success');
        }
        else{
         renderStars(i, responses[question._id].attempts, 5 - responses[question._id].attempts);
        }
      }
      else{
        renderStars(i, 0, 5);
      }
    })
  } else {
    $('.goToQuestion').removeClass('btn-warning');
    $('#'+n).addClass('btn-warning');

  }
  
  // Check for previously answered questions
  if (quiz.questions[n]._id in responses && responses[quiz.questions[n]._id].correct){
    $('.quizBtn').attr('disabled', true);
    $('#choices').append('<br/><div class = "alert alert-success"> You have correctly answered this question already.</div>')
  }
  
}
 
 function quizCompleted (){
   if (quizData.active){
    $('#activeQuiz').html('Your responses have been submitted.\
    You can change answers (penalties may apply) until your TA inactivates this quiz.');
   }
   else{
     $('#postQuiz').show();
     socket.emit('quizComplete', { groupId: groupId, quizId: quizData._id })
   }
 }
 
 // Socket.io handlers
 
 socket.on('goToQuestion', function(data){
     if (data.quizId === currentQuizId) {
         renderQuestion(quizData.quiz, data.questionNumber)
     }
 })
    
socket.on('postQuiz', function(data){
  $('#activeQuiz').hide();
  $("#postQuiz").show();
  $('#score').html(data.score);
  var html = "";
  data.members.forEach(function(member){
    html+="<br/><button class='teachingPt btn btn-default col-md-6 col-xs-8 col-sm-8 col-md-offset-3 col-sm-offset-2 col-xs-offset-2 ' id='"+ member._id +"'>" + (member.name.first+' '
    +member.name.last) +"</button><br/>"
  })
  $("#teachingPointsPicker").html(html);
  $(document).on('click','.teachingPt', function(e){
    socket.emit('awardPoint', { userId: e.target.id });
    $('#postQuiz').html('Quiz complete');
  })
})