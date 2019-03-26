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
    'cart': handlers.cart,
    'checkout': handlers.checkout
};

// @TODO
// login
// logout
// cart
// checkout
    // stripe
    // mailgun

module.exports = router;