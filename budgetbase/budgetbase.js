var Budgetbase;
//Todo this could somewhat easily be moved onto a web worker
(function(){
	
	var store = {};
	
	//we can provide a more optimized way to building this for cases where
	//we have more data than just a url
	Budgetbase = function(path){
		var url = path.split('/');
		var parent = store;
		var name = url[0];
		if(parent[name] === undefined){
			parent[name] = {};
		}
		for(var i = 1, il = url.length; i < il; i++){
			parent = parent[name];
			name = url[i];
			if(parent[name] === undefined){
				//toss in new json, no need to update existing references because val() will 
				//take it's data from the json store, not a cached version in the reference itself.
				parent[name] = {};
			}
		}
		return new Reference(parent, name, url);
	};
	
	Budgetbase.resetStore = function(){
		store = {};
	};
	
	Budgetbase.setStore = function(obj){
		//todo do some type assertions here
		store = obj;
	};
	
	Budgetbase.getStore = function(){
		return store;
	};
})();