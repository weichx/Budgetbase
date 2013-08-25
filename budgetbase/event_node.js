	//todo close over this
	var keyDiff = function(newObj, oldObj){
		var added = [];
		var removed = [];
		var updated = [];
		for(var key in newObj){
			if(!oldObj[key]){
			//	console.log('added', key);
				added.push(key);
			} else {
				updated.push(key);
			}
		}
		for(key in oldObj){
			if(!newObj[key]){
				removed.push(key);
			}
		}
		return {
			added: added,
			removed: removed,
			updated: updated
		};
	};
	
	var EventNode = function(key, parent){
		this.childEvents = {};
		this.children = {};
		this.events = {};
		this.key = key;
		this.parent = parent;
	};

	EventNode.prototype = {
		
	   child:function(key){
			return this.children[key];
	   },
	   
		addChild:function(key, evtNode){
			this.children[key] = evtNode;
		},
		
		//walk upwards until we hit a parent who already knows about the child/eventType combo
		//when off is called, we'll need to do some stitching possibly to keep the integrity
		//of the links solid.
		on:function(evtType, callback){
			var pParent = this.parent;
			var key = this.key;
			while(pParent){
				var childEvents = pParent.childEvents;
				if(!childEvents[evtType]){
					childEvents[evtType] = [];
				}
				if(childEvents[evtType].indexOf(key) == -1){
					pParent.childEvents[evtType].push(key);
					key = pParent.key;
					pParent = pParent.parent;
				} else {
					break;
				}
			}
			if(!this.events[evtType]) this.events[evtType] = [];
			this.events[evtType].push(callback);
		},
		
		once:function(){},
		
		off:function(){
			//traverse parent and remove self from parent event list
			//if this has no events, remove from parent
		},

		//todo make the event stack a depth first operation
		//todo handle null value cases
		//todo consider handling child removed cases for nodes that are removed
		set:function(reference, oldValue, newValue){
			var children = this.children;
			var parent = this.parent;
			this.fireValueChanged(reference);
			if(newValue === null || newValue === undefined){
				parent.fireChildRemoved(new Snapshot(null, reference._splitUrl, oldValue));
			} else {
				parent.fireChildChanged(this.key, reference.parent());
			}
			
			parent.fireChildChanged(this.key);
			
			//do I have children that depend on me?
			if(this.children.length === 0){
				return;
			}
			//todo handle child changed events on parent and parent.parent
			//todo handle array case		
			var newValueIsObject = typeof newValue === 'object' && newValue !== null;
			var oldValueIsObject = typeof oldValue === 'object' && oldValue !== null;
			if(newValueIsObject && oldValueIsObject){
				var list = keyDiff(newValue, oldValue);
				var added = list.added;
				var removed = list.removed;
				var updated = list.updated;
				var key;
				for(i = 0, il = added.length; i < il; i++){
					key = added[i];
					this.fireChildAdded(reference);
					children[key] && children[key].fireValueChanged(reference.child(key));
				}
				
				for(i = 0, il = removed.length; i < il; i++){
					var key = removed[i];
					var concatUrl = reference._splitUrl.concat([key]);
					var removedSnapshot = new Snapshot(null, concatUrl, oldValue[key]);
					this.fireChildRemoved(removedSnapshot);
					children[key] && children[key].fireValueChanged(null, concatUrl, null);
				}				
				
			} else if(newValueIsObject){
				
			} else if(oldValueIsObject){
			
			}
			//do network stuff here
		},
		
		update:function(){},
		
		remove:function(reference, oldValue){
			this.fireValueChanged(reference);
			this.parent.fireChildRemoved(new Snapshot(null, reference._splitUrl, oldValue));
		},
		
		//child added events will only ever be handled by a child's direct parent
		fireChildAdded:function(reference){
			var childAddedEvents = this.events['child_added'];
			if(!childAddedEvents || childAddedEvents.length == 0) return;
			var snapshot = new Snapshot(reference);
			for(var i = 0, il = childAddedEvents.length; i < il; i++){
				var fn = childAddedEvents[i];
				fn.call( (fn.context || window), snapshot);
			}
		},
		
		//child removed events are only ever handled by a child's direct parent
		fireChildRemoved:function(snapshot){
			var childRemovedEvents = this.events['child_removed'];
			if(!childRemovedEvents || childRemovedEvents.length == 0) return;
			for(var i = 0, il = childRemovedEvents.length; i < il; i++){
				var fn = childRemovedEvents[i];
				fn.call( (fn.context || window), snapshot);
			}
		},
		
		//child changed events are handled by the direct parent and all ancestors
		fireChildChanged:function(){
			//handle our own child changes
			
			//notify our parent that a child has changed
		},
		
		//only the node itself handled value changes
		fireValueChanged:function(reference){
			var valueEvents = this.events['value'];
			if(valueEvents){
				var snapshot = new Snapshot(reference);
				for(var i = 0, il = valueEvents.length; i < il; i++){
					var fn = valueEvents[i];
					fn.call( (fn.context || window), snapshot);
				}
			}
		}	
		
	};

	
	EventNode.root = new EventNode();
	
	EventNode.reset = function(){
		EventNode.root = new EventNode();
	};
	
	EventNode.find = function(splitUrl){
		var pNode = EventNode.root;
		for(var i = 0, il = splitUrl.length; i < il; i++){
			var key = splitUrl[i];
			if(!pNode.child(key)){
				pNode.addChild(key, new EventNode(key, pNode));
			}
			pNode = pNode.child(key);
		}
		return pNode;
	}