/*------------------------------------
Middleware to fill req.tutorialQuiz by URL parameter.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const ParameterMiddleware = require('./ParameterMiddleware');
const TutorialQuiz        = require('../../Models/TutorialQuiz');

/**
 * Middleware to fill req.tutorialQuiz by URL parameter.
 * @extends ParameterMiddleware
 * @memberOf Middlewares.ParameterMiddlewares
 */
class GetTutorialQuizByParameterMiddleware extends ParameterMiddleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next, id) {
        try {
            let tutorialQuiz = await TutorialQuiz.findById(id).populate('quiz').exec();
            await tutorialQuiz.fillTutorialFromRemote();
            req.tutorialQuiz = tutorialQuiz;
            next();
        } catch (e) {
            next(e);
        }
    }

}

module.exports = GetTutorialQuizByParameterMiddleware;
