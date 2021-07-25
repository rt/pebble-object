package org.pebblefields.pebbleobject;

//blocking callback can be used client or server side

public class Callback {

	public Callback(){};

	public void call(Pebble data){};
	public void call(Pebble data, Object idObj){};
	public void call() {
		this.call(null);
	}
}
