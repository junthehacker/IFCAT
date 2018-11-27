// IA Model for a course

const config = require('../Utils/config').ia;

function getIAServiceProvider() {
    return require('../providers/IAServiceProvider');
}

module.exports = class Course {
    constructor(course) {
        this.course = course;
        this.quizzes = [];
        this.tutorials = [];
        this.files = [];
    }

    static createList(courses) {
        let result = [];
        courses.forEach(course => {
            result.push(new Course(course));
        });
        return result;
    }

    getDisplayName() {
        return this.course.courseDisplayName;
    }

    getCode() {
        return this.course.courseName;
    }

    getId() {
        return this.course._id;
    }

    getQuizzes() {
        return this.quizzes;
    }

    getTutorials() {
        return this.tutorials;
    }

    getFiles() {
        return this.files;
    }

    getTutorialsEnrolledByUser(user) {
        return new Promise((resolve, reject) => {
            getIAServiceProvider()
                .runGetRequest(`${config.root}/api/users/${user.getId()}/courses/${this.getId()}/tutorials`)
                .then(data => {
                    resolve(require('./RemoteTutorial').createList(data));
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    /**
     * Fill the course with tutorials
     * @returns {Promise<any>}
     */
    fillTutorials() {
        return new Promise(resolve => {
            getIAServiceProvider()
                .runGetRequest(`${config.root}/api/courses/${this.getId()}/tutorials`)
                .then(data => {
                    this.tutorials = require('./RemoteTutorial').createList(data);
                    resolve();
                })
                .catch(() => resolve());
        })
    }

    /**
     * Fill the course with quizzes
     * @returns {Promise<any>}
     */
    fillQuizzes() {
        return new Promise(resolve => {
            require('./Quiz').find({courseId: this.getId()})
                .then(quizzes => {
                    this.quizzes = quizzes;
                    resolve();
                })
                .catch(() => resolve());
        });
    }

    /**
     * Fill the course with files
     * @returns {Promise<any>}
     */
    fillFiles() {
        return new Promise(resolve => {
            require('./File').find({courseId: this.getId()})
                .then(files => {
                    this.files = files;
                    resolve();
                })
                .catch(() => resolve());
        })
    }

};