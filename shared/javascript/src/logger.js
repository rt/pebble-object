
goog.provide("pebble.shared.logger");
goog.require("pebble.shared.interfaces.HandlesLogging")
		
//-----file start

pebble.shared.logger = {};

pebble.shared.logger.impl = null;

/**
 * @param {pebble.shared.interfaces.HandlesLogging} logger
 */
pebble.shared.logger.setLogger = function(logger) {
	pebble.shared.logger.impl = logger;
};

/**
 * @param {string} level
 * @param {string} str
 * @param {Function=} fn
 * @param {string=} data
 */
pebble.shared.logger.log = function(level, str, fn, data) {
	if (pebble.shared.logger.impl != null) {
		pebble.shared.logger.impl.log(level, str, fn, data);
	}
};
pebble.shared.logger.clear = function() {
	if (pebble.shared.logger.impl != null) {
		pebble.shared.logger.impl.clear();
	}
};


