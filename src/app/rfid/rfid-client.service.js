var angular = require('angular');

(function (angular) {
    'use strict';

    angular.module('rfid').factory('rfidClientService', ['rfidClient', '$log', 'RFID_CONFIG', function (rfidClient, $log, RFID_CONFIG) {
        function isRfidEnabled(workplace) {
            return workplace && workplace.hostname && workplace.port;
        }

        if (RFID_CONFIG.debug) {
            var debugSubscription = rfidClient.getDebugSubject().subscribe(
                function (message) {
                    $log.debug('message: ' + JSON.stringify(message));
                },
                function (e) {
                    $log.debug('error: ' + e);
                },
                angular.noop
            );
        }
        var tagStore = rfidClient.getTagStore();
        return {
            isRfidEnabled: function(workplace) {
                return isRfidEnabled(workplace);
            },
            setErrorHandler: function (errorHandler) {
                rfidClient.setErrorHandler(errorHandler);
            },
            reload: function () {
                rfidClient.reload();
            },
            setCheckoutState: function (id, isCheckoutState) {
                return rfidClient.setCheckoutState(id, isCheckoutState);
            },

            connect: function (name, host, port) {
                return rfidClient.connect(name, host, port);
            },
            disconnect: function () {
                rfidClient.disconnect();
            },
            subscribe: function (subscription) {
                return tagStore.subscribe(subscription);
            }
        };
    }]);
})(angular);
