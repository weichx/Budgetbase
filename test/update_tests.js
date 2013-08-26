module('Reference Events Update', {
    setup:function () {
        Budgetbase.resetStore();
    }
});


test('updating an object in tree with another object that has additional attributes', function () {

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
        equal(s.name(), s.name(), 'should have added: ' + s.name());
    });

    expect(2);
});

test('calling update on an object will trigger one child_added event per child added', function () {

    var ref = new Budgetbase("one");

    var initial = {
        'b':{
            "b1":2,
            "b2":3
        }
    };

    var end = {
        'a':{
            'b3':4,
            'b4':5
        },
        'c':4
    };

    ref.set(initial);

    var aAdded = false;
    var cAdded = false;
    ref.on('child_added', function (s) {

        if (s.name() === 'a') {
            aAdded = true;
        } else if (s.name() === 'c') {
            cAdded = true;
        }
    });

    ref.update(end);
    ok(aAdded);
    ok(cAdded);
});

test('calling update on a location with object data will trigger child changed events on the parent', function () {
    var ref = new Budgetbase("one");

    var initial = {
        'b':{
            "b1":2,
            "b2":3
        }
    };

    var end = {
        'a':{
            'b3':4,
            'b4':5
        },
        'c':4
    };
    ref.set(initial);
    ref.parent().on('child_changed', function (s) {
        console.log(s);
        equal(s.name(), 'one', 'should trigger child_changed on parent');
    });
    ref.update(end);
    expect(1);
});


test('calling update on a location with a primitive will throw an exception', function () {
    var ref = new Budgetbase('one');
    throws(function () {
        ref.update('hello');
    });
    expect(1);
});


test('calling update on a location with no parameter will throw an exeception', function () {
    var ref = new Budgetbase('one');
    throws(function () {
        ref.update();
    });
    expect(1);
});

test('calling update on a location with a null parameter will throw an exception', function () {
    var ref = new Budgetbase('one');
    throws(function () {
        ref.update(null);
    });
    expect(1);
});

test('calling update on an empty location will behave like set', function () {

    var ref = new Budgetbase('one');
    ref.update({
        'child1':1,
        'child2':2,
        'child3':3,
    });

    ref.on('child_added', function (s) {
        ok("child added: " + s.name());
    });

//    ref.on("value", function(s) {
//        ok("value: " + s.name());
//    })

    console.log(ref.child('child2')._storeRef._data);
    expect(2);
});