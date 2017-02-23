describe('AxRfid', function () {

    describe('AxRfid.TagStore', function () {
        var axRfidTagStore;

        beforeEach(function () {
            axRfidTagStore = new AxRfid.TagStore();
        });

        it('has the subscribe function', function () {
            expect(typeof axRfidTagStore.subscribe).toBe('function');
        });
    });
});