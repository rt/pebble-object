using System;
using System.IO;
using System.Collections.Generic;
using PebbleFields.Shared;
using PebbleFields.Shared.Interfaces;
using PebbleFields.PebbleObject;
using PebbleFields.PebbleObject.Impls;
namespace TestEngine
{
	class MainClass
	{
		public static void Main (string[] args)
		{
				System.Console.WriteLine(args[0]);
				//pebble data source						
				Pebble.setDataSourceFactory(new PebbleDataSourceImpl());
					//request
				PebbleExecutable request = new PebbleExecutable(args[0]);

				StreamReader sr = new StreamReader("/home/rtsunoda/projects/devserver/root/deployments/pebbleDesktop.xml");
				String xml = sr.ReadToEnd();
				ServerDataImpl_Xml ds = new ServerDataImpl_Xml(new Pebble(xml));
				DocModel.setDeployment(ds);

//datasources
				Dictionary<string, IServerData> sources = new Dictionary<string, IServerData>();
				//			file = fs.readFileSync("../www/assets/inMemoryDatastore.xml", "utf8");
				//			sources["ds1"] = new pebble.shared.ServerDataImpl_Xml(new pebble.Pebble(file));
				//			file = fs.readFileSync("../www/assets/indexServer.xml", "utf8");
				//			sources["ds2"] = new pebble.shared.ServerDataImpl_Xml(new pebble.Pebble(file));
				DocModel.setDatasources(sources);

				//handles data events
				if (ServerControl.handlesDataEvents == null) {
					//				ServerControl.handlesDataEvents = new HandlesDataEventsImpl_Channel();
				}

				//authorization
				//var auth = new HandlesAuthorizationGaeImpl();
				//req.set("ps.user", auth.getUserObject());

				//set server controls
				List<DeliversServerControls> deliversServerControlsList = new List<DeliversServerControls>();
				//deliversServerControlsList.push(new DeliversServerControls_Dummy());
				deliversServerControlsList.Add(new DeliversServerControlsBaseImpl());

				List<HandlesExecution> executioners = new List<HandlesExecution>();
				executioners.Add(new HandlesExecutionImpl_Base(deliversServerControlsList));
				PebbleControl.setResolver(new Resolver(executioners));

				//resolve it
				PebbleControl.getResolver().resolve(request);
				System.Console.WriteLine("testdata=" + request.toString());

		}
	}
}
