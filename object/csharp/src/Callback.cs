using PebbleFields.PebbleObject;

namespace PebbleFields.PebbleObject
{
    //blocking callback can be used client or server side
    public delegate void Callback(Pebble data);
    public delegate void CallbackWithId(Pebble data, object idObj);
    public delegate void CallbackEmpty();
}
