import React, {Component}     from 'react';
import QuestionSelectorButton from "./QuestionSelectorButton";
import PropTypes              from 'prop-types';
import styled                 from 'styled-components';

const Container = styled.div`
    text-align: center;
    padding-top: 15px;
    padding-bottom: 15px;
`;

class QuestionSelector extends Component {
    render() {

        const {questions, selectedIndex, onSelectionChange} = this.props;

        return (
            <Container>
                {questions.map((question, key) => {
                    return (
                        <QuestionSelectorButton
                            question={question}
                            selected={selectedIndex === key}
                            onClick={() => {
                                onSelectionChange(key);
                            }}
                            key={key}
                        />
                    );
                })}
            </Container>
        );
    }
}

QuestionSelector.propTypes = {
    selectedIndex: PropTypes.number,
    questions: PropTypes.any,
    onSelectionChange: PropTypes.func
};

export default QuestionSelector;