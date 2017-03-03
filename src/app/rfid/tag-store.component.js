'use strict';

var angular = require('angular');

angular.module('rfid').component('tagStore', {
    bindings: {
        isConnected: '<connected',
        isReady: '<ready',
        isEnabled: '<enabled',
        tags: '<tags'
    },
    template: require('./tag-store.template.html')
});
