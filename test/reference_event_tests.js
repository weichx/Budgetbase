module('Reference Events', {
    setup:function () {
        Budgetbase.resetStore();
    }
});

test('calling `set` will write data into the store', function () {
    var ref = new Budgetbase('one/two');
    ref.set('hello budgetbase!');
    var store = Budgetbase.getStore();
    equal(store.one.two, 'hello budgetbase!', 'should have written `hello budgetbase! into the store');
});

test('calling `set` will create reference nodes if none exist for a given path', function () {
    var ref = new Budgetbase('one/two');
    ref.set('five');
    var root = Budgetbase.__getRoot();
    ok(root._data['one'], 'root should have a child for key `one`');
    ok(root._data['one']['two'], 'root.one should have a child at key `two`');
});

test('calling `on` will add a callback to a reference for a given event type', function () {
    var ref = new Budgetbase('one');
    var fn = function (snapshot) {
    };
    ref.on('value', fn);
    var valueEvents = Budgetbase.__getRoot().child('one')._events['value'];
    equal(valueEvents.length, 1, 'valueEvents should be an array of length 1');
});

test('calling set with a primitive value will invoke any `value` handlers', function () {
    var ref = new Budgetbase('one/two');
    ref.on('value', function (snapshot) {
        ok(snapshot, 'the callback was not invoked');
    });
    ref.set('hello!');
});

test('calling set with a primitive will invoke any value handlers and the snapshot will be accurate', function () {
    var ref = new Budgetbase('one/two');
    ref.on('value', function (snapshot) {
        equal(snapshot.name(), 'two', 'name should be two');
        equal(snapshot.val(), 'hello budgetbase!', 'value should be hello budgetbase!');
    });
    ref.set('hello budgetbase!');
});

test('calling set with an object will trigger child added events', function () {
    var ref = new Budgetbase('one/two');
    ref.on('child_added', function (snapshot) {
        ok(snapshot, 'child added event was not called');
    });
    ref.set({
        child1:'c1'
    });
});

test('calling set with an object with multiple keys will trigger multiple child_added events', function () {
    var ref = new Budgetbase('one/two');
    var evtCount = 0;
    ref.on('child_added', function (snapshot) {
        evtCount++;
    });
    ref.set({
        child1:'c1',
        child2:'c2'
    });
    equal(evtCount, 2, 'child added was called ' + evtCount + ' times, should have been 2');
});

test('calling set with an object with multiple keys will trigger multiple child_added events but only 1 value event', function () {
    var ref = new Budgetbase('one/two');
    ref.on('child_added', function (snapshot) {
        ok(snapshot);
    });
    ref.on('value', function (snapshot) {
        ok(snapshot);
    });
    ref.set({
        child1:'c1',
        child2:'c2'
    });
    expect(3);
});

test('calling set on a location with a primitive calls child_added on parent ref but not child', function () {
    var called = 0;
    var childRef = new Budgetbase('one/two');
    childRef.on('child_added', function (snapshot) {
        equal(0, 1, 'should not have called child added on the child');
    });
    var parent = childRef.parent();
    parent.on('child_added', function (snapshot) {
        ok(snapshot, 'did not get here');
    });
    childRef.set('hello');
    equal(called, 0, 'called should be 0, was ' + called);
});

test('calling set on a location with an object calls child_added on the parent', function () {
    var called = 0;
    var ref = new Budgetbase('one/two');
    var fn = function (s) {
        called++;
    };
    var parent = ref.parent();
    parent.on('child_added', fn);
    ref.set({
        child:'1'
    });
    equal(called, 1, 'called should be 0, was ' + called);
});

test('calling set on a location not in the tree will fire value changes on other locations in path', function () {
    var notInTree = new Budgetbase('im/not/here');
    var notRef = new Budgetbase('im/not');
    notRef.on('value', function (snapshot) {
        ok(snapshot.val(), 'should have triggered');
    });
    notInTree.set('hello!');
    expect(1);
});

test('setting a location to an object will trigger any relevant value handlers on that locations children', function () {
    var notYetInTreeRef = new Budgetbase('one/two/three');
    notYetInTreeRef.on('value', function (snapshot) {
        ok(snapshot, 'not fired');
    });
    var twoRef = new Budgetbase('one/two');
    twoRef.set({
        three:'hurr',
        four:'also hurr'
    });
});

test('setting a location to an object will trigger relevant child_added handlers on out-of-tree locations in path', function () {
    var notYetInTreeRef = new Budgetbase('one/two/three');
    notYetInTreeRef.on('child_added', function (snapshot) {
        ok(snapshot.val() === 'here I iz', 'not fired');
    });
    var twoRef = new Budgetbase('one/two');
    twoRef.set({
        three:{
            child1:'here I iz'
        },
        four:'also hurr'
    });
});

