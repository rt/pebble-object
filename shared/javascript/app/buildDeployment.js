
goog.provide("pebble.shared.BuildDeployment");


//-----file start

/** BuildDeployment takes a workspace, developed in pebbleDev, and creates a
 * deployment runtime.  
 *
 * - Paths in the runtime start with "theApp.theControlApp" but this probably
 *   could be removed with adjustRefs() The program might need to be minorly
 *   tweaked as well if there are hard coded "theApp.theControlApp" but
 *   fundamentally appInstances, libs, etc. can be the collection names.
 *
 * The reason this can be done now is that deployment is directly injected into
 * docModel, which is called directly by itemType, pathAnalyzer...
 *
 * - Almost all references could be ajusted but there may be cases where the
 *   user is specifying the actual path (to query, etc.) In these cases the
 *   past should not be adjusted.  For these cases, abbrev/relPaths may be
 *   useful.
 *
 * @constructor
 */
pebble.shared.BuildDeployment = function() {

}
/**
 * @param {pebble.shared.interfaces.IServerData} ds
 * @param {pebble.shared.interfaces.IServerData} deploymentDs
 * @param {pebble.Pebble} deployment : the deployment to extract
 * @param {Function} cb 
 * @return {string}
 */
pebble.shared.BuildDeployment.prototype.buildDeployment = function(ds, deploymentDs, deployment, cb) {
ds.setOffsetPath("theInstance.theControlApp.clientWorkspace");
	var app = new pebble.Pebble("<theInstance />");
	app.set(".", deployment.get("."));

	//get unique list
	var depList = {};
	var accessPoints =  app.getRecords("accessPoints");
	for (var i = 0; i < accessPoints.length; i++) {
		var accessPoint = accessPoints[i];
		var dependencies = accessPoint.getRecords("dependencies");
		for (var j = 0; j < dependencies.length; j++) {
			var dependency = dependencies[j];
			depList[dependency.getRef(".")] = dependency;
		}
	}
	for (var key in depList) {
		this.putDependency(deploymentDs, ds, depList[key]);
	}

	//put all dependencies on master
	var appDefRef = app.getRef("theControlApp");
	if (appDefRef != null) {
		var appDef = this.getSharedLib(ds, appDefRef);
		for (var key in depList) {
			var dependency = depList[key];
			this.putDependency(deploymentDs, ds, dependency);
		}

		this.adjustFields(appDef);


		this.adjustRef(app, "theControlApp");
		//all access point dependencies
		for (var i = 0; i < accessPoints.length; i++) {
			var accessPoint = accessPoints[i];
			var dependencies = accessPoint.getRecords("dependencies");
			for (var j = 0; j < dependencies.length; j++) {
				var dependency = dependencies[j];
				this.adjustRef(dependency, ".");
			}
		}

		this.processCssTemplates(app.get("cssTemplates"), function(processedCssTemplates) {
			//remove less?
			if (processedCssTemplates != null) {
				app.set("cssTemplates", processedCssTemplates);
			}
			
			deploymentDs.create("theApp.theControlApp.appInstances", app);

			//put in theApp.theControlApp.libs
			pebble.shared.BuildDeployment.installApp(deploymentDs, appDef, "theApp.theControlApp.libs", true);

			var s = replaceStrings(deploymentDs.toString(), deployment);
			
			deploymentDs.ds = new pebble.Pebble(s);

			cb(s);
			
		});

	} else {
		throw new Error("BuildDeployment: buildDeployment() no theControlApp reference");
	}
}

/**
 * @param {pebble.shared.interfaces.IServerData} ds
 * @param {pebble.Pebble} dependency
 */	
