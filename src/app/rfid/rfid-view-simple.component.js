'use strict';

var angular = require('angular');

angular.module('rfid').component('rfidViewSimple', {
    bindings: {
    },
    controller: function (axRfidClientService, $scope, $log, workplace, utilService) {

        function errorHandler(e) {
            var message;
            if (e.message) {
                message=e.message;
            }
            else {
                if (e.target instanceof WebSocket) {
                    message = "Websocket error";
                }
                else {
                    message = "RFID Client error";
                }
            }
            utilService.showToast(message);
        }

        var self = this;
        self.tagStore = {};
        self.$onInit = function () {
            $log.debug('Subscribe');
            axRfidClientService.connectAndReload(workplace.name,workplace.hostname,workplace.port);
            self.tagStoreSubscription = axRfidClientService.subscribe(function (data) {
                if (self.tagStore !== data) {
                    $log.debug('tagStore: ' + JSON.stringify(data));
                    $scope.$evalAsync(function () {
                        self.tagStore = data;
                    });
                }
            });
         };
        self.$onDestroy = function() {
            if (self.tagStore.isConnected) {
                axRfidClientService.disconnect();
            }
            $log.debug('Unsubscribe');
            self.tagStoreSubscription.unsubscribe();
        };
    },
    template: require('./rfid-view-simple.template.html')
});
