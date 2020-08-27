#!/bin/sh

cd "$(dirname "$0")"
echo 'Git'
python regtest.py -i "../bin/emglken.js --vm=git" glulxercise.regtest
echo 'Glulxe'
python regtest.py -i "../bin/emglken.js --vm=glulxe" glulxercise.regtest
#echo 'Glulxe profiler'
#python regtest.py -i "../bin/emglken.js --profile_filename=glulxprof" glulxercise-profiler.regtest
echo 'Hugo'
python regtest.py -i "../bin/emglken.js" coretest.regtest