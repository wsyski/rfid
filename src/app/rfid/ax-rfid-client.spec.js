describe('RFID Client', function () {
    var TAG_ID = 'tagId';
    var READER = '1';

    describe('AxRfid.Client', function () {
        var axRfidClient;

        beforeEach(function () {
            axRfidClient = new AxRfid.Client();
        });

        it('verify api', function () {
            expect(typeof axRfidClient.connect).toBe('function');
            expect(typeof axRfidClient.disconnect).toBe('function');
        });
    });
});