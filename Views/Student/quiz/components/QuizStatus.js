import React, {Component}  from 'react';
import {withGlobalContext} from "../contexts/GlobalContext";
import styled from 'styled-components';

const Container = styled.div`
    background-color: rgba(0,0,0,0.1);
    border-radius: 3px;
    padding: 10px;
`;

class QuizStatus extends Component {
    render() {

        const {group, user} = this.props.globalContext.data;

        return (
            <Container>
                Group: {group.name}
                {group.driver === user._id ? (
                    <span> | You are the driver.</span>
                ): (
                    <span className={"text-muted"}> | You are not the driver.</span>
                )}
            </Container>
        )
    }
}

export default withGlobalContext(QuizStatus);