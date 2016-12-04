'use strict';

var server = require('../../server/server');
var chai = require('chai');
var expect = chai.expect;

var stationCode = 'wat';

describe('departure model', function() {
  afterEach(function(done) {
    server.models.departure.destroyAll({}, function() {
      done();
    });
  });

  it('should retireve cached items', function(done) {
    server.models.departure.findDepartures(stationCode, function(err) {
      expect(err).not.be.ok; // eslint-disable-line
      server.models.departure.getCachedItems(stationCode, function(err, response) {
        expect(err).not.be.ok; // eslint-disable-line
        expect(response).be.ok; // eslint-disable-line
        done();
      });
    });
  });

  it('should retireve items from the trainline', function(done) {
    server.models.departure.findDepartures(stationCode, function(err, response) {
      expect(err).not.be.ok; // eslint-disable-line
      expect(response).be.ok; // eslint-disable-line
      done();
    });
  });

  it('should retireve items from the trainline and cache them', function(done) {
    server.models.departure.findDepartures(stationCode, function(err) {
      expect(err).not.be.ok; // eslint-disable-line

      server.models.departure.find({}, function(err, departures) {
        expect(err).not.be.ok; // eslint-disable-line
        expect(departures.length).to.equal(42);
        done();
      });
    });
  });
});
