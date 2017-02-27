describe('RFID Client', function () {
    var READER = '1';
    var TAG_RESPONSES = [
        '{"cmd":"tag","id":"id0","type":"Item","reason":"Firsttime new complete","reader":'+READER+'}',
        '{"cmd":"tag","id":"id1","type":"Item","reason":"Firsttime new complete","reader":'+READER+'}',
        '{"cmd":"tag","id":"id3","type":"Item","reason":"Firsttime new complete","reader":'+READER+'}'
    ];

    describe('AxRfid.Client', function () {
        var axRfidClient;
        var mockWebSocket;
        var subscription;

        beforeEach(function () {
            axRfidClient = new AxRfid.Client({isDebug: true});
            mockWebSocket = new Rx.Subject();
            spyOn(Rx.DOM, 'fromWebSocket').and.returnValue(mockWebSocket);
        });

        afterEach(function () {
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }
        });

        it('tags', function (done) {
            axRfidClient.connect("name");
            TAG_RESPONSES.forEach(function (json) {
                var e = {};
                e.data = json;
                mockWebSocket.onNext(e);
            });
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true},
                {tags: [new AxRfid.Tag("id0", READER, true),new AxRfid.Tag("id1", READER, true),new AxRfid.Tag("id2", READER, true)]});
            var states = [];
            subscription = axRfidClient.getTagStore().subscribe(function (data) {
                states.push(data);
                if (states.length == 1) {
                    expect(states[0]).toEqual(expectedState);
                    done();
                }
            });
        });
    });
});