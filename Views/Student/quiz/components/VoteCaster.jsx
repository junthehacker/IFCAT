import React from 'react'

export default class VoteCaster extends React.Component {
	constructor(props) {
		super(props);

	}

	render() {
		return (
			<div className="col-xs-12" style={{'marginTop' : '10px' }}>
				<button className="btn btn-success" onClick={this.props.upvoteCb}>
				    <i className="fa fa-thumbs-up"></i>
				</button>
								
				<button className="btn btn-warning" onClick={this.props.downvoteCb}>
				    <i className="fa fa-thumbs-down"></i>
				</button>
			</div>);
	}
}