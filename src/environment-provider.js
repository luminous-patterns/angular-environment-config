appEnvironmentProvider.$inject = [];
function appEnvironmentProvider () {

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
            '1st argument must be a string OR an instance of RegExp'
        );

    }

    function getWindowLocationHostname () {

        var hostname = window.location.hostname;

        if ('string' !== typeof hostname) {
            throw new TypeError(
                'Unexpected (non-string) value for window.location.hostname'
            );
        }

        return hostname;

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

            var regExp = parseHostname(hostname);

            this.useConfigFor(environmentName)
                .whenHostnameMatches(regExp);

        }, this);

        return this;

    };

    this.useConfigFor = function (environmentName) {
        return {
            whenHostnameMatches: function (regExp) {
                hostnameRules.unshift({
                    regExp: regExp,
                    environmentName: environmentName,
                });
            },
        };
    };

    this.defaultEnvironmentName = function (newValue) {

        if ('string' !== typeof newValue) {
            throw new TypeError(
                '1st argument must be a string'
            );
        }

        defaultEnvironmentName = newValue;

        return this;

    };

    this.setDefaultProp = function (key, value) {
        defaultConfig[key] = value;
        return this;
    };

    this.setDefaultProps = function (props) {

        var keys = Object.keys(props);

        keys.forEach(function (key) {
            this.setDefaultProp(key, props[key])
        }, this);

        return this;

    };

    this.$get = ['AppEnvironmentConfig', 
        function (AppEnvironmentConfig) {

            function AppEnvironment (hostname) {

                var name;
                var hostnameMatch = false;

                try {
                    name = getEnvironmentNameForHostname(hostname);
                }
                catch (error) {

                    var handled;

                    if (error instanceof EnvLookupError
                        && ERR_NO_MATCH_FOUND === error.code
                        && undefined !== defaultEnvironmentName) {

                        handled = true;
                        
                        name = defaultEnvironmentName;
                        hostnameMatch = true;

                    }

                    if (true !== handled) {
                        throw error;
                    }

                }

                var config = new AppEnvironmentConfig(
                    createFinalConfigForEnvironment(name)
                );

                var props = {
                    'name': name,
                    'config': config,
                    'hostname': hostname,
                    'hostnameMatch': hostnameMatch,
                };

                addReadonly(props).to(this);

            }

            return new AppEnvironment(getWindowLocationHostname());

        }
    ];

}

angular
    .module('luminous.environment')
    .provider('appEnvironment', appEnvironmentProvider);