# angular-environment-config

Hostname based environment configuration module for AngularJS

* [Installation](#installation)
* [Usage](#usage)
* [Example](#example)
* [API](#api)
  * [Provider - $appEnvironmentProvider](#provider)
  * [Service - $appEnvironment](#service)


### Installation

Install using **Bower**
```sh
$ bower install angular-environment-config --save
```

### Usage

1. Add it as a dependency for your AngularJS app
2. Configure your environments using the `$environmentConfigProvider`
3. Access the config variables for the current environment via the `$environmentConfig` service 


#### Example

```javascript
angular
    .module('myWebApp', [
        'luminous.environment',
    ])
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
    
    $document[0].title = $appEnvironment.config.titlePrefix
        + 'My App - Powered by things, that do things!';
    
}
```

## API

### Provider

#### $appEnvironmentProvider.addEnvironment(String *`environmentName`*, Array|String|RegExp *`hostnames`*, Object *`config`*)
*Returns $appEnvironmentProvider* --- Adds a new environment *`config`* -- identified by *`environmentName`* -- that will be used when `window.location.hostname` matches one of the values provided in *`hostnames`*.

```javascript
$appEnvironmentProvider
    .addEnvironment('local', ['127.0.0.1', 'localhost', /\.local$/i], {
        titlePrefix: 'LOCAL :: ',
        apiUrl: 'http://localhost:7331/',
    });
```

Strings and RegExps are also acceptable values for the *`hostnames`* argument.

```javascript
$appEnvironmentProvider
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

#### $appEnvironmentProvider.useConfigFor(String *`environmentName`*).whenHostnameMatches(RegExp *`regExp`*)
*Returns $appEnvironmentProvider* --- Specify the *`environmentName`* to use when the hostname matches *`regExp`*.

```javascript
$appEnvironmentProvider
    .useConfigFor('testing')
        .whenHostnameMatches(/^preview\.[a-z0-9-]{3,}\.my-app.com/i);
```

#### $appEnvironmentProvider.defaultEnvironmentName(String *`environmentName`*)
*Returns $appEnvironmentProvider* --- Specify the *`environmentName`* to fall back on when none of the specified environment hostnames match the current hostname.

```javascript
$appEnvironmentProvider
    .defaultEnvironmentName('local');
```

***Important note:*** If a default environment name is not specified, the $appEnvironment service will throw an `EnvLookupError` during init.

#### $appEnvironmentProvider.setDefault(String *`key`*, Mixed *`value`*)
*Returns $appEnvironmentProvider* --- Set the default *`value`* for *`key`* in `$appEnvironment.config`.

```javascript
$appEnvironmentProvider
    .setDefault('apiUrl', '/api/');
```

#### $appEnvironmentProvider.setDefaults(Object *`properties`*)
*Returns $appEnvironmentProvider* --- Set multiple default values for `$appEnvironment.config` at once.

```javascript
$appEnvironmentProvider
    .setDefaults({
        titlePrefix: '',
        apiUrl: '/api/',
    });
```

### Service

#### $appEnvironment.is(String *`environmentName`*)
*Returns Boolean* --- `true` if the current environment name is *`environmentName`*, otherwise `false`.

```javascript
if (!$appEnvironment.is('production')) {
    // Logic that will effect all environments except 'production'
}
```

#### $appEnvironment.environmentName
*String* --- The name of the current environment

```javascript
if ('testing' === $appEnvironment.environmentName) {
    // Logic that will only effect the 'testing' environment
} else {
    // Logic that will effect all environments except 'testing'
}
```

#### $appEnvironment.config
*AppEnvironmentConfig* --- Configuration object for the current environment, values are read-only.

```javascript
$document[0].title = $appEnvironment.config.titlePrefix + 
    'MyApp - Created by things, for things';
```

#### $appEnvironment.hostname
*String* -- The hostname of the current environment.

```javascript
if ('localhost' === $appEnvironment.hostname) {
    // Logic that will only occur if the hostname used to identify the current
    // environment was 'localhost'
}
```

#### $appEnvironment.isDefault
*Boolean* --- `true` if default environment configuration is being used, otherwise `false`.