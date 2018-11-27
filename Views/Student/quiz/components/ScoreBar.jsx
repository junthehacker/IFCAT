import React from 'react'
import EmptyLine from './EmptyLine.jsx'
import StarScore from './StarScore.jsx'
const MediaQuery = require('react-responsive');

export default class ScoreBar extends React.Component {
	constructor(props) {
		super(props);
		this.calculateStars = this.calculateStars.bind(this);

	}


	calculateStars(question) {
		if (!question) return {fullStars : 0, emptyStars : 0};
		var result = {};
		var responses = this.props.responses;
		var maxScore = question.type == "code tracing" ? question.points : question.points + question.firstTryBonus;

		if (question._id in responses) {
			result.correct = responses[question._id].correct;
			var emptyStars = (responses[question._id].attempts == 0) ? 0 : responses[question._id].attempts * question.penalty + question.firstTryBonus;
			result.emptyStars = emptyStars > maxScore ? maxScore : emptyStars;
			result.fullStars = maxScore - emptyStars > 0 ? (maxScore - emptyStars) : 0;

			if (question.type == 'code tracing') {
				result.fullStars = responses[question._id].points;
				result.emptyStars = maxScore - responses[question._id].points;
			}
		} else {
			result.emptyStars = 0;
			result.fullStars = maxScore;
		}
		return result;
	}	

	render() {




		var buttons = this.props.questions.map( (q, i) =>
			{
			var response = this.props.responses[q._id];
			var btnClass = (response && response.correct) ? 'btn-success' : '';

			return (<span key = {q.id + 'scbtn' + i}>
				<button 
					className = {`btn btn-default col-md-12 col-xs-4 ${ (this.props.selectedQuestion && 
												     (this.props.selectedQuestion._id === q._id)) ? 'btn-primary' : btnClass} `}
					onClick={this.props.selectQuestionCb.bind(this, q)}
					> 
							{q.number} 
							<br/>
							<StarScore full={this.calculateStars(q).fullStars} empty={this.calculateStars(q).emptyStars} />
				</button>
            </span>);
			});

		var smallButtons = this.props.questions.map( (q, i) =>
			{
			var response = this.props.responses[q._id];
			var btnClass = (response && response.correct) ? 'btn-success' : '';

			return (<span key = {q.id + 'scbtn' + i}>
				<button 
					className = {`btn btn-default ${ (this.props.selectedQuestion && 
												     (this.props.selectedQuestion._id === q._id)) ? 'btn-primary' : btnClass} `}
					onClick={this.props.selectQuestionCb.bind(this, q)}
					style={{textAlign:'center', padding: '10px', margin : '2px 5px 2px 5px'}}> 		
							{q.number < 10 ? '0'+ q.number : q.number }
							<br/>
				</button>
            </span>);
			});

		return (
			<div className="col-xs-12 col-md-3">
				<MediaQuery minWidth={992}>
					{buttons}
          		</MediaQuery>
				<MediaQuery maxWidth={992}>
					{smallButtons}
				 	
				 	<EmptyLine/>
				 	<div className="well">
					 	Score for this question:
					 	<StarScore 
					 		full={this.calculateStars(this.props.selectedQuestion).fullStars} 
					 		empty={this.calculateStars(this.props.selectedQuestion).emptyStars} />
					 </div>
          		</MediaQuery>
			</div>);
	}
}