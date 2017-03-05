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
        when('/form', {
            template: '<rfid-view-form></rfid-view-form>'
        }).
        when('/simple', {
            template: '<rfid-view-simple></rfid-view-simple>'
        }).
        otherwise('/form');
    }
]);