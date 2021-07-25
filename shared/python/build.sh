
#echo -n "Enter full path to pebble-object-python project (ex. /home/username/projects/pebble-object-python)-> "
#read pebbleProjectPath
pebbleProjectPath=../../object/python

rm -rf src/shared/pebbleobject
cp -R $pebbleProjectPath/src/pebbleobject src/shared/

#build tags
ctags --recurse=yes src


