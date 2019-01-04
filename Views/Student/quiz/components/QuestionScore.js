import React, {Component}  from 'react';
import styled from 'styled-components';

const Container = styled.div`
    padding-bottom: 10px;
`;


class QuestionScore extends Component {


    render() {

        const {response} = this.props;

        return (
            <Container>
                {response ? (
                    <small>{response.attempts} Failed Attempts. {response.correct ? ("Final Score: " + response.points) : ""}</small>
                ): (
                    <small className="text-muted">You haven't attempted this question yet.</small>
                )}
            </Container>
        )
    }

}

export default QuestionScore;