# Emglken

# Default to running multiple jobs
JOBS := $(shell nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 1)
MAKEFLAGS = "-j $(JOBS)"

CURL = curl -L -s -S

# Mark which rules are not actually generating files
.PHONY: all clean test

all: git.js

clean:
	$(RM) -r ./*.js
	$(RM) -r git/git
	$(MAKE) -C emglken clean

EMGLKEN_INC = emglken/Makefile emglken/*.c emglken/*.h emglken/*.js
emglken/libemglken.a: $(EMGLKEN_INC)
	$(MAKE) -C emglken

git/git:
	$(CURL) -o "Git.tar.gz" https://github.com/DavidKinder/Git/archive/master.tar.gz
	tar xf Git.tar.gz
	mv Git-master git/git
	rm Git.tar.gz

git.js: emglken/Make.emglken git/git emglken/* git/*
	-cp git/* git/git/
	$(MAKE) -C git/git
	cp git/git/git.js* .
	cp git.js.mem tests/

hugo.js: emglken/*.a emglken/*.js hugo/heglk/Makefile hugo/heglk/*.c hugo/source/*.c
	$(MAKE) -C hugo/heglk
	cp hugo/heglk/hugo.js* .
	cp hugo.js.mem tests/

tests/regtest.py:
	$(CURL) -o tests/regtest.py https://raw.githubusercontent.com/erkyrath/plotex/master/regtest.py

# Run the test suite
test: tests/regtest.py git.js
	cd tests && python regtest.py glulxercise.regtest
