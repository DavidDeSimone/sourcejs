{
    "targets": [
	{
	    "sources": [
		"hg.cpp"
	    ],
	    "include_dirs": [
		"./"
	    ],
	    "target_name": "hg",
	    "cflags" : [ "-std=c++14", "-stdlib=libc++" ],
	    "conditions": [
		[ 'OS!="win"', {
		    "cflags+": [ "-std=c++14" ],
		    "cflags_c+": [ "-std=c++14" ],
		    "cflags_cc+": [ "-std=c++14" ],
		}],
		[ 'OS=="mac"', {
		    "xcode_settings": {
			"OTHER_CPLUSPLUSFLAGS" : [ "-std=c++14", "-stdlib=libc++" ],
			"OTHER_LDFLAGS": [ "-stdlib=libc++" ],
			"MACOSX_DEPLOYMENT_TARGET": "10.7"
		    },
		}],
	    ],
	}	
    ]
}
