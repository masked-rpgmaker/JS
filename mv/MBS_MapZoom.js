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
 * MapZoom set x [y [duration n]]
 * 
 * Just change 'x' and 'y' to the zoom ratio you want (you can use floats).
 * Note that the "y" parameter is optional, if you don't use it then the 
 * script will assume it's equal to "x". If you want to define the zoom 
 * duration you can add a third parameter 'duration' followed by the number 
 * of frames the zoom operation will last. You can also add 'duration' as the
 * second parameter so that the 'y' zoom will be equal to the 'x'. If no
 * duration is set, it will be assumed it's 60 frames.
 * E.g.:
 * MapZoom set 2.0 duration 120
 * MapZoom set 2.0 1.5 duration 20
 *
 * If you want the zoom to be centralized on a specific X, Y coordinate or an
 * event, use this command:
 * MapZoom center x y
 * MapZoom center event id
 *
 * Just replace the 'x' and 'y' or 'id' for the values you want. E.g.:
 * MapZoom center 5 7
 * MapZoom center event 3
 *
 * To center on the player, use reset:
 * MapZoom center reset
 *
 * You can also use this to reset the zoom (set it to 1.0):
 * MapZoom reset [d]
 *
 * This will also reset the zoom center position.
 * If you want, you can choose the reset duration just changing 'd' for the 
 * number of frames you want it to take.
 * E.g.:
 * MapZoom reset 30
 *
 * If you want some picture to zoom along with the map, add "[Zoom]" to its 
 * name.
 * E.g.:
 * "img/pictures/SamplePicture1 [Zoom].png"
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
 * MapZoom set x [y [duration d]]
 * 
 * Troque o X e Y pelos valores de zoom que quiser. Você pode usar decimais.
 * Note que o "y" é opcional, e se não for definido o script assumirá que seu 
 * valor é igual a X. Se você quiser, adicione um parâmetro 'duration' seguido
 * pelo número de frames que a operação deve levar, se a duração não for 
 * especificada ela será 60.
 * 
 * Exemplos:
 * MapZoom set 2.0 duration 120
 * MapZoom set 2.0 1.5 duration 20
 *
 * Se você quiser, pode centralizar a câmera do zoom em um evento ou 
 * coordenada usando esse comando:
 *
 * MapZoom center x y
 * MapZoom center event id
 *
 * Só troque o 'x' e 'y' ou 'id' pelos valores que quiser.
 * Exemplos:
 * MapZoom center 5 7
 * MapZoom center event 3
 *
 * Para centralizar no jogador, use o reset:
 * MapZoom center reset
 *
 * Você pode ainda resetar o zoom (mudar para 1.0):
 *
 * MapZoom reset [d]
 *
 * Se quiser, troque o '[d]' pelo número de frames que quiser que a operação
 * dure.
 *
 * Exemplos:
 * MapZoom reset 30
 * MapZoom reset
 *
 * Se quiser que uma picture seja afetada pelo zoom do mapa, adicione [Zoom] 
 * ao nome dela.
 * Exemplo:
 * "img/pictures/Imagem1 [Zoom].png"
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
  var _GameMap_update = Game_Map.prototype.update;

  /**
   * Inicialização do objeto
   */
  Game_Map.prototype.initialize = function() {
    _GameMap_initialize.call(this);
    Game_Map._destZoom = Game_Map._destZoom || new PIXI.Point(0, 0);
    Game_Map._zoomTime = 0;
    Game_Map._zoomDuration = Game_Map._zoomDuration || 0;
    Game_Map._zoom = Game_Map._zoom || new PIXI.Point(1.0, 1.0);
    Game_Map._zoomCenter = null;
    Game_Map._spriteset = null;
  };

  /**
   * Configuração do objeto
   */
  Game_Map.prototype.setup = function(mapId) {
    _GameMap_setup.call(this, mapId);
    if ($.Param.resetOnMapChange)
    	Game_Map._zoom = new PIXI.Point(1.0, 1.0);
  };

  Game_Map.prototype.update = function () {
  	_GameMap_update.apply(this, arguments);
  	if (Game_Map._zoomDuration > Game_Map._zoomTime) {
	  Game_Map._zoom.x += Game_Map._spdZoom.x;
	  Game_Map._zoom.y += Game_Map._spdZoom.y;
      Game_Map._zoomDuration--;
      this.onZoomChange();
	} if (Game_Map._zoomTime > 0) {
      Game_Map._zoom = Game_Map._destZoom;
      Game_Map._zoomTime = 0;
      Game_Map._zoomDuration = 0;
    }
  };

  /**
   * Definição do zoom do mapa
   */
  Game_Map.prototype.setZoom = function(x, y, duration) {
  	duration = duration || 60;
  	duration = Math.round(duration <= 0 ? 1 : duration);
  	Game_Map._destZoom.x = Game_Map._destZoom.y = x;
  	if (y) {
  		Game_Map._destZoom.y = y;
  	}
  	Game_Map._spdZoom = new PIXI.Point((Game_Map._destZoom.x - Game_Map._zoom.x) / duration, (Game_Map._destZoom.y - Game_Map._zoom.y) / duration);
  	Game_Map._zoomDuration = duration;
  };

  Game_Map.prototype.setZoomCenter = function(a, b) {
  	if (b) {
  		Game_Map._zoomCenter = new PIXI.Point(a, b);
  	} else if (a) {
  		Game_Map._zoomCenter = a;
  	} else {
  		Game_Map._zoomCenter = null;
  	}
  };

  /**
   * Evento de alteração de zoom
   */
  Game_Map.prototype.onZoomChange = function() {
    $gamePlayer.center((Game_Map._zoomCenter || $gamePlayer).x, (Game_Map._zoomCenter || $gamePlayer).y);
  };

  /**
   * Aquisição de cordenadas no mapa pelas cordenadas na tela
   */
  Game_Map.prototype.canvasToMapX = function(x) {
    var tileWidth = this.tileWidth() * Game_Map.zoom.x;
    var originX = this.displayX() * tileWidth;
    var mapX = Math.floor((originX + x) / tileWidth);
    return this.roundX(mapX);
  };

  /**
   * Aquisição de cordenadas no mapa pelas cordenadas na tela
   */
  Game_Map.prototype.canvasToMapY = function(y) {
    var tileHeight = this.tileHeight() * Game_Map.zoom.y;
    var originY = this.displayY() * tileHeight;
    var mapY = Math.floor((originY + y) / tileHeight);
    return this.roundY(mapY);
  };

  // Zoom
  Object.defineProperty(Game_Map, "zoom", {
  	get: function() {
  		return Game_Map._zoom;
  	}
  });

  //-----------------------------------------------------------------------------
  // Game_Event
  //
  // Classe dos eventos

  var Game_Event_update = Game_Event.prototype.update;

  Game_Event.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
    var x1 = lastScrolledX;
    var y1 = lastScrolledY;
    var x2 = this.scrolledX();
    var y2 = this.scrolledY();
    if (y2 > y1 && y2 > $gamePlayer.centerY()) {
        $gameMap.scrollDown(y2 - y1);
    }
    if (x2 < x1 && x2 < $gamePlayer.centerX()) {
        $gameMap.scrollLeft(x1 - x2);
    }
    if (x2 > x1 && x2 > $gamePlayer.centerX()) {
        $gameMap.scrollRight(x2 - x1);
    }
    if (y2 < y1 && y2 < $gamePlayer.centerY()) {
        $gameMap.scrollUp(y1 - y2);
    }
  };

  Game_Event.prototype.update = function() {
    var lastScrolledX = this.scrolledX();
    var lastScrolledY = this.scrolledY();
    Game_Event_update.apply(this, arguments);
    if (this === Game_Map._zoomCenter)
    	this.updateScroll(lastScrolledX, lastScrolledY);
  };

  //-----------------------------------------------------------------------------
  // Game_Player
  //
  // Classe do jogador

  // Alias
  var _GamePlayer_centerX = Game_Player.prototype.centerX;
  var _GamePlayer_centerY = Game_Player.prototype.centerY;
  var _GamePlayer_updateScroll = Game_Player.prototype.updateScroll;

  Game_Player.prototype.centerX = function() {
    return _GamePlayer_centerX.call(this) / Game_Map.zoom.x;
  };

  Game_Player.prototype.centerY = function() {
    return _GamePlayer_centerY.call(this) / Game_Map.zoom.y;
  };

  Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
    if (!Game_Map._zoomCenter) 
    	_GamePlayer_updateScroll.apply(this, arguments);
  };

  //-----------------------------------------------------------------------------
  // Spriteset_Map
  //
  // Spriteset do mapa do jogo

  // Alias
  var _SpritesetMap_createLowLayer = Spriteset_Map.prototype.createLowerLayer;
  var _SpritesetMap_update = Spriteset_Map.prototype.update;

  Spriteset_Map.prototype.createLowerLayer = function() {
    _SpritesetMap_createLowLayer.apply(this, arguments);
    $gameMap.setZoom(Game_Map.zoom.x, Game_Map.zoom.y, 1);
  };

  Spriteset_Map.prototype.update = function() {
    _SpritesetMap_update.apply(this, arguments);
  };

  Spriteset_Base.prototype.updatePosition = function() {
    var scale = Game_Map.zoom;
    var screen = $gameScreen;
    this.x = Math.round(-screen.zoomX() * (scale.x - 1));
    this.y = Math.round(-screen.zoomY() * (scale.x - 1));
    this.x += Math.round(screen.shake());
    if (this.scale.x !== scale.x || this.scale.y !== scale.y) {
        this.scale = scale.clone();
        this._tilemap.width = Graphics.width + this._margin * 2 / this.scale.x;
        this._tilemap.height = Graphics.height + this._margin * 2 / this.scale.y;
        this._parallax.move(this._parallax.x, this._parallax.y, Graphics.width / scale.x, Graphics.height / scale.y);
    }
  };

  //-----------------------------------------------------------------------------
  // Game_Picture
  //
  // Objeto das pictures do jogo

  var _GamePicture_update = Game_Picture.prototype.update;

  Game_Picture.prototype.update = function() {
      _GamePicture_update.apply(this, arguments)
      if (this.mapZoom()) this.updateZoom();
  };

  Game_Picture.prototype.updateZoom = function() {
    if (this._duration > 0) {
        this._scaleX *= Game_Map.zoom.x;
        this._scaleY *= Game_Map.zoom.y;
    } else {
        this._scaleX = this._targetScaleX * Game_Map.zoom.x;
        this._scaleY = this._targetScaleY * Game_Map.zoom.y;
    }
  };

  Game_Picture.prototype.mapZoom = function() {
    return !!this.name().toLowerCase().match(/\s*\[\s*zoom\s*\]\s*/);
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
  	  	  	if (args[2] == "duration") {
  	  	  		if (args[3]) {
  	  	  			$gameMap.setZoom(Number(args[1]), Number(args[1]), Number(args[3]));
  	  	  		}
  	  	  	} else {
  	  	  		if (args[3] == "duration") {
  	  	  			if (args[4]) {
  	  	  				$gameMap.setZoom(Number(args[1]), Number(args[2]), Number(args[4]));
  	  	  			}
  	  	  		} else {
  	  	  			$gameMap.setZoom(Number(args[1]), Number(args[2]));
  	  	  		}
  	  	  	}
  	  	  } else {
  	  	  	$gameMap.setZoom(Number(args[1]));
  	  	  }
  	  	}
  	  } else if (args[0] == "reset") {
  	  	if (args[1]) {
  	  		$gameMap.setZoom(1.0, 1.0, Number(args[1]));
  	  		$gameMap.setZoomCenter(null);
  	  	} else {
  	  		$gameMap.setZoom(1.0);
  	  	}
  	  } else if (args[0] == "center") {
  	  	if (args[1] == "event") {
  	  		var ev = $gameMap.event(Number(args[2]));
  	  		if (ev)
  	  			$gameMap.setZoomCenter(ev);
  	  	} else if (args[1] == "reset") {
  	  		$gameMap.setZoomCenter(null);
  	  	} else {
  	  		$gameMap.setZoomCenter(Number(args[1]), Number(args[2]));
  	  	}
  	  }
  	}
  };

})(MBS.MapZoom);

if (Imported["MVCommons"]) {
  PluginManager.register("MBS_MapZoom", 1.2, "Makes it possible to zoom in and out the game map whenever you want", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "29-10-2015");
}
