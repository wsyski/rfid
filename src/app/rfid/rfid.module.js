var angular = require('angular'),
    util = require('../util/util.module');
(function (angular) {
    'use strict';

    module.exports = angular.module('rfid', ['util']);
})(angular);

require('./rfid.constants');
require('./rfid.providers');
require('./rfid-client.service');
require('./rfid-events.directive');
require('./tag-detail.component');
require('./tag-store.component');
require('./rfid-view-complex.component');
require('./rfid-view-simple.component');
require('./rfid-view-form.component');
