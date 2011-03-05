#!/bin/sh

./compile.js -nc \
	--combine src/admin/js/admin.js \
	--compile src/admin/js/admin.min.js \
	--path src/admin/js/libs \
	--path src/admin/js/app \
	--force-commonjs \
	--main app \
	src/admin/js/libs/compat.js^ \
	src/admin/js/libs/jquery-1.5.1.min.js^ \
	src/admin/js/libs/require.js^ \
	src/admin/js/libs/date.js^ \
	src/admin/js/app/pages/*


./compile.js -nc \
	--combine src/admin/js/plugins.js \
	--compile src/admin/js/plugins.min.js \
	--path src/admin/js/plugins \
	--force-commonjs \
	src/admin/js/plugins/*
