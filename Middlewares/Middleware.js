/*------------------------------------
Super class for all middlewares.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Middleware namespace.
 * @namespace Middlewares
 */

/**
 * Middleware super class.
 * @memberOf Middlewares
 */
class Middleware {

    /**
     * Apply current middleware to router.
     * @param {Object} router Router to apply this middleware to.
     */
    static applyToRouter(router) {
        router.use((new this()).handler);
    }

    /**
     * Middleware handling logic.
     * @abstract
     * @param {Object} req
     * @param {Object} res
     * @param {function} next
     */
    async handler(req, res, next) {
        throw new Error("Handler must be implemented by subclass.");
    }

}

module.exports = Middleware;
