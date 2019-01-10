/*------------------------------------
Redirect user back to / if not admin.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Middleware = require('./Middleware');
const getAbsUrl  = require('../Utils/getAbsUrl');

/**
 * Redirect user back to / if not admin.
 * @extends Middleware
 * @memberOf Middleware
 */
class EnsureAdminMiddleware extends Middleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next) {
        // TODO: canAccessAdminPanel should be a separate middleware
        if (req.user && req.user.canAccessAdminPanel()) return next();
        res.redirect(getAbsUrl('/'));
    }

}

module.exports = EnsureAdminMiddleware;
