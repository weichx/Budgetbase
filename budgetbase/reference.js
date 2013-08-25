/** References	*/
var Reference = function(parentInStore, nameString, url){
	this._pParent = parentInStore;//name this something to denote it is a pointer not a true parent reference object
	this._ref = parentInStore[nameString];
	this._name = nameString;	
	this._splitUrl = url;
	this._depth = url.length;
};

Reference.prototype = {
	parent:function(){
		if(!this._parentReference){
			var parentUrl = this._splitUrl.slice(0, this._depth - 1); 
			this._parentReference = Budgetbase(parentUrl.join('/'));
		}
		return this._parentReference;
	},

	child:function(childName){
		return Budgetbase(this.url() + '/' + childName);
	},
	
	set:function(value){
		//todo make this async via set timeout
		//todo consider caching the event node
		//todo consider removing need to pass references into event node functions
		var oldValue = JSON.parse(JSON.stringify(this._pParent[this._name]));
		this._pParent[this._name] = value;
		EventNode.find(this._splitUrl).set(this, oldValue, value);
	},
	
	//does not nuke the entire key, just resets some values
	update:function(values){
		
	},
	
	remove:function(){
		var oldValue = JSON.parse(JSON.stringify(this._pParent[this._name]));
		this._pParent[this._name] = null;
		EventNode.find(this._splitUrl).remove(this, oldValue);
	},
	
	on:function(evtType, callback, context){
		if(!callback) throw new Error('Callbacks are required parameters in `on` functions.');
		callback.context = context;
		EventNode.find(this._splitUrl).on(evtType, callback);
	},
	
	once:function(){
	},
	
	off:function(){
	},
	
	name: function(){
		return this._name;
	},
	
	url: function(){
		if(!this._url) this._url = this._splitUrl.join('/');
		return this._url;		
	}	
};