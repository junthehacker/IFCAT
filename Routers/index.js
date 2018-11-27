/*------------------------------------
Exposes all routers, routers can simply
used by doing app.use('path', router)

Author(s): Jun Zheng [me at jackzh dot com]
-------------------------------------*/

exports.GuestRouter   = require('./GuestRouter');
exports.StudentRouter = require('./StudentRouter');
exports.AdminRouter   = require('./AdminRouter');
