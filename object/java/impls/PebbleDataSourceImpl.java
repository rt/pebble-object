package org.pebblefields.pebbleobject.impls;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.xml.sax.InputSource;


import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Attr;

import org.pebblefields.pebbleobject.IPebbleDataSource;

import java.io.*;
import java.util.ArrayList;


public class PebbleDataSourceImpl implements IPebbleDataSource{
	/**
	 * SERVER
	 * @param xmlText
	 * @return
	 */
	public static Document parse(String xmlText) {
		try {
			DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
	        DocumentBuilder db = dbf.newDocumentBuilder();
	        InputSource is = new InputSource();
	        is.setCharacterStream(new StringReader(xmlText));
	
	        return db.parse(is);
		} catch (Exception e) {
			return null;
		}
	}
	/**
	 * SERVER
	 */
	public static Document loadFile2(String file) {
		try {
			DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
	        DocumentBuilder db = dbf.newDocumentBuilder();
	        File f = new File(file);
	        Document ret = db.parse(f);
	        return ret;
		} catch (Exception e) {
			return null;
		}
	}
	public void loadFile(String file) {
		try {
			DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
	        DocumentBuilder db = dbf.newDocumentBuilder();
	        File f = new File(file);
	        Document ret = db.parse(f);
	        this.xml = ret.getDocumentElement();
		} catch (Exception e) {
			this.createXml("<i />");
		}
	}
	/**
	 * SERVER
	 */
	public static String element2String(Element ele) {
		
		String string = null;
		StringWriter writer = new StringWriter();
		StreamResult result = new StreamResult(writer);
		System.setProperty("javax.xml.transform.TransformerFactory", "com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl");
		try {
			TransformerFactory factory = TransformerFactory.newInstance();

			Transformer former;

			former = factory.newTransformer();
			former.transform(new DOMSource(ele), result);
			string = result.getWriter().toString();
		} catch (TransformerConfigurationException e) {

		} catch (TransformerException e) {

		}
		return string.replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "");
		
	}
	
	
	
	
	//--------------------- SHARED CLIENT/SERVER (start) 
	
	
	public Element xml;
	public PebbleDataSourceImpl() {
		this.createXml("<i />"); 
	}
	public PebbleDataSourceImpl(String str) {
		this.createXml(str);
	}
	public PebbleDataSourceImpl(Element xml){
		this.xml = xml;
	}
	private void createXml(String xmlStr) {
		this.xml = PebbleDataSourceImpl.parse(xmlStr).getDocumentElement();
	}
	
	@Override
	public String toString() {
		return PebbleDataSourceImpl.element2String(this.xml);
	}
	@Override
	public IPebbleDataSource getDataSource(String key) {
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, key, false);
		return node == null ? null : new PebbleDataSourceImpl(node);
	}
	
	//get basic value 
	//if there is no value/ no dNode return null
	@Override
	public String getValue(String key) {
		if (key != null) {
			Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, key, false);
			if (node != null && node.getChildNodes().getLength() > 0) {
				NodeList childNodes = node.getChildNodes();
				for (int i = 0; i < childNodes.getLength(); i++) {
					Node child = childNodes.item(i);
					if (!child.getNodeName().equals("ps")) {
						return child.getNodeValue();//note if cdata node it MUST BE stuck to the d node!!!
					}
				}
			} 
		}
		return null;
	}
	@Override
	public void setValue(String path, String val) {
		if (val != null) {
			Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
			NodeList childNodes = node.getChildNodes();
			if (childNodes.getLength() == 0 || (childNodes.getLength() == 1 && node.getFirstChild().getNodeName().equals("ps"))) {
				node.appendChild(node.getOwnerDocument().createTextNode("tn"));
			}
			childNodes = node.getChildNodes();
			for (int i = 0; i < childNodes.getLength(); i++) {
				Node child = childNodes.item(i);
				if (!child.getNodeName().equals("ps")) {
					child.setNodeValue(val);
				}
			}
		}
	}
	@Override
	public void setMarkup(String path, String val) {
		if (val != null) {
			Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
			NodeList childNodes = node.getChildNodes();
			if (childNodes.getLength() == 0 || (childNodes.getLength() == 1 && node.getFirstChild().getNodeName().equals("ps"))) {
				node.appendChild(node.getOwnerDocument().createCDATASection("tn"));
			}
			childNodes = node.getChildNodes();
			for (int i = 0; i < childNodes.getLength(); i++) {
				Node child = childNodes.item(i);
				if (!child.getNodeName().equals("ps")) {
					child.setNodeValue(val);
				}
			}
		}
	}
	/**
	 * Strict get. return null if doesn't exist
	 */
	@Override
	public String getRecordSetAttribute(String path, String attrName) {
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
		if (node != null) {
				return node.getAttribute(attrName);
		}
		return null;
	}
	@Override
	public void setRecordSetAttribute(String path, String val, String attrName) {
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
		node.setAttribute(attrName, val);
	}
	@Override
	public void removeRecordSetAttribute(String path, String attrName) {
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
		if (node != null) {
			node.removeAttribute(attrName);
		}
	}
	@Override
	public String getTagName() {
		return this.xml.getTagName();
	}
	@Override
	public void setRecordSet(String path, IPebbleDataSource item, boolean copyProperties) {
			Element importEle = (Element)((PebbleDataSourceImpl)item).xml;
			Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, true);
			if (importEle != node) {//if it is itself, don't need to do anything (the remove will empty itself)
				if (node != null) {
					NodeList childNodes = node.getChildNodes();
					for (int i = childNodes.getLength() - 1; i >= 0; i--) {
						Node child = childNodes.item(i);
						if (child.getNodeType() != Node.ELEMENT_NODE || (!child.getNodeName().equals("ps") || copyProperties)) {
							node.removeChild(child);
						}
					}
				} 
				for (int i = 0; i < importEle.getAttributes().getLength(); i++) {
				Attr attr = (Attr)importEle.getAttributes().item(i);
					node.setAttribute(attr.getName(), attr.getValue());
				}
				for (int i = 0; i < importEle.getChildNodes().getLength(); i++) {
					Node child = importEle.getChildNodes().item(i);
					if (child.getNodeType() !=  Node.ELEMENT_NODE || (!child.getNodeName().equals("ps") || copyProperties)) {
						Node importNode = this.xml.getOwnerDocument().importNode(child, true);
						node.appendChild(importNode);
					}
				}
			}
	}
	@Override
	public IPebbleDataSource remove(String path) {
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
		if (node != null) {
			return new PebbleDataSourceImpl((Element)node.getParentNode().removeChild(node));
		} 
		return null;
	}
	
