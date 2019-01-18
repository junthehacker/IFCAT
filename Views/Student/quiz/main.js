import App from './App';
import * as Sentry from '@sentry/browser';

Sentry.init({
    dsn: "https://8d454cf157e746c89ae93cc469d59953@sentry.io/1374235"
});

import React                       from 'react'
import ReactDOM                    from 'react-dom';

// Render the quiz application with Socket.io instance
ReactDOM.render(<App/>, document.getElementById('quizAppDiv'));
