/*
* Routes
*/

// Dependencies
const  handlers = require('./handlers');

// Define a request router
const  router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'login': handlers.login,
    'logout': handlers.logout,
    'menu': handlers.menu,
    'order': handlers.order,
    'checkout': handlers.checkout
};

module.exports = router;