
/**
 * @constructor
 * @implements{IPebbleDataSource}
 * @param {string|Element|null} [o]
 */
PebbleDataSourceImpl_Json = function(o){
	/**
	 * @type {Element}
	 */
	this.xml = null;

	if (o == null) {
		this.xml = {}; 
	} else if (typeof(o) == 'string') {
		this.xml = JSON.parse(o);
	} else if (typeof(o) == 'object') { //element
		this.xml = o;
	}
}

/**
 * @return {string}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.toString = function () {
	//might need to return xml???
	return JSON.strigify(this.xml);
}

/**
 * @param {string} key
 * @return {?IPebbleDataSource}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.getDataSource = function (key) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, key, false);
	return node == null ? null : new PebbleDataSourceImpl_Json(node);
}

/**
 * @param {string} key
 * @return {?string}
 */
PebbleDataSourceImpl_Json.prototype.getValue = function(key) {
	if (key != null) {
		var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, key, false);
		if (node != null) {
			for (var key in node) {
				if (key.indexOf('_') != 0) {
					return node[key]; //toString??
				}
			}
		} 
	}
	return null;
}

/**
 * @param {string} path
 * @param {string} val
 * @override
 */
PebbleDataSourceImpl_Json.prototype.setValue = function(path, val) {
	if (val != null) {
		var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, true);
		for (var key in node) {
			if (key.indexOf('_') != 0) {
				node[key]= val;
				break;
			}
		}
	}
}

/**
 * @param {string} path
 * @param {string} val
 * @override
 */
PebbleDataSourceImpl_Json.prototype.setMarkup = function(path, val) {
	if (val != null) {
		var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, true);
		for (var key in node) {
			if (key.indexOf('_') != 0) {
				node[key]= val; //base64???
				break;
			}
		}
	}
}

/**
 * @param {string} path
 * @param {string} attrName
 * @return {?string}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.getRecordSetAttribute = function(path, attrName) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, false);
	if (node != null) {
		return node[attrName]; //ref
	} 
	return null;
}

/**
 * @param {string} path
 * @param {string} val
 * @param {string} attrName
 * @override
 */
PebbleDataSourceImpl_Json.prototype.setRecordSetAttribute = function(path, val, attrName) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, true);
	node[attrName] = val;
}

/**
 * @param {string} path
 * @param {string} attrName
 * @override
 */
PebbleDataSourceImpl_Json.prototype.removeRecordSetAttribute = function(path, attrName) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, true);
	if (node != null) {
		delete node[attrName];
	}
}

/**
 * @return {string}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.getTagName = function() {
	return this.xml.tagName; 
}

/**
 * @param {string} path
 * @param {IPebbleDataSource} item
 * @param {boolean} copyProperties
 * @override
 */
PebbleDataSourceImpl_Json.prototype.setRecordSet = function(path, item, copyProperties) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, true);
	if (item.xml != node) {//if it is itself, don't need to do anything (the remove will empty itself)
		if (node != null) {
			for (var key in node) {
				delete node[key];
			}
		} 
		for (var key in item) {
			if (key.indexOf('_') != 0 || copyProperties)) {
				node[key] = item[key];
			}
		}
	}
}

/**
 * @param {string} path
 * @param {IPebbleDataSource} item
 */
PebbleDataSourceImpl_Json.prototype.add = function(path, item) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, true);
	if (node != null) {
		node.push(item.xml);
	} 
}

/**
 * @param {string} path
 * @return {IPebbleDataSource}
 */
PebbleDataSourceImpl_Json.prototype.remove = function(path) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, false);
	if (node != null) {
		return new PebbleDataSourceImpl_Json(/**@type{Element}*/(node.parentNode.removeChild(node)));
	} 
	return null;
}

/**
 * @param {string} path
 * @return {Array.<IPebbleDataSource>}
 */
