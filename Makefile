# Emglken

# Default to running multiple jobs
JOBS := $(shell nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 1)
MAKEFLAGS = "-j $(JOBS)"

# Add node bin scripts to path
PATH := $(shell npm bin):$(PATH)

CURL = curl -L -s -S

# Mark which rules are not actually generating files
.PHONY: all clean test

all: emglken.zip

clean:
	$(RM) -r ./*.js
#	$(MAKE) -C emglken clean

EMGLKEN_INC = emglken/libemglken.a emglken/library.js emglken/include/*.js

emglken/libemglken.a: emglken/Makefile emglken/*.c emglken/*.h
	$(MAKE) -C emglken

git.js: $(EMGLKEN_INC) git/Makefile git/*.c git/*.h git/git.js
	$(MAKE) -C git
	cp git/git-core.js.* .
	browserify git/git.js --bare --igv x --standalone Git > $@

git.min.js: git.js
	echo '/* Git (Emglken) v$(shell jq -r .git -- versions.json) https://github.com/curiousdannii/emglken */' > $@
	terser -c -m git.js >> $@

glulxe.js: $(EMGLKEN_INC) glulxe/Makefile glulxe/*.c glulxe/*.h glulxe/glulxe.js
	$(MAKE) -C glulxe glulxe-core.js
	cp glulxe/glulxe-core.js.* .
	browserify glulxe/glulxe.js --bare --igv x --standalone Glulxe > $@

glulxe-profiler.js: $(EMGLKEN_INC) glulxe/Makefile glulxe/*.c glulxe/*.h glulxe/glulxe-profiler.js
	$(MAKE) -C glulxe glulxe-profiler-core.js
	cp glulxe/glulxe-profiler-core.js.* .
	browserify glulxe/glulxe-profiler.js --bare --igv x --standalone Glulxe > $@

hugo.js: $(EMGLKEN_INC) hugo/heglk/Makefile hugo/heglk/*.c hugo/heglk/*.h hugo/heglk/hugo.js hugo/source/*.c hugo/source/*.h
	$(MAKE) -C hugo/heglk
	cp hugo/heglk/hugo-core.js.* .
	browserify hugo/heglk/hugo.js --bare --igv x --standalone Hugo > $@

emglken.zip: git.js glulxe.js glulxe-profiler.js hugo.js
	zip -j emglken.zip \
	LICENSE README.md versions.json \
	emglken/include/dispatch.js \
	git.js git-core.js.bin git-core.js.mem \
	glulxe.js glulxe-core.js.bin glulxe-core.js.mem \
	glulxe-profiler.js glulxe-profiler-core.js.bin glulxe-profiler-core.js.mem \
	hugo.js hugo-core.js.bin hugo-core.js.mem

# Run the test suite
test: git.js glulxe.js glulxe-profiler.js hugo.js
	cd tests && python regtest.py -i "./testvm git" glulxercise.regtest
	cd tests && python regtest.py -i "./testvm git -b" glulxercise.regtest
	cd tests && python regtest.py -i "./testvm glulxe" glulxercise.regtest
	cd tests && python regtest.py -i "./testvm glulxe -b" glulxercise.regtest
	cd tests && python regtest.py -i "./testvm glulxe --profile_filename=glulxprof" glulxercise-profiler.regtest
	cd tests && python regtest.py -i "./testvm glulxe --profile_filename=glulxprof -b" glulxercise-profiler.regtest
	cd tests && python regtest.py -i "./testvm hugo" coretest.regtest
	cd tests && python regtest.py -i "./testvm hugo -b" coretest.regtest