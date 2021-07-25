
goog.provide("pebble.shared.ServerControl");

goog.require("pebble.Pebble");
goog.require("pebble.shared.PathAnalyzer");
goog.require("pebble.shared.ItemType");
goog.require("pebble.shared.TypeReferences");

//-----file start

function Session() {

	this.lastPresence = Date.now();

	this.queryResults = new pebble.Pebble();

}

Session.prototype.requiresNotification = function (rec, path) {

	return true;

}

//Iws.send
Session.prototype.setSocket = function (Iws) {

	this.ws = Iws;

}

/**
 * remove management for query
 * @param {string} queryRef: should be same server and client
 */
Session.prototype.removeQuery = function (queryRef) {

	this.queryResults.remove(queryRef);

}

/**
 * @constructor
 */
pebble.shared.ServerControl = function(deployment, wss, ds) {
	this.init(deployment, wss, ds);
}

/**
 */
pebble.shared.ServerControl.prototype.init = function(deployment, wss, ds) {
	this.deployment = deployment;
	this.ds = ds;
	this.wss = wss;	
	this.sessions = {};
	this.sessionCount = 0;

	if (this.wss != null) {
		var that = this;
		this.wss.setOnMessage(function(ws, message){

			var req = new pebble.Pebble(message);
			var params = req.getParams();
			var rg = params.getRef(".");
			if (rg != null) {
				var sp = rg.split(".").pop();

				var sessionId = params.getRef("sessionId");

				switch (sp) {

					case "setup":
						
						that.sessions[sessionId].setSocket(ws);

						break;

					case "removeDependency":

						var queryRef = params.getRef("queryRef");	
						that.sessions[sessionId].removeQuery(queryRef);

						break;
					
					default:

						//that.executeMethod (sp, req);//doQuery, etc. if going thru socket)

						break;

				}
			}
		});
	}

}	
pebble.shared.ServerControl.prototype.addTestData = function() {
	var indexItem = this.deployment.ds.retrieve("theApp.theControlApp.appInstances", "theInstance");
	var theControlApp = indexItem.get("theControlApp");

	var appDefPath = theControlApp.getRef(".");
	var elements = appDefPath.split(".");
	var appDefMeta = elements.pop();
	var appDefCollection = elements.join(".");
	var appDefinition = this.deployment.ds.retrieve(appDefPath + ".types", appDefMeta);

	var appFields = appDefinition.get("fields");

	//only check first level for collection items
	var recs = theControlApp.getRecords(".");
	for (var i = 0; i < recs.length; i++) {
		var rec = recs[i];
		if (appFields.getRef(rec.getTagName() + ".type").split(".").pop() === "collection") {
			this.createTable("theInstance.theControlApp." + rec.getTagName(), rec);
		}	
	}
}

/**
 * @param {string} path
 * @param {pebble.Pebble} collection
 */
pebble.shared.ServerControl.prototype.createTable = function (path, collection) {
	var docs = collection.getRecords(".");
	for (var i = 0; i < docs.length; i++) {
		var doc = docs[i];
		this.ds.create(path, doc);
	}
}
/**
 * @param {string} sessionId
 * @param {pebble.Pebble} doc
 * @param {string} path
 */
pebble.shared.ServerControl.prototype.alertCreated = function(sessionId, doc, path) {

	var o = new pebble.Pebble();
	var params = o.getParams();
	params.setRef(".", "created");
	params.set("doc", doc);
	params.setRef("path", path);

	var message = o.toString();

	for (var key in this.sessions) {

		var session = this.sessions[key];
		//if (sessionId != key) { 
			if (session.requiresNotification(doc, path)) {

				session.ws.sendToClient(message);
				
			}
		//}
	}
}	
/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.alertDeleted = function(obj) {

}	

/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.alertUpdated = function(obj) {

}	
/**
 * @param {string} sp
 * @param {pebble.Pebble} obj
 * @return {number}
 * @override
 */
//Service.prototype.executeMethod = function(sp, obj) {
	//var ret = 1;
	//if (sp in this) {
		//this[sp](obj);
	//} 
	//return ret;
//}
/**
 * @param {string} sp
 * @param {pebble.Pebble} obj
 * @return {number}
 */
pebble.shared.ServerControl.prototype.executeMethod = function(sp, obj) {
	var ret = 1;
	if (sp == "doInit") {
		this.doInit(obj);
	} else if (sp == "retrieveItem") {
		this.retrieveItem(obj);
	} else if (sp == "doQuery") {
		this.doQuery(obj);
	} else if (sp == "getFields") {
		this.getFields(obj);
	} else if (sp == "createItem") {
		this.createItem(obj);
	} else if (sp == "updateItem") {
		this.updateItem(obj);
	} else if (sp == "deleteItem") {
		this.deleteItem(obj);
	} else {
		this.doGenericQuery(sp, obj);
	}
	return ret;
}
/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.doInit = function(obj) {
	
	this.sessionCount += 1;
	//client receives sessionId an 
	var sessionStr =  this.sessionCount.toString();
	obj.setValue("sessionId", sessionStr);
	this.sessions[sessionStr] = new Session();
	
	//set in request
	obj.set("user", obj.get("_user"));
	obj.setRef("sessionId", sessionStr);
}	

