'use strict';

var angular = require('angular');

angular.module('app').
config(['$locationProvider' ,'$routeProvider',
    function config($locationProvider, $routeProvider) {
        //$locationProvider.hashPrefix('!');

        $routeProvider.
        when('/complex', {
            template: '<rfid-view-complex></rfid-view-complex>'
        }).
        when('/simple', {
            template: '<rfid-view-simple></rfid-view-simple>'
        }).
        otherwise('/simple');
    }
]);