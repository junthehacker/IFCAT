import React, {Component}              from 'react';
import {withGlobalContext}             from "../contexts/GlobalContext";
import styled                          from 'styled-components';
import {selectResponseGivenQuestionID} from "../selectors/quizSelectors";

const Container = styled.div`
    padding-top: 20px;
    padding-bottom: 20px;
`;

const Score = styled.div`
    font-size: 30px;
`;

const QuestionScore = styled.div`
    font-size: 18px;
`;


class Report extends Component {

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

    render() {

        const {reduce}                 = this.props.globalContext;
        const {group, quiz, responses} = this.props.globalContext.data;

        return (
            <Container>
                <button
                    className="btn btn-link"
                    onClick={() => reduce({route: "quiz"})}
                >
                    <i className="fa fa-angle-left" aria-hidden="true"/> Back
                </button>
                <h3>Quiz Report</h3>

                <h4>Detailed Report</h4>
                <p>Your Group: {group.name}</p>

                {quiz.quiz.questions.map(question => {
                    const response = selectResponseGivenQuestionID(responses, question._id);
                    return (
                        <div key={question._id}>
                            <h5>
                                Question {question.number}
                            </h5>
                            {response && response.correct ? (
                                <React.Fragment>
                                    <i className="fa fa-check" aria-hidden="true"/> Your group correctly attempted this
                                    question. There were {response.attempts} failed attempts.
                                    <QuestionScore>{response.points} / {question.points + question.firstTryBonus}</QuestionScore>
                                </React.Fragment>
                            ) : <p>Your group failed to answer this question.</p>}
                            <br/>
                        </div>
                    )
                })}


            </Container>
        )
    }
}

export default withGlobalContext(Report);