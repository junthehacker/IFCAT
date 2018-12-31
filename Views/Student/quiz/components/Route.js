import React, {Component}  from 'react';
import {withGlobalContext} from "../contexts/GlobalContext";
import PropTypes from 'prop-types';

class Route extends Component {
    render() {

        const {data} = this.props.globalContext;

        return (
            <React.Fragment>
                {data.route === this.props.name ? this.props.children : null}
            </React.Fragment>
        );
    }
}

Route.propTypes = {
    name: PropTypes.string.isRequired
};

export default withGlobalContext(Route);
