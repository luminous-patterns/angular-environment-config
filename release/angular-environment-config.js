/**
 * Environment configuration module for AngularJS
 * @version v1.0.0-rc.2
 * @link https://github.com/luminous-patterns/angular-environment-config
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (window, angular, undefined) {"use strict";


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

angular.module('luminous.environment', []);
AppEnvironmentConfigFactory.$inject = [];
function AppEnvironmentConfigFactory () {

    function AppEnvironmentConfig (props) {
        addReadonly(props).to(this);
    }

    return AppEnvironmentConfig;

}

angular
    .module('luminous.environment')
    .factory('AppEnvironmentConfig', AppEnvironmentConfigFactory);
$appEnvironmentProvider.$inject = [];
function $appEnvironmentProvider () {

    var defaultEnvironmentName;
    
    var configs = [];
    var hostnameRules = [];

    var defaultConfig = {};

    var configsByEnvironmentName = {};

    function getEnvironmentNameForHostname (hostname) {

        var environmentName;
        var lcHostname = hostname.toLowerCase();

        var currentRule;
        for (var i = 0; i < hostnameRules.length; i++) {

            currentRule = hostnameRules[i];

            if (null !== hostname.match(currentRule.regExp)) {
                environmentName = currentRule.environmentName;
                break;
            }

        }

        if (!environmentName) {
            throw new EnvLookupError({
                code: ERR_NO_MATCH_FOUND,
                message: 'No match found for hostname ' + hostname,
                hostname: hostname,
            });
        }

        return environmentName;

    }

    function hasConfigForEnvironment (environmentName) {
        return environmentName in configsByEnvironmentName;
    }

    function createFinalConfigForEnvironment (environmentName) {

        if (!hasConfigForEnvironment(environmentName)) {
            throw new UnknownEnvNameError({
                environmentName: environmentName,
            });
        }

        return angular.extend(
            createCopyOfDefaultConfig(), 
            configsByEnvironmentName[environmentName]
        );

    }

    function createCopyOfDefaultConfig () {
        return angular.copy(defaultConfig);
    }

    function parseHostname (hostname) {

        if ('string' === typeof hostname) {
            return new RegExp('^' + hostname + '$', 'i');
        }

        if (hostname instanceof RegExp) {

            if (!hostname.ignoreCase) {
                hostname = new RegExp(hostname.source, 'i');
            }

            return hostname;

        }

        throw new TypeError(
            'A hostname MUST be a string OR an instance of RegExp'
        );

    }

    this.addEnvironment = function (environmentName, hostnames, config) {

        if (hasConfigForEnvironment(environmentName)) {
            throw new EnvAlreadyExistsError({
                environmentName: environmentName,
            });
        }

        if (!Array.isArray(hostnames)) {
            hostnames = [hostnames];
        }

        configsByEnvironmentName[environmentName] = config;

        hostnames.forEach(function (hostname) {

            this.useConfigFor(environmentName)
                .whenHostnameMatches(hostname);

        }, this);

        return this;

    };

    this.useConfigFor = function (environmentName) {
        return {
            whenHostnameMatches: function (hostname) {

                var regExp = parseHostname(hostname);

                hostnameRules.unshift({
                    regExp: regExp,
                    environmentName: environmentName,
                });

            },
        };
    };

    this.unsetDefaultEnvironmentName = function () {
        defaultEnvironmentName = undefined;
        return this;
    };

    this.defaultEnvironmentName = function (newValue) {

        if ('string' !== typeof newValue) {
            throw new TypeError(
                'Default environment name must be a string'
            );
        }

        defaultEnvironmentName = newValue;

        return this;

    };

    this.setDefault = function (key, value) {
        defaultConfig[key] = value;
        return this;
    };

    this.setDefaults = function (properties) {

        var keys = Object.keys(properties);

        keys.forEach(function (key) {
            this.setDefault(key, properties[key]);
        }, this);

        return this;

    };

    this.$get = ['AppEnvironmentConfig', '$location',
        function (AppEnvironmentConfig,   $location) {

            function AppEnvironment (hostname) {

                var environmentName;

                try {
                    environmentName = getEnvironmentNameForHostname(hostname);
                }
                catch (error) {

                    var handled;

                    if (error instanceof EnvLookupError &&
                        ERR_NO_MATCH_FOUND === error.code &&
                        undefined !== defaultEnvironmentName) {

                        handled = true;
                        environmentName = defaultEnvironmentName;

                    }

                    if (true !== handled) {
                        throw error;
                    }

                }

                var isDefault = environmentName === defaultEnvironmentName;

                var config = new AppEnvironmentConfig(
                    createFinalConfigForEnvironment(environmentName)
                );

                var props = {
                    'environmentName': environmentName,
                    'isDefault': isDefault,
                    'hostname': hostname,
                    'config': config,
                };

                addReadonly(props).to(this);

            }

            AppEnvironment.prototype.is = function (environmentName) {
                return this.environmentName === environmentName;
            };

            return new AppEnvironment($location.host());

        }
    ];

}

angular
    .module('luminous.environment')
    .provider('$appEnvironment', $appEnvironmentProvider);

})(window, window.angular);