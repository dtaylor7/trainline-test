'use strict';

var async = require('async');
var moment = require('moment');
var Trainline = require('../services/Trainline/Trainline');
var disableModelMethods = require('../helpers/disableModelMethods');

module.exports = function(CallingPattern) {
  disableModelMethods(CallingPattern);

  CallingPattern.getCachedItems = function(serviceIdentifier, date, cb) {
    var now = new Date();
    now.setMinutes(now.getMinutes() - 1);

    CallingPattern.findOne({
      where: {
        serviceIdentifier: serviceIdentifier,
        date: date,
        createdAt: {
          gt: now,
        },
      },
    }, cb);
  };

  CallingPattern.getItemsFromTrainLine = function(serviceIdentifier, date, cb) {
    Trainline.getCallingPattern(serviceIdentifier, date, function(err, callingPatterns) {
      if (err) {
        return cb(err);
      }

      // cache items for retrieval later
      CallingPattern.create(callingPatterns, cb);
    });
  };

  CallingPattern.callingPattern = function(serviceIdentifier, cb) {
    var date = moment().format('YYYY-MM-DD');

    async.waterfall([

      // find cached departures that are less than a minute old
      function(callback) {
        CallingPattern.getCachedItems(serviceIdentifier, date, callback);
      },

      // if not cached departures are found then query the Trainline endpoints
      function(callingPatterns, callback) {
        if (callingPatterns && callingPatterns.length) {
          return callback(undefined, callingPatterns);
        }

        CallingPattern.getItemsFromTrainLine(serviceIdentifier, date, callback);
      },
    ], cb);
  };

  CallingPattern.remoteMethod(
    'callingPattern',
    {
      description: 'Find calling pattern for given service identifier.',
      http: {verb: 'get', path: '/:serviceIdentifier'},
      accepts: [
        {arg: 'serviceIdentifier', type: 'string', required: true},
      ],
      returns: {
        arg: 'callingPattern',
        type: 'object',
        root: true,
        default: {
          'origin': 'London Waterloo',
          'destination': 'Chessington South',
          'serviceIdentifier': 'W93641',
          'date': '2016-12-02',
          'stops': [
            {
              'name': 'London Waterloo',
              'departureTime': '2016-12-02T16:15:00.000Z',
              'expected': 'Delayed',
            },
          ],
        },
      },
    }
  );
};
