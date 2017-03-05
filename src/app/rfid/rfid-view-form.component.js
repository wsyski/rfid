'use strict';

var angular = require('angular');

angular.module('rfid').component('rfidViewForm', {
    template: require('./rfid-view-form.template.html'),
    controllerAs: '$ctrl',
    bindings: {
    },
    controller: function ($log) {
        var model;

        var self = this;
        self.tags = [];
        self.value="";

        self.onSubmit = function () {
            if (self.value !== "") {
                self.tags.push(new AxRfid.Tag(self.value,'1',true));
            }
        }
    },
});
