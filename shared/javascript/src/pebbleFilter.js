
goog.provide("pebble.shared.PebbleFilter");

goog.require("pebble.Pebble");

//-----file start

/**
 * implied AND for first condition
 *
 *	<condition>
 *		<aa.bb op="gt">1</aa.bb>
 *		<aa.bb op="gt" ref="cc" />
 *		<META>myMeta</META>
 *		<OR>
 *			<dd op="startsWith">hello</dd>
 *			<cc ref="cc" op="eq">3</cc>
 *		</OR>
 *	</condition> 
 *
 *	Usage: new pebble.shared.PebbleFilter(topConditionPeb).filter(item)
 *
 * @constructor
 * @param {pebble.Pebble} [condition]
 * @param {pebble.shared.ItemType} [itemType]
 * @param {pebble.Pebble} [globalItem]
 * @extends {pebble.Pebble}
 */
pebble.shared.PebbleFilter = function(condition, itemType, globalItem){

	this.filterCondition = condition;
	this.itemType = itemType;
	this.globalItem = globalItem;
	this.typesCache = {};
}

/**
 * @param {pebble.Pebble} item
 * @return {boolean}
 */
pebble.shared.PebbleFilter.prototype.filter = function(item) {

	return this._filter(this.filterCondition, item, true);

}

/**
 * @param {pebble.Pebble} condition
 * @param {pebble.Pebble} item
 * @param {boolean} isFilterTop
 * @return {boolean}
 */
pebble.shared.PebbleFilter.prototype._filter = function(condition, item, isFilterTop) {
	if (isFilterTop && condition == null) { //only will happen for top

		return true;

	} else {

		var path = condition.getTagName();
		if (isFilterTop || path == "AND"){

			return this.filterAnd(condition, item);

		} else if (path == "OR"){

			return this.filterOr(condition, item);

		} else if (path == "META") {
		
			return item.getTagName() == condition.getValue(".");

		} else if (path == "MY") {//INROLES
			
			return false;

		} else {
			
			return this.doCompare(condition, item);

		}
	}
}

/**
 * @param {pebble.Pebble} andPeb
 * @param {pebble.Pebble} item
 * @return {boolean}
 */
pebble.shared.PebbleFilter.prototype.filterAnd = function(andPeb, item) {
	var innerConditions = andPeb.getRecords(".");
	for (var i = 0; i < innerConditions.length; i++) {
		var innerCondition = innerConditions[i];
		if (!this._filter(innerCondition, item, false)){
			return false;
		}
	}
	return true;
}

/**
 * @param {pebble.Pebble} andPeb
 * @param {pebble.Pebble} item
 * @return {boolean}
 */
pebble.shared.PebbleFilter.prototype.filterOr = function(orPeb, item) {
	var innerConditions = orPeb.getRecords(".");
	for (var i = 0; i < innerConditions.length; i++) {
		var innerCondition = innerConditions[i];
		if (this._filter(innerCondition, item, false)){
			return true;
		}
	}
	return false;
}

/**
 * override to implement on types
 * @param {pebble.Pebble} item
 * @return {number}
 */
