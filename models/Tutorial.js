module.exports = class Tutorial {
    constructor(tutorial) {
        this.tutorial = tutorial;
        this.students = [];
    }

    static createList(tutorials) {
        let result = [];
        tutorials.forEach(tutorial => {
            result.push(new Tutorial(tutorial));
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

    fillStudentsFromRemote() {

    }

};
