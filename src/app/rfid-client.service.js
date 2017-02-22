'use strict';

var AxRfidClient = require('./ax-rfid-client');
var angular = require('angular');

angular.module('rfid').factory('rfidClientService', ['$window', function($window){
    var host = 'lulpreserv3';
    var port = 7000;
    var axRfidClient = new AxRfidClient({host: host, port: port, name: $window.navigator.userAgent, isDebug: true});
    var debugSubscription = axRfidClient.getDebugSubject().subscribe(
        function (message) {
            console.log("message: %s",JSON.stringify(message))
        },
        function (e) {
            console.error("error: %s", e);
        },
        angular.noop
    );
    var tagStore = axRfidClient.getTagStore();
    return{
        reload:function(){
            axRfidClient.reload();
        },
        connect:function(){
            axRfidClient.connect();
        },
        disconnect:function(){
            axRfidClient.disconnect();
        },
        subscribe:function(subscription){
            return tagStore.subscribe(subscription);
        },
        unsubscribe:function(subscription){
            subscription.unsubscribe();
        }
    }
}]);