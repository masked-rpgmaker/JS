//=============================================================================
// MBS - Dia e Noite
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
//
/*:

  @author Masked
  @plugindesc Adiciona horários com alteração no tom da tela ao jogo
  @help
  =============================================================================
  Introdução
  =============================================================================
  O Script MBS - Dia e Noite é adiciona um sistema de horários com variação
  tonal na tela dependendo do período do dia.

  =============================================================================
  Utilização
  =============================================================================
  Os períodos podem ser nascer do sol, manhã, meio-dia, tarde, pôr-do-sol e
  noite, sendo identificados por "sunrise", "morning", "noon", "afternoon",
  "sunset" e "night" pelo script, pode-se verificar o período atual do dia
  usando o comando por script a seguir:

  MBS.DayAndNight.period == "período"

  Substituindo o "período" pelo identificador do período, por exemplo:

  MBS.DayAndNight.period == "noon" // Retorna true se for meio-dia

  Caso queira fixar o horário de um mapa (para cancelar o efeito dentro de
  edificações, por exemplo), adicione nas notas dele:

  <time:period>

  Substituíndo o 'period' pelo identificador do período, por exemplo:

  <time:noon>

  O script ainda dispõe de um módulo de gerenciamento de tempo que pode ser
  usado para obter o horário do jogo a partir do horário real ou da contagem
  de frames, dependendo das configurações do plugin, para usá-lo confira os
  métodos referentes à classe MBS.DayAndNight.TimeManager

  =============================================================================
  Créditos
  =============================================================================
  - Masked, por criar

  @param RealTime
  @desc Se for usar o tempo real do computador, deixe 'true', se não, 'false'.
  @default true

  @param TimeRate
  @desc Velocidade com que o tempo passa
  @default 60

  @param UpdateRate
  @desc Número de minutos (no jogo) passados para que se atualize a tonalidade da tela
  @default 3

  @param StartTime
  @desc Hora de início no formato hora:minuto (no sistema de 24 horas)
  @default 12:00

  @param Sunrise
  @desc Tom da tela durante o nascer do sol (em hexadecimal) no formato rgba
  @default 0, -45, -15, 0

  @param Morning
  @desc Tom da tela durante a manhã
  @default 0, 0, 0, 0

  @param Noon
  @desc Tom da tela durante o meio-dia (em hexadecimal) no formato rgbg
  @default 25, 25, 25, 0

  @param Afternoon
  @desc Tom da tela durante a tarde (em hexadecimal) no formato rgbg
  @default 25, 25, 10, 20

  @param Sunset
  @desc Tom da tela durante o pôr-do-sol (em hexadecimal) no formato rgbg
  @default 50, -25, -40, 100

  @param Night
  @desc Cor da tela à noite (em hexadecimal) no formato rgbg
  @default -155, -155, -155, 155

*///===========================================================================

var Imported = Imported || {};

var MBS = MBS || {};
MBS.DayAndNight = {};

"use strict";

