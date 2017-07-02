# Unix Makefile for Emglken library

# This generates two files. One, of course, is libemglken.a -- the library
# itself. The other is Make.emglken; this is a snippet of Makefile code
# which locates the Emglken library and associated libraries.
#
# When you install Emglken, you must put libemglken.a in the lib directory,
# and glk.h, glkstart.h, and Make.emglken in the include directory.

# Pick a C compiler.
#CC = cc
#CC = gcc -ansi

CC = emcc

#OPTIONS = -g -Wall
OPTIONS = -O2

CFLAGS = $(OPTIONS) $(INCLUDEDIRS)

GLKLIB = libemglken.a

EMGLKEN_OBJS = \
  main.o rgevent.o rgfref.o rggestal.o \
  rgmisc.o rgstream.o rgstyle.o \
  rgwindow.o rgschan.o rgblorb.o \
  cgunicod.o cgdate.o gi_dispa.o gi_debug.o gi_blorb.o

EMGLKEN_HEADERS = \
  emglken.h gi_debug.h gi_dispa.h

all: $(GLKLIB) Make.emglken

cgunicod.o: cgunigen.c

$(GLKLIB): $(EMGLKEN_OBJS)
	ar r $(GLKLIB) $(EMGLKEN_OBJS)
	ranlib $(GLKLIB)

Make.emglken:
	echo LINKLIBS = $(LIBDIRS) $(LIBS) > Make.emglken
	echo GLKLIB = -lemglken >> Make.emglken

$(EMGLKEN_OBJS): glk.h $(EMGLKEN_HEADERS)

clean:
	rm -f *~ *.o $(GLKLIB) Make.emglken
