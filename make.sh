#!/bin/sh

./compile.js -nc \
	--combine src/admin/js/compiled/admin.js \
	--compile src/admin/js/compiled/admin.min.js \
	--path src/admin/js/libs \
	--path src/admin/js/app \
	--force-commonjs \
	--main app \
	src/admin/js/libs/compat.js^ \
	src/admin/js/libs/jquery-1.5.1.min.js^ \
	src/admin/js/libs/require.js^ \
	src/admin/js/libs/date.js^ \
	src/admin/js/app/screens/*


./compile.js -nc \
	--combine src/admin/js/compiled/plugins.js \
	--compile src/admin/js/compiled/plugins.min.js \
	--path src/admin/js \
	--force-commonjs \
	src/admin/js/plugins/*
