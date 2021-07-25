
from xml.dom import minidom
from xml.dom import Node

class PebbleDataSourceImpl(object):
	def __init__(self, o=None):
		object.__init__(self)
		if o == None :
			self.createXml("<i />") 
		elif isinstance(o, basestring):
			self.createXml(o)
		else:#if isinstance(o, PebbleDataSourceImpl):
			self.xml = o

	def createXml(self, xmlStr):
		self.xml = self.parse(xmlStr).documentElement

	def toString(self):
		return self.element2String(self.xml)

	def getDataSource(self, key):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, key, False)
		if node == None :
			return None
		else:
			return PebbleDataSourceImpl(node)

	def getValue(self, key):
		if key != None :
			node = PebbleDataSourceImpl.selectSingleElement(self.xml, key, False)
			if node != None and len(node.childNodes) > 0 :
				for child in node.childNodes:
					if child.nodeType != Node.ELEMENT_NODE:
						return child.nodeValue #note if cdata node it MUST BE stuck to the d node!!!
		return None

	def setValue(self, path, val):
		if val != None :
			node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, True)
			if len(node.childNodes) == 0 or (len(node.childNodes) == 1 and node.firstChild.nodeType == Node.ELEMENT_NODE and node.firstChild.tagName == "ps"):
				node.appendChild(node.ownerDocument.createTextNode("tn"))
			for child in node.childNodes :
				if child.nodeType != Node.ELEMENT_NODE:
					child.nodeValue = val
	
	def setMarkup(self, path, val):
		if val != None :
			node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, True)
			if len(node.childNodes) == 0 or (len(node.childNodes) == 1 and node.firstChild.nodeType == Node.ELEMENT_NODE and node.firstChild.tagName == "ps"):
				node.appendChild(node.ownerDocument.createCDATASection("tn"))
			for child in node.childNodes :
				if child.nodeType != Node.ELEMENT_NODE:
					child.nodeValue = val
	
	def getRecordSetAttribute(self, path, attrName):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, False)
		if node != None :
			return node.getAttribute(attrName)
		return None
	
	def setRecordSetAttribute(self, path, val, attrName):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, True)
		node.setAttribute(attrName, val)
	
	def removeRecordSetAttribute(self, path, attrName):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, True)
		if node != None :
			node.removeAttribute(attrName)

	def getTagName(self):
		return self.xml.tagName

	def setRecordSet(self, path, item, copyProperties):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, True)
		if item.xml != node :#if it is itself, don't need to do anything (the remove will empty itself)
			if node != None :
				for child in reversed(node.childNodes) :
					if child.nodeType != Node.ELEMENT_NODE or (child.tagName != "ps" or copyProperties):
						node.removeChild(child);
			
			for i in range(item.xml.attributes.length):
				attr = item.xml.attributes[i]
				node.setAttribute(attr.name, attr.value)
			
			for child in item.xml.childNodes:
				if child.nodeType !=  Node.ELEMENT_NODE or (child.tagName != "ps" or copyProperties):
					importNode = self.xml.ownerDocument.importNode(child, True)
					node.appendChild(importNode);
	
	def remove(self, path):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, False)
		if node != None :
			return PebbleDataSourceImpl(node.parentNode.removeChild(node))
		return None
	
	def getRecords(self, path):
		recs = []
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, False)
		if node != None :
			childNodes = node.childNodes
			for childNode in childNodes :
				if childNode.nodeType == Node.ELEMENT_NODE and childNode.tagName != "ps":
					recs.append(PebbleDataSourceImpl(childNode))
	
		return recs
	
	def insertBefore(self, newNode, targetPath):
	
		targetNode = PebbleDataSourceImpl.selectSingleElement(self.xml, targetPath, False)
		parent = targetNode.parentNode
		node = parent.ownerDocument.importNode(newNode.xml, True)
		parent.insertBefore(node, targetNode)
	
	def getIndex(self, path, name):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, False)
		if node != None :
			childNodes = node.childNodes
			j = 0 #only count element nodes
			for item in childNodes :
				if item.nodeType == Node.ELEMENT_NODE and item.tagName != "ps":
					if (item.tagName == name):
						return j
					j += 1
		return -1
	
	def getByIndex(self, path, index):
		node = PebbleDataSourceImpl.selectSingleElement(self.xml, path, False)
		if node != None :
			childNodes = node.childNodes
			j = 0 #only count element nodes
			for item in childNodes :
				if item.nodeType == Node.ELEMENT_NODE and item.tagName != "ps":
					if j == index :
						return PebbleDataSourceImpl(item)
					j += 1
		return None
	
	def add2Array(self, path, obj, name):
	
		self.setRecordSet(path + "." + name, obj, True);

	def getNewInstance(self, s=None):
		if s == None :
			return PebbleDataSourceImpl()
		else :
			return PebbleDataSourceImpl(s)
	def getCopyInstance(self):
		return PebbleDataSourceImpl(self.xml.cloneNode(True))
	
	def removeSpaces(self):
		self.xml = PebbleDataSourceImpl.removeSpaces(self.xml)
	
	def parse(self, xml):
		return minidom.parseString(xml)
	
	def element2String(self, obj):
		return obj.toxml()
	
	@classmethod
	def selectSingleElement (cls, xml, path, createOnNull):
		if path != None and path != "." and path != "" :
			elements = path.split(".")
			i = 0
			#sometimes comes in with leading "."
			while (elements[i] == ""):
				path = path[path.find(".") + 1:]
				i = i + 1
			
			xml = PebbleDataSourceImpl.getChildNode(xml, elements[i], createOnNull)
			remElements = len(elements)- i
			if remElements > 1 and xml != None : 
				newPath = path[path.find(".") + 1:]
				return PebbleDataSourceImpl.selectSingleElement(xml, newPath, createOnNull)
		return xml
	
	@classmethod
	def getChildNode (cls, item, currentPath, createOnNull):
		if item != None :
			childNodes = item.childNodes
			for child in childNodes :
				if child.nodeType == Node.ELEMENT_NODE and child.tagName == currentPath:
					return child
			if createOnNull :
				ret = item.ownerDocument.createElement(currentPath)
				item.appendChild(ret)
				return ret
		return None
	
	@classmethod
	def removeSpaces (cls, item):
		nl = item.childNodes
		canClean = False
		for child in nl :
			if child.nodeType == Node.ELEMENT_NODE and child.tagName != "ps" :
				canClean = True
				break;

		if canClean :
			k = len(nl) - 1
			while k >= 0:
				child = nl[k]
				if child.nodeType != Node.ELEMENT_NODE:
					child.parentNode.removeChild(child)
				else:
					child = PebbleDataSourceImpl.removeSpaces(child)
				k -= 1
		return item
	
