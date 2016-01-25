describe('AppEnvironmentConfigFactory', function () {

    beforeEach(module('luminous.environment'));

    it('exists', inject(function (AppEnvironmentConfig) {
        expect(AppEnvironmentConfig).toBeDefined();
    }));

    it('should be a constructor named "AppEnvironmentConfig"', inject(function (AppEnvironmentConfig) {
        expect(AppEnvironmentConfig).toEqual(jasmine.any(Function));
        expect(AppEnvironmentConfig.name).toBe('AppEnvironmentConfig');
    }));

});