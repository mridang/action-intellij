#!/bin/bash

set -e

pwd
ls -lah
export
ls -lah /script
/home/ijinspector/idea-IC/bin/inspect.sh . ./Default.xml . -d . -v2
ls -lah
