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

EMGLKEN_INC = emglken/emglken_vm.js emglken/libemglken.a emglken/library.js

emglken/libemglken.a: emglken/Makefile emglken/*.c emglken/*.h
	$(MAKE) -C emglken

git.js: $(EMGLKEN_INC) git/Makefile git/*.c git/*.h git/git.js
	$(MAKE) -C git
	cp git/git-core.js.* .
	browserify git/git.js --bare --igv x --standalone Git > $@

git.min.js: git.js
	echo '/* Git (Emglken) v$(shell jq -r .git -- versions.json) https://github.com/curiousdannii/emglken */' > $@
	babili git.js >> $@

hugo.js: $(EMGLKEN_INC) hugo/heglk/Makefile hugo/heglk/*.c hugo/heglk/*.h hugo/heglk/*.js hugo/source/*.c hugo/source/*.h
	$(MAKE) -C hugo/heglk
	cp hugo/heglk/hugo.js* .

emglken.zip: git.min.js hugo.js
	zip -j emglken.zip emglken/emglken_dispatch.js git.min.js git-core.js.bin git-core.js.mem hugo.js hugo.js.mem versions.json

hugo.zip: hugo.js
	zip -j hugo.zip emglken/emglken_dispatch.js hugo.js hugo.js.mem versions.json

tests/regtest.py:
	$(CURL) -o tests/regtest.py https://raw.githubusercontent.com/erkyrath/plotex/master/regtest.py

# Run the test suite
test: tests/regtest.py git.js
	cd tests && python regtest.py glulxercise.regtest
	cd tests && python regtest.py glulxercise-bundled.regtest
