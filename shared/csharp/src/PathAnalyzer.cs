
using System.Collections.Generic;
using PebbleFields.Shared.Interfaces;
using PebbleFields.PebbleObject;

namespace PebbleFields.Shared
{
	/**
	 * PathAnalyzer gets infomation about the path 
	 * @author Ryan Tsunoda
	 *
	 */
	public class PathAnalyzer {
		private string path;
		private List<ItemType> itemTypes;				//the ItemType(typePath) so that getField, getAppIndex can be used
		private List<Pebble> fieldTypes;    			//the types as in their parent definition (field.type)
		private List<string> docPaths;					//list of doc paths (non doc members are skipped), only useful for the last one



		public PathAnalyzer(string appPath) 
		{
			this.path = appPath;
			this.itemTypes = new List<ItemType>();    
			this.fieldTypes = new List<Pebble>();	
			this.docPaths = new List<string>();
			this.initComponents();
		}
		/**
		 * Set forms, docPaths
		 */
		private void initComponents() 
		{

			string[] elements = this.path.Split('.');
			string element = elements[0];
			//Pebble top = DocModel.getDoc(element);//get top app
			this.docPaths.Add(element);
			ItemType currentForm = new ItemType(TypeReferences.INDEX_ITEM);//top.getFormKey());

			this.itemTypes.Add(currentForm);
			this.fieldTypes.Add(currentForm.getCopy("."));

			int i = 1;
			while (i < elements.Length) 
			{
				element = elements[i];
				Pebble field = currentForm.getField(element);
				Pebble type = field.get("type");

				//ARRAY
				if (type.getRef(".").EndsWith("standard.types.array")) 
				{ // == TypeReferences.ARRAY) {
					Pebble arrayFormId = type.get("arrayFormId");
					string instanceId = "";

					for (int j = 0; j < i + 1; j++) 
					{
						instanceId += elements[j] + ".";
					}
					instanceId = PebbleUtils.rStrip(instanceId, ".");
					this.itemTypes.Add(new ItemType(type.getRef("."))); 
					this.fieldTypes.Add(type);

					if (instanceId != this.path) 
					{
						//skip the array element (if we didnt we would put array as currentForm but the next currentForm.getField(element) wouldn't work)
						//here we are skipping to the arrayFormId and incrementing (as the collectionPath was added to the forms list)
						instanceId += "." + elements[i + 1];
						if (type.getBool("isArrayCollection"))
						{ 
							this.docPaths.Add(instanceId);
						} 
						currentForm = new ItemType(arrayFormId.getRef("."));
						this.itemTypes.Add(currentForm);
						this.fieldTypes.Add(currentForm.getCopy("."));
						i += 1; 
					} 
				} else if (type.getRef(".").EndsWith("standard.types.itemRelRef"))
				{ // == TypeReferences.REFERENCE) {
					//REFERENCE TO TYPE
					string pathToRef = "";
					for (int j = 0; j <= i; j++) 
					{
						pathToRef += elements[j] + ".";
					}
					pathToRef = pathToRef.Substring(0, pathToRef.LastIndexOf("."));
					string relPath = this.getRelPath(pathToRef);
					//type is in the instance.rs.k
					Pebble doc = this.getLastDoc();
					currentForm = new ItemType(doc.getRef(relPath));

					string configgedType = type.getRef("configgedType");
					if (configgedType != null && configgedType != "" ) 
					{
						if (configgedType.StartsWith("$reference."))
						{
							configgedType = configgedType.Replace("$reference.", "");
							string typePath = currentForm.getRef(configgedType);
							if (typePath != null) 
							{
								currentForm = new ItemType(typePath);
							}
						} else if (configgedType == "$reference") 
						{

						} else {
							currentForm = new ItemType(configgedType);
						}
					} 
					this.itemTypes.Add(currentForm);
					this.fieldTypes.Add(currentForm.getCopy("."));
				} else {
					currentForm = new ItemType(type.getRef("."));
					this.itemTypes.Add(currentForm);
					this.fieldTypes.Add(currentForm.getCopy("."));
				}
				i += 1;
				}
				}
				public string getPath() 
				{
					return this.path;
				}
				public Pebble getLastDoc() 
				{
					return DocModel.getDoc(this.getLastDocPath());
				}
				public List<string> getDocPaths() 
				{
					return this.docPaths;
				}
				public string getLastDocPath() 
				{
					return this.docPaths[this.docPaths.Count - 1];
				}
				public string getParentDocPath() 
				{
					return this.docPaths[this.docPaths.Count - 2];
				}
				public Pebble getLastFieldType() 
				{
					return this.fieldTypes[this.fieldTypes.Count - 1];
				}
				public List<ItemType> getItemTypes() 
				{
					return this.itemTypes;
				}
				public ItemType getParentItemType() 
				{
					return this.itemTypes[this.itemTypes.Count - 2];
				}
				public ItemType getLastItemType() 
				{
					return this.itemTypes[this.itemTypes.Count - 1];
				}
				public string getRelPath() 
				{
					return this.getRelPath(this.getPath());
				}
				public string getRelPath(string fullPath) 
				{
					return PebbleUtils.lStrip(fullPath.Replace(this.docPaths[this.docPaths.Count - 1], ""), ".");
				}
				public Pebble getItem() 
				{
					string relPath = this.getRelPath();
					Pebble doc = this.getLastDoc();
					if (relPath != "") 
					{
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
				public static bool comparePath(string actual, string pathMatch) 
				{
					actual = actual.Trim();
					pathMatch = pathMatch.Trim();
					string[] actualElements = actual.Split('.');
					string[] pathMatchElements = pathMatch.Split('.');
					if (actualElements.Length == pathMatchElements.Length) 
					{
						for (int i = 0; i < pathMatchElements.Length; i++) 
						{
							string match = pathMatchElements[i];
							string act = actualElements[i];
							if (match == act || match == "*") 
							{
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
		}
