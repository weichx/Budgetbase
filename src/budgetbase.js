//todo clean up this closure so Budgetbase isnt defined so awkwardly
var Budgetbase;
(function () {

    var root = new Reference([], null);

    //creates a new reference or finds an existing reference and return
    Budgetbase = function (url) {
        var splitUrl = url.split('/');
        var ref = root;
        if (url !== '') {
            for (var i = 0, il = splitUrl.length; i < il; i++) {
                ref = ref._addOrRetrieveChild(splitUrl[i]);
            }
        }
        //store ref is a pointer to a reference object.
        this._storeRef = ref;
    };

    Budgetbase.prototype = {

        on:function (evtType, callback, context) {
            this._storeRef.on(evtType, callback, context);
        },

        set:function (value) {
            this._storeRef.set(value);
        },

        update:function (value) {
            this._storeRef.update(value);
        },

        push:function (value) {
            return this._storeRef.push(value);
        },

        remove:function () {
            this._storeRef.remove();
        },

        url:function () {
            return this._storeRef._url;
        },

        name:function () {
            return this._storeRef._name;
        },

        parent:function () {
            if (this._storeRef._parent) {
                return new Budgetbase(this._storeRef._parent._url);
            }
            return null;
        },

        child:function (childPath) {
            return new Budgetbase(this._storeRef._url + '/' + childPath);
        }
    };

    //returns the root reference
    Budgetbase.__getRoot = function () {
        return root;
    };

    //mainly for testing, this resets the root object, allowing other objects
    //to be garbage collected and effectively resetting the data tree.
    Budgetbase.resetStore = function () {
        root = new Reference([], null);
    };

    //returns the root reference's data object
    Budgetbase.getStore = function () {
        return root._data;
    };

}());