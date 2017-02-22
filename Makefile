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
	$(RM) -r cheapglk
	$(RM) -r git/git

cheapglk:
	$(CURL) -o "cheapglk.tar.gz" https://github.com/erkyrath/cheapglk/archive/master.tar.gz
	tar xf cheapglk.tar.gz
	mv cheapglk-master cheapglk
	rm cheapglk.tar.gz

git/git:
	$(CURL) -o "Git.tar.gz" https://github.com/DavidKinder/Git/archive/master.tar.gz
	tar xf Git.tar.gz
	mv Git-master git/git
	rm Git.tar.gz

git.js: cheapglk git/git emglken/* git/*
	cp git/Makefile git/emgiten.*    git/git/
	$(MAKE) -C git/git
	cp git/git/git.js $@

tests/regtest.py:
	$(CURL) -o tests/regtest.py https://raw.githubusercontent.com/erkyrath/plotex/master/regtest.py

# Run the test suite
test: tests/regtest.py git.js
	cd tests && python regtest.py glulxercise.regtest