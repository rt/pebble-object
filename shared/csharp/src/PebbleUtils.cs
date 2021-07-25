
using PebbleFields.PebbleObject;

namespace PebbleFields.Shared
{
	/**
	 * Utils that use Pebble
	 * @author rtsunoda
	 *
	 */
	public class PebbleUtils {

		//creates a simple pebble of heirarchy for path or ref instances
		public static Pebble getInstanceRefs(Pebble item, string path) 
		{
			//create simple reference instance pebble
			Pebble instanceRefs = new Pebble();
			if (path.StartsWith(".")) 
			{
				path = path.Substring(1);
			}
			string[] elements = path.Split('.');
			string getPath = "";
			foreach (string ele in elements) 
			{
				getPath += ele;
				string reference = item.getRef(getPath);
				if (reference == null) 
				{
					reference = ""; // no refs are set as empty string
				}
				instanceRefs.setRef(getPath, reference);
				getPath += ".";
			}
			return instanceRefs;
		}

		//need the definition
		//	public static string toJson(Pebble item) 
		//	{
		//		string json = "";
		//		List<Pebble> recs = item.getRecords(".");
		//		foreach (Pebble rec in recs) 
		//		{
		//			json += "'" + rec.getTagName() + "':" + _toJson(rec, def);
		//		}
		//		return json;
		//	}

		//	public static string toXml(Pebble item) 
		//	{
		//		string xml = "";
		//		return xml;
		//	}

		public static string rStrip(string str, string val) 
		{
			if (str.EndsWith(val)) 
			{
				return str.Substring(0, str.LastIndexOf(val));
			} else {
				return str;
			}
		}

		public static string lStrip(string str, string val) 
		{
			if (str.StartsWith(val)) 
			{
				return str.Substring(val.Length);
			} else {
				return str;
			}
		}

		public static string join(string[] elements, string delimitter) 
		{
			string ret = "";
			foreach (string ele in elements) 
			{
				ret += ele + delimitter;
			}
			return PebbleUtils.rStrip(ret, delimitter);
		}
		//c# doesn't have a replace first (could make this an extention or use the Regex
		public static string ReplaceFirst(string text, string search, string replace)
		{
			int pos = text.IndexOf(search);
			if (pos < 0)
			{
				return text;
			}
			return text.Substring(0, pos) + replace + text.Substring(pos + search.Length);
		}
	}
}
