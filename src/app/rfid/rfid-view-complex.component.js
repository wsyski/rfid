'use strict';

var angular = require('angular');

angular.module('rfid').component('rfidViewComplex', {
    bindings: {
    },
    controller: function (axRfidClientService, $scope, $log, workplace, utilService) {

        function setCheckoutState(id,isCheckoutState) {
            var result = axRfidClientService.setCheckoutState(id, isCheckoutState);
            var cmdSubscription = result.subscribe(
                angular.noop,
                function (e) {
                    errorHandler(e);
                },
                function () {
                    cmdSubscription.dispose();
                }
            );
        }

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
            axRfidClientService.setErrorHandler(errorHandler);
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
        self.connect = function() {
            axRfidClientService.connectAndReload(workplace.name,workplace.hostname,workplace.port);
        };
        self.disconnect = axRfidClientService.disconnect;
        self.reload = axRfidClientService.reload;
        self.setCheckoutState = function (isCheckoutState) {
            var tags = self.tagStore.tags;
            tags.forEach(function (tag, index) {
                if (tag.isComplete) {
                    setCheckoutState(tag.id, isCheckoutState);
                }
            });
        };
    },
    template: require('./rfid-view-complex.template.html')
});
