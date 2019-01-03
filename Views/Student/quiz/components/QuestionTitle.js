import React, {Component}  from 'react';

class QuestionTitle extends Component {
    render() {
        const {question} = this.props;
        return (
            <div>
                <h4>Question {question.number}</h4>

                {question.question}

                <hr/>
            </div>
        )
    }
}

export default QuestionTitle;