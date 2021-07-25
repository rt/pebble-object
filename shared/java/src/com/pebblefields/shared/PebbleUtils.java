package com.pebblefields.shared;

import org.pebblefields.pebbleobject.Pebble;


/**
 * Utils that use Pebble
 * @author rtsunoda
 *
 */
public class PebbleUtils {
	
	//creates a simple pebble of heirarchy for path or ref instances
	 public static Pebble getInstanceRefs(Pebble item, String path) {
		//create simple reference instance pebble
		Pebble instanceRefs = new Pebble();
		if (path.startsWith(".")) {
			path = path.substring(1);
		}
		String elements[] = path.split("\\.");
		String getPath = "";
		for (String ele : elements) {
			getPath += ele;
			String ref = item.getRef(getPath);
			if (ref == null) {
				ref = ""; // no refs are set as empty string
			}
			instanceRefs.setRef(getPath, ref);
			getPath += ".";
		}
		return instanceRefs;
	 }
	
	//need the definition
//	public static String toJson(Pebble item) {
//		String json = "";
//		List<Pebble> recs = item.getRecords(".");
//		for (Pebble rec : recs) {
//			json += "'" + rec.getTagName() + "':" + _toJson(rec, def);
//		}
//		return json;
//	}
	
//	public static String toXml(Pebble item) {
//		String xml = "";
//		return xml;
//	}
	 
		public static String rStrip(String str, String val) {
			if (str.endsWith(val)) {
				return str.substring(0, str.lastIndexOf(val));
			} else {
				return str;
			}
		}

		public static String lStrip(String str, String val) {
			if (str.startsWith(val)) {
				return str.substring(val.length());
			} else {
				return str;
			}
		}

		public static String join(String[] elements, String delimitter) {
			String ret = "";
			for (String ele : elements) {
				ret += ele + delimitter;
			}
			return PebbleUtils.rStrip(ret, delimitter);
		}


}
