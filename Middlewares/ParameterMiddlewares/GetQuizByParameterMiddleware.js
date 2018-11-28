/*------------------------------------
Middleware to fill req.quiz by URL parameter.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const ParameterMiddleware = require('./ParameterMiddleware');
const Quiz                = require('../../Models/Quiz');

/**
 * Middleware to fill req.quiz by URL parameter.
 * @extends ParameterMiddleware
 * @memberOf Middleware.ParameterMiddleware
 */
class GetQuizByParameterMiddleware extends ParameterMiddleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next, id) {
        try {
            req.quiz = await Quiz.findOne({_id: id});
            if (req.quiz) {
                next();
            } else {
                next(new Error("No quiz is found."));
            }
        } catch (e) {
            next(e);
        }
    }

}

module.exports = GetQuizByParameterMiddleware;
