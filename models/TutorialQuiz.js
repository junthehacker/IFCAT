/*------------------------------------
Local mongoose model that links a quiz
instance to a remote tutorial from I.A.

Author(s): Jun Zheng [me at jackzh dot com]
           Neeilan Selvalingam
-------------------------------------*/

// Dependencies
const _        = require('lodash');
const async    = require('async');
const mongoose = require('mongoose');

// Service providers
const IAServiceProvider = require('../providers/IAServiceProvider');

// Mongoose schema
const tutorialQuizSchema = new mongoose.Schema({
    tutorialId: String,
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    // whether members will be automatically placed into groups or manually pick their groups
    allocateMembers: {
        type: String,
        enum: ['automatically', 'self-selection'],
        default: 'automatically'
    },
    maxMembersPerGroup: { type : Number, default: 4 },
    // make quiz visible to students
    published: Boolean,
    // allow students to do quiz
    active: Boolean,
    // allow students to see their quiz results
    archived: Boolean
}, {
    timestamps: true
});

// Virtual for populated tutorial from remote
tutorialQuizSchema.virtual('tutorial').get(function () {
    return this._tutorial;
}).set(function (v) {
    this._tutorial = v;
});


// Populate students
tutorialQuizSchema.methods.withStudents = function () {
    return this.populate({
        path: 'tutorial.students',
        model: this.model('User'),
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};

// Populate groups
tutorialQuizSchema.methods.withGroups = function () {
    return this.populate({
        path: 'groups',
        model: this.model('Group'),
        populate: [{
            path: 'members',
            model: this.model('User'),
            options: {
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        }, {
            path: 'driver'
        }]
    });
};

/**
 * Get all tutorials quizzes that is associated with a quiz
 * @param quiz
 * @returns {Promise<any>}
 */
tutorialQuizSchema.statics.getAllAssociatedWithQuiz = function(quiz) {
    return new Promise((resolve, reject) => {
        this.find({quiz: quiz._id})
            .then(quizzes => {
                resolve(quizzes);
            })
            .catch(e => {
                reject(e);
            })
    })
};

/**
 * Populate the tutorial field from API
 * @returns {Promise<any>}
 */
tutorialQuizSchema.methods.fillTutorialFromRemote = function() {
    return new Promise((resolve, reject) => {
        IAServiceProvider.getAllTutorials()
            .then(tutorials => {
                // Loop through all tutorials and find the correct one
                tutorials.forEach(tutorial => {
                    if(tutorial.getId() === this.tutorialId) {
                        this.set('tutorial', tutorial);
                    }
                });
                resolve();
            })
            .catch(e => {
                reject(e);
            })
    })
};

tutorialQuizSchema.statics.findAndCount = function (conditions, options, done) {
    let self = this;
    async.series([
        done => {
            self.aggregate([{
                $match: conditions
            }, {
                $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quiz' }
            }, {
                $unwind: '$quiz'
            }, {
                $lookup: { from: 'tutorials', localField: 'tutorial', foreignField: '_id', as: 'tutorial' }
            }, {
                $unwind: '$tutorial'
            }, {
                $project: { quiz: 1, tutorial: 1, published: 1, active: 1, archived: 1 }
            }, {
                $sort: { 'quiz.name': 1, 'tutorial.number': 1 }
            }, {
                $skip: (options.page - 1) * options.perPage
            }, {
                $limit: options.perPage
            }], done);
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

module.exports = mongoose.model('TutorialQuiz', tutorialQuizSchema);
