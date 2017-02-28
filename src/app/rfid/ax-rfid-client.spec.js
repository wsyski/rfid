describe('RFID Client', function () {
    var READER = "1";
    var TAG_RESPONSES = [
        '{"cmd":"tag","id":"id0","type":"Item","reason":"Firsttime new complete","reader": "' + READER + '"}',
        '{"cmd":"tag","id":"id1","type":"Item","reason":"Firsttime new complete","reader": "' + READER + '"}',
        '{"cmd":"tag","id":"id2","type":"Item","reason":"Firsttime new complete","reader": "' + READER + '"}'
    ];

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
            axRfidTagStore=axRfidClient.getTagStore();
        });

        afterEach(function () {
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }
        });

        it('tags', function () {
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true},
                {tags: [new AxRfid.Tag("id0", READER, true), new AxRfid.Tag("id1", READER, true), new AxRfid.Tag("id2", READER, true)]});
            var states = [];
            subscription = axRfidTagStore.subscribe(function (data) {
                    states.push(data);
            });
            axRfidClient.connect("name");
            TAG_RESPONSES.forEach(function (json) {
                var e = {};
                e.data = json;
                mockWebSocket.onNext(e);
            });
            var lastState = states[states.length - 1];
            expect(lastState).toEqual(expectedState);
        });
    });
})
;