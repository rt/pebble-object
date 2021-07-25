goog.provide("pebble.shared.Deployment");

goog.require("pebble.Pebble");
goog.require("pebble.shared.DocModel");
goog.require("pebble.shared.ItemType");
goog.require("pebble.shared.PathAnalyzer");


//-----file start

(function(){

	function addCodeToEnv_client (accessPointMeta) {
		var deployment = this.ds.retrieve("theApp.theControlApp.appInstances", "theInstance");
		var theControlApp = deployment.get("theControlApp");
		var accessPoint = deployment.get("accessPoints." + accessPointMeta);
		var dependencies = accessPoint.getRecords("dependencies");
		for (var i = 0; i < dependencies.length; i++) {
			var dep = dependencies[i];
			var path = dep.getRef(".");
			var elements = path.split(".");
			var libMeta = elements.pop();
			var libCollection = elements.join(".");
			var lib = this.ds.retrieve(libCollection, libMeta);
			getScriptsAndCss_client(lib, dep);
		}

		var appDefPath = theControlApp.getRef(".");
		var elements = appDefPath.split(".");
		var appDefMeta = elements.pop();
		var appDefCollection = elements.join(".");
		var appDef = this.ds.retrieve(appDefCollection, appDefMeta);
		getScriptsAndCss_client(appDef, theControlApp);//theControlApp is the config of the appDef
		
		//deployment	
		getScriptsAndCss_client(deployment, null);
	}
	
	function addCodeToEnv_client_all () {
		var deployment = this.ds.retrieve("theApp.theControlApp.appInstances", "theInstance");
		var theControlApp = deployment.get("theControlApp");
		var accessPoints = deployment.getRecords("accessPoints");
		var processedList = [];
		for (var x = 0; x < accessPoints.length; x++) {
			var accessPoint = accessPoints[x];
			var dependencies = accessPoint.getRecords("dependencies");
			for (var i = 0; i < dependencies.length; i++) {
				var dep = dependencies[i];
				var path = dep.getRef(".");
				var elements = path.split(".");
				var libMeta = elements.pop();
				var libCollection = elements.join(".");
				if (processedList.indexOf(libMeta) == -1) {
					processedList.push(libMeta);
					var lib = this.ds.retrieve(libCollection, libMeta);
					getScriptsAndCss_client(lib, dep);
				}
			}
		}
		var appDefPath = theControlApp.getRef(".");
		var elements = appDefPath.split(".");
		var appDefMeta = elements.pop();
		var appDefCollection = elements.join(".");
		var appDef = this.ds.retrieve(appDefCollection, appDefMeta);
		getScriptsAndCss_client(appDef, theControlApp);//theControlApp is the config of the appDef
		
		//deployment	
		getScriptsAndCss_client(deployment, null);
	}

	//server adds all access point dependencies
	function addCodeToEnv_server () {
		var deployment = this.ds.retrieve("theApp.theControlApp.appInstances", "theInstance");
		var theControlApp = deployment.get("theControlApp");
		var accessPoints = deployment.getRecords("accessPoints");
		var processedList = [];
		for (var x = 0; x < accessPoints.length; x++) {
			var accessPoint = accessPoints[x];
			var dependencies = accessPoint.getRecords("dependencies");
			for (var i = 0; i < dependencies.length; i++) {
				var dep = dependencies[i];
				var path = dep.getRef(".");
				var elements = path.split(".");
				var libMeta = elements.pop();
				var libCollection = elements.join(".");

				if (processedList.indexOf(libMeta) == -1) {
					processedList.push(libMeta);
					var lib = this.ds.retrieve(libCollection, libMeta);
					getScriptsAndCss_server(lib, dep);
				}
			}
		}

		var appDefPath = theControlApp.getRef(".");
		var elements = appDefPath.split(".");
		var appDefMeta = elements.pop();
		var appDefCollection = elements.join(".");
		var appDef = this.ds.retrieve(appDefCollection, appDefMeta);
		getScriptsAndCss_server(appDef, theControlApp);//theControlApp is the config of the appDef
	}

	/**
	 * @param {string} path
	 * @param {pebble.Pebble} sharedLib
	 * @param {pebble.Pebble} dep
	 */
	function getScriptsAndCss_server (sharedLib, dep) {

		var sharedLibName = sharedLib.getTagName();

		var serverScripts = sharedLib.getRecords("serverScripts");	
		addClientScripts(serverScripts, sharedLibName + "-serverCode");

	}
	/**
	 * @param {pebble.Pebble} sharedLib
	 * @param {pebble.Pebble} dep
	 */
	function getScriptsAndCss_client (sharedLib, dep) {

		var sharedLibName = sharedLib.getTagName();

		//create namespaces
		addScriptCode(sharedLibName + "-lib", "if (!pebble.libs." + sharedLibName + ") pebble.libs." + sharedLibName + "={};");//create namespace
		addScriptCode(sharedLibName + "-lib", "if (!pebble.libs." + sharedLibName + ".validation) pebble.libs." + sharedLibName + ".validation={};");
	addScriptCode(sharedLibName + "-lib", "if (!pebble.libs." + sharedLibName + ".filters) pebble.libs." + sharedLibName + ".filters={};");

		var cssTemplates = sharedLib.getRecords("cssTemplates");
		addCssTemplates(dep, cssTemplates, sharedLibName);

		var clientScripts = sharedLib.getRecords("clientScripts");	
		addClientScripts(clientScripts, sharedLibName + "-clientCode");

	}
	function addCssTemplates (cssVariables, cssTemplates, id) {
		var css = "";
		for (var i = 0; i < cssTemplates.length; i++) {
			var cssTemplate = cssTemplates[i];
			var s = cssTemplate.getValue("css");
			if (s != null) {
				css += s;
			}
		}
		if (css != "") {
			addCss(id, css);
		}
	}
	function addClientScripts (clientScripts, id) {
		var js = "";
		for (var i = 0; i < clientScripts.length; i++) {
			var clientScript = clientScripts[i];
			js += clientScript.getValue("devCode");
		}
		if (js != "") {
			addScriptCode(id, js);
		}
	}


	//----- Utils

	/**
	 * @param {string} pfId
	 * @param {string} selector
	 * @param {string} rule
	 * @override
	 */
	//pebble.libs.standard.impl.ModuleDisplayImpl.prototype.setCssRule (pfId, selector, rule) {
	//	this.addCssRule("css-" + pfId, "#" + pfId + " " + selector, rule); // add this to stylesheet not elements
	//
	//}
	/**
	 * Insert one rule
	 * @param {string} id
	 * @param {string} selector
	 * @param {string} style
	 */
	function addCssRule (id, selector, style){

		var head = document.getElementsByTagName("head")[0];
		var dynamicCss = document.getElementById(id);
		if (dynamicCss ==  null) {
			var styleEle = document.createElement("style");
			styleEle.setAttribute("id", id);
			head.appendChild(styleEle);
			dynamicCss = document.getElementById(id);
		}
		//innerText?
		dynamicCss.innerHTML = selector + "{" + style + "}";

	}
	/**
	 * Insert style tag
	 * @param {string} id
	 * @param {string} style
	 */
	function addCss (id, style) {

		var head = document.getElementsByTagName("head")[0];
		var dynamicCss = document.getElementById(id);
		if (dynamicCss ==  null) {
			var styleEle = document.createElement("style");
			styleEle.setAttribute("id", id);
			head.appendChild(styleEle);
			dynamicCss = document.getElementById(id);
		}
		dynamicCss.innerHTML = style;
	}
	/**
	 * Insert style tag
	 * @param {string} id
	 * @param {string} code
	 */
	function addScriptCode (id, code) {

		var head = document.getElementsByTagName("head")[0];
		var script = document.getElementById(id);
		if (script ==  null) {
			var ele = document.createElement("script");
			ele.setAttribute("id", id);
			head.appendChild(ele);
			script = document.getElementById(id);
		}
		script.innerHTML = code;
	}
	/**
	 * Insert style tag
	 * @param {string} id
	 * @param {string} src
	 */
	function addScriptSrc (id, src) {

		var head = document.getElementsByTagName("head")[0];
		var script = document.getElementById(id);
		if (script ==  null) {
			var ele = document.createElement("script");
			ele.setAttribute("id", id);
			head.appendChild(ele);
			script = document.getElementById(id);
		}
		script.src = src;

	}


/**
 * Deployment gets infomation about the path 
 * @param {string|pebble.Pebble|pebble.shared.interfaces.IServerData} ds
 * @constructor
 */
pebble.shared.Deployment = function(ds) {

  this.ds = null;	
	if (ds) {
		if (typeof(ds) == "string") { //element
			this.ds = new pebble.shared.ServerDataImpl_Xml(new pebble.Pebble(ds));
		} else if (ds instanceof pebble.Pebble) {
			this.ds = new pebble.shared.ServerDataImpl_Xml(ds);
			} else if (ds instanceof pebble.shared.ServerDataImpl_Xml) {
			this.ds = ds;
		}
	}
	if (this.ds == null) {
		this.ds = new pebble.shared.ServerDataImpl_Xml(new pebble.Pebble());
	} 
	pebble.shared.DocModel.setDeployment(this.ds);
}
/**
 * @param {string} url
 * @param {Function} cb
 */
pebble.shared.Deployment.prototype.retrieveDeployment = function(url, cb) {
	var that = this;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', url, true);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			that.ds = new pebble.shared.ServerDataImpl_Xml(new pebble.Pebble(xmlhttp.responseText));
			cb();
		}
	};
	xmlhttp.send(); 
}
/**
 * @param {string} path
 * @return {pebble.shared.ItemType}
 */
