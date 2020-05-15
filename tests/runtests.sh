#!/bin/sh

cd "$(dirname "$0")"
echo 'Git'
python regtest.py -i "./testvm ../build/git.js" glulxercise.regtest
echo 'Glulxe'
python regtest.py -i "./testvm ../build/glulxe.js" glulxercise.regtest
echo 'Glulxe profiler'
python regtest.py -i "./testvm ../build/glulxe-profiler.js --profile_filename=glulxprof" glulxercise-profiler.regtest
echo 'Hugo'
python regtest.py -i "./testvm ../build/hugo.js" coretest.regtest