'use strict';

var angular = require('angular');

angular.module('rfid', []).component('tagStore', {
    bindings: {},
    controller: function (rfidClientService) {
        var self = this;
        self.rfidClientService = rfidClientService;

        self.tagStore = {};
        self.connect = self.rfidClientService.connect;
        self.disconnect = self.rfidClientService.disconnect();

        self.subscribtion = self.rfidClientService.subscribe(function (data) {
            console.log('Subscribe');
            self.tagStore = data;
        });
        self.unsubscribe = function () {
            console.log('Unsubscribe');
            self.rfidClientService.usubscribe(self.subscription);
        };
    },
    template: require('./tag-store.template.html')
});
