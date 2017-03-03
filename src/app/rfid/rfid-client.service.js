'use strict';

var AxRfidClient = require('./rfid-client');
var angular = require('angular');

angular.module('rfid').factory('rfidClientService', ['RFID_CONFIG','$log', function (RFID_CONFIG, $log) {
    var axRfidClient = new AxRfidClient({
        host: RFID_CONFIG.HOST,
        port: RFID_CONFIG.PORT,
        isDebug: RFID_CONFIG.DEBUG,
        debugLogger: $log.debug.bind($log),
        errorLogger: $log.error.bind($log)
    });
    if (RFID_CONFIG.DEBUG) {
        var debugSubscription = axRfidClient.getDebugSubject().subscribe(
            function (message) {
                $log.debug('message: ' + JSON.stringify(message))
            },
            function (e) {
                $log.debug('error: ' + e);
            },
            angular.noop
        );
    }
    var tagStore = axRfidClient.getTagStore();
    return {
        setErrorHandler: function (errorHandler) {
            axRfidClient.setErrorHandler(errorHandler);
        },
        reload: function () {
            axRfidClient.reload();
        },
        setCheckoutState: function (id, isCheckoutState) {
            return axRfidClient.setCheckoutState(id, isCheckoutState);
        },

        connect: function (name) {
            axRfidClient.connect(name);
        },
        disconnect: function () {
            axRfidClient.disconnect();
        },
        subscribe: function (subscription) {
            return tagStore.subscribe(subscription);
        }
    }
}]);