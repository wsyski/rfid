'use strict';

var angular = require('angular');

angular.module('util').factory('utilService', ['TOAST_CONFIG','$mdToast', function (TOAST_CONFIG,$mdToast) {
    return {
        showToast: function (message) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .hideDelay(TOAST_CONFIG.HIDE_DELAY)
                    .position(TOAST_CONFIG.POSITION)
                    .action(TOAST_CONFIG.ACTION));
        }
    }
}]);