pebble.shared.BuildDeployment.prototype.putDependency = function(deploymentDs, ds, dependency) {
	var ref = dependency.getRef(".");
	if (ref != null) {
		//	if (!libs.contains(ref)) {
		var sharedLib = this.getSharedLib(ds, ref);
		
		this.processCssTemplates(sharedLib.get("cssTemplates"), function(processedCssTemplates) {
			//remove less?
			if (processedCssTemplates != null) {
				sharedLib.set("cssTemplates", processedCssTemplates);
			}
			
			//put in theApp.theControlApp.libs
			pebble.shared.BuildDeployment.installApp(deploymentDs, sharedLib, "theApp.theControlApp.libs", true);

			var dependencies = sharedLib.getRecords("dependencies");
			for (var i = 0; i < dependencies.length; i++) {
				var dep = dependencies[i];
				this.putDependency(deploymentDs, ds, dep);
			}
			
		});

		//	}
	} else {
		throw new Error("BuildDeployment: putDependency() dependency reference not set");
	}
}	
/**
 * @param {pebble.shared.interfaces.IServerData} ds
 * @param {string} sharedLibRef
 * @return {pebble.Pebble}
 */
pebble.shared.BuildDeployment.prototype.getSharedLib = function(ds, sharedLibRef) {
	pebble.shared.logger.log("INFO", sharedLibRef + " ----- ");
	var collectionPath = sharedLibRef.substring(0, sharedLibRef.lastIndexOf("."));
	var appDefName = sharedLibRef.substring(sharedLibRef.lastIndexOf(".") + 1);
	var doc = ds.retrieve(collectionPath, appDefName);

	var collections = ["types", "controls", "services"];
	for (var i = 0; i < collections.length; i++) {
		var collection = collections[i];
		pebble.shared.logger.log("INFO", collection +  " ----- " );
		doc = this.getCollection(ds, sharedLibRef, collection, doc);
	}
	return doc;
}
/**
 * @param {pebble.shared.interfaces.IServerData} ds
 * @param {string} path
 * @param {string} collectionName
 * @param {pebble.Pebble} item
 * @return {pebble.Pebble}
 */
pebble.shared.BuildDeployment.prototype.getCollection = function(ds, path, collectionName, item) {

	var query = new pebble.Pebble();
	var collectionPath = path + "." + collectionName;
	query.setRef("path", collectionPath);
	var appIndexes = ds.doQuery(query);
	if (appIndexes.length > 0) {
		item.setTrue(collectionName + "._" + pebble.shared.BuildDeployment.COMPRESSED_COLLECTION_ATTR);

		for (var i = 0; i < appIndexes.length; i++) {
			var child = appIndexes[i];
			var childPeb = new pebble.Pebble(child);
			pebble.shared.logger.log("INFO", childPeb.getTagName());
			var doc = ds.retrieve(collectionPath, childPeb.getTagName());
			this.convertDoc(ds, doc, collectionPath);

			item.set(collectionName + "." + childPeb.getTagName(), doc);
		}
	}

	return item;
}

/**
 * @param {pebble.shared.interfaces.IServerData} ds
 * @param {pebble.Pebble} doc
 * @param {string} collectionPath
 */
pebble.shared.BuildDeployment.prototype.convertDoc = function(ds, doc, collectionPath) {
	var collectionName = collectionPath.substring(collectionPath.lastIndexOf(".") + 1);
			if (collectionName == "services") {
				//functions
				doc = this.getCollection(ds, collectionPath + "." + doc.getTagName(), "functions", doc);

				this.adjustRef(doc, "inherits");
				
				this.adjustFields(doc);

			} else if (collectionName == "controls") {
				//functions
				doc = this.getCollection(ds, collectionPath + "." + doc.getTagName(), "functions", doc);

				this.adjustRef(doc, "inherits");

				this.adjustFields(doc);

			} else if (collectionName == "functions") {

				this.adjustFields(doc);

				this.adjustRef(doc, "returnType");

			} else if (collectionName == "types") {

				this.adjustRef(doc, "inherits");

				this.adjustFields(doc);

			}
		return doc;
}
/**
 * @param {pebble.Pebble} fieldsHolder
 */
