using System.Xml;
using System.IO;
using System.Collections.Generic;

namespace PebbleFields.PebbleObject.Impls
{
	public class PebbleDataSourceImpl : IPebbleDataSource{
		/**
		 * SERVER
		 * @param xmlText
		 * @return
		 */
		public static XmlDocument parse(string xmlText) 
		{
				XmlDocument doc = new XmlDocument();
				doc.LoadXml(xmlText);
				return doc;
		}
	
		public void loadFile(string file) 
		{
			XmlTextReader reader = new XmlTextReader(file);
			reader.WhitespaceHandling = WhitespaceHandling.None;
			reader.MoveToContent();
			reader.Read();

			XmlDocument ret = new XmlDocument();
			ret.Load(reader);
			//or
			//XmlDocument ret = new XmlDocument();
			//ret.Load(file);
			this.xml = ret.DocumentElement;
		}
		/**
		 * SERVER
		 */
		public static string element2string(XmlElement ele) 
		{

			string str = null;
			StringWriter writer = new StringWriter();
			XmlTextWriter tx = new XmlTextWriter(writer);
			ele.WriteTo(tx);
			str = writer.ToString();
			return str;
		}




		//--------------------- SHARED CLIENT/SERVER (start) 


		public XmlElement xml;
		public PebbleDataSourceImpl() 
		{
			this.createXml("<i />"); 
		}
		public PebbleDataSourceImpl(string str) 
		{
			this.createXml(str);
		}
		public PebbleDataSourceImpl(XmlElement xml)
		{
			this.xml = xml;
		}
		private void createXml(string xmlStr) 
		{
			this.xml = PebbleDataSourceImpl.parse(xmlStr).DocumentElement;
		}

		public string toString() 
		{
			return PebbleDataSourceImpl.element2string(this.xml);
		}
		public IPebbleDataSource getDataSource(string key) 
		{
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, key, false);
			return node == null ? null : new PebbleDataSourceImpl(node);
		}

