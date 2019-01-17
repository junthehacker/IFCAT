const _ = require('../Utils/lodash.mixin'),
    async = require('async'),
    mongoose = require('mongoose'),
    url = require('url');
const QuestionSchema = new mongoose.Schema({
    number: String,
    type: { type: String, enum: ['multiple choice', 'multiple select', 'short answer', 'code tracing'] },
    question: { type: String, required: true },
    code: String,
    choices: [String],
    answers: [String],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    links: [String],
    tags: [String],
    caseSensitive: Boolean,
    maxPointsPerLine: Number,
    maxAttemptsPerLine: Number,
    immediateFeedbackDisabled: Boolean,
    shuffleChoices: Boolean,
    useLaTeX: Boolean,
    points: Number,
    firstTryBonus: Number,
    penalty: Number,
    submitter: String,
    approved: Boolean,
    votes: {
        up: [String],
        down: [String]
    }
}, {
    timestamps: true,
    usePushEach: true
});
// Get total number of votes
QuestionSchema.virtual('votes.length').get(function () {
    return this.votes.up.length + this.votes.down.length;
});
// Get voting score
QuestionSchema.virtual('votes.score').get(function () {
    return _.lowerBound(this.votes.up.length, this.votes.length);
});
// Delete cascade
QuestionSchema.pre('remove', function (next) {
    let self = this;
    async.parallel([
        done => self.model('Quiz').update({ questions: { $in: [self._id] }}, { $pull: { questions: self._id }}, done),
        done => self.model('Response').remove({ question: self._id }, done)
    ], next);
});
// Populate files
QuestionSchema.methods.withFiles = function () {
    return this.populate({ path: 'files', options: { sort: { name: 1 }}});
};
// Check if question is a multiple choice question
QuestionSchema.methods.isMultipleChoice = function () {
    return this.type === 'multiple choice';
};
// Check if question is a multiple select question
QuestionSchema.methods.isMultipleSelect = function () {
    return this.type === 'multiple select';
};
// Check if question is a short answer question
QuestionSchema.methods.isShortAnswer = function () {
    return this.type === 'short answer';
};
// Check if question is a code tracing question
QuestionSchema.methods.isCodeTracing = function () {
    return this.type === 'code tracing';
};
// Check if question has file with given ID
QuestionSchema.methods.hasFile = function (id) {
    return this.files.indexOf(id) > -1;
};
// Check if given choice is one of the answers
QuestionSchema.methods.isAnswer = function (choice) {
    return this.answers.indexOf(choice) > -1;
};

/**
 * Create the question
 * @param opts
 * @returns {mongoose.Schema.methods}
 */
QuestionSchema.methods.store = function (opts) {
    let self = this;

    self.links = self.choices = self.answers = self.tags = [];
    self.caseSensitive = !!opts.caseSensitive;
    self.shuffleChoices = !!opts.shuffleChoices;
    self.useLaTeX = !!opts.useLaTeX;
    self.approved = !!opts.approved;
    self.set(opts);

    if (opts._links)
        _.each(opts._links, link => {
            if (link = link.trim()) {
                if (!url.parse(link).protocol)
                    link = `http://${link}`;
                self.links.addToSet(link);
            }
        });

    if (opts._tags)
        _.each(opts._tags.split(/[,;]/g), tag => {
            if (tag = _.kebabCase(tag))
                self.tags.addToSet(tag);
        });

    let selected;
    if (self.isMultipleChoice()) {
        _.forOwn(opts._choices, (choice, i) => {
            choice = choice.trim();
            if (choice && self.choices.indexOf(choice) === -1) {
                self.choices.push(choice);
                if (i === opts._answer)
                    self.answers = [choice];
            }
        });
    } else if (self.isMultipleSelect()) {
        selected = _.isObject(opts._answers) ? opts._answers : [];
        _.forOwn(opts._choices, (choice, i) => {
            choice = choice.trim();
            if (choice && self.choices.indexOf(choice) === -1) {
                self.choices.push(choice);
                if (selected.indexOf(i) > -1)
                    self.answers.push(choice);
            }
        });
    } else if (self.isShortAnswer()) {
        _.forOwn(opts._answers, answer => {
            if (answer = answer.trim())
                self.answers.addToSet(answer);
        });
    } else if (self.isCodeTracing()) {
        self.answers = opts._answers.trim().split(/\r?\n/);
        self.points = self.maxPointsPerLine * self.answers.length + self.firstTryBonus;
        self.immediateFeedbackDisabled = !!opts.immediateFeedbackDisabled;
    }
    return self;
};

module.exports = mongoose.model('Question', QuestionSchema);