'use strict';

var angular = require('angular');
var AxRfidClient = require('../ax-rfid-client');

angular.module('rfid').factory('rfidClientService', ['$http', function($http){
    var host = 'lulpreserv3';
    var port = 7000;
    var axRfidClient = new AxRfidClient({host: host, port: port, isDebug: true});
    var debugSubscription = axRfidClient.getDebugSubject().subscribe(
        function (message) {
            console.log("message: %s",JSON.stringify(message))
        },
        function (e) {
            console.error(e);
        },
        function () {
        }
    );
    var tagStore = axRfidClient.getTagStore();
    return{
        subscribe:function(subscription){
            return tagStore.subscribe(subscription);
        },
        usubscribe:function(subscription){
            subscription.dispose();
        }
    }
}]);