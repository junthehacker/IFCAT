import React, {Component} from 'react';

class QuestionTitle extends Component {

    constructor(props) {
        super(props);
        this.state = {
            questionText: ""
        };
    }

    componentDidMount() {
        let converter = new showdown.Converter({tables: true});
        this.setState({
            questionText: converter.makeHtml(this.props.question.question)
        })
    }

    render() {
        const {question}     = this.props;
        const {questionText} = this.state;
        return (
            <div>
                <h4>Question {question.number}</h4>

                <div dangerouslySetInnerHTML={{__html: questionText}}></div>

                <hr/>
            </div>
        )
    }
}

export default QuestionTitle;