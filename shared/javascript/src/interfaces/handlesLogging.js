goog.provide("pebble.shared.interfaces.HandlesLogging");


//-----file start
/**
 * @interface
 */
pebble.shared.interfaces.HandlesLogging = function() {};

/**
 * @param {string} level 
 * @param {string} message
 * @param {Function=} fn
 * @param {string=} data
 */
pebble.shared.interfaces.HandlesLogging.prototype.log = function (level, message, fn, data){};


