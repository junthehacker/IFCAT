import React, {Component}              from 'react';
import styled                          from "styled-components";
import QuestionTitle                   from "../QuestionTitle";
import SubmitButton                    from "../SubmitButton";
import {withGlobalContext}             from "../../contexts/GlobalContext";
import QuestionScore                   from "../QuestionScore";
import {attemptAnswer}                 from "../../actions/quizActions";
import {selectResponseGivenQuestionID} from "../../selectors/quizSelectors";

const Container = styled.div`
    text-align: center;
`;

class ShortAnswerQuestion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            answer: ""
        }
    }

    render() {
        const {question, isDriver} = this.props;
        const {group, responses}   = this.props.globalContext.data;
        const response             = selectResponseGivenQuestionID(responses, question._id);

        return (
            <Container>
                <QuestionTitle question={question}/>

                <small className={"text-muted"}>Enter your answer below:</small>
                <br/><br/>

                <textarea
                    className={"form-control"}
                    placeholder={"Enter your answer here..."}
                    value={this.state.answer}
                    onChange={(e) => {
                        this.setState({
                            answer: e.target.value
                        })
                    }}
                    disabled={!isDriver || (response && response.correct)}
                />
                <hr/>
                <QuestionScore response={response}/>
                {!response || !response.correct ? (
                    <SubmitButton
                        isDriver={isDriver}
                        disabled={this.state.answer === ""}
                        onClick={() => {
                            attemptAnswer(question._id, group._id, [this.state.answer]);
                        }}
                    />
                ) : null}
                <br/>
            </Container>
        )
    }
}

export default withGlobalContext(ShortAnswerQuestion);