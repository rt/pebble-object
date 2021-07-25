
using System.Collections.Generic;
using PebbleFields.Shared.Interfaces;
using PebbleFields.PebbleObject;

namespace PebbleFields.Shared
{
	/**
	 * @author rtsunoda
	 *
	 */
	public class ServerDataImpl_Xml : IServerData{
		private Pebble ds = new Pebble();

		public ServerDataImpl_Xml(string path) 
		{
			ds.loadFile(path);
		}
		public ServerDataImpl_Xml(Pebble ds) 
		{
			this.ds = ds;
		}
		public Pebble create(string collection, Pebble peb) 
		{
				//loop thru appIndex.datamaps to set other properties

				//must set these before returning

				string tableName = collection.Replace(".", "_");
				string tagName = peb.getTagName();
				if (tagName != "i") 
				{
					ds.setFull(tableName + "." + peb.getTagName(), peb);
				} else {
					peb = ds.add2Array(tableName, peb, null);
				}

				return this.retrieve(collection, peb.getTagName());
		}
		public Pebble retrieve(string collection, string uniqueName) 
		{
				string tableName = collection.Replace(".", "_");

				string path = tableName + "." + uniqueName;
				Pebble data = ds.getCopy(path);
				if (data != null) 
				{
					return data;
				} else {
					System.Console.WriteLine("Couldn't get single entity for query: " + collection + "-" + uniqueName);
					return null;
				}
		}
		public void update(string fullContainerName, string uniqueName, Pebble doc) 
		{

				string tableName = fullContainerName.Replace(".", "_");

				string path = tableName + "." + uniqueName;
				Pebble data = ds.getCopy(path);

				data.set(".", doc.getCopy("."));

				//write
				ds.setFull(path, data);
		}
		public void delete(string fullContainerName, string uniqueName) 
		{
				string tableName = fullContainerName.Replace(".", "_");
				string path = tableName + "." + uniqueName;
				ds.remove(path);
		}
		public void deleteCollections(List<string> list) 
		{
				foreach (string collection in list) 
				{
					string tableName = collection.Replace(".", "_");
					ds.remove(tableName);
				}
		}
		public List<string> doQuery(Pebble queryPeb) 
		{
				Pebble path = queryPeb.get("path");

				string containerKey = path.getRef(".");

				string tableName = containerKey.Replace(".", "_");

				List<Pebble> list = ds.getCopy(".").getRecords(tableName);

				List<string> results = new List<string>();
				foreach (Pebble item in list) 
				{
					//Pebble appIndexItem = new Pebble();
					//if (typeMaps != null) 
					//{
						//List<Pebble>typeArrayMaps = typeMaps.getRecords(".");
						//foreach (Pebble map in typeArrayMaps) 
						//{
							//string colName = map.getRef("path");

							////check if reference, denoted by *reference but allows use to externally link references even if they are configged
							////do not set reference members (data won't be consistent), only set first reference in instance
							//bool isReferencePath = false;
							//string[] elements = colName.Split('.');
							//string getPath = "";
							//Pebble instanceRefs = PebbleUtils.getInstanceRefs(item, colName);
							//foreach (string ele in elements) 
							//{
								//string elem = ele;
								//if (ele.StartsWith("*")) 
								//{
									//elem = PebbleUtils.ReplaceFirst(ele, "*", "");
									//isReferencePath = true;
								//}
								//getPath += elem;
								//Pebble type = t.getInnerType(getPath, instanceRefs); //can pass null because we just want first reference
								//if (isReferencePath && type.getRef(".") == TypeReferences.REFERENCE) 
								//{ //&& not configged!!!
									////first ref (configged references are ok)
									//isReferencePath = true;
									//break;
								//} else {
									//isReferencePath = false;
									////error declared *ref but its not a reference
								//}
								//getPath += ".";
							//}

							//Pebble val;
							//if (isReferencePath) 
							//{
								//getPath = getPath.Substring(0, getPath.Length - 1);
								//val = new Pebble();
								//string remPath = colName.Replace(getPath, "");
								//val.setRef("ps.remPath", remPath); //when retrieving it uses this to get the ref, then get whatever it needs, need this to take difference with map.path
								//val.setRef("ps.refInstance", item.getRef(getPath));
								//appIndexItem.set(colName, val);
							//} else {
								//val = item.get(colName);
								//if (val != null) 
								//{
									//appIndexItem.set(colName, val);
								//}
							//}
						//}
					//} else {
						appIndexItem.set(".", item);
					//}


					appIndexItem.setTagName(item.getTagName());
					results.Add(appIndexItem.ToString());
				}

				return results;       

		}
		public Pebble getDataSource() 
		{
			return this.ds;
		}
		public override string ToString() 
		{
			return ds.ToString();

		}
		public void removeSpaces() 
		{
			ds.removeSpaces();
		}

	}
}
