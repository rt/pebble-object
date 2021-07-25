from pebbleobject import pebble


class PebbleUtils(object):
	def __init__(self):
		pass


	#creates a simple pebble of heirarchy for path or ref instances
	@classmethod
	def getInstanceRefs (cls, item, path) :
		#create simple reference instance pebble
		instanceRefs = pebble.Pebble()
		if path.find(".") == 0 :
			path = path[1:]
		elements = path.split(".")
		getPath = ""
		for ele in elements:
			getPath += ele
			ref = item.getRef(getPath)
			if ref is None :
				ref = "" # no refs are set as empty string
			instanceRefs.setRef(getPath, ref)
			getPath += "."
		return instanceRefs
	
	
	
	
