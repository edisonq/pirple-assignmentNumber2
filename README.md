# Pizza Delivery Company API

[![N|Solid](https://s3.amazonaws.com/thinkific-import/116598/cYiInJ14QTexS1zdpeTV_logo5.png)](https://pirple.thinkific.com)
# TABLE OF CONTENTS
- [Technologies](https://github.com/edisonq/pirple-assignmentNumber2#technologies)
- [Installation](https://github.com/edisonq/pirple-assignmentNumber2#installation)
- [Configuration](https://github.com/edisonq/pirple-assignmentNumber2#configuration)
- API Usage
    - Create User: https://github.com/edisonq/pirple-assignmentNumber2#technologies
    - Login or Token Creation: https://github.com/edisonq/pirple-assignmentNumber2#login-or-token-creation
    - Update Token: https://github.com/edisonq/pirple-assignmentNumber2#login-or-token-creation
    - Logout: https://github.com/edisonq/pirple-assignmentNumber2#logout-or-token-destruction
    - Read or Get specific user information: https://github.com/edisonq/pirple-assignmentNumber2#logout-or-token-destruction
    - Update user information: https://github.com/edisonq/pirple-assignmentNumber2#update-user-information
    - Delete User: https://github.com/edisonq/pirple-assignmentNumber2#delete-user
    - Create Menu: https://github.com/edisonq/pirple-assignmentNumber2#create-menu
    - View one item in the menu: https://github.com/edisonq/pirple-assignmentNumber2#view-one-item-in-the-menu
    - Get all menu: https://github.com/edisonq/pirple-assignmentNumber2#get-all-menu
    - add to cart:https://github.com/edisonq/pirple-assignmentNumber2#add-to-cart
    - show content cart: https://github.com/edisonq/pirple-assignmentNumber2#show-all-content-cart
    - show specific cart: https://github.com/edisonq/pirple-assignmentNumber2#show-specific-content-of-the-cart
    - update content of user's cart: https://github.com/edisonq/pirple-assignmentNumber2#update-content-of-a-cart
    - delete specific cart: https://github.com/edisonq/pirple-assignmentNumber2#delete-specific-cart
    - checkout: https://github.com/edisonq/pirple-assignmentNumber2#checkout
- [Todos](https://github.com/edisonq/pirple-assignmentNumber2#todos)
- [License](https://github.com/edisonq/pirple-assignmentNumber2#license)
### Technologies
  - nodejs v10.15.1
  - https://stripe.com/
  - https://mailgun.com

### Installation
This API requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ node index.js 
```
You will see this:
```sh
Background workers are running
http server:  3002
http in this enviroment:  staging
https server:  3003
https in this enviroment:  staging
```

#### NODE_DEBUG

You can debug by modules.
- carts
- checkout
- menu
- tokens
- users

Example debug mode:
```sh
$ NODE_DEBUG=server, menus,data,carts,users,checkout node index.js
```

For production environments...

```sh
$ npm install --production
$ NODE_ENV=production node app
```

#### Configuration
```sh
./config.js
```
Modify this both in staging and production:
```sh
 "httpPort": 3002,
     "httpsPort": 3003,
     'envName': 'staging',
     'hashingSecret' : 'thisIsASecret',
     'maxChecks': 5,
 "stripe" : {
     'publishablekey' : 'pk_test_gWlZUhm5cSluCZQD2k68EkDB',
         'secretKey' : 'sk_test_BQokikJOvBiI2HlWgH4olfQ2'
     },
     'mailgun' : {
         'domain' : 'sandbox05a72c66b36d47e081a510782fa516a3.mailgun.org',
         'apiKey' : 'b6aa82aa09d71894d9987ee9b4617d69-e51d0a44-e84df94c'
 }
```
# API Usage
Here's the list of API.  
OR you can easily import this to your [Postman](https://www.getpostman.com/collections/8ac98097055880f6fd80).

API lists:
- Create user
- Read 

### Create User
Required fields:
- firstname (string)
- lastname (string)
- password (string)
- email (string)
- address (string)
- tosAgreement (string)

URL and method:
```sh
POST: /users
```

POST Sample JSON body
```JSON
{
    "firstName": "jamers",
    "lastName": "Smith",
    "password": "thisIsAPassword",
    "email": "someEmail@test.com",
    "address": "another address, here, and now",
    "tosAgreement": true
}
```
CURL sample:
```sh
curl -H "Content-Type: application/json" \
--request POST \
--data '{ "firstName": "jamers", "lastName": "Smith", "password": "thisIsAPassword",  "email": "test@email.com",  "address": "another address, here, and now",     "tosAgreement": true }' \
http://localhost:3002/users
```

Successful output:
```sh
{"Error":false}
```

Error outputs:
- {'Error': 'Missing required fields'}
- {'Error': 'A user with that email already exist'}
- {'Error': 'Could not hash user'}
- {'Error': 'Could not create the new user'}

### Login or Token creation
There are two ways to login:

By token creation URL
```sh
POST: /tokens
```
OR this URL
```sh
POST: /login
```

Required fields:
- email
- password

JSON body example
```JSON
{
 "email": "test@test.com",
 "password": "thisIsAPassword"
}
```
CURL sample:
```sh
curl -H "Content-Type: application/json" \
--request POST \
--data '{"email":"test@test.com","password":"thisIsAPassword"}' \
http://localhost:3002/login
```
Successful output:
```sh
{
    "email": "test@test.com",
    "id": "y3oqyjsa3ygqa7uyv9n5",
    "expires": 1553679149063
}
```
Error outputs:
- {'Error': 'Missing required field'}
- {'Error': 'Missing  require token header, or token is invalid'}
- {'Error':'Could not find the specified user'}
- {'Error': 'Could not delete the specified user'}
- {'Error': 'Could not find specified email'}

### Update token
Required fields:
- id (tokenid)

URL:
```sh
PUT: /tokens
```

CURL sample:
```sh
curl -H "Content-Type: application/json" \
--data '{"id": "mavqldpcqbypd8u65fck"}' \
--request PUT \
http://localhost:3002/tokens
```
Output:
- {'Error': false}
- {'Error': 'Could not update the token\'s expiration'}
- {'Error': 'The Token has already expired, and can not be extended'}
- {'Error': 'The specified token does not exist'}

### Logout or Token destruction
There are two ways to logout:
By token creation URL
```sh
DELETE: /tokens
```
OR this URL
```sh
GET: /logout
```

Required fields:
- email in header
- token in header

CURL sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: r9rpfhsep3mbfd1nrsbh" \
-H "email: test@test.com" \
--request POST \
http://localhost:3002/logout
```

Sample output:
```sh
{
    "Error": false
}
```

Error outputs:
- {'Error': 'Missing required field'}
- {'Error': 'Missing  require token header, or token is invalid'}
- {'Error':'Could not find the specified user'}
- {'Error': 'Could not delete the specified user'}
- {"Error": "Not logged in"}

### Read or Get specific user information
Required fields:
- Header token (LOGIN or token created)
- Email token (it should to the token created)

URL:
```sh
GET: /users
```

CURL sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: r9rpfhsep3mbfd1nrsbh" \
-H "email: test@test.com" \
--request PUT \
http://localhost:3002/users
```
Sample output:
```json
{
    "id": "vy6ko00057hgbrtr5g3g",
    "firstName": "just another test",
    "lastName": "Smith",
    "address": "another address, here, and now",
    "email": "test@test.com",
    "tosAgreement": true
}
```
Error:
- {'Error': 'Missing required field'}
- {'Error': 'Missing  require token header, or token is invalid'}
- {'Error': 'Could not find user'}

### Update user information
Required fields:
- Email header

Optional fields:
- firstname
- lastname
- address
- password

URL:
```sh
PUT: /users
```
CURL sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: it15fpf4kcy9jci46lp0" \
-H "email: test@test.com" \
--data '{"firstName": "just another test"}' \
--request PUT \
http://localhost:3002/users
```
JSON body example:
```json
{
     "firstName": "just another test"
}
```
Error:
- {'Error': 'Missing required field'}
- {'Error': 'Missing field update'}
- {'Error': 'Missing  require token header, or token is invalid'}
- {'Error': 'The specified user does not exist'}
- {'Error': 'Could not update the user'}
- {'Error': false}

### Delete User
Required fields:
- Token header
- Token Email
- Email to delete (user)

URL:
```sh
DELETE: /users
```
JSON sample body:
```json
{
 "email": "test@test.com",
}
```
Curl:
```sh
curl -H "Content-Type: application/json" \
-H "token: it15fpf4kcy9jci46lp0" \
-H "email: test@test.com" \
--data '{"email": "test@test.com}' \
--request DELETE \
http://localhost:3002/users
```


### Create menu
Required fields:
- item_name
- item_price
- item_size

URL and method:
```sh
POST: /menu
```
Curl:
```sh
curl -H "Content-Type: application/json" \
-H "token: it15fpf4kcy9jci46lp0" \
-H "email: test@test.com" \
--data '{"item_name" : "Menu 12","item_price" : 12,"item_size" : "Medium"}' \
--request POST \
http://localhost:3002/menu 
```
JSON body example
```JSON
{
 "item_name": "Menu 1",
 "item_price": "12,
 "item_size": "12
}
```
### View one item in the menu
Required fields:
- Header Token
- Header Email

URL and method:
```sh
GET: /menu?item_id=<item_id>
```
Sample URL:
```url
?item_id=4kna2vdxwacnazp97yic
```
Curl:
```sh
curl -H "Content-Type: application/json" \
-H "token: it15fpf4kcy9jci46lp0" \
-H "email: test@test.com" \
--data '{"item_name" : "Menu 12","item_price" : 12,"item_size" : "Medium"}' \
--request GET \
http://localhost:3002/menu?item_id=4kna2vdxwacnazp97yic
```

Sample Output:
```JSON
{
    "itemId": "4kna2vdxwacnazp97yic",
    "itemName": "Menu 12",
    "itemPrice": 12,
    "itemSize": "Medium"
}
```
### Get all menu
Required fields:
- Header Token
- Header Email

Curl Sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: p9r4qt827g8v9klvxh3h" \
-H "email: test@test.com" \
--request GET \
http://localhost:3002/menu
```

Sample output:
```JSON
[
    {
        "itemId": "4kna2vdxwacnazp97yic",
        "itemName": "Menu 12",
        "itemPrice": 12,
        "itemSize": "Medium"
    },
    {
        "itemId": "b1qost6fjpq7xfrmqnhw",
        "itemName": "Menu 12",
        "itemPrice": 12,
        "itemSize": "Medium"
    },
    {
        "itemId": "huznd9xxiju62udbi64y",
        "itemName": "Menu 11",
        "itemPrice": 11,
        "itemSize": "Small"
    }
]
```

### Add to cart
Curl Sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: p9r4qt827g8v9klvxh3h" \
-H "email: test@test.com" \
--data '{	"item_id": "0m3f3evii2arlie7p1ro",	"item_qty": 5,	"item_total_price": 500}' \
--request POST \
http://localhost:3002/cart
```

Sample Output:
```JSON
{
    "Error": false
}
```

### Show all content cart
Required:
- header token
- header email

Curl sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: p9r4qt827g8v9klvxh3h" \
-H "email: test@test.com" \
--request GET \
http://localhost:3002/cart
```

Sample JSON output:
```JSON
{
    "total": 1000,
    "cartReturn": [
        {
            "cartId": "buxscznw4jpou4xq2rsmqnoq35eqmh7p8f0dg6quvoeohmfn08",
            "email": "test@test.com",
            "tokenId": "p9r4qt827g8v9klvxh3h",
            "itemId": "0m3f3evii2arlie7p1ro",
            "itemQty": 5,
            "itemTotalPrice": 500,
            "expires": 1553774362899
        },
        {
            "cartId": "w7dbkvjr2lah9ivellnpi19wmvm76yocjfry74akw2d487ijk9",
            "email": "test@test.com",
            "tokenId": "p9r4qt827g8v9klvxh3h",
            "itemId": "0m3f3evii2arlie7p1ro",
            "itemQty": 5,
            "itemTotalPrice": 500,
            "expires": 1553776416332
        }
    ]
}
```

### Show specific content of the cart
Required:
- cart_id (Params)
- header token
- header email

Curl sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: p9r4qt827g8v9klvxh3h" \
-H "email: test@test.com" \
--request GET \
http://localhost:3002/cart?cart_id=w7dbkvjr2lah9ivellnpi19wmvm76yocjfry74akw2d487ijk9
```

Sample JSON output:
```JSON
{
    "cartId": "w7dbkvjr2lah9ivellnpi19wmvm76yocjfry74akw2d487ijk9",
    "email": "test@test.com",
    "tokenId": "p9r4qt827g8v9klvxh3h",
    "itemId": "0m3f3evii2arlie7p1ro",
    "itemQty": 5,
    "itemTotalPrice": 500,
    "expires": 1553776416332
}
```

### Update content of a cart
Required:
- header token
- header email
- cart_id 
- item_qty
- itemTotalPrice

Curl sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: p9r4qt827g8v9klvxh3h" \
-H "email: test@test.com" \
--request GET \
http://localhost:3002/cart?cart_id=w7dbkvjr2lah9ivellnpi19wmvm76yocjfry74akw2d487ijk9
```

Sample JSON output:
```JSON
{
    "Error": false
}
```

### DELETE specific cart
Required:
- header token
- header email
- cart_id 

Curl sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: p9r4qt827g8v9klvxh3h" \
-H "email: test@test.com" \
--data '{"cart_id": "buxscznw4jpou4xq2rsmqnoq35eqmh7p8f0dg6quvoeohmfn08"}' \
--request DELETE \
http://localhost:3002/cart
```

Sample JSON output:
```JSON
{
    "Error": false
}
```

### Checkout
Required:
- tokenId header
- email header
- number
- exp_month
- exp_year 
- cvc

Optional:
- amount
- currency
- description

Curl sample:
```sh
curl -H "Content-Type: application/json" \
-H "token: imj1xdeqxtxsxoaf1kep" \
-H "email: test@test.com" \
--data '{"number" : "4242424242424242",    "exp_month" : "12",    "exp_year" : "2020",    "cvc" : "123",    "amount": 50,    "description": "some sample description"}' \
--request POST \
http://localhost:3002/checkout
```

Sample JSON output:
```JSON
{
    "Error": false
}
```

### Todos

 - Write MORE Tests
 - RBAC (Role-based access control)

License
----

MIT


**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
