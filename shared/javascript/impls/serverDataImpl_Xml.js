
goog.provide("pebble.shared.ServerDataImpl_Xml");

goog.require("pebble.shared.interfaces.IServerData");
goog.require("pebble.Pebble");
goog.require("pebble.shared.TypeReferences");

//-----file start

/**
 * @constructor
 * @implements {pebble.shared.interfaces.IServerData}
 * @param {string | pebble.Pebble} o
 */
pebble.shared.ServerDataImpl_Xml = function(o) {
	/**
	 * @type {pebble.Pebble}
	 */
	if (o instanceof pebble.Pebble){
		this.ds = o;
	} else if (typeof(o) == "string") {
		//path
		this.ds.loadFile(o);
	} else {
		this.ds = new pebble.Pebble();
	}
}
/**
 * @param {string} collection
 * @param {pebble.Pebble} peb
 * @return {pebble.Pebble}
 * @override
 */
pebble.shared.ServerDataImpl_Xml.prototype.create = function(collection, peb) {
	//loop thru appIndex.datamaps to set other properties

	//must set these before returning

	var tableName = this.getTableName(collection);
	if (peb.getTagName() != "i") {
		this.ds.setFull(tableName + "." + peb.getTagName(), peb);
	} else {
		peb = this.ds.add2Array(tableName, peb, null);
	}
	this.persist();
	return this.retrieve(collection, peb.getTagName());

};
/**
 * @param {string} path
 */
pebble.shared.ServerDataImpl_Xml.prototype.setOffsetPath = function(path) {

	this.offsetPath = path;

};
/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.ServerDataImpl_Xml.prototype.getTableName = function(path) {

	path = this.adjustPath(path);
	return path.replace(/\./g, "_");
};
/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.ServerDataImpl_Xml.prototype.adjustPath = function(path) {

	if (this.offsetPath) {
		if (path.indexOf(this.offsetPath) == 0) {

			path = path.replace(this.offsetPath, "theInstance.theControlApp");

		} else {

			throw Error("ServerDataImpl_Xml:adjustPath() no such allowed path:" + path);

		}
	} 
	return path;
};

/**
 * @param {string} collection
 * @param {string} uniqueName
 * @return {pebble.Pebble}
 * @override
 */
pebble.shared.ServerDataImpl_Xml.prototype.retrieve = function(collection, uniqueName) {
	var tableName = this.getTableName(collection);
	var path = tableName + "." + uniqueName;
	var data = this.ds.getCopy(path);
	if (data != null) {
		return data;
	} else {
		pebble.shared.logger.log("ERROR", "Couldn't get single entity for query: " + collection + "-" + uniqueName);
		return null;
	}
};
/**
 * @param {string} collection
 * @param {string} uniqueName
 * @param {pebble.Pebble} doc
 * @override
 */
pebble.shared.ServerDataImpl_Xml.prototype.update = function(collection, uniqueName, doc) {
	var tableName = this.getTableName(collection);
	var path = tableName + "." + uniqueName;
	var data = this.ds.getCopy(path);

	data.set(".", doc.getCopy("."));

	//write
	this.ds.setFull(path, data);
	this.persist();
};
/**
 * @param {string} collection
 * @param {string} name
 * @override
 */
pebble.shared.ServerDataImpl_Xml.prototype.deleteItem = function(collection, name) {
	var tableName = this.getTableName(collection);
	var path = tableName + "." + name;
	this.ds.remove(path);
		
	var pathPrefix = path.replace(".", "_");
	var tables = this.getDataSource().getRecords(".");
	for (var i = tables.length - 1; i >= 0; i--) {
		var table = tables[i];
		var tableName = table.getTagName();
		if (tableName.indexOf(pathPrefix) == 0) {
			this.ds.remove(tableName);
		}
	}

	this.persist();
};
/**
 * @param {Array.<string>} list
 * @override
 */
pebble.shared.ServerDataImpl_Xml.prototype.deleteCollections = function(list) {
	for (var i = 0; i < list.length; i++) {
		var collection = list[i];
		var tableName = this.getTableName(collection);
		this.ds.remove(tableName);
	}
	this.persist();
};

/**
 * returns doc with decendents in ds format but as pebble
 * @param{string} path
 * @return{pebble.Pebble} ds (as pebble)
 */
pebble.shared.ServerDataImpl_Xml.prototype.getDs = function(path) {
	//
	path = this.adjustPath(path);

	var ret = new pebble.Pebble();
	
	if (path == "theInstance.theControlApp") {
    ret.set(".", this.getDataSource());
  } else {
    //get doc and decendents in one ds  
    var docCollection = path.substring(0, path.lastIndexOf("."));
    var docName = path.substring(path.lastIndexOf(".") + 1);
    
    var datasource = this.getDataSource();

    var tables = datasource.getRecords(".");
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      var tableName = table.getTagName();
      var tableDotName = tableName.replace(/_/g, ".");
      if (tableDotName != docCollection) {
        if (tableDotName.indexOf(path) != -1) {
					//add table to our output
					//collapse
					var collapsePath = tableDotName.replace(path, "theInstance.theControlApp");
					var newTableName = collapsePath.replace(/\./g, "_");
					ret.set(newTableName, table);
        }
      } else {
        //instance of app > theApp_theControlApp_appInstances.theInstance
        var app = datasource.get(tableName + "." + docName);
				if (app != null) {
					ret.set("theApp_theControlApp_appInstances.theInstance", app);
				}
      }
    }

  }
	ret.setAttribute(".", "noresolve", "true"); 
	return ret;
	
};
/**
 * addDs preserves tagName in app
 * @param{string} collection
 * @param{pebble.Pebble} app (as pebble)
 */
