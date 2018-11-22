import React from 'react'
import EmptyLine from './EmptyLine.jsx'

var enums = require('../enums')

export default class PreQuiz extends React.Component {
	constructor(props) {
		super(props);
		this.strings = {
			driverBtnClass: 'btn col-md-4 col-sm-10 col-xs-12 col-md-offset-4 col-sm-offset-1'
		}
	}
	render() {
        var driverSelect;
        console.log(this.props);
        if (this.props.active && this.props.groupName) { 
        driverSelect = (<div className="col-xs-12 col-md-10 col-md-offset-1">
                This quiz requires a member of your group to serve as the driver, who will submit answers.
                <EmptyLine />
                <button 
                    onClick={this.props.setDriverCb.bind(this, true)} 
                    className= {`${this.strings.driverBtnClass} btn-primary`}> 
                        I will be driver
                </button>
                <br/>
                <button 
                    onClick={this.props.setDriverCb.bind(this, false)} 
                    className= {`${this.strings.driverBtnClass} btn-danger`}>                    
                        I will not be the driver
                </button>
            </div>);
        }

		return (
			<div className="row text-center">
                You are in group:
                <br/>
                <h1>{this.props.groupName || '?'}</h1>
                <EmptyLine />
                {driverSelect}
				<br/>
            </div>
		);
	}
}