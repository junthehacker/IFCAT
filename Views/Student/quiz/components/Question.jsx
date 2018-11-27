import EmptyLine from './EmptyLine.jsx'
import CodeOutputQuestion from './CodeOutputQuestion.jsx'
import VoteCaster from './VoteCaster.jsx'

import React from 'react'
var enums = require('../enums');
var MathJax = require('react-mathjax');

export default class Question extends React.Component {
	constructor(props) {
		super(props);
		this.toggleChoiceSelection = this.toggleChoiceSelection.bind(this);
		this.submitAnswer = this.submitAnswer.bind(this);

		this.state = {
			selectedChoices: [],
			givenAnswer: null,
			showAttachments : false
		}
	}

	getSubmitBtn() {
		var btnText = 'SUBMIT';
		if (!this.props.isDriver)
			btnText = 'NOT DRIVER'
		if (this.props.response && this.props.response.correct)
			btnText = enums.messages.correctlyAnswered;

		var submitBtn;
		if (this.props.questionType == enums.questionTypes.codeTracing) {
			submitBtn = null;
		} else {
			submitBtn = <button 
						disabled = { !this.props.isDriver || (this.props.response && this.props.response.correct) }
						onClick={this.submitAnswer} 
						className="btn btn-success col-xs-10 col-xs-offset-1">
						{btnText}
					</button>;
		}
		return submitBtn;
	}

	componentWillMount() {
		if (this.props.questionType != enums.questionTypes.multiSelect 
		&& this.props.questionType != enums.questionTypes.multipleChoice) {
			return;
		}
		var choices = this.props.questionRef.choices;
		if (this.props.questionRef.shuffleChoices) {
			for (var i = 0; i < choices.length; i++) {
				var randomIndex = Math.floor(Math.random() * choices.length);
				var temp = choices[randomIndex];
				choices[randomIndex] = choices[i];
				choices[i] = temp;
			}
		}
	}
	
	render() {
		let questionText = this.props.questionRef.useLaTeX ? (
			<MathJax.Context>
				<MathJax.Node>
					{ this.props.questionRef.question }
				</MathJax.Node>
			</MathJax.Context>
		) : this.props.questionRef.question;
	
		return (
			<div className="col-xs-12 col-md-9 text-center">
				<br/>
				{questionText}
				<EmptyLine/>
				{this.getAttachmentBtn()}
				{this.getAttachments()}
        		{this.getAnswerArea()}
				<br/>
				{this.getSubmitBtn()}
				{this.getVoteCaster()}
				<EmptyLine />
			</div>);
	}
	
	getVoteCaster() {
		if (!JSON.parse(localStorage.getItem('iqcVotedOn' + this.props.questionRef._id))) {
			return (
				<div style={{'textAlign' : 'center'}}>
					<VoteCaster 
						upvoteCb={() => this.voteCb('up')} 
						downvoteCb={() => this.voteCb('down')} />
				</div>
			);
		}
	}
	
	
	voteCb(type) {
		if (type === 'up') {
			 this.props.upvoteCb(this.props.questionRef._id);
		} else if (type === 'down') {
			this.props.downvoteCb(this.props.questionRef._id)
		}
		
		localStorage.setItem('iqcVotedOn' + this.props.questionRef._id, 'true');
		this.setState(this.state);
	}
	

	submitAnswer() {
		this.props.submitCb(this.state.givenAnswer || this.state.selectedChoices);
	}

	getAttachmentBtn() {
		if ((this.props.questionRef.files && this.props.questionRef.files.length > 0) || (this.props.questionRef.links && this.props.questionRef.links.length > 0))
			return (<div>
						<span className="btn btn-default" 
								onClick={()=>this.setState({showAttachments : !this.state.showAttachments})}> 
							<i className="fa fa-paperclip" aria-hidden="true"></i>
							{(this.state.showAttachments ? ' Hide' : ' Show') + ' attachments'}
						</span>
						<EmptyLine/>
					</div>);
	}

	getAttachments() {
		if (!this.state.showAttachments)
			return null;
		var attachments = [];
		var url = window.location.href;
		if (this.props.questionRef.files)
		{
			this.props.questionRef.files.forEach(function(file){
				var courseId = url.slice(url.indexOf('/courses/') + 9, url.indexOf('/quizzes'));
				var fileUrl = '/uploads/' + courseId + '/' + file.name;
				if (file.type.includes('image')) {
					attachments.push(
						<div key={file._id}>
							<img className='attachedImg' src={fileUrl} /><br/>
							<a target='_blank' href={fileUrl}>Direct link</a><br/>
						</div>
					);
				} else if (file.type.includes('audio')){
					attachments.push(
						<div key={file._id}>
							<audio controls>
								<source src={fileUrl} type={file.type}/>
							</audio>
							<br/>
							<a target='_blank' href={fileUrl}>Direct link</a><br/>
						</div>
					);
				} 
			})
		} 
		if (this.props.questionRef.links) {
			this.props.questionRef.links.forEach(function(link){
				attachments.push(<div key={link}><br/><a target='_blank' href={link}>{link}</a><br/></div>);
			})
		}
		return <div><br/>{attachments}</div>;
	}
							

	getAnswerArea() {
		switch (this.props.questionType) {
			case (enums.questionTypes.shortAnswer):
				{
					return <input 
									 type="text"
									 style={{padding: '10px'}}
									 placeholder = "Your answer"
									 onChange={(e) => this.setState( { givenAnswer : [e.target.value] } ) } />
				}
			case (enums.questionTypes.multipleChoice):
			case (enums.questionTypes.multiSelect):
				{
					return this.props.questionRef.choices.map(
						(choice, i) =>
						<span key = {this.props.questionRef._id + 'ch'+ i}>	
							<button 
									disabled = {!!this.props.previouslyAnswered || !this.props.isDriver}
									className = {`btn col-xs-10 col-xs-offset-1 ${ this.state.selectedChoices.indexOf(choice) > -1 ? 'btn-primary' : 'btn-default'} `}
									onClick={this.toggleChoiceSelection.bind(this, choice)}>
									{choice}
							</button>
						<br/>
					</span>);
				}
			case (enums.questionTypes.shortAnswer): {
						return (
							<span>
								<input type = "text" onChange = { (e) => this.setState({givenAnswer : e.target.value})} />
								<br/>
							</span>
						);
					}
			case (enums.questionTypes.codeTracing) : {
				return <CodeOutputQuestion 
					question={this.props.questionRef}
					response={this.props.response} 
					checkInputCb={this.props.submitCb}
					isDriver={this.props.isDriver}/>;
			}

		}
	}

	toggleChoiceSelection(choice) {
		var index = this.state.selectedChoices.indexOf(choice);
		if (index > -1) {
			this.setState({
				selectedChoices: this.state.selectedChoices.filter(ch => ch !== choice)
			})
		} else if (this.props.questionType == enums.questionTypes.multiSelect) {
			this.setState({
				selectedChoices: this.state.selectedChoices.concat([choice])
			});
		} else if (this.props.questionType == enums.questionTypes.multipleChoice) {
			this.setState({
				selectedChoices: [choice]
			});
		}
	}
}