
#echo -n "Enter full path to pebble-object-csharp project (ex. /home/username/projects/pebble-object-csharp)-> "
#read pebbleProjectPath
pebbleProjectPath=../../object/csharp


rm lib/*
find src -name "*.cs" > tmp/sources_list.txt

#I couldn't get this to work with multiple dlls (pebble.dll, shared.dll) so just compiled them together
echo "$pebbleProjectPath/src/IPebbleDataSource.cs" >> tmp/sources_list.txt
echo "$pebbleProjectPath/src/Pebble.cs" >> tmp/sources_list.txt
echo "$pebbleProjectPath/impls/PebbleDataSourceImpl.cs" >> tmp/sources_list.txt
gmcs -target:library -out:lib/shared.dll @tmp/sources_list.txt


#build tags
ctags --recurse=yes src


