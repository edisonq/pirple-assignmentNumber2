/*
* Shopping cart module
*/

// Dependencies
const _data = require('../lib/data');
const _tokens = require('./tokens')
const helpers = require('../lib/helpers');
const util = require('util')
const debug = util.debuglog('carts')

// handlers for menu
_carts = {}

// CREATE or add menu in cart using POST
// required: token in headers, item_id, item_qty, item_total_price email in header
// optional: 
_carts.post = (data, callback) => {
    // check if required fieds are filled
    let cartId = helpers.createRandomString(50);
    let expires = Date.now() + 1000 * 60 * 60 * 24;
    let email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false
    let itemId = typeof(data.payload.item_id) == 'string' && data.payload.item_id.trim().length >= 20 ? data.payload.item_id.trim() : false
    let itemQty = typeof(data.payload.item_qty) == 'number' && data.payload.item_qty > 0 ? data.payload.item_qty : false
    let itemTotalPrice = typeof(data.payload.item_total_price) == 'number' && data.payload.item_total_price > 0 ? data.payload.item_total_price : false
    let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false

    if (itemId && email && itemTotalPrice && itemQty) {
        // get the token from the headers
        //  get the token from the header
        
        // verify if the given token is valid for the phone number and belongs who added the cart
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            if (tokenIsValid) {
                // return check data
                let userObject = {
                    'cartId': cartId, 
                    'email': email,
                    'tokenId': tokenId,
                    'itemId': itemId,
                    'itemQty': itemQty,
                    'itemTotalPrice': itemTotalPrice,
                    'expires': expires
                }
                // store the user
                _data.create('carts',email+'-'+tokenId+'-'+cartId,  userObject, err => {
                    if (!err) {
                        callback(200, {'Error': false})
                    } else {
                        debug(err);
                        callback(500, {'Error': 'Could not add cart'})
                    }
                })
                // callback(200, userObject)
            } else {
                callback(403, {'Error': 'Missing token or invalid'})
            }
        })
    } else {
        debug(email,itemId,tokenId)
        callback(400, {'Error': 'Missing required input or invalid'})
    }
}

// READ or get all the content of the cart
// required: token in headers,  in headers
// optional: cart_id
// @TODO: remove duplicate return elements
_carts.get = (data, callback) => {
    // check if the id number is valid
    let email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false
    let cartId = typeof(data.queryStringObject.cart_id) == 'string' && data.queryStringObject.cart_id.trim().length >= 20 ? data.queryStringObject.cart_id.trim() : false
    const tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false

    if (email) {
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            if (tokenIsValid) {
                // required is valid
                
                if (cartId) {
                    // open just one cart_info
                    _data.read('carts', email+'-'+tokenId+'-'+cartId, (err, checkData) => {
                        if (!err && checkData) {
                            callback(200, checkData)    
                        } else {
                            debug(err)
                            callback(404, {'Error': 'Not found'});
                        }
                    })
                } else {
                    // show all cart specific to token and email
                    _data.list('carts', async (err, carts) => {
                        if(!err && carts && carts.length > 0){
                            const cartsSelected = carts.filter( cart => {
                                if ( cart.search(email+'-'+tokenId) > -1){
                                    debug(email+'-'+tokenId)
                                    return cart
                                } 
                            })
                            const cartsArray = cartsSelected.map(async menuId => {
                                return await _data.readPromise('carts', menuId)
                            });
                            const cartReturn = await Promise.all(cartsArray)
                            // get carts total
                            const totalpayment = cartReturn.reduce((total, items) =>  total+ items.itemTotalPrice ,0)

                            callback(200, {"total": totalpayment, cartReturn});
                        } else {
                            // nothing to return
                            callback(200)
                        }  
                    })
                }
            } else {
                debug(email)
                callback(403, {'Error': 'Mising or invalid header token'})
            }
        })
    } else {
        callback(403, {'Error': 'Email is required'})
    }
}

// inhouse check cart
_carts.inhouseGet = (data, callback) => {
    _data.list('carts', async (err, carts) => {
        if(!err && carts && carts.length > 0){
            const cartsSelected = carts.filter( cart => {
                if ( cart.search(data.email+'-'+data.tokenId) > -1){
                    debug(data.email+'-'+data.tokenId)
                    return cart
                }
            })
            const cartsArray = cartsSelected.map(async menuId => {
                return await _data.readPromise('carts', menuId)
            });
            const cartReturn = await Promise.all(cartsArray)
            // get carts total
            const totalpayment = cartReturn.reduce((total, items) =>  total+ items.itemTotalPrice ,0)

            // return error false
            // return content of cart
            debug(totalpayment)
            callback(false, {"total": totalpayment, cartReturn})
        } else {
            // cart empty error, true
            callback(true, {'error':'cart empty'})
        }  
    })
}

// UPDATE specific cart content
// required: token in headers, email in headers, cart_id
// optional: item_qty
_carts.put = (data, callback) => {
    // required check
    const tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false
    const email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false
    const cartId = typeof(data.payload.cart_id) == 'string' && data.payload.cart_id.trim().length > 3 ? data.payload.cart_id.trim() : false

    // optional
    let itemQty = typeof(data.payload.item_qty) == 'number' && data.payload.item_qty > 0 ? data.payload.item_qty : false
    let itemTotalPrice = typeof(data.payload.item_total_price) == 'number' && data.payload.item_total_price > 0 ? data.payload.item_total_price : false

    if (email && cartId) {
        // get the token from the headers
        //  get the token from the header
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            if (tokenIsValid) {
                _data.read('carts', email+'-'+tokenId+'-'+cartId, (err, cartData) => {
                    if (!err && cartData) {
                        // set expiration an hour from now
                        cartData.expires = Date.now() + 1000 * 60 * 60 * 24;
                             
                        // update the field
                        debug(itemQty)
                        if (itemQty) {
                            cartData.itemQty = itemQty
                        }
                        if (itemTotalPrice) {
                            cartData.itemTotalPrice = itemTotalPrice
                        }
                       
                        // store new update
                        _data.update('carts', email+'-'+tokenId+'-'+cartId, cartData, err => {
                            if (!err) {
                                callback(200, {'Error': false});
                            } else {
                                debug(err);
                                callback(500, {'Error': 'Could not update the user'})
                            }
                        })
                    } else {
                        callback(400, {'Error': 'The specified cart_id does not exist'})
                    }
                })
            } else  {
                debug(tokenId)
                callback(403, {'Error': 'Missing token or invalid'})
            }
        })
    } else {
        debug(tokenId, email, cartId, itemId, itemQty)
        callback(400, {'Error': 'Missing required input or invalid'})
    }
}


// delete specific cart
// required: token in headers, email in headers, cart_id
// optional:
_carts.delete = (data, callback) => {
    // required check
    // required check
    const tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false
    const email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false
    const cartId = typeof(data.payload.cart_id) == 'string' && data.payload.cart_id.trim().length >= 20 ? data.payload.cart_id.trim() : false

    if (email && cartId) {
        // get the token from the headers
        //  get the token from the header
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            if (tokenIsValid) {
                _data.delete('carts', email+'-'+tokenId+'-'+cartId, (err) => {
                    if (!err) {
                        callback(200, {'Error': false})
                    } else {
                        debug(email+'-'+tokenId+'-'+cartId)
                        debug(err)
                        callback(400, {'Error': 'The specified cart does not exist'})
                    }
                })
            } else {
                callback(403, {'Error': 'Missing token or invalid'})
            }
        })
    } else {
        debug(email,cartId,tokenId)
        callback(400, {'Error': 'Missing required input or invalid'})
    }
}


module.exports = _carts;