/*
* users module
*/

// Dependencies
const _data = require('../lib/data')
const _tokens = require('./tokens')
const helpers = require('../lib/helpers')
const util = require('util')
const debug = util.debuglog('users')

//define handler for users
_users ={}

// create or post
// required data: userid, firstName, lastName, address, email, password, tosAgreement
_users.post = (data, callback) => {
    // check if required fieds are filled
    let userId = helpers.createRandomString(20);
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    let address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 3 ? data.payload.address.trim() : false
    let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 3 ? data.payload.email.trim() : false
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

    if (firstName && lastName && email && address  && password && tosAgreement) {
        // user doesn't exist
        _data.read('users', email, (err, data) => {
            if (err) {
                // hash the password using builti
                let hashedPassword =  helpers.hash(password);

                // create user object
                if (hashedPassword) {
                    let userObject = {
                        'id': userId,
                        'firstName': firstName,
                        'lastName': lastName,
                        'address': address,
                        'email': email,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': tosAgreement
                    }
                    
                    // store the user
                    _data.create('users',email,  userObject, err => {
                        if (!err) {
                            callback(200, {'Error': false})
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not create the new user'})
                        }
                    })
                } else {
                    callback(500, {'Error': 'Could not hash user'})
                }
            } else {
                //user already exist
                callback(400, {'Error': 'A user with that email already exist'})
            }
            
        })
    } else {
        console.log(firstName,lastName,address,email,password,tosAgreement)
        callback(400, {'Error': 'Missing required fields'})
    }
}

// read or get 
// required: email in header, token in header
_users.get = (data,callback)=>{
    // check if the email number is valid
    const email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false
    if (email) {
        //  get the token from the header
        let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false

        // verify if the given token is valid for the email number
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            if (tokenIsValid) {
                // lookup the user
                _data.read('users', email,(err, data) => {
                    if (!err && data) {
                        // remove the hash password before display/returning
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                      callback(404);
                    }
                })
            } else {
                callback(403, {'Error': 'Missing  require token header, or token is invalid'})
            }
        })        
    } else {
        console.log(email);
        callback(400, {'Error': 'Missing required field'})
    }
}

// put
// required data: email
// optional data: firstName, lastName, password (at least one must be specified)
_users.put = (data,callback) => {
    // required
    const email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 1 ? data.headers.email.trim() : false

    // optional
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    let address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 3 ? data.payload.address.trim() : false
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    // error is email is invalid
    if (email){
        if (firstName || lastName || password || address) {
            //  get the token from the header
            let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false

            // verify if the given token is valid for the email number
            _tokens.verifyToken(tokenId, email, tokenIsValid => {
                if (tokenIsValid) {
                    _data.read('users', email, (err, userData) => {
                        if (!err && userData) {
                            // update the field
                            if (firstName) {
                                userData.firstName = firstName
                            }
                            if (lastName) {
                                userData.lastName = lastName
                            }
                            if (password) {
                                userData.hashedPassword = helpers.hash(password)
                            }
                            // store new updat
                            _data.update('users', email, userData, err => {
                                if (!err) {
                                    callback(200, {'Error': false});
                                } else {
                                    console.log(err);
                                    callback(500, {'Error': 'Could not update the user'})
                                }
                            })
                        } else {
                            callback(400, {'Error': 'The specified user does not exist'})
                        }
                    })
                } else {
                    callback(403, {'Error': 'Missing  require token header, or token is invalid'})
                }
            })
        } else {
            callback(400, {'Error': 'Missing field update'})
        }
    } else {
        console.log(email)
        callback(400, {'Error': 'Missing required field'})
    }
}

// delete
// required: email, token in headers
_users.delete = (data,callback) => {
    // required
    const email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 3 ? data.payload.email.trim() : false
    let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false
    
    if (email) {    
        // verify if the given token is valid for the email number
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            if (tokenIsValid) {
                _data.read('users', email, (err, userData) => {
                    if (!err && userData) {
                        _data.delete('users', email, (err) => {
                            if (!err) {
                                // deleted all the data associated with the user.
                               
                            } else {
                                callback(500, {'Error': 'Could not delete the specified user'})
                            }
                        })
                    } else {
                        callback(400, {'Error':'Could not find the specified user'})
                    }
                })
            } else {
                debug(tokenId, email)
                callback(403, {'Error': 'Missing  require token header, or token is invalid'})
            }
        })
    } else {
        console.log(email)
        callback(400, {'Error': 'Missing required field'})
    }
}

module.exports = _users;