import React, {Component} from 'react';
import PropTypes          from 'prop-types';

class QuestionSelectorButton extends Component {

    getStatusIcon() {
        const {response} = this.props;
        if(!response || !response.correct) {
            return <i className="fa fa-question" aria-hidden="true" />
        } else {
            return <i className="fa fa-check" aria-hidden="true" />
        }
    }

    render() {

        const {question, selected, onClick} = this.props;

        return (
            <button
                onClick={onClick}
                className={"btn " + (selected ? " btn-primary": " btn-link")}
            >
                {question.number} {this.getStatusIcon()}
            </button>
        )
    }
}

QuestionSelectorButton.propTypes = {
    question: PropTypes.any,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
    response: PropTypes.any
};

export default QuestionSelectorButton;
