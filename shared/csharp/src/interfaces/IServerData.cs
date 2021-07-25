using System.Collections.Generic;
using PebbleFields.PebbleObject;

namespace PebbleFields.Shared.Interfaces
{
	/// <summary>
	/// 
	/// </summary>
	/**
	 * The ServerData is where the data is stored
	 * -caching is done here and should be reset on delete and update
	 * @author Ryan Tsunoda
	 *
	 */
	public interface IServerData {

		Pebble create(string collection, Pebble pebble);
		Pebble retrieve(string collection, string uniqueName);
		void update(string collection, string uniqueName, Pebble doc);
		void delete(string collection, string uniqueName);
		void deleteCollections(List<string> list);
		List<string> doQuery(Pebble queryItem);

	}
}
