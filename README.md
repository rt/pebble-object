pebble-object
==================

THIS IS NOT MAINTAINED. 
This was an old way to pass messages in the late 1990s / early 2000s when xml as cumbersome and json wasn't quite accepted as a standard message passing format.

pebble-object is a cross language interface to a simple object/document.  

java
==================

Pebble Object in Java

### Usage

```bash
docker build -t pebjava .
#run tests
docker run -it --rm -v $PWD:/work pebjava  

#get running env
docker run -it --rm -v $PWD:/work pebjava /bin/bash
$./runTest.sh
```

Copy the Pebble.java and IPebbleDataSource.java files and an appropriate PebbleDataSource implementation to your project.  

Before anything, inject the PebbleDataSourceImpl.

```java
Pebble.setDataSourceFactory(new PebbleDataSourceImpl());
```

### Included PebbleDataSource Implementations

PebbleDataSourceImpl.java:  Uses Dom.


javascript
========================

Pebble Object in Javascript.

### Usage

```bash
docker build -t pebjavascript .
#run tests
docker run -it --rm -v $PWD:/work pebjavascript  

#get running env
docker run -it --rm -v $PWD:/work pebjavascript /bin/bash
$node ./test.js
```

Copy the lib/Pebble.js file and an appropriate PebbleDataSource implementation to your project.  

Before anything, inject the PebbleDataSourceImpl.

```javascript
pebble.Pebble.setDataSourceFactory(new PebbleDataSourceImpl());
```

### Included PebbleDataSource Implementations

PebbleDataSourceImpl_BrowserDom.js:  For use in the browser.

PebbleDataSourceImplXmlDom.js:  For use with Nodejs, uses xmldom.


python
====================

Pebble Object in Python

### Usage

```bash
docker build -t pebpython .
#run tests
docker run -it --rm -v $PWD:/work pebpython  

#get running env
docker run -it --rm -v $PWD:/work pebpython /bin/bash
$./runTest.sh
```

Copy the pebbleobject module and an appropriate PebbleDataSource implementation to your project.  

Before anything, inject the PebbleDataSourceImpl.

```python
from pebbleobject import pebble

pebble.Pebble.setDataSourceFactory(pebbledatasourceimpl.PebbleDataSourceImpl())
```

### Included PebbleDataSource Implementations

pebbledatasourceimpl.py:  Uses Dom.

csharp
====================

Pebble Object in C#.

### Usage

```bash
docker build -t pebcsharp .
#run tests
docker run -it --rm -v $PWD:/work pebcsharp  

#get running env
docker run -it --rm -v $PWD:/work pebcsharp /bin/bash
$./runTest.sh
```

Copy the Pebble.cs and PebbleDataSourceImpl.cs files and an appropriate PebbleDataSource implementation to your project.  

Before anything, inject the PebbleDataSourceImpl.

```charp
Pebble.setDataSourceFactory(new PebbleDataSourceImpl());
```

### Included PebbleDataSource Implementations

PebbleDataSourceImpl.cs:  Use Dom.

