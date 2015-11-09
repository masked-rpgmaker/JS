//=============================================================================
// MBS - DLC (v0.1)
//-----------------------------------------------------------------------------
// by Masked
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
This plugin allows you to create DLC packages for your game in a simple 
way.

===========================================================================
How to use
===========================================================================
Make your game as you would usually do, when you are done just add the 
files you want to be replaced when the DLC is used into a .zip file. 
Don't forget to put everything in the right directories.

If you wanted to replace the Map 3, for example, you'd copy the 
data/Map003.json file from your game and paste it in the .zip 'data/' 
folder.
	
You also need to create a info.json file in the .zip root directory	so you 
can read its information from inside the game using the DLC .info property.
It's necessary to define a "name" property in the info file, otherwise your
DLC resources will be placed at the common folder and that may cause 
incompatibility. Sample info.json file:

{
	"name":   "Sample DLC name",
	"desc":   "A sample DLC.",
	"author": "Masked",
	"version": 1.0
}

To use the DLC, just put the .zip file in your game's ./dlc/ folder, and
then the images, audio and data from the DLC will replace the game's ones.

===========================================================================
Credits
===========================================================================
- Masked, for creating

	@param DLC Folder
	@desc The folder where the DLC .zip files will be placed
	@default ./dlc/
*/
/*:pt
	@author Masked
	@plugindesc Implementa um sistema de DLC que carrega recursos (imagens e 
	audio) e dados de um arquivo .zip e usa no jogo.
	<MBS DLC>

	@help
===========================================================================
Introdução
===========================================================================
Esse plugin permite que você empacote recursos e dados dentro de um arquivo
ZIP e substitua os existentes no jogo colocando o arquivo numa pasta de 
onde é carregado automaticamente.

===========================================================================
Como usar
===========================================================================
Faça seu jogo como faria normalmente, fazendo as alterações que quiser que 
a DLC faça.
Depois, adicione todos os arquivos que foram alterados e todos que forem 
necessários para o funcionamento da DLC e que não estejam no jogo por 
padrão em suas respectivas pastas dentro de um arquivo .zip.

Depois é só criar um arquivo info.json na pasta raíz do ZIP com as 
informações da DLC, é necessário definir uma propriedade "name" ou os 
arquivos extraídos dela serão salvos na pasta 'Common'. 
Exemplo de info.json:

{
	"name":   "Nome da DLC",
	"desc":   "Uma DLC de exemplo.",
	"author": "Masked",
	"version": 1.0
}

Para usar a DLC, só ponha o .zip na pasta /dlc/ do seu jogo e aí os arquivos
de imagem, audio e dados do jogo serão substituidos pelos da DLC sempre que
possível.

===========================================================================
Créditos
===========================================================================
- Masked, por criar

	@param DLC Folder
	@desc A pasta onde as DLCs serão colocadas.
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
		DLC.list.unshift(this);
	};

	DLC.loadGameFile = function (name, callback) {
		for (var i = 0; i < DLC.list.length; i++) {
			if (DLC.list[i].fileExists(name))
				return callback(DLC.list[i], name);
		}
		return null;
	};

	Object.defineProperty(DLC.prototype, "info", {
		get: function() {
			if (this.fileExists("info.json"))
				return JSON.parse(this._src.file("info.json").asText());
			return { "name": "Common" };
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
		if (AudioManager.shouldUseHtml5Audio() && name.contains('/bgm/')) {
			Html5Audio.setup(fn);
			return Html5Audio;
		}
		else
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
	    var data;

	    data = DLC.loadGameFile("data/" + src, function(dlc, name) {
	    	return dlc.loadData(name);
	    });

	    if (data) {
	    	window[name] = data;
	    	DataManager.onLoad(data);
	    } else
	    	DataManager_loadDataFile.apply(this, arguments);
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

	    	var bitmap = DLC.loadGameFile(path, function (dlc, name) {
	    		var b = dlc.loadImage(path);
	    		b.smooth = false;
	    		b.addLoadListener(function() {
			        b.rotateHue(hue);
			    });
			    return b;
	    	});

	        this._cache[key] = bitmap || ImageManager_loadNormalBitmap.apply(this, arguments);
	    }
	    return this._cache[key];
	};

	//------------------------------------------------------------------------
	// AudioManager
	//
	// Module for controling the game audio

	var AudioManager_createBuffer = AudioManager.createBuffer;

	AudioManager.createBuffer = function(folder, name) {
	    var ext = this.audioFileExt();
	    var url = this._path + folder + '/' + encodeURIComponent(name) + ext;

	    var audio = DLC.loadGameFile(url, function (dlc, name) {
	    	return dlc.loadAudio(name);
	    });

	    if (audio)
	    	return audio;

	    return AudioManager_createBuffer.apply(this, arguments);
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

Imported["MBS_DLC"] = 0.1

if (Imported["MBS_DLC"]) {
  PluginManager.register("MBS_DLC", 0.1, "Implements a DLC system that uses .zip files.", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "28-10-2015");
}
