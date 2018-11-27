/*------------------------------------
Redirect user back to / if not authenticated.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Middleware = require('../Middleware');

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
        res.redirect('/login');
    }

}

module.exports = EnsureAuthenticatedMiddleware;