pebble.shared.ServerDataImpl_Xml.prototype.addDs = function(collection, app) {
	if (collection != null) {
		if (collection.indexOf("theApp") == 0 && collection.indexOf("appInstances") == -1) {
			collection = collection.replace("theApp", "theInstance");
		}

		collection = this.adjustPath(collection);

		var docName = app.getTagName();

		var path = collection + "." + docName;

		var instance = app.get("theApp_theControlApp_appInstances.theInstance");
		if (instance != null) {

			var docCollectionTableName = collection.replace(/\./g, "_");
			this.ds.set(docCollectionTableName + "." + docName, instance);
			app.remove("theApp_theControlApp_appInstances");

		}

		var tables = app.getRecords(".");
		for (var i = 0; i < tables.length; i++) {
			var table = tables[i];
			var tableName = table.getTagName();
			var tableDotName = tableName.replace(/_/g, ".");

			var adjustedTableDotName = tableDotName.replace("theInstance.theControlApp", path);
			var newTableName = adjustedTableDotName.replace(/\./g, "_");

			this.ds.set(newTableName, table);
		}
		this.persist();

	} else {
		this.replaceDs(app);
	} 
	
};
/**
 * @param{string} path
 * @param{pebble.Pebble} app (as pebble)
 */
pebble.shared.ServerDataImpl_Xml.prototype.setDs = function(path, app) {
	if (path != null) {
		path = this.adjustPath(path);

		var instance = app.get("theApp_theControlApp_appInstances.theInstance");
		if (instance != null) {

			var docCollection = path.substring(0, path.lastIndexOf("."));
			var docName = path.substring(path.lastIndexOf(".") + 1);
			var docCollectionTableName = docCollection.replace(/\./g, "_");
			this.ds.set(docCollectionTableName + "." + docName, instance);
			app.remove("theApp_theControlApp_appInstances");

		}

		var tables = app.getRecords(".");
		for (var i = 0; i < tables.length; i++) {
			var table = tables[i];
			var tableName = table.getTagName();
			var tableDotName = tableName.replace(/_/g, ".");

			var adjustedTableDotName = tableDotName.replace("theInstance.theControlApp", path);
			var newTableName = adjustedTableDotName.replace(/\./g, "_");

			this.ds.set(newTableName. table);
		}
		this.persist();

	} else {
		this.replaceDs(app);
	} 
	
};


/**
 */
pebble.shared.ServerDataImpl_Xml.prototype.replaceDs = function(s) {
	this.ds = new pebble.Pebble(s);
	this.persist();
};

/**
 * @param {pebble.Pebble} queryPeb
 * @return {Array.<string>}
 * @override
 */
pebble.shared.ServerDataImpl_Xml.prototype.doQuery = function(queryPeb) {
	var path = queryPeb.get("path");

	var collection = path.getRef(".");
	var tableName = this.getTableName(collection);

	var list = this.ds.getCopy(".").getRecords(tableName);

	var results = [];
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var appIndexItem = new pebble.Pebble();
		//if (typeMaps != null) {
			//var typeArrayMaps = typeMaps.getRecords(".");
			//for (var j = 0; j < typeArrayMaps; j++) {
				//var map = typeArrayMaps[j];
				//var colName = map.getRef("path");

				////check if reference, denoted by *reference but allows use to externally link references even if they are configged
				////do not set reference members (data won't be consistent), only set first reference in instance
				//var isReferencePath = false;
				//var elements = colName.split(".");
				//var getPath = "";
				//var instanceRefs = pebble.shared.PebbleUtils.getInstanceRefs(item, colName);
				//for (var x = 0; x < elements.length; x++) {
					//var ele = elements[x];
					//if (ele.indexOf("*") == 0) {
						//ele = ele.replace("*", "");
						//isReferencePath = true;
					//}
					//getPath += ele;
					//var type = t.getInnerType(getPath, instanceRefs); //can pass null because we just want first reference
					//if (isReferencePath && type.getRef(".") == pebble.shared.TypeReferences.REFERENCE) { //&& not configged!!!
						////first ref (configged references are ok)
						//isReferencePath = true;
						//break;
					//} else {
						//isReferencePath = false;
						////error declared *ref but its not a reference
					//}
					//getPath += ".";
				//}

				//var val;
				//if (isReferencePath) {
					//getPath = getPath.substring(0, getPath.length - 1);
					//val = new pebble.Pebble(null);
					//var remPath = colName.replace(getPath, "");
					//val.setRef("ps.remPath", remPath); //when retrieving it uses this to get the ref, then get whatever it needs, need this to take difference with map.path
					//val.setRef("ps.refInstance", item.getRef(getPath));
					//appIndexItem.set(colName, val);
				//} else {
					//val = item.get(colName);
					//if (val != null) {
						//appIndexItem.set(colName, val);
					//}
				//}
			//}
			//appIndexItem.setTagName(item.getTagName());
			//results.push(appIndexItem.toString());
		//} else {
			results.push(item.toString());
		//}
	}

	return results;       

};


/**
 * @return {pebble.Pebble}
 */
pebble.shared.ServerDataImpl_Xml.prototype.getDataSource = function() {
	return this.ds;
};
/**
 * @return {string}
 * @override
 */	
pebble.shared.ServerDataImpl_Xml.prototype.toString = function() {
	return this.ds.toString();

};

pebble.shared.ServerDataImpl_Xml.prototype.removeSpaces = function() {
	return this.ds.removeSpaces();

};


pebble.shared.ServerDataImpl_Xml.prototype.persist = function() {
	if (this.pm) {
		this.pm.setItem(this.ds.toString());
	}
};
pebble.shared.ServerDataImpl_Xml.prototype.setPersistanceManager = function(pm) {
	this.ds = new pebble.Pebble(pm.getItem());
	this.pm = pm;
};

