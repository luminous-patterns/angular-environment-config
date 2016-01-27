# angular-environment-config [![Build Status](https://travis-ci.org/luminous-patterns/angular-environment-config.svg?branch=master)](https://travis-ci.org/luminous-patterns/angular-environment-config)

*Hostname based environment configuration module for AngularJS*

## Contents

* [Installation](#get-it)
* [Usage](#use-it)
* [Example](#stare-intently-at-this-example-of-it)
* [API](#api)
  * [$appEnvironmentProvider](#provider)
  * [$appEnvironment](#service)


## Get it

* Download the [source](https://raw.githubusercontent.com/luminous-patterns/angular-environment-config/master/release/angular-environment-config.js) ([minified](https://raw.githubusercontent.com/luminous-patterns/angular-environment-config/master/release/angular-environment-config.min.js));
* Install using **[npm](https://npmjs.org)**: run `$ npm i angular-environment-config` from your console; or
* Install using **[bower](http://bower.io)**: run `$ bower install angular-environment-config` from your console

## Use it

1. Add `'luminous.environment'` to your main module's list of dependencies
    ```javascript
    angular.module('myWebApp', ['luminous.environment']);
    ```

2. Configure your environments during config phase using the `$appEnvironmentProvider`
    ```javascript
    $appEnvironmentProvider
        .addEnvironment('local', ['127.0.0.1', 'localhost', /\.local$/i], {});
    ```

3. Set default properties for all environments using `$appEnvironmentProvider.setDefaults()`
    ```javascript
    $appEnvironmentProvider
        .setDefaults({ titlePrefix: '', apiUrl: '/api/' });
    ```

4. Access the *readonly* config variables for the current environment using the `$appEnvironment` service via the `config` property.
    ```javascript
    $document[0].title = $appEnvironment.config.titlePrefix + 'My App';
    ```

## Stare intently at this example of it

```javascript
angular.module('myWebApp', [
    'luminous.environment',
]);

angular.module('myWebApp')
    .config(myWebAppConfig)
    .controller('MainViewController', MainViewController);

myWebAppConfig.$inject = ['$appEnvironmentProvider'];
function myWebAppConfig (  $appEnvironmentProvider){
    
    $appEnvironmentProvider
    
        // Default config for all environments
        .setDefaults({
            titlePrefix: '',
            apiUrl: '/api/',
        })
        
        // Local environment
        // Matches: 127.0.0.1, localhost, or any hostname that ends with .local
        .addEnvironment('local', ['127.0.0.1', 'localhost', /\.local$/i], {
            titlePrefix: 'LOCAL :: ',
            apiUrl: 'http://localhost:7331/',
        })
        
        // Production environment
        // Matches: www.my-app.com, and my-app.com
        .addEnvironment('production', /^(|www\.)my-app.com$/, {
            apiUrl: 'https://api.my-app.com/',
        })
        
        // Set the default environment to Local
        // In case the hostname doesn't match one of the rules above
        .defaultEnvironmentName('local');
    
}

MainViewController.$inject = ['$appEnvironment', '$document'];
function MainViewController (  $appEnvironment,   $document) {
    
    // Set the document title
    
    $document[0].title = $appEnvironment.config.titlePrefix
        + 'My App - Powered by things, that do things!';
    

    // The the local environment will now have the document title:
    //     LOCAL :: My App - Powered by things, that do things!

    // Whereas the live environment will now have the document title:
    //     My App - Powered by things, that do things!

}
```

------------------
## API
------------------

### Provider

-----------------

### $appEnvironmentProvider

-----------------

#### addEnvironment(environmentName, hostnames, config)
Adds a new environment *`config`* -- identified by *`environmentName`* -- that will be used when the Angular app's `$location.host()` matches one of the `String`s or `RegExp`s provided in *`hostnames`*.

```javascript
$appEnvironmentProvider
    .addEnvironment('local', ['127.0.0.1', 'localhost', /\.local$/i], {
        // Local environment would match '127.0.0.1', 'localhost', and any
        // hostname that ends with .local
        titlePrefix: 'LOCAL :: ',
        apiUrl: 'http://localhost:7331/',
    })
    .addEnvironment('testing', 'test.my-app.com', {
        // Testing environment would match 'test.my-app.com'
        titlePrefix: 'TESTING :: ',
        apiUrl: 'https://test-api.my-app.com/',
    })
    .addEnvironment('production', /^(www\.|)my-app.com$/i, {
        // Production environment would match 'my-app.com' with or without
        // the leading 'www.', but would not match 'foo.my-app.com'
        apiUrl: 'https://api.my-app.com/',
    });
```

###### Arguments

Parameter | Type | Description
----------|------|------------
**environmentName** | `String` | The internal name for this environment (e.g. local)
**hostnames** | `String` `RegExp` `Array` | Hostname `String` or `RegExp` or an `Array` of such, used to match against `$location.host()`.
**config** | `Object` | The environment configuration, to be applied to a new `AppEnvironmentConfig` on top of any defaults specified via `$appEnvironmentProvider.setDefault()`.

###### Returns

*`$appEnvironmentProvider`*



-----------------

#### useConfigFor(environmentName).whenHostnameMatches(hostname)

Specify the *`environmentName`* to use when the hostname matches *`hostname`*.

```javascript
$appEnvironmentProvider
    .useConfigFor('testing')
        .whenHostnameMatches(/^preview\.[a-z0-9-]{3,}\.my-app.com/i);
```

###### Arguments

Parameter | Type | Description
----------|------|------------
**environmentName** | `String` | The internal name of the environment (e.g. local)
**hostname** | `String` `RegExp` | Hostname `String` or `RegExp` for matching against `$location.host()`

###### Returns

*`$appEnvironmentProvider`*



-----------------

#### defaultEnvironmentName(environmentName)
Specify the *`environmentName`* to fall back on when none of the specified environment hostnames match the current hostname.

```javascript
$appEnvironmentProvider
    .defaultEnvironmentName('local');
```

*Important note:* If a default environment name is not specified, and the current hostname does not match a configured host name, the $appEnvironment service will throw an `EnvLookupError` during init.

###### Arguments

Parameter | Type | Description
----------|------|------------
**environmentName** | `String` | The internal name of the environment to use when all else fails (e.g. local)

###### Returns

*`$appEnvironmentProvider`*



-----------------

#### setDefaults(properties)
Set multiple default *`properties`* for `$appEnvironment.config` at once.

```javascript
$appEnvironmentProvider
    .setDefaults({
        titlePrefix: '',
        apiUrl: '/api/',
    });
```

###### Arguments

Parameter | Type | Description
----------|------|------------
**properties** | `Object` | Default properties to add to `$appEnvironment.config` for all environments.

###### Returns

*`$appEnvironmentProvider`*



-----------------

#### setDefault(key, value)
Specify a default *`value`* for *`key`* in `$appEnvironment.config`

```javascript
$appEnvironmentProvider
    .setDefault('apiUrl', '/api/');
```


###### Arguments

Parameter | Type | Description
----------|------|------------
**key** | `String` | The property name
**value** | `*` | The default value


###### Returns

*`$appEnvironmentProvider`*






------------------

### Service

-----------------

### $appEnvironment

-----------------

#### is(environmentName)
Determine if *`environmentName`* is the name of the current environment.

```javascript
if (!$appEnvironment.is('production')) {
    // Logic that will effect all environments except 'production'
}
```

##### Arguments

Parameter | Type | Description
----------|------|------------
**environmentName** | `String` | The name of the environment

###### Returns

*`Boolean`* --- `true` if the current environment name is *`environmentName`*, otherwise `false`.



-----------------

#### environmentName
*`String`* --- The name of the current environment

```javascript
if ('testing' === $appEnvironment.environmentName) {
    // Logic that will only effect the 'testing' environment
} else {
    // Logic that will effect all environments except 'testing'
}
```



-----------------

#### config
*`AppEnvironmentConfig`* --- Configuration object for the current environment, values are read-only.

```javascript
$document[0].title = $appEnvironment.config.titlePrefix + 
    'MyApp - Created by things, for things';
```



-----------------

#### hostname
*`String`* -- The hostname of the current environment.

```javascript
if ('localhost' === $appEnvironment.hostname) {
    // Logic that will only occur if the hostname used to identify the current
    // environment was 'localhost'
}
```



-----------------

#### isDefault
*`Boolean`* --- `true` if default environment configuration is being used, otherwise `false`.

```javascript
if (true === $appEnvironment.isDefault) {
    // Logic that will only occur if the current environment is the environment specified in $appEnvironmentProvider.defaultEnvironmentName()
}
```
