'use strict';

var angular = require('angular');

angular.module('rfid').component('tagDetail', {
    bindings: {
        id: '<',
        reader: '<',
        isComplete: '<complete',
        isCheckoutState: '<checkoutstate'
    },
    template: require('./tag-detail.template.html')
});
