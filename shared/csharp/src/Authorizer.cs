
using System.Collections.Generic;
using PebbleFields.PebbleObject;
namespace PebbleFields.Shared
{

	/**
	 * Helper class you can inherit from when writing authorizers
	 * @author rtsunoda
	 *
	 */
	public abstract class Authorizer {

		public static readonly string UNAUTHORIZED_USER = "-1";
		protected string userId = UNAUTHORIZED_USER;

		public Authorizer() 
		{

		}

		public Pebble getUserObject() 
		{
			Pebble user = new Pebble();

			Pebble top = DocModel.getDoc("theInstance");//get top app
			List<Pebble> maps = top.getRecords("groupMaps");
			//check against all groupMaps if true for any then authorized
			foreach (Pebble map in maps) 
			{
				string actorGroup = map.getRef(".");
				Pebble userGroup = map.get("toGroup");
				if (this.isInGroup(userGroup)) 
				{
					if (actorGroup.IndexOf(".") != -1) 
					{
						actorGroup = actorGroup.Substring(actorGroup.LastIndexOf(".") + 1);
					}
					user.set("roles." + actorGroup, new Pebble());
				}
			}
			user.setRef("id", this.userId);
			bool isAuth = this.userId != UNAUTHORIZED_USER;
			user.setValue("isAuth", isAuth.ToString());
			return user;
		}
		abstract public bool isInGroup(Pebble userGroup);
	}
}