		//get basic value 
		//if there is no value/ no dNode return null
		public string getValue(string key) 
		{
			if (key != null) 
			{
				XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, key, false);
				if (node != null && node.ChildNodes.Count > 0) 
					{
						for (int i = 0; i < node.ChildNodes.Count; i++) 
						{
							XmlNode child = node.ChildNodes[i];
							if (child.Name != "ps") {
								return child.Value;//note if cdata node it MUST BE stuck to the d node!!!
							}
						}
					} 
			}
			return null;
		}
		public void setValue(string path, string val) 
		{
			if (val != null) 
			{
				XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
				if (node.ChildNodes.Count == 0 || (node.ChildNodes.Count == 1 && node.FirstChild.Name == "ps")) 
				{
					node.AppendChild(node.OwnerDocument.CreateTextNode("tn"));
				}
				for (int i = 0; i < node.ChildNodes.Count; i++) 
				{
					XmlNode child = node.ChildNodes[i];
					if (child.Name != "ps") 
					{
						child.Value = val;
					}
				}
			}
		}
		public void setMarkup(string path, string val) 
		{
			if (val != null) 
			{
				XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
				if (node.ChildNodes.Count == 0 || (node.ChildNodes.Count == 1 && node.FirstChild.Name == "ps")) 
				{
					node.AppendChild(node.OwnerDocument.CreateCDataSection("tn"));
				}
				for (int i = 0; i < node.ChildNodes.Count; i++) 
				{
					XmlNode child = node.ChildNodes[i];
					if (child.Name != "ps") 
					{
						child.Value = val;
					}
				}
			}
		}
		/**
		 * Strict get. return null if doesn't exist
		 */
		public string getRecordSetAttribute(string path, string attrName) 
		{
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
			if (node != null) 
			{
				return node.GetAttribute(attrName);
			} 
			return null;
		}
		public void setRecordSetAttribute(string path, string val, string attrName) 
		{
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
			node.SetAttribute(attrName, val);
		}
		public void removeRecordSetAttribute(string path, string attrName) 
		{
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
			if (node != null) 
			{
				node.RemoveAttribute(attrName);
			}
		}
		public string getTagName() {
			return this.xml.Name;
		}
		public void setRecordSet(string path, IPebbleDataSource item, bool copyProperties) 
		{
			XmlElement importEle = (XmlElement)((PebbleDataSourceImpl)item).xml;
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
			if (importEle != node) 
			{//if it is itself, don't need to do anything (the remove will empty itself)
				if (node != null) 
				{
					for (int i = node.ChildNodes.Count - 1; i >= 0; i--) {
						XmlNode child = node.ChildNodes[i];
						if (child.NodeType != XmlNodeType.Element || (child.Name != "ps" || copyProperties)) {
							node.RemoveChild(child);
						}
					}
				} 
				for (int i = 0; i < importEle.Attributes.Count; i++) {
				XmlAttribute attr = importEle.Attributes[i];
					node.SetAttribute(attr.Name, attr.Value);
				}
				for (int i = 0; i < importEle.ChildNodes.Count; i++) {
					XmlNode child = importEle.ChildNodes[i];
					if (child.NodeType !=  XmlNodeType.Element || (child.Name != "ps" || copyProperties)) {
						XmlNode importNode = this.xml.OwnerDocument.ImportNode(child, true);
						node.AppendChild(importNode);
					}
				}
			}
		}
		public IPebbleDataSource remove(string path) 
		{
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
			if (node != null) 
			{
				return new PebbleDataSourceImpl((XmlElement)node.ParentNode.RemoveChild(node));
			} 
			return null;
		}

		//	public IPebbleDataSource getParent() 
		//	{
		//		XmlElement parent = (XmlElement)this.xml.ParentNode;
		//		if (parent != null && parent.ParentNode != null) 
		//		{
		//			return new PebbleDataSourceImpl((XmlElement)parent.ParentNode);
		//		} else {
		//			return null;
		//		}
		//	}
		public List<IPebbleDataSource> getRecords(string path) 
		{
			List<IPebbleDataSource> recs = new List<IPebbleDataSource>();
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
			if (node != null) 
			{
				XmlNodeList childNodes = node.ChildNodes;
				for (int i = 0; i < childNodes.Count; i++) 
				{
					XmlNode childNode = childNodes[i];
					if (childNode.NodeType == XmlNodeType.Element && childNode.Name != "ps")
					{
						recs.Add(new PebbleDataSourceImpl((XmlElement)childNode));
					}
				}
			}

			return recs;
		}

		//Array (start)
		public void insertBefore(IPebbleDataSource newNode, string targetPath) 
		{
			XmlElement targetNode = PebbleDataSourceImpl.selectSingleElement(this.xml, targetPath, false);
			XmlElement parent = (XmlElement)targetNode.ParentNode;
			XmlNode node = parent.OwnerDocument.ImportNode((XmlElement)((PebbleDataSourceImpl)newNode).xml, true);
			parent.InsertBefore(node, targetNode);

		}

		//path to prev i
		public int getIndex(string path, string name) 
		{
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
			if (node != null) 
			{
				XmlNodeList childNodes = node.ChildNodes;
				int j = 0; //only count element nodes
				for (int i = 0; i < childNodes.Count; i++) 
				{
					XmlNode item = childNodes[i];
					if (item.NodeType == XmlNodeType.Element && item.Name != "ps")
					{
						if (((XmlElement)item).Name == name) 
						{
							return j;
						}
						j += 1;
					}
				}
			}
			return -1;
		}
		public IPebbleDataSource getByIndex(string path, int index) 
		{
			XmlElement node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
			if (node != null) 
			{
				XmlNodeList childNodes = node.ChildNodes;
				int j = 0; //only count element nodes
				for (int i = 0; i < childNodes.Count; i++) 
				{
					XmlNode item = childNodes[i];
					if (item.NodeType == XmlNodeType.Element && item.Name != "ps")
					{
						if (j == index) 
						{
							return new PebbleDataSourceImpl((XmlElement)item);
						}
						j += 1;
					}
				}
			}
			return null;
		}
		//note: copies full i (ps and rs)
		public void add2Array(string path, IPebbleDataSource obj, string name) 
		{

			this.setRecordSet(path + "." + name, obj, true);

		}
		public IPebbleDataSource getNewInstance() 
		{
			return new PebbleDataSourceImpl();
		}
		public IPebbleDataSource getNewInstance(string str) 
		{
			return new PebbleDataSourceImpl(str);
		}
		public IPebbleDataSource getCopyInstance() 
		{
			return new PebbleDataSourceImpl((XmlElement)this.xml.CloneNode(true));
		}
		public void removeSpaces() 
		{
			this.xml = _removeSpaces(this.xml);
		}
		private static XmlElement _removeSpaces(XmlElement item) 
		{
			XmlNodeList nl = item.ChildNodes;
			bool canClean = false;
			for (int i = 0; i < nl.Count; i++) {
				XmlNode child = nl[i];
				if (child.NodeType == XmlNodeType.Element && child.Name != "ps") {//ps could be in a basic d node now 
					canClean = true;
					break;
				}
			}
			if (canClean) 
			{
				int k = nl.Count - 1;
				while (k >= 0)
				{
					XmlNode child = nl[k];
					if (child.NodeType != XmlNodeType.Element)
					{
						child.ParentNode.RemoveChild(child);
					} 
					else 
					{
						//recursive remove if element is not "d"
						child = _removeSpaces((XmlElement)child);
					}
					k -= 1;
				}
			}
			return item;
		}
		public static XmlElement selectSingleElement(XmlElement xml, string path, bool createOnNull) 
		{
			if (path != "." && path != "") 
			{
				string[] elements = path.Split('.');
				int i = 0;
				//sometimes comes in with leading "."
				while (elements[i] == "") 
				{
					path = path.Substring(path.IndexOf(".") + 1);
					i++;
				}
				xml = PebbleDataSourceImpl.getChildNode(xml, elements[i], createOnNull);
				int remElements = elements.Length - i;
				if (remElements > 1 && xml != null) 
				{ 
					string newPath = path.Substring(path.IndexOf(".") + 1);
					return PebbleDataSourceImpl.selectSingleElement(xml, newPath, createOnNull);
				}
			}
			return xml;
		}
		private static XmlElement getChildNode(XmlElement item, string currentPath, bool createOnNull) 
		{
			if (item != null) 
			{
				XmlNodeList childNodes = item.ChildNodes;
				for (int i = 0; i < childNodes.Count; i++) 
				{
					XmlNode child = childNodes[i];
					if (child.NodeType == XmlNodeType.Element && child.Name == currentPath) 
					{
						return (XmlElement)child;
					}
				}
				if (createOnNull) 
				{
					XmlElement ret = item.OwnerDocument.CreateElement(currentPath);
					item.AppendChild(ret);
					return ret;
				}
			}
			return null;
		}
	}
}
