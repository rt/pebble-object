package com.pebblefields.shared;

import java.io.Serializable;
import java.util.List;

import org.pebblefields.pebbleobject.Pebble;
import com.pebblefields.shared.interfaces.HandlesDataEvents;


/**
 * @author ken
 */
public class ServerControl extends Pebble implements Serializable{
	static public HandlesDataEvents handlesDataEvents;
	
	public ServerControl(Pebble dm) {
		super(dm);
	}
		
	public int executeMethod(String sp, Pebble pebble) {
		int ret = 1;
		if (sp.equals("doInit")) {
			this.doInit(pebble);
		} else if (sp.equals("getArrayItemDocument")) {
			this.getArrayItemDocument(pebble);
		} else if (sp.equals("doQuery")) {
			this.doQuery(pebble);
		} else if (sp.equals("getFunctions")) {
			this.getFunctions(pebble);
		} else if (sp.equals("getFields")) {
			this.getFields(pebble);
		} else if (sp.equals("addItem")) {
			this.addItem(pebble);
		} else if (sp.equals("updateItem")) {
			this.updateItem(pebble);
		} else if (sp.equals("deleteItem")) {
			this.deleteItem(pebble);
		} else if (sp.equals("doQueries")) {
			this.doQueries(pebble);
		}
      return ret;
	}
	
