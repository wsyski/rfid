'use strict';

require('../style/app.css');
require('../../node_modules/angular-material/angular-material.css');

var angular = require('angular'),
    ngAnimate = require('angular-animate'),
    ngAria = require('angular-aria'),
    ngMessages = require('angular-messages'),
    ngMaterial = require('angular-material');

var app = angular.module('myApp', ['ngMaterial']);
app.controller('mainCtrl', function($scope,msgService) {

    $scope.name = "Observer App Example";
    $scope.msg = 'Message';
    $scope.broadcastFn = function(){
        msgService.broadcast($scope.msg);
    }
});

app.component("boxA",  {
    bindings: {},
    controller: function(msgService) {
        var boxA = this;
        boxA.msgService = msgService;

        boxA.msg = '';
        boxA.subscription = boxA.msgService.subscribe(function(obj) {
            console.log('Listerner A');
            boxA.msg = obj;
        });
        boxA.unsubscribe=function(){
            console.log('BoxA Unsubscribe');
            boxA.msgService.usubscribe(boxA.subscription);

        };

    },
    controllerAs: 'boxA',
    templateUrl: "/boxa"
});
app.component("boxB",  {
    bindings: {},
    controller: function(msgService) {
        var boxB = this;
        boxB.msgService = msgService;


        boxB.msg = '';
        boxB.subscription = boxB.msgService.subscribe(function(obj) {
            console.log('Listerner B');
            boxB.msg = obj;
        });

        boxB.unsubscribe=function(){
            console.log('BoxB Unsubscribe');
            boxB.msgService.usubscribe(boxB.subscription);

        };
    },
    controllerAs: 'boxB',
    templateUrl: "/boxb"
});

app.factory('msgService', ['$http', function($http){
    var msgSubject = new Rx.ReplaySubject();
    return{
        subscribe:function(subscription){
            return msgSubject.subscribe(subscription);
        },
        usubscribe:function(subscription){
            subscription.dispose();
        },
        broadcast:function(msg){
            console.log('success');
            msgSubject.onNext(msg);
        }
    }
}]);