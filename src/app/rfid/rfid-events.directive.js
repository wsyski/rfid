var AxRfidInitialState = require('./rfid-client').INITIAL_STATE;

var angular = require('angular');
(function (angular) {
  'use strict';

  angular.module('rfid').directive('rfidEvents', ['$log', 'workplace', 'axRfidClientService', 'utilService', function ($log, workplace, axRfidClientService, utilService) {
    return {
      restrict: 'E',
      require: '^rfidViewForm',
      scope: {},
      link: function (scope, element, attrs, ctrl) {
        function errorHandler(e) {
          var message;
          if (e.message) {
            message = e.message;
          }
          else {
            if (e.target instanceof WebSocket) {
              message = "Websocket error";
            }
            else {
              message = "RFID Client error";
            }
          }
          utilService.showToast(message);
        }

        var tagStore = AxRfidInitialState;
        if (workplace && workplace.hostname && workplace.port) {
          $log.debug('Subscribe');
          axRfidClientService.connectAndReload(workplace.name, workplace.hostname, workplace.port);

          ctrl.onSubmit=function() {
            axRfidClientService.setTags(ctrl.value);
          }
          axRfidClientService.subscribeOnTagAddedOrRemoved(
            function (tag) {
              scope.$evalAsync(function () {
                ctrl.addTag(tag);
              });
            },
            function (tag) {
              scope.$evalAsync(function () {
                ctrl.removeTag(tag.id);
              });
            }
          );

          scope.$on('$destroy', function () {
            if (tagStore.isConnected) {
              axRfidClientService.disconnect();
            }
            $log.debug('Unsubscribe');
          });
        }
      }
    };
  }]);
})(angular);
