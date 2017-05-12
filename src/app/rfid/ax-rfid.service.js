(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name rfid.service:axRfidClientService
   *
   * @description
   * Service wrapper for AxRfid.Client
   *
   */
  angular.module('rfid').factory('axRfidClientService', axRfidClientService);

  axRfidClientService.$inject=['rfidClient', '$log', 'RFID_CONFIG'];

  function axRfidClientService(rfidClient, $log, RFID_CONFIG) {

    function getNewTags(tags, existingTags) {
      return tags.filter(
        function (tag) {
          return existingTags.every(
            function (existingTag) {
              return existingTag.id !== tag.id;
            }
          );
        }
      );
    }

    if (RFID_CONFIG.debug) {
      rfidClient.getDebugSubject().subscribe(
        function (message) {
          $log.debug('message: ' + JSON.stringify(message));
        },
        function (e) {
          $log.debug('error: ' + e);
        },
        angular.noop
      );
    }
    var tagStore = rfidClient.getTagStore();
    var tagStoreState = AxRfid.INITIAL_STATE;  // eslint-disable-line no-undef
    var tagStoreSubscription;
    var onError = $log.error.bind($log);

    function subscribeOnTagAddedOrRemoved(tagAddedHandler, tagRemovedHandler) {
      tagStoreSubscription = tagStore.subscribe(function (data) {
        if (tagStoreState !== data) {
          $log.debug('tagStoreState: ' + JSON.stringify(data));
          var addTags = getNewTags(data.tags, tagStoreState.tags);
          var removeTags = getNewTags(tagStoreState.tags, data.tags);
          tagStoreState = data;
          addTags.forEach(function (tag) {
            var id = tag.id;
            $log.debug("Adding tag: " + id);
            if (tagAddedHandler) {
              tagAddedHandler(tag);
            }
          });
          removeTags.forEach(function (tag) {
            var id = tag.id;
            $log.debug("Removing tag: " + id);
            if (tagRemovedHandler) {
              tagRemovedHandler(tag);
            }
          });
        }
      });
    }

    return {
      setCheckoutState: rfidClient.setCheckoutState,

      setTags: rfidClient.setTags,

      subscribe: tagStore.subscribe,
      connectAndReload: function (name, host, port) {
        var result = rfidClient.connect(name, RFID_CONFIG.protocol, host, port);
        var connectSubscription = result.subscribe(
          angular.noop,
          onError,
          function () {
            connectSubscription.dispose();
            rfidClient.reload();
          }
        );
      },
      disconnect: function () {
        if (tagStoreSubscription) {
          tagStoreSubscription.unsubscribe();
        }
        rfidClient.disconnect();
      },
      subscribeOnTagAddedOrRemoved: subscribeOnTagAddedOrRemoved
    };
  }
})();
