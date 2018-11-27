/*------------------------------------
Middleware to fill req.question by URL parameter.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const ParameterMiddleware = require('./ParameterMiddleware');
const Question            = require('../../Models/Question');

/**
 * Middleware to fill req.question by URL parameter.
 * @extends ParameterMiddleware
 * @memberOf Middlewares.ParameterMiddlewares
 */
class GetQuestionByParameterMiddleware extends ParameterMiddleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next, id) {
        try {
            req.question = await Question.findOne({_id: id});
            if (req.question) {
                next();
            } else {
                next(new Error("No question is found."));
            }
        } catch (e) {
            next(e);
        }
    }

}

module.exports = GetQuestionByParameterMiddleware;
