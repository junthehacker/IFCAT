const _ = require('lodash'),
    async = require('async'),
    bcrypt = require('bcryptjs'),
    mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    local: {
        email: { 
            type: String,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            set: function (password) {
                return password || this.local.password;
            }
        }
    },
    oauth: {
        id: String,
        token: String,
    },
    student: { // deprecated
        UTORid: {
            type: String,
            trim: true,
            lowercase: true
        },
        number: {
            type: String,
            trim: true
        }
    },
    UTORid: {
        type: String,
        trim: true,
        lowercase: true
    },
    studentNumber: {
        type: String,
        trim: true
    },
    teachingPoints: {
        type: Number,
        default: 0
    },
    name: {
        first: {
            type: String,
            set: first => _.startCase(first.toLowerCase())
        },
        last: {
            type: String,
            set: last => _.startCase(last.toLowerCase())
        }
    },
    roles: [{
        type: String,
        enum: ['admin', 'instructor', 'teachingAssistant', 'student']
    }]
}, {
    toJSON: {
        virtuals: true
    }
});
// get full name
UserSchema.virtual('name.full').get(function () {
    return _.defaultTo(this.name.first, '') + ' ' + _.defaultTo(this.name.last, '');
});
// pre-save hook
UserSchema.pre('save', function (next) {
    let self = this;
    // hash password if it is present and has changed
    if (self.local.password && self.isModified('local.password')) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) 
                return next(err);
            bcrypt.hash(self.local.password, salt, function (err, hash) {
                if (err) 
                    return next(err);
                self.local.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
// hook: delete cascade
UserSchema.pre('remove', function (next) {
    let self = this;
    async.series([
        done => {
            self.model('Course').update({
                $or: [
                    { instructors: { $in: [self._id] }},
                    { teachingAssistants: { $in: [self._id] }}, 
                    { students: { $in: [self._id] }}
                ]
            }, { 
                $pull: { instructors: self._id, teachingAssistants: self._id, students: self._id }
            }, {
                multi: true
            }).exec(done);
        },
        done => {
            self.model('Tutorial').update({
                $or: [{ teachingAssistants: { $in: [self._id] }}, { students: { $in: [self._id] }}]
            }, { 
                $pull: { teachingAssistants: self._id, students: self._id }
            }, {
                multi: true
            }).exec(done);
        },
        done => {
            self.model('Group').find().or([{
                members: { $in: [self._id] }
            }, {
                driver: self._id
            }]).exec(function (err, groups) {
                if (err) 
                    return done(err);
                async.eachSeries(groups, function (group, done) {
                    group.members.pull(self.id);
                    if (group.driver && group.driver.toString() === self.id)
                        group.driver = undefined; // unset
                    group.save(done);
                }, done);
            });
        }
    ], next);
});
// check password given is valid
UserSchema.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.local.password, callback);
};
// Check if user has given role
UserSchema.methods.hasRole = function (role) {
    return this.roles.indexOf(role) > -1;
};
// Check if user has any of the given roles
UserSchema.methods.hasAnyRole = function (roles) {
    return !!_.intersection(this.roles, roles).length;
};
// Find users 
UserSchema.statics.findAndCount = function (conditions, options, done) {
    let self = this;
    async.series([
        done => {
            self.find(conditions)
                .select(options.select)
                .sort(options.sort)
                .skip((options.page - 1) * options.perPage)
                .limit(options.perPage)
                .exec(done);
        },
        done => {
            self.count(conditions, done);
        }
    ], (err, data) => {
        if (err)
            return done(err);
        // build pages
        let pages = [], p, q;
        for (p = 1, q = _.ceil(data[1] / options.perPage) + 1; p < q; p++)
            if (p >= options.page - 2 && p <= options.page + 2)
                pages.push(p);
        done(null, ...data, pages);
    });
};

module.exports = mongoose.model('User', UserSchema);