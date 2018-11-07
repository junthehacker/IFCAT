const config = require('../utils/config').ia;
const _axios = require('axios');
const https = require('https');
const axios = _axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

module.exports = class IAServiceProvider {
    /**
     * Get an user by token
     * @param token
     * @returns {*}
     */
    static getUserByToken(token) {
        return new Promise((resolve, reject) => {
            axios.get(`${config.root}/api/auth_tokens/${token}`, {
                headers: {
                    authorization: `Bearer ${config.secretKey}`
                }
            }).then(data => {
                resolve(new (require('../models/User'))(data.data.user));
            }).catch(e => {
                reject(e);
            })
        })
    }

    /**
     * Get login URL
     * @returns {string}
     */
    static getLoginUrl() {
        return config.root + "/login?id=" + config.applicationId;
    }

    /**
     * Get list of courses
     * @returns {Promise<any>}
     */
    static getAllCourses() {
        return new Promise((resolve, reject) => {
            axios.get(`${config.root}/api/courses`, {
                headers: {
                    authorization: `Bearer ${config.secretKey}`
                }
            }).then(data => {
                resolve(require('../models/Course').createList(data.data));
            }).catch(e => {
                reject(e);
            })
        })
    }

    /**
     * Get list of tutorials
     * @returns {Promise<any>}
     */
    static getAllTutorials() {
        return new Promise((resolve, reject) => {
            axios.get(`${config.root}/api/tutorials`, {
                headers: {
                    authorization: `Bearer ${config.secretKey}`
                }
            }).then(data => {
                resolve(require('../models/Tutorial').createList(data.data));
            }).catch(e => {
                reject(e);
            })
        })
    }

    /**
     * Get one tutorial or fail
     * @param id
     * @returns {Promise<any>}
     */
    static getTutorialByIdOrFail(id) {
        return new Promise((resolve, reject) => {
            this.getAllTutorials()
                .then(tutorials => {
                    let tutorial;
                    tutorials.some(_tutorial => {
                        if(_tutorial.getId() === id) {
                            tutorial = _tutorial;
                            return true;
                        }
                    });
                    if(tutorial) {
                        resolve(tutorial);
                    } else {
                        throw new Error("Tutorial not found.");
                    }
                })
                .catch(e => {
                    reject(e);
                })
        })
    }

    /**
     * Run a new get request
     * @param url
     * @returns {Promise<any>}
     */
    static runGetRequest(url) {
        return new Promise((resolve, reject) => {
            axios.get(url, {
                headers: {
                    authorization: `Bearer ${config.secretKey}`
                }
            }).then(data => {
                resolve(data.data);
            }).catch(e => {
                reject(e);
            })
        })
    }
};
