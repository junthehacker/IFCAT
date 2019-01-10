import React, {Component}     from 'react';
import styled                 from 'styled-components';
import {withGlobalContext}    from "../contexts/GlobalContext";
import {nominateSelfAsDriver} from "../actions/quizActions";

const Container = styled.div`
    text-align: center;
    padding-top: 20px;
    padding-bottom: 20px;
`;

class QuizSetup extends Component {
    render() {
        const {quiz, group} = this.props.globalContext.data;

        const quizNotActive = (
            <div className="alert alert-primary" role="alert">
                The instructor haven't activated the quiz yet, please standby...
            </div>
        );

        const groupNotAvailable = (
            <div className="alert alert-light" role="alert">
                You are not in a group! Please contact your instructor for details.
            </div>
        );

        const loadingQuiz = (
            <div>Loading quiz...</div>
        );

        const driverSelect = (
            <div>
                <hr/>
                <h3>Do you want to be the driver for your group?</h3>
                <p>Each group must have a dedicated driver who will answer questions and facilitate this quiz.</p>
                <button
                    className={"btn btn-primary"}
                    onClick={() => {
                        nominateSelfAsDriver(group._id)
                    }}
                >
                    Yes! I will be the driver.
                </button>
            </div>
        );

        if(quiz) {
            return (
                <Container>
                    <h2>You are in group</h2>
                    {group ? (
                        <React.Fragment>
                            <h1>{group.name}</h1>
                            {quiz.active ? driverSelect: quizNotActive}
                        </React.Fragment>
                    ): groupNotAvailable}
                </Container>
            )
        } else {
            return loadingQuiz;
        }
    }

}

export default withGlobalContext(QuizSetup);