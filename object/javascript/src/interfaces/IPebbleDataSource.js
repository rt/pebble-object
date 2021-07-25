
/**
 * @interface
 */
IPebbleDataSource = function() {};

/**
 * @param {string} o
 * @return {IPebbleDataSource}
 */
IPebbleDataSource.prototype.getNewInstance = function (o){};

/**
 * @param {string} key
 * @return {?IPebbleDataSource}
 */
IPebbleDataSource.prototype.getDataSource = function(key){};
/**
 * @return {IPebbleDataSource}
 */
IPebbleDataSource.prototype.getCopyInstance = function(){};
/**
 */
IPebbleDataSource.prototype.removeSpaces = function(){};
/**
 * @param {string} key
 * @return {?string}
 */
IPebbleDataSource.prototype.getValue = function(key){};
/**
 * @param {string} path
 * @param {string} val
 */
IPebbleDataSource.prototype.setValue = function(path, val){};
/**
 * @param {string} path
 * @param {string} val
 */
IPebbleDataSource.prototype.setMarkup = function(path, val){};
/**
 * @return {string}
 */
IPebbleDataSource.prototype.getTagName = function(){};

/**
 * @param {string} path
 * @param {string} string
 * @return {?string}
 */
IPebbleDataSource.prototype.getRecordSetAttribute = function(path, string){};

/**
 * @param {string} path
 * @param {string} val
 * @param {string} attrName
 */
IPebbleDataSource.prototype.setRecordSetAttribute = function(path, val, attrName){};
/**
 * @param {string} path
 * @param {string} attrName
 */
IPebbleDataSource.prototype.removeRecordSetAttribute = function(path, val, attrName){};

/**
 * @param {string} path
 * @param {IPebbleDataSource} obj
 * @param {boolean} copyProperties
 */
IPebbleDataSource.prototype.setRecordSet = function(path, obj, copyProperties){};

/**
 * @param {string} path
 * @return {IPebbleDataSource}
 */
IPebbleDataSource.prototype.remove = function(path){};

/**
 * @param {string} path
 * @return {Array.<IPebbleDataSource>}
 */
IPebbleDataSource.prototype.getRecords = function(path){};

/**
 * @param {string} path
 * @param {string} name
 * @return {number}
 */
IPebbleDataSource.prototype.getIndex = function(path, name){};

/**
 * @param {string} path
 * @param {IPebbleDataSource} xml
 * @param {string} name
 */
IPebbleDataSource.prototype.add2Array = function(path, xml, name){};

/**
 * @param {IPebbleDataSource} newNode
 * @param {string} targetPath
 */
IPebbleDataSource.prototype.insertBefore = function(newNode, targetPath){};
/**
 * @param {string} path
 * @param {number} index
 * @return {IPebbleDataSource}
 */
IPebbleDataSource.prototype.getByIndex = function(path, index){};

