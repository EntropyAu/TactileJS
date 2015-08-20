#!/usr/bin/env bash

# A Script to setup a development environment on Mac OSX

function ensureHomebrew {
  if ! type brew >/dev/null 2>&1 ; then
    echo "** I can't find Homebrew. Installing it now. **"
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi
}

function runDevServer {
  python -m SimpleHTTPServer &
}

function runTscServer {
  pushd examples/workshopPlanner
  tsc -w &
  popd
}

echo
echo "Checking to see if your Mac OSX development environment is ready to roll."
echo

if ! type node >/dev/null 2>&1 ; then
  echo "** I can't find Node. Installing it via Homebrew now. **"

  ensureHomebrew

  echo "** Installing Node via Homebrew **"
  brew install node
fi

if ! type tsc >/dev/null 2>&1 ; then
   echo "** I can't find tsc on the path. Installing it via npm. **"
   npm install -g tsc
fi

echo
echo "** Kicking off development"
echo

runTscServer
runDevServer

open http://localhost:8000/examples/workshopPlanner/workshopPlanner.html
