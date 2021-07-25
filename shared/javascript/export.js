goog.require("pebble");
goog.require("pebble.Pebble");
goog.require("PebbleDataSourceImpl_BrowserDom");

goog.require("pebble.shared.ServerDataImpl_Xml");
goog.require("pebble.shared.logger");
goog.require("pebble.shared.DocModel");
goog.require("pebble.shared.HandlesAuthorizationImpl_Dummy");
goog.require("pebble.shared.Authorizer");
goog.require("pebble.shared.ItemType");
goog.require("pebble.shared.PathAnalyzer");
goog.require("pebble.shared.PebbleUtils");
goog.require("pebble.shared.TypeReferences");
goog.require("pebble.shared.BrowserLogger");
goog.require("pebble.shared.BuildDeployment");


window["pebble"] = pebble;
window["pebble"]["Pebble"] = pebble.Pebble;
pebble.Pebble.prototype["setValue"] = pebble.Pebble.prototype.setValue;
pebble.Pebble.prototype["getValue"] = pebble.Pebble.prototype.getValue;
pebble.Pebble.prototype["setMarkup"] = pebble.Pebble.prototype.setMarkup;
pebble.Pebble.prototype["setRef"] = pebble.Pebble.prototype.setRef;
pebble.Pebble.prototype["getRef"] = pebble.Pebble.prototype.getRef;
pebble.Pebble.prototype["getRecords"] = pebble.Pebble.prototype.getRecords;
pebble.Pebble.prototype["add2Array"] = pebble.Pebble.prototype.add2Array;
pebble.Pebble.prototype["getIndex"] = pebble.Pebble.prototype.getIndex;
pebble.Pebble.prototype["getInt"] = pebble.Pebble.prototype.getInt;
pebble.Pebble.prototype["getFloat"] = pebble.Pebble.prototype.getFloat;
pebble.Pebble.prototype["getBool"] = pebble.Pebble.prototype.getBool;
pebble.Pebble.prototype["getTagName"] = pebble.Pebble.prototype.getTagName;

pebble.Pebble["setDataSourceFactory"] = pebble.Pebble.setDataSourceFactory;


window["PebbleDataSourceImpl_BrowserDom"] = PebbleDataSourceImpl_BrowserDom;


window["pebble"]["shared"] = window["pebble"].shared;

window["pebble"]["shared"]["logger"] = pebble.shared.logger;
pebble.shared.logger["setLogger"] = pebble.shared.logger.setLogger;
pebble.shared.logger["log"] = pebble.shared.logger.log;

window["pebble"]["shared"]["BrowserLogger"] = pebble.shared.BrowserLogger;
pebble.shared.BrowserLogger.prototype["log"] = pebble.shared.BrowserLogger.prototype.log;

window["pebble"]["shared"]["BuildDeployment"] = pebble.shared.BuildDeployment;
pebble.shared.BuildDeployment.prototype["buildDeployment"] = pebble.shared.BuildDeployment.prototype.buildDeployment;

window["pebble"]["shared"]["ServerDataImpl_Xml"] = pebble.shared.ServerDataImpl_Xml;
pebble.shared.ServerDataImpl_Xml.prototype["retrieve"] = pebble.shared.ServerDataImpl_Xml.prototype.retrieve;
pebble.shared.ServerDataImpl_Xml.prototype["create"] = pebble.shared.ServerDataImpl_Xml.prototype.create;
pebble.shared.ServerDataImpl_Xml.prototype["update"] = pebble.shared.ServerDataImpl_Xml.prototype.update;
pebble.shared.ServerDataImpl_Xml.prototype["deleteItem"] = pebble.shared.ServerDataImpl_Xml.prototype.deleteItem;
pebble.shared.ServerDataImpl_Xml.prototype["doQuery"] = pebble.shared.ServerDataImpl_Xml.prototype.doQuery;
pebble.shared.ServerDataImpl_Xml.prototype["removeSpaces"] = pebble.shared.ServerDataImpl_Xml.prototype.removeSpaces;
pebble.shared.ServerDataImpl_Xml.prototype["toString"] = pebble.shared.ServerDataImpl_Xml.prototype.toString;

window["pebble"]["shared"]["HandlesAuthorizationImpl_Dummy"] = pebble.shared.HandlesAuthorizationImpl_Dummy;
pebble.shared.HandlesAuthorizationImpl_Dummy.prototype["getUserObject"] = pebble.shared.HandlesAuthorizationImpl_Dummy.prototype.getUserObject;

window["pebble"]["shared"]["DocModel"] = pebble.shared.DocModel;
pebble.shared.DocModel["setDeployment"] = pebble.shared.DocModel.setDeployment;

