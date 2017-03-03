(function (exports) {
    'use strict';

    var createRxStore;
    if (typeof require === "undefined") {
        createRxStore = RxStore.createRxStore;
    }
    else {
        require('rx-lite');
        require('rx-dom');
        createRxStore = require('rx-store').createRxStore;
    }

    var INITIAL_STATE = {isConnected: false, isReady: false, isEnabled: false, tags: []};

    function Tag(id, reader, isComplete) {
        this.id = id;
        this.reader = reader;
        this.isComplete = isComplete;
    }

    Tag.prototype.setCheckoutState = function (isCheckoutState) {
        this.isCheckoutState = isCheckoutState;
    };

    function tagStoreReducer(state, action) {

        function removeTag(tags, id) {
            return tags.filter(function (tag) {
                return tag.id !== id;
            })
        }

        var payload = action.payload;

        switch (action.type) {
            case 'SET_CONNECTED':
                return Object.assign({}, INITIAL_STATE, {isConnected: payload.isConnected, isReady: payload.isConnected, isEnabled: payload.isConnected});
            case 'ADD_OR_REPLACE_TAG':
                return Object.assign({}, state, {tags: removeTag(state.tags, payload.id).concat(new Tag(payload.id, payload.reader, payload.isComplete))});
            case 'REMOVE_TAG':
                return Object.assign({}, state, {tags: removeTag(state.tags, payload.id)});
            case 'SET_ENABLED':
                return Object.assign({}, state, {isEnabled: payload.isEnabled});
            case 'SET_READY':
                return Object.assign({}, state, {isReady: payload.isReady});
            case 'SET_CHECKOUT_STATE':
                return Object.assign({}, state, {
                    tags: state.tags.map(function (tag) {
                        var newTag = new Tag(tag.id, tag.reader, tag.isComplete);
                        if (tag.id === payload.id) {
                            newTag.setCheckoutState(payload.isCheckoutState);
                        }
                        else {
                            newTag.setCheckoutState(tag.isCheckoutState);
                        }
                        return newTag;
                    })
                });
            default:
                return state;
        }
    }

    function TagStore() {

        function addOrReplaceTag(id, reader, isComplete) {
            return {
                type: 'ADD_OR_REPLACE_TAG',
                payload: {id: id, reader: reader, isComplete: isComplete}
            };
        }

        function removeTag(id) {
            return {
                type: 'REMOVE_TAG',
                payload: {id: id}
            };
        }

        function setEnabled(isEnabled) {
            return {
                type: 'SET_ENABLED',
                payload: {isEnabled: isEnabled}
            };
        }

        function setReady(isReady) {
            return {
                type: 'SET_READY',
                payload: {isReady: isReady}
            };
        }

        function setCheckoutState(id, isCheckoutState) {
            return {
                type: 'SET_CHECKOUT_STATE',
                payload: {id: id, isCheckoutState: isCheckoutState}
            };
        }

        function setConnected(isConnected) {
            return {
                type: 'SET_CONNECTED',
                payload: {isConnected: isConnected}
            };
        }

        var store = createRxStore(tagStoreReducer, INITIAL_STATE);

        return {
            addOrReplaceTag: function (id, reader, isComplete) {
                var action = addOrReplaceTag(id, reader, isComplete);
                store.dispatch(action);
            },
            removeTag: function (id) {
                var action = removeTag(id);
                store.dispatch(action);
            },
            removeAllTags: function () {
                var action = removeAllTags();
                store.dispatch(action);
            },
            setEnabled: function (isEnabled) {
                var action = setEnabled(isEnabled);
                store.dispatch(action);
            },
            setReady: function (isReady) {
                var action = setReady(isReady);
                store.dispatch(action);
            },
            setCheckoutState: function (id, isCheckoutState) {
                var action = setCheckoutState(id, isCheckoutState);
                store.dispatch(action);
            },
            setConnected: function (isConnected) {
                var action = setConnected(isConnected);
                store.dispatch(action);
            },
            subscribe: function (callback) {
                return store.subscribe(callback);
            }
        }
    }

    exports.Tag = Tag;
    exports.TagStore = TagStore;
    exports.INITIAL_STATE = INITIAL_STATE;

}(window.AxRfid = window.AxRfid || {}));

if (typeof module !== "undefined") {
    module.exports = {
        Tag: AxRfid.Tag,
        TagStore: AxRfid.TagStore,
        INITIAL_STATE: AxRfid.INITIAL_STATE
    }
}