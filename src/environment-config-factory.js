LuminousEnvironmentConfigFactory.$inject = [];
function LuminousEnvironmentConfigFactory () {

    function AppEnvironmentConfig (props) {
        addReadonly(props).to(this);
    }

    return AppEnvironmentConfig;

}

angular
    .module('luminous.environment')
    .factory('AppEnvironmentConfig', AppEnvironmentConfigFactory);