const config               = require('../utils/config').ia;
const getIAServiceProvider = () => require('../providers/IAServiceProvider');

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
        console.log(this.getId());
        this.students = await getIAServiceProvider().runGetRequest(`${config.root}/api/tutorials/${this.getId()}/students`);
        console.log(this.students);
    }

};
