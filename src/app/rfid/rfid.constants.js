var angular = require('angular');

(function (angular) {
    'use strict';

    angular.module('rfid')
        .constant('RFID_CONFIG', {
            protocol: 'wss',
            readerProbeInterval: 30000,
            debug: true
        })
        .constant('WORKPLACE', {
            //host: 'lulpreserv3',
            host: 'rfid.axiell.local',
            port: 8443
        });
})(angular);
