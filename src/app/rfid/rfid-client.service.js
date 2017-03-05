'use strict';

var angular = require('angular');

angular.module('rfid').factory('rfidClientService', ['rfidClient', '$log', 'RFID_CONFIG', function (rfidClient, $log, RFID_CONFIG) {
    if (RFID_CONFIG.debug) {
        var debugSubscription = rfidClient.getDebugSubject().subscribe(
            function (message) {
                $log.debug('message: ' + JSON.stringify(message))
            },
            function (e) {
                $log.debug('error: ' + e);
            },
            angular.noop
        );
    }
    var tagStore = rfidClient.getTagStore();
    return {
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
    }
}]);