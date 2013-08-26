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

test('calling on with a callback and context will invoke the callback with the context', function(){
    var ref = new Budgetbase('awesome');
    var object = {};
    ref.on('value', function(s){
        this.worksGreat = true;
    }, object);
    ref.set('sure does');
    equal(object.worksGreat, true, 'object should have a worksGreat property');
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

test('calling once on a populated location will return data', function () {
    var ref = new Budgetbase('meow');
    ref.set('object');
    ref.once('value', function (s) {
        equal(s.val(), 'object');
    });
    ref.set('different');
    expect(1);
});

test('calling once("child_added") on a populated location with multiple children will only return one child', function () {
    var ref = new Budgetbase('meow');
    ref.set({
        'child1':'ok',
        'child2':'ok2'
    });
    ref.once('value', function (s) {
        ok(s);
    });
    expect(1);
});

test('calling off with no parameters will remove all callbacks from a reference', function () {
    var ref = new Budgetbase('one/two');
    ref.on('value', function (s) {
        ok(s);
    });
    ref.on('child_changed', function (s) {
        ok(s);
    });

    ref.off();
    ref.set('hi');
    ref.child('three').set("meow");
    expect(0);
});

test('calling off with an event type will remove all events of that type and only events of that type', function () {
    var ref = new Budgetbase('one/two/three');
    ref.on('value', function(){});
    ref.on('value', function(){});
    ref.on('value', function(){});
    ref.on('child_added', function(){});
    equal(ref._storeRef._events['value'].length, 3, 'should have 3 value events registered');
    equal(ref._storeRef._events['child_added'].length, 1, 'should have 1 child_added event');
    ref.off('value');
    equal(ref._storeRef._events['value'].length, 0, 'should have 0 value events');
    equal(ref._storeRef._events['child_added'].length, 1, 'should have 1 child_added event');
});

test('calling off with a context will only remove callbacks that also have that context', function(){
    var ref = new Budgetbase('is/awesome');
    var object = {};
    var fn = function(s){
        this.awesome = true;
    };
    ref.on('value', fn, object);
    ref.on('value', fn);
    var evt = ref._storeRef._events['value'];
    equal(evt[0].context, object, 'before off is called evt[0] should have context object');
    ref.off('value', fn, object);
    equal(evt.length, 1, 'after off is called evt.length should be 1');
    equal(evt[0].context, undefined, "after off is called evt[0] should not have a context object");
});

//todo add test for snapshot name being what is should