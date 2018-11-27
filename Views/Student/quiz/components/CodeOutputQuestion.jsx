// import React from 'react'
var enums = require('../enums')

export default class CodeOutputQuestion extends React.Component 
{
	constructor(props)
    {
		super(props);
        this.checkUserInput = this.checkUserInput.bind(this); // bind "this" context
        this.userInputCb = this.userInputCb.bind(this); 
        this.getCheckAnswerButton = this.getCheckAnswerButton.bind(this);
        this.userInputsShouldRender= this.userInputsShouldRender.bind(this);
        this.state = {
            correctOutputLines : 0,
            enteredAnswer : '',
        }
	}

    componentDidMount() {
        this.runCodePrettify();
    }

    runCodePrettify() {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;

        script.src = 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    }    

	render()
    {            
		return (
			<div style={{width : '100%', textAlign: 'left'}} >
                <pre className="prettyprint linenums" style={{border:'none'}}>
                    {this.props.question.code}
                </pre>
                {this.getOutputLines()}
                {this.getInputBox()}
                {this.getCheckAnswerButton()}

			</div>
		);
	}

    checkUserInput()
    {   
        var existingOutput = [];
        if (this.props.response && this.props.response.codeTracingAnswers) {
            existingOutput = this.props.response.codeTracingAnswers;
        }

        this.props.checkInputCb(existingOutput.concat(this.state.enteredAnswer.split('\n')), true);
        this.setState({ enteredAnswer : '' });
    }
    
    userInputCb(e)
    {
        this.setState({ enteredAnswer : e.target.value })
    }
    
    userInputsShouldRender()
    {
        return !(this.props.response && this.props.question.immediateFeedbackDisabled);
    }
    
    getCheckAnswerButton()
    {
        var text = (this.props.response && this.props.response.correct) ? enums.messages.correctlyAnswered : !this.props.isDriver ? 'NOT DRIVER' : 'CHECK';
        if (!this.userInputsShouldRender())
            return null;
        return (
            <button
                className="btn btn-success"
                style={{width:'100%'}}
                disabled = {!this.props.isDriver || (this.props.response && this.props.response.correct)}
                onClick={this.checkUserInput}>
                {text}
            </button>);
    }
    
    getInputBox()
    {
         if (!this.userInputsShouldRender())
            return null;  
        
        if (this.props.question.immediateFeedbackDisabled) {
            return (
                <pre>
                <textarea 
                    value = {this.state.enteredAnswer}
                    onChange = {this.userInputCb}
                    placeholder = "Enter ALL the output lines here before submitting"
                    disabled = {!this.props.isDriver || (this.props.response && this.props.response.correct)}
                    type = "text"
                    style = {
                        {
                            width : '100%',
                            border : 'none',
                            padding : '5px',
                            background : 'none'
                        }
                    }
                />
                </pre>);
        }
        else {
            return (
                <pre>
                <input 
                    value = {this.state.enteredAnswer}
                    onChange = {this.userInputCb}
                    placeholder = "Enter the next line of output"
                    disabled = {!this.props.isDriver || (this.props.response && this.props.response.correct)}
                    type = "text"
                    style = {
                        {
                            width : '100%',
                            border : 'none',
                            padding : '5px',
                            background : 'none'
                        }
                    }
                />
                </pre>);
        }
    }
    
    getOutputLines()
    {
        if (!this.props.response || !this.props.response.lineByLineSummary || this.props.response.lineByLineSummary.length == 0)
            return null;
        return (<pre> 
            { this.props.response.lineByLineSummary.map((line, i) => (
                <span>
                    <span className={line.correct ? 'text-success' : 'text-danger'}>
                        {line.value} 
                    </span> 
                    <span style={{float:'right'}}>{ ' (' + line.attempts + ' attempt' + (line.attempts > 1 ? 's': '') + ')'}</span>
                    { i === this.props.response.lineByLineSummary.length - 1 ? null : <br/>}

                </span>) )
            } </pre>);
    }

}