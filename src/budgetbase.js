var Budgetbase;
(function () {
    var store = {};

    var Reference = function (splitUrl, parent) {
        this._splitUrl = splitUrl;
        this._parent = parent;
        this._data = null;
        this._name = splitUrl[splitUrl.length - 1];
        this._children = {};
        this._data = (parent && parent._data && parent._data[this._name]) || null;
    };

    Reference.prototype = {
        _addOrRetrieveChild:function (childName) {
            var children = this._children;
            if (!children[childName]) {
                children[childName] = new Reference(this._splitUrl.concat([childName]), this);
            }
            return children[childName];
        },

        _fireEvent:function (evtType, path, evtData) {
            var events = this._events && this._events[evtType];
            if (events) {
                var snapshot = new Snapshot(path, evtData);
                for (var i = 0, il = events.length; i < il; i++) {
                    var fn = events[i];
                    fn.call((fn.context || window), snapshot);
                }
            }
        },

        _willSetChild:function (childKey, childData) {
            if (this._data === null || typeof this._data !== 'object') {
                this._data = {};
                var data = this._data;
                var parent = this._parent;
                var parentData = parent && parent._data;
                data[childKey] = childData;
                //point the parents key for us a our data property since it was updated
                if (parent && typeof parentData === 'object' && parentData !== null) {
                    parentData[this._name] = this._data;
                }
                this._fireEvent('child_added', this._splitUrl.concat([childKey]), childData);
                this._fireEvent('value', this._splitUrl, data);
                parent && parent._willSetChild(this._name, data);
            }
        },

        _willRemoveChild:function (childKey, childData) {
            //todo optimize this check when you get around to active / inactive children
            if (this._data === null) return;
            var url = this._splitUrl;
            var keys = Object.keys(this._data); //we know it's an object because it has a child trying to be removed
            //remove self from tree if we only had one child
            if (keys.length === 1) {
                this._fireEvent('child_removed', url.slice(0, url.length - 1), childData);
                this._fireEvent('value', url, null);
                this._parent && this._parent._willRemoveChild(this._name, this._data);
                this._data = null;
            } else {
                this._fireEvent('child_removed', url, childData);
                delete this._data[childKey];
            }
        },

        on:function (evtType, callback, context) {
            if (!callback) throw new Error('You must supply a callback and event type to on');
            if (context) callback.context = context;
            if (!this._events) this._events = {};
            if (!this._events[evtType]) this._events[evtType] = [];
            this._events[evtType].push(callback);
        },

        set:function (value) {
            if (value === null || value === undefined) {
                this.remove();
                return;
            }
            var parent = this._parent;
            //upwards trace to make sure parent is an object and in tree
            parent._willSetChild(this._name, value);

            var oldValue = this._data;
            this._data = value;
            var newValueIsObject = typeof value === 'object' && value !== null;
            var oldValueIsObject = typeof oldValue === 'object' && oldValue !== null;
            var child;
            if (oldValueIsObject && newValueIsObject) {
                for (var x in oldValue) {
                    if (!value[x]) { //remove old values not in new value
                        child = this._addOrRetrieveChild(x);
                        this._fireEvent('child_removed', child._splitUrl, oldValue[x]);
                    } else {    //update old values still in new value
                        child = this._addOrRetrieveChild(x);
                        child.set(value[x]);
                        //todo call child_changed here or handle elsewhere
                    }
                }
                for (var z in value) {
                    if (!oldValue[z]) {  //add children in new value not in old value
                        child = this._addOrRetrieveChild(z);
                        child.set(value[z]);
                        this._fireEvent('child_added', child._splitUrl, value[z]);
                    }
                }
            } else if (oldValueIsObject) {
                //we know the parent isnt being removed so we do this manually
                for (var l in oldValue) {
                    child = this._addOrRetrieveChild(l);
                    this._fireEvent('child_removed', child._splitUrl, oldValue[l]);
                }
            } else if (newValueIsObject) {
                //if wasnt null before, fire child removed?
                for (var k in value) {
                    child = this._addOrRetrieveChild(k);
                    child.set(value[k]);
                    this._fireEvent('child_added', child._splitUrl, value[k]);
                }
            } else {
                //new and old are primitives
            }
            this._fireEvent('value', this._splitUrl, this._data);

            //upwards fire didSetChild() -> invokes child changed handlers, stopping when we no longer listen for that event
            //network data: url of changes, call update on top most root that was affected
        },

        //todo if unevented, consider remove the child from the parent
        remove:function () {
            //make sure we aren't firing events when we don't need to
            if (this._data === null) return;
            var parent = this._parent;
            parent && parent._willRemoveChild(this._name, this._data);
            this._fireEvent('value', this._splitUrl, null);
            this._data = null;
        },

        url:function () {
            return this._splitUrl.join('/');
        },

        name:function () {
            return this._name;
        },

        parent:function () {
            return this._parent;
        },

        child:function (key) {
            return this._addOrRetrieveChild(key);
        }

    };

    var root = new Reference([], null);

    Budgetbase = function (url) {
        var splitUrl = url.split('/');
        var ref = root;
        for (var i = 0, il = splitUrl.length; i < il; i++) {
            ref = ref._addOrRetrieveChild(splitUrl[i]);
        }

        return ref;
    };

    Budgetbase.__getRoot = function () {
        return root;
    };

    Budgetbase.resetStore = function () {
        root = new Reference([], null);
    };

    Budgetbase.getStore = function () {
        return root._data;
    };

}());