/*------------------------------------
Controller for login actions.

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const Controller        = require('../Controller');
const passport          = require('passport');
const IAServiceProvider = require('../../providers/IAServiceProvider');
const getAbsUrl         = require('../../Utils/getAbsUrl');

/**
 * Controller singleton for login actions.
 * @extends Controller
 * @memberOf Controller.GuestController
 */
class LoginController extends Controller {

    /**
     * Get login action.
     */
    get login() {
        return passport.authenticate('ia-auth', {
            successRedirect: getAbsUrl('/'),
            failureRedirect: IAServiceProvider.getLoginUrl()
        })
    }

}

module.exports = LoginController;
