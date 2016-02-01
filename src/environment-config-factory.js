AppEnvironmentConfigFactory.$inject = [];
function AppEnvironmentConfigFactory () {

    function AppEnvironmentConfig (props) {
        addEnumerable(props).to(this);
    }

    return AppEnvironmentConfig;

}

angular
    .module('luminous.environment')
    .factory('AppEnvironmentConfig', AppEnvironmentConfigFactory);