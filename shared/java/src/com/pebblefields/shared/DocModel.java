package com.pebblefields.shared;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import com.pebblefields.shared.interfaces.IServerData;
import org.pebblefields.pebbleobject.Pebble;

/**
 * Doc is the unit document saved to the data store.
 * It is simple crud but manages the default variables (ownerId, etc.)
 * 
 * @author Ryan Tsunoda
 *
 */
public class DocModel extends Pebble implements Serializable{
	
	private static IServerData deployment;
    
    public static IServerData getDatasource() {
			return deployment;
    }
   
    public static Pebble getDoc(String fullId) {
    	try{
	    	int lastDeliminatorIndex = fullId.lastIndexOf(".");
	    	
	        String container = "";
	        String uname = fullId;
	    	if (lastDeliminatorIndex > 0) {
	    		//
	    		container = fullId.substring(0, lastDeliminatorIndex);
	    		uname = fullId.substring(lastDeliminatorIndex + 1);
	    	} else {
	    		//appInstances
	    		container = "theApp.theControlApp.appInstances";
	    		uname = fullId;
	    	}
	        
	        return DocModel.getDatasource().retrieve(container, uname);
    	} catch (Exception e) {
    		return null;
    	}
    }
    public static void setDeployment(IServerData depl) {
    	deployment = depl;
    }
}
