/*------------------------------------
Controller super class.
Currently it is empty, used for future
proofing.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Super class for all controllers.
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