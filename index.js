/*
* Primary file of the API
*
*/

// dependencies
const server = require('./lib/server')
const workers = require('./lib/workers')

// declare the app
const app = {}

// initialization
app.init = () => {
    // start server
    server.init();

    // start the workers
    workers.init();
}

// execute function
app.init();

// export the app
module.exports = app