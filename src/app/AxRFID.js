var AxRFID  = function () {

    function Client(config) {
        this._config = config || {host: "localhost", port: 7000};
        this._tagReport = new Rx.Subject();
        this._queue = [];
    }

    function messageAsString(message) {
        var messageAsString;
        if (typeof message !== "string") {
            messageAsString = JSON.stringify(message);
        }
        else {
            messageAsString = message;
        }
        return messageAsString;
    }

    function messageAsObject(message) {
        var messageAsObject;
        if (typeof message === "string") {
            messageAsObject = JSON.parse(message);
        }
        else {
            messageAsObject = message;
        }
        return messageAsObject;
    }

    function noop() {
    }

    Client.prototype.sendMessage=function(message) {
        if (this._ws) {
            var msg = messageAsString(message);
            console.log("sending ", msg);
            this._ws.onNext(msg);
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
            this._ws.subscribe(
                function (e) {
                    var message = messageAsObject(e.data);
                    console.log('response: %s', e.data);
                    var cmd=message.cmd;
                    if (cmd === "tag") {
                        this._tagReport.onNext(message);
                    }
                    else {
                       if (this._queue.length>0) {
                          var subject=this._queue.shift();
                          subject.onNext(message);
                          subject.onCompleted();
                       }
                       else {
                           console.error("Unexpected message: "+message);
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

    Client.prototype.getTagReport = function () {
        return this._tagReport;
    };

    Client.prototype.disconnect = function () {
        if (this._ws) {
            var disposable=this._ws.subscribe(noop);
            disposable.dispose();
        }
        else {
            console.error("Not connected");
        }
    };

    return {
        Client: Client
    }
}();

module.exports=AxRFID;