/*
* Request handlers
*/

// dependencies
// const helpers = require('./helpers')
// const config = require('../config')
const _users = require('../modules/users')
const _tokens = require('../modules/tokens')
const _menus = require('../modules/menu')
const _carts = require('../modules/carts')
const _checkout = require('../modules/checkout')

// define the handlers
const handlers = {};

// users
handlers.users = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.includes(data.method) === true) {
        _users[data.method](data, callback)
    } else {
        callback(405)
    }
}

// tokens
handlers.tokens = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.includes(data.method) === true) {
        _tokens[data.method](data, callback)
    } else {
        callback(405)
    }
}

// menu
handlers.menu = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.includes(data.method) === true) {
        _menus[data.method](data, callback)
    } else {
        callback(405)
    }
}

// cart
handlers.cart = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.includes(data.method) === true) {
        _carts[data.method](data, callback)
    } else {
        callback(405)
    }
}

// authentication
// login or logout
handlers.login = (data, callback) => {
    let acceptableMethods = ['post'];

    if (acceptableMethods.includes(data.method) === true) {
        _tokens.post(data, callback)
    } else {
        callback(405)
    }
}

handlers.logout = (data, callback) => {
    let acceptableMethods = ['get'];

    if (acceptableMethods.includes(data.method) === true) {
        _tokens.delete(data, callback)
    } else {
        callback(405)
    }
}

// checkout
handlers.checkout = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.includes(data.method) === true) {
        _checkout[data.method](data, callback)
    } else {
        callback(405)
    }
}

handlers.ping = (data, callback) => callback(200);
handlers.notFound = (data, callback) => callback(404);
module.exports = handlers