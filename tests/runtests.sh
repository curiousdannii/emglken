#!/bin/sh

cd "$(dirname "$0")"
echo 'Bocfel'
python regtest.py -i "../bin/emglken.js" praxix.z5.regtest
echo 'Git'
python regtest.py -i "../bin/emglken.js --vm=git" glulxercise.ulx.regtest
echo 'Glulxe'
python regtest.py -i "../bin/emglken.js --vm=glulxe" glulxercise.ulx.regtest
#echo 'Glulxe profiler'
#python regtest.py -i "../bin/emglken.js --profile_filename=glulxprof" glulxercise-profiler.regtest
echo 'Hugo'
python regtest.py -i "../bin/emglken.js" coretest.hex.regtest
python regtest.py -i "../bin/emglken.js --rem=1" colossal.hex.regtest
echo 'TADS 2'
python regtest.py -i "../bin/emglken.js --rem=1" ditch.gam.regtest -t 20
echo 'TADS 3'
python regtest.py -i "../bin/emglken.js --rem=1" ditch3.t3.regtest -t 20

rm hugotest.glksave tadstest.glksave