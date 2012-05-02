/**
 * Tests for Cantina: Conf
 */

var assert = require('chai').assert,
    conf = require('../'),
    amino = require('amino');

describe('Configuration: Memory Store', function() {
  conf.parseOptions(['-s', 'memory'])
  conf.reset();

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
      assert.deepEqual(body, {color: 'red', favorites: {movie: 'The Matrix', band: 'Metallica'}});
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
        assert.deepEqual(body, {color: 'red', favorites: {tv: 'Game of Thrones'}, name: 'Brian'});
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
