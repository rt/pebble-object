
goog.provide("pebble.shared.PebbleUtils");

goog.require("pebble.Pebble");


//-----file start

/**
 * @constructor
 */
pebble.shared.PebbleUtils = function() {

}


//creates a simple pebble of heirarchy for path or ref instances
/**
 * @param {pebble.Pebble} item
 * @param {string} path
 * @return {pebble.Pebble}
 */
pebble.shared.PebbleUtils.getInstanceRefs = function(item, path) {
	//create simple reference instance pebble
	var instanceRefs = new pebble.Pebble();
	if (path.indexOf(".") == 0) {
		path = path.substring(1);
	}
	var elements = path.split(".");
	var getPath = "";
	for (var i = 0; i < elements.length; i++) {
		var ele = elements[i];
		getPath += ele;
		var ref = item.getRef(getPath);
		if (ref == null) {
			ref = ""; // no refs are set as empty string
		}
		instanceRefs.setRef(getPath, ref);
		getPath += ".";
	}
	return instanceRefs;
}

//need the definition
//public static String toJson(Pebble item) {
//String json = "";
//List<Pebble> recs = item.getRecords(".");
//for (Pebble rec : recs) {
//json += "'" + rec.getTagName() + "':" + _toJson(rec, def);
//}
//return json;
//}

//public static String toXml(Pebble item) {
//String xml = "";
//return xml;
//}

/**
 * @param {string} str
 * @param {string} suffix
 * @return {boolean}
 */
pebble.shared.PebbleUtils.endsWith = function (str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};


/**
 * @param {string} str
 * @param {string} val
 * @return {string}
 */
pebble.shared.PebbleUtils.rStrip = function(str, val) {
	if (pebble.shared.PebbleUtils.endsWith(str, val)) {
		return str.substring(0, str.lastIndexOf(val));
	} else {
		return str;
	}
};
/**
 * @param {string} str
 * @param {string} val
 * @return {string}
 */
pebble.shared.PebbleUtils.lStrip = function(str, val) {
	if (str.indexOf(val) == 0) {
		return str.substring(val.length);
	} else {
		return str;
	}
};


