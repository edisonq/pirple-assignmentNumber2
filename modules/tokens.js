/***
 * Library  storing  and editng tokens
 */


// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');


//Handler for tokens
_tokens ={}

// LOGIN
//  method: post
//  path:   /tokens
//  payload:  (email* ,password*)
//  returns:    err/ token object
_tokens.post = function (data, callback) {
    var email = typeof (data.payload.email) == 'string' && data.payload.email.length > 0 && data.payload.email.indexOf('@') > -1 ? data.payload.email.trim() : false
    var password = typeof (data.payload.password) == 'string' ? data.payload.password.trim() : false

    if (email && password) {
        // Lookup the user who maches th specified email address
        _data.read('users', email,
            (err, userData) => {
                if (!err && userData) {

                    // hash the sent password and compare it to the password in the user object
                    var hashedPassword = helpers.hash(password)
                    if (hashedPassword == userData.hashedPassword) {

                        //if valid,create a new tocken with a random name.Set the expiration date one hour i the future
                        const tockenid = helpers.createRandomString(20);
                        const expires = Date.now() + 1000 * 60 * 60;

                        var tokenObject = {
                            'email': email,
                            'id': tockenid,
                            'expires': expires
                        }

                        // create a token
                        _data.create('tokens', tockenid, tokenObject, function (err) {
                            if (!err) {
                                callback(false, tokenObject);
                            } else {
                                callback(500, {
                                    'Error': 'Could not create the new tocken'
                                });
                            }
                        });

                    } else {
                        console.log(hashedPassword, userData.password)
                        callback(404, {
                            'Error': 'Password did not match specified user\'s stored password'
                        })
                    }

                } else {
                    callback(404,{
                        'Error': 'Could not find the specified user'
                    })
                }

            });

    } else {
        callback(400, {
            'Error': 'MIssing required field'
        })
    }
}

//  method: get
//  path:   /tokens
//  payload:  none
// qurystring params: id*
//  returns:    err /status codes/ token object
_tokens.get = function (data, callback) {

    // check that the email  provided is valid
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id : false;

    if (id) {

        _data.read('tokens', id, function (err, tokenData) {


            if (!err && tokenData) {

                callback(200, tokenData);

            } else {
                callback(400, {
                    'Error': 'Could not find specified email'
                });
            }

        });

    } else {
        callback(500, {
            'Error': 'Invalid email supplied'
        })
    }


}


//  method: put
//  path:   /tokens
//  payload:  id*,extend*
// qurystring params: none
//  returns:    err / status code
_tokens.put = function (data, callback) {
    var id = typeof (data.payload.id) == 'string' && data.payload.id.length == 20 ? data.payload.id.trim() : false;
    var extend = typeof (data.payload.extend) == 'booleans' && data.payload.extend == true ? true : false;

    // Lookup the token
    _data.read('read', id, function (err, tokenData) {

        if (!err && tokenData) {

            // check to make sure token isn't already expired

            if (tokenData.expires > Date.now()) {

                // set expiration an hour from now
                tokenData.expires = Date.now() + 1000 * 60 * 60;

                // store the new updates
                _data.update('tokens', id, tokenData, function (err) {

                    if (!err) {

                        callback(200);

                    } else {
                        callback(500, {
                            'Error': 'Could not update the token\'s expiration'
                        });
                    }

                })
            } else {
                callback(400, {
                    'Error': 'The Token has already expired, and can not be extended'
                });
            }

        } else {
            callback(400, {
                'Error': 'The specified token does not exist'
            });
        }


    });
}

// LOGOUT
//  method: delete
//  path:   /tokens
//  payload:  none
//  qurystring params: id*
//  returns:    err / status code
_tokens.delete = function (data, callback) {
    var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
    if (token) {
        _data.read('tokens', token, function (err, tokenData) {
            if (!err && tokenData) {
                _data.delete('tokens', token, function (err) {
                    if (!err) {
                        callback(200, {'Error': false});
                    } else {
                        callback('500', {
                            'Error': 'Error delete a file'
                        });
                    }
                });
            } else {
                callback(403, {
                    'Error': 'Not logged in'
                });
            }
        });
    } else {
        callback('Error', {
            'Error': 'Missing required field'
        });
    }
}

// verify if a given id  is valid for the user
// @TODO please require email later.
_tokens.verifyToken = function (id, email, callback) {
    _data.read('tokens', id, function (err, tokenData) {

        if (!err && tokenData) {
            if (tokenData.email === email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }

        } else {
            callback(false);
        }

    });
}


module.exports = _tokens;