import React from 'react'

export default class Star extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
        var starClass = this.props.full ? 'fa-star' : 'fa-star-o';
		return <span><i className={"fa " + starClass} aria-hidden="true"></i></span>;
	}
}
