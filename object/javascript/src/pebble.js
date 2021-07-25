
export default class Pebble {

    /**
     * @param {string|Pebble|IPebbleDataSource|null} [o]
     */
    constructor(o) {
        if (o == null) {
            this.setId();
            this.xml = Pebble.dataSourceFactory.getNewInstance();
        } else if (typeof (o) === 'string') { //element
            this.setId();
            this.xml = Pebble.dataSourceFactory.getNewInstance(o);
        } else if (o instanceof Pebble) {
            this.setId();
            this.xml = o.xml;
        } else if (typeof (o) === 'object') { //> IPebbleDataSource???
            this.setId();
            this.xml = o;
        }
        /**
         * @type {Function} Callback
         */
        this.fn;
    }

    setId() {
        Pebble.count += 1;
        this.id = Pebble.count;
    }

    /**
     * @param {string} key
     * @return {Pebble}
     */
    get(key) {
        const node = this.getNode(key, false, false);
        return node != null ? new Pebble(node) : null;
    }

    /**
     * @param {string} key
     * @return {Pebble}
     */
    getCreateOnNull(key) {
        const node = this.getNode(key, false, true);
        return new Pebble(node);
    }

    /**
     * @param {string} key
     * @return {Pebble}
     */
    getCopy(key) {
        const node = this.getNode(key, true, false);
        return node != null ? new Pebble(node) : null;
    }

    /**
     * @param {string} key
     * @return {Pebble}
     */
    getCopyCreateOnNull(key) {
        const node = this.getNode(key, true, true);
        return node != null ? new Pebble(node) : null;
    }

    /**
     * @param {string} key
     * @param {?boolean} isCopy
     * @param {?boolean} createOnNull
     * @return IPebbleDataSource
     */
    getNode(key, isCopy, createOnNull) {
        let node = this.xml.getDataSource(key);
        if (node == null && createOnNull) {
            this.xml.setRecordSet(key, Pebble.dataSourceFactory.getNewInstance(), false);
            node = this.xml.getDataSource(key);
        }
        if (node != null) {
            if (isCopy) {
                return node.getCopyInstance();
            } else {
                return node;
            }
        }
        return null;
    }

    /**
     * @param {string} path
     * @return {Array.<Pebble>}
     */
    getRecords(path) {
        const recs = [];
        const rs = this.xml.getRecords(path);
        if (rs != null) {
            for (let i = 0; i < rs.length; i++) {
                let childNode = rs[i];
                recs[recs.length] = new Pebble(childNode);
            }
        }
        return recs;
    }

    /**
     * @param {string} path
     * @param {Pebble} obj
     */
    set(path, obj) {
        if (obj != null) {
            this.xml.setRecordSet(path, obj.xml, false); 
        } else {
            this.remove(path);
        }
    }

    /**
     * @param {string} path
     * @param {Pebble} obj
     */
    setFull(path, obj) {
        if (obj != null) {
            this.xml.setRecordSet(path, obj.xml, true);
        } else {
            this.remove(path);
        }
    }

    /**
     * @param {string} path
     * @param {Pebble} obj
     */
    add(path, obj) {
        this.xml.add(path, obj.xml);
    }

    /**
     * @param {string} path
     */
    remove(path) {
        return new Pebble(this.xml.remove(path));
    }

    /**
     * if there is no value/ no dNode return null
     * @param {string} key
     * @return {string}
     */
    getValue(key) {
        //if (key.indexOf('_meta') != -1) {
        //var elements = key.split('.');
        //elements.pop();
        //if (elements.length > 0) {
        //return elements.pop();
        //} else {
        //return this.getTagName();
        //}
        //} else {
        return this.xml.getValue(key);
        //}
    }

    /**
     * @param {string} path
     * @param {string} val
     */
    setValue(path, val) {
        if (val != null) {
            this.xml.setValue(path, val);
        } else {
            this.remove(path);
        }
    }

    /**
     * @param {string} path
     * @param {string} val
     */
    setMarkup(path, val) {
        if (val != null) {
            this.xml.setMarkup(path, val);
        } else {
            this.remove(path);
        }
    }

    /**
     * @param {string} key
     * @return {boolean}
     */
    getBool(key) {
        const val = this.xml.getValue(key);
        if (val !== null) {
            //val = val.trim();
            return val === 'true';
        } else {
            return false;
        }
    }

    /**
     * @param {string} key
     * @return {?number}
     */
    getInt(key) {
        const val = this.xml.getValue(key);
        if (val !== null) {
            return parseInt(val, 10);//.trim()); 
        } else {
            return null;
        }
    }

    /**
     * @param {string} key
     * @return {?number}
     */
    getFloat(key) {
        const val = this.xml.getValue(key);
        if (val != null) {
            return parseFloat(val);//.trim());
        } else {
            return null;
        }
    }

    /**
     * @param {string} path
     */
    setTrue(path) {
        this.setValue(path, 'true');
    }

    removeSpaces() {
        this.xml.removeSpaces();
    }

    /**
     * @return {string}
     */
    getTagName() {
        return this.xml.getTagName(); 
    }

    /**
     * @param {string} val
     */
    setTagName(val) {
        //this.xml.setRecordAttribute('n', val);
    }

    //--- reference implementation uses 'ref' ---
    /**
     * @param {string} path
     * @return {?string}
     */
    getRef(path) {
        const ret = this.xml.getRecordSetAttribute(path, 'ref');
        if (ret === '') {
            //return null for empty strings
            return null;
        } else {
            return ret;
        }
    }

