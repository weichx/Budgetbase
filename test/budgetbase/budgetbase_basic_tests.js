module('Budgetbase basics', {
    setup:function(){
        Budgetbase.resetStore();
    }
});

test('calling new Bugetbase will return a non null reference', function () {
    var ref = new Budgetbase(R + 'some/u/r/l');
    ok(ref, 'ref should not be null');
});

test('calling toString() on a reference returns its url path', function () {
    var ref = new Budgetbase(R + 'some/u/r/l');
    var str = ref.toString();
    equal(str, R + 'some/u/r/l', 'urls should match');
});