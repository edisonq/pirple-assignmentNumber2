/*
* Some helpers 
*/
// dependencies
const crypto = require('crypto');
const config = require('../config');
const https = require('https');
const querystring = require('querystring');

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


module.exports = helpers;