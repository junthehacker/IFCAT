/*------------------------------------
Middleware to fill req.course by parameter.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const ParameterMiddleware = require('./ParameterMiddleware');

/**
 * Middleware to fill req.course by URL parameter.
 * @extends ParameterMiddleware
 * @memberOf Middleware.ParameterMiddleware
 */
class GetCourseByParameterMiddleware extends ParameterMiddleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next, id) {
        try {
            req.course = await req.user.getCourse(id);
            next();
        } catch (e) {
            next(e);
        }
    }

}

module.exports = GetCourseByParameterMiddleware;