test('adding a child to a location will trigger child added on parent & value on child', function () {
    var ref = new Budgetbase('red/blue');
    var called = 0;
    ref.on('child_added', function (snapshot) {
        called++;
    });

    var greenRef = ref.child('green');
    greenRef.on('value', function (snapshot) {
        called++;
    });

    greenRef.set('ok');

    equal(called, 2, 'should have called twice was only called ' + called);

});

test('calling child().set() on a location whos data is a primitive should overwrite the primitive with the child', function () {
    var ref = new Budgetbase('red/blue/green');
    ref.on('value', function (s) {
        ok(s);
    });
    ref.on('child_added', function (s) {
        ok(s);
    });
    ref.set('colors');
    ref.child('pink').set('gross');
    expect(3);
});

test('calling set with null on a location should not fire child_added on the parent', function () {
    var ref = new Budgetbase('red/blue');
    ref.on('child_added', function (s) {
        equal(0, 1, 'should not have called child_added');
    });
    ref.child('green').set(null);
    expect(0);
});

test('calling remove on a location not in the tree should not add it to the tree', function () {
    var ref = new Budgetbase('onefish/twofish/redfish/bluefish');
    ref.remove();
    equal(Budgetbase.getStore(), null, 'location should have been empty, wasnt');
});

test('calling remove on a location in the tree should remove it and all empty parents from the tree', function () {
    var ref = new Budgetbase('one/two/three');
    ref.set('herro');

    ref.remove();

    equal(Budgetbase.getStore(), null, 'should have removed all keys in the tree since we dont allow empty objects');
});

test('calling remove on a location in the tree should remove it and all empty parents and leave non empty parents in tree', function () {
    var oneRef = new Budgetbase('one');

    oneRef.set({
        'two':'should be removed',
        'unchanged':'should still be here after remove'
    });

    var ref = new Budgetbase('one/two/three');
    //calling set on this location should turn two into {three: 'hello'}
    ref.set('hello');
    ref.remove();
    equal(Budgetbase.getStore().one.two, undefined, 'should have removed store.one.two');
    equal(Budgetbase.getStore().one.unchanged, 'should still be here after remove', 'store.one.unchanged should have remained in tree');
});

test('calling remove on a location in the tree should remove it and call value on itself and child_removed on parent', function () {
    var oneRef = new Budgetbase('one');
    oneRef.set({
        'two':'should be removed',
        'unchanged':'should still be here after remove'
    });
    oneRef.on('child_removed', function (snapshot) {
        ok(snapshot.val(), 'should be valid object and not null');
    });
    var ref = new Budgetbase('one/two/three');
    ref.set('hello');
    var called = 0;
    //since on acts as a query we need to make sure we only check for null the 2nd time this
    //callback is invoked.
    ref.on('value', function (snapshot) {
        if (called === 1) {
            ok(snapshot.val() === null, 'should have hit this');
        }
        called++;
    });
    ref.remove();
    var store = Budgetbase.getStore();
    ok(store.one.unchanged, 'should not have removed unchanged');
    ok(!store.one.two, 'should have removed two');
    expect(4);
});

test('calling remove on a location in the tree should fire child_removed its parent and any empty nodes being removed', function () {
    var ref = new Budgetbase('one/two/three');
    var fn = function (snapshot) {
        ok(snapshot)
    };

    ref.parent().on('child_added', fn);
    ref.parent().parent().on('child_added', fn);
    ref.parent().parent().parent().on('child_added', fn);
    ref.set('hello');
    ref.remove();
    expect(3);

});

test('calling set with a primitive on an empty location in the tree should fire child_added on all ancestors execpt parent', function () {
    var ref = new Budgetbase('one/two/three');
    var fn = function (snapshot) {
        ok(snapshot)
    };
    ref.parent().on('child_added', fn);
    ref.parent().parent().on('child_added', fn);
    ref.parent().parent().parent().on('child_added', fn);
    ref.set('hello');
    expect(3);
});

test('calling remove on a location not in the tree should not fire child_removed on the parent', function () {
    var ref = new Budgetbase('im/not/here');
    var imNot = new Budgetbase('im/not');
    imNot.on('child_removed', function (snapshot) {
        ok(snapshot, 'should never get here')
    });
    ref.remove();
    expect(0);
});

test('calling remove on a location not in the tree should not fire value events at that location', function () {
    var ref = new Budgetbase('im/not/here');
    ref.on('value', function (snapshot) {
        ok(snapshot, 'should never get here');
    });
    ref.remove();
    expect(0);
});

