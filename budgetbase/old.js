Budgetbase('/students').on('child_added', function(ref){
	var studentId = ref.name();
	var studentInfo = ref.val('firstName', 'lastName', 'age', 'height');
	var studentInfo.mathLevel = ref.child('lessons/math').val();
	var leaves = ref.leaves();
});

Budgetbase('/students').on('child_changed', function(ref){
	//eventing is disabled on these references
});

Budgetbase.dynamicReference('current-student');

var store = {
	'students' : {
			'student1': {
				'grade': 4,
				'favColor': 'Blue',
				'lessons': {
					'math' : 1,
					'english': 2
				}
			}
	}
};

ref = {
	a: 1,
	b: 2,
	c: {
		d: 4
	}
};

ref = {
	
};
//lessons/english/words/can //-> words does not exist, 
//all existing references pointing at 'english' need to know they have had a child added

var Budgetbase = function(url){
	//TODO this split function could be optimized to not create an array every time
	var split = url.split('/');
	var parent = null;
	var ref = store;
	for(var i = 0, il = split.length; i < il; i++){
		parent = ref;
		ref = ref[name];
		if(ref === undefined){
			//toss in new json, no need to update existing references because val() will 
			//take it's data from the json store, not a cached version in the reference itself.
			ref[name] = {};			
		}
	}
	return new Reference(name, parent, ref);
};

var Reference = function(){
	this.__children = storeRef;
	this.__value = {};
	
	this.val = function(){
		if(arguments.length === 0){
			return this.__value;
		} else if(arguments.length === 1){
			return this.__children[arguments[0]); //touch this up
		} else {	
			var obj = {};
			for(var i = 0; i < arguments.length; i++){
				var str = arguments[i];
				obj[str] = this.__children[str];
			}
			return obj;
		}
	};
	
	this.child = function(childName){
		return Budgetbase(this.url() + '/' + childName);
	};
};

EventNode.root = new EventNode();




children = {actual children};
childEvents['value'] = ['child key names of children responding to value events'];

var node = EventNode.find(this.url);
if(node){
	node.invoke('value', newValue); 
}

var on = function(splitUrl, evtType, callback, context){
	var node = EventNode.find(splitUrl);
	node.register(evtType, callback, context);
}