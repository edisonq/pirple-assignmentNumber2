/*
* CHECKOUT library here
*/

// dependencies
const _data = require('../lib/data')
const _carts = require('../modules/carts')
const helpers = require('../lib/helpers')
const _tokens = require('../modules/tokens')
const util = require('util')
const debug = util.debuglog('checkout')

// define the handlers
let _checkout = {}


// CHECKOUT of the cart
// required: token in header, token in email, content in cart, amount,
// optional: 
_checkout.post = (data, callback) => {
    // required
    let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false
    let email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false
    let number = typeof(data.payload.number) == 'string' && data.payload.number.trim().length >= 16 ? data.payload.number.trim() : false
    let exp_month = typeof(data.payload.exp_month) == 'string' && data.payload.exp_month.trim().length >= 2 ? data.payload.exp_month.trim() : false
    let exp_year = typeof(data.payload.exp_year) == 'string' && data.payload.exp_year.trim().length >= 4 ? data.payload.exp_year.trim() : false
    let cvc = typeof(data.payload.cvc) == 'string' && data.payload.cvc.trim().length >= 3 ? data.payload.cvc.trim() : false   

    let amount = typeof(data.payload.amount) == 'number' && data.payload.amount >= 1 ? data.payload.amount : false
    let currency = typeof(data.payload.currency) == 'string' && data.payload.currency.trim().length >= 1 ? data.payload.currency.trim() : "usd"
    let description = typeof(data.payload.description) == 'string' && data.payload.description.trim().length >= 1 ? data.payload.description.trim() : false

    if (tokenId && email) {
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            const paymentDetailsData = {
                'cardNumber': number,
                'cardExpMonth' : exp_month,
                'cardExpYear': exp_year,
                'cardCvc' : cvc,
                'amount': amount,
                'currency': currency,
                'description': 'charge for '+email+' .'+ description,
                'email': email
            }

            if (tokenIsValid) {
                helpers.createStripeToken(paymentDetailsData, (err, stripeData) => {
                    if (!err && stripeData) {
                        // verify if cart has content
                        // return error if no content
                        const cartInformation = {
                            "email": email,
                            "tokenId": tokenId
                        }
                        _carts.inhouseGet(cartInformation, (err, message) => {
                            if (!err && message) {
                                // continue charging the card
                                paymentDetailsData.source = stripeData.id
                                paymentDetailsData.amount = message.total
                                debug(paymentDetailsData)
                                
                                if (paymentDetailsData.amount && paymentDetailsData.description) {
                                    helpers.chargeCardStripe(paymentDetailsData, async (err, data) =>  {
                                        if (!err) {
                                            // save order in .data/orders
                                            // save this information below in database including the order
                                            paymentDetailsData.receiptUrl = data.receipt_url
                                            const orderInformation = []
                                            orderInformation.receiptUrl = data.receiptUrl
                                            orderInformation.items = message
                                            _checkout.addOrder(orderInformation, (err, orderInformation) => {
                                                if (!err) {
                                                    paymentDetailsData.orderId = orderInformation.orderId,        
                                                    helpers.email(paymentDetailsData, (err, data) => {
                                                        if (!err) {
                                                            debug(data)
                                                            callback(200, {"error": false, "orderId": paymentDetailsData.orderId})
                                                        } else {
                                                            debug(data)
                                                            callback(200, {
                                                                "warning": true,
                                                                "email_error": data
                                                            })
                                                        }
                                                    })
                                                } else {
                                                    callback(500, {'error': err})
                                                }
                                            })                                            
                                        } else {
                                            debug(err, data)
                                            callback(402, data)
                                        }
                                    })
                                } else {
                                    debug(data)
                                    callback(403, {'error': 'required field missing or invalid'})
                                }  
                            } else {
                                callback(400, {"error": "unable to access cart"})
                            }
                        })

                                              
                    } else {
                        debug(err, stripeData)
                        callback(402, err)
                    }
                });
            } else {
                callback(403, {'Error': 'token invalid'})
            }
        })
    } else {
        callback(403, {'Error': 'Missing token'})
    }
}

_checkout.addOrder = (data, callback) => {
    const orderInformation = {
        "orderId": helpers.createRandomString(20),
        "items": data.items
    };

    // create a token
    _data.create('orders', orderInformation.orderId, orderInformation, function (err) {
        if (!err) {
            callback(false, orderInformation);
        } else {
            callback(true, {
                'error': 'unable to add cart'
            });
        }
    });
}

module.exports = _checkout;