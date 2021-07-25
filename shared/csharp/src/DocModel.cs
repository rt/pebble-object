using System.Collections.Generic;
using PebbleFields.Shared.Interfaces;
using PebbleFields.PebbleObject;

namespace PebbleFields.Shared
{
	/**
	 * Doc is the unit document saved to the data store.
	 * It is simple crud but manages the default variables (ownerId, etc.)
	 * 
	 * @author Ryan Tsunoda
	 *
	 */
	public class DocModel : Pebble 
	{

		private static IServerData deployment;

		//path for create, update, delete, query > collection path
		//path for retrieve should be done thru getDoc(fullId)
		//Factory must set datasources and deployment datasource
		public static IServerData getDatasource() 
		{
				return deployment;
		}

		public static Pebble getDoc(string fullId) 
		{
			try
			{
				int lastDeliminatorIndex = fullId.LastIndexOf(".");

				string container = "";
				string uname = fullId;
				if (lastDeliminatorIndex > 0) 
				{
					//
					container = fullId.Substring(0, lastDeliminatorIndex);
					uname = fullId.Substring(lastDeliminatorIndex + 1);
				} else {
					//appInstances
					container = "theApp.theControlApp.appInstances";
					uname = fullId;
				}

				return DocModel.getDatasource().retrieve(container, uname);
			} 
			catch (System.Exception e) 
			{
				return null;
			}
		}
		public static void setDeployment(IServerData depl) 
		{
			deployment = depl;
		}
	}
}
