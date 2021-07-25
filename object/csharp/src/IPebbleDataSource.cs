using System.Collections.Generic;

namespace PebbleFields.PebbleObject
{
    /// <summary>
    /// </summary>
    public interface IPebbleDataSource
    {

			IPebbleDataSource getNewInstance();

			IPebbleDataSource getNewInstance(string str);

			IPebbleDataSource getDataSource(string key);

			IPebbleDataSource getCopyInstance();

			void removeSpaces();

			string getValue(string key);

			void setValue(string path, string val);

			void setMarkup(string path, string val);

			string getTagName();
			
			string getRecordSetAttribute(string path, string str);

			void setRecordSetAttribute(string path, string val, string attrName);

			void removeRecordSetAttribute(string path, string attrName);

			void setRecordSet(string path, IPebbleDataSource obj, bool copyProperties);

			IPebbleDataSource remove(string path);

			List<IPebbleDataSource> getRecords(string path);

			int getIndex(string path, string name);

			void add2Array(string path, IPebbleDataSource xml, string name);

			void insertBefore(IPebbleDataSource newNode, string targetPath);

			IPebbleDataSource getByIndex(string path, int index);

			void loadFile(string path);

			string toString();

    }
}