PebbleDataSourceImpl_Json.prototype.getRecords = function(path) {
	var recs = [];
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, false);
	if (node != null) {
		for (var i = 0; i < node.length; i++) {
			var childNode = node[i];
			//if (childNode.tagName.indexOf('_') != 0){
				recs[recs.length] = new PebbleDataSourceImpl_Json(childNode);
			//}
		}
	}

	return recs;
}

/**
 * @param {IPebbleDataSource} newNode
 * @param {string} targetPath
 */
PebbleDataSourceImpl_Json.prototype.insertBefore = function(newNode, targetPath) {

	var targetNode = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, targetPath, false);
	var parent = targetNode.parentNode;
	var node = parent.ownerDocument.importNode(newNode.xml, true);
	parent.insertBefore(node, targetNode);

}

/**
 * @param {string} path 
 * @param {string} name
 * @return {number}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.getIndex = function(path, name) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, false);
	if (node != null) {
			var childNodes = node.childNodes;
			var j = 0; //only count element nodes
			for (var i = 0; i < childNodes.length; i++) {
				var item = childNodes[i];
				if (item.nodeType == Node.ELEMENT_NODE && item.tagName.indexOf('_') != 0){
					if (item.tagName == name) {
						return j;
					}
					j += 1;
				}
			}
	}
	return -1;
}

/**
 * @param {string} path
 * @param {!number} index
 * @return {IPebbleDataSource}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.getByIndex = function(path, index) {
	var node = PebbleDataSourceImpl_Json.selectSingleElement(this.xml, path, false);
	if (node != null) {
		var childNodes = node.childNodes;
		var j = 0; //only count element nodes
		for (var i = 0; i < childNodes.length; i++) {
			var item = childNodes[i];
			if (item.nodeType == Node.ELEMENT_NODE && item.tagName.indexOf('_') != 0){
				if (j == index) {
					return new PebbleDataSourceImpl_Json(item);
				}
				j += 1;
			}
		}
	}
	return null;
}

/**
 * copies full i (ps and rs)
 * @param {string} path
 * @param {IPebbleDataSource} obj
 * @param {string} name
 * @override
 */
PebbleDataSourceImpl_Json.prototype.add2Array = function(path, obj, name) {

	this.setRecordSet(path + '.' + name, obj, true);

}

/**
 * @param {string} str
 * @return {IPebbleDataSource}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.getNewInstance = function(str) {
	if (str == null) {
		return new PebbleDataSourceImpl_Json();
	} else {
		return new PebbleDataSourceImpl_Json(str);
	}
}

/**
 * @return {IPebbleDataSource}
 * @override
 */
PebbleDataSourceImpl_Json.prototype.getCopyInstance = function() {
	return new PebbleDataSourceImpl_Json(this.xml.cloneNode(true));
}

/**
 * @override
 */
PebbleDataSourceImpl_Json.prototype.removeSpaces = function() { }

/**
 * @param {Object} xml
 * @param {string} path
 * @param {boolean} createOnNull
 * @return {Object} 
 */
PebbleDataSourceImpl_Json.selectSingleElement = function(xml, path, createOnNull) {
	if (path != null && path != '.' && path != '') {
		var elements = path.split('.');
		var i = 0;
		//sometimes comes in with leading '.'
		while (elements[i] == '') {
			path = path.substring(path.indexOf('.') + 1);
			i++;
		}
		xml = PebbleDataSourceImpl_Json.getChildNode(xml, elements[i], createOnNull);
		var remElements = elements.length - i;
		if (remElements > 1 && xml != null) { 
			var newPath = path.substring(path.indexOf('.') + 1);
			return PebbleDataSourceImpl_Json.selectSingleElement(xml, newPath, createOnNull);
		}
	}
	return xml;
};

/**
 * @param {Object} item
 * @param {string} currentPath
 * @param {boolean} createOnNull
 * @return {Object}
 */
PebbleDataSourceImpl_Json.getChildNode = function(item, currentPath, createOnNull) {
	if (item != null) {
		for (var key in item) {
			if (key === currentPath) {
				return item[key];
			}
		}
		if (createOnNull) {
			item[currentPath] = {};
			return item[currentPath];
		}
	}
	return null;
};
