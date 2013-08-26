//todo put this in a closure / module
//todo add completion callbacks to set, push, update
//creates a reference which is a url path that is possibly evented and bound to the data tree.
var Reference = function (splitUrl, parent) {
    this._splitUrl = splitUrl;
    this._url = splitUrl.join('/');
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
                if (fn.once) {
                    events.splice(i, 1);
                    i--;
                }
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
            this._fireEvent('child_removed', url.concat([childKey]), childData);
            this._fireEvent('value', url, null);
            this._parent && this._parent._willRemoveChild(this._name, this._data);
            this._data = null;
        } else {
            this._fireEvent('child_removed', url.concat([childKey]), childData);
            delete this._data[childKey];
        }
    },

    _didChangeChild:function (childKey, childData) {
        var parent = this._parent;
        if (parent) {
            parent._fireEvent('child_changed', childKey, childData);
            parent._didChangeChild(this._name, this._data);
        }
    },

    //subscribes the reference to events. we could check that the event is valid, but we dont for now.
    on:function (evtType, once, callback, context) {
        if (!callback) throw new Error('You must supply a callback and event type to on');
        if (context) callback.context = context;

        if (evtType === 'value') {
            var data = this._data;
            if (data !== null) {
                callback.call((context || window), new Snapshot(this._splitUrl, data));
                if (once) {
                    return;
                }
            }
        }

        if (evtType === 'child_added') {
            data = this._data;
            if (typeof data === 'object' && data !== null) {
                if (once) {
                    //todo when priority works this should be called on top priority child
                    for (var z in data) {
                        callback.call((context || window), new Snapshot(this._splitUrl, data[z]));
                        return;
                    }
                }
                for (var k in data) {
                    callback.call((context || window), new Snapshot(this._splitUrl, data[k]));
                }
            }
        }

        if (!this._events) this._events = {};
        if (!this._events[evtType]) this._events[evtType] = [];
        this._events[evtType].push(callback);
    },

    //internal set function to handle upwards firing of child changed events. Without this we would have little control
    //over when to fire child_changed events due to possible object nesting and the requirement that only one child_changed
    //event gets triggered per set call.
    _set:function (value) {
        //if set is called with a null or undefined value, we skip set and go straight to remove()
        if (value === null || value === undefined) {
            this.remove();
            return;
        }
        //we dont allow arrays, so process the value if it is an array and convert it to an object who's keys are
        //the array indices and values are the array values at that index.
        if (Object.prototype.toString.call(value) === '[object Array]') {
            var obj = {};
            for (var a = 0, al = value.length; a < al; a++) {
                obj[a] = value[a];
            }
            value = obj;
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
                if (value[x] === undefined) { //remove old values not in new value
                    child = this._addOrRetrieveChild(x);
                    this._fireEvent('child_removed', child._splitUrl, oldValue[x]);
                } else {    //update old values still in new value
                    child = this._addOrRetrieveChild(x);
                    child._set(value[x]);
                    //manually fire child_changed event, the upwards calls will happen in set() so we only handle
                    //downwards child_changed calls here.
                    this._fireEvent('child_changed', child._splitUrl, value[x]);
                }
            }
            for (var z in value) {
                if (oldValue[z] === undefined) {  //add children in new value not in old value
                    child = this._addOrRetrieveChild(z);
                    child._set(value[z]);
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
                child._set(value[k]);
                this._fireEvent('child_added', child._splitUrl, value[k]);
            }
        } else {
            if (oldValue === null || oldValue === undefined) {
//                this._fireEvent('child_added', this._splitUrl, this._data);
            }
            //new and old are primitives
        }
        this._fireEvent('value', this._splitUrl, this._data);
    },

    //sets a value at this reference location, invoking events as needed.
    set:function (value) {
        //only fire child_changed events if the location was previously null.
        var shouldFireChanges = this._data !== null;
        this._set(value);
        if (shouldFireChanges) {
            this._didChangeChild(this._name, this._data);
        }
        //network data: url of changes, call update on top most root that was affected
    },

    _update:function (value) {

        console.log("updating");

        if (typeof value !== 'object' || value === null) {
            throw new Error("Budgetbase.update failed: First argument must be an object containing the children to replace. ");
        }

        if (value === undefined) {
            throw new Error("Budgetbase.update failed: Was called with 0 arguments. Expects at least 1.");
        }

        //we dont allow arrays, so process the value if it is an array and convert it to an object who's keys are
        //the array indices and values are the array values at that index.
        if (Object.prototype.toString.call(value) === '[object Array]') {
            var obj = {};
            for (var a = 0, al = value.length; a < al; a++) {
                obj[a] = value[a];
            }
            value = obj;
        }


        var parent = this._parent;
        //upwards trace to make sure parent is an object and in tree
        parent._willSetChild(this._name, value);

        var oldValue = this._data;

        var newValueIsObject = typeof value === 'object' && value !== null;
        var oldValueIsObject = typeof oldValue === 'object' && oldValue !== null;


        var child;

        if (oldValueIsObject && newValueIsObject) {
            console.log("two objects");
            for (var z in value) {
                child = this._addOrRetrieveChild(z);
                child._set(value[z]);
            }
        }
        else if (newValueIsObject) {
            console.log("new object");
            for (var k in value) {
                child = this._addOrRetrieveChild(k);
                child._set(value[k]);
            }
        }
        else if (oldValueIsObject) {
            console.log("old value is object, new value is primitive")
        }

        this._fireEvent('value', this._splitUrl, this._data);
    },

    update:function (value) {
        var shouldFireChanges = this.data !== null;
        this._update(value);
        if (shouldFireChanges) {
            this._didChangeChild(this._name, this._data);
        }
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

    //todo find a better pushId
    //todo revisit when we add priority
    //push is a reference generator. it will add a child to this location with a unique, timestamp based
    //key name. if parameters are passed into this function it will also call set on the child, otherwise
    //it will return the child.
    push:function (value) {
        //dont allow pushing null values
        if (value === null) {
            return undefined;
        }
        var pushId = new Date().getTime().toString();
        var child = new Reference(this._splitUrl.concat([pushId]), this);
        this._children[pushId] = child;
        //return the child if no arguments are supplied
        if (value === undefined) {
            //get an empty reference and set its storeRef explicitly
            var budgetbaseRef = new Budgetbase('');
            budgetbaseRef._storeRef = child;
            return budgetbaseRef;
        }
        //if this node does not exist, adding a child will fire child_added for us.
        //if this node does not exist, we need to fire our own child_added event.
        var shouldFireAddChild = this._data !== null;
        child.set(value);
        if (shouldFireAddChild) {
            this._fireEvent('child_added', child._splitUrl, value);
        }
        //ensures consistent return points
        return undefined;
    },

    //creates or retrieves a child of this reference
    child:function (key) {
        return this._addOrRetrieveChild(key);
    }
};