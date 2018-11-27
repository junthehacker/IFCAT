/*------------------------------------
Routes for guests and authentication callbacks

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

const DashboardController = require('../Controllers/Guest/DashboardController');
const LoginController     = require('../Controllers/Guest/LoginController');
const LogoutController    = require('../Controllers/Guest/LogoutController');


let dashboardController = DashboardController.getInstance();
let loginController     = LoginController.getInstance();
let logoutController    = LogoutController.getInstance();
let router              = require('express').Router();

router.get('/', dashboardController.getHome);
router.get('/login', loginController.login);
router.get('/logout', logoutController.logout);

module.exports = router;
