var AxRfidClient;
if (typeof require !== "undefined") {
  AxRfidClient = require('./rfid-client').Client;
  var angular = require('angular');
} else {
  AxRfidClient = AxRfid.Client;
}

(function (angular, AxRfidClient) {
  'use strict';

  angular.module('rfid')
    .provider('errorLogger', errorLoggerProvider)
    .provider('workplace', workplaceProvider)
    .provider('rfidClient', rfidClientProvider);

  rfidClientProvider.$inject = ['RFID_CONFIG'];
  workplaceProvider.$inject = ['WORKPLACE'];

  function rfidClientProvider(RFID_CONFIG) {

    this.$get = ["errorLogger", "$log", function (errorLogger, $log) {
      return new AxRfid.Client({
        isDebug: RFID_CONFIG.isDebug,
        readerProbeInterval: RFID_CONFIG.readerProbeInterval,
        debugLogger: $log.debug.bind($log),
        errorLogger: errorLogger
      });
    }];
  }

  function errorLoggerProvider() {

    this.$get = ["$log", function ($log) {
      return function (message) {
        $log.error(message);
      };
    }];
  }

  function workplaceProvider(WORKPLACE) {

    this.$get = ["$window", function ($window) {
      return {
        name: $window.navigator.userAgent,
        hostname: WORKPLACE.host,
        port: WORKPLACE.port
      }
    }];
  }
})(angular, AxRfidClient);