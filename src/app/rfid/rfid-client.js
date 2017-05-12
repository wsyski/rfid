(function (exports) {
  'use strict';

  var DEFAULT_CONFIG = {
    readerProbeInterval: 30000,
    isDebug: false, // Logs the debug messages
    debugLogger: console.debug.bind(console), // eslint-disable-line no-console
    // Logs the error messages
    errorLogger: console.error.bind(console), // eslint-disable-line no-console
    // Error handler. Could be used to retrieve and handle the last error (passed as a first parameter to the function).
    errorHandler: function () {
    }
  };

  var INITIAL_STATE = {
    isConnected: false,
    isReady: false,
    isEnabled: false,
    tags: []
  };

  var createRxStore;
  if (typeof require === "undefined") { // eslint-disable-line no-undef
    createRxStore = RxStore.createRxStore; // eslint-disable-line no-undef
  } else {
    require('rx-lite'); // eslint-disable-line no-undef
    require('rx-dom'); // eslint-disable-line no-undef
    createRxStore = require('rx-store').createRxStore;  // eslint-disable-line no-undef
  }

  // All errors triggered by Rfid client are of RfidError type
  function RfidError(message, cmd) {
    this.name = 'RfidError';
    this.message = message || 'Rfid error';
    if (cmd) {
      this.cmd = cmd;
    }
    this.stack = (new Error()).stack;
  }

  RfidError.prototype = Object.create(Error.prototype);
  RfidError.prototype.constructor = RfidError;

  // Tag domain object
  function Tag(id, reader, isComplete) {
    this.id = id;
    this.reader = reader;
    this.isComplete = isComplete;
  }

  Tag.prototype.setCheckoutState = function (isCheckoutState) {
    this.isCheckoutState = isCheckoutState;
  };

  // TagStore reducer produces a new TagStore state out of the existing state and the payload.
  function tagStoreReducer(state, action) {

    function removeTag(tags, id) {
      return tags.filter(function (tag) {
        return tag.id !== id;
      });
    }

    var payload = action.payload;

    switch (action.type) {
      case 'SET_CONNECTED':
        // Do not change the state if there is no connect/disconnect event
        if (payload.isConnected !== state.isConnected) {
          // Reset the state on the connect/disconnect event
          return Object.assign({}, INITIAL_STATE, {
            isConnected: payload.isConnected,
            isReady: payload.isConnected,
            isEnabled: payload.isConnected
          });
        } else {
          return state;
        }
        break;
      case 'SET_ENABLED':
        if (payload.isEnabled !== state.isEnabled) {
          return Object.assign({}, state, {isEnabled: payload.isEnabled});
        } else {
          return state;
        }
        break;
      case 'SET_READY':
        if (payload.isReady !== state.isReady) {
          return Object.assign({}, state, {isReady: payload.isReady});
        } else {
          return state;
        }
        break;
      case 'ADD_OR_REPLACE_TAG':
        return Object.assign({}, state, {
          tags: removeTag(state.tags, payload.id).concat(new Tag(payload.id, payload.reader, payload.isComplete))
        });
      case 'REMOVE_TAG':
        return Object.assign({}, state, {tags: removeTag(state.tags, payload.id)});
      case 'REMOVE_ALL_TAGS':
        return Object.assign({}, state, {tags: []});
      case 'SET_CHECKOUT_STATE':
        return Object.assign({}, state, {
          tags: state.tags.map(function (tag) {
            var newTag = new Tag(tag.id, tag.reader, tag.isComplete);
            if (tag.id === payload.id) {
              newTag.setCheckoutState(payload.isCheckoutState);
            } else {
              newTag.setCheckoutState(tag.isCheckoutState);
            }
            return newTag;
          })
        });
      case 'SET_TAGS':
        return Object.assign({}, state, {
          tags: state.tags.map(function (tag) {
            return new Tag(payload.id, tag.reader, true);
          })
        });
      default:
        return state;
    }
  }

  function TagStore() {

    function addOrReplaceTag(id, reader, isComplete) {
      return {
        type: 'ADD_OR_REPLACE_TAG',
        payload: {
          id: id,
          reader: reader,
          isComplete: isComplete
        }
      };
    }

    function removeTag(id) {
      return {
        type: 'REMOVE_TAG',
        payload: {id: id}
      };
    }

    function setTags(id) {
      return {
        type: 'SET_TAGS',
        payload: {id: id}
      };
    }

    function removeAllTags() {
      return {
        type: 'REMOVE_ALL_TAGS',
        payload: {}
      };
    }

    function setEnabled(isEnabled) {
      return {
        type: 'SET_ENABLED',
        payload: {isEnabled: isEnabled}
      };
    }

    function setReady(isReady) {
      return {
        type: 'SET_READY',
        payload: {isReady: isReady}
      };
    }

    function setCheckoutState(id, isCheckoutState) {
      return {
        type: 'SET_CHECKOUT_STATE',
        payload: {
          id: id,
          isCheckoutState: isCheckoutState
        }
      };
    }

    function setConnected(isConnected) {
      return {
        type: 'SET_CONNECTED',
        payload: {isConnected: isConnected}
      };
    }

    // Create the TagStore out of the reducer and the initial state.
    var store = createRxStore(tagStoreReducer, INITIAL_STATE);
    // TagStore API
    return {
      // Add or replace tag
      addOrReplaceTag: function (id, reader, isComplete) {
        var action = addOrReplaceTag(id, reader, isComplete);
        store.dispatch(action);
      }, // Remove tag
      removeTag: function (id) {
        var action = removeTag(id);
        store.dispatch(action);
      }, // Remove all tags
      removeAllTags: function () {
        var action = removeAllTags();
        store.dispatch(action);
      }, // Set enabled state. That means that the TagStore receives the Rfid events. If there are multiple TagStore instances (at different browsers) then only
      // one can be the recipient of the tag events.
      setEnabled: function (isEnabled) {
        var action = setEnabled(isEnabled);
        store.dispatch(action);
      }, // Set ready state. The TagStore is in the ready state if the Rfid reader is working. There is a probing command send at a specified time interval
      // to check if Rfid reader is up and running.
      setReady: function (isReady) {
        var action = setReady(isReady);
        store.dispatch(action);
      }, // Program all tags on the Rfid reader
      setTags: function (id) {
        var action = setTags(id);
        store.dispatch(action);
      }, // Set the checkout state, The TagStore is in the checkout state if the tag alarm is disabled.
      setCheckoutState: function (id, isCheckoutState) {
        var action = setCheckoutState(id, isCheckoutState);
        store.dispatch(action);
      }, // Set the connected state. The TagStore is in the connected state if the browser is connected to the Client websocket.
      setConnected: function (isConnected) {
        var action = setConnected(isConnected);
        store.dispatch(action);
      }, // Subscribe to the TagStore events
      subscribe: function (callback) {
        return store.subscribe(callback);
      }
    };
  }

  function Client(overrideConfig) {
    var config = Object.assign({}, DEFAULT_CONFIG, overrideConfig);
    var debugSubject = new Rx.Subject();
    var tagStore = new TagStore();
    var queue = [];
    var ws;
    var wsSubscription;

    function noop() {
    }

    function errorHandler(e) {
      config.errorHandler(e);
      var message;
      if (e.message) {
        message = e.message;
      } else {
        if (e.target instanceof WebSocket) {
          message = "Websocket error";
        } else {
          message = "RFID Client error";
        }
      }
      config.errorLogger(message);
    }

    function disconnect() {
      if (ws) {
        wsSubscription.dispose();
      } else {
        errorHandler(new RfidError("Not connected"));
      }
    }

    function handleMessage(message) {
      if (queue.length > 0) {
        var item = queue.shift();
        var result = item.result;
        if (message.cmd === "error") {
          result.onError(new RfidError(message.result, message.incmd));
        } else {
          result.onNext(message);
          result.onCompleted();
        }
      } else {
        config.errorLogger("Unexpected message: " + JSON.stringify(message), message.cmd);
      }
    }

    function debugMessage(action, message) {
      if (config.isDebug) {
        debugSubject.onNext({
          "action": action,
          "message": message
        });
        config.debugLogger('action: ' + action + ' message: ' + JSON.stringify(message));
      }
    }

    function sendMessage(message) {
      var result = new Rx.ReplaySubject(1);
      if (ws) {
        var messageAsString = JSON.stringify(message);
        debugMessage("request", message);
        ws.onNext(messageAsString);
        queue.push({
          "result": result,
          "message": message
        });
        return result;
      } else {
        result.onError(new RfidError("Not connected", message.cmd));
      }
    }

    function sendMessageWithCallback(message, callback) {
      var result = sendMessage(message);
      var subscription = result.subscribe(function (result) {
        callback(result);
      }, function (e) {
        errorHandler(e);
      }, function () {
        subscription.dispose();
      });
    }

    function setClientName(name) {
      sendMessageWithCallback({
        "cmd": "remoteName",
        "name": name
      }, noop);
    }

    function readerStatus() {
      var isError = false;
      queue.forEach(function (item) {
        var message = item.message;
        var cmd = message.cmd;
        if (cmd === "readerStatus") {
          isError = true;
          var result = item.result;
          result.onError(new RfidError("WebSocket timeout", message.cmd));
        }
      });
      if (isError) {
        disconnect();
      } else {
        sendMessageWithCallback({"cmd": "readerStatus"}, noop);
      }
    }

    function probeReaderStatus() {
      var readerProbe = Rx.Observable.interval(config.readerProbeInterval);
      return readerProbe.subscribe(function () {
        readerStatus();
      });
    }

    function reload() {
      sendMessageWithCallback({"cmd": "resend"}, noop);
    }

    function setCheckoutState(id, isCheckoutState) {
      var security = isCheckoutState ? "Deactivated" : "Activated";
      return sendMessage({
        "cmd": "setCheckoutState",
        "id": id,
        "security": security
      });
    }

    function setTags(id) {
      return sendMessage({
        "cmd": "program",
        "id": id
      });
    }

    function connect(name, protocol, host, port) {
      var result = new Rx.ReplaySubject(0);
      if (ws) {
        result.onError(new RfidError("Already connected"));
      } else {
        var readerProbeSubscription;
        var openObserver = Rx.Observer.create(function () {
          if (config.isDebug) {
            config.debugLogger('Connected');
          }
          tagStore.setConnected(true);
          setClientName(name);
          // Start Rfid reader probing
          readerProbeSubscription = probeReaderStatus();
          result.onCompleted();
        }.bind(this));

        var closingObserver = Rx.Observer.create(function () {
          if (config.isDebug) {
            config.debugLogger('Disconnected');
          }
          tagStore.setConnected(false);
          ws = null;
          queue = [];
          if (readerProbeSubscription) {
            readerProbeSubscription.dispose();
          }
        }.bind(this));

        ws = Rx.DOM.fromWebSocket(protocol + "://" + host + ":" + port, null, openObserver, closingObserver);
        wsSubscription = ws.subscribe(function (e) {
          var messageAsString = e.data;
          var message = JSON.parse(messageAsString);
          debugMessage("response", message);
          // Handle Rfid server response
          switch (message.cmd) {
            case "tag":
              var reason = message.reason;
              var id = message.id;
              var reader = message.reader;
              switch (reason) {
                case 'Reader empty':
                  tagStore.removeAllTags();
                  break;
                case 'Removed':
                  tagStore.removeTag(id);
                  break;
                case 'Partial':
                case 'Firsttime new partial':
                  tagStore.addOrReplaceTag(id, reader, false);
                  break;
                case 'Tag found':
                  break;
                case 'Complete':
                case 'Firsttime complete':
                case 'Firsttime new complete':
                  tagStore.addOrReplaceTag(id, reader, true);
                  break;
                default:
                  config.errorLogger('Unknown tag command reason: ' + reason);
              }
              break;
            case "disabled":
              tagStore.setEnabled(false);
              break;
            case "enable":
              tagStore.setEnabled(true);
              handleMessage(message);
              break;
            case "readerStatus":
              if (message.status === "online") {
                tagStore.setReady(true);
              } else {
                tagStore.setReady(false);
                tagStore.setEnabled(false);
              }
              handleMessage(message);
              break;
            case "resend":
            case "Resend":
              tagStore.setEnabled(true);
              handleMessage(message);
              break;
            case "program":
              tagStore.setTags(message.id);
              handleMessage(message);
              break;
            case "setCheckoutState":
              tagStore.setCheckoutState(message.id, message.security === "Deactivated");
              handleMessage(message);
              break;
            default:
              handleMessage(message);
          }
        }.bind(this), function (e) {
          errorHandler(e);
        });
      }
      return result;
    }

    // Client API
    return {
      // Connect to Rfid Server. Subscribe to the return value if needed to know when the connection is ready.
      connect: connect,

      // Disconnect from the Rfid server
      disconnect: disconnect,

      // Reread all tags
      reload: reload,

      // Set the checkout state
      setCheckoutState: setCheckoutState,

      // Program the tags
      setTags: setTags,

      // Gets the TagStore singleton.
      getTagStore: function () {
        return tagStore;
      },

      // This method is used only for debugging. Subscribe to this subject if request/response log is needed.
      getDebugSubject: function () {
        return debugSubject;
      },

      // Send any Rfid command. The function returns replay subject. Subscribe to it to retrieve the return value.
      sendMessage: sendMessage
    };
  }

  exports.Client = Client;
  exports.Tag = Tag;
  exports.TagStore = TagStore;
  exports.RfidError = RfidError;
  exports.INITIAL_STATE = INITIAL_STATE;
  exports.DEFAULT_CONFIG = DEFAULT_CONFIG;

}(window.AxRfid = window.AxRfid || {}));

if (typeof module !== "undefined") {
  module.exports = { // eslint-disable-line no-undef
    Client: AxRfid.Client,
    Tag: AxRfid.Tag,
    TagStore: AxRfid.TagStore,
    RfidError: AxRfid.RfidError,
    INITIAL_STATE: AxRfid.INITIAL_STATE,
    DEFAULT_CONFIG: AxRfid.DEFAULT_CONFIG
  };
}