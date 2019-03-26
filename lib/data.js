/*
*   Library for storing and editing data
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const util = require('util')
const debug = util.debuglog('data')

// container for the module (to be exported)
var lib = {};

// define the base directory of the data folder
lib.baseDir = path.join(__dirname,'../.data/');

// write data to a file
lib.create = (dir, file, data, callback) => {
    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx', function (err,fileDescriptor ) {
        if (!err && fileDescriptor){
            // convert data to string
            let stringData = JSON.stringify(data);

            // write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if(!err){
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            })
        } else {
            callback('Could not create new file, it may already exist')
        }
    });
}

// read data from a file
lib.read =  (dir, file, callback) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8',function (err, data) {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data)
            callback(false, parsedData)

        } else {
            callback(err,data);
        }
    })
}

lib.readPromise = (dir, fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(lib.baseDir+dir+'/'+fileName+'.json', 'utf8', (err, data) => {
          err ? reject(err) : resolve(helpers.parseJsonToObject(data));
        });
    });
}

// update data to a file
lib.update = (dir, file, data, callback) => {
    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+', function (err,fileDescriptor ) {
        if (!err && fileDescriptor){
            let stringData = JSON.stringify(data);

            // truncate the file
            fs.ftruncate(fileDescriptor, function (err){
                if (!err) {
                    // write file and close
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if (!err) {
                            fs.close(fileDescriptor, function(err) {
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback('error closing the file')
                                }
                            })
                        } else {
                            callback('Error writing to existing file')
                        }
                    })
                } else {
                    callback('Error truncating file')
                }
            })
        } else {
            callback('could not open for update, it may not exist')
        }
    })
}

// deleting a file
lib.delete = (dir, file, callback) => {
    // unlink
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err) {
        if (!err) {
            callback(false);
        } else {
            callback('error deleting file')
        }
    })
}

// list all the items in a director
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir+dir+'/',(err, data) => {
        if (!err && data.length > 0) {
            let trimmedFileNames = [];

            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json',''))
            })
            callback(false,trimmedFileNames)
        } else {
            callback(err, data)
        }
    })
}

// export the module
module.exports = lib;