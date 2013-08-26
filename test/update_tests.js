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


test('calling update on a location with a primitive will throw an exception', function () {
    var ref = new Budgetbase('one');
    throws(function () {
        ref.update('hello');
    });
    expect(1);
});

