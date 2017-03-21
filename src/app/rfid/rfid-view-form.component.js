'use strict';

var angular = require('angular');

angular.module('rfid').component('rfidViewForm', {
    template: require('./rfid-view-form.template.html'),
    controllerAs: '$ctrl',
    bindings: {
    },
    controller: function () {
        var self = this;
        self.tags = [];
        self.value="";

        /*
        self.onSubmit = function () {
            if (self.value !== "") {
                self.tags.push(new AxRfid.Tag(self.value,'1',true));
            }
        };
        */

        self.addTag=function(tag) {
            self.tags.push(tag);
        };

        self.removeTag=function(id) {
            self.tags = self.tags.filter(function (tag) {
                return tag.id!==id;
            });
        };

    },
});
