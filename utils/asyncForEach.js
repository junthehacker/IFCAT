/*------------------------------------
forEach function that supports async

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

/**
 * Async forEach
 * @param arr
 * @param cb
 * @returns {Promise<void>}
 */
module.exports = async function(arr, cb) {
    if(arr instanceof Array) {
        for(let i = 0; i < arr.length; i++) {
            await cb(arr[i], i, arr);
        }
    } else {
        for(let key in arr) {
            if(!arr.hasOwnProperty(key)) continue;
            await cb(arr[key], key, arr);
        }
    }

};
