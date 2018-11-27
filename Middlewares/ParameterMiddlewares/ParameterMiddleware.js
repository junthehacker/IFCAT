/*------------------------------------
Super class for all router.param() middlewares.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Middleware namespace.
 * @namespace ParameterMiddleware
 * @memberOf Middleware
 */

const Middleware = require('../Middleware');

/**
 * Middleware used for router.param().
 * @extends Middleware
 * @memberOf Middleware.ParameterMiddleware
 */
class ParameterMiddleware extends Middleware {

    /**
     * Apply parameter middleware to router.
     * @override
     * @param {string} parameter Parameter name.
     * @param {Object} router Express router to apply to.
     */
    static applyToRouter(parameter, router) {
        router.param(parameter, (new this()).handler);
    }

    /**
     * Middleware handling logic.
     * @abstract
     * @param {Object} req Express request
     * @param {Object} res Express response
     * @param {function} next Next callback function
     * @param {string} id Param data
     */
    async handler(req, res, next, id) {
        throw new Error("Handler must be implemented by subclass.");
    }

}

module.exports = ParameterMiddleware;
