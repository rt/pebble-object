from pebbleobject import pebble


class Authorizer(object):
	"""
	Helper class you can inherit from when writing authorizers
	"""
    
	UNAUTHORIZED_USER = "-1"
    
	def __init__(self):
		#	object.__init__(self)
		self.userId = Authorizer.UNAUTHORIZED_USER

	def getUserObject(self): 
		
		user = pebble.Pebble()

		top = docmodel.DocModel.getDoc("theInstance")#get top app
		maps = top.getRecords("groupMaps")
		#check against all groupMaps if true for any then authorized
		for m in maps: 
			
			actorGroup = m.getRef(".")
			userGroup = m.get("toGroup")
			if self.isInGroup(userGroup):
				if actorGroup.find(".") != -1:
					actorGroup = actorGroup[actorGroup.rfind(".") + 1:]
				
				user.set("roles." + actorGroup, pebble.Pebble())
		
		user.setRef("id", self.userId)
		isAuth = self.userId != Authorizer.UNAUTHORIZED_USER
		user.setValue("isAuth", str(isAuth).lower())
		return user

	def isInGroup(self, userGroup):
		pass