test('calling remove on a location should fire value with a null snapshot.val() on the location if it is in the tree', function () {
    var ref = new Budgetbase('im/not/here');
    ref.set('not null');
    var called = 0;
    ref.on('value', function (snapshot) {
        if (called > 0) {
            ok(snapshot.val() === null);
        }
        called++;
    });
    ref.remove();
    expect(1);
});

test('setting a value that was on object to a primitive will call child removed for each removed key', function () {
    var ref = new Budgetbase('we/can/do/it');
    ref.set({
        'yes':1,
        'we':2,
        'can':3
    });
    ref.on('child_removed', function (snapshot) {
        ok(snapshot);
    });
    ref.set('you betcha');
    expect(3);
});

test('setting a value that was an object to a primitive will call value only once', function () {
    var ref = new Budgetbase('we/can/do/it');
    ref.set({
        'yes':1,
        'we':2,
        'can':3
    });
    //value is called once to get populated, so check for this via called
    var called = 0;
    ref.on('value', function (snapshot) {
        if (called > 0) {
            ok(snapshot);
        }
        called++;
    });
    ref.set('you betcha');
    expect(1);
});

test('setting a location that was a primitive to an object will call child_added for each added key', function () {
    var ref = new Budgetbase('we/can/do/it');
    ref.set('okie dokey');
    ref.on('child_added', function (snapshot) {
        ok(snapshot);
    });
    ref.set({
        one:1,
        two:2,
        three:3
    });
    expect(3);
});

test('setting a location that was a primitive to an object will call value only once', function () {
    var ref = new Budgetbase('we/can/do/it');
    ref.set('okie dokey');
    var called = 0;
    ref.on('value', function (snapshot) {
        if (called > 0) {
            ok(snapshot);
        }
        called++;
    });
    ref.set({
        one:1,
        two:2,
        three:3
    });
    expect(1);
});


test('setting a location that is already a primitive to another primitive should not fire child_added or removed', function () {
    var ref = new Budgetbase('yep/so/true');
    ref.set('word');
    ref.on('child_added', function () {
        ok(false)
    });
    ref.on('child_removed', function () {
        ok(false);
    });
    ref.set('uhhuh');
    expect(0);
});

test('setting a location already occupied by an object to another object with different keys should call child removed on old keys, child added on new ones and value only once', function () {
    var ref = new Budgetbase('t/e/s/t');
    var numbers = {
        '1':1,
        '2':2,
        '3':3
    };
    var letters = {
        a:'a',
        b:'b',
        c:'c'
    };
    var calledValue = 0;
    var calledAdded = 0;
    var calledRemoved = 0;
    ref.set(numbers);

    var addedBuffer = 0;
    ref.on('child_added', function (snapshot) {
        addedBuffer++;
        if (addedBuffer > 3) {
            calledAdded++;
        }
    });

    ref.on('child_removed', function (snapshot) {
        calledRemoved++;
    });

    var valueBuffer = 0;
    ref.on('value', function (snapshot) {
        if (valueBuffer > 0) {
            calledValue++;
        }
        valueBuffer++;
    });

    ref.set(letters);
    equal(calledValue, 1, 'should have only called value once');
    equal(calledAdded, 3, 'should have called child added thrice');
    equal(calledRemoved, 3, 'should have called child removed thrice');

});

test('setting a location to a different object with overlapping keys should remove/add/update properly and value is called on parent only once', function () {
    var ref = new Budgetbase('t/e/s/t');
    var initial = {
        'a':1,
        'b':2
    };
    var end = {
        'a':2,
        'c':3
    };
    ref.set(initial);
    var addedBuffer = 0;
    ref.on('child_added', function (s) {
        addedBuffer++;
        if (addedBuffer > 2) {
            equal(s.name(), 'c', 'should have added c');
        }
    });
    ref.on('child_removed', function (s) {
        equal(s.name(), 'b', 'should have removed b');
    });
    var valueBuffer1 = 0;
    ref.child('a').on('value', function (s) {
        valueBuffer1++;
        if (valueBuffer1 > 1) {
            equal(s.name(), 'a', 'should have changed value of a');
        }
    });

    var valueBuffer2 = 0;
    ref.on('value', function (s) {
        valueBuffer2++;
        if (valueBuffer2 > 1) {
            equal(s.name(), 't');
        }
    });

    ref.set(end);
    expect(4);
});

