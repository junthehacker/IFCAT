import React, {Component}  from 'react';
import styled              from "styled-components";
import QuestionTitle       from "../QuestionTitle";
import SubmitButton        from "../SubmitButton";
import {withGlobalContext} from "../../contexts/GlobalContext";

const Container = styled.div`
    text-align: center;
`;

const CodeBlock = styled.pre`
    text-align: left;
`;

class CodeTracingQuestion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            answer: ""
        }
    }

    render() {
        const {question, isDriver} = this.props;
        const {quiz}               = this.props.globalContext.data;
        return (
            <Container>
                <QuestionTitle question={question}/>

                <CodeBlock><code>{question.code}</code></CodeBlock>

                <small className={"text-muted"}>What should be the next line of output?</small>
                <br/><br/>
                <input
                    type="text"
                    className={"form-control"}
                    disabled={!isDriver || quiz.archived}
                    placeholder={"Enter next line of output here..."}
                    onChange={e => {
                        this.setState({answer: e.target.value});
                    }}
                />

                <hr/>
                <SubmitButton
                    isDriver={isDriver}
                    disabled={this.state.answer === "" || quiz.archived}
                />
                <br/>

            </Container>
        )
    }
}

export default withGlobalContext(CodeTracingQuestion);