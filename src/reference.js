//todo put this in a closure / module
//creates a reference which is a url path that is possibly evented and bound to the data tree.
var Reference = function (splitUrl, parent) {
    this._splitUrl = splitUrl;
    this._parent = parent;
    this._data = null;
    this._name = splitUrl[splitUrl.length - 1];
    this._children = {};
    this._data = (parent && parent._data && parent._data[this._name]) || null;
};

Reference.prototype = {
    //adds the child to this reference or retrieves it if already exists. returns the child in either case
    _addOrRetrieveChild:function (childName) {
        var children = this._children;
        if (!children[childName]) {
            children[childName] = new Reference(this._splitUrl.concat([childName]), this);
        }
        return children[childName];
    },

    //fires an event of the given evtType and generates a snapshot on a per event basis.
    //this is a performance factor since snapshots can be shared.
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

    //recursive method to see if we need to place a parent node into the data tree
    //or update the parent to point at the childs data property.
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

    //recursive method to see if we need to delete the parent object or fire child removed events
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

    //subscribes the reference to events. we could check that the event is valid, but we dont for now.
    on:function (evtType, callback, context) {
        if (!callback) throw new Error('You must supply a callback and event type to on');
        if (context) callback.context = context;
        if (!this._events) this._events = {};
        if (!this._events[evtType]) this._events[evtType] = [];
        this._events[evtType].push(callback);
    },

    //sets a value at this reference location, invoking events as needed.
    set:function (value) {
        //if set is called with a null or undefined value, we skip set and go straight to remove()
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
            //we know the parent isnt being removed so we do this manually instead of calling remove()
            for (var l in oldValue) {
                child = this._addOrRetrieveChild(l);
                this._fireEvent('child_removed', child._splitUrl, oldValue[l]);
            }
        } else if (newValueIsObject) {
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

    //removes this reference from the tree. does NOT remove event listeners attached to this reference
    //todo if unevented, consider remove the child from the parent
    remove:function () {
        //make sure we aren't firing events when we don't need to
        if (this._data === null) return;
        var parent = this._parent;
        parent && parent._willRemoveChild(this._name, this._data);
        this._fireEvent('value', this._splitUrl, null);
        this._data = null;
    },

    //returns the returns the url of the reference
    url:function () {
        return this._splitUrl.join('/');
    },

    //returns the name of this reference
    name:function () {
        return this._name;
    },

    //returns the parent of this reference
    parent:function () {
        return this._parent;
    },

    //creates or retrieves a child of this reference
    child:function (key) {
        return this._addOrRetrieveChild(key);
    }

};