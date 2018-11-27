import React from 'react'
var enums = require('../enums')

export default class GroupBuilder extends React.Component {
	constructor(props) {
		super(props);
		this.strings = {};
		this.createGroup = this.createGroup.bind(this);
		this.joinGroup = this.joinGroup.bind(this);
		
		var today = new Date(); // consider using timestamp 
		this.key = 'IQCCreatedGroup' + (today.getDay() + today.getFullYear() + today.getMonth()); // must include quiz id here
		
	}

	createGroup() {
		sessionStorage.setItem(this.key, 'true');
		this.props.createGroupCb();
	}
	
	joinGroup(id) {
		
	}
	
	render() {
		var existingGroups = this.props.groups.map(group => (<button>{group.name}</button>));
		var createGroupBtn = null;
		
		if (sessionStorage.getItem(this.key) === null) {
			createGroupBtn = <button>Create a group</button>;
		}
																							 
		return (<div>
				{existingGroups}
				{createGroupBtn}
			</div>);
	}
}