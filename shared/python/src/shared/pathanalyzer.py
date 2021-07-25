from pebbleobject import pebble
import pebbleutils
import itemtype
import docmodel

class PathAnalyzer(object):

	def __init__(self, appPath):
		self.path = appPath
		self.itemTypes = []
		self.fieldTypes = []
		self.docPaths = []
		self.initComponents()
	
	def initComponents (self) :
	
		elements = self.path.split(".")
		element = elements[0]
		top = docmodel.DocModel.getDoc(element)#get top app
		self.docPaths.append(element)
		currentForm = itemtype.ItemType(pebble.shared.TypeReferences.INDEX_ITEM)#top.getFormKey())
	
		self.itemTypes.append(currentForm)
		self.fieldTypes.append(currentForm.getCopy("."))
	
		i = 1
		while i < len(elements):
			element = elements[i]
			field = currentForm.getField(element)
			type = field.get("type")
	
			#ARRAY
			if type.getRef(".").endswith("standard.types.array") : #.equals(TypeReferences.ARRAY)) {
				arrayFormId = type.get("arrayFormId")
				instanceId = ""
	
				for j in range(i + 1):
					instanceId += elements[j] + "."
				
				instanceId = instanceId.rstrip(".")
				self.itemTypes.append(itemtype.ItemType(type.getRef("."))) 
				self.fieldTypes.append(type)
	
				if instanceId != self.path :
					#skip the array element (if we didnt we would put array as currentForm but the next currentForm.getField(element) wouldn't work)
					#here we are skipping to the arrayFormId and incrementing (as the collectionPath was added to the forms list)
					instanceId += "." + elements[i + 1]
					if type.getBool("isArrayCollection"): 
						self.docPaths.append(instanceId)
					 
					currentForm = itemtype.ItemType(arrayFormId.getRef("."))
					self.itemTypes.append(currentForm)
					self.fieldTypes.append(currentForm.getCopy("."))
					i += 1 
				 
			elif type.getRef(".").endswith("standard.types.itemRelRef"): #equals(TypeReferences.REFERENCE)) {
				#REFERENCE TO TYPE
				pathToRef = ""
				for j in range(i + 1):
					pathToRef += elements[j] + "."
				
				pathToRef = pathToRef.substring(0, pathToRef.lastIndexOf("."))
				relPath = self.getRelPath(pathToRef)
				#type is in the instance.rs.k
				doc = self.getLastDoc()
				currentForm = itemtype.ItemType(doc.getRef(relPath))
	
				configgedType = type.getRef("configgedType")
				if configgedType is not None and configgedType != "" :
					if configgedType.indexOf("$reference.") == 0:
						configgedType = configgedType.replace("$reference.", "")
						typePath = currentForm.getRef(configgedType)
						if typePath is not None :
							currentForm = itemtype.ItemType(typePath)
						
					elif configgedType == "$reference" :
						pass	
					else:
						currentForm = itemtype.ItemType(configgedType)
				 
				self.itemTypes.append(currentForm)
				self.fieldTypes.append(currentForm.getCopy("."))
			else:
				currentForm = itemtype.ItemType(type.getRef("."))
				self.itemTypes.append(currentForm)
				self.fieldTypes.append(currentForm.getCopy("."))
			
			i += 1
		
	
	def getPath (self) :
		return self.path
	
	def getLastDoc (self) :
		return docmodel.DocModel.getDoc(self.getLastDocPath())
	
	def getDocPaths (self) :
		return self.docPaths
	
	def getLastDocPath (self) :
		return self.docPaths[len(self.docPaths) - 1]
	
	def getParentDocPath (self) :
		return self.docPaths[len(self.docPaths) - 2]
	
	def getLastFieldType (self) :
		return self.fieldTypes[len(self.fieldTypes) - 1]
	
	def getItemTypes (self) :
		return self.itemTypes
	
	def getParentItemType (self) :
		return self.itemTypes[len(self.itemTypes) - 2]
	
	def getLastItemType (self) :
		return self.itemTypes[len(self.itemTypes) - 1]
	
	def getRelPath (self, fullPath) :
		if fullPath is None :
			fullPath = self.getPath()
		
		return fullPath.replace(self.docPaths[len(self.docPaths) - 1], "").lstrip(".")
	
	def getItem (self) :
		relPath = self.getRelPath()
		doc = self.getLastDoc()
		if relPath != "" :
			return doc.get(relPath)
		else:
			return doc
		
	
