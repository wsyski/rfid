var AxRfidClient = require('./rfid-client').Client;
var angular = require('angular');

(function (angular,AxRfidClient) {
    'use strict';

angular.module('rfid')
    .provider('rfidClient', ['RFID_CONFIG', function (RFID_CONFIG) {
        var $log =  angular.injector(['ng']).get('$log');
        var rfidClient = new AxRfidClient({
            isDebug: RFID_CONFIG.debug,
            readerProbeInterval: RFID_CONFIG.readerProbeInterval,
            debugLogger: $log.debug.bind($log),
            errorLogger: $log.error.bind($log)
        });
        return {
            $get: function () {
                return rfidClient;
            }
        }
    }])
    .provider('workplace', ['WORKPLACE', function (WORKPLACE) {
        var $window =  angular.injector(['ng']).get('$window');
        return {
            $get: function () {
                return {
                    name: $window.navigator.userAgent,
                    hostname: WORKPLACE.host,
                    port: WORKPLACE.port
                }
            }
        }
    }]);
})(angular,AxRfidClient);