const config               = require('../Utils/config').ia;
const getIAServiceProvider = () => require('../Providers/IAServiceProvider');

module.exports = class RemoteTutorial {
    constructor(tutorial) {
        this.tutorial = tutorial;
        this.students = [];
    }

    static createList(tutorials) {
        let result = [];
        tutorials.forEach(tutorial => {
            result.push(new RemoteTutorial(tutorial));
        });
        return result;
    }

    getId() {
        return this.tutorial._id;
    }

    getDisplayName() {
        return this.tutorial.courseDisplayName;
    }

    getStudents() {
        return this.students;
    }

    /**
     * Fill students field from remote
     * @returns {Promise<void>}
     */
    async fillStudentsFromRemote() {
        this.students = await getIAServiceProvider().runGetRequest(`${config.root}/api/tutorials/${this.getId()}/students`);
        this.students = require('./RemoteUser').createList(this.students);
    }

};
