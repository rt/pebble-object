
using PebbleFields.PebbleObject;
namespace PebbleFields.Shared.Interfaces
{
	/// <summary>
	/// </summary>
	public interface HandlesLogging {
		void log(string level, string message);
		void clear();
	}
}
