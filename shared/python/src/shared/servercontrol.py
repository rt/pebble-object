from pebbleobject import pebble
import pathanalyzer
import docmodel
import itemtype

class ServerControl(pebble.Pebble):

	def __init__(self, dm) :
		pebble.Pebble.__init__(self, dm)


	def executeMethod (self, sp, obj) :
		ret = 1;
		if sp == "doInit" :
			self.doInit(obj);
		elif sp == "getArrayItemDocument" :
			self.getArrayItemDocument(obj);
		elif sp == "doQuery" :
			self.doQuery(obj);
		elif sp == "getFunctions" :
			self.getFunctions(obj);
		elif sp == "getFields" :
			self.getFields(obj);
		elif sp == "addItem" :
			self.addItem(obj);
		elif sp == "updateItem" :
			self.updateItem(obj);
		elif sp == "deleteItem" :
			self.deleteItem(obj);
		elif sp == "doQueries" :
			self.doQueries(obj);
		return ret;
	
	def getArrayItemDocument (self, obj) :
		params = obj.getParams();
		relPath = params.getRef("relPath");
		collectionPath = params.getRef("collection");
	
		#check permissions
	
	
		doc = docmodel.DocModel.getDoc(collectionPath + "." + relPath);
	
		obj.set("arrayItem", doc);
	
	def doQuery (self, obj) :
	
		params = obj.getParams();
		query = params.get("query");
	
		if query is not None :
			collectionPath = query.getRef("path"); 
			collection = pathanalyzer.PathAnalyzer(collectionPath);
	
			collectionHoldingAppPath = collectionPath[:collectionPath.rfind(".")];
			arrayField = collectionPath[collectionPath.rfind(".") + 1:];
			collectionHoldingDoc = pathanalyzer.PathAnalyzer(collectionHoldingAppPath);
			collectionField = collectionHoldingDoc.getLastItemType().getField(arrayField);
	
			type = collectionField.get("type");
	
			if type.getBool("isArrayCollection") :
	
				s = self.getDocs(query);
				tmpDoc = pebble.Pebble("<i><rs>" + s + "</rs></i>");
				obj.set(".", tmpDoc); #base class add the rs so we know we can replace it 
	
			else:
	
				obj.set(".", collection.getItem());
	
	def getFunctions (self, obj) :
	
		params = obj.getParams();
		controlId = params.getRef("controlId");
	
		control = itemtype.ItemType(controlId);
		functions = control.getFunctions();
	
		obj.set(".", functions);
	
	def getFields (self, obj) :
	
		params = obj.getParams();
		typeId = params.getRef("typeId");
	
		control = itemtype.ItemType(typeId);
		fields = control.getFields();
	
		obj.set(".", fields);
	
	def doQueries (self, obj) :
		params = obj.getParams();
		queries = params.getRecords("queries");
	
		type = pebble.Pebble();
	#	type.setRef(".", pebble.shared.TypeReferences.ARRAY);
	#	type.setRef("arrayFormId", pebble.shared.TypeReferences.APP_INDEX_ITEM); #appIndexItem could be rename multipleQueryItem
	
		pn = pebble.Pebble(obj);
		#			pn.setNodeType(type);
		#			pn.setNodePath("MULTI_QUERIES");
		#			#obj.setTrue("ps.nodeInfo.retrieved"); #use retrieve later
	
		items = "";
		for query in queries:
	#		String collectionPath = query.getRef("path");
	#		CollectionInstance colInst = (CollectionInstance)ItemInstance.getServerInstance(collectionPath);
	
			#TODO: need a mapPath to appIndexItem.name, appIndexItem.ref is also required, or store together in different table...
	
			items += self.getDocs(query);
		
		tmpDoc = pebble.Pebble("<i><rs>" + items + "</rs></i>");
		pn.set(".", tmpDoc); #base class add the rs so we know we can replace it
	
	def getDocs (self, queryItem) :
	
		s = "";
		dt = docmodel.DocModel.getDatasource(queryItem.getRef("path")).doQuery(queryItem, None, None);
		for dr in dt:
			s += dr; 
		
		return s;
	
	def doInit (self, obj) :
		#set in request
		obj.set("user", obj.get("ps.user"));
		
	#called as collection 
	def addItem (self, obj) :
		params = obj.getParams();
		recItem = params.get("item");
		collectionPath = params.getRef("collection");
		displayControl = params.get("displayControl.control");
		if recItem is not None  :       
			typePath = displayControl.getRef(".");
			type = itemtype.ItemType(typePath);
			#Pebble layout = type.get("layout", true);
			#prunedItem = self.appInst.pruneItem(recItem, layout);
	
			uniqueName = recItem.getValue("username");
			if uniqueName is not None :
				recItem.setTagName(uniqueName);
	
			pathAnalyzer = pathanalyzer.PathAnalyzer(collectionPath);
			parentForm = pathAnalyzer.getParentItemType();
			collectionField = parentForm.getField(collectionPath[collectionPath.rfind(".") + 1:]);
			typeArrayMaps = collectionField.get("type.typeArrayMaps");
			recType = collectionField.getRef("type.arrayFormId");
			form = itemtype.ItemType(recType);
	
			doc = docmodel.DocModel.getDatasource(collectionPath).create(collectionPath, recItem, typeArrayMaps, form);
	
			pebble.set("appIndexItem", doc.get("appIndexItem"));
	
			#notify
	
	def updateItem (self, obj) :
		params = obj.getParams();
		recItem = params.get("item");
		itemPath = params.getRef("itemPath");
		collection = itemPath[:itemPath.rfind(".")];
		name = itemPath[itemPath.lastIndexOf(".") + 1:];
		displayControl = params.get("displayControl.control");
		if recItem is not None :
			pathAnalyzer = pathanalyzer.PathAnalyzer(itemPath);
	
			typePath = displayControl.getRef(".");
			type = itemtype.ItemType(typePath);
			#Pebble layout = type.get("layout", true);
			#prunedItem = self.appInst.pruneItem(recItem, layout);
	
	#		ArrayList<Pebble> items = prunedItem.getRecords(".");
	#		for (Pebble item : items) {
	#		String meta;
	#		if path is not None :
	#		meta = path + "." + item.getMetaId();
	#		else:
	#		meta = item.getMetaId();
	#		}
	#		obj.set(meta, item);
	#		}
	
			relPath = pathAnalyzer.getRelPath();
			o = pathAnalyzer.getLastDoc();
			o.set(relPath, recItem);
	
			pa = pathanalyzer.PathAnalyzer(collection);
			typeArrayMaps = pa.getLastFieldType().get("typeArrayMaps");
			arrayForm = pa.getLastFieldType().get("arrayFormId");
	
			docmodel.DocModel.getDatasource(collection).update(collection, name, o, typeArrayMaps, itemtype.ItemType(arrayForm.getRef(".")));
	
	
			#TODO: pebble.set("appIndexItem", appIndexItem);
	
	def deleteItem (self, obj) :
		params = obj.getParams();
		appPath = params.getRef("appPath");
	
