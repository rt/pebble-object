
using System.Collections.Generic;

namespace PebbleFields.PebbleObject
{
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
	 *
	 */
	public class Pebble 
	{ 

		//where datasouce implementation is injected
		protected static IPebbleDataSource dataSourceFactory;

		public static int count = 0;
		public int id = -1;
		protected IPebbleDataSource xml;

		private Callback fn;
		public Pebble () 
		{
			this.setId();
			this.xml = Pebble.dataSourceFactory.getNewInstance();
		}

		public Pebble(IPebbleDataSource xml) 
		{
			this.setId();
			this.xml = xml;
		}

		public Pebble(string str) 
		{
			this.setId();
			this.xml = Pebble.dataSourceFactory.getNewInstance(str);
		}

		public Pebble(Pebble obj) 
		{
			this.setId();
			if (obj == null) 
			{
				this.xml = Pebble.dataSourceFactory.getNewInstance();
			} else {
				this.xml = obj.xml;
			}
		}

		private void setId() 
		{
			Pebble.count += 1;
			this.id = Pebble.count;
		}

		//--- objects ---
		public Pebble get(string key) 
		{
			IPebbleDataSource node = this.getNode(key, false, false);
			return node != null ? new Pebble(node) : null;
		}

		public Pebble getCreateOnNull(string key) 
		{
			IPebbleDataSource node = this.getNode(key, false, true);
			return new Pebble(node);
		}

		public Pebble getCopy(string key) 
		{
			IPebbleDataSource node = this.getNode(key, true, false);
			return node != null ? new Pebble(node) : null;
		}

		public Pebble getCopyCreateOnNull(string key) 
		{
			IPebbleDataSource node = this.getNode(key, true, true);
			return node != null ? new Pebble(node) : null;
		}

		protected IPebbleDataSource getNode(string key, bool isCopy, bool createOnNull) 
		{
			IPebbleDataSource node = this.xml.getDataSource(key);
			if (node == null && createOnNull) 
			{
				this.xml.setRecordSet(key, Pebble.dataSourceFactory.getNewInstance(), false);
				node = this.xml.getDataSource(key);
			}
			if (node != null) 
			{
				if (isCopy) 
				{
					return node.getCopyInstance();
				} else {
					return node;
				}
			}
			return null;
		}

		public List<Pebble> getRecords(string path) 
		{
			List<Pebble> recs = new List<Pebble>();
			List<IPebbleDataSource> rs = this.xml.getRecords(path);
			if (rs != null) 
			{
				for (int i = 0; i < rs.Count; i++) 
				{
					IPebbleDataSource childNode = rs[i];
					recs.Add(new Pebble(childNode));
				}
			}
			return recs;
		}

		public void set(string path, Pebble obj) 
		{
			if (obj != null) 
			{
				this.xml.setRecordSet(path, obj.xml, false); 
			} else {
				this.remove(path);
			}
		}

		public void setFull(string path, Pebble obj) 
		{
			if (obj != null) 
			{
				this.xml.setRecordSet(path, obj.xml, true);
			} else {
				this.remove(path);
			}
		}

		public Pebble remove(string path) 
		{
			return new Pebble(this.xml.remove(path));
		}

		//--- text/value ---
		//if there is no value/ no dNode return null
		public string getValue(string key) 
		{
			return this.xml.getValue(key);
		}

		public void setValue(string path, string val) 
		{
			if (val != null) 
			{
				this.xml.setValue(path, val);
			} else {
				this.remove(path);
			}
		}

		public void setMarkup(string path, string val) 
		{
			if (val != null) 
			{
				this.xml.setMarkup(path, val);
			} else {
				this.remove(path);
			}
		}
		public bool getBool(string key) 
		{
			string val = this.xml.getValue(key);
			if (val != null) 
			{
				val = val.Trim();
				return val == "true";
			} else {
				return false;
			}
		}

