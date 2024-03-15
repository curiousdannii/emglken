#!/bin/sh

cd "$(dirname "$0")"

if [ ! -f regtest.py ]; then
    wget -q https://github.com/erkyrath/plotex/raw/master/regtest.py
fi

# echo 'Bocfel'
# python regtest.py -i "../bin/emglken.js" praxix.z5.regtest -t 10
# python regtest.py -i "../bin/emglken.js --rem=1" advent.z5.regtest -t 10
echo 'Git'
python regtest.py -i "../bin/emglken.js --vm=git" glulxercise.ulx.regtest -t 10
python regtest.py -i "../bin/emglken.js --rem=1 --vm=git" advent.ulx.regtest -t 10
echo 'Glulxe'
python regtest.py -i "../bin/emglken.js --vm=glulxe" glulxercise.ulx.regtest -t 10
python regtest.py -i "../bin/emglken.js --rem=1 --vm=glulxe" advent.ulx.regtest -t 10
rm adventtest
#echo 'Glulxe profiler'
#python regtest.py -i "../bin/emglken.js --profile_filename=glulxprof" glulxercise-profiler.regtest
echo 'Hugo'
python regtest.py -i "../bin/emglken.js" coretest.hex.regtest -t 20
python regtest.py -i "../bin/emglken.js --rem=1" colossal.hex.regtest -t 10
rm hugotest
echo 'Scare'
python regtest.py -i "../bin/emglken.js --rem=1" Hamper.taf.regtest -t 10
rm scaretest
# echo 'TADS 2'
# python regtest.py -i "../bin/emglken.js --rem=1" ditch.gam.regtest -t 20
# echo 'TADS 3'
# python regtest.py -i "../bin/emglken.js --rem=1" ditch3.t3.regtest -t 20
