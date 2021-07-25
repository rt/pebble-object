
using PebbleFields.Shared.Interfaces;

namespace PebbleFields.Shared
{

	public class Logger {
		public static HandlesLogging impl = null;

		public static void SetLogger(HandlesLogging logger) 
		{
			impl = logger;
		}

		public static void Log(string level, string str) 
		{
			if(impl != null)
			{
				impl.log(level, str);
			}
		}
	}
}
