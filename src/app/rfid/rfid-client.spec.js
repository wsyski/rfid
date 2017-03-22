describe('RFID Client', function () {
  var READER = "1";
  var ID_0 = "id0";
  var ID_1 = "id1";
  var ID_2 = "id2";
  var WORKPLACE_NAME = "workplace";
  var PROTOCOL = "ws";
  var HOST = "localhost";
  var PORT = 7000;

  describe('AxRfid.TagStore', function () {

    var axRfidTagStore;
    var subscription;
    var states;

    function lastState() {
      return states[states.length - 1];
    }

    beforeEach(function () {
      axRfidTagStore = new AxRfid.TagStore();
      states = [];
      subscription = axRfidTagStore.subscribe(function (data) {
        states.push(data);
      });
    });

    afterEach(function () {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
    });

    describe("setConnected", function () {

      beforeEach(function () {
        axRfidTagStore.setConnected(true);
      });

      it("has set the last state to connected, ready and enabled", function () {
        var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true, isEnabled: true});
        expect(lastState()).toEqual(expectedState);
      });

    });

    describe("addOrReplaceTag", function () {

      beforeEach(function () {
        axRfidTagStore.setConnected(true);
        axRfidTagStore.addOrReplaceTag(ID_0, READER, true);
      });

      it("the last state has just one tag", function () {
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true},
          {tags: [new AxRfid.Tag(ID_0, READER, true)]});
        expect(lastState()).toEqual(expectedState);
      });
    });

    describe("addOrReplaceTag twice", function () {

      beforeEach(function () {
        axRfidTagStore.setConnected(true);
        axRfidTagStore.addOrReplaceTag(ID_0, READER, true);
      });

      describe("when the same tag is added again", function () {
        beforeEach(function () {
          axRfidTagStore.addOrReplaceTag(ID_0, READER, true);
        });
      });

      it("the last state has just one tag", function () {
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true},
          {tags: [new AxRfid.Tag(ID_0, READER, true)]});
        expect(lastState()).toEqual(expectedState);
      });
    });


    describe("removeTag", function () {

      beforeEach(function () {
        axRfidTagStore.setConnected(true);
        axRfidTagStore.addOrReplaceTag(ID_0, READER, true);
        axRfidTagStore.removeTag(ID_0);
      });

      it("has set the last state has no tags", function () {
        var expectedState = Object.assign({}, AxRfid.INITIAL_STATE, {isConnected: true, isReady: true, isEnabled: true});
        expect(lastState()).toEqual(expectedState);
      });

    });

    describe("setCheckoutState", function () {

      beforeEach(function () {
        axRfidTagStore.setConnected(true);
        axRfidTagStore.addOrReplaceTag(ID_0, READER, true);
        axRfidTagStore.setCheckoutState(ID_0, true);
      });

      it("has set the last state has one tag and it is in checked out state", function () {
        var tag = new AxRfid.Tag(ID_0, READER, true);
        tag.setCheckoutState(true);
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true, tags: [tag]});
        expect(lastState()).toEqual(expectedState);
      });

    });
  });

  describe('AxRfid.Client', function () {

    var axRfidClient;
    var axRfidTagStore;
    var mockWebSocket;
    var openObserverOnNext;

    function cmdTagCompleteResponse(id) {
      return JSON.stringify({"cmd": "tag", "id": id, "type": "Item", "reason": "Firsttime new complete", "reader": READER});
    }

    function cmdTagPartialResponse(id) {
      return JSON.stringify({"cmd": "tag", "id": id, "type": "Item", "reason": "Partial", "reader": READER});
    }

    function cmdSetCheckoutStateResponse(id, isCheckoutState) {
      return JSON.stringify({"cmd": "setCheckoutState", "id": id, "security": isCheckoutState ? "Deactivated" : "Activated"});
    }

    function cmdTagProgram(id) {
      return JSON.stringify({"cmd": "program", "fields": {"id": id}, "tags": "1"});
    }

    function cmdResendResponse() {
      return JSON.stringify({"cmd": "resend"});
    }

    function cmdTest(cmdRespones, callback) {
      var states = [];
      var subscription = axRfidTagStore.subscribe(function (data) {
        states.push(data);
      });
      axRfidClient.connect(WORKPLACE_NAME, PROTOCOL, HOST, PORT);
      openObserverOnNext();
      if (callback) {
        callback();
      }
      cmdRespones.forEach(function (json) {
        var e = {};
        e.data = json;
        mockWebSocket.onNext(e);
      });
      subscription.unsubscribe();
      return states[states.length - 1];
    }

    beforeEach(function () {
      axRfidClient = new AxRfid.Client({isDebug: false});
      mockWebSocket = new Rx.Subject();
      spyOn(Rx.DOM, 'fromWebSocket').and.callFake(function (url, protocol, openObserver) {
        openObserverOnNext = openObserver.onNext.bind(openObserver);
        return mockWebSocket;
      });
      var mockWebsocketOnNext = mockWebSocket.onNext.bind(mockWebSocket);
      spyOn(mockWebSocket, 'onNext').and.callFake(function (e) {
        if (e.data) {
          return mockWebsocketOnNext(e);
        }
      });
      axRfidTagStore = axRfidClient.getTagStore();
    });


    describe("cmd tag: all complete", function () {
      var state;

      beforeEach(function () {
        var cmdResponses = [cmdTagCompleteResponse(ID_0), cmdTagCompleteResponse(ID_1), cmdTagCompleteResponse(ID_2)];
        state = cmdTest(cmdResponses);
      });

      it("tag store state has 2 complete tags", function () {
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true},
          {tags: [new AxRfid.Tag(ID_0, READER, true), new AxRfid.Tag(ID_1, READER, true), new AxRfid.Tag(ID_2, READER, true)]});
        expect(state).toEqual(expectedState);
      });
    });


    describe("cmd tag: 1 partial and 2 complete", function () {
      var state;

      beforeEach(function () {
        var cmdResponses = [cmdTagPartialResponse(ID_0), cmdTagCompleteResponse(ID_1), cmdTagCompleteResponse(ID_2)];
        state = cmdTest(cmdResponses);
      });

      it("tag store state has one complete and one uncomplete tags", function () {
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true},
          {tags: [new AxRfid.Tag(ID_0, READER, false), new AxRfid.Tag(ID_1, READER, true), new AxRfid.Tag(ID_2, READER, true)]});
        expect(state).toEqual(expectedState);
      });
    });

    describe("cmd checkout", function () {
      var state;

      beforeEach(function () {
        var cmdResponses = [cmdTagCompleteResponse(ID_0), cmdSetCheckoutStateResponse(ID_0, true)];
        var callback = function () {
          var cmdSubscription = axRfidClient.setCheckoutState(ID_0, true);
          cmdSubscription.dispose();
        };
        state = cmdTest(cmdResponses, callback);
      });

      it("tag store state has one tag in checkout state", function () {
        var tag = new AxRfid.Tag(ID_0, READER, true);
        tag.setCheckoutState(true);
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true},
          {tags: [tag]});
        expect(state).toEqual(expectedState);
      });
    });

    describe("cmd program", function () {
      var state;

      beforeEach(function () {
        var cmdResponses = [cmdTagCompleteResponse(ID_0),cmdTagProgram(ID_1)];
        var callback = function () {
          var cmdSubscription = axRfidClient.setTags(ID_1);
          cmdSubscription.dispose();
        };
        state = cmdTest(cmdResponses, callback);
      });

      it("tag store state has one tag programmed", function () {
        var tag = new AxRfid.Tag(ID_1, READER, true);
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true},
          {tags: [tag]});
        expect(state).toEqual(expectedState);
      });
    });


    describe("cmd reload", function () {
      var state;

      beforeEach(function () {
        var cmdResponses = [cmdTagCompleteResponse(ID_0), cmdResendResponse()];
        var callback = function () {
          axRfidClient.reload();
        };
        state = cmdTest(cmdResponses, callback);
      });

      it("tag store state has one complete tag reloaded", function () {
        var tag = new AxRfid.Tag(ID_0, READER, true);
        var expectedState = Object.assign({},
          AxRfid.INITIAL_STATE,
          {isConnected: true, isReady: true, isEnabled: true},
          {tags: [tag]});
        expect(state).toEqual(expectedState);
      });
    });

  });
});