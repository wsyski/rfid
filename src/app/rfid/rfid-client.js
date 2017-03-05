(function (exports) {
    'use strict';

    var DEFAULT_CONFIG = {
        readerProbeInterval: 30000,
        isDebug: false,
        debugLogger: console.debug.bind(console),
        errorLogger: console.error.bind(console)
    };

    var INITIAL_STATE = {isConnected: false, isReady: false, isEnabled: false, tags: []};

    var createRxStore;
    if (typeof require === "undefined") {
        createRxStore = RxStore.createRxStore;
    }
    else {
        require('rx-lite');
        require('rx-dom');
        createRxStore = require('rx-store').createRxStore;
    }

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

    function Tag(id, reader, isComplete) {
        this.id = id;
        this.reader = reader;
        this.isComplete = isComplete;
    }

    Tag.prototype.setCheckoutState = function (isCheckoutState) {
        this.isCheckoutState = isCheckoutState;
    };

    function tagStoreReducer(state, action) {

        function removeTag(tags, id) {
            return tags.filter(function (tag) {
                return tag.id !== id;
            })
        }

        var payload = action.payload;

        switch (action.type) {
            case 'SET_CONNECTED':
                if (payload.isConnected !== state.isConnected) {
                    return Object.assign({}, INITIAL_STATE, {isConnected: payload.isConnected, isReady: payload.isConnected, isEnabled: payload.isConnected});
                }
                else {
                    return state;
                }
            case 'SET_ENABLED':
                if (payload.isEnabled !== state.isEnabled) {
                    return Object.assign({}, state, {isEnabled: payload.isEnabled});
                }
                else {
                    return state;
                }
            case 'SET_READY':
                if (payload.isReady !== state.isReady) {
                    return Object.assign({}, state, {isReady: payload.isReady});
                }
                else {
                    return state;
                }
            case 'ADD_OR_REPLACE_TAG':
                return Object.assign({}, state, {tags: removeTag(state.tags, payload.id).concat(new Tag(payload.id, payload.reader, payload.isComplete))});
            case 'REMOVE_TAG':
                return Object.assign({}, state, {tags: removeTag(state.tags, payload.id)});
            case 'SET_CHECKOUT_STATE':
                return Object.assign({}, state, {
                    tags: state.tags.map(function (tag) {
                        var newTag = new Tag(tag.id, tag.reader, tag.isComplete);
                        if (tag.id === payload.id) {
                            newTag.setCheckoutState(payload.isCheckoutState);
                        }
                        else {
                            newTag.setCheckoutState(tag.isCheckoutState);
                        }
                        return newTag;
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
                payload: {id: id, reader: reader, isComplete: isComplete}
            };
        }

        function removeTag(id) {
            return {
                type: 'REMOVE_TAG',
                payload: {id: id}
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
                payload: {id: id, isCheckoutState: isCheckoutState}
            };
        }

        function setConnected(isConnected) {
            return {
                type: 'SET_CONNECTED',
                payload: {isConnected: isConnected}
            };
        }

        var store = createRxStore(tagStoreReducer, INITIAL_STATE);

        return {
            addOrReplaceTag: function (id, reader, isComplete) {
                var action = addOrReplaceTag(id, reader, isComplete);
                store.dispatch(action);
            },
            removeTag: function (id) {
                var action = removeTag(id);
                store.dispatch(action);
            },
            removeAllTags: function () {
                var action = removeAllTags();
                store.dispatch(action);
            },
            setEnabled: function (isEnabled) {
                var action = setEnabled(isEnabled);
                store.dispatch(action);
            },
            setReady: function (isReady) {
                var action = setReady(isReady);
                store.dispatch(action);
            },
            setCheckoutState: function (id, isCheckoutState) {
                var action = setCheckoutState(id, isCheckoutState);
                store.dispatch(action);
            },
            setConnected: function (isConnected) {
                var action = setConnected(isConnected);
                store.dispatch(action);
            },
            subscribe: function (callback) {
                return store.subscribe(callback);
            }
        }
    }

    function Client(overrideConfig) {
        var config = Object.assign({}, DEFAULT_CONFIG, overrideConfig);
        var debugSubject = new Rx.Subject();
        var tagStore = new TagStore();
        var queue = [];
        var ws;
        var wsSubscription;
        var onError;

        function setErrorHandler(errorHandler) {
            onError = errorHandler;
        }

        function noop() {
        }

        function handleError(e) {
            config.errorLogger('error: ' + e);
            if (onError) {
                onError(e);
            }
        }

        function disconnect() {
            if (ws) {
                wsSubscription.dispose();
            }
            else {
                handleError(new RfidError("Not connected"));
            }
        }

        function handleMessage(message) {
            if (queue.length > 0) {
                var item = queue.shift();
                var result = item.result;
                if (message.cmd === "error") {
                    result.onError(new RfidError(message.result, message.incmd));
                }
                else {
                    result.onNext(message);
                    result.onCompleted();
                }
            }
            else {
                result.onError(new RfidError("Unexpected message: " + messageAsString, message.cmd));
            }
        }

        function debugMessage(action, message) {
            if (config.isDebug) {
                debugSubject.onNext({"action": action, "message": message});
                config.debugLogger('action: ' + action + ' message: ' + JSON.stringify(message));
            }
        }

        function sendMessage(message) {
            var result = new Rx.ReplaySubject(1);
            if (ws) {
                var messageAsString = JSON.stringify(message);
                debugMessage("request", message);
                ws.onNext(messageAsString);
                queue.push({"result": result, "message": message});
                return result;
            }
            else {
                result.onError(new RfidError("Not connected", message.cmd));
            }
        }

        function sendMessageWithCallback(message, callback) {
            var result = sendMessage(message);
            var subscription = result.subscribe(
                function (result) {
                    callback(result);
                },
                function (e) {
                    handleError(e);
                },
                function () {
                    subscription.dispose();
                }
            );
        }

        function setClientName(name) {
            sendMessageWithCallback({"cmd": "remoteName", "name": name}, noop);
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
            }
            else {
                sendMessageWithCallback({"cmd": "readerStatus"}, noop);
            }
        }

        function probeReaderStatus() {
            var readerProbe = Rx.Observable.interval(config.readerProbeInterval);
            return readerProbe.subscribe(
                function (result) {
                    readerStatus();
                }
            );
        }

        function reload() {
            sendMessageWithCallback({"cmd": "resend"}, noop);
        }

        function setCheckoutState(id, isCheckoutState) {
            var security = isCheckoutState ? "Deactivated" : "Activated";
            return sendMessage({"cmd": "setCheckoutState", "id": id, "security": security})
        }

        function connect(name, host, port) {
            var result = new Rx.ReplaySubject(0);
            if (ws) {
                result.onError(new RfidError("Already connected"));
            }
            else {
                var readerProbeSubscription;
                var openObserver = Rx.Observer.create(function (e) {
                    config.debugLogger('Connected');
                    tagStore.setConnected(true);
                    setClientName(name);
                    readerProbeSubscription = probeReaderStatus();
                    result.onCompleted();
                }.bind(this));

                var closingObserver = Rx.Observer.create(function () {
                    config.debugLogger('Disconnected');
                    tagStore.setConnected(false);
                    ws = null;
                    queue = [];
                    if (readerProbeSubscription) {
                        readerProbeSubscription.dispose();
                    }
                }.bind(this));

                ws = Rx.DOM.fromWebSocket("ws://" + host + ":" + port, null, openObserver, closingObserver);
                wsSubscription = ws.subscribe(
                    function (e) {
                        var messageAsString = e.data;
                        var message = JSON.parse(messageAsString);
                        debugMessage("response", message);
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
                                    default:
                                        tagStore.addOrReplaceTag(id, reader, true);
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
                                }
                                else {
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
                            case "setCheckoutState":
                                tagStore.setCheckoutState(message.id, message.security === "Deactivated");
                                handleMessage(message);
                                break;
                            default:
                                handleMessage(message);
                        }
                    }.bind(this),
                    function (e) {
                        handleError(e);
                    }.bind(this)
                );
            }
            return result;
        }

        return {
            setErrorHandler: function (errorHandler) {
                setErrorHandler(errorHandler);
            },
            connect: function (name, host, port) {
                return connect(name, host, port);
            },
            disconnect: function () {
                disconnect()
            },
            reload: function () {
                reload()
            },
            setCheckoutState: function (id, isCheckoutState) {
                return setCheckoutState(id, isCheckoutState);
            },

            getDebugSubject: function () {
                return debugSubject;
            },

            getTagStore: function () {
                return tagStore;
            },

            sendMessage: function (message) {
                return sendMessage(message);
            }
        }
    }

    exports.Client = Client;
    exports.Tag = Tag;
    exports.TagStore = TagStore;
    exports.RfidError = RfidError;
    exports.INITIAL_STATE = INITIAL_STATE;
    exports.DEFAULT_CONFIG = DEFAULT_CONFIG;

}(window.AxRfid = window.AxRfid || {}));

if (typeof module !== "undefined") {
    module.exports = {
        Client: AxRfid.Client,
        Tag: AxRfid.Tag,
        TagStore: AxRfid.TagStore,
        RfidError: AxRfid.RfidError,
        INITIAL_STATE: AxRfid.INITIAL_STATE,
        DEFAULT_CONFIG: AxRfid.DEFAULT_CONFIG
    }
}
