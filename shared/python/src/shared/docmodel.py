from pebbleobject import pebble

class DocModel(pebble.Pebble):
	"""
Doc is the unit document saved to the data store.
It is simple crud but manages the default variables (ownerId, etc.)
	"""

	deployment = None

	#path for create, update, delete, query > collection path
	#path for retrieve should be done thru getDoc(fullId)
	#Factory must set datasources and deployment datasource
	@classmethod
	def getDatasource(cls): 
		return deployment

	@classmethod
	def getDoc(cls, fullId):
		try:
			lastDeliminatorIndex = fullId.rfind(".")

			container = ""
			uname = fullId
			if lastDeliminatorIndex > 0: 
				container = fullId[: lastDeliminatorIndex]
				uname = fullId[lastDeliminatorIndex + 1:]
			else:
				#appInstances
				container = "theApp.theControlApp.appInstances"
				uname = fullId

			return DocModel.getDatasource(container).retrieve(container, uname)
		except e:
			return None

	@classmethod
	def setDeployment(cls, depl): 
		deployment = depl


