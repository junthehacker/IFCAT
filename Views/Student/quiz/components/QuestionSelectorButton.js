import React, {Component} from 'react';
import PropTypes          from 'prop-types';

class QuestionSelectorButton extends Component {
    render() {

        const {question, selected, onClick} = this.props;

        return (
            <button
                onClick={onClick}
                className={"btn btn-default" + (selected ? " btn-primary": "")}
            >
                {question.number}
            </button>
        )
    }
}

QuestionSelectorButton.propTypes = {
    question: PropTypes.any,
    selected: PropTypes.bool,
    onClick: PropTypes.func
};

export default QuestionSelectorButton;
