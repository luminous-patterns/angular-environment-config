'use strict';

module.exports = {

    src: [
        'src/common.js',
        'src/module.js',
        'src/environment-config-factory.js',
        'src/environment-provider.js',
    ],

    jsHint: [
        'Gruntfile.js',
        'src/*.js',
        '<%= buildDir %>/<%= pkg.name %>.js',
    ],

    watch: [
        'src/*.js',
        'test/**/*.js',
    ],

    testUtils: [
        // 'test/testUtils.js',
    ],

    test: [
        'test/*-spec.js',
        // 'test/compat/matchers.js',
    ],

    angular: function (version) {
        return [
            'lib/angular-' + version + '/angular.js',
            'lib/angular-' + version + '/angular-mocks.js',
        ];
    },

};