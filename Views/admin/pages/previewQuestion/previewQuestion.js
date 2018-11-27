import Question from '../../../Student/quiz/components/Question.jsx';

import React from 'react'
import ReactDOM from 'react-dom';

class QuizPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentWillMount() {
        var url = window.location.href;
        var quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/questions'));
        fetch('/admin/quizzes/' + quizId, {credentials: 'same-origin'})
            .then((res) => res.json())
            .then((quiz) => this.setState({quiz : quiz}));
    }

    render() {
        if (!this.state.quiz) return null;
        return (<div>
        {
               this.state.quiz.questions.map(question =>  
               <div className="col-xs-12 col-md-9">
                   Question { question.number }: <br/>
               <Question 
                    key= {question._id + "questionObj"}
                    isDriver = {true}
                    questionRef = {question}
                    questionType = {question.type}
                    submitCb = {()=>alert('submit')}
                    upvoteCb = {()=>alert('upvote')}
                    downvoteCb = {()=>alert('downvote')}/>
               </div>)
        }
        </div>);
    }

}

ReactDOM.render(<QuizPreview />, document.getElementById('previewQuizDiv'));

