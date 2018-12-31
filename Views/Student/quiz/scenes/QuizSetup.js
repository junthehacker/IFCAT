import React, {Component}  from 'react';
import styled              from 'styled-components';
import {withGlobalContext} from "../contexts/GlobalContext";

const Container = styled.div`
    text-align: center;
    padding-top: 20px;
    padding-bottom: 20px;
`;

class QuizSetup extends Component {

    render() {

        const {quiz, groupName} = this.props.globalContext.data;

        const quizNotActive = (
            <div className="alert alert-primary" role="alert">
                The instructor haven't activated the quiz yet, please standby...
            </div>
        );

        const groupNotAvailable = (
            <div className="alert alert-light" role="alert">
                An instructor must assign you to a group, please wait...
            </div>
        );

        const loadingQuiz = (
            <div>Loading quiz...</div>
        );

        if(quiz) {
            return (
                <Container>
                    <h2>You are in group</h2>
                    {groupName ? (
                        <h1>{groupName}</h1>
                    ): groupNotAvailable}
                    {quiz.active ? null: quizNotActive}
                </Container>
            )
        } else {
            return loadingQuiz;
        }
    }

}

export default withGlobalContext(QuizSetup);