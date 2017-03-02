describe('RFID Client', function () {
    var READER = "1";

    function cmdTagComplete(id) {
        return JSON.stringify({"cmd": "tag", "id": id, "type": "Item", "reason": "Firsttime new complete", "reader": READER});
    }

    function cmdTagPartial(id) {
        return JSON.stringify({"cmd": "tag", "id": id, "type": "Item", "reason": "Partial", "reader": READER});
    }

    describe('AxRfid.Client', function () {
        var axRfidClient;
        var axRfidTagStore;
        var mockWebSocket;
        var subscription;

        beforeEach(function () {
            axRfidClient = new AxRfid.Client({isDebug: true});
            mockWebSocket = new Rx.Subject();
            spyOn(Rx.DOM, 'fromWebSocket').and.callFake(function (url, protocol, openObserver, closingObserver) {
                openObserver.onNext();
                return mockWebSocket;
            });
            axRfidTagStore = axRfidClient.getTagStore();
        });

        afterEach(function () {
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }
        });

        it('cmd tag', function () {
            function test(expectedState,cmds) {
                var states = [];
                subscription = axRfidTagStore.subscribe(function (data) {
                    states.push(data);
                });
                axRfidClient.connect("name");
                cmds.forEach(function (json) {
                    var e = {};
                    e.data = json;
                    mockWebSocket.onNext(e);
                });
                var lastState = states[states.length - 1];
                expect(lastState).toEqual(expectedState);
            }

            it('all complete', function () {
                var expectedState = Object.assign({},
                    AxRfid.INITIAL_STATE,
                    {isConnected: true, isReady: true},
                    {tags: [new AxRfid.Tag("id0", READER, true), new AxRfid.Tag("id1", READER, true), new AxRfid.Tag("id2", READER, true)]});
                var cmds = [cmdTagComplete("id0"), cmdTagComplete("id1"), cmdTagComplete("id2")];
                test(expectedState,cmds);
            });

            it('1 partial and 2 complete', function () {
                var expectedState = Object.assign({},
                    AxRfid.INITIAL_STATE,
                    {isConnected: true, isReady: true},
                    {tags: [new AxRfid.Tag("id0", READER, false), new AxRfid.Tag("id1", READER, true), new AxRfid.Tag("id2", READER, true)]});
                var cmds = [cmdTagPartial("id0"), cmdTagComplete("id1"), cmdTagComplete("id2")];
                test(expectedState,cmds);
            });
        });
    });
});