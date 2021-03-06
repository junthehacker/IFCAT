import React, {Component}              from 'react';
import styled                          from "styled-components";
import QuestionTitle                   from "../QuestionTitle";
import SubmitButton                    from "../SubmitButton";
import QuestionScore                   from "../QuestionScore";
import {attemptAnswer}                 from "../../actions/quizActions";
import {withGlobalContext}             from "../../contexts/GlobalContext";
import {selectResponseGivenQuestionID} from "../../selectors/quizSelectors";

const Container = styled.div`
    text-align: center;
`;

class MultipleSelectQuestion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedChoices: []
        }
    }

    getChoices = () => {
        // TODO: Shuffle based on this.props.question.shuffle
        return this.props.question.choices;
    };

    toggleChoice = (index) => {
        let newChoices  = [...this.state.selectedChoices];
        let choiceIndex = newChoices.indexOf(index);
        if (choiceIndex >= 0) {
            newChoices.splice(choiceIndex, 1);
        } else {
            newChoices.push(index);
        }
        this.setState({selectedChoices: newChoices});
    };

    static getDerivedStateFromProps(props, state) {
        const {question}     = props;
        const {responses} = props.globalContext.data;
        const response = selectResponseGivenQuestionID(responses, question._id);

        if(response && response.correct) {
            let selectedChoices = [];
            for(let answer of response.answer) {
                selectedChoices.push(props.question.choices.indexOf(answer))
            }
            return {selectedChoices}
        }

        return null;
    }

    render() {
        const {question, isDriver}     = this.props;
        const {group, responses, quiz} = this.props.globalContext.data;
        const response                 = selectResponseGivenQuestionID(responses, question._id);

        return (
            <Container>
                <QuestionTitle question={question}/>
                <small className={"text-muted"}>Choose all options that are correct:</small>
                <br/><br/>
                {this.getChoices().map((choice, key) => {
                    return (
                        <React.Fragment key={key}>
                            <button
                                className={"btn btn-no-capital" + (this.state.selectedChoices.indexOf(key) >= 0 ? " btn-primary" : " btn-link")}
                                onClick={() => this.toggleChoice(key)}
                                disabled={!isDriver || (response && response.correct) || quiz.archived}
                            >
                                {choice}
                            </button>
                            <br/><br/>
                        </React.Fragment>
                    )
                })}
                <hr/>
                <QuestionScore response={response}/>
                {!response || !response.correct ? (
                    <SubmitButton
                        isDriver={isDriver}
                        disabled={this.state.selectedChoices.length === 0 || quiz.archived}
                        onClick={() => {

                            let answer = [];
                            for (let choice of this.state.selectedChoices) {
                                answer.push(this.getChoices()[choice]);
                            }

                            attemptAnswer(question._id, group._id, answer);
                        }}
                    />
                ) : null}
                <br/>
            </Container>
        )
    }
}

export default withGlobalContext(MultipleSelectQuestion);