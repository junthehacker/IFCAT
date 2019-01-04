import React, {Component}  from 'react';
import styled              from "styled-components";
import QuestionTitle       from "../QuestionTitle";
import SubmitButton        from "../SubmitButton";
import QuestionScore       from "../QuestionScore";
import {attemptAnswer}     from "../../actions/quizActions";
import {withGlobalContext} from "../../contexts/GlobalContext";

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

    getResponse = () => {
        const {question}  = this.props;
        const {responses} = this.props.globalContext.data;
        for (let response of responses) {
            if (response.question === question._id) {
                return response;
            }
        }
    };

    render() {
        const {question, isDriver} = this.props;
        const {group}              = this.props.globalContext.data;
        const response             = this.getResponse();

        return (
            <Container>
                <QuestionTitle question={question}/>
                <small className={"text-muted"}>Choose all options that are correct:</small>
                <br/><br/>
                {this.getChoices().map((choice, key) => {
                    return (
                        <React.Fragment key={key}>
                            <button
                                className={"btn" + (this.state.selectedChoices.indexOf(key) >= 0 ? " btn-primary" : " btn-link")}
                                onClick={() => this.toggleChoice(key)}
                                disabled={!isDriver || (response && response.correct)}
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
                        disabled={this.state.selectedChoices.length === 0}
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