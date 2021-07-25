

goog.provide("pebble.shared.PathAnalyzer");

goog.require("pebble.Pebble");
goog.require("pebble.shared.DocModel");
goog.require("pebble.shared.ItemType");
goog.require("pebble.shared.TypeReferences");
goog.require("pebble.shared.PebbleUtils");


//-----file start

/**
 * PathAnalyzer gets infomation about the path 
 * @param {?string} appPath
 * @constructor
 */
pebble.shared.PathAnalyzer = function(appPath) {

	if (appPath == null) {
		throw new Error("PathAnalyzer: PathAnalyzer() requires path");
	}
	/**
	 * @type {string}
	 */
	this.path = appPath;
	/**
	 * the ItemType(typePath) so that getField, getAppIndex can be used
	 * @type Array.<pebble.shared.ItemType>
	 */
	this.itemTypes = [];
	/**
	 * the types as in their parent definition (field.type)
	 * @type Array.<pebble.Pebble>
	 */
	this.fieldTypes = [];
	/**
	 * list of doc paths (non doc members are skipped), only useful for the last one
	 * @type Array.<string>
	 */
	this.docPaths = [];

	this.initComponents();
}
/**
 * Set forms, docPaths
 */
pebble.shared.PathAnalyzer.prototype.initComponents = function() {

	var elements = this.path.split(".");
	var element = elements[0];
	this.docPaths.push(element);
	this.docPaths.push(element[1]);
	var theInstance = pebble.shared.DocModel.deployment.retrieve("theApp.theControlApp.appInstances", "theInstance");
	var app = theInstance.getRef("theControlApp");
	var appMeta = app.split(".").pop();
	var currentForm = new pebble.shared.ItemType(app + ".types." + appMeta);
	this.itemTypes.push(null);
	this.itemTypes.push(currentForm);

	this.fieldTypes.push(null);
	this.fieldTypes.push(currentForm.getCopy("."));

	var i = 2;
	while (i < elements.length) {
		element = elements[i];
		var field = currentForm.getField(element);
		var type = field.get("type");
		var typeRef = type.getRef(".");
		if (typeRef != null) {
			//ARRAY
			if (pebble.shared.PebbleUtils.endsWith(typeRef, "standard.types.array") || pebble.shared.PebbleUtils.endsWith(typeRef, "standard.types.collection")) { //.equals(TypeReferences.ARRAY)) {
				var arrayFormId = type.get("arrayFormId");
				var instanceId = "";

				for (var j = 0; j < i + 1; j++) {
					instanceId += elements[j] + ".";
				}
				instanceId = pebble.shared.PebbleUtils.rStrip(instanceId, ".");
				this.itemTypes.push(new pebble.shared.ItemType(typeRef)); 
				this.fieldTypes.push(type);

				if (instanceId != this.path) {
					//skip the array element (if we didnt we would put array as currentForm but the next currentForm.getField(element) wouldn't work)
					//here we are skipping to the arrayFormId and incrementing (as the collectionPath was added to the forms list)
					instanceId += "." + elements[i + 1];
					if (type.getRef(".").split(".").pop() === "collection"){ 
						this.docPaths.push(instanceId);
					} 
					currentForm = new pebble.shared.ItemType(arrayFormId.getRef("."));
					this.itemTypes.push(currentForm);
					this.fieldTypes.push(currentForm.getCopy("."));
					i += 1; 
				} 
			} else if (pebble.shared.PebbleUtils.endsWith(typeRef, "standard.types.itemRelRef")){ //equals(TypeReferences.REFERENCE)) {
				//REFERENCE TO TYPE
				var pathToRef = "";
				for (var j = 0; j <= i; j++) {
					pathToRef += elements[j] + ".";
				}
				pathToRef = pathToRef.substring(0, pathToRef.lastIndexOf("."));
				var relPath = this.getRelPath(pathToRef);
				//type is in the instance.rs.k
				var doc = this.getLastDoc();
				currentForm = new pebble.shared.ItemType(doc.getRef(relPath));

				this.itemTypes.push(currentForm);
				this.fieldTypes.push(currentForm.getCopy("."));
			} else {
				currentForm = new pebble.shared.ItemType(typeRef);
				this.itemTypes.push(currentForm);
				this.fieldTypes.push(currentForm.getCopy("."));
			}
			i += 1;
		} else {
			throw new Error("PathAnalyzer: initComponents() requires typeRef for all fields in path");
		}
	}
}
/**
 * @return {string}
 */
pebble.shared.PathAnalyzer.prototype.getPath = function() {
	return this.path;
}
/**
 * @return {pebble.Pebble}
 */
pebble.shared.PathAnalyzer.prototype.getLastDoc = function() {
	return pebble.shared.DocModel.getDoc(this.getLastDocPath());
}
/**
 * @return Array.<string>
 */
pebble.shared.PathAnalyzer.prototype.getDocPaths = function() {
	return this.docPaths;
}
/**
 * @return {string}
 */
pebble.shared.PathAnalyzer.prototype.getLastDocPath = function() {
	return this.docPaths[this.docPaths.length - 1];
}
/**
 * @return {string}
 */
pebble.shared.PathAnalyzer.prototype.getParentDocPath = function() {
	return this.docPaths[this.docPaths.length - 2];
}
/**
 * @return {pebble.Pebble}
 */
pebble.shared.PathAnalyzer.prototype.getLastFieldType = function() {
	return this.fieldTypes[this.fieldTypes.length - 1];
}
/**
 * @return Array.<pebble.shared.ItemType>
 */
pebble.shared.PathAnalyzer.prototype.getItemTypes = function() {
	return this.itemTypes;
}
/**
 * @return {pebble.shared.ItemType}
 */
pebble.shared.PathAnalyzer.prototype.getParentItemType = function() {
	return this.itemTypes[this.itemTypes.length - 2];
}
/**
 * @return {pebble.shared.ItemType}
 */
pebble.shared.PathAnalyzer.prototype.getLastItemType = function() {
	return this.itemTypes[this.itemTypes.length - 1];
}
/**
 * @param {string} [fullPath]
 * @return {string}
 */
pebble.shared.PathAnalyzer.prototype.getRelPath = function(fullPath) {
	if (fullPath == null) {
		fullPath = this.getPath();
	}
	return pebble.shared.PebbleUtils.lStrip(fullPath.replace(this.docPaths[this.docPaths.length - 1], ""), ".");
}
/**
 * @return {pebble.Pebble}
 */
pebble.shared.PathAnalyzer.prototype.getItem = function() {
	var relPath = this.getRelPath();
	var doc = this.getLastDoc();
	if (relPath != "") {
		return doc.get(relPath);
	} else {
		return doc;
	}
}