//	public IPebbleDataSource getParent() {
//		Element parent = (Element)this.xml.getParentNode();
//		if (parent != null && parent.getParentNode() != null) {
//			return new PebbleDataSourceImpl((Element)parent.getParentNode());
//		} else {
//			return null;
//		}
//	}
	@Override
	public ArrayList<IPebbleDataSource> getRecords(String path) {
		ArrayList<IPebbleDataSource> recs = new ArrayList<IPebbleDataSource>();
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
		if (node != null) {
			NodeList childNodes = node.getChildNodes();
			for (int i = 0; i < childNodes.getLength(); i++) {
				if (childNodes.item(i).getNodeType() == Node.ELEMENT_NODE && !childNodes.item(i).getNodeName().equals("ps")){
					Element childNode = (Element)childNodes.item(i);
					recs.add(new PebbleDataSourceImpl(childNode));
				}
			}
		}
		
		return recs;
	}
	
	//Array (start)
	@Override
	public void insertBefore(IPebbleDataSource newNode, String targetPath) {
		
		Element targetNode = PebbleDataSourceImpl.selectSingleElement(this.xml, targetPath, false);
		Element parent = (Element)targetNode.getParentNode();
		Node node = parent.getOwnerDocument().importNode((Element)((PebbleDataSourceImpl)newNode).xml, true);
		parent.insertBefore(node, targetNode);
		
	}
