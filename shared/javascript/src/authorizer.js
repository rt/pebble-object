
goog.provide("pebble.shared.Authorizer");

goog.require("pebble.Pebble");
goog.require("pebble.shared.DocModel");
//-----file start

/**
 * Helper class you can inherit from when writing authorizers
 * @constructor
 */
pebble.shared.Authorizer = function(userId) {
	this.userId = userId || pebble.shared.Authorizer.UNAUTHORIZED_USER;
}
/**
 * @return {pebble.Pebble}
 */
pebble.shared.Authorizer.prototype.getUserObject = function() {
	var user = new pebble.Pebble();

	var top = pebble.shared.DocModel.getDoc("theInstance");//get top app
	var maps = top.getRecords("groupMaps");
	//check against all groupMaps if true for any then authorized
	for (var j = 0; j < maps.length; j++) {
		var map = maps[j];
		var actorGroup = map.getRef(".");
		var userGroup = map.get("toGroup");
		if (this.isInGroup(actorGroup, userGroup)) {
			user.set("roles." + actorGroup, new pebble.Pebble());
		}
	}
	user.setRef("id", this.userId);
	var isAuth = this.userId != pebble.shared.Authorizer.UNAUTHORIZED_USER;
	user.setValue("isAuth", isAuth.toString());
	return user;
};
/**
 * @param {pebble.Pebble} userGroup
 * @return {boolean}
 */
pebble.shared.Authorizer.prototype.isInGroup = function(userGroup){}


pebble.shared.Authorizer.UNAUTHORIZED_USER = "-1";
