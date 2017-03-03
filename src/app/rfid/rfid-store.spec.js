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

        it('setConnected', function () {
            var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true, isEnabled: true});
            var states = [];
            subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
            });
            axRfidTagStore.setConnected(true);
            expect(states[states.length-1]).toEqual(expectedState);
        });

        it('addOrReplaceTag', function () {
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, isEnabled: true},
                {tags: [new AxRfid.Tag(TAG_ID, READER, true)]});
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
            });
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            expect(states[states.length-1]).toEqual(expectedState);
        });

        it('removeTag', function () {
            var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true, isEnabled: true});
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
            });
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.removeTag(TAG_ID);
            expect(states[states.length-1]).toEqual(expectedState);
        });

        it('setCheckoutState', function () {
            var tag = new AxRfid.Tag(TAG_ID, READER, true);
            tag.setCheckoutState(true);
            var expectedState = Object.assign({},
                AxRfid.INITIAL_STATE,
                {isConnected: true, isReady: true, isEnabled: true, tags: [tag]});
            var states = [];
            var subscription = axRfidTagStore.subscribe(function (data) {
                states.push(data);
            });
            axRfidTagStore.setConnected(true);
            axRfidTagStore.addOrReplaceTag(TAG_ID, READER, true);
            axRfidTagStore.setCheckoutState(TAG_ID, true);
            expect(states[states.length-1]).toEqual(expectedState);
        });
    });
});