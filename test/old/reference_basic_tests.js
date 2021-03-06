module('Reference basics', {
    setup:function () {
        Budgetbase.resetStore();
    }
});

test('A reference can be created through Budgetbase()', function () {
    var ref = new Budgetbase(R +'root');
    ok(ref, 'ref was null');
});

test('A reference should have a properly split (and private) url', function () {
    var ref = new Budgetbase(R +'one/two/three')._storeRef;
    console.log(ref);
    equal(ref._splitUrl[1], 'one', 'splitUrl[1] should be one, was ' + ref._splitUrl[1]);
    equal(ref._splitUrl[2], 'two', 'splitUrl[2] should be two, was ' + ref._splitUrl[2]);
    equal(ref._splitUrl[3], 'three', 'splitUrl[3] should be three, was ' + ref._splitUrl[3]);
});

test('A references url should be accurate', function () {
    var ref = new Budgetbase(R +'one/two/three');
    equal(ref.url(), R +'one/two/three', 'url should have been one/two/three, was ' + ref.url());
});

test('A references name should be last part of its url', function () {
    var ref = new Budgetbase(R +'one/two/three');
    equal(ref.name(), 'three', 'refs name() should be three, was ' + ref.name());
});

test('A reference should be able to return a reference to its parent', function () {
    var ref = new Budgetbase(R +'one/two/three');
    var parentName = ref.parent().name();
    equal(parentName, 'two', 'parentName should be two, was ' + parentName);
});

test('A reference should be able to return a reference to a child', function () {
    var ref = new Budgetbase(R +'one/two/three');
    var child = ref.child('four');
    var childName = child.name();
    var parentName = child.parent().name();
    equal(childName, 'four', 'child name should have been four');
    equal(parentName, 'three', 'parent name should have been three');
});

//todo test numChildren
//todo test hasChildren