/*
* Worker-related tasks
*/


// dependencies
const util = require('util')
const debug = util.debuglog('workers')

// instatiate the worker object
const workers = {};

workers.loop = () => {
    setInterval(()=> {
        debug('a minute had passed')
    }, 1000*60)
}


// init
// @TODO:
// delete expired token
// delete expired cart
workers.init = () => {
    // send to console, in yello
    console.log('\x1b[33m%s\x1b[0m','Background workers are running')

    // call the loop checks
    workers.loop();

}

module.exports = workers;