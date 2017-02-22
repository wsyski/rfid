'use strict';

var AxRfidClient = require('./ax-rfid-client');
var angular = require('angular');

angular.module('rfid').factory('rfidClientService', ['$window', function ($window) {
    var host = 'lulpreserv3';
    var port = 7000;
    var axRfidClient = new AxRfidClient({host: host, port: port, name: $window.navigator.userAgent, isDebug: true});
    var debugSubscription = axRfidClient.getDebugSubject().subscribe(
        function (message) {
            console.log("message: %s", JSON.stringify(message))
        },
        function (e) {
            console.error("error: %s", e);
        },
        angular.noop
    );
    var tagStore = axRfidClient.getTagStore();
    return {
        reload: function () {
            axRfidClient.reload();
        },
        setCheckoutState: function (id, isCheckoutState) {
            var result = axRfidClient.setCheckoutState(id, isCheckoutState);
            var subscription = result.subscribe(
                function (message) {
                },
                function (e) {
                    subscription.dispose();
                    onError(e);
                },
                function () {
                    subscription.dispose();
                }
            );
        },

        connect: function () {
            axRfidClient.connect();
        },
        disconnect: function () {
            axRfidClient.disconnect();
        },
        subscribe: function (subscription) {
            return tagStore.subscribe(subscription);
        },
        unsubscribe: function (subscription) {
            subscription.unsubscribe();
        }
    }
}]);