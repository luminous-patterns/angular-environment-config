

/* Constants */

var ERR_UNKNOWN = 'ERR_UNKNOWN';
var ERR_NO_MATCH_FOUND = 'ERR_NO_MATCH_FOUND';
var ERR_HOSTNAME_UNDEFINED = 'ERR_HOSTNAME_UNDEFINED';
var ERR_NO_SUCH_ENVIRONMENT = 'ERR_NO_SUCH_ENVIRONMENT';
var ERR_ENVIRONMENT_ALREADY_EXISTS = 'ERR_ENVIRONMENT_ALREADY_EXISTS';


/* Read-only property setter */

function addReadonly (props) {

    return {

        to: function (object) {

            var keys = Object.keys(props);
            keys.forEach(function (key) {

                Object.defineProperty(object, key, {
                    value: props[key],
                    writable: false,
                    enumerable: true,
                    configurable: false,
                });

            });

        },

    };

}


/* EnvLookupError */

function EnvLookupError (e) {

    e = e || {};

    var code = e.code || ERR_UNKNOWN;
    var hostname = e.hostname || '';

    this.message = e.message || 'Environment lookup failed: ' + code;
    this.code = code;
    this.hostname = hostname;

}

EnvLookupError.prototype = Object.create(Error.prototype);
EnvLookupError.prototype.constructor = EnvLookupError;


/* EnvAlreadyExistsError */

function EnvAlreadyExistsError (e) {

    e = e || {};

    var environmentName = e.environmentName || '';

    this.message = 'Environment "' + environmentName + '" already exists';

    this.code = ERR_ENVIRONMENT_ALREADY_EXISTS;
    this.environmentName = environmentName;

}

EnvAlreadyExistsError.prototype = Object.create(Error.prototype);
EnvAlreadyExistsError.prototype.constructor = EnvAlreadyExistsError;


/* UnknownEnvNameError */

function UnknownEnvNameError (e) {

    e = e || {};

    var environmentName = e.environmentName || '';

    this.message = 'No config for environment name "' + environmentName + '"';
    this.code = ERR_NO_SUCH_ENVIRONMENT;
    this.environmentName = environmentName;

}

UnknownEnvNameError.prototype = Object.create(Error.prototype);
UnknownEnvNameError.prototype.constructor = UnknownEnvNameError;
