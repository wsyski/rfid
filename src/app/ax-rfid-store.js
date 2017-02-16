var assign = require('object-assign');
var createRxStore = require('rx-store').createRxStore;

(function (exports) {
    'use strict';
    var initialState = {isReady: true, isEnabled: false, tags: []};

    function Tag(id, isComplete) {
        this.id = id;
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
                return tag.id!==id;
            })
        }

        var payload = action.payload;
        switch (action.type) {
            case 'ADD':
                var tags=removeTag(state.tags,payload.id);
                return assign({}, state, {tags: tags.concat(new Tag(payload.id, true))});
            case 'REMOVE':
                var tags=removeTag(state.tags,payload.id);
                return assign({}, state, {tags: tags});
            default:
                return state;
        }
    }

    function TagStore() {

        function add(payload) {
            return {
                type: 'ADD',
                payload: payload
            };
        }

        function remove(payload) {
            return {
                type: 'REMOVE',
                payload: payload
            };
        }

        var _store = createRxStore(tagReducer, initialState);

        return {
            add: function (data) {
                var action = add(data);
                _store.dispatch(action);
            },
            remove: function (data) {
                var action = remove(data);
                _store.dispatch(action);
            },
            subscribe: function (callback) {
                return _store.subscribe(callback);
            }
        }
    }

    exports.TagStore = TagStore;

}((window.AxRfidStore = window.AxRfidStore || {})));


module.exports = AxRfidStore;