'use strict';

var angular = require('angular');

angular.module('rfid').component('tagStore', {
    bindings: {
    },
    controller: function (rfidClientService, $scope, $window, $log, $mdToast) {

        function setCheckoutState(id,isCheckoutState) {
            var result = self.rfidClientService.setCheckoutState(id, isCheckoutState);
            var subscription = result.subscribe(
                angular.noop,
                function (e) {
                    errorHandler(e);
                },
                function () {
                    subscription.dispose();
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
            showToast(message);
        }

        function showToast(message) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .hideDelay(30000)
                    .position('top')
                    .action('OK'));
        }

        var self = this;
        self.tagStore = {};
        self.$onInit = function () {
            $log.debug('Subscribe');
            self.rfidClientService.setErrorHandler(errorHandler);
            self.subscription = self.rfidClientService.subscribe(function (data) {
                $log.debug('tagStore: '+JSON.stringify(data));
                $scope.$evalAsync(function () {
                    self.tagStore = data;
                });
            });
        };
        self.$onDestroy = function() {
            if (self.tagStore) {
                self.rfidClientService.disconnect();
            }
            $log.debug('Unsubscribe');
            self.subscription.unsubscribe();
        };
        self.rfidClientService = rfidClientService;
        self.connect = function() {
            self.rfidClientService.connect($window.navigator.userAgent);
        };
        self.disconnect = self.rfidClientService.disconnect;
        self.reload = self.rfidClientService.reload;
        self.setCheckoutState = function (isCheckoutState) {
            var tags = self.tagStore.tags;
            tags.forEach(function (tag, index) {
                if (tag.isComplete) {
                    setCheckoutState(tag.id, isCheckoutState);
                }
            });
        };
    },
    template: require('./tag-store.template.html')
});
