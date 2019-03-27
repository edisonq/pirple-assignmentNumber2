# Pizza Delivery Company API

[![N|Solid](https://s3.amazonaws.com/thinkific-import/116598/cYiInJ14QTexS1zdpeTV_logo5.png)](https://pirple.thinkific.com)

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
> Background workers are running
> http server:  3002
> http in this enviroment:  staging
> https server:  3003
> https in this enviroment:  staging
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
```JSON
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
POST: http://localhost/users
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
> {
>  "email": "test@test.com",
>  "password": "thisIsAPassword"
>}

Header example:
| Key | Value |
| ------ | ------ |
| Content-Type | application/json |

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
- email
- password

JSON body example
> {
>  "email": "test@test.com",
>  "password": "thisIsAPassword"
>}

Header example:
| Key | Value |
| ------ | ------ |
| Content-Type | application/json |


### Read or Get specific user information
Required fields:
- Header token (LOGIN or token created)
- Email token (it should to the token created)

URL:
```sh
/users
```

Method:
```sh
GET
```

Example header information:
| Key | Value |
| ------ | ------ |
| Content-Type | application/json |
| token | k8p94nd7e1hukta6vhqd |
| email | email@test.com |

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
/users
```
Method:
```sh
PUT
```
Example header information:
| Key | Value |
| ------ | ------ |
| Content-Type | application/json |
| token | k8p94nd7e1hukta6vhqd |
| email | email@test.com |

JSON body example:
> {
>     "firstName": "just another test"
>}
### Delete User
Required fields:
- Token header
- Email
URL:
```sh
/users
```
Method:
```sh
DELETE
```

Example header information:
| Key | Value |
| ------ | ------ |
| Content-Type | application/json |
| token | k8p94nd7e1hukta6vhqd |
JSON body example
> {
>  "email": "test@test.com",
>}

### Create menu
Required fields:
- item_name
- item_price
- item_size

URL and method:
```sh
POST: /menu
```
Example header information:
| Key | Value |
| ------ | ------ |
| Content-Type | application/json |
| token | k8p94nd7e1hukta6vhqd |
| email | email@test.com |
JSON body example
> {
>  "item_name": "Menu 1",
>  "item_price": "12,
>  "item_size": "12
>}
### View one item in the menu
Required fields:
- Header Token
- Header Email

URL and method:
```sh
GET: /menu
```
Example header information:
| Key | Value |
| ------ | ------ |
| Content-Type | application/json |
| token | k8p94nd7e1hukta6vhqd |
| email | email@test.com |

Sample output JSON:
> 



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
