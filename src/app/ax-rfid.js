var assign = require('object-assign');
var Rx = require('rx-dom');
var AxRfidStore = require('./ax-rfid-store');

(function (exports) {
    'use strict';

    function Client(overrideConfig) {
        var config = assign({}, {host: "localhost", port: 7000, isDebug: false}, overrideConfig);
        var debugSubject = new Rx.Subject();
        var queue = [];
        var ws;
        var tagStore;
        var subscription;

        function debugMessage(action, message) {
            if (config.isDebug) {
                debugSubject.onNext({"action": action, "message": message});
                console.log("action: %s message: %s", action, message);
            }
        }

        return {
            connect: function () {
                if (ws) {
                    console.error("Already connected");
                }
                else {
                    var openObserver = Rx.Observer.create(function (e) {
                        console.log('Connected');
                    }.bind(this));

                    var closingObserver = Rx.Observer.create(function () {
                        console.log('Disconnecting');
                        ws = null;
                    }.bind(this));

                    ws = Rx.DOM.fromWebSocket("ws://" + config.host + ":" + config.port, null, openObserver, closingObserver);
                    tagStore = new AxRfidStore.TagStore();
                    subscription = ws.subscribe(
                        function (e) {
                            var messageAsString = e.data;
                            var message = JSON.parse(messageAsString);
                            debugMessage("response", message);
                            var cmd = message.cmd;
                            switch (cmd) {
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
                                default:
                                    if (queue.length > 0) {
                                        var subject = queue.shift();
                                        subject.onNext(message);
                                        subject.onCompleted();
                                    }
                                    else {
                                        console.error("Unexpected message: " + messageAsString);
                                    }
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
            },

            isConnected: function () {
                return !!ws;
            },

            getDebugSubject: function () {
                return debugSubject;
            },

            getTagStore: function () {
                return tagStore;
            },

            disconnect: function () {
                if (ws) {
                    subscription.dispose();
                }
                else {
                    console.error("Not connected");
                }
            },
            sendMessage: function (message) {
                if (ws) {
                    var messageAsString = JSON.stringify(message);
                    debugMessage("request", message);
                    ws.onNext(messageAsString);
                    var result = new Rx.ReplaySubject(1);
                    queue.push(result);
                    return result;
                }
                else {
                    console.error("Not connected");
                }
            }
        }
    }

    exports.Client = Client;

}((window.AxRfid = window.AxRfid || {})));


module.exports = AxRfid;