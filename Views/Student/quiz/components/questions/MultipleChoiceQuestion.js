import React, {Component}              from 'react';
import styled                          from 'styled-components';
import SubmitButton                    from "../SubmitButton";
import QuestionTitle                   from "../QuestionTitle";
import {withGlobalContext}             from "../../contexts/GlobalContext";
import {attemptAnswer}                 from "../../actions/quizActions";
import QuestionScore                   from "../QuestionScore";
import {selectResponseGivenQuestionID} from "../../selectors/quizSelectors";

const Container = styled.div`
    text-align: center;
`;

class MultipleChoiceQuestion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedChoice: null
        }
    }

    getChoices = () => {
        // TODO: Shuffle based on this.props.question.shuffle
        return this.props.question.choices;
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

        const {question, isDriver}     = this.props;
        const {group, responses, quiz} = this.props.globalContext.data;
        const response                 = selectResponseGivenQuestionID(responses, question._id);

        return (
            <Container>

                <QuestionTitle question={question}/>

                <small className={"text-muted"}>Choose one option from below:</small>
                <br/><br/>
                {this.getChoices().map((choice, key) => {
                    return (
                        <React.Fragment key={key}>
                            <button
                                className={"btn" + (this.state.selectedChoice === key ? " btn-primary" : " btn-link")}
                                onClick={() => this.setState({selectedChoice: key})}
                                disabled={!isDriver || (response && response.correct) || quiz.archived}
                            >
                                {choice}
                            </button>
                            <br/><br/>
                        </React.Fragment>
                    );
                })}
                <hr/>
                <QuestionScore response={response}/>
                {!response || !response.correct ? (
                    <SubmitButton
                        isDriver={isDriver}
                        disabled={this.state.selectedChoice === null || quiz.archived}
                        onClick={() => {
                            attemptAnswer(question._id, group._id, [this.getChoices()[this.state.selectedChoice]]);
                        }}
                    />
                ) : null}
                <br/>
            </Container>
        )
    }
}

export default withGlobalContext(MultipleChoiceQuestion);