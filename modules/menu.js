/*
* Menu module
*
*/

// Dependencies
const _data = require('../lib/data');
const _tokens = require('./tokens')
const helpers = require('../lib/helpers');
const util = require('util')
const debug = util.debuglog('menus')

// handlers for menu
_menu = {}


// @TODO
// Implement Role-based access control (RBAC), only admin can insert menus.

// CREATE menu using POST
// required: token in header, email in header, item_name, item_price, item_size
_menu.post = (data, callback) => {
    // check if required fieds are filled
    let itemId = helpers.createRandomString(20);
    let email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false
    let itemName = typeof(data.payload.item_name) == 'string' && data.payload.item_name.trim().length > 1 ? data.payload.item_name.trim() : false
    let itemPrice = typeof(data.payload.item_price) == 'number' && data.payload.item_price > 1 ? data.payload.item_price : false
    let itemSize = typeof(data.payload.item_size) == 'string' && data.payload.item_size.trim().length > 1 ? data.payload.item_size.trim() : false

    if (itemName && itemPrice && itemSize) {
        // get the token from the headers
        //  get the token from the header
        let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false

        // verify if the given token is valid for the phone number and belongs who created the check
        // @TODO verify by RBAC
        _tokens.verifyToken(tokenId, email, tokenIsValid => {
            debug(email, tokenId)
            if (tokenIsValid) {
                // return check data
                let userObject = {
                    'itemId': itemId,
                    'itemName': itemName,
                    'itemPrice': itemPrice,
                    'itemSize': itemSize
                }
                // store the user
                _data.create('menus',itemId,  userObject, err => {
                    if (!err) {
                        callback(200, {'Error': false})
                    } else {
                        debug(err);
                        callback(500, {'Error': 'Could not create new menu'})
                    }
                })
                // callback(200, userObject)
            } else {
                callback(403, {'Error': 'Missing token or invalid'})
            }
        })
    } else {
        debug(itemName,itemPrice,itemSize)
        callback(400, {'Error': 'Missing required input or invalid'})
    }
}

// get to read one menu provide item_id
// required: token in header, token in email
// optional: item_id
_menu.get = (data,callback)=>{
    // check if the id number is valid
    const itemId = typeof(data.queryStringObject.item_id) == 'string' && data.queryStringObject.item_id.trim().length == 20 ? data.queryStringObject.item_id.trim() : false
    const tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false
    const email = typeof(data.headers.email) == 'string' && data.headers.email.trim().length > 3 ? data.headers.email.trim() : false

    // verify if the given token is valid for the phone number and belongs who created the check
    _tokens.verifyToken(tokenId, email, tokenIsValid => {
        if (tokenIsValid) {
            // return item in the menu
            if (itemId) {
                // look up the menu
                _data.read('menus', itemId, (err, checkData) => {
                    if (!err && checkData) {
                        callback(200, checkData)    
                    } else {
                        debug(err)
                        callback(404, {'Error': 'Not found'});
                    }
                })
            } else {
                // get all menu, LIST
                // hardcoded menu display if no entry in the .data
                _data.list('menus', async (err, menus) => {
                    if(!err && menus && menus.length > 0){
                        const menusArray = menus.map(async menuId => {
                            return await _data.readPromise('menus', menuId)
                        });
                        const menuReturn = await Promise.all(menusArray);
                        callback(200, menuReturn);
                    } else {
                        // hardcoded if no .data/menus found
                        callback(200, [
                            {
                                "itemId": "02idrhr7lzbpi2dc5doe",
                                "itemName": "Hardcoded menu 1",
                                "itemPrice": 33,
                                "itemSize": "small"
                            },
                            {
                                "itemId": "9mwi859i58da3dnczfei",
                                "itemName": "Hardcoded menu 2",
                                "itemPrice": 33,
                                "itemSize": "big"
                            }
                        ]);
                    }
                })
            }
        } else {
            callback(403, {'Error': 'Mising or invalid headers'})
        }
    })
}


module.exports = _menu;