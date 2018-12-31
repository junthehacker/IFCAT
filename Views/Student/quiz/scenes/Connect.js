import React, {Component}    from 'react';
import styled                from 'styled-components';
import {connectToQuizServer} from "../actions/connectActions";
import {withGlobalContext}   from "../contexts/GlobalContext";

const Container = styled.div`
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: center;
`;

const ConnectingLabel = styled.p`
    font-size: 20px;
`;

class Connect extends Component {

    async componentDidMount() {
        const {reduce, getData} = this.props.globalContext;
        await connectToQuizServer(reduce, getData);
    }

    render() {
        const {connectionFailure} = this.props.globalContext.data;
        return (
            <Container className="container">
                {connectionFailure ? (
                    <React.Fragment>
                        <i className="fa fa-exclamation-triangle" aria-hidden="true" /><br/><br/>
                        <ConnectingLabel>Failed to connect.</ConnectingLabel>
                        <div>Failed to connect to quiz server, please reload the page and try again.</div>
                        <br/>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Reload
                        </button>
                    </React.Fragment>
                ) : (
                    <ConnectingLabel>
                        <i className="fa fa-circle-o-notch fa-spin" aria-hidden="true"/><br/><br/>
                        Connecting to quiz server...
                    </ConnectingLabel>
                )}
            </Container>
        );
    }

}

export default withGlobalContext(Connect);