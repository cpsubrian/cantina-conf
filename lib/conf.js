// Module depencies
var amino = require('amino'),
    optimist = require('optimist'),
    nconf = require('nconf'),
    argv = {};

var Conf = module.exports = function() {
  this.parseOptions();
  this.setupNconf();
  this.setupAmino();
};

Conf.prototype = {

  parseOptions: function(args) {
    if (typeof args === 'undefined') {
      args = process.argv;
    }

    argv = optimist(args)
      .default('s', 'memory')
      .default('f', 'config.json')
      .default('rh', 'localhost')
      .default('rp', 6379)
      .default('rd', 0)
      .default('n', 'cantina:conf')
      .default('p', 'amino-pubsub-redis')
      .default('r', 'amino-request-http')
      .alias('s', 'store')
      .alias('f', 'filepath')
      .alias('rh', 'redishost')
      .alias('rp', 'redisport')
      .alias('rd', 'redisdb')
      .alias('n', 'namespace')
      .alias('p', 'pubsub')
      .alias('r', 'request')
      .argv;
  },

  setupNconf: function() {
    switch (argv.store) {
      case 'memory':
        nconf.use('memory');
        break;

      case 'file':
        nconf.file({
          file: argv.filepath
        });
        break;

      case 'redis':
        require('nconf-redis');
        nconf.use('redis', {
          host: argv.redishost,
          port: argv.redisport,
          db: argv.redisdb,
          namespace: argv.namespace
        });
        break;
    }
  },

  reset: function() {
    var self = this;
    var done = null;

    if (typeof arguments[0] === 'function') {
      done = arguments[0];
    }

    if (argv.store === 'memory' || argv.store === 'file') {
      nconf.reset();
      self.afterReset();
    }
    else {
      nconf.reset(function(err) {
        self.afterReset();
        done(err);
      })
    }
  },

  afterReset: function() {
    nconf.remove('memory');
    nconf.remove('file');
    nconf.remove('redis');
    this.setupNconf();
  },

  setupAmino: function() {
    var self = this;

    amino.use(require(argv.pubsub));
    amino.use(require(argv.request));

    // Setup service responses.
    amino.respond('conf', function(router, spec) {

      // Get confiuration values.
      router.get(/(.+)/, function(key) {
        key = key.replace('/', ':');
        this.res.json(nconf.get(key));
      });

      // Get ALL confiuration values.
      router.get('/', function() {
        this.res.json(nconf.stores[argv.store].store);
      });

      // Set configuration values.
      router.put(/(.+)/, function(key) {
        var res = this.res;
        nconf.set(key, this.req.body);
        nconf.get(key);
        nconf.save(function(err) {
          // TODO: handle error?
          res.json({status: 'success'});
        });
      });

      // Add new configuration values.
      router.post('/', function() {
        var res = this.res;
        var data = this.req.body;
        Object.keys(data).forEach(function(name) {
          nconf.set(name, data[name]);
        });
        nconf.save(function(err) {
          // TODO: handle error?
          res.json({status: 'success'});
        });
      });

      // Clear configuration values.
      router.delete(/(.+)/, function(key) {
        var res = this.res;
        nconf.clear(key);
        nconf.save(function(err) {
          // TODO: handle error?
          res.json({status: 'success'});
        });
      });

      self.log('Ready to respond to "amino://conf" requests on ' + spec.host + ':' + spec.port);
    });

    self.log('Starting up Cantina Conf service ...');
  },

  log: function(msg) {
    if (!module.parent) {
      console.log(msg);
    }
  }
};
