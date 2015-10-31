//=============================================================================
// MBS - Mobile Dir Pad
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
// Plugin specifications (Do not modify!)
//
/*:
 @author Masked
 @plugindesc This script creates a DirPad and a action button for touch
 devices in order to make the movement better.
 <MBS MobileDirPad>
 @help
 =============================================================================
 Introduction
 =============================================================================
 This script creates DirPad and Action Button images on touch devices to make
 the controls easier to use.

 =============================================================================
 How to use
 =============================================================================
 Not much to say here, just setup the plugin correctly and enable it.

 =============================================================================
 Credits
 =============================================================================
 - Masked, for creating

 @param DPad Image
 @desc The file path for the DPad image
 @default ./img/system/DirPad.png

 @param ActionButton Image
 @desc The file path for the Action Button image
 @default ./img/system/ActionButton.png

 @param CancelButton Image
 @desc The file path for the Cancel Button image
 @default ./img/system/CancelButton.png

 @param DPad Position
 @desc The DirPad image position on screen (on format x; y)
 @default 128; 452

 @param ActionButton Position
 @desc The ActionButton image position on screen (on format x; y)
 @default 720; 452

 @param CancelButton Position
 @desc The ActionButton image position on screen (on format x; y)
 @default 752; 484

 @param Opacity
 @desc The opacity used on the DPad and Action Button
 @default 255

 @param Hide Duration
 @desc Number of frames the UI hiding take
 @default 15

*/

var Imported = Imported || {};
var MBS = MBS || {};

MBS.MobileDirPad = {};

"use strict";

