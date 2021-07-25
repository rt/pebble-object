package com.pebblefields.shared.interfaces;

import org.pebblefields.pebbleobject.Pebble;

/**
 * implementations can use desired channel technology, notification timings etc.
 * might need to cooperate with extended client appControlBase (ie gae channel, socket.io.js, EventSource)
 * @author rtsunoda
 *
 */
public interface HandlesDataEvents {
	void registerDevice(String id, Pebble paths);
	void notifyDataChange(Pebble data, String path, String srcDeviceKey);
	void notifyAdd(Pebble data, String path, String srcDeviceKey);
	void notifyUpdate(Pebble data, String path, String srcDeviceKey);
	void notifyDelete(String path, String srcDeviceKey);
}
