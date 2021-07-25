
#clear
rm -rf bin/*

#compile pebble.jar
find src -name "*.java" > tmp/sources_list.txt
javac -d bin @tmp/sources_list.txt
(cd bin && jar cvf ../lib/pebble.jar org)

#run test with impl
javac -d bin -sourcepath . -cp lib/pebble.jar impls/PebbleDataSourceImpl.java Test.java
(cd bin && java Test -cp ../lib/pebble.jar | tee ../test-results.txt)


