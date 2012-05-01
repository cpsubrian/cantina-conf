/**
 * Cantina: Conf
 *
 * Centralized configuration for Cantina applications.
 *
 * Persists to:
 *   - memory (default)
 *   - file
 *   - redis
 *
 * Basically, a wrapper around nconf.
 */

// Module depencies
var amino = require('amino'),
    optimist = require('optimist'),
    nconf = require('nconf');

// Setup option parsing.
var argv = optimist
  .default('s', 'memory')
  .default('f', 'config.json')
  .default('rh', 'localhost')
  .default('rp', 6379)
  .default('rd', 0)
  .default('n', 'cantina:conf')
  .default('p', 'amino-pubsub-redis')
  .default('r', 'amino-request-http')
  .alias('s', 'storage')
  .alias('f', 'filepath')
  .alias('rh', 'redishost')
  .alias('rp', 'redisport')
  .alias('rd', 'redisdb')
  .alias('n', 'namespace')
  .alias('p', 'pubsub')
  .alias('r', 'request')
  .argv;

// Setup nconf & persistence.
nconf.argv().env();
if (argv.storage === 'file') {
  nconf.file({
    file: argv.filepath
  });
}
else if (argv.storage === 'redis') {
  require('nconf-redis');
  nconf.use('redis', {
    host: argv.redishost,
    port: argv.redisport,
    db: argv.redisdb,
    namespace: argv.namespace
  });
}

// Setup amino.
amino.use(require(argv.pubsub));
amino.use(require(argv.request));
amino.respond('conf', function(router, spec) {

  // Get confiuration values.
  router.get(/(.*)/, function(key) {
    key = key.replace('/', ':');
    this.res.json(nconf.get(key));
  });

  // Set configuration values.
  router.post(/(.*)/, function(key) {
    nconf.set(key);
    nconf.save();
    this.res.json({status: 'success'});
  });

  // Clear configuration values.
  router.delete(/(.*)/, function(key) {
    nconf.clear(key);
    nconf.save();
    this.res.json({status: 'success'});
  });

  console.log('Ready to respond to "amino://conf" requests on ' + spec.host + ':' + spec.port);

});

console.log('Starting up Cantina Conf service ...');

