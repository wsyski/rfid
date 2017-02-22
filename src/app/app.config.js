'use strict';

var angular = require('angular');

angular.module('app').
config(['$locationProvider' ,'$routeProvider',
    function config($locationProvider, $routeProvider) {
        //$locationProvider.hashPrefix('!');

        $routeProvider.
        when('/', {
            template: '<tag-store></tag-store>'
        }).
        otherwise('/');
    }
]);