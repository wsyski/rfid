describe('AxRfid', function () {
    var TAG_ID = 'tagId';
    var READER = '1';

    describe('AxRfid.TagStore', function () {
        var axRfidTagStore;

        beforeEach(function () {
            axRfidTagStore = new AxRfid.TagStore();
        });

        it('has the subscribe function', function () {
            expect(typeof axRfidTagStore.subscribe).toBe('function');
        });

        it('setConnected', function () {
            axRfidTagStore.setConnected(true);
            var subscription = axRfidTagStore.subscribe(function (data) {
                    var actualState = data;
                    var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true});
                    expect(actualState).toEqual(expectedState);
                },
                null,
                function () {
                    subscription.unsubscribe();
                });
        });

        it('addOrReplaceTag', function () {
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true},
                {tags: [new AxRfid.Tag(TAG_ID, READER, true)]});
            var states = [];
            var subscription0 = axRfidTagStore.subscribe(function (data) {
                    states.push(data);
                },
                null,
                function () {
                    axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
                    var subscription1 = axRfidTagStore.subscribe(function (data) {
                            states.push(data);
                        },
                        null,
                        function () {
                            subscription1.unsubscribe();
                            expect(states[0]).toEqual(expectedState);
                            expect(states[1]).toEqual(expectedState);

                        });
                    subscription0.unsubscribe();
                });
        });

        it('removeTag', function () {
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.removeTag(TAG_ID);
            var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true});
            var subscription = axRfidTagStore.subscribe(function (data) {
                    expect(data).toEqual(expectedState);
                },
                null,
                function () {
                    subscription.unsubscribe();
                });
        });

        it('setCheckoutState', function () {
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.setCheckoutState(TAG_ID, true);
            var tag= new AxRfid.Tag(TAG_ID, READER, true);
            tag.setCheckoutState(true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, tags: [tag]});
            var subscription = axRfidTagStore.subscribe(function (data) {
                    expect(data).toEqual(expectedState);
                },
                null,
                function () {
                    subscription.unsubscribe();
                });
        });
    });
});