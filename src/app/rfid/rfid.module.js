'use strict';

var angular = require('angular');

module.exports = angular.module('rfid', []);

require('./tag-detail.component');
require('./tag-store.component');
require('./rfid-client.service');
require('./rfid.constants');