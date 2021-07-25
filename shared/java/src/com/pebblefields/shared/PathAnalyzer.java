package com.pebblefields.shared;

import java.util.ArrayList;
import java.util.List;

import org.pebblefields.pebbleobject.Pebble;
import com.pebblefields.shared.interfaces.IServerData;



/**
 * PathAnalyzer gets infomation about the path 
 * @author Ryan Tsunoda
 *
 */
public class PathAnalyzer {
	private String path;
	private List<ItemType> itemTypes;				//the ItemType(typePath) so that getField, getAppIndex can be used
	private List<Pebble> fieldTypes;    			//the types as in their parent definition (field.type)
	private List<String> docPaths;					//list of doc paths (non doc members are skipped), only useful for the last one
	
	
	
	public PathAnalyzer(String appPath) {
		this.path = appPath;
		this.itemTypes = new ArrayList<ItemType>();    
		this.fieldTypes = new ArrayList<Pebble>();	
		this.docPaths = new ArrayList<String>();
		this.initComponents();
	}
	/**
	 * Set forms, docPaths
	 */
	private void initComponents() {

		String[] elements = this.path.split("\\.");
		String element = elements[0];
		Pebble top = DocModel.getDoc(element);//get top app
		this.docPaths.add(element);
		ItemType currentForm = new ItemType(TypeReferences.INDEX_ITEM);//top.getFormKey());
		
		this.itemTypes.add(currentForm);
		this.fieldTypes.add(currentForm.getCopy("."));
		
		int i = 1;
		while (i < elements.length) {
			element = elements[i];
			Pebble field = currentForm.getField(element);
			Pebble type = field.get("type");
			
			//ARRAY
			if (type.getRef(".").endsWith("standard.types.array")) { //.equals(TypeReferences.ARRAY)) {
				Pebble arrayFormId = type.get("arrayFormId");
				String instanceId = "";

				for (int j = 0; j < i + 1; j++) {
					instanceId += elements[j] + ".";
				}
				instanceId = PebbleUtils.rStrip(instanceId, ".");
				this.itemTypes.add(new ItemType(type.getRef("."))); 
				this.fieldTypes.add(type);

				if (!instanceId.equals(this.path)) {
					//skip the array element (if we didnt we would put array as currentForm but the next currentForm.getField(element) wouldn't work)
					//here we are skipping to the arrayFormId and incrementing (as the collectionPath was added to the forms list)
					instanceId += "." + elements[i + 1];
					if (type.getBool("isArrayCollection")){ 
						this.docPaths.add(instanceId);
					} 
					currentForm = new ItemType(arrayFormId.getRef("."));
					this.itemTypes.add(currentForm);
					this.fieldTypes.add(currentForm.getCopy("."));
					i += 1; 
				} 
			} else if (type.getRef(".").endsWith("standard.types.itemRelRef")){ //equals(TypeReferences.REFERENCE)) {
				//REFERENCE TO TYPE
				String pathToRef = "";
				for (int j = 0; j <= i; j++) {
					pathToRef += elements[j] + ".";
				}
				pathToRef = pathToRef.substring(0, pathToRef.lastIndexOf("."));
				String relPath = this.getRelPath(pathToRef);
				//type is in the instance.rs.k
				Pebble doc = this.getLastDoc();
				currentForm = new ItemType(doc.getRef(relPath));
				
				String configgedType = type.getRef("configgedType");
				if (configgedType != null && !configgedType.isEmpty()) {
					if (configgedType.startsWith("$reference.")){
						configgedType = configgedType.replace("$reference.", "");
						String typePath = currentForm.getRef(configgedType);
						if (typePath != null) {
							currentForm = new ItemType(typePath);
						}
					} else if (configgedType.equals("$reference")) {
						
					} else {
						currentForm = new ItemType(configgedType);
					}
				} 
				this.itemTypes.add(currentForm);
				this.fieldTypes.add(currentForm.getCopy("."));
			} else {
				currentForm = new ItemType(type.getRef("."));
				this.itemTypes.add(currentForm);
				this.fieldTypes.add(currentForm.getCopy("."));
			}
			i += 1;
		}
	}
	public String getPath() {
		return this.path;
	}
	public Pebble getLastDoc() {
		return DocModel.getDoc(this.getLastDocPath());
	}
	public List<String> getDocPaths() {
		return this.docPaths;
	}
	public String getLastDocPath() {
		return this.docPaths.get(this.docPaths.size() - 1);
	}
	public String getParentDocPath() {
		return this.docPaths.get(this.docPaths.size() - 2);
	}
	public Pebble getLastFieldType() {
		return this.fieldTypes.get(this.fieldTypes.size() - 1);
	}
	public List<ItemType> getItemTypes() {
		return this.itemTypes;
	}
	public ItemType getParentItemType() {
		return this.itemTypes.get(this.itemTypes.size() - 2);
	}
	public ItemType getLastItemType() {
		return this.itemTypes.get(this.itemTypes.size() - 1);
	}
	public String getRelPath() {
		return this.getRelPath(this.getPath());
	}
	public String getRelPath(String fullPath) {
		return PebbleUtils.lStrip(fullPath.replace(this.docPaths.get(this.docPaths.size() - 1), ""), ".");
	}
	public Pebble getItem() {
		String relPath = this.getRelPath();
		Pebble doc = this.getLastDoc();
		if (!relPath.isEmpty()) {
			return doc.get(relPath);
		} else {
			return doc;
		}
	}
	/**
	 * 
	 * @param actual
	 * @param pathMatch (spec for matching aaa.bbb.*.
	 * @return
	 */
	public static boolean comparePath(String actual, String pathMatch) {
		actual = actual.trim();
		pathMatch = pathMatch.trim();
		String[] actualElements = actual.split("\\.");
		String[] pathMatchElements = pathMatch.split("\\.");
		if (actualElements.length == pathMatchElements.length) {
			for (int i = 0; i < pathMatchElements.length; i++) {
				String match = pathMatchElements[i];
				String act = actualElements[i];
				if (match.equals(act) || match.equals("*")) {
					continue;
				} else {
					return false;
				}
			}
			//if gets here all elements matched
			return true;
		} else {
			return false;
		}
		
	}
}
