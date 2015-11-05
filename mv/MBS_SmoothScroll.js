//=============================================================================
// MBS - Smooth Scroll
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
/*:
	@author Masked
	@plugindesc Makes the map scroll smooth so it looks nicer to the eye.

	<MBS SmoothScroll>
	@help
	===========================================================================
	Introduction
	===========================================================================
	This script makes the map scroll to be a little bit late to reach the 
	player, so it looks smoother.

	===========================================================================
	How to use
	===========================================================================
	This plugin has no plugin commands. Just setup everything as you want.

	===========================================================================
	Credits
	===========================================================================
	- Masked, for creating.

	@param Scroll Margin
	@desc The maximum distance in pixels the scroll will be to the player.
	@default 48

	@param Scroll Speed
	@desc The speed the scroll will adjust to the player coordinates. The higher the faster.
	@default 2
*/

var Imported = Imported || {};

var MBS = MBS || {};
MBS.SmoothScroll = {};

"use strict";

(function ($) {
	//-------------------------------------------------------------------------
	// Setup
	//

	$.Parameters = $plugins.filter(function(p) {return p.description.contains('<MBS SmoothScroll>');})[0].parameters;
	$.Param = $.Param || {};
	$.Param.speed = Number($.Parameters["Scroll Speed"]);
	$.Param.margin = Number($.Parameters["Scroll Margin"]);

	//-------------------------------------------------------------------------
	// Game_Map
	// 

	Game_Map.prototype.setupScroll = function() {
	    this._scroll = {
	    	0: {distance: 0, speed: 4},
	    	2: {distance: 0, speed: 0}, 
	    	4: {distance: 0, speed: 0},
	    	6: {distance: 0, speed: 0},
	    	8: {distance: 0, speed: 0},
	    };
	};

	Game_Map.prototype.startScroll = function(direction, distance, speed) {
		if (direction == 2) {
			this._scroll[8] = {distance: 0, speed: 0};
		} else if (direction == 4) {
			this._scroll[6] = {distance: 0, speed: 0};
		} else if (direction == 6) {
			this._scroll[4] = {distance: 0, speed: 0};
		} else if (direction == 8) {
			this._scroll[2] = {distance: 0, speed: 0};
		}
	    this._scroll[direction] = {distance: distance, speed: speed};
	};

	Game_Map.prototype.updateScroll = function() {
		for (var i = 2; i < 10; i += 2) {
			if (this._scroll[i].distance > 0) {
			    var lastX = this._displayX;
			    var lastY = this._displayY;
			    this.doScroll(i, this.scrollDistance(i));
			    if (this._displayX === lastX && this._displayY === lastY) {
			        this._scroll[i] = {distance: 0, speed: 0};
			    } else {
			        this._scroll[i].distance -= this.scrollDistance(i);
			    }
			}
		}
	};

	Game_Map.prototype.scrollDistance = function(n) {
		if (n) 
			return Math.pow(2, this._scroll[n].speed) / 256;
	    return Math.pow(2, this._scroll[0].speed) / 256;
	};

	//-------------------------------------------------------------------------
	// Game_Player
	// 

	Game_Player.prototype.scrollSpeed = function(distance) {
		return $.Param.speed * distance / $.Param.margin * 2.0;
	};

	Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
	    var x1 = lastScrolledX;
	    var y1 = lastScrolledY;
	    var x2 = this.scrolledX();
	    var y2 = this.scrolledY();
	    var d;
	    if (y2 - this.centerY() > 0.1) {
	    	d = y2 - this.centerY();
	    	e = d * $gameMap.tileHeight();
	    	if (e >= $.Param.margin)
	        	$gameMap.startScroll(2, $gamePlayer.distancePerFrame(), $gamePlayer.realMoveSpeed());
	        else
	        	$gameMap.startScroll(2, d, this.scrollSpeed(e));
	    }
	    if (x2 - this.centerX() < -0.1) {
	    	d = this.centerX() - x2;
	    	e = d * $gameMap.tileWidth();
	        if (e >= $.Param.margin)
	        	$gameMap.startScroll(4, $gamePlayer.distancePerFrame(), $gamePlayer.realMoveSpeed());
	        else
	        	$gameMap.startScroll(4, d, this.scrollSpeed(e));
	    }
	    if (x2 - this.centerX() > 0.1) {
	    	d = x2 - this.centerX();
	    	e = d * $gameMap.tileWidth();
	        if (e >= $.Param.margin)
	        	$gameMap.startScroll(6, $gamePlayer.distancePerFrame(), $gamePlayer.realMoveSpeed());
	        else
	        	$gameMap.startScroll(6, d, this.scrollSpeed(e));
	    }
	    if (y2 - this.centerY() < -0.1) {
	    	d = this.centerY() - y2;
	    	e = d * $gameMap.tileHeight();
	        if (e >= $.Param.margin)
	        	$gameMap.startScroll(8, $gamePlayer.distancePerFrame(), $gamePlayer.realMoveSpeed());
	        else
	        	$gameMap.startScroll(8, d, this.scrollSpeed(e));
	    }
	};

})(MBS.SmoothScroll);

Imported["MBS_SmoothScroll"] = 1.0

if (Imported["MVCommons"]) {
	PluginManager.register("MBS_SmoothScroll", 1.0, "Makes the map scroll smooth so it looks nicer to the eye", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "4-11-2015");
}
