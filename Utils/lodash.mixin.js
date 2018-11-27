const _ = require('lodash'),
    stats = require('simple-statistics');

_.mixin({
    // Check if value is an empty array
    isEmptyArray: (value) => {
        return _.isArray(value) && _.isEmpty(value);
    },
    // Node.js implementation of Evan Miller's algorithm for ranking stuff based on pos: 
    // http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
    lowerBound: (pos, n = 0, confidence = 0.95) => {
        if (n === 0) 
            return 0;
        // for performance purposes you might consider memoize the calcuation for z
        const z = stats.probit(1 - (1 - confidence) / 2);
        // p̂, the fraction of pos
        const phat = 1.0 * pos / n;

        return (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n))/ n)) / (1 + z * z / n);
    },
    // Create a serialized representation of a plain object for use in a URL query string
    param: (object) => {
        return _.reduce(object, (query, value, key) => {
            return (query ? '&' : '') + `${key}=${encodeURIComponent(value)}`;
        }, '');
    },
    // Convert object such that values become keys and keys become values
    transpose: (objects, value, key) => {
        return _.transform(objects, (object, value, key) => {
            if (_.isObject(value)) {
                _.each(value, v => (object[v] || (object[v] = [])).push(key));
            } else {
                (object[value] || (object[value] = [])).push(key)
            }
        }, {});
    }
});

module.exports = _;