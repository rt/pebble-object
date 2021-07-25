
#echo -n "Enter full path to pebble-object-java project (ex. /home/username/projects/pebble-object-java)-> "
#read pebbleProjectPath
pebbleProjectPath=../../object/java
rm -rf bin/*

find src -name "*.java" > tmp/sources_list.txt

echo "$pebbleProjectPath/src/org/pebblefields/pebbleobject/IPebbleDataSource.java" >> tmp/sources_list.txt
echo "$pebbleProjectPath/src/org/pebblefields/pebbleobject/Callback.java" >> tmp/sources_list.txt
echo "$pebbleProjectPath/src/org/pebblefields/pebbleobject/Pebble.java" >> tmp/sources_list.txt

javac -d bin @tmp/sources_list.txt

(cd bin && jar cvf ../lib/shared.jar com org)

#build tags
ctags --recurse=yes src




