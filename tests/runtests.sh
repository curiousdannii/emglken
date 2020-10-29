#!/bin/sh

cd "$(dirname "$0")"
echo 'Git'
python regtest.py -i "../bin/emglken.js --vm=git" glulxercise.ulx.regtest
echo 'Glulxe'
python regtest.py -i "../bin/emglken.js --vm=glulxe" glulxercise.ulx.regtest
#echo 'Glulxe profiler'
#python regtest.py -i "../bin/emglken.js --profile_filename=glulxprof" glulxercise-profiler.regtest
echo 'Hugo'
python regtest.py -i "../bin/emglken.js" coretest.hex.regtest
echo 'TADS 2'
python regtest.py -i "../bin/emglken.js" ditch.gam.regtest
echo 'TADS 3'
python regtest.py -i "../bin/emglken.js" ditch3.t3.regtest