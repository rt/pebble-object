package org.pebblefields.pebbleobject;

import java.io.Serializable;
import java.util.*;

/**
 * Base class of all other things, wraps the the object.
 * Must set dataSourceFactory at start of program
 * Derived classes might override get(), getNode(), etc. to return its own class, better way? TODO 
 * 
 * the datasource has array and file functions stuffed into them ... should they be separate and injected as well 
 * 	ex. new PebFile(Pebble original, FileImpl f) where f is the xmltools that support file.save, open, etc. but would require setting at start of program ???
 * 
 * Array manipulations are a part of the base object
 * @author rtsunoda
 */

public class Pebble implements Serializable { 
	
	private static final long serialVersionUID = 1L;
	
	//where datasouce implementation is injected
	protected static IPebbleDataSource dataSourceFactory;

	public static int count = 0;
	public int id = -1;
	protected IPebbleDataSource xml;
	
	private Callback fn;

	public Pebble () {
		this.setId();
		this.xml = Pebble.dataSourceFactory.getNewInstance();
	}

	public Pebble(IPebbleDataSource xml) {
		this.setId();
		this.xml = xml;
	}

	public Pebble(String str) {
		this.setId();
		this.xml = Pebble.dataSourceFactory.getNewInstance(str);
	}

	public Pebble(Pebble obj) {
		this.setId();
		if (obj == null) {
			this.xml = Pebble.dataSourceFactory.getNewInstance();
		} else {
			this.xml = obj.xml;
		}
	}

	private void setId() {
		Pebble.count += 1;
		this.id = Pebble.count;
	}
	
	//--- objects ---
	public Pebble get(String key) {
		IPebbleDataSource node = this.getNode(key, false, false);
		return node != null ? new Pebble(node) : null;
	}

	public Pebble getCreateOnNull(String key) {
		IPebbleDataSource node = this.getNode(key, false, true);
		return new Pebble(node);
	}

	public Pebble getCopy(String key) {
		IPebbleDataSource node = this.getNode(key, true, false);
		return node != null ? new Pebble(node) : null;
	}

	public Pebble getCopyCreateOnNull(String key) {
		IPebbleDataSource node = this.getNode(key, true, true);
		return node != null ? new Pebble(node) : null;
	}

	protected IPebbleDataSource getNode(String key, Boolean isCopy, Boolean createOnNull) {
		IPebbleDataSource node = this.xml.getDataSource(key);
		if (node == null && createOnNull) {
			this.xml.setRecordSet(key, Pebble.dataSourceFactory.getNewInstance(), false);
			node = this.xml.getDataSource(key);
		}
		if (node != null) {
			if (isCopy) {
				return node.getCopyInstance();
			} else {
				return node;
			}
		}
		return null;
	}

	public List<Pebble> getRecords(String path) {
		ArrayList<Pebble> recs = new ArrayList<Pebble>();
		ArrayList<IPebbleDataSource> rs = this.xml.getRecords(path);
		if (rs != null) {
			for (int i = 0; i < rs.size(); i++) {
				IPebbleDataSource childNode = rs.get(i);
				recs.add(new Pebble(childNode));
			}
		}
		return recs;
	}

	public void set(String path, Pebble obj) {
		if (obj != null) {
			this.xml.setRecordSet(path, obj.xml, false); 
		} else {
			this.remove(path);
		}
	}

	public void setFull(String path, Pebble obj) {
		if (obj != null) {
			this.xml.setRecordSet(path, obj.xml, true);
		} else {
			this.remove(path);
		}
	}
	
	public Pebble remove(String path) {
		return new Pebble(this.xml.remove(path));
	}
	
	//--- text/value ---
	//if there is no value/ no dNode return null
	public String getValue(String key) {
		return this.xml.getValue(key);
	}

	public void setValue(String path, String val) {
		if (val != null) {
			this.xml.setValue(path, val);
		} else {
			this.remove(path);
		}
	}

	public void setMarkup(String path, String val) {
		if (val != null) {
			this.xml.setMarkup(path, val);
		} else {
			this.remove(path);
		}
	}

	public boolean getBool(String key) {
		String val = this.xml.getValue(key);
		if (val != null) {
			val = val.trim();
			return val.equals("true");
		} else {
			return false;
		}
	}

	public Integer getInt(String key) {
		String val = this.xml.getValue(key);
		if (val != null) {
			return Integer.parseInt(val.trim()); 
		} else {
			return null;
		}
	}

