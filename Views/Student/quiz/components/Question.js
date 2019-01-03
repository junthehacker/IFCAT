import React, {Component}     from 'react';
import PropTypes              from 'prop-types';
import {QuestionType}         from "../enums";
import MultipleChoiceQuestion from "./questions/MultipleChoiceQuestion";
import MultipleSelectQuestion from "./questions/MultipleSelectQuestion";
import ShortAnswerQuestion    from "./questions/ShortAnswerQuestion";
import CodeTracingQuestion    from "./questions/CodeTracingQuestion";

class Question extends Component {

    getQuestionDisplayComponent = () => {
        const {question, isDriver} = this.props;

        switch (question.type) {
            case QuestionType.MULTIPLE_CHOICE:
                return <MultipleChoiceQuestion question={question} isDriver={isDriver}/>;
            case QuestionType.MULTIPLE_SELECT:
                return <MultipleSelectQuestion question={question} isDriver={isDriver}/>;
            case QuestionType.SHORT_ANSWER:
                return <ShortAnswerQuestion question={question} isDriver={isDriver}/>;
            case QuestionType.CODE_TRACING:
                return <CodeTracingQuestion question={question} isDriver={isDriver}/>;
            default:
                return <p>ERROR: Unknown question type {question.type}</p>
        }
    };

    render() {
        return (
            <div>
                {this.getQuestionDisplayComponent()}
            </div>
        )
    }
}

Question.propTypes = {
    question: PropTypes.any
};

export default Question;