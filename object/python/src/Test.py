from pebbleobject import pebble 
from pebbleobject.impls import pebbledatasourceimpl 

import logging
import os,sys

def main():

		pebble.Pebble.setDataSourceFactory(pebbledatasourceimpl.PebbleDataSourceImpl())
		
		testValue();
		testUserInputted();
		testReference();
		testArray();
		testNumber();
	
		
#------- tests
def ok(val, s) :
	if val:
		pass_fail = "passed"
	else:
		pass_fail = "failed"
	print pass_fail + ": " + s

def readFile(path):
    #print path
    #fd = codecs.open(path, "r", "utf-8")
    fd = open(path, "r")
    str = fd.read()
    fd.close()
    return str;  

def testValue() :

	o = pebble.Pebble()

	val = "hello!"
	o.setValue("aa.bb.cc", val)
	ok( o.getValue("aa.bb.cc") == val, "got value" )

	o.remove("aa.bb.cc")
	ok( o.getValue("aa.bb.cc") is None, "removed value" )

	o.setMarkup("aa.bb", "<html />")
	ok( o.toString().find("CDATA") > 0 and o.getValue("aa.bb") == "<html />", "set markup" )


def testUserInputted() :

	o = pebble.Pebble("<item> <child> <grandchild> hello </grandchild> </child> </item>")
	ok( o.getValue("child.grandchild") == " hello ", "spaces ignored" )

	o = pebble.Pebble("<item> <child> <grandchild>a0</grandchild> </child> <child1> <grandchild>a1</grandchild> </child1> </item>")
	ok( o.getValue("child.grandchild") == "a0" and o.getValue("child1.grandchild") == "a1" and len(o.getRecords(".")) == 2, "spaces ignored array" )


def testReference() :

	o = pebble.Pebble()
	val = "hello!"
	o.setRef("aa.bb.cc", val)
	ok( o.getRef("aa.bb.cc") == val, "got reference" )

	o.remove("aa.bb.cc")
	ok( o.getRef("aa.bb.cc") is None, "removed reference" )


def testArray() :

	o = pebble.Pebble()

	data = pebble.Pebble()
	data.setValue(".", "array item")
	o.add2Array("aa.bb.cc", data)
	ok( len(o.getRecords("aa.bb.cc")) == 1, "set 1 record" )

	o.add2Array("aa.bb.cc", data)
	ok( len(o.getRecords("aa.bb.cc")) == 2, "set 2 record" )

	o.add2Array("aa.bb.cc", data, "forceName")
	ok( o.get("aa.bb.cc.forceName") is not None, "force name" )

	index = o.getIndex("aa.bb.cc", "forceName")
	ok( index == 2, "get index" )

	newNode = pebble.Pebble()
	o.insertBefore(newNode, "aa.bb.cc.forceName")
	index = o.getIndex("aa.bb.cc", "forceName")
	ok( index == 3, "insert before" )



def testNumber() :

	o = pebble.Pebble()
	val = 2
	o.setValue("aa.bb.cc", val)
	returnedVal = o.getInt("aa.bb.cc")
	ok( returnedVal == 2, "got int " + str(returnedVal) + "(" + str(val) + ")" )

	val = 2.1
	o.setValue("aa.bb.cc", val)
	returnedVal = o.getInt("aa.bb.cc")
	ok( returnedVal == 2, "got int " + str(returnedVal) + "(" + str(val) + ")" )

	val = 2.9
	o.setValue("aa.bb.cc", val)
	returnedVal = o.getInt("aa.bb.cc")
	ok( returnedVal == 2, "got int " + str(returnedVal) + "(" + str(val) + ")" )

	val = 2
	o.setValue("aa.bb.cc", val)
	returnedVal = o.getFloat("aa.bb.cc")
	ok( returnedVal == val, "got float " + str(returnedVal) + "(" + str(val) + ")" )

	val = 2.1
	o.setValue("aa.bb.cc", val)
	returnedVal = o.getFloat("aa.bb.cc")
	ok( returnedVal == val, "got float " + str(returnedVal) + "(" + str(val) + ")" )

	val = 2.1223
	o.setValue("aa.bb.cc", val)
	returnedVal = o.getFloat("aa.bb.cc")
	ok( returnedVal == val, "got float " + str(returnedVal) + "(" + str(val) + ")" )



if __name__ == "__main__":
	main()
