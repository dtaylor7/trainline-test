'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');

chai.should();
chai.config.includeStack = true;

require('./mock-data');
