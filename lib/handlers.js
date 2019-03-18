/*
* Request handlers
*/
// dependencies
// const helpers = require('./helpers')
// const config = require('../config')
const _users = require('../modules/users')
const _tokens = require('../modules/tokens')

// define the handlers
const handlers = {};


// users
handlers.users = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.includes(data.method) > -1) {
        _users[data.method](data, callback)
    } else {
        callback(405)
    }
}

// tokens
handlers.tokens = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.includes(data.method) > -1) {
        _tokens[data.method](data, callback)
    } else {
        callback(405)
    }
}

handlers.ping = (data, callback) => callback(200);
handlers.notFound = (data, callback) => callback(404);
module.exports = handlers