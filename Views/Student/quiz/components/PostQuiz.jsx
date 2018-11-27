import React from 'react'
var enums = require('../enums')

export default class PostQuiz extends React.Component {
	constructor(props) {
		super(props);
		this.strings = {
			teachingPtMsg: 'If you wish, you can award a teaching point to the member of your group\
                who contributed the most during this quiz:'
		}
	}
	render() {
		var teammateBtns = this.props.teammates.map(
			t => <button className = "btn btn-default" onClick={this.props.awardPointCb.bind(this, t.id)}> {t.name} </button>
		);
		return (
			<div className="text-center">
                <br/>
                Your score: {this.props.finalScore}
                <br/>
                {this.strings.teachingPtMsg}
                <br/>
                {teammateBtns}
            </div>
		);
	}
}
