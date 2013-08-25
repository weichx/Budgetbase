//todo hang on to value so we can do operations without having re parse this._data
//a snapshot is a `picture` of what a given url location in the data tree looked like.
//it may or may not be current. Snapshots are immutible, this is enforced by stringifying
//any data they encapsulate and returning a parsed version of the data location on val().
//this clones the data location of the snapshot and protects us from having some callback
//mutate the snapshot (which is important because 1 snapshot is shared between many events
//as a performance consideration since it saves us from cloning the same node many times over)
var Snapshot = function(path, value){
    this._data = JSON.stringify(value);
    this._name = path[path.length - 1];
    this._path = path;
};

Snapshot.prototype = {
    //returns the value of this snapshot, can be null
    val:function(){
        return JSON.parse(this._data);
    },

    //returns the name of the snapshot, which is the key in reference that this refers to
    name:function(){
        return this._name;
    },

    //returns a snapshot of a child node, or null if the childName parameter is not a key
    //in the snapshot.
    child:function(childName){
        var data = JSON.parse(this._data);
        if(data && data[childName]){
            return new Snapshot(this._path.concat([childName]), data[childName]);
        }
        return null;
    },

    //checks if the child exists.
    hasChild:function(childName){
        var data = JSON.parse(this._data);
        return data[childName] !== undefined;
    },

    //checks if this snapshot has child nodes
    hasChildren:function(){
        var data = JSON.parse(this._data);
        if(typeof data === 'object'){
            return Object.keys(data).length > 0;
        }
        return false;
    },

    //returns the number of children this node has
    numChildren:function(){
        var data = this._data;
        if(typeof data === 'object'){
            return Object.keys(data).length;
        }
        return 0;
    },

    //invokes the function, fn, on all children
    forEach:function(fn){
        var data = this._data;
        if(typeof data === 'object'){
            for(var child in data){
                var snap = JSON.parse(JSON.stringify(data[child]));
                fn(snap);
            }
        }
    },
    //returns the reference that corresponds to this data location
    ref:function(){
        return new Budgetbase(this._path);
    }

};