/*------------------------------------
Middleware to fill req.fil3 by URL parameter.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const ParameterMiddleware = require('./ParameterMiddleware');
const File                = require('../../Models/File');

/**
 * Middleware to fill req.fil3 by URL parameter.
 * @extends ParameterMiddleware
 * @memberOf Middleware.ParameterMiddleware
 */
class GetFileByParameterMiddleware extends ParameterMiddleware {

    /**
     * @override
     * @inheritDoc
     */
    async handler(req, res, next, id) {
        try {
            let file = await File.findOne({_id: id});
            req.fil3 = file; // req.file is used by multer
            if (file) {
                next();
            } else {
                next(new Error("No file is found."));
            }
        } catch (e) {
            next(e);
        }
    }

}

module.exports = GetFileByParameterMiddleware;
