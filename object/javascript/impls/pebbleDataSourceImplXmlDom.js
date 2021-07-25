var xmldom = require('xmldom');
var DOMParser = xmldom.DOMParser;
var XMLSerializer = xmldom.XMLSerializer;

//the xmldom uses NodeType
var Node = {
	ELEMENT_NODE: 1,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4
}; 
//replace all pebble.Xml with PebbleDtaSourceImplXmlDom

/**
 * @constructor
 * @implements{IPebbleDataSource}
 * @param {string|Element|null} o
 */
PebbleDataSourceImplXmlDom = function(o) {
	if (o == null) {
		this.createXml('<i />'); 
	} else if (typeof(o) == 'string') {
		this.createXml(o);
	} else if (typeof(o) == 'object') { //element
		this.xml = o;
	}
}

/**
 * @param {string} xmlStr
 */
PebbleDataSourceImplXmlDom.prototype.createXml = function(xmlStr) {
	this.xml = this.parse(xmlStr).documentElement;
}

/**
 * @return {string}
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.toString = function () {
	return this.element2String(this.xml);
}

/**
 * @param {string} key
 * @return {?IPebbleDataSource}
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.getDataSource = function (key) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, key, false);
	return node == null ? null : new PebbleDataSourceImplXmlDom(node);
}

/**
 * @param {string} key
 * @return {?string}
 */
PebbleDataSourceImplXmlDom.prototype.getValue = function(key) {
	if (key != null) {
		var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, key, false);
		if (node != null && node.childNodes.length > 0) {
			for (var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				if (child.nodeName.indexOf('_') != 0) {
					return child.nodeValue;
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
PebbleDataSourceImplXmlDom.prototype.setValue = function(path, val) {
	if (val != null) {
		var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, true);
		for (var i = node.childNodes.length - 1; i >= 0; i--) {
			var child = node.childNodes[i];
			if (child.nodeName.indexOf('_') != 0) {
				node.removeChild(node.childNodes[i]);
			}
		}
		node.appendChild(node.ownerDocument.createTextNode(val));
	}
}

/**
 * @param {string} path
 * @param {string} val
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.setMarkup = function(path, val) {
	if (val != null) {
		var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, true);
		for (var i = node.childNodes.length - 1; i >= 0; i--) {
			var child = node.childNodes[i];
			if (child.nodeName.indexOf('_') != 0) {
				node.removeChild(node.childNodes[i]);
			}
		}
		node.appendChild(node.ownerDocument.createCDATASection(val));
	}
}

/**
 * @param {string} path
 * @param {string} attrName
 * @return {?string}
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.getRecordSetAttribute = function(path, attrName) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, false);
	if (node != null) {
		return node.getAttribute(attrName);
	} 
	return null;
}

/**
 * @param {string} path
 * @param {string} val
 * @param {string} attrName
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.setRecordSetAttribute = function(path, val, attrName) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, true);
	node.setAttribute(attrName, val);
}

/**
 * @param {string} path
 * @param {string} attrName
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.removeRecordSetAttribute = function(path, attrName) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, true);
	if (node != null) {
		node.removeAttribute(attrName);
	}
}

/**
 * @return {string}
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.getTagName = function() {
	return this.xml.tagName; 
}

/**
 * @param {string} path
 * @param {IPebbleDataSource} item
 * @param {boolean} copyProperties
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.setRecordSet = function(path, item, copyProperties) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, true);
	if (item.xml != node) {//if it is itself, don't need to do anything (the remove will empty itself)
		if (node != null) {
			for (var i = node.childNodes.length - 1; i >= 0; i--) {
				var child = node.childNodes[i];
				if (child.nodeType != Node.ELEMENT_NODE || (child.tagName.indexOf('_') != 0 || copyProperties)) {
					node.removeChild(child);
				}
			}
		} 
		for (var i = 0; i < item.xml.attributes.length; i++) {
			var attr = item.xml.attributes[i];
			node.setAttribute(attr.name, attr.value);
		}
		for (var i = 0; i < item.xml.childNodes.length; i++) {
			var child = item.xml.childNodes[i];
			if (child.nodeType !=  Node.ELEMENT_NODE || (child.tagName.indexOf('_') != 0 || copyProperties)) {
				var importNode = this.xml.ownerDocument.importNode(child, true);
				node.appendChild(importNode);
			}
		}
	}
}

/**
 * @param {string} path
 * @param {IPebbleDataSource} item
 */
PebbleDataSourceImplXmlDom.prototype.add = function(path, item) {
	var node = PebbleDataSourceImpl_BrowserDom.selectSingleElement(this.xml, path, true);
		if (node != null) {
				var importNode = this.xml.ownerDocument.importNode(item.xml, true);
				node.appendChild(importNode);
		} 
}

/**
 * @param {string} path
 * @return {IPebbleDataSource}
 */
PebbleDataSourceImplXmlDom.prototype.remove = function(path) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, false);
	if (node != null) {
		return new PebbleDataSourceImplXmlDom(node.parentNode.removeChild(node));
	} 
	return null;
}

/**
 * @param {string} path
 * @return {Array.<IPebbleDataSource>}
 */
PebbleDataSourceImplXmlDom.prototype.getRecords = function(path) {
	var recs = [];
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, false);
	if (node != null) {
		var childNodes = node.childNodes;
		for (var i = 0; i < childNodes.length; i++) {
			var childNode = childNodes[i];
			if (childNode.nodeType == Node.ELEMENT_NODE && childNode.tagName.indexOf('_') != 0){
				recs[recs.length] = new PebbleDataSourceImplXmlDom(childNode);
			}
		}
	}

	return recs;
}

