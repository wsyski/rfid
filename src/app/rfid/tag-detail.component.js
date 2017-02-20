'use strict';

var angular = require('angular');

angular.module('rfid', []).component('tagDetail', {
    bindings: {
        id: '=',
        reader: '=',
        isComplete: '=',
        isCheckoutState: '='
    },
    template: require('./tag-detail.template.html')
});
