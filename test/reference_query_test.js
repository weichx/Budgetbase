module('Reference Query', {
    setup:function () {
        Budgetbase.resetStore();
    }
});

test('calling on("value") on a location that has  data in the store will fire a value event with that data', function () {
    var ref = new Budgetbase('one');
    ref.set('hello');
    ref.on('value', function (snapshot) {
        equal(snapshot.val(), 'hello', 'should have fired the value event');
    });
    expect(1);
});

//todo when we get to networking this will likely change
test('calling on("value") on a location that does not have data will not fire a value event', function () {
    var ref = new Budgetbase('test');
    ref.on('value', function (s) {
        ok(false);
    });
    expect(0);
});

test('on() will trigger separately for different instances of Budgetbase pointing at the same location', function () {
    var ref1 = new Budgetbase('test');
    var ref2 = new Budgetbase('test');

    ref1.set('hello');

    //should fire with initial value 'hello' and second value 'hi'
    ref1.on('value', function () {
        ok(true);
    });

    ref1.set('hi');

    //should only fire with 'hi'
    ref2.on('value', function () {
        ok(true);
    });

    expect(3);
});

test('calling child_added on a location that has children in the store will fire a child_added event per child at location', function () {
    var ref = new Budgetbase('test');
    ref.set({
        child1:'1',
        child2:'2'
    });
    ref.on('child_added', function (s) {
        ok(s);
    });
    expect(2);
});

test('calling child_added on a location that does not have children in the store will not fire any child_added events', function () {
    var ref = new Budgetbase('test');
    ref.on('child_added', function (s) {
        ok(s);
    });
    expect(0);
});

test('calling once will only ever fire an event one time', function () {
    var ref = new Budgetbase('test');
    ref.once('value', function (s) {
        ok(s);
    });
    ref.set('hi');
    ref.set('hello');
    expect(1);
});