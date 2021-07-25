
class Pebble(object):
	
	count = 0
	dataSourceFactory = None

	def __init__(self, o=None):
		object.__init__(self)
		if o is None :
			self.setId()
			self.xml = Pebble.dataSourceFactory.getNewInstance()
		elif isinstance(o, basestring):
			self.setId()
			self.xml = Pebble.dataSourceFactory.getNewInstance(o)
		elif isinstance(o, Pebble) :
			self.setId()
			self.xml = o.xml
		elif isinstance(o, object):
			self.setId()
			self.xml = o

		self.fn = None

	def setId (self):
		Pebble.count += 1
		self.id = Pebble.count
	
	def get (self, key):
		node = self.getNode(key, False, False)
		if node is not None :
			return Pebble(node)
		else: 
			return None
	
	def getCreateOnNull (self, key):
		node = self.getNode(key, False, True)
		return Pebble(node)
	
	def getCopy (self, key):
		node = self.getNode(key, True, False)
		if node is not None :
			return Pebble(node)
		else: 
			return None
	
	def getCopyCreateOnNull (self, key):
		node = self.getNode(key, True, True)
		if node is not None :
			return Pebble(node)
		else:
			return None
	
	def getNode (self, key, isCopy, createOnNull):
		node = self.xml.getDataSource(key)
		if node is None and createOnNull :
			self.xml.setRecordSet(key, Pebble.dataSourceFactory.getNewInstance(), False)
			node = self.xml.getDataSource(key)
		
		if node is not None :
			if isCopy :
				return node.getCopyInstance()
			else :
				return node
		
		return None
	
	def getRecords (self, path):
		recs = []
		rs = self.xml.getRecords(path)
		if rs is not None :
			for childNode in rs:
				recs.append(Pebble(childNode))
		return recs
	
	def set (self, path, obj):
		if obj is not None :
			self.xml.setRecordSet(path, obj.xml, False) 
		else :
			self.remove(path)
	
	def setFull (self, path, obj):
		if obj != None :
			self.xml.setRecordSet(path, obj.xml, True);
		else :
			self.remove(path);
	
	def remove (self, path):
		return Pebble(self.xml.remove(path));
	
	def getValue (self, key):
		return self.xml.getValue(key);
	
	def setValue (self, path, val):
		if val is not None :
			self.xml.setValue(path, val);
		else :
			self.remove(path);
	
	def setMarkup (self, path, val):
		if val is not None :
			self.xml.setMarkup(path, val);
		else :
			self.remove(path);
	
	def getBool (self, key):
		val = self.xml.getValue(key);
		if val is not None :
			#val = val.trim();
			return val == "true";
		else :
			return False;
	
	def getInt (self, key):
		val = self.xml.getValue(key);
		if val is not None :
			return int(val);#.trim()); 
		else :
			return None;
	
	def getFloat (self, key):
		val = self.xml.getValue(key);
		if val is not None :
			return float(val);#.trim());
		else :
			return None;
	
	def setTrue (self, path):
		self.setValue(path, "true");
	
	def removeSpaces (self):
		self.xml.removeSpaces();
	
	def getTagName (self):
		return self.xml.getTagName(); 
	
	def setTagName (self, val):
		pass
	
	#--- reference implementation uses "ref" ---
	def getRef (self, path):
		return self.xml.getRecordSetAttribute(path, "ref");
	
	def setRef (self, path, val):
		if val is not None :
			self.xml.setRecordSetAttribute(path, val, "ref");
		else :
			self.xml.removeRecordSetAttribute(path, "ref");
	
	#ARRAY (start)
	def insertBefore (self, newPeb, targetPath):
		self.xml.insertBefore(newPeb.xml, targetPath);
	
	def getIndex (self, path, name):
		return self.xml.getIndex(path, name);
	
	def getByIndex (self, path, index):
		node = self.xml.getByIndex(path, index);
		if node is not None :
			return Pebble(node);
		return None;
	
	#note: copies full i (ps and rs)
	def add2Array (self, path, obj, forceName=None):
		if forceName is not None:
			name = forceName
		else:
			name = self.getArrayName(path, "a")
		return self._add2Array(path, obj, name);
	
	def add2ArrayUsePrefix (self, path, obj, prefix):
		return self._add2Array(path, obj, self.getArrayName(path, prefix));
	
	def _add2Array (self, path, obj, name):
		self.xml.add2Array(path, obj.xml, name);
		return self.get(path + "." + name);
	
	def getArrayName (self, path, prefix):
		metaArrayName = "";
		name = 0
		found = False
		while not found:
			metaArrayName = prefix + str(name);
			if not self.hasName(path, metaArrayName):
				return metaArrayName;
			else:
				name = name + 1
		return None;
	
	def hasName (self, path, name):
		recs = self.getRecords(path);
		for rec in recs:
			if (rec.getTagName() == name):
				return True;
		return False;
	
	def loadFile (self, path):
		self.xml.loadFile(path);
	
	def toString (self):
		return self.xml.toString();
	
	
	def setCallback (self, cb) : 
		self.fn = cb;
	
	def getCallback (self) :
		return self.fn;
	
	def callback (self, data) :
		if self.fn is not None :
			if data is None :
				self.fn(self); #not sure if self is being used... fn(None)??
			else:
				self.fn(data);
	
	def voidFunc2ReturnFunc (self, path) :
		#create a generator object 
		func = self.get(path);
		return PebbleExecutable._voidFunc2ReturnFunc(func);
	
	def getParams (self) :
		return self.getCreateOnNull("ps.rgFunction.rg");
	
	
	
	@classmethod	
	def _voidFunc2ReturnFunc (cls, func) :
		genObj = PebbleExecutable();
		if func is not None :
			genObj.set("ps.rgFunction.rg", func.get("voidrg"));
		return genObj;
	
	@classmethod
	def setDataSourceFactory(cls, pebbleDataSource):
		Pebble.dataSourceFactory = pebbleDataSource;
	
	
