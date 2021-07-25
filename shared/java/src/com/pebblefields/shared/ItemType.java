package com.pebblefields.shared;

import java.io.Serializable;
import java.util.List;

import org.pebblefields.pebbleobject.Pebble;

/**
 * @author ken
 */
public class ItemType extends Pebble implements Serializable{
	public String key;
	public Pebble config;
	public ItemType(String path) {
		super(DocModel.getDoc(path));
        this.key = path;
    }
	public ItemType(String path, Pebble config) {
		super(DocModel.getDoc(path));
        this.key = path;
        
        this.config = config;
	}
	public Pebble getFields() {
    	return this.getInheritMember("fields");
    }
    public Pebble getFunctions () {
    	return this.getInheritMember_Docs("functions");
    }
    //fields, functions, typeMaps only
    private Pebble getInheritMember(String member) {
    	Pebble inheritMember = this.getCreateOnNull(member);
    	String inherits = this.getRef("inherits");
    	if (inherits != null) {
    		ItemType base = new ItemType(inherits);
    		Pebble baseInheritMembers = base.getInheritMember(member);
    		for (Pebble baseInheritMember : baseInheritMembers.getRecords(".")){
    			inheritMember.set(baseInheritMember.getTagName(), baseInheritMember);
    		}
    	}
    	return inheritMember;
    }
    public Pebble getInheritMember_Docs(String member) {
    	Pebble inheritMember = new Pebble();
    	
    	Pebble queryItem = new Pebble();
    	String collectionPath = this.key + "." + member;
		queryItem.setRef("path", collectionPath);
		List<String> appIndexes = DocModel.getDatasource().doQuery(queryItem);
		for (String child : appIndexes) {
			Pebble childPeb = new Pebble(child);
			inheritMember.setFull(childPeb.getTagName(), childPeb);//need to have uniques!!!
			
			//even though we show all together, we need to show where it actually resides
			inheritMember.setRef(childPeb.getTagName() + ".ps.memberBaseCollection", this.key + "." + member); 
		}
    	
    	String inherits = this.getRef("inherits");
    	if (inherits != null) {
    		ItemType base = new ItemType(inherits);
    		Pebble baseInheritMembers = base.getInheritMember_Docs(member);
    		for (Pebble baseInheritMember : baseInheritMembers.getRecords(".")){
    			inheritMember.setFull(baseInheritMember.getTagName(), baseInheritMember);
    		}
    	}
    	return inheritMember;
    }

    public Pebble getField(String fieldName){
    	Pebble fields = this.getFields();
        return fields.get(fieldName);
    }
    
    public Pebble getInnerType(String relPath, Pebble instanceRefs) {
        if (!relPath.isEmpty()) {
            return this._getInnerType(relPath, instanceRefs);
        } else {
            return this;
        }
    }
   
    private Pebble _getInnerType(String relPath, Pebble instanceRefs) {
    	
    	Pebble field = this.getInnerField(relPath, instanceRefs);
    	if (field != null) {
    		return field.get("type");
    	} 
    	return null;
    }
    public Pebble getInnerField(String relPath, Pebble instanceRefs) {
    	    	
    	if (relPath.startsWith(".")){
    		relPath = relPath.substring(1);
    	}
        String[] elements = relPath.split("\\.");
        String firstMember = elements[0];
        Pebble firstMemberField = this.getFields().get(firstMember);
        if (firstMemberField != null) { 
	        Pebble nextType = firstMemberField.get("type");
	        if (elements.length > 1) {// || (nextType.getRef(".").equals(TypeReferences.REFERENCE) && nextType.getRef("configgedType") != null)) { //for refs we need to continue
	            //do again
	            String nextTypeStr = nextType.getRef(".");
	            Pebble nextInstanceRefs = null;
	            String nextRelPath = "";
	            
	          //if this is reference
	            ItemType obj = null;
	        	if (nextTypeStr.equals(TypeReferences.REFERENCE)){// && firstMemberField.get("type.configMeta") != null){
	        		//configged
	        		//String configMeta = firstMemberField.getValue("type.configMeta");
	        		nextTypeStr = instanceRefs.getRef(firstMember);
	        		obj = new ItemType(nextTypeStr);
	        		
	        		String configgedType = nextType.getRef("configgedType");
	        		if (configgedType != null && !configgedType.isEmpty()) {
		        		if (configgedType.startsWith("$reference.")){
		        			configgedType = configgedType.replace("$reference.", "");
		        			String configType = obj.getRef(configgedType);
		            		if (configType != null) {
		            			obj = new ItemType(configType);
		            		}
		        		} else if (configgedType.equals("$reference")){
		        			
		        		}
	        		} else {
	        			
	        		}
	        		
	        			        		 
	        		nextRelPath = relPath.substring(relPath.indexOf(".") + 1);
	        		if (instanceRefs == null) {
	                	nextInstanceRefs = null;
	                } else {
	                	nextInstanceRefs = instanceRefs.get(firstMember);
	                }
	        		
	        	} else if (nextTypeStr.equals(TypeReferences.ARRAY)) {
	        		
	        		String arrayFormId = firstMemberField.getRef("type.arrayFormId");
	        		if (arrayFormId != null) {
	        			nextRelPath = relPath.substring(relPath.indexOf(".") + 1);
	        			nextRelPath = nextRelPath.substring(nextRelPath.indexOf(".") + 1); //advance it twice
	        			nextTypeStr = arrayFormId;
	        			if (instanceRefs == null) {
	                    	nextInstanceRefs = null;
	                    } else {
	                    	nextInstanceRefs = instanceRefs.get(firstMember + "." + elements[1]);  //advance it twice
	                    }
	        		} else {
	        			//why doesnt it have an arrayFormId????
	        			int ii = 1;
	        		}
	        		obj = new ItemType(nextTypeStr);
	        	} else {
	        		nextRelPath = relPath.substring(relPath.indexOf(".") + 1);
	        		if (instanceRefs == null) {
	                	nextInstanceRefs = null;
	                } else {
	                	nextInstanceRefs = instanceRefs.get(firstMember);
	                }
	        		obj = new ItemType(nextTypeStr);
	        	}
	        	 //if (firstMemberTypeRef != null) {
	            
	            return obj.getInnerField(nextRelPath, nextInstanceRefs);
	        //} 
	//        else {
	//            //analyze embedded types
	//            relPath = relPath.substring(relPath.indexOf(".") + 1);
	//            return this._getInnerField(firstMemberField.get("type"), relPath);
	//        }
	                
	        } else {
	            //return type
	            return firstMemberField;
	        } 
        } else {
        	//if not defined field, should show error ...
        	return null;
        }
    }
}
