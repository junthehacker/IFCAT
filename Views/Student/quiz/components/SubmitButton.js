import React, {Component}  from 'react';

class SubmitButton extends Component {
    render() {
        if(!this.props.isDriver) {
            return (
                <p className={"text-muted"}>You are not a driver, you cannot submit answers.</p>
            )
        } else {
            return (
                <button
                    className={"btn btn-success btn-lg"}
                    disabled={this.props.disabled}
                    onClick={this.props.onClick}
                >
                    <i className="fa fa-check" aria-hidden="true" /> Submit
                </button>
            )
        }
    }
}

export default SubmitButton;