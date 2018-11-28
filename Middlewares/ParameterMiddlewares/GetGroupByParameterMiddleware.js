/*------------------------------------
Middleware to fill req.group by URL parameter.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const ParameterMiddleware = require('./ParameterMiddleware');
const Group                = require('../../Models/Group');

/**
 * Middleware to fill req.group by URL parameter.
 * @extends ParameterMiddleware
 * @memberOf Middleware.ParameterMiddleware
 */
class GetGroupByParameterMiddleware extends ParameterMiddleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next, id) {
        try {
            req.group = await Group.findOne({_id: id});
            if (req.group) {
                next();
            } else {
                next(new Error("No group is found."));
            }
        } catch (e) {
            next(e);
        }
    }

}

module.exports = GetGroupByParameterMiddleware;
