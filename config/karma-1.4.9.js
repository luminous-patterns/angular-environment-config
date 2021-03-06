'use strict';

var ngVersion = '1.4.9';

module.exports = function (karma) {

    var files = require('../files');

    karma.set({
        basePath: '..',
        files: [].concat(
            files.angular(ngVersion), 
            files.testUtils, 
            files.src, 
            files.test
        ),
        logLevel: karma.LOG_DEBUG,
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
    });

};