pebble.shared.BuildDeployment.prototype.adjustFields = function(fieldsHolder) {
	var appDefFields = fieldsHolder.getRecords("fields");
	for (var i = 0; i < appDefFields.length; i++) {
		var field = appDefFields[i];
		var arrayFormId = field.getRef("type.arrayFormId");
		if (arrayFormId != null) {
			this.adjustRef(field, "type.arrayFormId");
		}
		this.adjustRef(field, "type");
	}
}
/**
 * @param {pebble.Pebble} peb
 * @param {string} path
 */
pebble.shared.BuildDeployment.prototype.adjustRef = function(peb, path) {
	var ref = peb.getRef(path);
	if (ref != null) {
		ref = ref.replace("theInstance.theControlApp.clientWorkspace", "theApp.theControlApp");
		peb.setRef(path, ref);
	}
}


/**
 * @param {pebble.shared.interfaces.IServerData} master
 * @param {string} accessPoint
 */
pebble.shared.BuildDeployment.prototype.buildDeploymentFromMaster = function (master, accessPoint) {
	var deployment = new pebble.Pebble();

	//do appInstances.theInstance first to set up depList
	var indexItem = master.retrieve("theApp.theControlApp.appInstances", "theInstance");
	var accessPointsPeb = indexItem.get("accessPoints");
	if (accessPointsPeb != null) {
		var accessPoints = accessPointsPeb.getRecords(".");
		for (var i = accessPoints.length - 1; i >= 0; i--) {
			var ap = accessPoints[i];
			if (ap.getTagName() != accessPoint) {
				accessPointsPeb.remove(ap.getTagName());
			}
		}
	}
	//appInstances.theInstance
	deployment.set("theApp_theControlApp_appInstances.theInstance", indexItem);
			
	var accessPointPeb = accessPointsPeb.get(accessPoint);
	var depList = {};
	var dependencies = accessPointPeb.getRecords("dependencies");
	for (var i = 0; i < dependencies.length; i++) {
		var dep = dependencies[i];
		depList[dep.getRef(".")] = dep;
	}

	//do the rest
	var masterPeb = master.getDataSource();

	//put libs
	var libsTableName = "theApp_theControlApp_libs";
	var libsPeb = masterPeb.get(libsTableName);
	
	var appDefRef = indexItem.getRef("theControlApp")
	var appDefMeta = appDefRef.substring(appDefRef.lastIndexOf(".") + 1);
	deployment.set(libsTableName + "." + appDefMeta, libsPeb.get(appDefMeta));

	for (var key in depList) {
		var libMeta = key.substring(key.lastIndexOf(".") + 1);
		deployment.set(libsTableName + "." + libMeta, libsPeb.get(libMeta));
	}

	var tables = masterPeb.getRecords(".");
	for (var i = 0; i < tables.length; i++) {
		var table = tables[i];
		var colPath = table.getTagName().replace(/_/g, ".");

		if (colPath.indexOf(indexItem.getRef("theControlApp")) == 0) {

			//put appDef on
			deployment.set(table.getTagName(), table);

		} else {
			for (var key in depList) {
				if (colPath.indexOf(key) == 0 ) {
					//keep
					deployment.set(table.getTagName(), table);
					break;	
				}
			}
		}
	}
	return deployment;
}


/**
 * Installs a top app index item.
 * If app has a uniqueName (app.getMetaId()) it will use it
 * @param {pebble.shared.interfaces.IServerData} ds
 * @param {pebble.Pebble} app
 * @param {string} colPath ie. "theInstance.theControlApp.libs"
 * @param {boolean} store
 */
