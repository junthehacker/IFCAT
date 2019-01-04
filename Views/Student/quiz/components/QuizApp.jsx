import CodeOutputQuestion from './CodeOutputQuestion.jsx'
import Question from './Question.jsx'
import PreQuiz from './PreQuiz.jsx'
import PostQuiz from './PostQuiz.jsx'
import GroupBuilder from './GroupBuilder.jsx'
import GroupSelect from './GroupSelect.jsx'
import ScoreBar from './ScoreBar.jsx'
import EmptyLine from './EmptyLine.jsx'

import enums from '../enums'

import React from 'react'

export default class QuizApp extends React.Component {
    constructor(props) {
        super(props);

        this.awardPointCb = this.awardPointCb.bind(this);
        this.submitChoiceCb = this.submitChoiceCb.bind(this);
        this.selectQuestionCb = this.selectQuestionCb.bind(this);
        this.createGroupCb = this.createGroupCb.bind(this);
        this.upvoteCb = this.upvoteCb.bind(this);
        this.downvoteCb = this.downvoteCb.bind(this);

        this.state = {
            score: 0,
            quiz: {
                allocateMembers: null
            },
            groupId: null,
            groupName: null,
            teammates : [],
            userId: null,
            isDriver: false,
            hasCreatedGroup: false,
            selectedQuestion: null,
            active: true,
            complete: false,
            inProgress: false,
            responses: {},
            numCorrect: 0
        }
    }

    componentWillMount() {
        // var url = window.location.href;
        // var quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/start'));


        // Request quiz data
        // this.socket.emit('REQUEST_QUIZ', quizId);

        this.socket.on('setGroup', (id) => {
            if (id !== this.state.groupId)
                window.location.href = window.location.href;
        });

        this.socket.on('groupsUpdated', (data) => {
        });
        //
        // this.socket.on('QUIZ_DATA', (tutorialQuiz) => {
        //     this.setState({
        //         quiz: tutorialQuiz.quiz,
        //         groupId: tutorialQuiz.groupId || this.state.groupId,
        //         userId: tutorialQuiz.userId || this.state.userId,
        //         groupName: tutorialQuiz.groupName,
        //         active: tutorialQuiz.quiz.active,
        //         selectedQuestion: tutorialQuiz.quiz.quiz.questions[0],
        //     });
        // });


        this.socket.on('RESET_DRIVER', (data) => {
            swal('New Driver', 'Your group now has a new driver.', 'info');
            if (this.state.groupId != data.groupId) return;
            this.setState({
                isDriver: false,
                inProgress: true
            });
        });

        this.socket.on('info', (data) => {
            swal('Note', data.message, 'info');
        })

        this.socket.on('ctGroupAttempt', (data) => {
            if (data.groupId != this.state.groupId) return;
            var question = this.state.quiz.quiz.questions.filter(q => q._id == data.response.question)[0];
            question.output = data.codeOutput;

            if (data.allCodeTracingLinesCorrect) {
                swal("Well done!", "The line(s) entered are correct", "success");

            } else {
                swal("Yikes!", "Looks like you made a mistake somewhere", "error");
            }

            this.setState({
                quiz: this.state.quiz
            });
        })

        this.socket.on('GROUP_ATTEMPT', (data) => {
            if (this.state.groupId && data.groupId != this.state.groupId) return;

            var responsesStore = this.state.responses;
            responsesStore[data.response.question] = data.response;
            var question = this.state.quiz.quiz.questions.filter(q => q._id == data.response.question)[0];
            var maxScore = question.type == "code tracing" ? question.points : question.points + question.firstTryBonus;
            question.output = data.codeOutput;


            if (data.response.correct) {
                var msg = "Question " + question.number + " was answered correctly!\
                          Received " + data.response.points + " of " + maxScore + " points ";

                swal("Good job!", msg, "success");

                var scoreInc = parseInt(data.response.points, 10);
                var numCorrInc = 1;

                this.setState({
                    score: this.state.score + scoreInc,
                    numCorrect: this.state.numCorrect + numCorrInc
                });

                // All questions completed
                if (this.state.quiz.quiz.questions.length == this.state.numCorrect)
                    socket.emit('QUIZ_COMPLETE', {
                        groupId: this.state.groupId,
                        quizId: this.state.quiz.quiz._id
                    });

            } else {
                swal("Yikes!", "Question " + question.number + " was answered incorrectly!", "error");
            }

            this.setState({
                responses: responsesStore,
                quiz: this.state.quiz
            });
        });

        this.socket.on('updateScores', (data) => {
            if (this.state.groupId && data.groupId != this.state.groupId) return;

            var responsesStore = this.state.responses;
            let numCorrectInc = 0;
            let newScore = 0;

            data.responses.forEach((response, i) => {
                responsesStore[response.question] = response;
                numCorrectInc += response.correct ? 1 : 0;
                newScore += response.points;
            });

            this.setState({
                numCorrect: this.state.numCorrect + numCorrectInc,
                responses: responsesStore,
                score: newScore
            });
        });

        this.socket.on('SYNC_RESPONSE', (data) => {
            var responses = this.state.responses;
            responses[data.questionId] = data.response;
            this.setState({
                responses: responses
            });

            var maxAttempts = data.question.maxAttemptsPerLine;
            var llSummary = data.response.lineByLineSummary;
            var last = (llSummary) ? llSummary.length - 1 : -1;

            if (!data.question.immediateFeedbackDisabled && last > -1) {
                
                var attempts = llSummary[last].attempts;
                var attemptsLeft = maxAttempts - attempts;
                
                if (attempts == maxAttempts && llSummary[last].answerProvided) {
                    swal("You tried your best...", "We'll reveal the answer for this line - take a few moments to reason about how to get to this answer", "error");
                }
                else if (attempts < maxAttempts && !llSummary[last].correct) {
                     swal("Yikes!", `Looks like you've made a mistake somewhere...  You can try ${attemptsLeft}
                      more time${attemptsLeft > 1 ? 's' : ''} before we reveal this line's answer`, "error");
                }
            }
        });

        this.socket.on('FINISH_QUIZ', (data) => {
            this.setState({
                teammates : data.members,
                score : data.score,
                complete : true,
                inProgress : false,
                active : false
            })
        })
    }

