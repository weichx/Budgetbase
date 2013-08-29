module('Snapshot', {
    setup:function () {
        Budgetbase.resetStore();
    }
});

test('Snapshot names should reflect the key name of the data they show', function () {
    var ref = new Budgetbase(R +'one/two');
    ref.on('value', function (snapshot) {
        equal(snapshot.name(), 'two');
    });
    ref.set('ok');
    expect(1);
});
