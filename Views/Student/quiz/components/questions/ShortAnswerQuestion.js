import React, {Component} from 'react';
import styled             from "styled-components";
import QuestionTitle      from "../QuestionTitle";
import SubmitButton       from "../SubmitButton";

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
                    disabled={!isDriver}
                />
                <hr/>
                <SubmitButton isDriver={isDriver} disabled={this.state.answer === ""}/>
                <br/>
            </Container>
        )
    }
}

export default ShortAnswerQuestion;