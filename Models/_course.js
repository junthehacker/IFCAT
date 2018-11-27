const async = require('async'),
    config = require('../utils/config'),
    fs = require('fs-extra'),
    mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: 1, uppercase: 1 },
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
}, {
    timestamps: true
});
// Delete cascade
CourseSchema.pre('remove', function (next) {
    let self = this, path = `${config.uploadPath}/${self.id}`;
    async.series([
        // delete documents
        done => {
            self.model('Tutorial').find({ _id: { $in: self.tutorials }}, (err, docs) => {
                if (err)
                    return done(err);
                async.eachSeries(docs, (doc, done) => doc.remove(done), done);
            });
        },
        done => {
            self.model('Quiz').find({ _id: { $in: self.quizzes }}, (err, docs) => {
                if (err)
                    return done(err);
                async.eachSeries(docs, (doc, done) => doc.remove(done), done);
            });
        },
        done => {
            self.model('File').find({ _id: { $in: self.files }}, (err, docs) => {
                if (err)
                    return done(err);
                async.eachSeries(docs, (doc, done) => doc.remove(done), done);
            });
        },
        // delete upload directory and its files
        done => {
            fs.stat(path, (err, stats) => {
                if (err && err.code === 'ENOENT')
                    done();
                else if (err)
                    done(err);
                else if (stats.isDirectory())
                    fs.remove(path, done);  
                else
                    done();
            });
        }
    ], next);
});
// Populate instructors
CourseSchema.methods.withInstructors = function () {
    return this.populate({
        path: 'instructors',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Populate teaching assistants
CourseSchema.methods.withTeachingAssistants = function () {
    return this.populate({
        path: 'teachingAssistants',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Populate students
CourseSchema.methods.withStudents = function () {
    return this.populate({ 
        path: 'students', 
        options: { 
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Populate tutorials
CourseSchema.methods.withTutorials = function (deep = false) {
    let obj = {
        path: 'tutorials',
        options: {
            sort: { number: 1 }
        }
    };
    if (deep) {
        obj.populate = {
            path: 'teachingAssistants', 
            options: { 
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        };
    }
    return this.populate(obj);
};
// Populate quizzes
CourseSchema.methods.withQuizzes = function () {
    return this.populate({
        path: 'quizzes', 
        options: {
            sort: { name: 1 }
        }
    });
};
// Populate files
CourseSchema.methods.withFiles = function () {
    return this.populate({ 
        path: 'files', 
        options: {
            sort: { name: 1 }
        }
    });
};
// Check if instructor belongs to course
CourseSchema.methods.hasInstructor = function (userId) {
    return this.instructors.indexOf(userId) > -1;
};
// Check if teaching assistant belongs to course
CourseSchema.methods.hasTA = function (userId) {
    return this.teachingAssistants.indexOf(userId) > -1;
};
// Check if student belongs to course
CourseSchema.methods.hasStudent = function (userId) {
    return this.students.indexOf(userId) > -1;
};

module.exports = mongoose.model('Course', CourseSchema);