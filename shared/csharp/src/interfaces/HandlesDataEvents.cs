
using PebbleFields.PebbleObject;
namespace PebbleFields.Shared.Interfaces
{
	/// <summary>
	/// </summary>
	/**
	 * implementations can use desired channel technology, notification timings etc.
	 * might need to cooperate with extended client appControlBase (ie gae channel, socket.io.js, EventSource)
	 * @author rtsunoda
	 *
	 */
	public interface HandlesDataEvents {
		void registerDevice(string id, Pebble paths);
		void notifyDataChange(Pebble data, string path, string srcDeviceKey);
		void notifyAdd(Pebble data, string path, string srcDeviceKey);
		void notifyUpdate(Pebble data, string path, string srcDeviceKey);
		void notifyDelete(string path, string srcDeviceKey);
	}
}
