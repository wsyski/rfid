var Rx=require('rx-dom');
var assign = require('object-assign');
var createRxStore = require('rx-store').createRxStore;

var AxRfid  = function () {

    function Client(config) {
        this._config = config || {host: "localhost", port: 7000};
        this._debugSubject = new Rx.Subject();
        this._queue = [];
    }

    function Tag(id,isComplete) {
        this.id=id;
        this.isComplete=isComplete;
    }

    function tagReducer(state, action) {
        function indexOf(tags,id) {
            tags.forEach(function(tag,index) {
                if (tag.id==id) {
                    return index;
                }
            });
            return -1;
        }

        var payload=action.payload;
        switch (action.type) {
            case 'ADD':
                var indexAdd=indexOf(state.tags,payload.id);
                if (indexAdd===-1) {
                    return assign({},state,{tags: state.tags.concat(new Tag(payload.id,true))});
                }
                return state;
            case 'REMOVE':
                var indexRemove=indexOf(state.tags,payload.id);
                if (indexRemove!==-1) {
                    return assign({},state,{tags: state.tags.filter(function(tag,index) {return indexRemove!==index})});
                }
                return state;
            default:
                return state;
        }
    }

    function TagStore() {

        function add(payload) {
            return {
                type: 'ADD',
                payload: payload
            };
        }

        function remove(payload) {
            return {
                type: 'REMOVE',
                payload: payload
            };
        }

        var _store = createRxStore(tagReducer, {isReady: true, isEnabled: false, tags: []});

        return {
            add: function (data) {
                var action=add(data);
                _store.dispatch(action);
            },
            remove: function (data) {
                var action=remove(data);
                _store.dispatch(action);
            },
            subscribe: function(callback) {
                return _store.subscribe(callback);
            }
        }
    }

    Client.prototype.sendMessage=function(message) {
        if (this._ws) {
            var messageAsString = JSON.stringify(message);
            this._debugSubject.onNext({"action": "Request","message": message});
            console.log("sending ", messageAsString);
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
            this._tagStore=new TagStore();
            this._tagStore.subscribe(function(data) {
                console.log(data);
            });
            this._ws.subscribe(
                function (e) {
                    var messageAsString=e.data;
                    var message = JSON.parse(messageAsString);
                    console.log('response: %s', messageAsString);
                    this._debugSubject.onNext({"action": "Response","message": message});
                    var cmd=message.cmd;
                    if (cmd === "tag") {
                        this._tagStore.add(message);
                    }
                    else {
                       if (this._queue.length>0) {
                          var subject=this._queue.shift();
                          subject.onNext(message);
                          subject.onCompleted();
                       }
                       else {
                           console.error("Unexpected message: "+messageAsString);
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

    Client.prototype.disconnect = function () {
        function noop() {}
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
    };
}();


module.exports=AxRfid;