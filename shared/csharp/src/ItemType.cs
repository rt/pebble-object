
using System.Collections.Generic;
using PebbleFields.Shared.Interfaces;
using PebbleFields.PebbleObject;

namespace PebbleFields.Shared
{
	/**
	 * @author ken
	 */
	public class ItemType : Pebble, HasInfoForAutoCrud 
	{
		public string key;
		public Pebble config;
		public ItemType(string path) : base(DocModel.getDoc(path)) 
		{
			
			this.key = path;
		}
		public ItemType(string path, Pebble config) : base(DocModel.getDoc(path)) 
		{
			
			this.key = path;

			this.config = config;
		}
		public Pebble getFields() 
		{
			return this.getInheritMember("fields");
		}
		public Pebble getFunctions () 
		{
			return this.getInheritMember_Docs("functions");
		}
		//fields, functions, typeMaps only
		private Pebble getInheritMember(string member) 
		{
			Pebble inheritMember = this.getCreateOnNull(member);
			string inherits = this.getRef("inherits");
			if (inherits != null) 
			{
				ItemType _base = new ItemType(inherits);
				Pebble baseInheritMembers = _base.getInheritMember(member);
				foreach (Pebble baseInheritMember in baseInheritMembers.getRecords("."))
				{
					inheritMember.set(baseInheritMember.getTagName(), baseInheritMember);
				}
			}
			return inheritMember;
		}
		public Pebble getInheritMember_Docs(string member) 
		{
			Pebble inheritMember = new Pebble();

			Pebble queryItem = new Pebble();
			string collectionPath = this.key + "." + member;
			queryItem.setRef("path", collectionPath);
			List<string> appIndexes = DocModel.getDatasource().doQuery(queryItem, null, null);
			foreach (string child in appIndexes) 
			{
				Pebble childPeb = new Pebble(child);
				inheritMember.setFull(childPeb.getTagName(), childPeb);//need to have uniques!!!

				//even though we show all together, we need to show where it actually resides
				inheritMember.setRef(childPeb.getTagName() + ".ps.memberBaseCollection", this.key + "." + member); 
			}

			string inherits = this.getRef("inherits");
			if (inherits != null) 
			{
				ItemType _base = new ItemType(inherits);
				Pebble baseInheritMembers = _base.getInheritMember_Docs(member);
				foreach (Pebble baseInheritMember in baseInheritMembers.getRecords("."))
				{
					inheritMember.setFull(baseInheritMember.getTagName(), baseInheritMember);
				}
			}
			return inheritMember;
		}

		public Pebble getField(string fieldName)
		{
			Pebble fields = this.getFields();
			return fields.get(fieldName);
		}

		public Pebble getInnerType(string relPath, Pebble instanceRefs) 
		{
			if (relPath != "") 
			{
				return this._getInnerType(relPath, instanceRefs);
			} else {
				return this;
			}
		}

		private Pebble _getInnerType(string relPath, Pebble instanceRefs) 
		{

			Pebble field = this.getInnerField(relPath, instanceRefs);
			if (field != null) 
			{
				return field.get("type");
			} 
			return null;
		}
		public Pebble getInnerField(string relPath, Pebble instanceRefs) 
		{

			if (relPath.StartsWith("."))
			{
				relPath = relPath.Substring(1);
			}
			string[] elements = relPath.Split('.');
			string firstMember = elements[0];
			Pebble firstMemberField = this.getFields().get(firstMember);
			if (firstMemberField != null) 
			{ 
				Pebble nextType = firstMemberField.get("type");
				if (elements.Length > 1) 
				{// || (nextType.getRef(".") == TypeReferences.REFERENCE && nextType.getRef("configgedType") != null)) { //for refs we need to continue
					//do again
					string nextTypeStr = nextType.getRef(".");
					Pebble nextInstanceRefs = null;
					string nextRelPath = "";

					//if this is reference
					ItemType obj = null;
					if (nextTypeStr == TypeReferences.REFERENCE)
					
					{// && firstMemberField.get("type.configMeta") != null){
						//configged
						//string configMeta = firstMemberField.getValue("type.configMeta");
						nextTypeStr = instanceRefs.getRef(firstMember);
						obj = new ItemType(nextTypeStr);

						string configgedType = nextType.getRef("configgedType");
						if (configgedType != null && configgedType != "") 
						{
							if (configgedType.StartsWith("$reference."))
							{
								configgedType = configgedType.Replace("$reference.", "");
								string configType = obj.getRef(configgedType);
								if (configType != null) 
								{
									obj = new ItemType(configType);
								}
							} else if (configgedType == "$reference")
							{

							}
						} else {

						}


						nextRelPath = relPath.Substring(relPath.IndexOf(".") + 1);
						if (instanceRefs == null) 
						{
							nextInstanceRefs = null;
						} else {
							nextInstanceRefs = instanceRefs.get(firstMember);
						}

					} else if (nextTypeStr == TypeReferences.ARRAY) 
					{

						string arrayFormId = firstMemberField.getRef("type.arrayFormId");
						if (arrayFormId != null) 
						{
							nextRelPath = relPath.Substring(relPath.IndexOf(".") + 1);
							nextRelPath = nextRelPath.Substring(nextRelPath.IndexOf(".") + 1); //advance it twice
							nextTypeStr = arrayFormId;
							if (instanceRefs == null) 
							{
								nextInstanceRefs = null;
							} else {
								nextInstanceRefs = instanceRefs.get(firstMember + "." + elements[1]);  //advance it twice
							}
						} else {
							//why doesnt it have an arrayFormId????
						}
						obj = new ItemType(nextTypeStr);
					} else {
						nextRelPath = relPath.Substring(relPath.IndexOf(".") + 1);
						if (instanceRefs == null) 
						{
							nextInstanceRefs = null;
						} else {
							nextInstanceRefs = instanceRefs.get(firstMember);
						}
						obj = new ItemType(nextTypeStr);
					}
					//if (firstMemberTypeRef != null) 
					//{

					return obj.getInnerField(nextRelPath, nextInstanceRefs);
					//} 
					//        else {
					//            //analyze embedded types
					//            relPath = relPath.Substring(relPath.IndexOf(".") + 1);
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
		}
