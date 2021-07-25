
goog.provide("pebble.shared.ServerControlDummy");


goog.require("pebble.shared.ServerControl");
goog.require("pebble.Pebble");
goog.require("pebble.shared.DocModel");
goog.require("pebble.shared.ItemType");
goog.require("pebble.shared.PathAnalyzer");


//-----file start

/**
 * @constructor
 * @extends {pebble.shared.ServerControl}
 */
pebble.shared.ServerControlDummy = function(dm) {
	pebble.shared.ServerControl.call(this, dm);
}

pebble.inherits(pebble.shared.ServerControlDummy, pebble.shared.ServerControl);

/**
 * @param {string} sp
 * @param {pebble.Pebble} obj
 * @return {number}
 * @override
 */
pebble.shared.ServerControlDummy.prototype.executeMethod = function(sp, obj) {
	var ret = 1;
	if (sp in this) {
		this[sp](obj);
	} else {
		return pebble.shared.ServerControlDummy.superClass_.executeMethod.call(this, sp, obj);
	}
	return ret;
}
/**
 * the instance can specify the displayControl or layout as instancePath.TYPE-PASS.displayControls.dc.layouts.a0
 * @param {pebble.Pebble} obj
 * @private
 */
pebble.shared.ServerControlDummy.prototype.doInit = function(obj) {
}
/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControlDummy.prototype.loginServer = function(obj) {
	var params = obj.getParams();
	var url = params.getValue("returnToUrl");
	obj.setValue("redirectUrl", "login.html?returnToUrl=" + url);

}
/**
 * @param {pebble.Pebble} obj
 */
pebble.shared.ServerControlDummy.prototype.logoutServer = function(obj) {
	var params = obj.getParams();
	var url = params.getValue("returnToUrl");
	//set query param u=""
	var elements = url.split("&u=");
	obj.setValue("redirectUrl", elements[0]);

}




