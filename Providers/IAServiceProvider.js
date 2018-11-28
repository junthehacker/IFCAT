/*------------------------------------
Service provider for I.A. exposes useful
methods to interact with the API.
Supports I.A. v0.3

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const config = require('../Utils/config').ia;
const _axios = require('axios');
const https = require('https');

// Configure axios to accept self-signed certificates in development environment
let axios;
if (process.env.NODE_ENV === 'development') {
    axios = _axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
} else {
    axios = _axios;
}

/**
 * Service provider for I.A. API, all members are static, you don't have to create a new instance.
 * @hideconstructor
 */
class IAServiceProvider {

    /**
     * Get default axios configuration
     * @returns {{headers: {authorization: string}}}
     */
    static get defaultAxiosConfig() {
        return {
            headers: {
                authorization: `Bearer ${config.secretKey}`
            }
        };
    };

    /**
     * Get an user by authentication token.
     * @param {string} token Authentication token to use.
     * @returns {Promise<User>} User obtained from token.
     */
    static async getUserByToken(token) {
        let data = await axios.get(`${config.root}/api/auth_tokens/${token}`, IAServiceProvider.defaultAxiosConfig);
        return new (require('../Models/RemoteUser'))(data.data.user);
    }

    /**
     * Get login URL.
     * @returns {string} Login URL.
     */
    static getLoginUrl() {
        return (config.publicRoot || config.root) + "/login?id=" + config.applicationId;
    }

    /**
     * Get logout URL.
     * @returns {string} Logout URL.
     */
    static getLogoutUrl() {
        return (config.publicRoot || config.root) + "/logout";
    }

    /**
     * Get list of courses within the system.
     * @returns {Promise<Course[]>} List of courses.
     */
    static async getAllCourses() {
        let data = await axios.get(`${config.root}/api/courses`, IAServiceProvider.defaultAxiosConfig);
        return require('../Models/Course').createList(data.data);
    }

    /**
     * Get list of tutorials within the system.
     * @returns {Promise<Tutorial[]>} List of tutorials.
     */
    static async getAllTutorials() {
        let data = await axios.get(`${config.root}/api/tutorials`, IAServiceProvider.defaultAxiosConfig);
        return require('../Models/RemoteTutorial').createList(data.data);
    }

    /**
     * Get one tutorial by ID, throws an exception if not found.
     * @param {string} id ID to find.
     * @throws Error Thrown when tutorial is not found.
     * @returns {Promise<Tutorial>} Tutorial with ID specified.
     */
    static async getTutorialByIdOrFail(id) {
        let tutorials = await this.getAllTutorials();
        let tutorial;
        tutorials.some(_tutorial => {
            if (_tutorial.getId() === id) {
                tutorial = _tutorial;
                return true;
            }
        });
        if (tutorial) return tutorial;
        else throw new Error("Tutorial not found.");
    }

    /**
     * Run a new get request on API.
     * @param {string} url Relative URL to use.
     * @returns {Promise<any>} Request response data.
     */
    static async runGetRequest(url) {
        let data = await axios.get(url, IAServiceProvider.defaultAxiosConfig);
        return data.data;
    }
}

module.exports = IAServiceProvider;

