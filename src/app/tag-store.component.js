'use strict';

var angular = require('angular');

angular.module('rfid').component('tagStore', {
    bindings: {},
    controller: function (rfidClientService,$scope) {
        var self = this;
        self.$onInit = function () {
            self.tagStore = {};
            // $scope.$watch(self.tagStore);
            self.subscribtion = self.rfidClientService.subscribe(function (data) {
                console.log('Subscribe');
                $scope.$evalAsync(function() {
                    self.tagStore = data;
                });
            });
        };
        self.rfidClientService = rfidClientService;
        self.connect = self.rfidClientService.connect;
        self.disconnect = self.rfidClientService.disconnect;
        self.reload = self.rfidClientService.reload;


        self.unsubscribe = function () {
            console.log('Unsubscribe');
            self.rfidClientService.usubscribe(self.subscription);
        };
    },
    template: require('./tag-store.template.html')
});
