//=============================================================================
// MBS - Map Zoom
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não Modifique!)
// Plugin Specifications (Do not modify!)
//
/*:
 *
 * @author Masked
 * @plugindesc Makes it possible to zoom in and out the game map                        
 * 
 * <MBS MapZoom>
 * @help
 * ===========================================================================
 * Introduction
 * ===========================================================================
 * This script lets you change the game zoom as you want while in the map 
 * scene.
 *
 * ===========================================================================
 * How to use
 * ===========================================================================
 * You can set the map zoom with this plugin command:
 * 
 * MapZoom set x [y]
 * 
 * Just change 'x' and 'y' to the zoom ratio you want (you can use floats).
 * Note that the "y" parameter is optional, if you don't use it then the 
 * script will assume it's equal to "x".
 *
 * You can also use this to reset the zoom (set it to 1.0):
 * MapZoom reset
 *
 * ===========================================================================
 * Credits
 * ===========================================================================
 * - Masked, for creating.
 *
 * @param Reset on map change 
 * @desc If you want the zoom to be reset when the map changes, set this 
 * parameter to true. Set it to false otherwise.
 * @default true
*/
/*:pt
 *
 * @author Masked
 * @plugindesc Torna possível que você dê zoom no mapa durante o jogo.
 * 
 * <MBS MapZoom>
 * @help
 * ===========================================================================
 * Introdução
 * ===========================================================================
 * Esse script permite que você aumente ou diminua o zoom do jogo quando na 
 * cena do mapa.
 *
 * ===========================================================================
 * Utilização
 * ===========================================================================
 * Para definir o zoom do mapa use o seguinte comando:
 * 
 * MapZoom set x [y]
 * 
 * Troque o X e Y pelos valores de zoom que quiser. Você pode usar decimais.
 * Note que o "y" é opcional, e se não for definido o script assumirá que seu 
 * valor é igual a X.
 *
 * Você ainda pode resetar o zoom (definir para 1.0):
 * MapZoom reset
 *
 * ===========================================================================
 * Créditos
 * ===========================================================================
 * - Masked, por criar.
 *
 * @param Reset on map change
 * @desc Caso queira que o zoom seja resetado quando o mapa mudar, deixe 
 * como true. Se não, deixe como false.
 * @default true
 */

var Imported = Imported || {};

var MBS = MBS || {};
MBS.MapZoom = {};

"use strict";

(function ($) {

  $.Parameters = $plugins.filter(function(p) {return p.description.contains('<MBS MapZoom>');})[0].parameters;
  $.Param = $.Param || {};

  //-----------------------------------------------------------------------------
  // Configurações
  //

  // Resetar ao mudar o mapa
  $.Param.resetOnMapChange = ($.Parameters["Reset on map change"].toLowerCase() === "true");

  //-----------------------------------------------------------------------------
  // Game_Map
  //
  // O objeto do mapa do jogo

  // Alias
  var _GameMap_initialize = Game_Map.prototype.initialize;
  var _GameMap_setup = Game_Map.prototype.setup;

  /**
   * Inicialização do objeto
   */
  Game_Map.prototype.initialize = function() {
    _GameMap_initialize.call(this);
    this._zoom = new PIXI.Point(1.0, 1.0);
    this._spriteset = null;
  };

  /**
   * Configuração do objeto
   */
  Game_Map.prototype.setup = function(mapId) {
    _GameMap_setup.call(this);
    if ($.Param.resetOnMapChange)
    	this._zoom = new PIXI.Point(1.0, 1.0);
  };

  /**
   * Definição do zoom do mapa
   */
  Game_Map.prototype.setZoom = function(x, y) {
	this._zoom.x = this._zoom.y = x;
	if (y)
  		this._zoom.y = y;
  	this.onZoomChange(this._spriteset);
  };

  /**
   * Evento de alteração de zoom
   */
  Game_Map.prototype.onZoomChange = function(spriteset) {
  	if (spriteset) {
  		spriteset._tilemap.scale = this.zoom;
  		$gamePlayer.center($gamePlayer.x, $gamePlayer.y);
  	}
  };

  /**
   * Aquisição de cordenadas no mapa pelas cordenadas na tela
   */
  Game_Map.prototype.canvasToMapX = function(x) {
    var tileWidth = this.tileWidth();
    var originX = this.displayX() * tileWidth;
    var mapX = Math.floor((originX + x) / tileWidth / this.zoom.x);
    return this.roundX(mapX);
  };

  /**
   * Aquisição de cordenadas no mapa pelas cordenadas na tela
   */
  Game_Map.prototype.canvasToMapY = function(y) {
    var tileHeight = this.tileHeight();
    var originY = this.displayY() * tileHeight;
    var mapY = Math.floor((originY + y) / tileHeight / this.zoom.y);
    return this.roundY(mapY);
  };

  /**
   * Número de tiles na horizontal na tela
   */
  Game_Map.prototype.screenTileX = function() {
    return Graphics.width / this.tileWidth() / this.zoom.x;
  };

  /**
   * Número de tiles na vertical na teela
   */
  Game_Map.prototype.screenTileY = function() {
    return Graphics.height / this.tileHeight() / this.zoom.y;
  };

  // Zoom
  Object.defineProperty(Game_Map.prototype, "zoom", {
  	get: function() {
  		return this._zoom;
  	}
  });

  //-----------------------------------------------------------------------------
  // Game_Player
  //
  // Classe do jogador

  // Alias
  var _GamePlayer_centerX = Game_Player.prototype.centerX;
  var _GamePlayer_centerY = Game_Player.prototype.centerY;

  Game_Player.prototype.centerX = function() {
    return _GamePlayer_centerX.call(this) / $gameMap.zoom.x;
  };

  Game_Player.prototype.centerY = function() {
    return _GamePlayer_centerY.call(this) / $gameMap.zoom.y;
  };

  //-----------------------------------------------------------------------------
  // Spriteset_Map
  //
  // Spriteset do mapa do jogo

  // Alias
  var _SpritesetMap_createTilemap = Spriteset_Map.prototype.createTilemap;
  var _SpritesetMap_updateTilemap = Spriteset_Map.prototype.updateTilemap;

  /**
   * Atualização do tilemap
   */
  Spriteset_Map.prototype.createTilemap = function() {
    _SpritesetMap_createTilemap.call(this);
    $gameMap._spriteset = this;
  };

  Spriteset_Map.prototype.updateTilemap = function() {
    _SpritesetMap_updateTilemap.call(this);
    //this._tilemap.origin.x *= $gameMap.zoom.x;
    //this._tilemap.origin.y *= $gameMap.zoom.y;
  };

  //-----------------------------------------------------------------------------
  // Plugin command
  //

  // Alias
  var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

  /**
   * Comando de plugin
   */
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
  	_GameInterpreter_pluginCommand.call(this, command, args);
  	if (command == "MapZoom") {
  	  if (args[0] == "set") {
  	  	if (args[1]) {
  	  	  if (args[2]) {
  	  	  	$gameMap.setZoom(Number(args[1]), Number(args[2]))
  	  	  } else {
  	  	  	$gameMap.setZoom(Number(args[1]));
  	  	  }
  	  	}
  	  } else if (args[0] == "reset") {
  	  	$gameMap.setZoom(1.0);
  	  }
  	}
  };

})(MBS.MapZoom);

if (Imported["MVCommons"]) {
  PluginManager.register("MBS_MapZoom", 1.0, "Makes it possible to zoom in and out the game map whenever you want", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "29-10-2015");
}
