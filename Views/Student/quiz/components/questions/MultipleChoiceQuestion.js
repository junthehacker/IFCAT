import React, {Component} from 'react';
import styled             from 'styled-components';
import SubmitButton       from "../SubmitButton";
import QuestionTitle      from "../QuestionTitle";

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

    render() {

        const {question, isDriver} = this.props;

        return (
            <Container>

                <QuestionTitle question={question}/>

                <small className={"text-muted"}>Choose one option from below:</small>
                <br/><br/>
                {this.getChoices().map((choice, key) => {
                    return (
                        <React.Fragment key={key}>
                            <button
                                className={"btn" + (this.state.selectedChoice === key ? " btn-primary": " btn-link")}
                                onClick={() => this.setState({selectedChoice: key})}
                                disabled={!isDriver}
                            >
                                {choice}
                            </button>
                            <br/><br/>
                        </React.Fragment>
                    );
                })}
                <hr/>
                <SubmitButton isDriver={isDriver} disabled={this.state.selectedChoice === null}/>
                <br/>
            </Container>
        )
    }
}

export default MultipleChoiceQuestion;