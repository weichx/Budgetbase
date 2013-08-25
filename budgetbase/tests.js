module('basics', {
	setup: function(){
		Budgetbase.resetStore();
		EventNode.reset();
	},
	teardown: function(){
	}
});
test('Budgetbase is defined', function(){
	ok(Budgetbase, 'Budgetbase is not defined');
});

test('Budgetbase should have a store', function(){
	ok(Budgetbase.getStore(), 'Store was not found');
});

test('Should add to the store when new path is accessed', function(){
	var store = Budgetbase.getStore();
	Budgetbase('spacecraft');
	ok(store['spacecraft'], 'store did not defined `spacecraft`');
});

test('Should add to store when nested path is accessed', function(){
	var store = Budgetbase.getStore();
	Budgetbase('spacecraft/light_fighters');
	ok(store['spacecraft']['light_fighters'], 'spacecraft.light_fighters was not in store');
});

test('should not alter store when data is already present', function(){
	Budgetbase.setStore({
		'spacecraft': {
			'light_fighters': {
				'alpha': true
			}
		}
	});
	var store = Budgetbase.getStore();
	Budgetbase('spacecraft/light_fighters');
	ok(store.spacecraft.light_fighters.alpha, 'the store was altered in the traversal where it shouldnt have');
});

test('should return a reference', function(){
	var ref = Budgetbase('spacecraft');
	ok(ref, 'reference returned was null');
});

module('EventNode', {
	setup:function(){
		Budgetbase.resetStore();
		EventNode.reset();
	},
	teardown:function(){
		Budgetbase.resetStore();
	},
});

test('The root node should have no parent set', function(){
	var root = EventNode.root;
	ok(root, 'the root node was undefined');
	ok(!root.parent, 'the root had a parent set');
});

test('EventNode.find will build event nodes', function(){
	var node = EventNode.find(['one', 'two', 'three']);
	equal(EventNode.root.children['one'].key, 'one', 'expected root node to have a child named one');
});

test('EventNode#on() should properly attach child keys', function(){
	var node = EventNode.find(['one', 'two', 'three']);
	node.on('value', function(){ return 1; });
	var parent = node.parent;
	ok(parent.childEvents['value'].indexOf('three') !== -1, 'eventKey was not registered on parent');
});

test('EventNode#on() should attach child keys to all parents', function(){
	var node = EventNode.find(['one', 'two', 'three']);
	node.on('child_added', function(){});
	var parent = node.parent;
	var found = 0;
	var key = node.key;
	while(parent){
		if(parent.childEvents['child_added'].indexOf(key) !== -1) found ++;
		key = parent.key;
		parent = parent.parent;		
	}
	equal(found, 3, 'expected to find three parents w/ child keys for child_added, found ' + found);
});

test('EventNode should handle value changes', function(){
	var ref = Budgetbase('one/two/three');
	ref.on('value', function(snapshot){
		equal(snapshot.val(), 11, 'val should have been 11, was ' + snapshot.val());
	});
	ref.set(11);
});

test('EventNode should fire child added events', function(){
	var ref = Budgetbase('one/two');
	ref.on('child_added', function(snapshot){
		var val = snapshot.val();
		ok(val.child1, 'snapshot should have child1');
		ok(val.child2, 'snapshot should have child2');
	});
	ref.set({
		child1: 'ok', 
		child2: 'ok'
	});
});

test('EventNode#remove() should remove nodes from the store', function(){
	var ref = Budgetbase('one/two/three');
	ref.remove();
	var store = Budgetbase.getStore();
	ok(store.one.two, 'parent of removed node should be intact');
	equal(store.one.two.three, undefined, 'removed node should not be in the store');
});

test('Removing a node should call `value` events with a null snapshot value', function(){
	var ref = Budgetbase('one/two/three');
	ref.on('value', function(snapshot){
		equal(null, snapshot.val(), 'snapshot should have had a null value, was instead ' + snapshot.val());
	});
	ref.remove();
});

