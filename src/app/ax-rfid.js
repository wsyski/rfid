var assign = require('object-assign');
var Rx = require('rx-dom');
var AxRfidStore = require('./ax-rfid-store');

(function (exports) {
    'use strict';

    function Client(config) {
        this._config = assign({}, {host: "localhost", port: 7000, isDebug: false}, config);
        this._debugSubject = new Rx.Subject();
        this._queue = [];
    }

    Client.prototype.debugMessage = function(action, message) {
        if (this._config.isDebug) {
            this._debugSubject.onNext({"action": action, "message": message});
            console.log("action: %s message: %s", action, message);
        }
    };

    Client.prototype.sendMessage = function (message) {
        if (this._ws) {
            var messageAsString = JSON.stringify(message);
            this.debugMessage("request",message);
            this._ws.onNext(messageAsString);
            var result = new Rx.ReplaySubject(1);
            this._queue.push(result);
            return result;
        }
        else {
            console.error("Not connected");
        }
    };

    Client.prototype.connect = function () {
        if (this._ws) {
            console.error("Already connected");
        }
        else {
            var openObserver = Rx.Observer.create(function (e) {
                console.log('Connected');
            }.bind(this));

            var closingObserver = Rx.Observer.create(function () {
                console.log('Disconnecting');
                this._ws = null;
            }.bind(this));

            this._ws = Rx.DOM.fromWebSocket("ws://" + this._config.host + ":" + this._config.port, null, openObserver, closingObserver);
            this._tagStore = new AxRfidStore.TagStore();
            this._ws.subscribe(
                function (e) {
                    var messageAsString = e.data;
                    var message = JSON.parse(messageAsString);
                    this.debugMessage("response", message);
                    var cmd = message.cmd;
                    if (cmd === "tag") {
                        this._tagStore.add(message);
                    }
                    else {
                        if (this._queue.length > 0) {
                            var subject = this._queue.shift();
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
    };

    Client.prototype.isConnected = function () {
        return !!this._ws;
    };

    Client.prototype.getDebugSubject = function () {
        return this._debugSubject;
    };

    Client.prototype.getTagStore = function () {
        return this._tagStore;
    };

    Client.prototype.disconnect = function () {
        function noop() {
        }

        if (this._ws) {
            var disposable = this._ws.subscribe(noop);
            disposable.dispose();
        }
        else {
            console.error("Not connected");
        }
    };
    exports.Client = Client;

}((window.AxRfid = window.AxRfid || {})));


module.exports = AxRfid;