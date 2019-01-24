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

    getRandomOffset = () => {
        const {group} = this.props.globalContext.data;
        return (parseInt(group.name) || 0) % this.props.question.choices.length;
    };

    getChoices = () => {
        return this.props.question.choices;
    };

    getRealKey = (key) => {
        const choices = this.getChoices();
        return (key + this.getRandomOffset()) % choices.length;
    }

    static getDerivedStateFromProps(props, state) {
        const {question}     = props;
        const {responses} = props.globalContext.data;
        const response = selectResponseGivenQuestionID(responses, question._id);
        if(response && response.correct) {
            return {selectedChoice: props.question.choices.indexOf(response.answer[0])}
        }
        return null;
    }

    render() {

        const {question, isDriver}     = this.props;
        const {group, responses, quiz} = this.props.globalContext.data;
        const response                 = selectResponseGivenQuestionID(responses, question._id);
        const choices = this.getChoices();

        return (
            <Container>

                <QuestionTitle question={question}/>

                <small className={"text-muted"}>Choose one option from below:</small>
                <br/><br/>
                {[...this.getChoices().keys()].map(key => {
                    const choice = choices[this.getRealKey(key)];
                    return (
                        <React.Fragment key={key}>
                            <button
                                className={"btn btn-no-capital" + (this.state.selectedChoice === this.getRealKey(key) ? " btn-primary" : " btn-link")}
                                onClick={() => this.setState({selectedChoice: this.getRealKey(key)})}
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