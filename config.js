/*
* Create and export configuration variables
*/

// container for all the enviroments
const enviroments = {};

// stagin (default) enviroment
enviroments.staging = {
    'httpPort': 3002,
    'httpsPort': 3003,
    'envName': 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks': 5,
    'stripe' : {
        'publishablekey' : 'pk_test_gWlZUhm5cSluCZQD2k68EkDB',
        'secretKey' : 'sk_test_BQokikJOvBiI2HlWgH4olfQ2'
    },
    'mailgun' : {
        'domain' : 'sandbox05a72c66b36d47e081a510782fa516a3.mailgun.org',
        'apiKey' : 'b6aa82aa09d71894d9987ee9b4617d69-e51d0a44-e84df94c'
    }
};


// production environement
enviroments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks': 5,
    'stripe' : {
        'publishablekey' : 'pk_test_gWlZUhm5cSluCZQD2k68EkDB',
        'secretKey' : 'sk_test_BQokikJOvBiI2HlWgH4olfQ2'
    },
    'mailgun' : {
        'domain' : 'sandbox05a72c66b36d47e081a510782fa516a3.mailgun.org',
        'apiKey' : 'b6aa82aa09d71894d9987ee9b4617d69-e51d0a44-e84df94c'
    }
};

// determine which environment was passed as a command line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

// check if the current environment is one of the environment above, if not default to staging
const enviromentToExport = typeof(enviroments[currentEnvironment]) == 'object' ? enviroments[currentEnvironment] : enviroments.staging;

// export the module
module.exports = enviromentToExport;