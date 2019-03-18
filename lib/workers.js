/*
* Worker-related tasks
*/


// dependencies
const path = require('path')
const fs = require('fs')
const _data = require('./data')
const https = require('https')
const http = require('http')
const helpers = require('./helpers')
const url = require('url')
const util = require('util')
const debug = util.debuglog('workers')

// instatiate the worker object
const workers = {};

workers.gatherAllChecks = () => {
    // get all the checks 
    _data.list('checks', function(err, checks) {
        if(!err && checks && checks.length > 0){
            checks.forEach(check => {
                // read the check data
                _data.read('checks', check, (err, originalCheckData) => {
                    if(!err && originalCheckData) {
                        // pass the data
                        workers.validateCheckData(originalCheckData)

                    } else {
                        debug('Error reading one of the checks data')
                    }
                })
            });
        } else {
            debug("Error:  Coult not find any check to process")
        }
    })
}

// sanity-check the check data
workers.validateCheckData = (originalCheckData) => {
    originalCheckData = typeof(originalCheckData)  == 'object' && originalCheckData !== null ? originalCheckData : {}
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['get','post','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeOutSeconds) == 'number' && originalCheckData.timeOutSeconds % 1  === 0 && originalCheckData.timeOutSeconds >= 1 && originalCheckData.timeOutSeconds <= 5 ? originalCheckData.timeOutSeconds : false

    // set the keys that not be set (if the workers have never seen this before)
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down'
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false

    // if all the checks passed, pass the data along to the next step in the process
    if (originalCheckData.id && 
        originalCheckData.userPhone &&
        originalCheckData.protocol &&
        originalCheckData.url &&
        originalCheckData.method &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds
    ) {
        workers.performCheck(originalCheckData)
    } else {
        debug('Error: one of the checks is not properly formatted.  Skipping it.')
        debug('data here '+originalCheckData.protocol, originalCheckData.url, originalCheckData.method, originalCheckData.successCodes, originalCheckData.timeoutSeconds)
    }
}

// perform the check, send the orginalcheckData...
workers.performCheck = (originalCheckData) => {
    // prepare the initial check outcome
    let checkOutcome = {
        'error': false,
        'response': false
    }

    // mark the outcome has not been sent yet
    let outcomeSent = false

    // parse the hostname and the path out of the original check data
    let parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true)
    let hostName = parsedUrl.hostname
    let path = parsedUrl.path //because we want the full query string

    // construct the request
    let requestDetails =  {
        'protocol': originalCheckData.protocol+':',
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    }

    // instantiate the request object (using the http or https module)
    const _moduleToUse = originalCheckData.protocol == 'http' ? http : http
    const req = _moduleToUse.request(requestDetails, res => {
        // grab the status of the sent requrest
        let status = res.statusCode

        // update the checkOutcome and pass the data along
        checkOutcome.responseCode = status
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome)
            outcomeSent = true
        }
    })

    // bind to the error event so it doesnt get thrown
    req.on('error', (error) => {
        // update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': error
        }

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome)
            outcomeSent = true
        }
    })

    // bind to the timeout
    req.on('timeout', (error) => {
        // update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        }

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome)
            outcomeSent = true
        }
    })

    // end the request
    req.end();
}

// process the check outcome, update the check data as needed, trigger alert if needed
// speical logic for accomodaing a check that has never been tested before
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
    // decide if the check is considered up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up': 'down'

    // decide if an alert is warranted
    let alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true: false

    // log the out come 
    const timeOfCheck = Date.now();
    workers.log(originalCheckData,checkOutcome,state, alertWarranted, timeOfCheck)

    // update the check data
    let newCheckData = originalCheckData
    newCheckData.state = state
    newCheckData.lastChecked = timeOfCheck   

    // save the updates
    _data.update('checks', newCheckData.id, newCheckData, (err) => {
        if(!err) {
            // send the new check data to the next phase if needed
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData)
            } else {
                debug('Check outcome has not chaned, no alert needed');
            }
        } else {
            debug('Error trying to save updates to one of the checks')
        }
    })
}

// alert the user as to a change in the check status
workers.alertUserToStatusChange = (newCheckData) => {
    let msg = 'Alert: Your check for '+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state
    helpers.sendTwilioSms(newCheckData.userPhone, msg, err => {
        if (!err) {
            debug('success: user was alerted to a status change in their heck, via SMS', msg)
        } else {
            debug('Error: could not send SMS alert to user who had a state change')
        }
    })
}


workers.loop = () => {
    setInterval(()=> {
        workers.gatherAllChecks()
    }, 1000*60)
}


// init
workers.init = () => {
    // send to console, in yello
    console.log('\x1b[33m%s\x1b[0m','Background workers are running')

    // checks
    workers.gatherAllChecks();

    // call the loop checks
    workers.loop();

}

module.exports = workers;