		public int? getInt(string key) 
		{
			string val = this.xml.getValue(key);
			if (val != null) 
			{
				return int.Parse(val.Trim()); 
			} else {
				return null;
			}
		}

		public double? getFloat(string key) 
		{
			string val = this.xml.getValue(key);
			if (val != null) 
			{
				return double.Parse(val.Trim());
			} else {
				return null;
			}
		}
		public void setTrue (string path) 
		{
			this.setValue(path, "true");
		}

		//--- tag name ---
		public string getTagName() 
		{
			return this.xml.getTagName(); 
		}

		public void setTagName(string val) 
		{
			//this.xml.setRecordAttribute("n", val);
		}

		//--- reference implementation uses "ref" ---
		public string getRef(string path) 
		{
			return this.xml.getRecordSetAttribute(path, "ref");
		}

		public void setRef(string path, string val) 
		{
			if (val != null) 
			{
				this.xml.setRecordSetAttribute(path, val, "ref");
			} else {
				this.xml.removeRecordSetAttribute(path, "ref");
			}
		}

		// ARRAY (start)
		public void insertBefore(Pebble newPeb, string targetPath) 
		{
			this.xml.insertBefore(newPeb.xml, targetPath);
		}

		public int getIndex(string path, string name) 
		{
			return this.xml.getIndex(path, name);
		}
        
		public Pebble getByIndex(string path, int index) 
		{
			IPebbleDataSource node = this.xml.getByIndex(path, index);
			if (node != null) 
			{
				return new Pebble(node);
			}
			return null;
		}

		//note: copies full i (ps and rs)
		public Pebble add2Array(string path, Pebble obj, string forceName) 
		{
			return this._add2Array(path, obj, (forceName != null) ? forceName : this.getArrayName(path, "a"));
		}

		public Pebble add2ArrayUsePrefix(string path, Pebble obj, string prefix)
		{
			return this._add2Array(path, obj, this.getArrayName(path, prefix));
		}

		public Pebble _add2Array(string path, Pebble obj, string name) 
		{
			this.xml.add2Array(path, obj.xml, name);
			return this.get(path + "." + name);
		}

		public string getArrayName(string path, string prefix) 
		{
			string metaArrayName = "";
			for (int name = 0; ; name++) 
			{
				metaArrayName = prefix + name.ToString();
				if (!this.hasName(path, metaArrayName)) 
				{
					return metaArrayName;
				}
			}
		}

		private bool hasName(string path, string name) 
		{
			List<Pebble> recs = this.getRecords(path);
			for (int i = 0; i < recs.Count; i++) 
			{
				if (recs[i].getTagName() == name) 
				{
					return true;
				}
			}
			return false;
		}

		public void loadFile(string path) 
		{
			this.xml.loadFile(path);
		}

		public string toString() 
		{
			return this.xml.toString();
		}

		public void removeSpaces() 
		{
			this.xml.removeSpaces();
		}

		public void setCallback (Callback cb) 
		{ 
			this.fn = cb;
		}

		public Callback getCallback () 
		{
			if (this.fn == null) 
			{
			}
			return this.fn;
		}

		public void callback (Pebble data) 
		{
			if (this.fn != null) 
			{
				this.fn(data);
			}
		}

		public void callback () 
		{
			this.callback(this);
		}

		public Pebble voidFunc2ReturnFunc (string path) 
		{
			//create a generator object 
			Pebble func = this.get(path);
			return Pebble._voidFunc2ReturnFunc(func);
		}

		public Pebble getParams() 
		{
			return this.getCreateOnNull("_generate");
		}


        //----- static
        
		public static Pebble _voidFunc2ReturnFunc (Pebble func) 
		{
			Pebble genObj = new Pebble();
			if (func != null) 
			{
				genObj.set("ps.rgFunction.rg", func.get("voidrg"));
			}
			return genObj;
		}

		public static void setDataSourceFactory(IPebbleDataSource pebbleDataSource) 
		{
			Pebble.dataSourceFactory = pebbleDataSource;
		}
		
	}

}
