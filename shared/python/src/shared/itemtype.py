from pebbleobject import pebble

class ItemType (pebble.Pebble):# HasInfoForAutoCrud 
	
	def __init__(self, path, config=None): 
		pebble.Pebble.__init__(self, DocModel.getDoc(path)) 
		self.key = path
		self.config = config
			
	def getFields(self):
		return self.getInheritMember("fields")
	
	def getFunctions (self):
		return self.getInheritMember_Docs("functions")
		
	#fields, functions, typeMaps only
	def getInheritMember(self, member): 
		inheritMember = self.getCreateOnNull(member)
		inherits = self.getRef("inherits")
		if inherits is not None: 
			_base = ItemType(inherits)
			baseInheritMembers = _base.getInheritMember(member)
			for baseInheritMember in baseInheritMembers.getRecords("."):
				inheritMember.set(baseInheritMember.getTagName(), baseInheritMember)
					
		return inheritMember
		
	def getInheritMember_Docs(self, member):
		inheritMember = pebble.Pebble()

		queryItem = pebble.Pebble()
		collectionPath = self.key + "." + member
		queryItem.setRef("path", collectionPath)
		appIndexes = DocModel.getDatasource().doQuery(queryItem)
		for child in appIndexes: 
			childPeb = pebble.Pebble(child)
			inheritMember.setFull(childPeb.getTagName(), childPeb)#need to have uniques!!!

			#even though we show all together, we need to show where it actually resides
			inheritMember.setRef(childPeb.getTagName() + ".ps.memberBaseCollection", self.key + "." + member) 
		

		inherits = self.getRef("inherits")
		if inherits is not None: 
		
			_base = ItemType(inherits)
			baseInheritMembers = _base.getInheritMember_Docs(member)
			for baseInheritMember in baseInheritMembers.getRecords("."):
				inheritMember.setFull(baseInheritMember.getTagName(), baseInheritMember)
		
		return inheritMember
		

	def getField(self, fieldName):
		fields = self.getFields()
		return fields.get(fieldName)


	def	getInnerType(self, relPath, instanceRefs):
		if relPath != "": 
			return self._getInnerType(relPath, instanceRefs)
		else:
			return self

	def _getInnerType(self, relPath, instanceRefs):

		field = self.getInnerField(relPath, instanceRefs)
		if field is not None: 
			return field.get("type")
		
		return None
				
	def getInnerField(self, relPath, instanceRefs):

		if relPath.startswith("."):
			relPath = relPath[1:]
		
		elements = relPath.split('.')
		firstMember = elements[0]
		firstMemberField = self.getFields().get(firstMember)
		if firstMemberField is not None: 
			nextType = firstMemberField.get("type")
			if elements.Length > 1: 
				#do again
				nextTypeStr = nextType.getRef(".")
				nextInstanceRefs = None
				nextRelPath = ""

				#if this is reference
				obj = None
				if nextTypeStr == TypeReferences.REFERENCE:

					#configged
					#string configMeta = firstMemberField.getValue("type.configMeta")
					nextTypeStr = instanceRefs.getRef(firstMember)
					obj = ItemType(nextTypeStr)

					configgedType = nextType.getRef("configgedType")
					if configgedType is not None and configgedType != "": 
						if configgedType.startswith("$reference."):
							configgedType = configgedType.replace("$reference.", "")
							configType = obj.getRef(configgedType)
							if configType is not None: 
								obj = ItemType(configType)
						elif configgedType == "$reference":
							pass
					else:
						pass
						
					nextRelPath = relPath[relPath.find(".") + 1:]
					if instanceRefs is None: 
						nextInstanceRefs = None
					else:
						nextInstanceRefs = instanceRefs.get(firstMember)

				elif nextTypeStr == TypeReferences.ARRAY: 

					arrayFormId = firstMemberField.getRef("type.arrayFormId")
					if arrayFormId is not None: 
						nextRelPath = relPath[relPath.find(".") + 1:]
						nextRelPath = nextRelPath[nextRelPath.find(".") + 1:] #advance it twice
						nextTypeStr = arrayFormId
						if instanceRefs is None: 
							nextInstanceRefs = None
						else:
							nextInstanceRefs = instanceRefs.get(firstMember + "." + elements[1])  #advance it twice
						
					else:
						#why doesnt it have an arrayFormId????
						ii = 1
					
					obj = ItemType(nextTypeStr)
				else:
					nextRelPath = relPath[relPath.find(".") + 1:]
					if instanceRefs == None: 
						nextInstanceRefs = None
					else:
						nextInstanceRefs = instanceRefs.get(firstMember)
					
					obj = ItemType(nextTypeStr)

				return obj.getInnerField(nextRelPath, nextInstanceRefs)

			else:
				#return type
				return firstMemberField
			 
		else:
			#if not defined field, should show error ...
			return None
