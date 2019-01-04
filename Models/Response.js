const mongoose = require('mongoose');
const ResponseSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref : 'Question' },
    group: { type: mongoose.Schema.Types.ObjectId, ref : 'Group' },
    attempts: { type : Number, default: 0 },
    lineByLineSummary: [{ attempts : { type : Number, default : 1 }, correct : Boolean, value : String, answerProvided : Boolean }],
    codeTracingAnswers: [String],
    answer: [String],
    correct: Boolean,
    points: Number
}, {
    timestamps: true
});
// Check if given choice is one of the answers
ResponseSchema.methods.isAnswer = function (choice) {
    return this.answer && this.answer.indexOf(choice) > -1;
};

module.exports = mongoose.model('Response', ResponseSchema);