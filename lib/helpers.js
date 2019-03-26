/*
* Some helpers 
*/
// dependencies
const crypto = require('crypto');
const config = require('../config');
const https = require('https');
const querystring = require('querystring');
const util = require('util')
const debug = util.debuglog('helpers')
const _messages = require('../templates/email')

// container for all the helpers
const helpers = {};

// sha256 hash
helpers.hash = (string) =>  {
    if (typeof(string) == 'string' && string.length > 0){
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex')
        return hash
    } else {
        return false;
    }
}

// parseJsonToObject, parse a JSON string to an object in all cases, without error
helpers.parseJsonToObject = (string) => {
    try {
        const obj = JSON.parse(string)
        return obj;
    } catch(e) {
        return {}
    }
}

// random alphanumeric
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

    if (strLength) {
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        let str = ''

        for(i = 1; i<= strLength; i++) {
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()* possibleCharacters.length))
            str+=randomCharacter
        }
        return str
    } else {
        return false;
    }
}

// curl call
helpers.curl = (requestDetails, payload, callback) => {
    let req = https.request(requestDetails, (res) => {
        // Set encoding formart for the response data
        res.setEncoding('utf8');
        res.on('data', (data) => {
            if (helpers.parseJsonToObject(data).id) {
                callback(false, helpers.parseJsonToObject(data))
            } else {
                callback(true, helpers.parseJsonToObject(data))
            }
        });        
    });

    // Bind to the Error Event so it doesn't get thrown
    req.on('error', (e) => {
        callback(true, {"error": helpers.parseJsonToObject(e)});
    });

    // Add the payload 
    req.write(querystring.stringify(payload));

    req.end();
}

// STRIPE
// create token
helpers.createStripeToken = (paymentDetailsData, callback) => {
    const payload = {
        'card[number]' : paymentDetailsData.cardNumber,
        'card[exp_month]' : paymentDetailsData.cardExpMonth,
        'card[exp_year]' : paymentDetailsData.cardExpYear,
        'card[cvc]' : paymentDetailsData.cardCvc
    };

    // Create the request Details
    let requestDetails = {
        'protocol' : 'https:',
        'hostname' : 'api.stripe.com',
        'method' : 'POST',
        'path' : '/v1/tokens',
        'headers' : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Bearer "+config.stripe.secretKey,
            'Content-Length': Buffer.byteLength(querystring.stringify(payload))
        }
    };
    debug(payload)
    helpers.curl(requestDetails,payload, (err, data) => callback(err,data))
}

// charge the card 
// required: generate stripe token first, createStripeToken()
helpers.chargeCardStripe = (paymentDetailsData, callback) => {
    const payload = {
        'amount' : paymentDetailsData.amount,
        'currency' : paymentDetailsData.currency,
        'source' : paymentDetailsData.source,
        'description' : paymentDetailsData.description
    };

    // Create the request Details
    let requestDetails = {
        'protocol' : 'https:',
        'hostname' : 'api.stripe.com',
        'method' : 'POST',
        'path' : '/v1/charges',
        'headers' : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': "Bearer "+config.stripe.secretKey,
            'Content-Length': Buffer.byteLength(querystring.stringify(payload))
        }
    };
    debug(paymentDetailsData)
    helpers.curl(requestDetails,payload, (err, data) => callback(err,data))
}

// email 
helpers.email = (paymentDetailsData, callback) => {
    const emailMessage = {
        "orderId": paymentDetailsData.orderId,
        "receiptUrl":  paymentDetailsData.receiptUrl
    }
    const messageTemplate = _messages.afterCheckout(emailMessage)
    debug(messageTemplate)
    let requestData = {
        'from' : `Edison Pizza Receipt <postmaster@${config.mailgun.domain}>`,
        'to' : paymentDetailsData.email,
        'subject' :  messageTemplate.subject,
        'text' : messageTemplate.text,
        'html' : messageTemplate.html
    };

    // Create Request Options
    let requestOptions = {
        'protocol' : 'https:',
        'hostname' : 'api.mailgun.net',
        'method' : 'POST',
        'path' : '/v3/' + config.mailgun.domain + '/messages',
        'auth': 'api:' + config.mailgun.apiKey,
        'headers' : {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(querystring.stringify(requestData))
        }
    }
    debug(requestOptions)
    helpers.curl(requestOptions, requestData, (err, data) => callback(err,data))
}


module.exports = helpers;