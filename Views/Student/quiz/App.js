import React, {Component}                             from 'react';
import {withGlobalContext, withGlobalContextProvider} from "./contexts/GlobalContext";
import Route                                          from "./components/Route";
import Connect                                        from "./scenes/Connect";
import QuizSetup                                      from "./scenes/QuizSetup";
import Quiz                                           from "./scenes/Quiz";
import Report                                         from "./scenes/Report";

class App extends Component {


    render() {
        return <div>
            <Route name="connect"><Connect /></Route>
            <Route name="quizSetup"><QuizSetup /></Route>
            <Route name="quiz"><Quiz /></Route>
            <Route name="report"><Report /></Route>
        </div>
    }
}

export default withGlobalContextProvider(withGlobalContext(App));