describe('RFID Client', function () {
    var READER = "1";
    var ID_0 = "id0";
    var ID_1 = "id1";
    var ID_2 = "id2";

    function cmdTagCompleteResponse(id) {
        return JSON.stringify({"cmd": "tag", "id": id, "type": "Item", "reason": "Firsttime new complete", "reader": READER});
    }

    function cmdTagPartialResponse(id) {
        return JSON.stringify({"cmd": "tag", "id": id, "type": "Item", "reason": "Partial", "reader": READER});
    }

    function cmdSetCheckoutStateResponse(id, isCheckoutState) {
        return JSON.stringify({"cmd": "setCheckoutState", "id": id, "security": isCheckoutState ? "Deactivated" : "Activated"});
    }

    function cmdResendResponse() {
        return JSON.stringify({"cmd": "resend"});
    }

    describe('AxRfid.Client', function () {
        var axRfidClient;
        var axRfidTagStore;
        var mockWebSocket;
        var openObserverOnNext;

        function cmdTest(expectedState, cmdRespones, callback) {
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
            });
            axRfidClient.connect("name");
            openObserverOnNext();
            if (callback) {
                callback();
            }
            cmdRespones.forEach(function (json) {
                var e = {};
                e.data = json;
                mockWebSocket.onNext(e);
            });
            var lastState = states[states.length - 1];
            expect(lastState).toEqual(expectedState);
            subscription.unsubscribe();
        }

        beforeEach(function () {
            axRfidClient = new AxRfid.Client({isDebug: true});
            mockWebSocket = new Rx.Subject();
            spyOn(Rx.DOM, 'fromWebSocket').and.callFake(function (url, protocol, openObserver, closingObserver) {
                openObserverOnNext=openObserver.onNext.bind(openObserver);
                return mockWebSocket;
            });
            var mockWebsocketOnNext = mockWebSocket.onNext.bind(mockWebSocket);
            spyOn(mockWebSocket, 'onNext').and.callFake(function (e) {
                if (e.data) {
                    return mockWebsocketOnNext(e);
                }
                else {
                    console.debug("skipping: " + e);
                }
            });
            axRfidTagStore = axRfidClient.getTagStore();
        });

        it('cmd tags: all complete', function () {
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, isEnabled: true},
                {tags: [new AxRfid.Tag(ID_0, READER, true), new AxRfid.Tag(ID_1, READER, true), new AxRfid.Tag(ID_2, READER, true)]});
            var cmdResponses = [cmdTagCompleteResponse(ID_0), cmdTagCompleteResponse(ID_1), cmdTagCompleteResponse(ID_2)];
            cmdTest(expectedState, cmdResponses);
        });

        it('cmd tags: 1 partial and 2 complete', function () {
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, isEnabled: true},
                {tags: [new AxRfid.Tag(ID_0, READER, false), new AxRfid.Tag(ID_1, READER, true), new AxRfid.Tag(ID_2, READER, true)]});
            var cmdResponses = [cmdTagPartialResponse(ID_0), cmdTagCompleteResponse(ID_1), cmdTagCompleteResponse(ID_2)];
            cmdTest(expectedState, cmdResponses);
        });

        it('cmd checkout', function () {
            var tag = new AxRfid.Tag(ID_0, READER, true);
            tag.setCheckoutState(true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, isEnabled: true},
                {tags: [tag]});
            var cmdResponses = [cmdTagCompleteResponse(ID_0), cmdSetCheckoutStateResponse(ID_0, true)];
            var callback = function () {
                var cmdSubscription = axRfidClient.setCheckoutState(ID_0, true);
                cmdSubscription.dispose();
            };
            cmdTest(expectedState, cmdResponses, callback);
        });

        it('cmd reload', function () {
            var tag = new AxRfid.Tag(ID_0, READER, true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, isEnabled: true},
                {tags: [tag]});
            var cmdResponses = [cmdTagCompleteResponse(ID_0), cmdResendResponse()];
            var callback = function () {
                axRfidClient.reload();
            };
            cmdTest(expectedState, cmdResponses, callback);
        });

    });
});