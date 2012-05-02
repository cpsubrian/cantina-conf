/**
 * Tests for Cantina: Conf
 */

var assert = require('chai').assert,
    fs = require('fs'),
    conf = require('../'),
    amino = require('amino');

describe('Configuration: File Store', function() {
  var filepath = 'test/file-store-test-config.json';

  // Write some data to a config file and set up file store.
  before(function(done) {
    fs.open(filepath, 'w+', function(err, fd) {
      fs.write(fd, JSON.stringify({cobwebs: 'were here'}));
      fs.close(fd, function(err) {
        conf.parseOptions(['-s', 'file', '-f', filepath])
        conf.reset();
        done();
      });
    });
  });

  // Delete temp config file.
  after(function(done) {
    fs.unlink(filepath, done);
  });

  it('sets and gets single key/value combination via PUT', function(done) {
    var options = {
      uri: 'amino://conf/color',
      method: 'PUT',
      json: 'red'
    };
    amino.request(options, function(err, response, body) {
      assert.ifError(err);
      assert.equal(body.status, 'success', 'status is success');

      amino.request('amino://conf/color', function(err, response, body) {
        assert.ifError(err);
        assert.equal(body, 'red');
        done();
      });

    });
  });

  it('sets hierarchical values, then gets single value via PUT', function(done) {
    var options = {
      uri: 'amino://conf/favorites',
      method: 'PUT',
      json: {movie: 'The Matrix', band: 'Metallica'}
    };
    amino.request(options, function(err, response, body) {
      assert.ifError(err);
      assert.equal(body.status, 'success', 'status is success');

      amino.request('amino://conf/favorites/movie', function(err, response, body) {
        assert.ifError(err);
        assert.equal(body, 'The Matrix');
        done();
      });
    });
  });

  it('sets hierarchical values, then gets hierarchical values via PUT', function(done) {
    var options = {
      uri: 'amino://conf/favorites',
      method: 'PUT',
      json: {movie: 'The Matrix', band: 'Metallica'}
    };
    amino.request(options, function(err, response, body) {
      assert.ifError(err);
      assert.equal(body.status, 'success', 'status is success');

      amino.request('amino://conf/favorites', function(err, response, body) {
        assert.ifError(err);
        assert.deepEqual(body, options.json);
        done();
      });
    });
  });

  it('gets the whole configuration', function(done) {
    amino.request('amino://conf', function(err, response, body) {
      assert.ifError(err);
      assert.deepEqual(body, {cobwebs: 'were here', color: 'red', favorites: {movie: 'The Matrix', band: 'Metallica'}});
      done();
    });
  });

  it('sets new configuration via POST', function(done) {
    var options = {
      uri: 'amino://conf',
      method: 'POST',
      json: {favorites: {tv: 'Game of Thrones'}, name: 'Brian'}
    };
    amino.request(options, function(err, response, body) {
      assert.ifError(err);
      assert.equal(body.status, 'success', 'status is success');

      amino.request('amino://conf', function(err, response, body) {
        assert.ifError(err);
        assert.deepEqual(body, {cobwebs: 'were here', color: 'red', favorites: {tv: 'Game of Thrones'}, name: 'Brian'});
        done();
      });
    });
  });

  it('deletes values', function(done) {
    amino.request({uri: 'amino://conf/color', method: 'DELETE'}, function(err, response, body) {
      assert.ifError(err);
      assert.equal(body.status, 'success', 'status is success');

      amino.request('amino://conf/color', function(err, response, body) {
        assert.isUndefined(body);
        done();
      });
    });
  });

});
