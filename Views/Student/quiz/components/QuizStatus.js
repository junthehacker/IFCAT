import React, {Component}              from 'react';
import {withGlobalContext}             from "../contexts/GlobalContext";
import styled                          from 'styled-components';
import {selectResponseGivenQuestionID} from "../selectors/quizSelectors";

const Container = styled.div`
    background-color: rgba(0,0,0,0.1);
    border-radius: 3px;
    padding: 10px;
    text-align: center;
`;

const ConnectedLabel = styled.span`
    color: green;
    i {
        padding-right: 5px;
    }
`;

const DisconnectedLabel = styled(ConnectedLabel)`
    color: red;
`;

const FinishedQuizContainer = styled.div`
    font-size: 18px;
`;

const verticalBar = <span> | </span>;

class QuizStatus extends Component {

    getTotalPossiblePoints = () => {
        const {quiz} = this.props.globalContext.data;
        let points   = 0;
        for (let question of quiz.quiz.questions) {
            points += question.points;
        }
        return points;
    };

    getTotalPossibleBonusPoints = () => {
        const {quiz} = this.props.globalContext.data;
        let points   = 0;
        for (let question of quiz.quiz.questions) {
            points += question.firstTryBonus;
        }
        return points;
    };

    getEarnedPoints = () => {
        const {responses} = this.props.globalContext.data;
        let points        = 0;
        for (let response of responses) {
            if (response.correct) {
                points += response.points;
            }
        }
        return points;
    };

    isQuizFinished = () => {
        const {quiz, responses} = this.props.globalContext.data;
        for (let question of quiz.quiz.questions) {
            let response = selectResponseGivenQuestionID(responses, question._id);
            if (!response || !response.correct) return false;
        }
        return true;
    };

    render() {

        const {group, connected, quiz} = this.props.globalContext.data;
        const {reduce}                 = this.props.globalContext;

        return (
            <Container>
                Group: {group.name}
                {verticalBar}
                <span
                    className={"text-muted"}>{this.getEarnedPoints()}/{this.getTotalPossiblePoints()} ({this.getTotalPossibleBonusPoints()} Bonus)</span>
                {verticalBar}
                {connected ? (
                    <ConnectedLabel>
                        <i className="fa fa-exchange" aria-hidden="true"/>
                        Connected
                    </ConnectedLabel>
                ) : (
                    <DisconnectedLabel>
                        <i className="fa fa-plug" aria-hidden="true"/>
                        Disconnected
                    </DisconnectedLabel>
                )}

                {this.isQuizFinished() || quiz.archived ? (
                    <FinishedQuizContainer>
                        <hr/>
                        {!quiz.archived ? "🎉 Hooray! You have finished the quiz!": "Quiz is closed"}
                        <br/>
                        <button
                            className="btn btn-success"
                            onClick={() => reduce({route: "report"})}
                        >
                            View Score & Report
                        </button>
                    </FinishedQuizContainer>
                ) : null}

            </Container>
        )
    }
}

export default withGlobalContext(QuizStatus);