test('Removing nodes retains event listeners', function(){
	var ref = Budgetbase('one/two/three');
	var calls = 0;
	ref.on('value', function(snapshot){
		var name = snapshot.name();
		var val = snapshot.val();
		equal(name, 'three', 'name should be three, was ' + name);
		if(calls == 0){
			calls++;
			equal(val, null, 'value should be null, was ' + val);
		} else {
			equal(val, 'some new value', 'value should be `some new value`, was ' + val);
		}
	});
	ref.remove();
	ref.parent().set({
		three: 'some new value'
	});
});

test('EventNode#set should call child removed on replaced keys w/ listeners', function(){
	var threeRef = Budgetbase('one/two/three');
	threeRef.set({
		child1: 1,
		child2: 2,
		child3: 3
	});
	threeRef.on('child_removed', function(snapshot){
		equal(snapshot.name(), 'child1', 'should have removed key `child1`, was ' + snapshot.name());
		equal(snapshot.val(), 1, 'val() should return 1, was ' + snapshot.val());
	});
	threeRef.set({
		child2: 4,
		child3: 8,
		child4: 16
	});
});

test('EventNode#set should trigger value events w/ null when removing children via setting to new object', function(){
		var threeRef = Budgetbase('one/two/three');
	threeRef.set({
		child1: 1,
		child2: 2,
		child3: 3
	});
	threeRef.child('child1').on('value', function(snapshot){
		equal(snapshot.name(), 'child1', 'should have removed key `child1`, was ' + snapshot.name());
		equal(snapshot.val(), null, 'val() should return null, was ' + snapshot.val());
	});
	threeRef.set({
		child2: 4,
		child3: 8,
		child4: 16
	});
});

test('EventNode should fire child removed events', function(){
	var ref = Budgetbase('one/two');
	ref.parent().on('child_removed', function(snapshot){
		var name = snapshot.name();
		var val = snapshot.val();
		equal(name, 'two', 'name should equal two');
		ok(val, 'val should be the removed object');
	});
	ref.set(null);
});

module('References', {
	setup:function(){
		Budgetbase.resetStore();
		EventNode.reset();
	},
	teardown:function(){
		Budgetbase.resetStore();
	}
});

test('A reference should have an accurate depth property', function(){
	var ref = Budgetbase('spacecraft/light_fighters/interceptor/color');
	equal(ref._depth, 4, 'expected depth to be 4, was actually ' + ref._depth);
});

test('parent() should return a references parent', function(){
	var ref = Budgetbase('spacecraft/light_fighters/interceptor/color');
	var parent = ref.parent();
	equal(parent._name, 'interceptor', 'parents name should be interceptor, was ' + parent._name);
	equal(parent._depth, 3, 'parents depth should be 3, was ' + parent._depth);
});

test('child() should return a reference to a child', function(){
	var ref = Budgetbase('spacecraft/light_fighters/interceptor');
	var colorRef = ref.child('color');
	equal(colorRef._depth, 4, 'child depth should be 4, was ' + colorRef._depth);
	equal(colorRef.url(), 'spacecraft/light_fighters/interceptor/color', 'url should be `spacecraft/light_fighters/interceptor/color`, was ' + colorRef.url());
});

test('setting a value alters the store', function(){
	var ref = Budgetbase('spacecraft/light_fighters/interceptor/color');
	ref.set('blue');
	var store = Budgetbase.getStore();
	equal(store['spacecraft']['light_fighters']['interceptor']['color'], 'blue', 'value should have been set to blue');
});

test('we can access the name of a snapshot', function(){
	var ref = Budgetbase('spacecraft/alpha1/engineType');
	ref.on('value', function(snapshot){
		equal(snapshot.name(), 'engineType', 'name of the snapshot should be engineType');
	});
	ref.set('Twin Ion');
});