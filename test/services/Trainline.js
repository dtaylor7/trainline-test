'use strict';

var server = require('../../server/server');
var chai = require('chai');
var expect = chai.expect;

var Trainline = require('../../server/services/Trainline/Trainline');
var serviceIdentifier = 'W93565';
var stationCode = 'wat';

describe('Trainline service', function() {
  afterEach(function(done) {
    server.models.departure.destroyAll({}, function() {
      done();
    });
  });

  describe('Convert CRS to name', function() {
    it('should find a station name given the crs', function(done) {
      expect(Trainline._retrieveCrsName('ABW')).to.equal('Abbey Wood');
      expect(Trainline._retrieveCrsName('CSS')).to.equal('Chessington South');
      expect(Trainline._retrieveCrsName('POO')).to.equal('Poole');
      done();
    });
  });

  describe('Format departures response', function() {
    it('should format the depatures response for the departures model', function(done) {
      var mockData = require('../mock-data/departures.mock.json').services[0];
      expect(mockData).be.ok; // eslint-disable-line

      var formattedResponse = Trainline._formatDeparturesResponse([mockData], stationCode);
      expect(formattedResponse.length).to.equal(1);

      // test the formatted response against the departure model
      server.models.departure.create(formattedResponse, function(err, departures) {
        expect(err).not.be.ok; // eslint-disable-line
        expect(departures.length).to.equal(1);
        done();
      });
    });

    it('should only return departures that are not transport mode TRAIN', function(done) {
      var mockData = require('../mock-data/departures.mock.json').services[0];
      expect(mockData).be.ok; // eslint-disable-line

      // remove the transport mode
      delete mockData.transportMode;

      var formattedResponse = Trainline._formatDeparturesResponse([mockData], stationCode);
      expect(formattedResponse.length).to.equal(0);

      done();
    });
  });

  describe('Format calling pattern response', function() {
    it('should format the calling pattern response for the calling-pattern model', function(done) {
      var mockData = require('../mock-data/calling-pattern.mock.json').service;
      expect(mockData).be.ok;// eslint-disable-line

      var formattedResponse = Trainline._formatCallingPatternResponse(mockData, serviceIdentifier, '2016-11-11');
      expect(formattedResponse).be.ok;// eslint-disable-line

      // test the formatted response against the departure model
      server.models.callingPattern.create(formattedResponse, function(err, callingPattern) {
        expect(err).not.be.ok;// eslint-disable-line
        expect(callingPattern).be.ok;// eslint-disable-line

        done();
      });
    });
  });

  it('should retrieve the calling pattern for a given serviceIdentifier and date', function(done) {
    Trainline.getCallingPattern(serviceIdentifier, '2016-11-11', function(err, resp) {
      expect(err).not.be.ok; // eslint-disable-line
      expect(resp.origin).to.equal('London Waterloo');
      expect(resp.operator).to.equal('SW');
      done();
    });
  });

  it('should retrieve the departures for a given departure station code', function(done) {
    Trainline.getDepartures(stationCode, function(err, resp) {
      expect(err).not.be.ok; // eslint-disable-line
      expect(resp.length).to.equal(42);
      done();
    });
  });
});
