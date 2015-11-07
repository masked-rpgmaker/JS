//=============================================================================
// MBS - DLC (v0.1)
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
// Plugin specifications (Do not modify!)
//
/*:
	@author Masked
	@plugindesc Implements a DLC system that uses .zip files to add resources
	and stuff to your game without needing to rebuild it.
	<MBS DLC>

	@help
	===========================================================================
	Introduction
	===========================================================================

	@param DLC Folder
	@desc The folder where the DLC .zip files will be placed
	@default ./dlc/
*/

var Imported = Imported || {};

var MBS = MBS || {};
MBS.DLC = {};

"use strict";

(function ($) {

	//------------------------------------------------------------------------
	// Setup
	//

	// Parameters
	$.Parameters = $plugins.filter(function(p) {return p.description.contains('<MBS DLC>');})[0].parameters;

	$.Param = $.Param || {};
	$.Param.folder = $.Parameters["DLC Folder"];

	// Require JSZip
	var JSZip = require("./js/libs/jszip");

	//------------------------------------------------------------------------
	// DLC
	//
	// Object that represents a DLC

	function DLC() {
		this.initialize.apply(this, arguments);
	}

	DLC.list = [];

	DLC.prototype.initialize = function (zip) {
		this._src = zip;
		DLC.list.push(this);
	};

	Object.defineProperty(DLC.prototype, "info", {
		get: function() {
			return JSON.parse(this._src.file("info.json").asText());
		}
	});

	DLC.prototype.loadNormalFile = function (name) {
		var file = this._src.file(name);
		if (!file)
			throw new Error("Could not find file `%1' on DLC".format(name));
		return file;
	};

	DLC.prototype.fileExists = function (name) {
		return !!this._src.file(name);
	};

	DLC.prototype.loadData = function (name) {
		return JSON.parse(this.loadNormalFile(name).asText());
	};

	DLC.prototype.loadPlugin = function (name) {
		return this.loadNormalFile(name).asText();
	};

	DLC.prototype.loadImage = function (name) {
		var fs = require('fs');
		var pn = $.dlcPath + "/tmp/%1/".format(this.info.name)
		if (!fs.existsSync(pn)) {
			if (!fs.existsSync($.dlcPath + "/tmp/"))
				fs.mkdirSync($.dlcPath + "/tmp/");
			fs.mkdirSync(pn);
		}
		var fn = pn + ".mbsdlc.img%1.temp".format(Math.random() * 0xFFFFFFFF);

		fs.writeFileSync(fn, this.loadNormalFile(name).asBinary(), 'binary');

		return Bitmap.load(fn);
	};

	DLC.prototype.loadAudio = function (name) {
		var fs = require('fs');
		var pn = $.dlcPath + "/tmp/%1/".format(this.info.name)
		if (!fs.existsSync(pn)) {
			if (!fs.existsSync($.dlcPath + "/tmp/"))
				fs.mkdirSync($.dlcPath + "/tmp/");
			fs.mkdirSync(pn);
		}
		var fn = pn + ".mbsdlc.audio%1.temp".format(Math.random() * 0xFFFFFFFF);

		fs.writeFileSync(fn, this.loadNormalFile(name).asBinary(), 'binary');

		return new WebAudio(fn);
	};

	//------------------------------------------------------------------------
	// Module functions
	//

	$.loadFromFile = function(name) {
		var fs = require('fs');
		var filePath = $.dlcPath + "/" + name;

		var data = null;

		if (fs.existsSync(filePath))
			data = fs.readFileSync(filePath);
		else 
			return console.warn("Could not find `" + filePath + "'!");
		

		return $.loadFromData(data);
	};

	Object.defineProperty($, "dlcPath", {
		get: function() {
			var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, "/" + $.Param.folder);

		    if (path.match(/^\/([A-Z]\:)/))
		        path = path.slice(1);
		    
		    return decodeURIComponent(path);
		}
	});

	$.loadFromData = function(data) {
		if (!data)
			return console.warn("Invalid DLC data");

		var zip = new JSZip(data);

		var dlc = new DLC(zip);
		return dlc;
	};

	$.loadAll = function() {
		var fs = require('fs');

		var files = fs.readdirSync($.dlcPath);
		files.forEach(function (file) {
			if (file.contains('.zip')) {
				DLC.list.push($.loadFromFile(file));
			}
		});
	};

	//------------------------------------------------------------------------
	// DataManager
	//
	// The module that controls game data

	var DataManager_loadDataFile = DataManager.loadDataFile;

	DataManager.loadDataFile = function(name, src) {
	    DataManager_loadDataFile.apply(this, arguments);
	    DLC.list.forEach(function(dlc) {
	    	if (dlc.fileExists("data/" + src)) {
	    		window[name] = dlc.loadData("data/" + src);
	    		DataManager.onLoad(window[name]);
	    	}
	    });
	};

	//------------------------------------------------------------------------
	// ImageManager
	//
	// The module that controls the game images

	var ImageManager_loadNormalBitmap = ImageManager.loadNormalBitmap;

	ImageManager.loadNormalBitmap = function(path, hue) {
	    var key = path + ':' + hue;
	   	if (bitmap) return bitmap;
	    if (!this._cache[key]) {
	    	var bitmap;
	    	DLC.list.forEach(function (dlc) {
	    		console.log(dlc);
	    		if (dlc.fileExists(path)) {
	    			bitmap = dlc.loadImage(path);
	    			bitmap.smooth = false;
	    			bitmap.addLoadListener(function() {
			            bitmap.rotateHue(hue);
			        });
	    		}
	    	});

	        this._cache[key] = bitmap || ImageManager_loadNormalBitmap.apply(this, arguments);
	    }
	    return this._cache[key];
	};

	//------------------------------------------------------------------------
	// window
	//
	// The game window

	// Alias
	var old_window_unload = window.onunload;

	window.onunload = function() {
		if (old_window_unload)
			old_window_unload.apply(this, arguments);

		var fs = require('fs');
		var path = require("path");

		var rmdir = function(dir) {
			var list = fs.readdirSync(dir);
			for(var i = 0; i < list.length; i++) {
				var filename = path.join(dir, list[i]);
				var stat = fs.statSync(filename);
				
				if(filename == "." || filename == "..") {
				} else if(stat.isDirectory()) {
					rmdir(filename);
				} else {
					fs.unlinkSync(filename);
				}
			}
			fs.rmdirSync(dir);
		};

		rmdir($.dlcPath + "/tmp/");
	};

	MBS.DLC.loadAll();

})(MBS.DLC);

MBS.DLC.loadAll();

if (Imported["MBS_DLC"]) {
  PluginManager.register("MBS_DLC", 1.0, "Implements a DLC system that uses .zip files.", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "28-10-2015");
}
