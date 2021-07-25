package org.pebblefields.pebbleobject;

import java.util.ArrayList;

public interface IPebbleDataSource {

	IPebbleDataSource getNewInstance();

	IPebbleDataSource getNewInstance(String str);

	IPebbleDataSource getDataSource(String key);

	IPebbleDataSource getCopyInstance();

	void removeSpaces();

	String getValue(String key);

	void setValue(String path, String val);
	
	void setMarkup(String path, String val);
	
	String getTagName();
	
	String getRecordSetAttribute(String path, String string);

	void setRecordSetAttribute(String path, String val, String attrName);
	
	void removeRecordSetAttribute(String path, String attrName);
	
	void setRecordSet(String path, IPebbleDataSource obj, boolean copyProperties);

	IPebbleDataSource remove(String path);

	ArrayList<IPebbleDataSource> getRecords(String path);
	
	int getIndex(String path, String name);

	void add2Array(String path, IPebbleDataSource xml, String name);
	
	void insertBefore(IPebbleDataSource newNode, String targetPath);

	IPebbleDataSource getByIndex(String path, int index);

	void loadFile(String path);

}
