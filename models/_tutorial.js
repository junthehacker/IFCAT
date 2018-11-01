const _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose');
const TutorialSchema = new mongoose.Schema({
    number: { type: String, required: true, alias: 'name' },
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});
// Populate tutorials-quizzes
TutorialSchema.virtual('tutorialQuizzes', { ref: 'TutorialQuiz', localField: '_id', foreignField: 'tutorial' });
// Delete cascade
TutorialSchema.pre('remove', function (next) {
    let self = this;
    async.parallel([
        done => self.model('Course').update({ tutorials: { $in: [self._id] }}, { $pull: { tutorials: self._id }}, { multi: true }, done),
        done => self.model('TutorialQuiz').remove({ tutorial: self._id }, done)
    ], next);
});
// Populate students
TutorialSchema.methods.withStudents = function () {
    return this.populate({ 
        path: 'students',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Check if student belongs to tutorial
TutorialSchema.methods.hasStudent = function (userId) {
    return this.students.indexOf(userId) > -1;
};
// Check if teaching assistant belongs to tutorial
TutorialSchema.methods.hasTA = function (userId) {
    return this.teachingAssistants.indexOf(userId) > -1;
};

module.exports = mongoose.model('Tutorial', TutorialSchema);