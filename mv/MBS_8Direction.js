//=============================================================================
// MBS - 8 Direction
//-----------------------------------------------------------------------------
// by Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
// Plugin specifications (Do not modify!)
//
/*:
 @author Masked
 @plugindesc This script makes the character to walk diagonally when two directional buttons are pressed together.
 <MBS Diagonal>
 @help
 =============================================================================
 Introduction
 =============================================================================
 This script makes the character to walk diagonally when two directional 
 buttons are pressed together.

 =============================================================================
 How to use
 =============================================================================
 Just enable it on the plugin manager and be happy /o/

 =============================================================================
 Credits
 =============================================================================
 - Masked, for creating

*/

var Imported = Imported || {};

Game_Player.prototype.getInputDirection = function() {
    return Input.dir8;
};

Game_Player.prototype.getHorzDirection = function (direction) {
	if (direction == 9 || direction == 3)
		return 6;
	else
		return 4;
};

Game_Player.prototype.getVertDirection = function (direction) {
	if (direction == 1 || direction == 3)
		return 2;
	else
		return 8;
};

Game_Player.prototype.executeMove = function(direction) {
	if (direction % 2 == 0)
    	this.moveStraight(direction);
    else
    	this.moveDiagonally(this.getHorzDirection(direction), this.getVertDirection(direction))
};

Imported["MBS_8Dir"] = 1.0;