(function ($) {
  $.Parameters = PluginManager.parameters("MBS_DayAndNight");
  $.Param = $.Param || {};

  /**
  * Criação de uma cor a partir de uma string hexadecimal
  *
  * @param {String} string String da qual a cor será obtida
  * @return {Array} Retorna uma array com os valores RGBA da cor
  */
  function toneFromStr(string) {
    var tone = string.split(',');

    for (var i = 0; i < tone.length; i++) {
      tone[i] = parseInt(tone[i]);
    }

    return tone;
  }

  //---------------------------------------------------------------------------
  // Configuração

  // Tempo
  $.Param.realTime = $.Parameters["RealTime"].toLowerCase() === "true";
  $.Param.timeRate = Number($.Parameters["TimeRate"]);
  $.Param.updateRate = Number($.Parameters["UpdateRate"]);
  $.Param.startTime = {};
  $.Param.startTime.hour = Number($.Parameters["StartTime"].split(':')[0]) % 24;
  $.Param.startTime.minute = Number($.Parameters["StartTime"].split(':')[1]) % 60;

  // Tons
  $.Param.sunrise = toneFromStr($.Parameters["Sunrise"]);
  $.Param.morning = toneFromStr($.Parameters["Morning"]);
  $.Param.noon = toneFromStr($.Parameters["Noon"]);
  $.Param.afternoon = toneFromStr($.Parameters["Afternoon"]);
  $.Param.sunset = toneFromStr($.Parameters["Sunset"]);
  $.Param.night = toneFromStr($.Parameters["Night"]);

  //---------------------------------------------------------------------------
  // TimeManager
  //
  // Classe de controle do tempo do jogo

  function TimeManager() {
    throw new Error('This is a static class');
  }

  /**
  * Obtenção das horas no jogo
  *
  * @method getHour
  * @return {Integer} Retorna a hora do jogo de 0-23
  */
  TimeManager.getHour = function() {
    if ($.Param.realTime) {
      return this.getDate().getHours();
    } else {
      return Math.floor(Graphics.frameCount / 216000 * $.Param.timeRate + $.Param.startTime.hour) % 24 ;
    }
  };

  /**
  * Obtenção dos minutos no jogo
  *
  * @method getMinute
  * @return {Integer} Retorna o minuto da hora do jogo de 0-59
  */
  TimeManager.getMinute = function() {
    if ($.Param.realTime) {
      return this.getDate().getMinutes();
    } else {
      return Math.floor(Graphics.frameCount / 3600 * $.Param.timeRate + $.Param.startTime.minute) % 60;
    }
  };

  /**
  * Obtenção dos segundos no jogo
  *
  * @method getSecond
  * @return {Integer} Retorna o minuto da hora do jogo de 0-59
  */
  TimeManager.getSecond = function() {
    if ($.Param.realTime) {
      return this.getDate().getSeconds();
    } else {
      return Math.floor(Graphics.frameCount / 60 * $.Param.timeRate) % 60;
    }
  };

  /**
  * Obtenção da data
  *
  * @method getDate
  * @return {Integer} Retorna a data atual
  */
  TimeManager.getDate = function() {
      return new Date();
  };

  // Definição para uso externo quando necessário
  MBS.DayAndNight.TimeManager = TimeManager;

  //---------------------------------------------------------------------------
  // Scene_Map
  //
  // Cena do mapa

  // Alias
  var _Scene_Map_update = Scene_Map.prototype.update;
  var _Scene_Map_onMapLoad = Scene_Map.prototype.onMapLoaded;

  // Tempo atual do mapa
  Scene_Map._time = null;

  /**
  * Atualização do processo
  *
  * @method update
  * @this {Scene_Map}
  */
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    this.updateHourToneChange();
  };

  /**
  * Atualização da tonalidade da tela de acordo com a hora do jogo
  *
  * @method updateHourToneChange
  * @this {Scene_Map}
  */
  Scene_Map.prototype.updateHourToneChange = function() {
    h = TimeManager.getHour() + (TimeManager.getMinute() / 60.0);
    var timeChanged = Scene_Map._time != h.toFixed(2);

    if (timeChanged && $dataMap.meta.time == undefined && (TimeManager.getMinute() % $.Param.updateRate) == 0) {
      $gameScreen.startTint(this.getToneForTime(h), ($.Param.updateRate - 1) * 3600 / $.Param.timeRate);
    }
  }

  /**
  * Evento executado ao carregar o mapa
  *
  * @method onMapLoaded
  * @this {Scene_Map}
  */
  Scene_Map.prototype.onMapLoaded = function () {
    _Scene_Map_onMapLoad.call(this);

    if ($dataMap.meta.time != undefined) {
      $gameScreen.startTint($.Param[$dataMap.meta.time], 0);
    } else {
      $gameScreen.startTint(this.getToneForTime(TimeManager.getHour() + (TimeManager.getMinute() / 60.0)), 0);
    }
  };

  // Hora
  var h;

  // Verificação da hora
  var hourBetween = function(a, b) {
    return (Math.floor(h) >= a) && (Math.floor(h) <= b);
  };

  // Aquisição da média de dois Tons
  var getToneAverage = function(a, b, rA, rB) {
    //a = a || $.Param.night;
    //b = b || $.Param.night;
    return [(a[0] * rA + b[0] * rB) / (rA + rB),
            (a[1] * rA + b[1] * rB) / (rA + rB),
            (a[2] * rA + b[2] * rB) / (rA + rB),
            (a[3] * rA + b[3] * rB) / (rA + rB)
           ];
  };

  /**
  * Aquisição do tom para a hora atual
  *
  * @method getToneForTime
  * @this {Scene_Map}
  */
  Scene_Map.prototype.getToneForTime = function(hour) {
    Scene_Map._time = hour.toFixed(2);

    var lastMin = 59.0 / 60.0;

    var f = { 0:7.0,1:3.0,2:2.0,3:1.0,
              4:1.0,5:4.0};

    var getRate = function(n) {
      var result = f[n] + lastMin;
      for (var i = n - 1; i >= 0; i--) {
        result += f[i] + 1.0;
      }
      return (result - hour)/(f[n] + lastMin);
    };

    var p = { "sunrise":0,"morning":1,"noon":2,"afternoon":3,"sunset":4,"night":5,
              0:"sunrise",1:"morning",2:"noon",3:"afternoon",4:"sunset",5:"night"};

    var r = getRate(p[$.period]);

    return getToneAverage($.Param[p[p[$.period] == 0 ? 5 : (p[$.period] - 1)]], $.Param[$.period], r, 1.0 - r);
  };

  /**
  * Aquisição do período do dia
  *
  * @method period
  * @this {Scene_Map}
  */
  Object.defineProperty($, "period", {
    get: function() {
      h = TimeManager.getHour();

      if (hourBetween(0, 7)) {
        return "sunrise";
      } else if (hourBetween(8, 11)) {
        return "morning";
      } else if (hourBetween(12, 14)) {
        return "noon";
      } else if (hourBetween(15, 16)) {
        return "afternoon";
      } else if (hourBetween(17, 18)) {
        return "sunset";
      } else if (hourBetween(19, 23)) {
        return "night";
      }
      return "night";
    }
  });

})(MBS.DayAndNight);

Imported["MBS_DayAndNight"] = true;
