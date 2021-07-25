#!/bin/bash

# clear
rm bin/*

# compile to pebble.dll, to be used with any PebbleDataSourceImpl
find src -name "*.cs" > tmp/sources_list.txt
gmcs -target:library -out:bin/pebble.dll @tmp/sources_list.txt

# for the test use the included PebbleDataSourceImpl or your own
gmcs -target:exe -out:bin/Test.exe -r:bin/pebble.dll impls/PebbleDataSourceImpl.cs Test.cs
mono bin/Test.exe | tee test-results.txt



