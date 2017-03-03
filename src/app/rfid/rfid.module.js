'use strict';

var angular = require('angular'),
    util = require('../util/util.module');

module.exports = angular.module('rfid', ['util']);

require('./tag-detail.component');
require('./tag-store.component');
require('./rfid-client.service');
require('./rfid.constants');