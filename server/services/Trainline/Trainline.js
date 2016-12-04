var app = require('../../server');
var moment = require('moment');
var config = app.get('services').trainline || {};
var request = require('request');
var crsNameMaps = require('./crs_name_map.json');

var retrieveCrsName = function(crs) {
  return crsNameMaps.find(crsNameMap => {
    return crsNameMap.crs === crs;
  }).name;
};

var formatDeparturesResponse = function(services, stationCode) {
  services = services.filter(service => {
    return service.transportMode === 'TRAIN';
  });

  return services.map(service => {
    var expected;
    if (!service.realTimeUpdatesInfo.realTimeServiceInfo) {
      expected = 'Unkown';
    } else {
      expected = service.realTimeUpdatesInfo.realTimeServiceInfo.realTime ? moment(service.realTimeUpdatesInfo.realTimeServiceInfo.realTime).format('HH:mm') : 'Delayed';
    }
    return {
      stationCode: stationCode,
      serviceIdentifier: service.serviceIdentifier,
      destination: retrieveCrsName(service.destinationList[0].crs),
      operator: service.serviceOperator,
      platform: '-',
      expected: expected,
      due: moment(service.scheduledInfo.scheduledTime).format('HH:mm'),
    };
  });
};

var formatCallingPatternResponse = function(service, serviceIdentifier, date) {
  return {
    origin: retrieveCrsName(service.serviceOrigins[0]),
    destination: retrieveCrsName(service.serviceDestinations[0]),
    operator: service.serviceOperator,
    serviceIdentifier: serviceIdentifier,
    date: date,
    stops: service.stops.map((stop, index) => {
      var arrivalDepature = index === service.stops.length - 1 ? stop.arrival : stop.departure;
      var expected;
      if (!arrivalDepature.realTime.realTimeServiceInfo) {
        expected = 'Unkown';
      } else {
        expected = arrivalDepature.realTime.realTimeServiceInfo.realTime ? moment(arrivalDepature.realTime.realTimeServiceInfo.realTime).format('HH:mm') : 'Delayed';
      }
      return {
        name: retrieveCrsName(stop.location.crs),
        due: moment(arrivalDepature.scheduled.scheduledTime).format('HH:mm'),
        expected: moment(arrivalDepature.realTime.realTimeServiceInfo.realTime).format('HH:mm'),
      };
    }),
  };
};

var makeRequest = function(url, cb) {
  request({
    url: url,
  },
  function(error, response, body) {
    if (error) {
      return cb(error);
    }

    var data = JSON.parse(body);

    if (response.statusCode !== 200) {
      return cb({
        statusCode: response.statusCode,
        message: data,
      });
    }

    cb(undefined, data);
  });
};

var Trainline = {
  getCallingPattern: function(serviceIdentifier, date, cb) {
    makeRequest(`${config.base_url}/${config.calling_pattern_endpoint}/${serviceIdentifier}/${date}`, function(err, data) {
      if (err) {
        return cb(err);
      }

      var response = formatCallingPatternResponse(data.service, serviceIdentifier, date);

      response.serviceIdentifier = serviceIdentifier;
      response.date = date;

      cb(undefined, response);
    });
  },
  getDepartures: function(stationCode, cb) {
    makeRequest(`${config.base_url}/${config.depatures_endpoint}/${stationCode}`, function(err, data) {
      if (err) {
        return cb(err);
      }

      var response = formatDeparturesResponse(data.services, stationCode);

      cb(undefined, response);
    });
  },
  _retrieveCrsName: retrieveCrsName,
  _formatDeparturesResponse: formatDeparturesResponse,
  _formatCallingPatternResponse: formatCallingPatternResponse,
};

module.exports = Trainline;
