

rm bin/TestEngine.exe
#shared.dll and TestEngine.exe need to be in same directory
#cp /home/rtsunoda/projects/shared-csharp/lib/shared.dll bin/
gmcs -target:exe -out:bin/TestEngine.exe -r:bin/shared.dll src/TestEngine.cs

echo "done"
