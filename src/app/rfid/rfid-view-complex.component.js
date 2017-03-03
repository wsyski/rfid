'use strict';

var angular = require('angular');

angular.module('rfid').component('rfidViewComplex', {
    bindings: {
    },
    controller: function (rfidClientService, $scope, $window, $log, utilService) {

        function setCheckoutState(id,isCheckoutState) {
            var result = rfidClientService.setCheckoutState(id, isCheckoutState);
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
            rfidClientService.setErrorHandler(errorHandler);
            self.tagStoreSubscription = rfidClientService.subscribe(function (data) {
                $log.debug('tagStore: '+JSON.stringify(data));
                $scope.$evalAsync(function () {
                    self.tagStore = data;
                });
            });
        };
        self.$onDestroy = function() {
            if (self.tagStore.isConnected) {
                rfidClientService.disconnect();
            }
            $log.debug('Unsubscribe');
            self.tagStoreSubscription.unsubscribe();
        };
        self.connect = function() {
            var result=rfidClientService.connect($window.navigator.userAgent);
            var connectSubscription=result.subscribe(
                angular.noop,
                function(e){
                    errorHandler(e);
                },
                function(){
                    connectSubscription.dispose();
                },
            );
        };
        self.disconnect = rfidClientService.disconnect;
        self.reload = rfidClientService.reload;
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
