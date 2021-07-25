from shared.pebbleobject import pebble
from shared.pebbleobject.impls import pebbledatasourceimpl

from shared import deliversservercontrolsbaseimpl
from shared import docmodel
from shared import serverdataimpl_xml
from shared import pebbleexecutable
from shared import handlesexecutionimpl_base
from shared import pebblecontrol
from shared import resolver
from shared import servercontrol

import logging
import os,sys

def main():
	if len(sys.argv) > 1:
		
		pebble.Pebble.setDataSourceFactory(pebbledatasourceimpl.PebbleDataSourceImpl())
	
		#request
		request = pebbleexecutable.PebbleExecutable(sys.argv[1]);
		#deployment
		xml = readFile(os.path.relpath("/home/rtsunoda/projects/devserver/root/deployments/pebbleDesktop.xml"));
		ds = serverdataimpl_xml.ServerDataImpl_Xml(pebble.Pebble(xml));
		docmodel.DocModel.setDeployment(ds);
	#	ds = serverdataimpl_xml.ServerDataImpl_Xml("../../../devserver/www/deployments/pebbleDesktop.xml");
		
		#datasources
		sources = {};
		docmodel.DocModel.setDatasources(sources);
	
		#handles data events
		#if servercontrol.ServerControl.handlesDataEvents is None :
			#pass	
	
		#authorization
		#auth = HandlesAuthorizationGaeImpl();
		#req.set("ps.user", auth.getUserObject());
	
		#set server controls

		#resolve it
		#pebblecontrol.PebbleControl.getResolver().resolve(request);
		sys.stdout.write("testdata=" + request.toString())


def readFile(path):
    #print path
    #fd = codecs.open(path, "r", "utf-8")
    fd = open(path, "r")
    str = fd.read()
    fd.close()
    return str;  

if __name__ == "__main__":
	main()
