//todo clean up this closure so Budgetbase isnt defined so awkwardly
var Budgetbase;
(function () {

    var root = new Reference([], null);

    //creates a new reference or finds an existing reference and retursn it.
    Budgetbase = function (url) {
        var splitUrl = url.split('/');
        var ref = root;
        for (var i = 0, il = splitUrl.length; i < il; i++) {
            ref = ref._addOrRetrieveChild(splitUrl[i]);
        }
        return ref;
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