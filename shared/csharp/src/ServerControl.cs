
using System.Collections.Generic;
using PebbleFields.Shared.Interfaces;
using PebbleFields.PebbleObject;

namespace PebbleFields.Shared
{
	/**
	 * @author ken
	 */
	public class ServerControl : Pebble {
		static public HandlesDataEvents handlesDataEvents;

		public ServerControl(Pebble dm) : base(dm) 
		{
		}

		new public int executeMethod(string sp, Pebble pebble) 
		{
			int ret = 1;
			if (sp == "doInit") 
			{
				this.doInit(pebble);
			} else if (sp == "getArrayItemDocument") 
			{
				this.getArrayItemDocument(pebble);
			} else if (sp == "doQuery") 
			{
				this.doQuery(pebble);
			} else if (sp == "getFunctions") 
			{
				this.getFunctions(pebble);
			} else if (sp == "getFields") 
			{
				this.getFields(pebble);
			} else if (sp == "addItem") 
			{
				this.addItem(pebble);
			} else if (sp == "updateItem") 
			{
				this.updateItem(pebble);
			} else if (sp == "deleteItem") 
			{
				this.deleteItem(pebble);
			} else if (sp == "doQueries") 
			{
				this.doQueries(pebble);
			}
			return ret;
		}

		private void getArrayItemDocument(Pebble obj) 
		{
			Pebble _params = obj.getParams();
			string relPath = _params.getRef("relPath");
			string collectionPath = _params.getRef("collection");

			//check permissions
			//		string collectionHoldingAppPath = collectionPath.Substring(0, collectionPath.LastIndexOf("."));
			//		string arrayField = collectionPath.Substring(collectionPath.LastIndexOf(".") + 1);
			//		PathAnalyzer collectionHoldingDoc = new PathAnalyzer(collectionHoldingAppPath);
			//		Pebble collectionField = collectionHoldingDoc.getLastItemType().getField(arrayField);
			//		
			//		Pebble security = collectionField.get("security");


			Pebble doc = DocModel.getDoc(collectionPath + "." + relPath);

			obj.set("arrayItem", doc);

		} 
		/**
		 * Queries always query a path
		 * Return itemIndexes or appIndexes (appIndexes tell the client side to load as a app)
		 */
		private void doQuery(Pebble obj) 
		{

			Pebble _params = obj.getParams();
			Pebble query = _params.get("query");

			if (query != null) 
			{
				string collectionPath = query.getRef("path"); 
				PathAnalyzer collection = new PathAnalyzer(collectionPath);

				string collectionHoldingAppPath = collectionPath.Substring(0, collectionPath.LastIndexOf("."));
				string arrayField = collectionPath.Substring(collectionPath.LastIndexOf(".") + 1);
				PathAnalyzer collectionHoldingDoc = new PathAnalyzer(collectionHoldingAppPath);
				Pebble collectionField = collectionHoldingDoc.getLastItemType().getField(arrayField);

				Pebble type = collectionField.get("type");

				if (type.getBool("isArrayCollection")) 
				{

					Pebble tmpDoc = new Pebble("<i><rs>" + getDocs(query) + "</rs></i>");
					obj.set(".", tmpDoc); //base class add the rs so we know we can replace it 

				} else {

					obj.set(".", collection.getItem());

				}
			}
		}
		private void getFunctions(Pebble obj) 
		{

			Pebble _params = obj.getParams();
			string controlId = _params.getRef("controlId");

			ItemType control = new ItemType(controlId);
			Pebble functions = control.getFunctions();

			obj.set(".", functions);

		}
		private void getFields(Pebble obj) 
		{

			Pebble _params = obj.getParams();
			string typeId = _params.getRef("typeId");

			ItemType control = new ItemType(typeId);
			Pebble fields = control.getFields();

			obj.set(".", fields);

		}

