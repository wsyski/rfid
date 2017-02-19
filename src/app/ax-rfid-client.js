(function (exports) {
    'use strict';

    var assign = require('object-assign');
    var Rx = require('rx-dom');
    var AxRfidTagStore = require('./ax-rfid-store');

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

    function Client(overrideConfig) {
        var config = assign({}, {host: "localhost", port: 7000, isDebug: false}, overrideConfig);
        var debugSubject = new Rx.Subject();
        var tagStore = new AxRfidTagStore();
        var queue = [];
        var ws;
        var wsSubscription;

        function noop() {
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
                console.log("action: %s message: %s", action, JSON.stringify(message));
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
                    subscription.dispose();
                    console.error('error: %s', e);
                },
                function () {
                    subscription.dispose();
                }
            );
        }

        function setClientName(clientName) {
            sendMessageWithCallback({"cmd": "remoteName", "name": clientName}, noop);
        }

        function reload() {
            sendMessageWithCallback({"cmd": "resend"}, noop);
        }

        function setCheckoutState(id, isCheckoutState) {
            var security = isCheckoutState ? "Deactivated" : "Activated";
            return sendMessage({"cmd": "setCheckoutState", "id": id, "security": security})
        }


        function connect(clientName) {
            if (ws) {
                console.error("Already connected");
            }
            else {
                var openObserver = Rx.Observer.create(function (e) {
                    console.log('Connected');
                    tagStore.setConnected(true);
                    queue = [];
                    setClientName(clientName);
                }.bind(this));

                var closingObserver = Rx.Observer.create(function () {
                    console.log('Disconnected');
                    tagStore.setConnected(false);
                    ws = null;
                }.bind(this));

                ws = Rx.DOM.fromWebSocket("ws://" + config.host + ":" + config.port, null, openObserver, closingObserver);
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
                                tagStore.setReady(false);
                                tagStore.setEnabled(false);
                                break;
                            case "enable":
                                tagStore.setEnabled(true);
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
                        // errors and "unclean" closes land here
                        console.error('error: %s', e);
                    },
                    function () {
                        // the socket has been closed
                        console.info('socket closed');
                    }
                );
            }
        }

        function disconnect() {
            if (ws) {
                wsSubscription.dispose();
            }
            else {
                console.error("Not connected");
            }
        }

        return {
            connect: function () {
                connect()
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

}((window.AxRfid = window.AxRfid || {})));


module.exports = AxRfid.Client;