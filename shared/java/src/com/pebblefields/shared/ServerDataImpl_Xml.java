package com.pebblefields.shared;

import java.util.ArrayList;
import java.util.List;

import com.pebblefields.shared.interfaces.IServerData;
import org.pebblefields.pebbleobject.Pebble;


/**
 * @author rtsunoda
 *
 */
public class ServerDataImpl_Xml implements IServerData{
	private Pebble ds = new Pebble();

	public ServerDataImpl_Xml(String path) {
		ds.loadFile(path);
	}
	public ServerDataImpl_Xml(Pebble ds) {
		this.ds = ds;
	}
	@Override
	public Pebble create(String collection, Pebble peb) {
		synchronized(this) {
			//loop thru appIndex.datamaps to set other properties

			//must set these before returning

			String tableName = collection.replace(".", "_");
			String tagName = peb.getTagName();
			if (!tagName.equals("i")) {
				ds.setFull(tableName + "." + peb.getTagName(), peb);
			} else {
				peb = ds.add2Array(tableName, peb, null);
			}

			return this.retrieve(collection, peb.getTagName());
		}
	}
	@Override
	public Pebble retrieve(String collection, String uniqueName) {
		synchronized(this) {
			String tableName = collection.replace(".", "_");

			String path = tableName + "." + uniqueName;
			Pebble data = ds.getCopy(path);
			if (data != null) {
				return data;
			} else {
				System.out.println("Couldn't get single entity for query: " + collection + "-" + uniqueName);
				return null;
			}
		}
	}
	@Override
	public void update(String fullContainerName, String uniqueName, Pebble doc) {
		synchronized(this) {

			String tableName = fullContainerName.replace(".", "_");

			String path = tableName + "." + uniqueName;
			Pebble data = ds.getCopy(path);

			data.set(".", doc.getCopy("."));

			//write
			ds.setFull(path, data);
		}
	}
	@Override
	public void delete(String fullContainerName, String uniqueName) {
		synchronized(this) {
			String tableName = fullContainerName.replace(".", "_");
			String path = tableName + "." + uniqueName;
			ds.remove(path);
		}

	}
	@Override
	public void deleteCollections(List<String> list) {
		synchronized(this) {
			for (String collection : list) {
				String tableName = collection.replace(".", "_");
				ds.remove(tableName);
			}
		}
	}
	@Override
	public List<String> doQuery(Pebble queryPeb) {
		synchronized(this) {
			Pebble path = queryPeb.get("path");

			String containerKey = path.getRef(".");

			String tableName = containerKey.replace(".", "_");

			List<Pebble> list = ds.getCopy(".").getRecords(tableName);

			ArrayList<String> results = new ArrayList<String>();
			for (Pebble item : list) {
				Pebble appIndexItem = new Pebble();
				appIndexItem.set(".", item);

				appIndexItem.setTagName(item.getTagName());
				results.add(appIndexItem.toString());
			}

			return results;       

		}
	}
	public Pebble getDataSource() {
		return this.ds;
	}
	@Override 
	public String toString() {
		return ds.toString();

	}
	public void removeSpaces() {
		ds.removeSpaces();
	}

}
