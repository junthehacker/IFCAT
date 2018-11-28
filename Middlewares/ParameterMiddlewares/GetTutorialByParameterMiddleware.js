/*------------------------------------
Middleware to fill req.tutorial by URL parameter.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const ParameterMiddleware = require('./ParameterMiddleware');
const IAServiceProvider   = require('../../Providers/IAServiceProvider');

/**
 * Middleware to fill req.tutorial by URL parameter.
 * @extends ParameterMiddleware
 * @memberOf Middleware.ParameterMiddleware
 */
class GetTutorialByParameterMiddleware extends ParameterMiddleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next, id) {
        try {
            req.tutorial = await IAServiceProvider.getTutorialByIdOrFail(id);
            next();
        } catch (e) {
            next(e);
        }
    }

}

module.exports = GetTutorialByParameterMiddleware;
