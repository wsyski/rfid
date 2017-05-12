var angular = require('angular');

(function (angular) {
  'use strict';

  angular.module('rfid')
    .constant('RFID_CONFIG', {
      protocol: 'wss',
      readerProbeInterval: 30000,
      isDebug: false,
      tagCountMax: 5
    })
    .constant('WORKPLACE', {
      host: 'rfid1-wsproxy.axiell.local',
      port: 443
    });
})(angular);
