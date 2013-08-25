//todo hang on to value so we can do operations without having re parse this._data
var Snapshot = function(path, value){
    this._data = JSON.stringify(value);
    this._name = path[path.length - 1];
    this._path = path;
};

Snapshot.prototype = {
    val:function(){
        return JSON.parse(this._data);
    },

    name:function(){
        return this._name;
    },

    child:function(childName){
        var data = JSON.parse(this._data);
        if(data && data[childName]){
            return new Snapshot(this._path.concat([childName]), data[childName]);
        }
        return null;
    },

    hasChild:function(childName){
        var data = JSON.parse(this._data);
        return data[childName] !== undefined;
    },

    hasChildren:function(){
        var data = JSON.parse(this._data);
        if(typeof data === 'object'){
            return Object.keys(data).length > 0;
        }
        return false;
    },

    numChildren:function(){
        var data = this._data;
        if(typeof data === 'object'){
            return Object.keys(data).length;
        }
        return 0;
    },

    forEach:function(fn){
        var data = this._data;
        if(typeof data === 'object'){
            for(var child in data){
                var snap = JSON.parse(JSON.stringify(data[child]));
                fn(snap);
            }
        }
    },

    ref:function(){
        return new Budgetbase(this._path);
    }

};