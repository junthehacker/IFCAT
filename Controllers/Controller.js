/*------------------------------------
Controller super class.
Currently it is empty, used for future
proofing.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Controller namespace.
 * @namespace Controller
 */

/**
 * Super class for all controllers.
 * @memberOf Controller
 */
class Controller {

    /**
     * @hideconstructor
     */
    constructor() {
        this.instance = this;
    }

    /**
     * Get the singleton instance.
     * @returns {Controller} The singleton instance.
     */
    static getInstance() {
        return this.instance || new this();
    }

}

module.exports = Controller;