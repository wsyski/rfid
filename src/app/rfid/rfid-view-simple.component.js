'use strict';

var angular = require('angular');

angular.module('rfid').component('rfidViewSimple', {
    bindings: {
    },
    controller: function (rfidClientService, $scope, $window, $log, utilService) {

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
            var result=rfidClientService.connect($window.navigator.userAgent);
            var connectSubscription=result.subscribe(
                angular.noop,
                function(e){
                   errorHandler(e);
                },
                function(){
                    connectSubscription.dispose();
                    rfidClientService.reload();
                },
            );
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
    },
    template: require('./rfid-view-simple.template.html')
});
