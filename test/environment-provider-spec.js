describe('AppEnvironment', function () {

    var _$scope_;
    var _$appEnvironmentProvider_;
    var _$appEnvironment_;

    var fakeHostname;

    beforeEach(function () {

        fakeHostname = 'some.host';

        angular
            .module('luminous.environment.test', [])
            .config(function ($appEnvironmentProvider) {

                _$appEnvironmentProvider_ = $appEnvironmentProvider;

                _$appEnvironmentProvider_
                    .defaultEnvironmentName('testing')
                    .setDefaults({
                        foo: 'bar',
                        baz: 'quux'
                    })
                    .addEnvironment('testing', ['testing.env'], {
                        baz: 'buux'
                    })
                    .addEnvironment('live', ['some.host'], {
                        baz: 'b0rx'
                    });

            })
            .service('$location', function () {
                this.host = function () {
                    return fakeHostname;
                };
            });

        module('luminous.environment', 'luminous.environment.test');

        inject(function($rootScope, $injector) {

            _$scope_ = $rootScope.$new();

            _$appEnvironment_ = $injector.invoke(
                _$appEnvironmentProvider_.$get
            );

        });

    });

    describe('provider', function () {

        it('should throw an error when an environment hostname is not a string or RegExp', function () {
            
            expect(function () {
                _$appEnvironmentProvider_
                    .addEnvironment('someEnvironment', ['some.env', null], {});
            }).toThrowError('A hostname MUST be a string OR an instance of RegExp');
            
            expect(function () {
                _$appEnvironmentProvider_
                    .useConfigFor('someEnvironment')
                        .whenHostnameMatches(null);
            }).toThrowError('A hostname MUST be a string OR an instance of RegExp');

        });

        it('should NOT throw an error when an environment hostname is an empty string', function () {
            
            expect(function () {
                _$appEnvironmentProvider_
                    .addEnvironment('someEnvironment', ['some.env', ''], {});
            }).not.toThrow();
            
            expect(function () {
                _$appEnvironmentProvider_
                    .useConfigFor('someEnvironment')
                        .whenHostnameMatches('');
            }).not.toThrow();

        });

        it('should throw an error when an environment with the same name is added twice', function () {
            
            expect(function () {
                _$appEnvironmentProvider_
                    .addEnvironment('someEnvironment', 'some.env', {})
                    .addEnvironment('someEnvironment', 'another.env', {});
            }).toThrowError('Environment "someEnvironment" already exists');
            
        });

        it('should throw an error when setting the default environment name to something other than a string', function () {
            
            expect(function () {
                _$appEnvironmentProvider_
                    .defaultEnvironmentName(1);
            }).toThrowError('Default environment name must be a string');
            
        });

    });

    describe('service', function () {

        describe('in any case', function () {

            it('should use the current $location.host() as the value for hostname', inject(function ($location) {
                expect(_$appEnvironment_.hostname).toBe($location.host());
            }));

            it('should use correct `config` properties for the current environment', function () {
                expect(_$appEnvironment_.config).toEqual(jasmine.objectContaining({
                    foo: 'bar',
                    baz: 'b0rx'
                }));
            });

            it('should not allow `config` properties to be reset ', function () {
                _$appEnvironment_.config.foo = 'bix';
                expect(_$appEnvironment_.config.foo).toBe('bar');
            });

        });

        describe('in case no environment is specified for the current hostname', function () {

            beforeEach(function () {

                fakeHostname = 'unknown.host';

                inject(function($injector) {

                    _$appEnvironment_ = $injector.invoke(
                        _$appEnvironmentProvider_.$get
                    );

                });

            });

            it("should use defaultEnvironmentName by default", function () {
                expect(_$appEnvironment_.environmentName).toBe('testing');
            });

            it("should set value for isDefault to true when using default environment", function () {
                expect(_$appEnvironment_.isDefault).toBe(true);
            });

        });

    });

    describe('service invocation', function () {

        describe('in case no default environment name is specified', function () {

            beforeEach(function () {

                fakeHostname = 'random.host';

                angular
                    .module('luminous.environment.test')
                    .config(function () {
                        _$appEnvironmentProvider_.unsetDefaultEnvironmentName();
                    });


            });

            it('should throw an error if no environment configured for the curremt hostname', inject(function ($injector) {

                expect(function () {
                    _$appEnvironmentProvider_.unsetDefaultEnvironmentName();
                    _$appEnvironment_ = $injector.invoke(_$appEnvironmentProvider_.$get);
                }).toThrowError('No match found for hostname random.host');

            }));

        });

    });

});