pebble.shared.Deployment.prototype.getTypeDocument = function(path) {
	return new pebble.shared.ItemType(path);
}
/**
 * @param {string} path
 * @return {pebble.shared.PathAnalyzer}
 */
pebble.shared.Deployment.prototype.getPathAnalyzer = function(path) {
	return new pebble.shared.PathAnalyzer(path);
}
/**
 * @param {string} path
 * @return {pebble.Pebble}
 */
pebble.shared.Deployment.prototype.getDocument = function(path) {
	return pebble.shared.DocModel.getDoc(path);
}
/**
 * @param {pebble.shared.ServerDataImpl_xml} workspaceDs
 * @param {pebble.Pebble} dep
 * @param {Function} cb
 * @return {pebble.Pebble}
 */
pebble.shared.Deployment.prototype.buildDeployment = function(workspaceDs, dep, cb) {
	var builder = new pebble.shared.BuildDeployment();
	var that = this;
	builder.buildDeployment(workspaceDs, this.ds, dep, function(s){

		var accessPointDeployments = new pebble.Pebble();
		var theInstance = that.ds.retrieve("theApp.theControlApp.appInstances", "theInstance");
		var accessPoints = theInstance.getRecords("accessPoints");
		for (var i = 0; i < accessPoints.length; i++) {
			var accessPointName = accessPoints[i].getTagName();
			var accessPointDeployment = builder.buildDeploymentFromMaster(that.ds, accessPointName);
			accessPointDeployments.set(accessPointName, accessPointDeployment);
		}
		pebble.shared.Deployment.currentDeployment = that;
		cb(accessPointDeployments);
		
	});
}
/**
 */
pebble.shared.Deployment.prototype.addCodeToEnv_server = addCodeToEnv_server;
pebble.shared.Deployment.prototype.addCodeToEnv_client = addCodeToEnv_client;
pebble.shared.Deployment.prototype.addCodeToEnv_client_all = addCodeToEnv_client_all;



})();