/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.retrieveItem = function(obj) {
	var params = obj.getParams();
	var relPath = params.getRef("relPath");
	var collectionPath = params.getRef("collection");
	var path = collectionPath + "." + relPath;
	var asDs = params.getBool("asDs");

	//check permissions
	var doc;
	if (asDs) {
		doc = this.ds.getDs(path);

	} else {

		doc = this.ds.retrieve(collectionPath, relPath);

	} 

	obj.setRef("source", path);
	obj.setFull("arrayItem", doc);

}

/**
 * Queries always query a path
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.doGenericQuery = function(funcName, obj) {
	var params = obj.getParams();

	var app = this.deployment.getDocument("theInstance");
	var appDef = app.getRef("theControlApp");
	var service = this.deployment.getTypeDocument(appDef + ".services." + funcName);
	var query = service.get("query");
	if (query != null) {
		var qq = query.getCopy(".");
		var relPath = qq.getRef("path");
		qq.setRef("path", "theInstance.theControlApp." + relPath);

		var s = qq.toString();

		var patt = /{{\w+(\.\w+)*}}/g;	
		var that = this;
		var out = s.replace(patt, function(token) {

			token = token.replace(/{{|}}/g, "");
			var field = service.getInnerField(token);
			var type = field.getRef("type");
			if (type == pebble.shared.TypeReferences.REFERENCE) {
				return params.getRef(token);
			} else if (type == pebble.shared.TypeReferences.TEXT) {
				return params.getValue(token);
			}

		});

		var peb = new pebble.Pebble(out);

		//var recs = query.getRecords(".");
		//for (var i = 0; i < recs.length; i++) {
		//var rec = recs[i];
		//var tagName = rec.getTagName();
		//if (!qq.get(tagName)) {
		////shouldn't override fixed query
		//qq.set(tagName, rec);	
		//}
		//}
		query.set(".", peb);
		var collectionPath = query.getRef("path"); 
		if (collectionPath != null) {
			var collection = new pebble.shared.PathAnalyzer(collectionPath);

			var collectionHoldingAppPath = collectionPath.substring(0, collectionPath.lastIndexOf("."));
			var arrayField = collectionPath.substring(collectionPath.lastIndexOf(".") + 1);
			var collectionHoldingDoc = new pebble.shared.PathAnalyzer(collectionHoldingAppPath);
			var collectionField = collectionHoldingDoc.getLastItemType().getField(arrayField);

			var type = collectionField.get("type");

			if (type.getRef(".").split(".").pop() === "collection") {

				var s = this.getDocs(query);
				var tmpDoc = new pebble.Pebble("<i>" + s + "</i>");
				obj.set(".", tmpDoc); //base class add the rs so we know we can replace it 


				var sessionId = params.getRef("sessionId");
				if (sessionId !== null) {

					//we dont need to put the result set on
					var managedQuery = new pebble.Pebble();
					//managedQuery.setParams(obj.getParams());
					managedQuery.set("query", query);

					//TODO:need to put these back by adding session to all server in topModule
					//var queryResult = this.sessions[sessionId].queryResults.add2Array(".", managedQuery); //this will copy full
					//obj.setRef("_serverQueryReference", queryResult.getTagName());

				}

			} else {

				obj.set(".", collection.getItem());

			}

		} else {
			throw new Error("ServerControl: doQuery() requires path");
		}

	}
}
/**
 * Queries always query a path
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.doQuery = function(obj) {

	var params = obj.getParams();
	var query = params.get("query");

	if (query != null) {
		

		var queryRef = query.getRef(".");
		if (queryRef !== null) {
			
			var app = this.deployment.getDocument("theInstance");
			var appDef = app.getRef("theControlApp");
			var q = this.deployment.getTypeDocument(appDef + ".queries." + queryRef);
			
			//configged query element is the append conditions
			var qq = q.getCopy(".");
			var relPath = qq.getRef("path");
			qq.setRef("path", "theInstance.theControlApp." + relPath);
			var recs = query.getRecords(".");
			for (var i = 0; i < recs.length; i++) {
				var rec = recs[i];
				var tagName = rec.getTagName();
				if (!qq.get(tagName)) {
					//shouldn't override fixed query
					qq.set(tagName, rec);	
				}
			}
			query.set(".", qq);
		}

		var collectionPath = query.getRef("path"); 
		if (collectionPath != null) {
			var collection = new pebble.shared.PathAnalyzer(collectionPath);

			var collectionHoldingAppPath = collectionPath.substring(0, collectionPath.lastIndexOf("."));
			var arrayField = collectionPath.substring(collectionPath.lastIndexOf(".") + 1);
			var collectionHoldingDoc = new pebble.shared.PathAnalyzer(collectionHoldingAppPath);
			var collectionField = collectionHoldingDoc.getLastItemType().getField(arrayField);

			var type = collectionField.get("type");

			if (type.getRef(".").split(".").pop() === "collection") {

				var s = this.getDocs(query);
				var tmpDoc = new pebble.Pebble("<i>" + s + "</i>");
				obj.set(".", tmpDoc); //base class add the rs so we know we can replace it 


				var sessionId = params.getRef("sessionId");
				if (sessionId !== null) {

					//we dont need to put the result set on
					var managedQuery = new pebble.Pebble();
					//managedQuery.setParams(obj.getParams());
					managedQuery.set("query", query);

					//TODO:need to put these back by adding session to all server in topModule
					//var queryResult = this.sessions[sessionId].queryResults.add2Array(".", managedQuery); //this will copy full
					//obj.setRef("_serverQueryReference", queryResult.getTagName());

				}

			} else {

				obj.set(".", collection.getItem());

			}

		} else {
			throw new Error("ServerControl: doQuery() requires path");
		}
	} else {
		throw new Error("ServerControl: doQuery() requires query");
	}
}
/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.getFields = function(obj) {

	var params = obj.getParams();
	var typeId = params.getRef("typeId");
	var fieldsPath = params.getRef("fieldsPath");
	if (fieldsPath != null) {
		var fields;
	  if (typeId.indexOf("theApp.") == 0) {
	    var control = this.deployment.getTypeDocument(typeId);
  		var fields;
  		if (fieldsPath == "fields") {
  			fields = control.getFields();
  		} else { 
  			fields = control.get(fieldsPath);
  		}
	  } else {
  	  var collection = typeId.substring(0, typeId.lastIndexOf("."));
  	  var name = typeId.substring(typeId.lastIndexOf(".") + 1);
  		var control = this.ds.retrieve(collection, name);
  		if (fieldsPath == "fields") {
  		//TODO: should get inherits fields
  			fields = control.get("fields");
  		} else { 
  			fields = control.get(fieldsPath);
  		}
	  }

		obj.set(".", fields);

	} else {
		throw new Error("ServerControl: getFields() requires fieldsPath");
	}
}
/**
 * @param {pebble.Pebble} queryItem
 * @return {string}
 */