test('setting a location to a an object that contains other objects will fire off child_added and value events properly', function () {
    var threeRef = new Budgetbase('one/two/three');
    var threeChildAdded = 0;
    var threeValue = 0;
    var child1ChildAdded = 0;
    var child1Value = 0;
    threeRef.on('child_added', function () {
        threeChildAdded++;
    });
    threeRef.on('value', function () {
        threeValue++;
    });
    var child1Ref = threeRef.child('child1');
    child1Ref.on('value', function (snapshot) {
        child1Value++;
    });
    child1Ref.on('child_added', function (snapshot) {
        child1ChildAdded++;
    });
    threeRef.set({
        'child1':{
            a:1,
            b:2
        }
    });
    equal(threeChildAdded, 1, 'should have added one child to threeRef');
    equal(threeValue, 1, 'should have called value on threeRef once');
    equal(child1Value, 1, 'should have called child1 value once');
    equal(child1ChildAdded, 2, 'should have called child1 child_added twice');

});

test('calling set on a location not in the tree will not fire child_changed events on any parents.', function () {
    var ref = new Budgetbase('t/e/s/t');
    var fn = function (snapshot) {
        ok(false);
    };
    ref.on('child_changed', fn);
    ref.parent().on('child_changed', fn);
    ref.parent().parent().on('child_changed', fn);
    ref.parent().parent().parent().on('child_changed', fn);
    ref.set('ok');
    expect(0);
});

test('calling set on a location that is in the tree will fire child_changed events on all ancestors', function () {
    var ref = new Budgetbase('t/e/s/t');
    var fn = function (snapshot) {
        ok(true);
    };
    ref.on('child_changed', fn);
    ref.parent().on('child_changed', fn);
    ref.parent().parent().on('child_changed', fn);
    ref.parent().parent().parent().on('child_changed', fn);
    ref.set('ok');
    ref.set('hi');
    expect(3);
});

test('calling push with no parameters on a location will return a child reference for that location', function () {
    var ref = new Budgetbase('test');
    var push = ref.push();
    strictEqual(push._storeRef._data, null, 'should have null data pointer');
    equal(push._storeRef._parent, ref._storeRef, 'should have parent of ref');
    ok(push.name(), 'name should be a valid value');
});

test('calling set on a push ref will set its value and fire a child added event on the parent', function () {
    var ref = new Budgetbase('test');
    var push = ref.push();
    push.on('value', function (s) {
        equal(s.val(), 'hello budgetbase');
    });
    ref.on('child_added', function (s) {
        equal(push.name(), s.name());
    });
    push.set('hello budgetbase');
    expect(2);
});

test('calling push with a value parameter will add a child to the parent and fire child_added', function () {
    var ref = new Budgetbase('test');
    ref.on('child_added', function (s) {
        ok(s);
    });
    ref.push('hello budgetbase');
    ref.push('hello again');
    expect(2);
});

test('calling push with a null value will not add a child to the parent', function () {
    var ref = new Budgetbase('test');
    ref.on('child_added', function (s) {
        ok(false);
    });
    ref.push(null);
    expect(0);
});

test('calling set(somevalue) on a location not in the tree will not trigger a child_changed on that locations ancestors', function () {
    var ref = new Budgetbase('here/we/go');
    ref.parent().on('child_changed', function (s) {
        equal(s.name(), 'go', 'name should have been go');
    });
    ref.set('somevalue');
    expect(0);
});

test('calling set with an array will convert the array to an object and add each key as a child', function () {
    var ref = new Budgetbase('test');
    ref.on('child_added', function (s) {
        ok(s);
    });
    var array = ['this', 'is', 'awesome'];
    ref.set(array);
    expect(3);
});




test('updating an object in tree with another object that has additional attributes', function() {

    var ref = new Budgetbase('t/e/s/t');

    var initial = {
        'a':1,
        'b':2
    };
    var end = {
        'a':2,
        'c':3
    };

    ref.set(initial);

    ref.on('child_added', function (s) {
        equal(s.name(), 'c', 'should have added c');
    });


    ref.on("child_changed", function(s) {

    });

});

test('calling update on an object whose children are nested objects ', function() {

    var ref = new Budgetbase("one");

    var initial = {

        'b': {
            "b1" : 2,
            "b2" : 3
        }
    }

    var end = {

        'a' : {
            'b3' : 4,
            'b4' : 5
        },

        'c':4
    }

    ref.set(initial);

    ref.on('child_added', function(s) {
        equal(s.name(), s.name(), "");
        equal(s.name(), s.name(), "b4 is getting added");
    });


    ref.on('child_changed', function(s) {
        equal(s.name(), s.name(), "adding: " + s.name());
    });

    ref.update(end);

    console.log(ref.child('c')._data);
    console.log(ref.child('a').child('b4')._data);

    expect(2);
});


test('calling update on a location with a primitive will throw an exception', function () {
    var ref = new Budgetbase('one');
    throws(function () {
        ref.update('hello');
    });
    expect(1);
})    ;



