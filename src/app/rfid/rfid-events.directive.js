var AxRfidInitialState = require('./rfid-client').INITIAL_STATE;

var angular = require('angular');
(function (angular) {
    'use strict';

    angular.module('rfid').directive('rfidEvents', ['$log', 'workplace', 'rfidClientService', 'utilService', function ($log, workplace, rfidClientService, utilService) {
        return {
            restrict: 'A',
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

                function getNewTags(tags, existingTags) {
                    return tags.filter(
                        function (tag) {
                            return typeof existingTags.find(
                                    function (existingTag) {
                                        return existingTag.id === tag.id;
                                    }
                                ) === "undefined";
                        }
                    );
                }

                var tagStore = AxRfidInitialState;
                if (rfidClientService.isRfidEnabled(workplace)) {
                    $log.debug('Subscribe');
                    rfidClientService.setErrorHandler(errorHandler);
                    var result = rfidClientService.connect(workplace.name, workplace.hostname, workplace.port);
                    var connectSubscription = result.subscribe(
                        angular.noop,
                        function (e) {
                            errorHandler(e);
                        },
                        function () {
                            connectSubscription.dispose();
                            rfidClientService.reload();
                        }
                    );
                    var tagStoreSubscription = rfidClientService.subscribe(function (data) {
                        if (tagStore !== data) {
                            if (tagStore !== data) {
                                $log.log('tagStore: ' + JSON.stringify(data));
                                var addTags = getNewTags(data.tags, tagStore.tags);
                                var removeTags = getNewTags(tagStore.tags, data.tags);
                                scope.$evalAsync(function () {
                                    addTags.forEach(function(tag) {
                                        ctrl.addTag(tag);
                                    });
                                    removeTags.forEach(function(tag) {
                                        ctrl.removeTag(tag.id);
                                    });

                                });
                                tagStore=data;
                            }
                        }
                    });
                    scope.$on('$destroy', function () {
                        if (tagStore.isConnected) {
                            rfidClientService.disconnect();
                        }
                        $log.debug('Unsubscribe');
                        tagStoreSubscription.unsubscribe();
                    });
                }
            }
        };
    }]);
})(angular);
