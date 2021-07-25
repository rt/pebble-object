
impl = None

def setLogger(logger): 
	
	impl = logger

def log(level, str):
	if impl is not None:
		impl.log(level, str)



		
