describe('RFID Client', function () {
    var READER = "1";

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

        function cmdTest(expectedState, cmdRespones, callback) {
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
            });
            axRfidClient.connect("name");
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
                openObserver.onNext();
                return mockWebSocket;
            });
            var originalOnNext = mockWebSocket.onNext.bind(mockWebSocket);
            spyOn(mockWebSocket, 'onNext').and.callFake(function (e) {
                if (e.data) {
                    return originalOnNext(e);
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
                {isConnected: true, isReady: true},
                {tags: [new AxRfid.Tag("id0", READER, true), new AxRfid.Tag("id1", READER, true), new AxRfid.Tag("id2", READER, true)]});
            var cmdResponses = [cmdTagCompleteResponse("id0"), cmdTagCompleteResponse("id1"), cmdTagCompleteResponse("id2")];
            cmdTest(expectedState, cmdResponses);
        });

        it('cmd tags: 1 partial and 2 complete', function () {
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true},
                {tags: [new AxRfid.Tag("id0", READER, false), new AxRfid.Tag("id1", READER, true), new AxRfid.Tag("id2", READER, true)]});
            var cmdResponses = [cmdTagPartialResponse("id0"), cmdTagCompleteResponse("id1"), cmdTagCompleteResponse("id2")];
            cmdTest(expectedState, cmdResponses);
        });

        it('cmd checkout', function () {
            var tag = new AxRfid.Tag("id0", READER, true);
            tag.setCheckoutState(true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true},
                {tags: [tag]});
            var cmdResponses = [cmdTagCompleteResponse("id0"), cmdSetCheckoutStateResponse("id0", true)];
            var callback = function () {
                var cmdSubscription = axRfidClient.setCheckoutState("id0", true);
                cmdSubscription.dispose();
            };
            cmdTest(expectedState, cmdResponses, callback);
        });

        it('cmd reload', function () {
            var tag = new AxRfid.Tag("id0", READER, true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, isEnabled: true},
                {tags: [tag]});
            var cmdResponses = [cmdTagCompleteResponse("id0"), cmdResendResponse()];
            var callback = function () {
                axRfidClient.reload();
            };
            cmdTest(expectedState, cmdResponses, callback);
        });

    });

});