pebble.shared.BuildDeployment.installApp = function(ds, app, colPath, store) {

	var recs = app.getRecords(".");
	for (var i = 0; i < recs.length; i++) {
		var rec = recs[i];
		//decompress
		var collection;
		if (colPath == null) {
			collection = app.getTagName();
		} else {
			collection = colPath + "." + app.getTagName();
		}
		var doStore = app.getBool("_" + pebble.shared.BuildDeployment.COMPRESSED_COLLECTION_ATTR);
		pebble.shared.BuildDeployment.installApp(ds, rec, collection, doStore);
		if (doStore) {
			app.remove(rec.getTagName());
		}
	}
	//strait store (add indexes on second pass)
	if (store) {
		if (colPath == null) {
			colPath = "theApp.theControlApp.appInstances";
		}
		ds.create(colPath, app);
	}
};

/**
 * 
 * @param {pebble.Pebble} cssTemplates
 * @param {Function} cb
 * @return {?string} null means there were no less files
 */	
pebble.shared.BuildDeployment.prototype.processCssTemplates = function(cssTemplates, cb) {
	if (cssTemplates == null) {
		cb(cssTemplates);
	} else {
		var recs = cssTemplates.getRecords(".");
		var count = recs.length;
		if (count == 0) {
			cb(cssTemplates);
		} else {
			for (var i = 0; i < recs.length; i++) {
				var cssTemplate = recs[i];
				var less = cssTemplate.get("less");
				if (less != null) {
					//generate css
					var lessFiles = less.getRecords(".");
					if (lessFiles.length > 0) {

						this.compileLess(less, function(temp) {
							return	function(css) {
								temp.setMarkup("css", css);
								count -= 1;
								if (count == 0) cb(cssTemplates);
							}
						}(cssTemplate));
					} else {
						count -= 1;
						if (count == 0) cb(cssTemplates);
					}
				} else {
					count -= 1;	
					if (count == 0) cb(cssTemplates);
				}
			}
		}
	}
}	
/**
 * 
 * @param {pebble.Pebble} lessPeb
 * @param {Function} cb
 * @return {?string} null means there were no less files
 */	
pebble.shared.BuildDeployment.prototype.compileLess = function(lessPeb, cb) {
	//main less file is first one
	var lessFiles = lessPeb.getRecords(".");
	var main = lessFiles[0].getValue(".");	
	if (main !== null) {
		var startIndex  = 0;
		var outputStr = "";
		var remStr = main;
		while (remStr.indexOf("@import") != -1) {
			startIndex = remStr.indexOf("@import");
			if (startIndex >= 0) {
				startIndex = remStr.indexOf("\"", startIndex) + 1;
				endIndex = remStr.indexOf("\"", startIndex);
				var fileName = remStr.substring(startIndex, endIndex);
				fileName = fileName.replace(".less", "");
				outputStr += lessPeb.getValue(fileName);

				//should check again but...

				remStr = remStr.substring(endIndex + 1);
			} 
		}
		var parser = new(less.Parser);

		parser.parse(outputStr, function (err, tree) {
			if (err) { 
				return console.error(err);
			}
			var css = tree.toCSS({compress:true});
			cb(css);
		});
	}
}	
/**
 * @param {string} s 
 * @param {pebble.Pebble} deployment 
 */
function replaceStrings(s, deployment) {

	var out = "";
	var strings = deployment.get("strings");
	if (strings != null) {
		//match this:aa.bb ctx:aa.bb mod2:aa.bb, item:@, item:@aa.bb, etc
		//var patt = /([a-z0-9]+:[a-z0-9,@,_,\.]+)/gi;	
		var patt = /(@pebble-string_[a-z0-9]+)/gi;	
		var tokens = s.split(patt);
		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			if (token.indexOf("@pebble-string_") != -1) {
				var pair = token.split("_");
				var key = pair[1];

				var val = strings.getValue(key);
				if (val != null) {
					out += val;
				} else {
					out += token;
					window.console.log("BuildDeployment:replaceStrings() not key found " + token);
				}

			} else {

				out += token;

			}
		}
	} else {
		out = s;
	}
	return out;
}
pebble.shared.BuildDeployment.COMPRESSED_COLLECTION_ATTR = "compressedCollection";