pebble.shared.PebbleFilter.prototype.doCompare = function(condition, item) {
	var ret = true;

	var path = condition.getTagName();
	var type = this.getItemType(path);
	var o = item.getCreateOnNull(path);
	
	if (path.indexOf("global:") == 0) {
		path = path.replace("global:", "");
		o = this.globalItem;
	}
	
	if (type == pebble.shared.TypeReferences.TEXT) {
		ret = this.compareText(condition, o);
	} else if (type == pebble.shared.TypeReferences.BOOL) {
		ret = this.compareBool(condition, o);
	} else if (type == pebble.shared.TypeReferences.NUMBER) {
		ret = this.compareNumber(condition, o);
	} else if (type == pebble.shared.TypeReferences.DATE) {
		ret = this.compareDate(condition, o);
	} else if (type == pebble.shared.TypeReferences.REFERENCE) {
		ret = this.compareReference(condition, o);
	}
	return ret;
}
/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.PebbleFilter.prototype.getItemType = function(path) {

	if (this.typesCache[path] === undefined) {

		var type = this.itemType.getInnerType(path);
		if (type !== null) {
			//return type pebble (flexible, no need?) or type string (faster)???
			this.typesCache[path] = type.getRef(".");
		}
	}

	return this.typesCache[path];
}
/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.PebbleFilter.prototype.compareText = function(condition, item) {

	var op = condition.getAttribute(".", "op");
	var itemVal = item.getValue(".");
	if (op == null || op === "eq") {
		var val = condition.getValue(".");
		return val == itemVal;
	} else if (op == "startsWith") {
		if (itemVal != null) {
			return itemVal.indexOf(val) == 0;
		} else {
			return false;
		}
	}
}

/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.PebbleFilter.prototype.compareNumber = function(condition, item) {


	var val = condition.getInt(".");
	var op = condition.getAttribute(".", "op");
	if (op == null || op === "eq") {
		return val == item.getInt(".");
	} else if (op == "lt") {
		return val > item.getInt(".");
	} else if (op == "gt") {
		return val < item.getInt(".");
	} else {
		throw new Error("PebbleFilter:compareNumber() no such operator");
		return null;
	}
}

/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.PebbleFilter.prototype.compareDate = function(condition, item) {

//Date.parse('1997-07-16T19:20:15')           // ISO 8601 Formats
//Date.parse('1997-07-16T19:20:30+01:00')  

	//var val = condition.getValue(".");
	//var itemDate = item.getValue(".");
	var val = Date.parse(condition.getValue("."));
	var itemDate = Date.parse(item.getValue("."));
	var op = condition.getAttribute(".", "op");
	if (op == null || op === "eq") {
		return val == itemDate;
	} else if (op == "lt") {
		return val > itemDate;
	} else if (op == "gt") {
		return val < itemDate;
	} else {
		throw new Error("PebbleFilter:compareDate() no such operator");
		return null;
	}
}
/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.PebbleFilter.prototype.compareBool = function(condition, item) {

	var val = condition.getBool(".");
	return val == item.getBool(".");

}
/**
 * @param {string} path
 * @return {string}
 */
pebble.shared.PebbleFilter.prototype.compareReference = function(condition, item) {

	var op = condition.getAttribute(".", "op");
	var val = condition.getValue(".");
	var itemRef = item.getRef(".");
	if (op == null) {
	
		return val == itemRef;

	} else if (op == "in") {
		var recs = condition.getRecords("inReferences");
		for (var i = 0; i < recs.length; i++) {
			var rec = recs[i];
			var compareType = rec.getRef(".");
			if (compareType == itemRef){
				return true;
			}
		}
		return false;
	} else if (op == "out") {
		
		var recs = condition.getRecords("outReferences");
		for (var i = 0; i < recs.length; i++) {
			var rec = recs[i];
			var compareType = rec.getRef(".");
			if (compareType == itemRef){
				return false;
			}
		}
		return true;
	}
}
/**
 * filters are often as an array of items each with a filter so that when the filter is caught it does something
 * select the FIRST match, if none match returns null
 * these items should always have the meta name "filter"
 * @param {pebble.Pebble} item
 * @param {pebble.Pebble} arrayWithFilters
 * @return {pebble.Pebble} 
 */
function getFilterCaseItem (item, arrayWithFilters, globalItem) {
	if (arrayWithFilters != null) {
		var actionFilters = arrayWithFilters.getRecords(".");
		for (var i = 0; i < actionFilters.length; i++) {
			var actionFilter = actionFilters[i];
			//passing the filter means it was caught (like a switch case)
			if (new pebble.shared.PebbleFilter(actionFilter.getCreateOnNull("filter"), globalItem).filter(item)) {
				return actionFilter;
			}
		}
	}
	return null; //
}
