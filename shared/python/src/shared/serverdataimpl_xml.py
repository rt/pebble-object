import pebbleutils
import logger
from pebbleobject import pebble

class ServerDataImpl_Xml(object):

	def __init__(self, o):
		if isinstance(o, pebble.Pebble):
			self.ds = o
		elif isinstance(o, basestring) :
			#path
			self.ds.loadFile(o)
		else :
			self.ds = pebble.Pebble()

	def create (self, collection, peb) :
	
		#must set these before returning
	
		tableName = collection.replace(".", "_")
		if peb.getTagName() != "i":
			self.ds.setFull(tableName + "." + peb.getTagName(), peb)
		else:
			peb = self.ds.add2Array(tableName, peb, None)
		return self.retrieve(collection, peb.getTagName())
	
	
	def retrieve (self, collection, uniqueName) :
		tableName = collection.replace(".", "_")
	
		path = tableName + "." + uniqueName
		data = self.ds.getCopy(path)
		if data is not None :
			return data
		else:
			logger.log("ERROR", "Couldn't get single entity for query: " + collection + "-" + uniqueName)
			return None
	
	def update (self, fullContainerName, uniqueName, doc) :
	
		tableName = fullContainerName.replace(".", "_")
	
		path = tableName + "." + uniqueName
		data = self.ds.getCopy(path)
	
		data.set(".", doc.getCopy("."))
	
		#write
		self.ds.setFull(path, data)
	
	def deleteItem (self, collection, name) :
		tableName = collection.replace(".", "_")
		path = tableName + "." + name
		self.ds.remove(path)
	
	def deleteCollections (self, lst) :
		for collection in lst: 
			tableName = collection.replace(".", "_")
			self.ds.remove(tableName)
	
	def doQuery (self, queryPeb) :
		path = queryPeb.get("path")
	
		containerKey = path.getRef(".")
	
		tableName = containerKey.replace(".", "_")
	
		lst = self.ds.getCopy(".").getRecords(tableName)
	
		results = []
		for item in lst :
			appIndexItem = pebble.Pebble()
			appIndexItem.set(".", item)
	
	
			appIndexItem.setTagName(item.getTagName())
			results.append(appIndexItem.toString())
	
		return results       
	
	
	def getDataSource (self) :
		return self.ds
	
	def toString (self) :
		return self.ds.toString()
	
	def removeSpaces (self) :
		return self.ds.removeSpaces()
	
	
	
	
	