		private void doQueries(Pebble pebble) 
		{
			Pebble _params = pebble.getParams();
			List<Pebble> queries = _params.getRecords("queries");

			Pebble type = new Pebble();
			type.setRef(".", TypeReferences.ARRAY);
			type.setRef("arrayFormId", TypeReferences.APP_INDEX_ITEM); //appIndexItem could be rename multipleQueryItem

			Pebble pn = new Pebble(pebble);
			//			pn.setNodeType(type);
			//			pn.setNodePath("MULTI_QUERIES");
			//			//pebble.setTrue("ps.nodeInfo.retrieved"); //use retrieve later

			string items = "";
			foreach (Pebble query in queries) 
			{
				//			string collectionPath = query.getRef("path");
				//			CollectionInstance colInst = (CollectionInstance)ItemInstance.getServerInstance(collectionPath);

				//TODO: need a mapPath to appIndexItem.name, appIndexItem.ref is also required, or store together in different table...

				items += getDocs(query);
			}
			Pebble tmpDoc = new Pebble("<i><rs>" + items + "</rs></i>");
			pn.set(".", tmpDoc); //base class add the rs so we know we can replace it
		}	
		private string getDocs(Pebble queryItem) 
		{

			string s = "";
			List<string> dt = DocModel.getDatasource(queryItem.getRef("path")).doQuery(queryItem, null, null);
			foreach (string dr in dt) 
			{
				s += dr; //appIndexItem
			}
			return s;
		}
		public void doInit(Pebble obj) 
		{
			//set in request 
			Pebble user = obj.get("ps.user");
			obj.set("user", user);

		}
		//called as collection                      
		private void addItem(Pebble obj) 
		{
			Pebble _params = obj.getParams();
			Pebble recItem = _params.get("item");
			string collectionPath = _params.getRef("collection");
			Pebble displayControl = _params.get("displayControl.control");
			if (recItem != null ) 
			{       
				string typePath = displayControl.getRef(".");
				ItemType type = new ItemType(typePath);
				//Pebble layout = type.get("layout", true);
				//prunedItem = this.appInst.pruneItem(recItem, layout);

				string uniqueName = recItem.getValue("username");
				if (uniqueName != null) 
				{
					recItem.setTagName(uniqueName);
				}

				PathAnalyzer pathAnalyzer = new PathAnalyzer(collectionPath);
				ItemType parentForm = pathAnalyzer.getParentItemType();
				Pebble collectionField = parentForm.getField(collectionPath.Substring(collectionPath.LastIndexOf(".") + 1));
				Pebble typeArrayMaps = collectionField.get("type.typeArrayMaps");
				string recType = collectionField.getRef("type.arrayFormId");
				ItemType form = new ItemType(recType);

				Pebble doc = DocModel.getDatasource(collectionPath).create(collectionPath, recItem, typeArrayMaps, form);

				obj.set("appIndexItem", doc.get("ps.appIndexItem"));

				//notify
			}
		}

		/**
		 * Update any item instance data on the server 
		 * @param obj
		 */
		private void updateItem(Pebble obj) 
		{
			Pebble _params = obj.getParams();
			Pebble recItem = _params.get("item");
			string itemPath = _params.getRef("itemPath");
			string rPath = _params.getRef("relPath");
			string collection = itemPath.Substring(0, itemPath.LastIndexOf("."));
			string name = itemPath.Substring(itemPath.LastIndexOf(".") + 1);
			Pebble displayControl = _params.get("displayControl.control");
			if (recItem != null) 
			{
				PathAnalyzer pathAnalyzer = new PathAnalyzer(itemPath);

				string typePath = displayControl.getRef(".");
				ItemType type = new ItemType(typePath);
				//Pebble layout = type.get("layout", true);
				//prunedItem = this.appInst.pruneItem(recItem, layout);

				//    		List<Pebble> items = prunedItem.getRecords(".");
				//    		foreach (Pebble item in items) 
				//    		{
				//    			string meta;
				//    			if (path != null) 
				//    			{
				//    				meta = path + "." + item.getMetaId();
				//    			} else {
				//    				meta = item.getMetaId();
				//    			}
				//    			obj.set(meta, item);
				//    		}

				string relPath = pathAnalyzer.getRelPath();
				Pebble obj1 = pathAnalyzer.getLastDoc();
				obj1.set(relPath, recItem);

				PathAnalyzer pa = new PathAnalyzer(collection);
				Pebble typeArrayMaps = pa.getLastFieldType().get("typeArrayMaps");
				Pebble arrayForm = pa.getLastFieldType().get("arrayFormId");

				DocModel.getDatasource(collection).update(collection, name, obj1, typeArrayMaps, new ItemType(arrayForm.getRef(".")));

				string bPath = itemPath.Replace("theInstance.theControlApp", "theControlItem");
				string userId = obj.getRef("ps.user.id");
				ServerControl.handlesDataEvents.notifyDataChange(recItem, bPath + "." + rPath, userId);         

				//TODO: pebble.set("appIndexItem", appIndexItem);
			}
		} 
		private void deleteItem(Pebble pebble) 
		{
			Pebble _params = pebble.getParams();
			string appPath = _params.getRef("appPath");


			//	    	DocInstance app = (DocInstance)ItemInstance.getServerInstance(appPath, DocModel.UNAUTHORIZED_USER);
			//	    	app.deleteApp();
		}




	}
}
