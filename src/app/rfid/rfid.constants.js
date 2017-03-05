var angular = require('angular');

(function (angular) {
    'use strict';

    angular.module('rfid')
        .constant('RFID_CONFIG', {
            readerProbeInterval: 30000,
            debug: true
        })
        .constant('WORKPLACE', {
            host: 'lulpreserv3',
            port: 7000
        });
})(angular);
