
goog.provide("pebble.shared.DocModel");

goog.require("pebble.Pebble");
goog.require("pebble.shared.interfaces.IServerData");


//-----file start
pebble.shared.DocModel = {};

/**
 * @type {pebble.shared.interfaces.IServerData}
 */
pebble.shared.DocModel.deployment = null;

/**
 * Factory must set datasources and deployment datasource
 * @return {pebble.shared.interfaces.IServerData}
 */
pebble.shared.DocModel.getDatasource = function() {

	return pebble.shared.DocModel.deployment;
};
/**
 * @param {string} fullId
 * @return {pebble.Pebble}
 */
pebble.shared.DocModel.getDoc = function(fullId) {
	try{
		var lastDeliminatorIndex = fullId.lastIndexOf(".");

		var container = "";
		var uname = fullId;
		if (lastDeliminatorIndex > 0) {
			//
			container = fullId.substring(0, lastDeliminatorIndex);
			uname = fullId.substring(lastDeliminatorIndex + 1);
		} else {
			//appInstances
			container = "theApp.theControlApp.appInstances";
			uname = fullId;
		}

		var ds = pebble.shared.DocModel.getDatasource();
		return ds.retrieve(container, uname);
	} catch (e) {
		return null;
	}
};

/**
 * @param {pebble.shared.interfaces.IServerData} depl
 */
pebble.shared.DocModel.setDeployment = function(depl) {
	pebble.shared.DocModel.deployment = depl;
};

