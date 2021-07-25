import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.pebblefields.pebbleobject.*;
import org.pebblefields.pebbleobject.impls.*;
/**
 * full factory
 */
public class Test {

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		//pebble data source						
			Pebble.setDataSourceFactory(new PebbleDataSourceImpl());

			testValue();
			testUserInputted();
			testReference();
			testArray();
			testNumber();

			System.out.println("done!");	
			
	}
		//------- tests
		private static void ok(boolean val, String s) {
			String pass_fail = val ? "passed" : "failed";
			System.out.println(pass_fail + ": " + s);
		}

		private static void testValue() {

			Pebble o = new Pebble();

			String val = "hello!";
			o.setValue("aa.bb.cc", val);
			ok(val.equals(o.getValue("aa.bb.cc")), "got value" );

			o.remove("aa.bb.cc");
			ok( o.getValue("aa.bb.cc") == null, "removed value" );

			o.setMarkup("aa.bb", "<html />");
			ok( o.toString().indexOf("CDATA") > 0 && o.getValue("aa.bb").equals("<html />"), "set markup" );

		}

		private static void testUserInputted() {

			Pebble o = new Pebble("<item> <child> <grandchild> hello </grandchild> </child> </item>");
			ok( o.getValue("child.grandchild").equals(" hello "), "spaces ignored" );

			o = new Pebble("<item> <child> <grandchild>a0</grandchild> </child> <child1> <grandchild>a1</grandchild> </child1> </item>");
			ok( o.getValue("child.grandchild").equals("a0") && o.getValue("child1.grandchild").equals("a1") && o.getRecords(".").size() == 2, "spaces ignored array" );

		}

		private static void testReference() {

			Pebble o = new Pebble();
			String val = "hello!";
			o.setRef("aa.bb.cc", val);
			ok( o.getRef("aa.bb.cc").equals(val), "got reference" );

			o.remove("aa.bb.cc");
			ok( o.getRef("aa.bb.cc") == null, "removed reference" );

		}

		private static void testArray() {

			Pebble o = new Pebble();

			Pebble data = new Pebble();
			data.setValue(".", "array item");
			o.add2Array("aa.bb.cc", data, null);
			ok( o.getRecords("aa.bb.cc").size() == 1, "set 1 record" );

			o.add2Array("aa.bb.cc", data, null);
			ok(o.getRecords("aa.bb.cc").size() == 2, "set 2 record");

			o.add2Array("aa.bb.cc", data, "forceName");
			ok( o.get("aa.bb.cc.forceName") != null, "force name" );

			int index = o.getIndex("aa.bb.cc", "forceName");
			ok( index == 2, "get index" );

			Pebble newNode = new Pebble();
			o.insertBefore(newNode, "aa.bb.cc.forceName");
			index = o.getIndex("aa.bb.cc", "forceName");
			ok( index == 3, "insert before" );

		}


		private static void testNumber() {

			Pebble o = new Pebble();
			Integer val = 2;
			o.setValue("aa.bb.cc", val.toString());
			Integer returnedVal = o.getInt("aa.bb.cc");
			ok( returnedVal == 2, "got int " + returnedVal + "(" + val + ")" );

			Double val_double = 2.1;
			o.setValue("aa.bb.cc", val_double.toString());
			Double returnedValDouble = o.getFloat("aa.bb.cc");
			ok(returnedValDouble == val_double, "got double " + returnedValDouble + "(" + val_double + ")");
/*
			val = 2;
			o.setValue("aa.bb.cc", val.toString());
			returnedValDouble = o.getFloat("aa.bb.cc");
			ok( (int)returnedValDouble == val, "int ok with float " + returnedValDouble + "(" + val + ")" );
*/
		}

}
