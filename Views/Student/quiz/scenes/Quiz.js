import React, {Component}  from 'react';
import {withGlobalContext} from "../contexts/GlobalContext";
import QuizStatus          from "../components/QuizStatus";
import QuestionSelector    from "../components/QuestionSelector";

class Quiz extends Component {

    onChangeQuestion = (index) => {
        const {reduce} = this.props.globalContext;
        reduce({selectedQuestion: index});
    };

    render() {

        const {quiz, selectedQuestion} = this.props.globalContext.data;

        return (
            <div>
                <QuizStatus/>
                <div>
                    <QuestionSelector
                        questions={quiz.quiz.questions}
                        selectedIndex={selectedQuestion}
                        onSelectionChange={this.onChangeQuestion}
                    />
                </div>
            </div>
        )
    }
}

export default withGlobalContext(Quiz);