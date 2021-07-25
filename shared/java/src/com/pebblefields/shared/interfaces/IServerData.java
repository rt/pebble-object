package com.pebblefields.shared.interfaces;

import java.util.List;

import org.pebblefields.pebbleobject.Pebble;
import com.pebblefields.shared.DocModel;
import com.pebblefields.shared.ItemType;


/**
 * The ServerData is where the data is stored
 * -caching is done here and should be reset on delete and update
 * @author Ryan Tsunoda
 *
 */
public interface IServerData {

	Pebble create(String collection, Pebble pebble);
	Pebble retrieve(String collection, String uniqueName);
	void update(String collection, String uniqueName, Pebble doc);
	void delete(String collection, String uniqueName);
	void deleteCollections(List<String> list);
	List<String> doQuery(Pebble queryItem);

}
