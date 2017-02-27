describe('RFID Store', function () {
    var TAG_ID = 'tagId';
    var READER = '1';

    describe('AxRfid.TagStore', function () {
        var axRfidTagStore;
        var subscription;

        beforeEach(function () {
            axRfidTagStore = new AxRfid.TagStore();
        });

        afterEach(function () {
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }
        });


        it('verify api', function () {
            expect(typeof axRfidTagStore.subscribe).toBe('function');
        });

        it('setConnected', function (done) {
            var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true});
            var states = [];
            subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
                if (states.length == 2) {
                    expect(states[states.length-1]).toEqual(expectedState);
                    done();
                }
            });
            axRfidTagStore.setConnected(true);
        });

        it('addOrReplaceTag', function (done) {
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true},
                {tags: [new AxRfid.Tag(TAG_ID, READER, true)]});
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
                if (states.length == 4) {
                    expect(states[states.length-1]).toEqual(expectedState);
                    done();
                }
            });
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
        });

        it('removeTag', function (done) {
            var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true});
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
                if (states.length == 4) {
                    expect(states[states.length-1]).toEqual(expectedState);
                    done();
                }
            });
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.removeTag(TAG_ID);
        });

        it('setCheckoutState', function (done) {
            var tag = new AxRfid.Tag(TAG_ID, READER, true);
            tag.setCheckoutState(true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, tags: [tag]});
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
                if (states.length == 4) {
                    expect(states[states.length-1]).toEqual(expectedState);
                    done();
                }
            });
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.setCheckoutState(TAG_ID, true);
        });
    });
});