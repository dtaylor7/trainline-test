'use strict';

var async = require('async');
var moment = require('moment');
var Trainline = require('../services/Trainline/Trainline');
var disableModelMethods = require('../helpers/disableModelMethods');

module.exports = function(Departure) {
  disableModelMethods(Departure);

  Departure.getCachedItems = function(stationCode, cb) {
    Departure.find({
      where: {
        createdAt: {
          gt: moment().subtract('1', 'minutes').toDate(),
        },
        stationCode: stationCode,
      },
    }, cb);
  };

  Departure.getItemsFromTrainLine = function(stationCode, cb) {
    Trainline.getDepartures(stationCode, function(err, departures) {
      if (err) {
        return cb(err);
      }

      // cache items for retrieval later
      Departure.create(departures, cb);
    });
  };

  Departure.findDepartures = function(stationCode, cb) {
    async.waterfall([

      // find cached departures that are less than a minute old
      function(callback) {
        Departure.getCachedItems(stationCode, callback);
      },

      // if not cached departures are found then query the Trainline endpoints
      function(departures, callback) {
        if (departures && departures.length) {
          return callback(undefined, departures);
        }

        Departure.getItemsFromTrainLine(stationCode, callback);
      },

    ], cb);
  };

  Departure.remoteMethod(
    'findDepartures',
    {
      description: 'Find departures',
      http: {verb: 'get', path: '/:stationCode'},
      accepts: {arg: 'stationCode', type: 'string', required: true},
      returns: {
        arg: 'departures',
        type: 'array',
        root: true,
        default: [
          {
            'serviceIdentifier': 'W91610',
            'destination': 'Reading',
            'operator': 'SW',
            'platform': '-',
            'expected': 'Delayed',
            'arrivalTime': '2016-12-02T16:23:00.000Z',
          },
        ],
      },
    }
  );
};
