'use strict';

var angular = require('angular');

angular.module('rfid').component('tagStore', {
    bindings: {},
    controller: function (rfidClientService, $scope) {
        var self = this;
        self.tagStore = {};
        self.$onInit = function () {
            self.subscribtion = self.rfidClientService.subscribe(function (data) {
                console.log('Subscribe');
                $scope.$evalAsync(function () {
                    self.tagStore = data;
                });
            });
        };
        self.rfidClientService = rfidClientService;
        self.connect = self.rfidClientService.connect;
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
        self.unsubscribe = function () {
            console.log('Unsubscribe');
            self.rfidClientService.usubscribe(self.subscription);
        };
    },
    template: require('./tag-store.template.html')
});
