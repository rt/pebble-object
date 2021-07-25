import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.pebblefields.pebbleobject.Pebble;
import org.pebblefields.pebbleobject.impls.PebbleDataSourceImpl;
import com.pebblefields.shared.*;
import com.pebblefields.shared.interfaces.*;

/**
 * full factory
 */
public class TestEngine {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
	
		//pebble data source						
			Pebble.setDataSourceFactory(new PebbleDataSourceImpl());
	
			//request
			Pebble request = new Pebble(args[0]);

			//deployment
			ServerDataImpl_Xml ds = new ServerDataImpl_Xml("/home/rtsunoda/projects/devserver/root/deployments/pebbleDesktop.xml");
			DocModel.setDeployment(ds);
			//DocModel.setDeployment(new ServerDataImpl_Xml(new Pebble(xml)));

			//datasources
			HashMap<String, IServerData> sources = new HashMap<String, IServerData>();
			//			sources.put("ds1", new ServerDataImpl_Xml("assets/inMemoryDatastore.xml"));
			//			sources.put("ds2", new ServerDataImpl_Xml("assets/indexServer.xml"));
			DocModel.setDatasources(sources);

			//handles data events
			if (ServerControl.handlesDataEvents == null) {
				//				ServerControl.handlesDataEvents = new HandlesDataEventsImpl_Channel();
			}

			//authorization
			//var auth = new HandlesAuthorizationGaeImpl();
			//req.set("ps.user", auth.getUserObject());

			//set server controls
			List<DeliversServerControls> deliversServerControlsList = new ArrayList<DeliversServerControls>();
			//deliversServerControlsList.push(new DeliversServerControls_Dummy());
			deliversServerControlsList.add(new DeliversServerControlsBaseImpl());

			List<HandlesExecution> executioners = new ArrayList<HandlesExecution>();
			executioners.add(new HandlesExecutionImpl_Base(deliversServerControlsList));
			PebbleControl.setResolver(new Resolver(executioners));

			//resolve it
			PebbleControl.getResolver().resolve(request);
			System.out.println("testdata="+ request.toString());


			
	}
}
