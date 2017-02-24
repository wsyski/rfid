'use strict';

var angular = require('angular');

angular.module('rfid').component('tagStore', {
    bindings: {
    },
    controller: function (rfidClientService, $scope, $window) {
        var self = this;
        self.tagStore = {};
        self.$onInit = function () {
            console.log('Subscribe');
            self.subscription = self.rfidClientService.subscribe(function (data) {
                console.log('tagStore: '+JSON.stringify(data));
                $scope.$evalAsync(function () {
                    self.tagStore = data;
                });
            });
        };
        self.$onDestroy = function() {
            if (self.tagStore) {
                self.rfidClientService.disconnect();
            }
            console.log('Unsubscribe');
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
                    self.rfidClientService.setCheckoutState(tag.id, isCheckoutState);
                }
            });
        };
    },
    template: require('./tag-store.template.html')
});