    /**
     * @param {string} path
     * @param {?string} val
     */
    setRef(path, val) {
        if (val != null) {
            this.xml.setRecordSetAttribute(path, val, 'ref');
        } else {
            this.xml.removeRecordSetAttribute(path, 'ref');
        }
    }

    /**
     * @param {string} path
     * @param {string} attrName
     * @return {?string}
     */
    getAttribute(path, attrName) {
        const ret = this.xml.getRecordSetAttribute(path, attrName);
        if (ret === '') {
            //return null for empty strings
            return null;
        } else {
            return ret;
        }
    }

    /**
     * @param {string} path
     * @param {string} attrName
     * @param {?string} val
     */
    setAttribute(path, attrName, val) {
        if (val != null) {
            this.xml.setRecordSetAttribute(path, val, attrName);
        } else {
            this.xml.removeRecordSetAttribute(path, attrName);
        }
    }

    //ARRAY (start)
    /**
     * @param {Pebble} newPeb
     * @param {string} targetPath
     */
    insertBefore(newPeb, targetPath) {
        this.xml.insertBefore(newPeb.xml, targetPath);
    }

    //public Pebble insertAfter(Pebble newPeb, String targetPath) {
    //Pebble targetPeb = this.get(targetPath, null);
    //Pebble parent = targetPeb.getParent(false);
    //newPeb.setTopId('n', parent.getArrayName('.'));

    //if (targetPeb.xml.getNextSibling() != null) {
    //targetPeb.xml.getParentNode().insertBefore(newPeb.xml, targetPeb.xml.getNextSibling());
    //} else {
    //targetPeb.xml.getParentNode().appendChild(newPeb.xml);
    //}
    //return newPeb;
    //}
    //path to prev i
    /**
     * @param {string} path
     * @param {string} name
     * @return {number}
     */
    getIndex(path, name) {
        return this.xml.getIndex(path, name);
    }

    /**
     * @param {string} path
     * @param {!number} index
     * @return Pebble
     */
    getByIndex(path, index) {
        const node = this.xml.getByIndex(path, index);
        if (node !== null) {
            return new Pebble(node);
        }
        return null;
    }

    //note: copies full i (ps and rs)
    /**
     * @param {string} path
     * @param {Pebble} obj
     * @param {null|string} forceName
     * @return {Pebble}
     */
    add2Array(path, obj, forceName) {
        return this._add2Array(path, obj, (forceName != null) ? forceName : this.getArrayName(path, 'a'));
    }

    /**
     * @param {string} path
     * @param {Pebble} obj
     * @param {string} prefix
     * @return {Pebble}
     */
    add2ArrayUsePrefix(path, obj, prefix) {
        return this._add2Array(path, obj, this.getArrayName(path, prefix));
    }

    /**
     * @param {string} path
     * @param {Pebble} obj
     * @param {null|string} name
     * @return {Pebble}
     */
    _add2Array(path, obj, name) {
        this.xml.add2Array(path, obj.xml, name);
        return this.get(path + '.' + name);
    }

    /**
     * @param {string} path
     * @param {string} prefix
     * @return {?string}
     */
    getArrayName(path, prefix) {
        let metaArrayName = '';
        for (let name = 0; ; name++) {
            metaArrayName = prefix + name;
            if (!this.hasName(path, metaArrayName)) {
                return metaArrayName;
            }
        }
        return null;
    }

    /**
     * @param {string} path
     * @param {string} name
     * @return {?boolean} 
     */
    hasName(path, name) {
        const recs = this.getRecords(path);
        for (let i = 0; i < recs.length; i++) {
            if (recs[i].getTagName() === name) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param {string} path
     * @param {boolean} ignoreProps
     * @return {?string} 
     */
    getInnerXml(path, ignoreProps) {
        return this.xml.getInnerXml();
    }

    /**
     * @param {string} path
     */
    loadFile(path) {
        this.xml.loadFile(path);
    }

    /**
     * @return {string}
     * @override
     */
    toString() {
        return this.xml.toString();
    }

    /**
     * @param {Function} cb
     */
    setCallback(cb) { 
        this.fn = cb;
    }

    /**
     * @return {Function}
     */
    getCallback() {
        if (this.fn == null) {
            this.fn = function () {};
        }
        return this.fn;
    }

    /**
     * @param {Pebble} [data]
     */
    callback(data) {
        if (this.fn != null) {
            if (data == null) {
                this.fn(this); //not sure if this is being used... fn(null)??
            } else {
                this.fn(data);
            }
        }
    }
    /**
     * @param {string} path
     * @return {Pebble}
     */
    voidFunc2ReturnFunc(path) {
        //create a generator object 
        const func = this.get(path);
        return Pebble._voidFunc2ReturnFunc(func);
    }

    /**
     * @param {Pebble} params
     */
    setParams(params) {
        if (params != null) {
            this.set('_generate', params);
        }
    }

    /**
     * @return {Pebble}
     */
    getParams() {
        return this.getCreateOnNull('_generate');
    }

    /**
     * @param {Pebble} func
     * @return {Pebble}
     */
    static _voidFunc2ReturnFunc(func) {
        const genObj = new Pebble();
        if (func != null) {
            //genObj.set('ps.rg', func.get('voidrg'));
            const recs = func.getRecords('.');
            if (recs.length > 0) {
                genObj.set('_generate', func.getRecords('.')[0]);
            }
        }
        return genObj;
    }

    /**
     * @param {IPebbleDataSource} pebbleDataSource
     */
    static setDataSourceFactory(pebbleDataSource) {
        Pebble.dataSourceFactory = pebbleDataSource;
    }

}
Pebble.count = 0;

