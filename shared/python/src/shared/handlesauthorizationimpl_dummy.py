import authorizer

class HandlesAuthorizationImpl_Dummy(authorizer.Authorizer):

	def __init__(self):
		authorizer.Authorizer.__init__(self)


	def isInGroup (self, userGroup):
		return True





