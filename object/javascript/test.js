var fs = require('fs');
var Pebble = require('./lib/Pebble');
var PebbleDataSourceImpl = require('./impls/pebbleDataSourceImplXmlDom').PebbleDataSourceImpl;

	//pebble data source						
	Pebble.setDataSourceFactory(new PebbleDataSourceImpl());

	testValue();
	testUserInputted();
	testReference();
	testArray();
	testNumber();



//------- tests
function ok(val, s) {
	var pass_fail = val ? 'passed' : 'failed';
	console.log(pass_fail + ': ' + s);
}

function testValue() {

	var o = new Pebble();

	var val = 'hello!';
	o.setValue('aa.bb.cc', val);
	ok( o.getValue('aa.bb.cc') == val, 'got value' );

	o.remove('aa.bb.cc');
	ok( o.getValue('aa.bb.cc') == null, 'removed value' );

	o.setMarkup('aa.bb', '<html />');
	ok( o.toString().indexOf('CDATA') > 0 && o.getValue('aa.bb') == '<html />', 'set markup' );

}

function testUserInputted() {

	var o = new Pebble('<item> <child> <grandchild> hello </grandchild> </child> </item>');
	ok( o.getValue('child.grandchild') == ' hello ', 'spaces ignored' );

	o = new Pebble('<item> <child> <grandchild>a0</grandchild> </child> <child1> <grandchild>a1</grandchild> </child1> </item>');
	ok( o.getValue('child.grandchild') == 'a0' && o.getValue('child1.grandchild') == 'a1' && o.getRecords('.').length == 2, 'spaces ignored array' );

}

function testReference() {

	var o = new Pebble();
	var val = 'hello!';
	o.setRef('aa.bb.cc', val);
	ok( o.getRef('aa.bb.cc') == val, 'got reference' );

	o.remove('aa.bb.cc');
	ok( o.getRef('aa.bb.cc') == null, 'removed reference' );

}

function testArray() {

	var o = new Pebble();

	var data = new Pebble();
	data.setValue('.', 'array item');
	o.add2Array('aa.bb.cc', data);
	ok( o.getRecords('aa.bb.cc').length == 1, 'set 1 record' );

	o.add2Array('aa.bb.cc', data);
	ok( o.getRecords('aa.bb.cc').length == 2, 'set 2 record' );

	o.add2Array('aa.bb.cc', data, 'forceName');
	ok( o.get('aa.bb.cc.forceName') != null, 'force name' );

	var index = o.getIndex('aa.bb.cc', 'forceName');
	ok( index == 2, 'get index' );

	var newNode = new Pebble();
	o.insertBefore(newNode, 'aa.bb.cc.forceName');
	index = o.getIndex('aa.bb.cc', 'forceName');
	ok( index == 3, 'insert before' );

}


function testNumber() {

	var o = new Pebble();
	var val = 2;
	o.setValue('aa.bb.cc', val);
	var returnedVal = o.getInt('aa.bb.cc');
	ok( returnedVal == 2, 'got int ' + returnedVal + '(' + val + ')' );

	val = 2.1;
	o.setValue('aa.bb.cc', val);
	returnedVal = o.getInt('aa.bb.cc');
	ok( returnedVal == 2, 'got int ' + returnedVal + '(' + val + ')' );

	val = 2.9;
	o.setValue('aa.bb.cc', val);
	returnedVal = o.getInt('aa.bb.cc');
	ok( returnedVal == 2, 'got int ' + returnedVal + '(' + val + ')' );

	val = 2;
	o.setValue('aa.bb.cc', val);
	returnedVal = o.getFloat('aa.bb.cc');
	ok( returnedVal == val, 'got float ' + returnedVal + '(' + val + ')' );

	val = 2.1;
	o.setValue('aa.bb.cc', val);
	returnedVal = o.getFloat('aa.bb.cc');
	ok( returnedVal == val, 'got float ' + returnedVal + '(' + val + ')' );

	val = 2.1223;
	o.setValue('aa.bb.cc', val);
	returnedVal = o.getFloat('aa.bb.cc');
	ok( returnedVal == val, 'got float ' + returnedVal + '(' + val + ')' );

}


