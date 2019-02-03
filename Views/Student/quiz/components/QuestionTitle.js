import React, {Component} from 'react';

class QuestionTitle extends Component {

    render() {
        const {question} = this.props;
        return (
            <div className={"quiz-question-title"}>
                <h4>Question {question.number}</h4>

                <div dangerouslySetInnerHTML={{__html: question.question}}></div>

                <hr/>
            </div>
        )
    }
}

export default QuestionTitle;