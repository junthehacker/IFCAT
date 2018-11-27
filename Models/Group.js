/*------------------------------------
Local mongoose model that categorizes
users to groups.

Author(s): Jun Zheng [me at jackzh dot com]
           Neeilan Selvalingam
-------------------------------------*/

const _        = require('lodash');
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {type: String, required: true},
    members: [String],
    driver: String,
    teachingPoints: [String]
});

// Populate responses
groupSchema.virtual('responses', {ref: 'Response', localField: '_id', foreignField: 'group'});

// Check if user belongs to group
groupSchema.methods.hasMember = function (userId) {
    return this.members.indexOf(userId) > -1;
};

// Tally the points from populated responses
groupSchema.methods.getTotalPoints = function () {
    return _.sumBy(this.responses, response => response.points)
};

module.exports = mongoose.model('Group', groupSchema);