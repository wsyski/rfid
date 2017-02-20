'use strict';

var angular = require('angular');

angular.module('rfid', []).component('tagStore', {
    bindings: {
        isConnected: '=',
        isReady: '=',
        isEnabled: '=',
        tags: '='
    },
    template: require('./tag-store.template.html')
});
