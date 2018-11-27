/*------------------------------------
Redirect user back to / if not authenticated.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Middleware = require('./Middleware');
const getAbsUrl  = require('../Utils/getAbsUrl');

/**
 * Redirect user back to / if not authenticated.
 * @extends Middleware
 * @memberOf Middlewares
 */
class EnsureAuthenticatedMiddleware extends Middleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect(getAbsUrl('/'));
    }

}

module.exports = EnsureAuthenticatedMiddleware;