//	@Override
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
	@Override
	public int getIndex(String path, String name) {
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
		if (node != null) {
			NodeList childNodes = node.getChildNodes();
			int j = 0; //only count element nodes
			for (int i = 0; i < childNodes.getLength(); i++) {
				Node item = childNodes.item(i);
				if (item.getNodeType() == Node.ELEMENT_NODE && !((Element)item).getTagName().equals("ps")){
					if (((Element)item).getTagName().equals(name)) {
						return j;
					}
					j += 1;
				}
			}
		}
		return -1;
	}
	@Override
	public IPebbleDataSource getByIndex(String path, int index) {
		Element node = PebbleDataSourceImpl.selectSingleElement(this.xml, path, false);
		if (node != null) {
			NodeList childNodes = node.getChildNodes();
			int j = 0; //only count element nodes
			for (int i = 0; i < childNodes.getLength(); i++) {
				Node item = childNodes.item(i);
				if (item.getNodeType() == Node.ELEMENT_NODE && !((Element)item).getTagName().equals("ps")){
					if (j == index) {
						return new PebbleDataSourceImpl((Element)item);
					}
					j += 1;
				}
			}
		}
		return null;
	}
	//note: copies full i (ps and rs)
	@Override
	public void add2Array(String path, IPebbleDataSource obj, String name) {
		
		this.setRecordSet(path + "." + name, obj, true);
	}
	@Override
	public IPebbleDataSource getNewInstance() {
		return new PebbleDataSourceImpl();
	}
	@Override
	public IPebbleDataSource getNewInstance(String str) {
		return new PebbleDataSourceImpl(str);
	}
	@Override
	public IPebbleDataSource getCopyInstance() {
		return new PebbleDataSourceImpl((Element)this.xml.cloneNode(true));
	}
	@Override
	public void removeSpaces() {
		this.xml = _removeSpaces(this.xml);
	}

	private static Element _removeSpaces(Element item) {
		NodeList nl = item.getChildNodes();
		boolean canClean = false;
		for (int i = 0; i < nl.getLength(); i++) {
			Node child = nl.item(i);
			if (child.getNodeType() == Node.ELEMENT_NODE && !child.getNodeName().equals("ps")) {//ps could be in a basic d node now
				canClean = true;
				break;
			}
		}
		if (canClean) {
			int k = nl.getLength() - 1;
			while (k >= 0){
				Node child = nl.item(k);
				if (child.getNodeType() != Node.ELEMENT_NODE){
					child.getParentNode().removeChild(child);
				} else {
					//recursive remove if element is not "d"
					child = _removeSpaces((Element)child);
				}
				k -= 1;
			}
		}
		return item;
	}
	public static Element selectSingleElement(Element xml, String path, boolean createOnNull) {
		if (!path.equals(".") && !path.isEmpty()) {
			String[] elements = path.split("\\.");
			int i = 0;
			//sometimes comes in with leading "."
			while (elements[i].isEmpty()) {
				path = path.substring(path.indexOf(".") + 1);
				i++;
			}
			xml = PebbleDataSourceImpl.getChildNode(xml, elements[i], createOnNull);
			int remElements = elements.length - i;
			if (remElements > 1 && xml != null) { 
				String newPath = path.substring(path.indexOf(".") + 1);
				return PebbleDataSourceImpl.selectSingleElement(xml, newPath, createOnNull);
			}
		}
		return xml;
	}
	private static Element getChildNode(Element item, String currentPath, boolean createOnNull) {
		if (item != null) {
			NodeList childNodes = item.getChildNodes();
			for (int i = 0; i < childNodes.getLength(); i++) {
				Node child = childNodes.item(i);
				if (child.getNodeType() == Node.ELEMENT_NODE && child.getNodeName().equals(currentPath)) {
					return (Element) child;
				}
			}
			if (createOnNull) {
				Element ret = item.getOwnerDocument().createElement(currentPath);
				item.appendChild(ret);
				return ret;
			}
		}
		return null;
	}
}