	private void getArrayItemDocument(Pebble obj) {
		Pebble params = obj.getParams();
		String relPath = params.getRef("relPath");
		String collectionPath = params.getRef("collection");
		
		//check permissions
//		String collectionHoldingAppPath = collectionPath.substring(0, collectionPath.lastIndexOf("."));
//		String arrayField = collectionPath.substring(collectionPath.lastIndexOf(".") + 1);
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
	private void doQuery(Pebble obj) {
		
		Pebble params = obj.getParams();
		Pebble query = params.get("query");

		if (query != null) {
			String collectionPath = query.getRef("path"); 
			PathAnalyzer collection = new PathAnalyzer(collectionPath);
			
			String collectionHoldingAppPath = collectionPath.substring(0, collectionPath.lastIndexOf("."));
			String arrayField = collectionPath.substring(collectionPath.lastIndexOf(".") + 1);
			PathAnalyzer collectionHoldingDoc = new PathAnalyzer(collectionHoldingAppPath);
			Pebble collectionField = collectionHoldingDoc.getLastItemType().getField(arrayField);

			Pebble type = collectionField.get("type");
			
			if (type.getBool("isArrayCollection")) {
				
				Pebble tmpDoc = new Pebble("<i><rs>" + getDocs(query) + "</rs></i>");
				obj.set(".", tmpDoc); //base class add the rs so we know we can replace it 
				
			} else {
				
				obj.set(".", collection.getItem());
				
			}
		}
	}
	private void getFunctions(Pebble obj) {
		
		Pebble params = obj.getParams();
		String controlId = params.getRef("controlId");

		ItemType control = new ItemType(controlId);
		Pebble functions = control.getFunctions();
		
		obj.set(".", functions);
		
	}
	private void getFields(Pebble obj) {
		
		Pebble params = obj.getParams();
		String typeId = params.getRef("typeId");

		ItemType control = new ItemType(typeId);
		Pebble fields = control.getFields();
		
		obj.set(".", fields);
		
	}

	private void doQueries(Pebble pebble) {
		Pebble params = pebble.getParams();
		List<Pebble> queries = params.getRecords("queries");

		Pebble type = new Pebble();
		type.setRef(".", TypeReferences.ARRAY);
		type.setRef("arrayFormId", TypeReferences.APP_INDEX_ITEM); //appIndexItem could be rename multipleQueryItem

		Pebble pn = new Pebble(pebble);
		//			pn.setNodeType(type);
		//			pn.setNodePath("MULTI_QUERIES");
		//			//pebble.setTrue("ps.nodeInfo.retrieved"); //use retrieve later

		String items = "";
		for (Pebble query : queries) {
//			String collectionPath = query.getRef("path");
//			CollectionInstance colInst = (CollectionInstance)ItemInstance.getServerInstance(collectionPath);

			//TODO: need a mapPath to appIndexItem.name, appIndexItem.ref is also required, or store together in different table...

			items += getDocs(query);
		}
		Pebble tmpDoc = new Pebble("<i><rs>" + items + "</rs></i>");
		pn.set(".", tmpDoc); //base class add the rs so we know we can replace it
	}	
	private String getDocs(Pebble queryItem) {
		
		String s = "";
		//List<String> dt = DocModel.getDatasource(queryItem.getRef("path")).doQuery(queryItem, null, null);
		//List<String> dt = DocModel.getDatasource().doQuery(queryItem, null, null);
		List<String> dt = DocModel.getDatasource().doQuery(queryItem);
		for (String dr : dt) {
			s += dr; //appIndexItem
		}
		return s;
	}
	 public void doInit(Pebble obj) {
		//set in request 
		Pebble user = obj.get("ps.user");
		obj.set("user", user);
		
	}
	//called as collection                      
    private void addItem(Pebble obj) {
    	Pebble params = obj.getParams();
        Pebble recItem = params.get("item");
        String collectionPath = params.getRef("collection");
        Pebble displayControl = params.get("displayControl.control");
        if (recItem != null ) {       
            String typePath = displayControl.getRef(".");
    		ItemType type = new ItemType(typePath);
    		//Pebble layout = type.get("layout", true);
    		//prunedItem = this.appInst.pruneItem(recItem, layout);
    				
    		String uniqueName = recItem.getValue("username");
            if (uniqueName != null) {
            	recItem.setTagName(uniqueName);
            }
            
            PathAnalyzer pathAnalyzer = new PathAnalyzer(collectionPath);
            ItemType parentForm = pathAnalyzer.getParentItemType();
            Pebble collectionField = parentForm.getField(collectionPath.substring(collectionPath.lastIndexOf(".") + 1));
            Pebble typeArrayMaps = collectionField.get("type.typeArrayMaps");
            String recType = collectionField.getRef("type.arrayFormId");
            ItemType form = new ItemType(recType);
            
            //Pebble doc = DocModel.getDatasource().create(collectionPath, recItem, typeArrayMaps, form);
            Pebble doc = DocModel.getDatasource().create(collectionPath, recItem);
            
            obj.set("appIndexItem", doc.get("ps.appIndexItem"));
            
            //notify
        }
    }
    
	/**
	 * Update any item instance data on the server 
	 * @param obj
	 */
	private void updateItem(Pebble obj) {
		Pebble params = obj.getParams();
        Pebble recItem = params.get("item");
        String itemPath = params.getRef("itemPath");
        String rPath = params.getRef("relPath");
        String collection = itemPath.substring(0, itemPath.lastIndexOf("."));
		String name = itemPath.substring(itemPath.lastIndexOf(".") + 1);
        Pebble displayControl = params.get("displayControl.control");
        if (recItem != null) {
        	PathAnalyzer pathAnalyzer = new PathAnalyzer(itemPath);
        	
        	String typePath = displayControl.getRef(".");
    		ItemType type = new ItemType(typePath);
    		//Pebble layout = type.get("layout", true);
    		//prunedItem = this.appInst.pruneItem(recItem, layout);
    		    		
//    		ArrayList<Pebble> items = prunedItem.getRecords(".");
//    		for (Pebble item : items) {
//    			String meta;
//    			if (path != null) {
//    				meta = path + "." + item.getMetaId();
//    			} else {
//    				meta = item.getMetaId();
//    			}
//    			obj.set(meta, item);
//    		}
    		
    		String relPath = pathAnalyzer.getRelPath();
    		Pebble obj1 = pathAnalyzer.getLastDoc();
    		obj1.set(relPath, recItem);
    		
    		PathAnalyzer pa = new PathAnalyzer(collection);
    		Pebble typeArrayMaps = pa.getLastFieldType().get("typeArrayMaps");
    		Pebble arrayForm = pa.getLastFieldType().get("arrayFormId");
    		
            //DocModel.getDatasource().update(collection, name, obj1, typeArrayMaps, new ItemType(arrayForm.getRef(".")));
    		DocModel.getDatasource().update(collection, name, obj1);
    		
    		String bPath = itemPath.replace("theInstance.theControlApp", "theControlItem");
    		String userId = obj.getRef("ps.user.id");
    		ServerControl.handlesDataEvents.notifyDataChange(recItem, bPath + "." + rPath, userId);         
    		
    		//TODO: pebble.set("appIndexItem", appIndexItem);
        }
    } 
	private void deleteItem(Pebble pebble) {
		Pebble params = pebble.getParams();
		String appPath = params.getRef("appPath");


		//	    	DocInstance app = (DocInstance)ItemInstance.getServerInstance(appPath, DocModel.UNAUTHORIZED_USER);
		//	    	app.deleteApp();
	}

	
	
	
}
