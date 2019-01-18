/*------------------------------------
Local mongoose model that categorizes
users to groups.

Author(s): Jun Zheng [me at jackzh dot com]
           Neeilan Selvalingam
-------------------------------------*/

const mongoose             = require('mongoose');
const getIAServiceProvider = () => require('../Providers/IAServiceProvider');
const asyncForEach         = require('../Utils/asyncForEach');

const groupSchema = new mongoose.Schema({
    name: {type: String, required: true},
    members: [mongoose.SchemaTypes.Mixed], // Must be mixed as we manually populate
    driver: String,
    teachingPoints: [String]
});

// Populate responses
groupSchema.virtual('responses', {ref: 'Response', localField: '_id', foreignField: 'group'});

/**
 * Populate all members from remote.
 * @returns {Promise<void>}
 */
groupSchema.methods.fillMembersFromRemote = async function () {
    let users = [];
    await asyncForEach(this.members, async memberId => {
        let user = await getIAServiceProvider().getUserById(memberId);
        users.push(user);
    });
    this.members = users;
};

// Check if user belongs to group
groupSchema.methods.hasMember = function (userId) {
    return this.members.indexOf(userId) > -1;
};

/**
 * Pre-remove hook to remove all responses.
 */
groupSchema.pre('remove', async function (next) {
    // Also remove all responses
    await this.model('Response').remove({group: this._id});
    next();
});

module.exports = mongoose.model('Group', groupSchema);