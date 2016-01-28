//=============================================================================
// MBS - Asynchronous Movies (v1.0)
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
// Plugin specifications (Do not modify!)
/*:pt
	@author Masked 
	@plugindesc Permite a execução de vídeos de modo paralelo ao resto do jogo.
	<MBS AsyncMovies>

	@help
===========================================================================
Introdução
===========================================================================
Esse plugin permite que você rode vídeos de forma que eles não impeçam o 
resto do jogo de rodar.

===========================================================================
Como Usar
===========================================================================
Para rodar um vídeo paralelamente, coloque exatamente acima do comando de
vídeo um comentário com o seguinte texto:
	<AsyncVideo>

Dessa forma, o vídeo será automaticamente executado em paralelo.

Caso queira que o vídeo acione uma switch ao terminar, basta adicionar o
ID da switch como parâmetro para o comentário:
	<AsyncVideo: 42>

(Aciona a switch 42 ao terminar o vídeo)
Para interromper a execução do vídeo atual, chame o comando de mostrar 
vídeo e selecione "(Nenhum)".

===========================================================================
Funções
===========================================================================

MBS.AsyncMovies.play(filename)   : Roda um vídeo do arquivo 'filename' em
                                 : paralelo
 
MBS.AsyncMovies.stop			 : Para a execução do vídeo atual

*/

var Imported = Imported || {};
var MBS = MBS || {};

MBS.AsyncMovies = {};

"use strict";

//=============================================================================
// ** MBS > AsyncMovies
//-----------------------------------------------------------------------------
// Módulo de controle dos vídeos
//=============================================================================
(function ($) {

	$._video = null;
	$._switch = null;

	$._createVideo = function() {
		this._video = document.createElement('video');
	    this._video.id = 'AsyncVideo';
	    this._video.style.opacity = 0;
	    this._video.width = Graphics.width;
        this._video.height = Graphics.height;
	    this._video.style.zIndex = 100;
	    Graphics._centerElement(this._video);
	    this._video.onended = $.stop.bind(this);
        this._video.onerror = function() { throw new Error('Erro ao abrir o vídeo;'); };
	    document.body.appendChild(this._video);
	}

	// Execução de um vídeo assíncrono
	$.play = function(filename) {
		this._createVideo();
		this._video.src = 'movies/' + filename + Game_Interpreter.prototype.videoFileExt();
		this._video.currentTime = 0;
        this._video.autoplay = true;
        this._video.style.opacity = 1;
        this._video.load();
	}

	$.stop = function(filename) {
		if (!this._video) return;
		this._video.pause();
		document.body.removeChild(this._video);
		this._video = null;
	}



})(MBS.AsyncMovies);

//=============================================================================
// ** Game_Interpreter
//=============================================================================
(function($) {

	var alias_command261 = $.prototype.command261;

	// Play Movie
	$.prototype.command261 = function() {
		if (!$gameMessage.isBusy()) {
			if (this._params[0].length > 0) {
				var lastCommand = this._index > 0 ? this._list[this._index - 1] : null;
				if (lastCommand != null && 
					(lastCommand.code == 108 || lastCommand.code == 408) && 
					!!lastCommand.parameters[0].match(/<AsyncVideo>/i)) {
					MBS.AsyncMovies.play(this._params[0]);
				} else {
				    this.alias_command261();
				}
			} else {
				MBS.AsyncMovies.stop();
				this.setWaitMode('message');
			}
			this._index++;
		}
	    return false;
	};

})(Game_Interpreter);
