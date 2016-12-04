'use strict';

var server = require('../../server/server');
var chai = require('chai');
var expect = chai.expect;
var moment = require('moment');

var serviceIdentifier = 'W93565';

describe('calling-pattern model', function() {
  afterEach(function(done) {
    server.models.callingPattern.destroyAll({}, function() {
      done();
    });
  });

  it('should retireve cached items', function(done) {
    server.models.callingPattern.callingPattern(serviceIdentifier, function(err) {
      expect(err).not.be.ok; // eslint-disable-line

      server.models.callingPattern.getCachedItems(serviceIdentifier, moment().format('YYYY-MM-DD'), function(err, response) {
        expect(err).not.be.ok; // eslint-disable-line
        expect(response).be.ok; // eslint-disable-line
        done();
      });
    });
  });

  it('should retireve items from the trainline', function(done) {
    server.models.callingPattern.callingPattern(serviceIdentifier, function(err, response) {
      expect(err).not.be.ok; // eslint-disable-line
      expect(response).be.ok; // eslint-disable-line
      done();
    });
  });

  it('should retireve items from the trainline and cache them', function(done) {
    server.models.callingPattern.callingPattern(serviceIdentifier, function(err) {
      expect(err).not.be.ok; // eslint-disable-line

      server.models.callingPattern.find({}, function(err, callingPatterns) {
        expect(err).not.be.ok; // eslint-disable-line
        expect(callingPatterns.length).to.equal(1);
        done();
      });
    });
  });
});