	public Double getFloat(String key) {
		String val = this.xml.getValue(key);
		if (val != null) {
			return Double.parseDouble(val.trim());
		} else {
			return null;
		}
	}

	public void setTrue (String path) {
		this.setValue(path, "true");
	}
    
	//--- tag name ---
	public String getTagName() {
		return this.xml.getTagName(); 
	}

	public void setTagName(String val) {
		//this.xml.setRecordAttribute("n", val);
	}
	
	//--- reference implementation uses "ref" ---
	public String getRef(String path) {
		return this.xml.getRecordSetAttribute(path, "ref");
	}

	public void setRef(String path, String val) {
		if (val != null) {
			this.xml.setRecordSetAttribute(path, val, "ref");
		} else {
			this.xml.removeRecordSetAttribute(path, "ref");
		}
	}
		
	// ARRAY (start)
	public void insertBefore(Pebble newPeb, String targetPath) {
		this.xml.insertBefore(newPeb.xml, targetPath);
	}
//	
//	public Pebble insertAfter(Pebble newPeb, String targetPath) {
//		Pebble targetPeb = this.get(targetPath, null);
//		Pebble parent = targetPeb.getParent(false);
//		newPeb.setTopId("n", parent.getArrayName("."));
//		
//		if (targetPeb.xml.getNextSibling() != null) {
//			targetPeb.xml.getParentNode().insertBefore(newPeb.xml, targetPeb.xml.getNextSibling());
//		} else {
//			targetPeb.xml.getParentNode().appendChild(newPeb.xml);
//		}
//		return newPeb;
//	}
	
	//path to prev i
	public int getIndex(String path, String name) {
		return this.xml.getIndex(path, name);
	}

	public Pebble getByIndex(String path, int index) {
		IPebbleDataSource node = this.xml.getByIndex(path, index);
		if (node != null) {
			return new Pebble(node);
		}
		return null;
	}

	//note: copies full i (ps and rs)
	public Pebble add2Array(String path, Pebble obj, String forceName) {
		return this._add2Array(path, obj, (forceName != null) ? forceName : this.getArrayName(path, "a"));
	}

	public Pebble add2ArrayUsePrefix(String path, Pebble obj, String prefix){
		return this._add2Array(path, obj, this.getArrayName(path, prefix));
	}

	public Pebble _add2Array(String path, Pebble obj, String name) {
		this.xml.add2Array(path, obj.xml, name);
		return this.get(path + "." + name);
	}

	public String getArrayName(String path, String prefix) {
		String metaArrayName = "";
		for (Integer name = 0; ; name++) {
			metaArrayName = prefix + name.toString();
			if (!this.hasName(path, metaArrayName)) {
				return metaArrayName;
			}
		}
	}
	
	private Boolean hasName(String path, String name) {
		List<Pebble> recs = this.getRecords(path);
		for (int i = 0; i < recs.size(); i++) {
			if (recs.get(i).getTagName().equals(name)) {
				return true;
			}
		}
		return false;
	}
	
	public void loadFile(String path) {
		this.xml.loadFile(path);
	}

	@Override
	public String toString() {
		return this.xml.toString();
	}

	public void setCallback (Callback cb) { 
		this.fn = cb;
	}

	public Callback getCallback () {
		if (this.fn == null) {
			this.fn = new Callback();
		}
		return this.fn;
	}

	public void callback (Pebble data) {
		if (this.fn != null) {
			this.fn.call(data);
		}
	}

	public void callback () {
		this.callback(this);
	}

	public Pebble voidFunc2ReturnFunc (String path) {
		//create a generator object 
		Pebble func = this.get(path);
		return Pebble._voidFunc2ReturnFunc(func);
	}

	public Pebble getParams() {
		return this.getCreateOnNull("ps.rgFunction.rg");
	}
	
	public void removeSpaces() {
		this.xml.removeSpaces();
	}
	
    //----- static
	
	public static Pebble _voidFunc2ReturnFunc (Pebble func) {
		Pebble genObj = new Pebble();
		if (func != null) {
			genObj.set("ps.rgFunction.rg", func.get("voidrg"));
		}
		return genObj;
	}

	public static void setDataSourceFactory(IPebbleDataSource pebbleDataSource) {
		Pebble.dataSourceFactory = pebbleDataSource;
	}
		
}
	
