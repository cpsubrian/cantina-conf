**This module is deprecated.  It was a proof of concept but is no longer necessary.**
___

Cantina: Conf
==============

This service provides a distributed configuration endpoint for
[Cantina](https://github.com/cantina) apps with several optional
persistence back-ends.  Its powered by the [Amino](https://github.com/cantina/amino)
clustered application toolkit.


Command-line Startup Options
----------------------------

Start up a configuration server like:

    node index.js [options]

The following options are supported (though not all are always used).

  * `-s` or `--store` : Storage engine ('memory', 'file', or 'redis')
  * `-f` or `--filepath` : Filepath to a .json file (if file store is used)
  * `-rh` or `--redishost` : Host for redis store
  * `-rp` or `--redisport` : Port fo redis store
  * `-rd` or `--redisdb` : DB for redis store
  * `-n` or `--namespace` : Key namspace for redis store
  * `-p` or `--pubsub` : Amino PubSub driver (ex. 'amino-pubsub-redis')
  * `-r` or `--request` : Amino Request driver (ex. 'amino-request-http')


API
----

Interaction with the configuration service happens primarily through
amino requests.

### Get the value of a configuration variable ###

```js
amino.request('amino://conf/path/to/your/variable', function(err, response, body) {
  // Body will contain your value.
  console.log(body);
});
```

You can fetch a hierarchy of configuration by requesting just part
of a path.

```js
amino.request('amino://conf/path/to', function(err, response, body) {
  // Body will contain a partial configuration object.
  console.dir(body);
});
```

To fetch the full configuration, just request '/'.mak

```js
amino.request('amino://conf', function(err, response, body) {
  // Body will contain the entire configuration.
  console.dir(body);
});
```


### Set a configuration value ###

```js
amino.request({
  uri: 'amino://conf/my/variable',
  method: 'PUT',
  json: 'value'
}, function(err, response, body) {
  // Respond to errors.
});
```

You values can be primatives, objects, or arrays.

```js
amino.request({
  uri: 'amino://conf/my/array',
  method: 'PUT',
  json: ['a', 'b', 'c']
}, function(err, response, body) {
  // Respond to errors.
});
```


### 'Merge' in a new configuration object via POST

```js
amino.request({
  uri: 'amino://conf',
  method: 'POST',
  json: {hair: 'blonde', age: 28}
}, function(err, response, body) {
  // Respond to errors.
});
```

WARNING: This merge is a flat merge; All top-level keys will be
completely overwritten!


### Delete a configuration value ###

```js
amino.request({
  uri: 'amino://conf/my/variable',
  method: 'DELETE'
}, funtion(err, response, body) {
  // Respond to errors.
});
```