pebble.shared.ServerControl.prototype.getDocs = function(queryItem) {

	var s = "";
	var path = queryItem.getRef("path");
	if (path != null) {
		var dt = this.ds.doQuery(queryItem, null, null);
		for (var i = 0; i < dt.length; i++) {
			var dr = dt[i];
			s += dr; 
		}
	} else {
		throw new Error("ServerControl: getDocs requires path");
	}
	return s;
}
/**
 * @param {pebble.Pebble} obj
 */
//called as collection 
pebble.shared.ServerControl.prototype.createItem = function(obj) {
	var params = obj.getParams();
	var recItem = params.get("item");
	var data;
	var collection = params.getRef("collection");
	var sessionId = params.getRef("sessionId");
	var asDs = params.getBool("asDs");

	if (collection != null) { 
		
		var uniqueName = recItem.getValue("key_");
		recItem.remove("key_");
		if (uniqueName != null) {
			data = new pebble.Pebble("<" + uniqueName + "/>");
		} else {
			data = new pebble.Pebble(); //empty item, serverdata will create an id
		}
		data.set(".", recItem);

		if (asDs && recItem.get("theApp_theControlApp_appInstances.theInstance") != null) {

			this.ds.addDs(collection, data);
			obj.setRef("id", uniqueName);

		} else {

			var doc = this.ds.create(collection, data);

			//var pathAnalyzer = new pebble.shared.PathAnalyzer(collection);
			//var parentForm = pathAnalyzer.getParentItemType();
			//var collectionField = parentForm.getField(collection.substring(collection.lastIndexOf(".") + 1));
			//var typeArrayMaps = collectionField.get("type.typeArrayMaps");
			//var recType = collectionField.getRef("type.arrayFormId");
			//var form = new pebble.shared.ItemType(recType);
			//var doc = pebble.shared.DocModel.getDatasource(collection).create(collection, data, typeArrayMaps, form);

			obj.setRef("id", doc.getTagName());

		}
		//notify
		//this.alertCreated(sessionId, doc, collection + "." + doc.getTagName());

	} else {
		throw new Error("ServerControl: addItem() requires collection specified");
	}
}


/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.updateItem = function(obj) {
	var params = obj.getParams();
	var data = params.get("data");
	var collection = params.getRef("collection");
	var name = params.getRef("name");
	if (collection != null && name != null) {
		var relPath = params.getRef("relPath");
		if (relPath) {
			var doc = this.ds.retrieve(collection, name);
			doc.set(relPath, data);
			this.ds.update(collection, name, doc);
		} else {
			this.ds.update(collection, name, data);
		}
	}
}

/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControl.prototype.deleteItem = function(obj) {
	var params = obj.getParams();
	var collection = params.getRef("collection");
	var name = params.getRef("name");

	var path = collection + "." + name;
	if (collection != null && name != null) {
		this.ds.deleteItem(collection, name);
		 
	} else {
		throw "delete requires collection and name";
	}
}




