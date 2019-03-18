/*
* Server related tasks 
*/

// Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('../config')
const fs = require('fs')
const handlers = require('./handlers')
const helpers = require('./helpers')
const router = require('./route')
const path = require('path')
const util = require('util')
const debug = util.debuglog('server')

// Instatiate the server module object
let server = {};


// @TODO mailgun
// @TODO stripe


// instantiate the HTTP server
server.httpServer = http.createServer(function(request, respond) {
    server.unifiedServer(request, respond);
});

// instatitate the https server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(request, respond) {
    server.unifiedServer(request, respond);
});


// all the server logic for both the http and https server
server.unifiedServer =  (request, respond) => {
    // get the url and parse it
    let parsedUrl = url.parse(request.url, true);
    
    // get the path of the url
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get the query string as an object
    let queryStringObject = parsedUrl.query;

    // get the http method
    let method = request.method.toLowerCase();
    
    // get the headers as an object
    let headers = request.headers;

    // get the paypload, when handling stream, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    request.on('data', function(data){
        buffer += decoder.write(data);
    });

    request.on('end', function() {
        buffer += decoder.end();

        // choose the handler request to go to
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // construct data object to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        //route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload) {
            // use the status code called back by the handler, define default
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload called back by the handler, or the default empty
            payload = typeof(payload) == 'object' ? payload : '';

            // convert to payload to a string
            let payloadString = JSON.stringify(payload);

            // return the response
            respond.setHeader('Content-Type','application/json');
            respond.writeHead(statusCode);
            respond.end(payloadString);

            // if the respond is 200, print green otherwise print red
            if (statusCode == 200) {
                debug ('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode)
                // debug('\nReturning this reponse',statusCode,payloadString);
            } else {
                debug ('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode)
            }
            
        });
        
    });
}



// init function
server.init = () => {
    // start the http server
    server.httpServer.listen(config.httpPort, function(){
        // debug("The server: ",config.httpPort);
        // debug("in: ",config.envName);
        console.log('\x1b[35m%s\x1b[0m','http server: ', config.httpPort)
        console.log('\x1b[35m%s\x1b[0m','http in this enviroment: ', config.envName)
    })
    
    // start the https server
    server.httpsServer.listen(config.httpsPort, function(){
        // console.log("The server: ",config.httpsPort);
        // console.log("in: ",config.envName);
        console.log('\x1b[36m%s\x1b[0m','https server: ', config.httpsPort)
        console.log('\x1b[36m%s\x1b[0m','https in this enviroment: ', config.envName)
    })
    
}

module.exports = server;