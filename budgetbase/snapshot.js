
//todo for now just return the reference, later strip off the event functions
//todo enable some flag to bypass unique snapshot objects (this will skyrocket performance
//but allow the developer to mistakenly mess with the val object)
//this could take a url and a pointer
//since this constructor is not client facing, we can leave out some type checking
var Snapshot = function(reference, splitUrl, pData){
	if(reference){
		this._name = reference._name;
		this._data = JSON.stringify(reference._pParent[this._name]);
		this._reference = reference;
	} else {
		this._name = splitUrl[splitUrl.length - 1];
		this._data = JSON.stringify(pData);
		this._reference = Budgetbase(splitUrl.join('/'));
	}
};

Snapshot.prototype = {
	val:function(){
		return JSON.parse(this._data);
	},
	
	name:function(){
		return this._name;
	},
	
	child:function(childName){
		var val = this._data;
		if(val && val[childName]){
			return new Snapshot(null, this._name, this._data[childName]);
		}
		return null;
	},
	
	hasChild:function(childName){
		var val = this._data;
		return val && val[childName];
	},
	
	hasChildren:function(){
		
	},
	
	numChildren:function(){
		
	},
	
	reference:function(){
		return this._reference;
	}
};
