import React, {Component} from 'react';
import styled             from "styled-components";
import QuestionTitle      from "../QuestionTitle";
import SubmitButton       from "../SubmitButton";

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
        let newChoices = [...this.state.selectedChoices];
        let choiceIndex = newChoices.indexOf(index);
        if(choiceIndex >= 0) {
            newChoices.splice(choiceIndex, 1);
        } else {
            newChoices.push(index);
        }
        this.setState({selectedChoices: newChoices});
    };

    render() {
        const {question, isDriver} = this.props;
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
                                disabled={!isDriver}
                            >
                                {choice}
                            </button>
                            <br/><br/>
                        </React.Fragment>
                    )
                })}
                <hr/>
                <SubmitButton isDriver={isDriver} disabled={this.state.selectedChoices.length === 0}/>
                <br/>
            </Container>
        )
    }
}

export default MultipleSelectQuestion;