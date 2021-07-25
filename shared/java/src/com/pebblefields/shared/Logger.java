package com.pebblefields.shared;

import com.pebblefields.shared.interfaces.HandlesLogging;

public class Logger {	
	
	public static HandlesLogging impl = null;

	public static void setLogger(HandlesLogging logger) {
		
		impl = logger;

	}

	public static void log(String level, String str) {
		if (impl != null) {
			impl.log(level, str);
		}
	}
}
