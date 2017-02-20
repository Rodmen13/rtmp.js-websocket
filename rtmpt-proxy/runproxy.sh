#!/bin/sh
mitmproxy -p 1935 -r http://$1:1935 -s xhr.py

