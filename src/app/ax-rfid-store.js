var assign = require('object-assign');
var createRxStore = require('rx-store').createRxStore;

(function (exports) {
    'use strict';
    var initialState = {isReady: true, isEnabled: false, tags: []};

    function Tag(id, reader, isComplete) {
        this.id = id;
        this.reader = reader;
        this.isComplete = isComplete;
    }

    function tagReducer(state, action) {
        function indexOf(tags, id) {
            tags.forEach(function (tag, index) {
                if (tag.id == id) {
                    return index;
                }
            });
            return -1;
        }

        function removeTag(tags, id) {
            return tags.filter(function (tag) {
                return tag.id !== id;
            })
        }

        var payload = action.payload;

        switch (action.type) {
            case 'ADD_OR_REPLACE_TAG':
                var tags = removeTag(state.tags, payload.id);
                return assign({}, state, {tags: tags.concat(new Tag(payload.id, payload.reader, payload.isComplete))});
            case 'REMOVE_TAG':
                var tags = removeTag(state.tags, payload.id);
                return assign({}, state, {tags: tags});
            case 'REMOVE_ALL_TAGS':
                return assign({}, state, {tags: []});
            case 'SET_ENABLED':
                return assign({}, state, {isEnabled: payload.isEnabled});
            case 'SET_ACTIVE':
                return assign({}, state, {isActive: payload.isActive});
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

        function removeAllTags() {
            return {
                type: 'REMOVE_ALL_TAGS'
            };
        }

        function setEnabled(isEnabled) {
            return {
                type: 'SET_ENABLED',
                payload: {isEnabled: isEnabled}
            };
        }

        function setActive(isActive) {
            return {
                type: 'SET_ACTIVE',
                payload: {isActive: isActive}
            };
        }

        var store = createRxStore(tagReducer, initialState);

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
            setActive: function (isActive) {
                var action = setActive(isActive);
                store.dispatch(action);
            },
            subscribe: function (callback) {
                return store.subscribe(callback);
            }
        }
    }

    exports.TagStore = TagStore;

}((window.AxRfidStore = window.AxRfidStore || {})));


module.exports = AxRfidStore;