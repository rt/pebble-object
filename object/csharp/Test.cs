using System;
using System.IO;
using System.Collections.Generic;
using PebbleFields.PebbleObject;
using PebbleFields.PebbleObject.Impls;
namespace Test
{
	class MainClass
	{
		public static void Main (string[] args)
		{
			//pebble data source						
			Pebble.setDataSourceFactory(new PebbleDataSourceImpl());

			//logger


			testValue();
			testUserInputted();
			testReference();
			testArray();
			testNumber();


			System.Console.WriteLine("done!");	
		}


		//------- tests
		private static void ok(bool val, string s) {
			string pass_fail = val ? "passed" : "failed";
			System.Console.WriteLine(pass_fail + ": " + s);
		}

		private static void testValue() {

			Pebble o = new Pebble();

			string val = "hello!";
			o.setValue("aa.bb.cc", val);
			ok( o.getValue("aa.bb.cc") == val, "got value" );

			o.remove("aa.bb.cc");
			ok( o.getValue("aa.bb.cc") == null, "removed value" );

			o.setMarkup("aa.bb", "<html />");
			ok( o.toString().IndexOf("CDATA") > 0 && o.getValue("aa.bb") == "<html />", "set markup" );

		}

		private static void testUserInputted() {

			Pebble o = new Pebble("<item> <child> <grandchild> hello </grandchild> </child> </item>");
			ok( o.getValue("child.grandchild") == " hello ", "spaces ignored" );

			o = new Pebble("<item> <child> <grandchild>a0</grandchild> </child> <child1> <grandchild>a1</grandchild> </child1> </item>");
			ok( o.getValue("child.grandchild") == "a0" && o.getValue("child1.grandchild") == "a1" && o.getRecords(".").Count == 2, "spaces ignored array" );

		}

		private static void testReference() {

			Pebble o = new Pebble();
			string val = "hello!";
			o.setRef("aa.bb.cc", val);
			ok( o.getRef("aa.bb.cc") == val, "got reference" );

			o.remove("aa.bb.cc");
			ok( o.getRef("aa.bb.cc") == null, "removed reference" );

		}

		private static void testArray() {

			Pebble o = new Pebble();

			Pebble data = new Pebble();
			data.setValue(".", "array item");
			o.add2Array("aa.bb.cc", data, null);
			ok( o.getRecords("aa.bb.cc").Count == 1, "set 1 record" );

			o.add2Array("aa.bb.cc", data, null);
			ok( o.getRecords("aa.bb.cc").Count == 2, "set 2 record" );

			o.add2Array("aa.bb.cc", data, "forceName");
			ok( o.get("aa.bb.cc.forceName") != null, "force name" );

			var index = o.getIndex("aa.bb.cc", "forceName");
			ok( index == 2, "get index" );

			Pebble newNode = new Pebble();
			o.insertBefore(newNode, "aa.bb.cc.forceName");
			index = o.getIndex("aa.bb.cc", "forceName");
			ok( index == 3, "insert before" );

		}


		private static void testNumber() {

			Pebble o = new Pebble();
			int val = 2;
			o.setValue("aa.bb.cc", val.ToString());
			int? returnedVal = o.getInt("aa.bb.cc");
			ok( returnedVal == 2, "got int " + returnedVal + "(" + val + ")" );

			double val_double = 2.1;
			o.setValue("aa.bb.cc", val_double.ToString());
			double? returnedValDouble = o.getFloat("aa.bb.cc");
			ok(returnedValDouble == val_double, "got double " + returnedValDouble + "(" + val_double + ")");

			val = 2;
			o.setValue("aa.bb.cc", val.ToString());
			returnedValDouble = o.getFloat("aa.bb.cc");
			ok( (int)returnedValDouble == val, "int ok with float " + returnedValDouble + "(" + val + ")" );

		}


	}
}
