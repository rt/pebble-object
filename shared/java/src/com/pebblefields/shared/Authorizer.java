package com.pebblefields.shared;

import java.util.List;

import org.pebblefields.pebbleobject.Pebble;

/**
 * Helper class you can inherit from when writing authorizers
 * @author rtsunoda
 *
 */
public abstract class Authorizer {
	
	public static final String UNAUTHORIZED_USER = "-1";
	protected String userId = UNAUTHORIZED_USER;
	
	public Authorizer() {
		
	}

	public Pebble getUserObject() {
		Pebble user = new Pebble();
		
		Pebble top = DocModel.getDoc("theInstance");//get top app
		List<Pebble> maps = top.getRecords("groupMaps");
		//check against all groupMaps if true for any then authorized
		for (Pebble map : maps) {
			String actorGroup = map.getRef(".");
			Pebble userGroup = map.get("toGroup");
			if (this.isInGroup(userGroup)) {
				if (actorGroup.indexOf(".") != -1) {
					actorGroup = actorGroup.substring(actorGroup.lastIndexOf(".") + 1);
				}
				user.set("roles." + actorGroup, new Pebble());
			}
		}
		user.setRef("id", this.userId);
		Boolean isAuth = this.userId != UNAUTHORIZED_USER;
		user.setValue("isAuth", isAuth.toString());
		return user;
	}
	abstract public boolean isInGroup(Pebble userGroup);
}
