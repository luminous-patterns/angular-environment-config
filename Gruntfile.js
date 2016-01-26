/* globals require */

var Q = require('q');
var shjs = require('shelljs');
var faithfulExec = require('faithful-exec');

var files = require('./files');

var metaBanner = '\
/**\n\
 * <%= pkg.description %>\n\
 * @version v<%= pkg.version %><%= buildTag %>\n\
 * @link <%= pkg.homepage %>\n\
 * @license MIT License, http://www.opensource.org/licenses/MIT\n\
 */';

var concatBanner = '\
<%= meta.banner %>\n\
\n\
(function (window, angular, undefined) {"use strict";\n';

var concatFooter = '\n\n})(window, window.angular);';

/* global module:false */
module.exports = function (grunt) {"use strict";

    require('load-grunt-tasks')(grunt);

    var releaseDirName = 'release';


    /**
     * Karma Config
     */

    var karmaConfigFiles = {
        ng149: 'config/karma-1.4.9.js',
        ng130: 'config/karma-1.3.0.js',
        ng1214: 'config/karma-1.2.14.js',
        ng115: 'config/karma-1.1.5.js',
    };

    var karmaTaskNames = Object.keys(karmaConfigFiles);
    var karmaTasks = karmaTaskNames.map(function (taskName) {
        return 'karma:' + taskName;
    });

    var karmaHeadless = [grunt.option('browser') || 'PhantomJS'];
    var karmaChrome = [grunt.option('browser') || 'Chrome'];

    var karmaTaskConfig = {
        options: {
            configFile: karmaConfigFiles[karmaTaskNames[0]],
            singleRun: true,
            exclude: [],
            frameworks: ['jasmine'],
            reporters: 'dots',
            port: 8080,
            colors: true,
            autoWatch: false,
            autoWatchatchInterval: 0,
            browsers: karmaHeadless,
        },
        unit: {
            browsers: karmaHeadless,
        },
        debug: {
            singleRun: false,
            background: false,
            browsers: karmaChrome,
        },
        background: {
            background: true,
            singleRun: false,
            browsers: karmaHeadless,
        },
        watch: {
            singleRun: false,
            autoWatch: true,
            autoWatchInterval: 1,
        },
    };

    karmaTaskNames.forEach(function (taskName) {
        karmaTaskConfig[taskName] = {
            configFile: karmaConfigFiles[taskName],
        };
    });


    /**
     * Grunt Task Config
     */

    grunt.initConfig({

        buildDir: 'build',
        pkg: grunt.file.readJSON('package.json'),
        buildTag: '-dev-' + grunt.template.today('yyyy-mm-dd'),
        meta: {
            banner: metaBanner,
        },

        clean: ['<%= buildDir %>'],

        concat: {
            options: {
                banner: concatBanner,
                footer: concatFooter,
            },
            build: {
                src: files.src,
                dest: '<%= buildDir %>/<%= pkg.name %>.js',
            },
        },

        uglify: {
            options: {
                banner: '<%= meta.banner %>\n',
            },
            build: {
                files: {
                    '<%= buildDir %>/<%= pkg.name %>.min.js': [
                        '<banner:meta.banner>',
                        '<%= concat.build.dest %>',
                    ],
                },
            },
        },

        release: {
            files: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js'],
            src: '<%= buildDir %>',
            dest: releaseDirName,
        },

        jshint: {
            all: files.jsHint,
            options: {
                eqnull: true,
                eqeqeq: true,
                multistr: true,
                validthis: true,
            },
        },

        watch: {
            files: files.watch,
            tasks: ['build', 'karma:background:run'],
        },

        connect: {
            server: {},
        },

        karma: karmaTaskConfig,

    });


    /**
     * Grunt Tasks
     */

    grunt.registerTask(
        'integrate',
        ['build', 'jshint'].concat(karmaTasks)
    );

    grunt.registerTask(
        'default',
        ['build', 'jshint', 'karma:unit']
    );

    grunt.registerTask(
        'build',
        'Perform a normal build',
        ['concat', 'uglify']
    );

    grunt.registerTask(
        'dist',
        'Perform a clean build',
        ['clean', 'build']
    );

    grunt.registerTask(
        'release',
        'Tag and perform a release',
        ['prepare-release', 'dist', 'perform-release']
    );

    grunt.registerTask(
        'dev',
        'Run dev server and watch for changes',
        ['build', 'connect:server', 'karma:background', 'watch']
    );

    grunt.registerTask(
        'prepare-release',
        gruntPrepareRelease
    );

    grunt.registerTask(
        'perform-release',
        gruntPerformRelease
    );


    /**
     * Grunt Task Functions
     */

    function gruntPrepareRelease () {

        var bower = grunt.file.readJSON('bower.json');
        var version = bower.version;

        if (version !== grunt.config('pkg.version')) {
            throw new Error('Version mismatch in bower.json');
        }

        function searchForExistingTag () {
            return exec('git tag -l \"' + version + '\"');
        }

        function setGruntConfig (searchResult) {

            if ('' !== searchResult.stdout.trim()) {
                throw new Error('Tag \'' + version + '\' already exists');
            }

            grunt.config('buildTag', '');
            grunt.config('buildDir', releaseDirName);

        }

        var done = this.async();

        ensureCleanMaster()
            .then(searchForExistingTag)
            .then(setGruntConfig)
            .then(function () {
                done();
            })
            .catch(handleAsyncError.bind(undefined, done))
            .done();

    }

    function gruntPerformRelease () {

        grunt.task.requires(['prepare-release', 'dist']);

        var version = grunt.config('pkg.version');
        var releaseDir = grunt.config('buildDir');

        function stageReleaseDir () {
            return system('git add \"' + releaseDir + '\"');
        }

        function commitStagedFiles () {
            return system('git commit -m \"release ' + version + '\"');
        }

        function createTag () {
            return system('git tag \"' + version + '\"');
        }

        var done = this.async();

        stageReleaseDir()
            .then(commitStagedFiles)
            .then(createTag)
            .then(function () {
                done();
            })
            .catch(handleAsyncError.bind(undefined, done))
            .done();

    }


    /**
     * Helper functions
     */

    function exec (cmd) {

        var deferred = Q.defer();

        faithfulExec(cmd)
            .then(function (result) {
                deferred.resolve(result);
            }, function (result) {
                deferred.reject(result);
            });

        return deferred.promise;

    }

    function handleAsyncError (done, error) {

        done = done || function () { };

        grunt.log.write(error + '\n');
        done(false);

    }

    function system (cmd) {

        function handleStdout (result) {
            grunt.log.write(result.stderr + result.stdout);
        }

        function handleStderr (result) {
            grunt.log.write(result.stderr + '\n');
            throw new Error('Failed to run \'' + cmd + '\'');
        }

        grunt.log.write('% ' + cmd + '\n');

        return exec(cmd)
            .then(handleStdout)
            .catch(handleStderr);

    }

    function ensureCleanMaster () {

        function assertMasterAndSetStatusPorcelain (result) {

            if ('refs/heads/master' !== result.stdout.trim()) {
                throw new Error('Not on master branch, aborting');
            }
            
            return exec('git status --porcelain');

        }

        function assertCleanWorkingCopy (result) {
            if ('' !== result.stdout.trim()) {
                throw new Error('Working copy is dirty, aborting');
            }
        }

        return exec('git symbolic-ref HEAD')
            .then(assertMasterAndSetStatusPorcelain)
            .then(assertCleanWorkingCopy);

    }

};