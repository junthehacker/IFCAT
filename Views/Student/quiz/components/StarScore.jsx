import React from 'react'
import Star from './Star.jsx'

export default class StarScore extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var totalStars = this.props.full + this.props.empty;
		if (totalStars > 5) {
			return (<span> { this.props.full + '/' + (totalStars) } </span>);
		}

		var stars = [];
		for (var i = 0; i < this.props.full; i++)
			stars.push(<Star full={true} key={'fullStar' + i}/>);
		for (var i = 0; i < this.props.empty; i++)
			stars.push(<Star full={false} key={'emptyStar' + i}/>);
		
		return <span> {stars} </span>;
	}
		
}
