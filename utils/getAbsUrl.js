/*------------------------------------
A helper function to get absolute url
given relative url

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const config = require('./config');

/**
 * Returns absolute URL
 * @param url
 * @returns {*}
 */
module.exports = function(url) {
    return config.baseDir + url;
};