/**
 * @param {IPebbleDataSource} newNode
 * @param {string} targetPath
 */
PebbleDataSourceImplXmlDom.prototype.insertBefore = function(newNode, targetPath) {

	var targetNode = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, targetPath, false);
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
PebbleDataSourceImplXmlDom.prototype.getIndex = function(path, name) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, false);
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
PebbleDataSourceImplXmlDom.prototype.getByIndex = function(path, index) {
	var node = PebbleDataSourceImplXmlDom.selectSingleElement(this.xml, path, false);
	if (node != null) {
		var childNodes = node.childNodes;
		var j = 0; //only count element nodes
		for (var i = 0; i < childNodes.length; i++) {
			var item = childNodes[i];
			if (item.nodeType == Node.ELEMENT_NODE && item.tagName.indexOf('_') != 0){
				if (j == index) {
					return new PebbleDataSourceImplXmlDom(item);
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
PebbleDataSourceImplXmlDom.prototype.add2Array = function(path, obj, name) {

    this.setRecordSet(path + '.' + name, obj, true);

}

/**
 * @param {string} str
 * @return {IPebbleDataSource}
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.getNewInstance = function(str) {
	if (str == null) {
		return new PebbleDataSourceImplXmlDom();
	} else {
		return new PebbleDataSourceImplXmlDom(str);
	}
}

/**
 * @return {IPebbleDataSource}
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.getCopyInstance = function() {
	return new PebbleDataSourceImplXmlDom(this.xml.cloneNode(true));
}

/**
 * @override
 */
PebbleDataSourceImplXmlDom.prototype.removeSpaces = function() {
	return this.xml = PebbleDataSourceImplXmlDom.removeSpaces(this.xml);
}

/**
 * @param {string} xml
 * @return {Element}
 */
PebbleDataSourceImplXmlDom.prototype.parse = function(xml) {
	if (DOMParser) {
			var doc = new DOMParser().parseFromString(xml, 'text/xml');
			if ('parsererror' == doc.documentElement.nodeName) {
				throw new Error('Parse error');
			}
			return doc;

	} else {
		var doc = new ActiveXObject('Microsoft.XMLDOM');
		if (!doc.loadXML(xml)) {
			throw new Error('Parse error');
		}
		return doc;
	}
}

/**
 * @param {Element} obj
 * @return {string}
 */
PebbleDataSourceImplXmlDom.prototype.element2String = function (obj) {
	if (DOMParser) {
			return new XMLSerializer().serializeToString(obj);
	} else {
			return obj.xml;
	}
}

/**
 * @param {Element} xml
 * @param {string} path
 * @param {boolean} createOnNull
 * @return {Element} 
 */
PebbleDataSourceImplXmlDom.selectSingleElement = function(xml, path, createOnNull) {
	if (path != null && path != '.' && path != '') {
		var elements = path.split('.');
		var i = 0;
		//sometimes comes in with leading '.'
		while (elements[i] == '') {
			path = path.substring(path.indexOf('.') + 1);
			i++;
		}
		xml = PebbleDataSourceImplXmlDom.getChildNode(xml, elements[i], createOnNull);
		var remElements = elements.length - i;
		if (remElements > 1 && xml != null) { 
			var newPath = path.substring(path.indexOf('.') + 1);
			return PebbleDataSourceImplXmlDom.selectSingleElement(xml, newPath, createOnNull);
		}
	}
	return xml;
};

/**
 * @param {Element} item
 * @param {string} currentPath
 * @param {boolean} createOnNull
 * @return {Element}
 */
PebbleDataSourceImplXmlDom.getChildNode = function(item, currentPath, createOnNull) {
	if (item != null) {
		var childNodes = item.childNodes;
		for (var i = 0; i < childNodes.length; i++) {
			var child = childNodes[i];
			if (child.nodeType == Node.ELEMENT_NODE && child.tagName === currentPath) {
				return child;
			}
		}
		if (createOnNull) {
			var child = item.ownerDocument.createElement(currentPath);
			item.appendChild(child);
			return child;
		}
	}
	return null;
};

/**
 * @param {Element} item
 * @return {Element}
 */
PebbleDataSourceImplXmlDom.removeSpaces = function(item) {
	var nl = item.childNodes;
	var canClean = false;
	for (var i = 0; i < nl.length; i++) {
		var child = nl[i];
		if (child.nodeType == Node.ELEMENT_NODE && child.tagName.indexOf('_') != 0) {//_ could be in a basic d node now
			canClean = true;
			break;
		}
	}
	if (canClean) {
		var k = nl.length - 1;
		while (k >= 0){
			var child = nl[k];
			if (child.nodeType != Node.ELEMENT_NODE){
				child.parentNode.removeChild(child);
			} else {
				child = PebbleDataSourceImpl_BrowserDom.removeSpaces(child);
			}
			k -= 1;
		}
	}
	return item;
}

exports.PebbleDataSourceImpl = PebbleDataSourceImplXmlDom;
