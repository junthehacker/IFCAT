const config = require('../utils/config').ia;

function getIAServiceProvider() {
    return require('../providers/IAServiceProvider');
}

class User {
    constructor(user) {
        this.user = user;
    }

    getId() {
        return this.user._id;
    }

    getUsername() {
        return this.user.username;
    }

    // isStudent() {
    //     return this.user.groups.indexOf(config.studentGroup) > -1;
    // }

    isAdmin() {
        return this.user.groups.indexOf(config.adminGroup) > -1;
    }

    isInstructor() {
        return this.user.groups.indexOf(config.instructorGroup) > -1;
    }

    isTA() {
        return this.user.groups.indexOf(config.taGroup) > -1;
    }

    canAccessAdminPanel() {
        return this.isAdmin() || this.isInstructor() || this.isTA();
    }

    /**
     * Get all courses enrolled by this user
     * @returns {Promise<any>}
     */
    getCourses() {
        return new Promise((resolve, reject) => {
            getIAServiceProvider()
                .runGetRequest(`${config.root}/api/users/${this.user._id}/courses`)
                .then(data => {
                    resolve(require('./Course').createList(data));
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    /**
     * Get one course by ID
     * @param id
     * @returns {Promise<any>}
     */
    getCourse(id) {
        return new Promise((resolve, reject) => {
            this.getCourses()
                .then(courses => {
                    let result = null;
                    // Loop through and try to get one matching course
                    courses.some(course => {
                        if(course.getId() === id) {
                            result = course;
                            return true;
                        }
                    });
                    resolve(result);
                })
                .catch(e => reject(e));
        })
    }
}

module.exports = User;