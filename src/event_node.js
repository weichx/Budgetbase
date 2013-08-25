/*var keyDiff = function (newObj, oldObj) {
    var added = [];
    var removed = [];
    var updated = [];
    for (var key in newObj) {
        if (!oldObj[key]) {
            added.push(key);
        } else {
            updated.push(key);
        }
    }
    for (key in oldObj) {
        if (!newObj[key]) {
            removed.push(key);
        }
    }
    return {
        added:added,
        removed:removed,
        updated:updated
    };
};

//remove should invoke removeChild(this.key), which fires child_removed on parent and value on self
//set should invoke child_added on parent and value on self
//

var EventNode = function (path, parent) {
    this.parent = parent;
    this.path = path;
    this.depth = path.length;
    this.childEvents = {};
    this.children = {};
    this.events = {};
    this.key = path[this.depth - 1];
};

EventNode.prototype = {

    //todo calling `on` will retrieve any data in the tree at that location
    on:function (evtType, callback) {
        //todo assert evt type is valid
        var parent = this.parent;
        var key = this.key;
        if (!this.events[evtType]) this.events[evtType] = [];
        this.events[evtType].push(callback);
    },

    set:function (oldValue, newValue) {
        var children = this.children;
        var parent = this.parent;
        var path = this.path;
        //trigger any local value changed events
        var valueEvents = this.events['value'];
        if (valueEvents) {
            var snapshot = new Snapshot(path, newValue);
            for (var x = 0, xl = valueEvents.length; x < xl; x++) {
                var fn = valueEvents[x];
                fn.call((fn.context || window), snapshot);
                if (fn.once) {
                    valueEvents.splice(i, 1);
                    i--;
                }
            }
        }
        //if the new value is null or undefined, we will remove
        //this node, so we tell the parent that the child is being removed
        if (newValue === null || newValue === undefined) {
            //  parent.fireChildRemoved(path, oldValue)
        }
        //since the parent is not
        if (oldValue === null || oldValue === undefined) {
            //    parent.fireChildAdded(path, newValue);
        }

        //if this node has children, they might be updated as well.
        if (children.length === 0) {
            return;
        }
        //todo at this point there must be a way to know we have evented children,
        //todo this could be determined when `on` and `off` and `once` are called.
        var newValueIsObject = typeof newValue === 'object' && newValue !== null;
        var oldValueIsObject = typeof oldValue === 'object' && oldValue !== null;

        if (newValueIsObject && oldValueIsObject) {
            var list = keyDiff(newValue, oldValue);
            var added = list.added;
            var removed = list.removed;
            var updated = list.updated;
            var key;
            var pData;
            for (var i = 0, il = added.length; i < il; i++) {
                key = added[i];
                pData = newValue[key];
                this.addOrRetrieveChild(key).set(null, pData);
                parent.fireChildAdded(path, pData);
            }
            for (i = 0, il = removed.length; i < il; i++) {
                key = removed[i];
                this.addOrRetrieveChild(key).set(oldValue[key], null);
            }
            for (i = 0, il = updated.length; i < il; i++) {
                key = updated[i];
                this.addOrRetrieveChild(key).set(oldValue[key], newValue[key]);
                this.fireChildChanged(key, newValue[key]);
            }
        } else if (newValueIsObject) {
            //no children to remove or update
            for (key in newValue) {
                pData = newValue[key];
                this.addOrRetrieveChild(key).set(null, pData);
                parent.fireChildAdded(path, pData);
            }
        } else if (oldValueIsObject) {
            for (key in newValue) {
                this.addOrRetrieveChild(key).set(null, newValue[key])
            }
        } else {
            if (newValue !== null && oldValue === null || oldValue === undefined) {
                parent.fireChildAdded(path, newValue);
            }
        }
        //neither new nor old value is an object at this point,
        //since we already fired our local callbacks, we're done
    },

    fireChildAdded:function (childPath, newValue) {
        var childAddedEvents = this.events['child_added'];
        if (childAddedEvents) {
            var snapshot = new Snapshot(childPath, newValue);
            for (var i = 0, il = childAddedEvents.length; i < il; i++) {
                var fn = childAddedEvents[i];
                fn.call((fn.context || window), snapshot);
            }
        }
    },

    fireChildRemoved:function (childPath, oldValue) {
        var childRemovedEvents = this.events['child_removed'];
        if (childRemovedEvents) {
            var snapshot = new Snapshot(childPath, oldValue);
            for (var i = 0, il = childRemovedEvents.length; i < il; i++) {
                var fn = childRemovedEvents[i];
                fn.call((fn.context || window), snapshot);
            }
        }
    },

    fireChildChanged:function (childPath, newValue) {

    },

    child:function (childName) {
        return this.children[childName];
    },

    addOrRetrieveChild:function (key) {
        var children = this.children;
        if (!children[key]) children[key] = new EventNode(this.path.concat([key]), this);
        return children[key];
    },

    removeChild:function (childName) {
        //will need to do some deeper un linking for this
    }

};

EventNode.root = new EventNode([], null);

EventNode.reset = function () {
    EventNode.root = new EventNode([], null);
};

EventNode.find = function (path) {
    var pNode = EventNode.root;
    for (var i = 0, il = path.length; i < il; i++) {
        pNode = pNode.addOrRetrieveChild(path[i]);
    }
    return pNode;
};*/