    emit(eventName, data) {
        data.questionId = this.state.selectedQuestion._id || null;
        data.groupId = this.state.groupId;
        this.socket.emit(eventName, data);
    }

    selectQuestion(i) {
        this.setState({
            selectedQuestion: i
        });
    }

    getCurrentQuestion() {
        let selectedQuestion = null;
        let _quiz = this.state.quiz;


        if (this.state.selectedQuestion === null) {
            selectedQuestion = _quiz.quiz.questions[0];
        } else {
            selectedQuestion = this.state.selectedQuestion;
        }

        if (!selectedQuestion) {
            swal("Yikes!", "No questions were found for this quiz.", "error");
            return null;
        }

        return (
            <Question 
                key= {selectedQuestion._id + "questionObj"}
				isDriver = {this.state.isDriver}
                questionRef = {selectedQuestion}
                response = {this.state.responses[selectedQuestion._id]}
				questionType = {selectedQuestion.type}
				submitCb = {this.submitChoiceCb}
				upvoteCb = {this.upvoteCb}
				downvoteCb = {this.downvoteCb}
            />
        );
    }

    getScoreBar() {
        return (<ScoreBar 
			questions = {this.state.quiz.quiz.questions || []}
            responses = {this.state.responses}
			selectQuestionCb = {this.selectQuestionCb}
			selectedQuestion = {this.state.selectedQuestion}
                />)
    }

    getPostQuiz() {
        if (!this.state.complete) {
            return null;
        }
        return (<PostQuiz finalScore = {10}
                    teammates = {this.state.teammates || []}
                    awardPointCb = {this.awardPointCb}
                    />);
    }

    getGroupBuilder() {
        if (this.state.quiz.allocateMembers !== enums.allocateMembers.selfSelect) {
            return null;
        }
        return (<GroupBuilder groups = {
                        [{
                            name: 'G1'
                        }, {
                            name: 'G2'
                        }]
                    }
                    createGroupCb = {
                        this.createGroupCb
                    }
                    />);
    }

    render() {
        var scoreIndicator = this.state.inProgress ? <span> Quiz: {this.state.score} </span> : null;
        var scoreBar = this.state.inProgress ? this.getScoreBar() : null;
        var question = this.state.inProgress ? this.getCurrentQuestion() : null;
        var postQuiz = this.state.complete ? this.getPostQuiz() : null;
        var groupBuilder = this.state.inProgress ? null : this.getGroupBuilder();

        return (<div> 
                    {groupBuilder}
                    {scoreBar}
                    {question} 
                    {postQuiz}
                    <EmptyLine/>
                </div>);
    }

    createGroupCb() {
        alert('creating group');
    }

    awardPointCb(id) {
        alert('Awarded point to ' + id);
    }

    submitChoiceCb(answer, isCodeTracingQuestion) {
        if (isCodeTracingQuestion) {
            this.emit('CODE_TRACING_ANSWER_ATTEMPT', {
                answer: answer
            });
        } else {
            this.emit(enums.eventNames.attemptAnswer, {
                answer: answer
            });
        }
    }

    selectQuestionCb(question) {
        this.setState({
            selectedQuestion: question
        });
    }
    
    upvoteCb(questionId) {
        this.emit('UPVOTE_QUESTION', { questionId : questionId });
    }
    
    downvoteCb(questionId) {
        this.emit('DOWNVOTE_QUESTION', { questionId : questionId });
    }

}