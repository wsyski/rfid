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
            host: 'rfid0-wsproxy.axiell.local',
            port: 443
        });
})(angular);
