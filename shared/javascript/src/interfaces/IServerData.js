goog.provide("pebble.shared.interfaces.IServerData");


//-----file start
/**
 * @interface
 */
pebble.shared.interfaces.IServerData = function() {};

/**
 * @param {string} collection
 * @param {pebble.Pebble} pebble
 * @return {pebble.Pebble}
 */
pebble.shared.interfaces.IServerData.prototype.create = function (collection, pebble){};
/**
 * @param {string} collection
 * @param {string} uniqueName
 * @return {pebble.Pebble}
 */
pebble.shared.interfaces.IServerData.prototype.retrieve = function(collection, uniqueName){};
/**
 * @param {string} collection
 * @param {string} uniqueName
 * @param {pebble.Pebble} doc
 */
pebble.shared.interfaces.IServerData.prototype.update = function (collection, uniqueName, doc){};
/**
 * @param {string} collection
 * @param {string} uniqueName
 */
pebble.shared.interfaces.IServerData.prototype.deleteItem = function(collection, uniqueName){};
/**
 * @param {Array.<string>} list
 */
pebble.shared.interfaces.IServerData.prototype.deleteCollections = function (list){};
/**
 * @param {pebble.Pebble} queryItem
 * @return {Array.<string>} 
 */
pebble.shared.interfaces.IServerData.prototype.doQuery = function(queryItem){};
