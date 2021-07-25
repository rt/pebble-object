
goog.provide("pebble.shared.ItemType");

goog.require("pebble.Pebble");
goog.require("pebble.shared.DocModel");
goog.require("pebble.shared.TypeReferences");

//-----file start


/**
 * @constructor
 * @param {?string} path
 * @param {pebble.Pebble} [config] optional
 * @extends {pebble.Pebble}
 */
pebble.shared.ItemType = function(path, config) {
	if (path != null) {
		pebble.Pebble.call(this, pebble.shared.DocModel.getDoc(path));
		this.key = path;
		this.config = config;
	} else {
		throw new Error("ItemType requires path");
	}
}
pebble.inherits(pebble.shared.ItemType, pebble.Pebble);

/**
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype.getFields = function() {
	return this.getInheritMember("fields");
}
/**
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype.getFunctions = function () {
	return this.getInheritMember_Docs("functions");
}
/**
 * fields, functions, typeMaps only
 * @param {string} member
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype.getInheritMember = function(member) {
	var inheritMember = this.getCreateOnNull(member);
	var inherits = this.getRef("inherits");
	if (inherits != null) {
		var base = new pebble.shared.ItemType(inherits);
		var baseInheritMembers = base.getInheritMember(member);
		var recs = baseInheritMembers.getRecords(".");
		for (var i = 0; i < recs.length; i++){
			var baseInheritMember = recs[i];
			inheritMember.set(baseInheritMember.getTagName(), baseInheritMember);
		}
	}
	return inheritMember;
}
/**
 * @param {string} member
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype.getInheritMember_Docs = function(member) {
	var inheritMember = new pebble.Pebble();

	var queryItem = new pebble.Pebble();
	var collectionPath = this.key + "." + member;
	queryItem.setRef("path", collectionPath);
	var appIndexes = pebble.shared.DocModel.getDatasource().doQuery(queryItem);
	for (var i = 0; i < appIndexes.length; i++) {
		var child = appIndexes[i];
		var childPeb = new pebble.Pebble(child);
		inheritMember.setFull(childPeb.getTagName(), childPeb);//need to have uniques!!!

		//even though we show all together, we need to show where it actually resides
		//inheritMember.setRef(childPeb.getTagName() + "._memberBaseCollection", this.key + "." + member); 
	}

	var inherits = this.getRef("inherits");
	if (inherits != null) {
		var base = new pebble.shared.ItemType(inherits);
		var baseInheritMembers = base.getInheritMember_Docs(member);
		var recs = baseInheritMembers.getRecords(".");
		for (var i = 0; i < recs.length; i++){
			var baseInheritMember = recs[i];
			inheritMember.setFull(baseInheritMember.getTagName(), baseInheritMember);
		}
	}
	return inheritMember;
}
/**
 * @param {string} compareType
 */
pebble.shared.ItemType.prototype.inherits = function (compareType) {
	var inherits = this.getRef("inherits");
	if (inherits != null) {
		if (inherits == compareType) {
			return true;
		} else {
			var base = new pebble.shared.ItemType(inherits);
			return base.inherits(compareType);
		}
	}
	return false;
}
/**
 * @param {string} fieldName
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype.getField = function(fieldName){
	var fields = this.getFields();
	return fields.get(fieldName);
}
/**
 * @param {string} relPath
 * @param {pebble.Pebble} instanceRefs
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype.getInnerType = function(relPath, instanceRefs) {
	if (relPath != "") {
		return this._getInnerType(relPath, instanceRefs);
	} else {
		return this;
	}
}
/**
 * @param {string} relPath
 * @param {pebble.Pebble} instanceRefs
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype._getInnerType = function(relPath, instanceRefs) {

	var field = this.getInnerField(relPath, instanceRefs);
	if (field != null) {
		return field.get("type");
	} 
	return null;
}
/**
 * @param {string} relPath
 * @param {pebble.Pebble} instanceRefs
 * @return {pebble.Pebble}
 */
pebble.shared.ItemType.prototype.getInnerField = function(relPath, instanceRefs) {

	if (relPath.indexOf(".") == 0){
		relPath = relPath.substring(1);
	}
	var elements = relPath.split(".");
	var firstMember = elements[0];
	var firstMemberField = this.getFields().get(firstMember);
	if (firstMemberField != null) { 
		var nextType = firstMemberField.get("type");
		if (elements.length > 1) {
			//do again
			var nextTypeStr = nextType.getRef(".");
			var nextInstanceRefs = null;
			var nextRelPath = "";

			//if this is reference
			var obj = null;
			if (nextTypeStr == pebble.shared.TypeReferences.REFERENCE){
				//configged
				nextTypeStr = instanceRefs.getRef(firstMember);
				if (nextTypeStr != null) {
				obj = new pebble.shared.ItemType(nextTypeStr);

				var configgedType = nextType.getRef("configgedType");
				if (configgedType != null && configgedType != "") {
					if (configgedType.indexOf("$reference.") == 0){
						configgedType = configgedType.replace("$reference.", "");
						var configType = obj.getRef(configgedType);
						if (configType != null) {
							obj = new pebble.shared.ItemType(configType);
						}
					} else if (configgedType == "$reference"){

					}
				} else {

				}

				nextRelPath = relPath.substring(relPath.indexOf(".") + 1);
				if (instanceRefs == null) {
					nextInstanceRefs = null;
				} else {
					nextInstanceRefs = instanceRefs.get(firstMember);
				}
				} else {
					return null;
				}

			} else if (nextTypeStr == pebble.shared.TypeReferences.ARRAY || nextTypeStr == pebble.shared.TypeReferences.COLLECTION) {

				var arrayFormId = firstMemberField.getRef("type.arrayFormId");
				if (arrayFormId != null) {
					nextRelPath = relPath.substring(relPath.indexOf(".") + 1);
					nextRelPath = nextRelPath.substring(nextRelPath.indexOf(".") + 1); //advance it twice
					nextTypeStr = arrayFormId;
					if (instanceRefs == null) {
						nextInstanceRefs = null;
					} else {
						nextInstanceRefs = instanceRefs.get(firstMember + "." + elements[1]);  //advance it twice
					}
				} else {
					var ii = 1;
				}
				obj = new pebble.shared.ItemType(nextTypeStr);
			} else {
				nextRelPath = relPath.substring(relPath.indexOf(".") + 1);
				if (instanceRefs == null) {
					nextInstanceRefs = null;
				} else {
					nextInstanceRefs = instanceRefs.get(firstMember);
				}
				obj = new pebble.shared.ItemType(nextTypeStr);
			}
			return obj.getInnerField(nextRelPath, nextInstanceRefs);

		} else {
			//return type
			return firstMemberField;
		} 
	} else {
		//if not defined field, should show error ...
		return null;
	}
}


