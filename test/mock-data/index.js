'use strict';

var nock = require('nock');
var server = require('../../server/server');
var config = server.get('services').trainline || {};

var callingPatterRegex = new RegExp(`${config.calling_pattern_endpoint}(.*)`, 'g');
nock(`${config.base_url}`)
  .persist()
  .get(callingPatterRegex)
  .replyWithFile(200, __dirname + '/../mock-data/calling-pattern.mock.json');

var departuresRegex = new RegExp(`${config.depatures_endpoint}(.*)`, 'g');
nock(`${config.base_url}`)
  .persist()
  .get(departuresRegex)
  .replyWithFile(200, __dirname + '/../mock-data/departures.mock.json');
