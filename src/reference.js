/*var Budgetbase = function (url) {
    var splitUrl = (typeof url === 'string') ? url.split('/') : url;
    this._splitUrl = splitUrl;
    this._depth = splitUrl.length;
    this._name = splitUrl[this._depth - 1];
};

Budgetbase.prototype = {
    set:function (value) {
        if (value === null || value === undefined) {
            this.remove();
            return;
        }
        var ptr = Budgetbase.getStore();
        var path = this._splitUrl;
        var node = EventNode.root;
        for (var i = 0, il = path.length - 1; i < il; i++) {
            var key = path[i];
            node = node.addOrRetrieveChild(key);
            //there will never be null values in the tree, undefined means it is a new key
            if (ptr[key] === undefined || typeof ptr[key] !== 'object') {
                node.set(ptr[key], {});
                ptr[key] = {};
            }
            ptr = ptr[key];
        }
        key = this._name;
        node = node.addOrRetrieveChild(key);
        node.set(ptr[key], value);
        ptr[key] = value;
        //child changed upwards, calling here allows us to only get one event per child despite # of changes
        //node.upwardsRecursiveChildChanged();
    },

    update:function () {
        //update acts like set until we get to the end node, then we do not remove any
        //nodes, simply update their values and fire off our events.

        //node.upwardsRecursiveChildChanged();
    },

    push:function () {
        //with no args, push returns a Reference w/ no args, or pushes values into
        //a location if arguments are supplied.
    },

    remove:function () {
        var ptr = Budgetbase.getStore();
        var path = this._splitUrl;
        var node = EventNode.root;
        var storeStack = [];
        var keyStack = [];
        for (var i = 0, il = path.length - 1; i < il; i++) {
            var key = path[i];
            if (!node.child(key)) break; //we arent in the tree
            node = node.child(key);
            if (ptr[key] === undefined || typeof ptr[key] !== 'object') {
                break; //we arent in the tree
            }
            storeStack.push(ptr);
            keyStack.push(key);
            ptr = ptr[key];
        }
        key = this._name;
        node = node.child(key);
        if (node) {
            var frozenData = JSON.parse(JSON.stringify(Budgetbase.getStore()[path[0]]));
            node.set(ptr[key], null);
            node.parent.fireChildRemoved(path, ptr[key]);
            delete ptr[key];
            //start from root,
            node = EventNode.root;
            for (i = 0, il = path.length - 1; i < il; i++) {
                key = path[i];
                node = node.child(key);

                node.parent.fireChildRemoved();
                node.set();
            }
            for (i = storeStack.length - 1; i >= 0; i--) {
                node = node.parent;
                var obj = storeStack[i];
                var currentKey = keyStack[i];
                if (Object.keys(obj[currentKey]).length === 0) {
                    node.parent.fireChildRemoved(path, frozenData);
                    delete obj[currentKey];
                } else {
                    break;
                }
            }
        }
        //we arent in the tree if we get here
        //node.upwardsRecursiveChildChanged();
    },

    on:function (evtType, callback, context) {
        if (!callback) throw new Error("on functions require a callback");
        if (context) callback.context = context;
        EventNode.find(this._splitUrl).on(evtType, callback);
    },

    once:function (evtType, callback, context) {
        if (!callback) throw new Error("once functions require a callback");
        if (context) callback.context = context;
        callback.once = true;
        EventNode.find(this._splitUrl).once(evtType, callback);
    },

    off:function () {

    },

    url:function () {
        if (!this._url) {
            this._url = this._splitUrl.join('/');
        }
        return this._url;
    },

    name:function () {
        return this._name;
    },

    parent:function () {
        if (!this._parent) {
            var parentUrl = this._splitUrl.slice(0, this._depth - 1);
            this._parent = new Budgetbase(parentUrl);
        }
        return this._parent;
    },

    child:function (childName) {
        return new Budgetbase(this._splitUrl.concat([childName]));
    },

    hasChildren:function () {
        //are we in the store?
    },

    numChildren:function () {
        //are we in the store?
    },

    hasPendingTransaction:function () {

    }
};

var store = {};


Budgetbase.getStore = function () {
    return store;
};

Budgetbase.setStore = function (obj) {
    store = obj;
};

Budgetbase.resetStore = function () {
    store = {};
};*/