
goog.provide("pebble.shared.BrowserLogger");
//-----file start

/**
 * requires classes (label label-)
 * @constructor
 * @implements {pebble.shared.interfaces.HandlesLogging}
 */
pebble.shared.BrowserLogger = function(container) {
	if (container != null) {
		this.ele = container;
	}
}

pebble.shared.BrowserLogger.prototype.log = function(level, str, fn, data) {
	if (this.ele != null) {
		var div = document.createElement("div");
		var span = document.createElement("span");
		var style = "font-size: 11.844px; font-weight: bold; line-height: 14px; color: #ffffff; text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25); white-space: nowrap; vertical-align: baseline; background-color: #999999; padding: 1px 4px 2px; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px;";

		var bgColor;
		switch(level) {
		case "INFO":
			bgColor = "#3a87ad";
			break;
		case "SUCCESS":
			bgColor = "#468847";
			break;
		case "ERROR":
			bgColor = "#b94a48";
			break;
		case "WARNING":
			bgColor = "#f89406";
			break;
		}
		style += "background-color:" + bgColor;
		span.setAttribute("style", style);
		span.innerHTML = level;
		div.appendChild(span);
		//var tn = document.createTextNode(str);
		var tn = document.createElement("span");
		tn.innerText = str;
		if (fn) {
			tn.addEventListener("click", function(e) {

				fn(data);		

			}, false);
			tn.setAttribute("style", "cursor:pointer; color:blue; text-decoration:underline;");
		}
		div.appendChild(tn);
		this.ele.appendChild(div);
		this.ele.scrollTop = this.ele.scrollHeight;
	} else {
		window.console.log(level + " : " + str);
	}
	
}
pebble.shared.BrowserLogger.prototype.clear = function() {
	if (this.ele != null) {
		while(this.ele.childNodes.length > 0) {
			this.ele.removeChild(this.ele.firstChild);
		}
	} else {
	}
	
}



