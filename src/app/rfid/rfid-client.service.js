'use strict';

var AxRfidClient = require('./ax-rfid-client');
var angular = require('angular');

angular.module('rfid').factory('rfidClientService', ['RFID_CONFIG', function (RFID_CONFIG) {
    var axRfidClient = new AxRfidClient({host: RFID_CONFIG.HOST, port: RFID_CONFIG.PORT, isDebug: RFID_CONFIG.DEBUG});
    if (RFID_CONFIG.DEBUG) {
        var debugSubscription = axRfidClient.getDebugSubject().subscribe(
            function (message) {
                console.log("message: %s", JSON.stringify(message))
            },
            function (e) {
                console.error("error: %s", e);
            },
            angular.noop
        );
    }
    var tagStore = axRfidClient.getTagStore();
    return {
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