(function ($) {

	Utils.isMobileDevice = function() {
		return true;
	};

	//-----------------------------------------------------------------------------
	// Setup

	$.Parameters = $plugins.filter(function(p) {return p.description.contains('<MBS MobileDirPad>');})[0].parameters;
	$.Param = $.Param || {};

	$.Param.dpad = $.Parameters["DPad Image"];
	$.Param.button = $.Parameters["ActionButton Image"];
	$.Param.cButton = $.Parameters["CancelButton Image"];

	var dposition = $.Parameters["DPad Position"].split(";");
	$.Param.dpadPosition = new PIXI.Point(Number(dposition[0]), Number(dposition[1]));

	var bposition = $.Parameters["ActionButton Position"].split(";");
	$.Param.buttonPosition = new PIXI.Point(Number(bposition[0]), Number(bposition[1]));

	var cposition = $.Parameters["CancelButton Position"].split(";");
	$.Param.cButtonPosition = new PIXI.Point(Number(cposition[0]), Number(cposition[1]));

	$.Param.opacity = Number($.Parameters["Opacity"]);

	$.Param.hideDuration = Number($.Parameters["Hide Duration"]);


	//-----------------------------------------------------------------------------
	// Sprite_DirPad
	//
	// Sprite for the Directional Pad

	function Sprite_DirPad() {
		this.initialize.apply(this, arguments);
	}

	Sprite_DirPad.prototype = Object.create(Sprite_Base.prototype);
	Sprite_DirPad.prototype.constructor = Sprite_DirPad;

	Sprite_DirPad.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this.bitmap = ImageManager.loadNormalBitmap($.Param.dpad, 0);
		this.anchor.y = 0.5;
		this.anchor.x = 0.5;
		this.z = 5;
		this._lastDir = null;
	};

	Sprite_DirPad.prototype.update = function() {
		Sprite_Base.prototype.update.call(this);
		this.updateMovement();
		this.updateTouch();
	};

	Sprite_DirPad.prototype.updateMovement = function() {
		if (this._moveDuration > 0) {
			this.x += this._moveSpeed;
			this._moveDuration--;
		}
	};

	Sprite_DirPad.prototype.updateTouch = function() {
		if (this._lastDir) {
			Input._currentState[this._lastDir] = false;
			this._lastDir = null;
		}
		if (TouchInput.isPressed()) {
			var sx = this.x - this.width * this.anchor.x;
			var sy = this.y - this.height * this.anchor.y;
			if (new PIXI.Rectangle(sx + 104, sy + 52, 52, 52).contains(TouchInput.x,TouchInput.y)) {
				Input._currentState['right'] = true;
				this._lastDir = 'right';
			} else if (new PIXI.Rectangle(sx, sy + 52, 52, 52).contains(TouchInput.x,TouchInput.y)) {
				Input._currentState['left'] = true;
				this._lastDir = 'left';
			} else if (new PIXI.Rectangle(sx + 52, sy, 52, 52).contains(TouchInput.x,TouchInput.y)) {
				Input._currentState['up'] = true;
				this._lastDir = 'up';
			} else if (new PIXI.Rectangle(sx + 52, sy + 104, 52, 52).contains(TouchInput.x,TouchInput.y)) {
				Input._currentState['down'] = true;
				this._lastDir = 'down';
			}
		}
	};

	Sprite_DirPad.prototype.hide = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = 0 - this.width * (1 + this.anchor.x);
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	};

	Sprite_DirPad.prototype.show = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = $.Param.dpadPosition.x;
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	};

	//-----------------------------------------------------------------------------
	// Sprite_ActionButton
	//
	// Sprite for the action button

	function Sprite_Button() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Button.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Button.prototype.constructor = Sprite_Button;

	Sprite_Button.prototype.initialize = function(type) {
		Sprite_Base.prototype.initialize.call(this);
		this._type = type;
		this.bitmap = ImageManager.loadNormalBitmap(type == 0 ? $.Param.button : $.Param.cButton, 0);
		this.anchor.y = 0.5;
		this.anchor.x = 0.5;
		this._moveDuration = 0;
		this._moveSpeed = 0;
		this.z = 5;
	};

	Sprite_Button.prototype.update = function() {
		Sprite_Base.prototype.update.call(this);
		this.updateMovement();
		this.updateTouch();
	};

	Sprite_Button.prototype.updateMovement = function() {
		if (this._moveDuration > 0) {
			this.x += this._moveSpeed;
			this._moveDuration--;
		}
	};

	Sprite_Button.prototype.updateTouch = function() {
		if (this._type == 0 && TouchInput.isPressed()) {
			var rect = new PIXI.Rectangle(this.x - this.width * this.anchor.x, this.y - this.height * this.anchor.y, this.width, this.height);
			Input._currentState['ok'] = rect.contains(TouchInput.x, TouchInput.y);
		} else {
			Input._currentState['ok'] = false;
		}
	};

	Sprite_Button.prototype.hide = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = Graphics.width + this.width * this.anchor.x;
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	}

	Sprite_Button.prototype.show = function() {
		this._moveDuration = $.Param.hideDuration;
		var dest = this._type == 0 ? $.Param.buttonPosition.x : $.Param.cButtonPosition.x;
		this._moveSpeed = (dest - this.x) / this._moveDuration;
	}

	//-----------------------------------------------------------------------------
	// Scene_Map
	//
	// The map scene

	var Scene_Map_createMessageWindows = Scene_Map.prototype.createMessageWindow;
	var Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
	var Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;

	Scene_Map.prototype.createDisplayObjects = function() {
	    Scene_Map_createDisplayObjects.apply(this, arguments);
	    if (Utils.isMobileDevice()) {
		    this.createDirPad();
		    this.createActionButton();
		}
	};

	Scene_Map.prototype.createMessageWindow = function() {
		Scene_Map_createMessageWindows.call(this);
		var oldStartMessage = this._messageWindow.startMessage;
		var oldTerminateMessage = this._messageWindow.terminateMessage;
		var scene = this;
		this._messageWindow.startMessage = function() {
			oldStartMessage.apply(this, arguments);
			scene.hideUserInterface();
		};
		Window_Message.prototype.terminateMessage = function() {
		    oldTerminateMessage.apply(this, arguments);
		    scene.showUserInterface();
		};
	};

	Scene_Map.prototype.createDirPad = function() {
		this._dirPad = new Sprite_DirPad();
		this._dirPad.opacity = $.Param.opacity;

		this._dirPad.x = $.Param.dpadPosition.x;
		this._dirPad.y = $.Param.dpadPosition.y;

		this.addChild(this._dirPad);
	};

	Scene_Map.prototype.hideUserInterface = function() {
		if (Utils.isMobileDevice()) {
			this._dirPad.hide();
			this._aButton.hide();
		}
	};

	Scene_Map.prototype.processMapTouch = function() {
		if (!Utils.isMobileDevice()) Scene_Map_processMapTouch.apply(this, arguments);
	};

	Scene_Map.prototype.showUserInterface = function() {
		if (Utils.isMobileDevice()) {
			this._dirPad.show();
			this._aButton.show();
		}
	};

	Scene_Map.prototype.createActionButton = function() {
		this._aButton = new Sprite_Button(0);
		this._aButton.opacity = $.Param.opacity;

		this._aButton.x = $.Param.buttonPosition.x;
		this._aButton.y = $.Param.buttonPosition.y;

		this.addChild(this._aButton);
	};

})(MBS.MobileDirPad);

Imported["MBS_MobileDirPad"] = 1.0;

if (Imported["MVCommons"]) {
  	PluginManager.register("MBS_MobileDirPad", 1.0, "Shows a DirPad and action buttons when using mobile devices", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "31-10-2015");
}
