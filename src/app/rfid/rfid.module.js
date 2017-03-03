'use strict';

var angular = require('angular'),
    util = require('../util/util.module');

module.exports = angular.module('rfid', ['util']);

require('./rfid.constants');
require('./rfid-client.service');
require('./tag-detail.component');
require('./tag-store.component');
require('./rfid-view-complex.component');
require('./rfid-view-simple.component');
