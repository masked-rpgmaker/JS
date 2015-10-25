//=============================================================================
// MBS - Custom Title
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
//
/*:

  @author Masked
  @plugindesc Permite que você customize alguns aspectos da cena de título
  @help
  =============================================================================
  Introdução
  =============================================================================
  O MBS - Custom Title permite que você customize algumas coisas na cena de
  título, por enquanto está mais pra uma versão de testes, então esteja
  atento a atualizações no plugin.

  =============================================================================
  Utilização
  =============================================================================
  Nada especial, apenas configure os parâmetros corretamente, lembrando de
  que as imagens que você configurar devem existir e a extensão precisa estar
  presente e correta.

  =============================================================================
  Créditos
  =============================================================================
  - Masked, por criar

  @param Logo
  @desc Caminhos para as imagens de logo separados por ';'
  @default img/system/Logo.png

  @param Logo Fade
  @desc Tempo de fade in/out das logos
  @default 120

  @param Logo Still
  @desc Tempo de espera antes do fade out de uma logo
  @default 50

  @param Skip Title
  @desc Caso queira pular o título, deixe como true, se não, como false
  @default false

  @param NewGame
  @desc Imagem de 'Novo Jogo'
  @default img/system/NewGame.png

  @param Continue
  @desc Imagem de 'Continuar'
  @default img/system/Continue.png

  @param Config
  @desc Imagem de 'Configurações'
  @default img/system/Config.png

  @param NewGame Position
  @desc Posição da imagem de novo jogo. Uma coordenada vazia centraliza a imagem naquele eixo.
  @default ;420

  @param Continue Position
  @desc Posição da imagem de continuar. Uma coordenada vazia centraliza a imagem naquele eixo.
  @default ;452

  @param Config Position
  @desc Posição da imagem de configuração
  @default ;484

  @param Cursor
  @desc Caminho da imagem de cursor. Deixe vazio para não usar o cursor.
  @default img/system/Cursor.png

  @param Cursor Amplitude
  @desc Amplitude do movimento do cursor. 0 para sem movimento.
  @default 30

  @param Cursor Speed
  @desc Número de píxels que o cursor se move por frame. 0 para sem movimento.
  @default 2

  @param Translucent
  @desc Opacidade dos comandos translúcidos (quando não selecionados)
  @default 96

*///===========================================================================
var Imported = Imported || {};

var MBS = MBS || {};
MBS.CustomTitle = {};

"use strict";

(function($) {
  $.Parameters = PluginManager.parameters("MBS_CustomTitle");
  $.Param = $.Param || {};

  //---------------------------------------------------------------------------
  // Configuração

  // Logo
  $.Param.splash = $.Parameters["Logo"].split(';');
  $.Param.splashWait = Number($.Parameters["Logo Fade"]);
  $.Param.splashTime = Number($.Parameters["Logo Still"]);

  // Pular título
  $.Param.skipTitle = ($.Parameters["Skip Title"] === "true");

  // Opções [Imagens]
  $.Param.newGame = $.Parameters["NewGame"];
  $.Param.continue = $.Parameters["Continue"];
  $.Param.config = $.Parameters["Config"];

  // Opções [Posições]
  $.Param.newGamePos = $.Parameters["NewGame Position"];
  $.Param.continuePos = $.Parameters["Continue Position"];
  $.Param.configPos = $.Parameters["Config Position"];

  // Cursor
  $.Param.cursor = $.Parameters["Cursor"];
  $.Param.cursorAmp = Number($.Parameters["Cursor Amplitude"]);
  $.Param.cursorSpd = Number($.Parameters["Cursor Speed"]);

  // Outros
  $.Param.translucentAlpha = Number($.Parameters["Translucent"] || 96);

  //-----------------------------------------------------------------------------
  // Scene_Boot
  //
  // Cena de inicialização do jogo

  /**
    Inicialização do processo

    @method start
    @this {Scene_Boot}
  */
  Scene_Boot.prototype.start = function () {
      Scene_Base.prototype.start.call(this);
      SoundManager.preloadImportantSounds();
      if (DataManager.isBattleTest()) {
          DataManager.setupBattleTest();
          SceneManager.goto(Scene_Battle)
      } else if (DataManager.isEventTest()) {
          DataManager.setupEventTest();
          SceneManager.goto(Scene_Map)
      } else {
          this.checkPlayerLocation();
          DataManager.setupNewGame();
          SceneManager.goto(Scene_Splash);
      }
      this.updateDocumentTitle()
  };

  //-----------------------------------------------------------------------------
  // Scene_Splash
  //
  // Cena das imagens de logo

  /**
   * @constructor
   */
  function Scene_Splash() {
     this.initialize.apply(this, arguments)
  }
  Scene_Splash.prototype = Object.create(Scene_Base.prototype);
  Scene_Splash.prototype.constructor = Scene_Splash;

  /**
   * Início da cena
   *
   * @method initialize
   * @this {Scene_Splash}
   */
  Scene_Splash.prototype.initialize = function () {
      Scene_Base.prototype.initialize.call(this);
      this._count = 0;
      this._n = 0;
      this._ratio = 255.0 / $.Param.splashWait * 2;
  };

  /**
   * Criação da cena
   *
   * @method create
   * @this {Scene_Splash}
   */
  Scene_Splash.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createSplash();
    this.addChild(this._splashSprite);
  };

  /**
   * Criação das imagens
   *
   * @method createSplash
   * @this {Scene_Splash}
   */
  Scene_Splash.prototype.createSplash = function() {
    this._splashSprite = new Sprite(null);
    this._splashSprite.anchor.x = 0.5;
    this._splashSprite.anchor.y = 0.5;
    this._splashSprite.x = Graphics.width / 2;
    this._splashSprite.y = Graphics.height / 2;
  };

  /**
   * Atualização da cena
   *
   * @method update
   * @this {Scene_Splash}
   */
  Scene_Splash.prototype.update = function() {
    Scene_Base.prototype.update.call(this);

    var gotoTitle = function() {
      if ($.Param.skipTitle) {
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
      } else {
        SceneManager.goto(Scene_Title);
      }
      Window_TitleCommand.initCommandPosition();
    };

    if ($.Param.splash[this._n] === "") this._n++;

    if (Input.isTriggered('ok') || TouchInput.isTriggered()) gotoTitle();

    if (this._count++ % ($.Param.splashWait + $.Param.splashTime) === 0) {
      this.drawSplash(this._n++);
      this._count = 1;
    }

    if (this._n > $.Param.splash.length) gotoTitle();
    if (this._count < $.Param.splashWait / 2) this._splashSprite.opacity += this._ratio;
    else if (this._count > $.Param.splashWait / 2 + $.Param.splashTime) this._splashSprite.opacity -= this._ratio;
  };

  /**
   * Desenho do splash
   *
   * @method drawSplash
   * @this {Scene_Splash}
   * @param {Number} index Índice da imagem de splash a ser desenhada
   */
  Scene_Splash.prototype.drawSplash = function(index) {
    if ($.Param.splash.length > index)
      this._splashSprite.bitmap = ImageManager.loadNormalBitmap($.Param.splash[index], 0);
    this._splashSprite.opacity = 0;
  };

  //-----------------------------------------------------------------------------
  // Scene_Title
  //
  // Cena da cena de título

  /**
   * Criação da cena
   *
   * @method create
   * @this {Scene_Title}
   */
  Scene_Title.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createForeground();
    this._translucentAlpha = $.Param.translucentAlpha;
    this.createButtons();
    this.createCursor();
  };

  /**
   * Índice selecionado
   */
  Scene_Title.index = 0;

  /**
   * Criação do cursor de opção
   *
   * @method createCursor
   * @this {Scene_Title}
   */
  Scene_Title.prototype.createCursor = function() {
    this._cursor = $.Param.cursor === "" ? new Sprite(null) : new Sprite(ImageManager.loadNormalBitmap($.Param.cursor, 0));
    this._cursor._animFrame = 0;
    this.addChild(this._cursor);
  }
  /**
   * Atualização do cursor de opção
   *
   * @method updateCursor
   * @this {Scene_Title}
   */
 Scene_Title.prototype.updateCursor = function() {

   if (this._cursor._animFrame < $.Param.cursorAmp) {
     this._cursor._offset.x = -this._cursor._animFrame;
   } else {
     this._cursor._offset.x = -($.Param.cursorAmp * 2) + this._cursor._animFrame;
   }

   this._cursor._animFrame += $.Param.cursorSpd;
   this._cursor._animFrame %= ($.Param.cursorAmp * 2);
 }

 /**
  * Obtenção de um botão pelo índice dele
  *
  * @method getButton
  * @this {Scene_Title}
  * @param {Number} index Índice do botão
  * @return {Sprite} Retorna o botão de índice 'index'
  */
 Scene_Title.prototype.getButton = function(index) {
   switch (index) {
     case 0:
       return this._newGameButton;
     case 1:
       return this._continueButton;
     case 2:
       return this._configButton;
   }
 }

  /**
   * Criação dos botões do título
   *
   * @method createButtons
   * @this {Scene_Title}
   */
  Scene_Title.prototype.createButtons = function() {
    this._index = Scene_Title.index;

    var position;
    var x;
    var y;

    this._newGameButton = new Sprite(ImageManager.loadNormalBitmap($.Param.newGame, 0));
    position = $.Param.newGamePos.split(';');
    x = position[0];
    this._newGameButton.x = x === "" ? Graphics.width/2 : Number(x || 0);
    this._newGameButton.anchor.x = x === "" ? 0.5 : 0;
    y = position[1]
    this._newGameButton.y = y === "" ? Graphics.height/2 : Number(y || 0);
    this._newGameButton.anchor.y = x === "" ? 0.5 : 0;
    this._newGameButton.opacity = this._translucentAlpha;
    this.addChild(this._newGameButton);

    this._continueButton = new Sprite(ImageManager.loadNormalBitmap($.Param.continue, 0));
    position = $.Param.continuePos.split(';');
    x = position[0];
    this._continueButton.x = x === "" ? Graphics.width/2 : Number(x || 0);
    this._continueButton.anchor.x = x === "" ? 0.5 : 0;
    y = position[1]
    this._continueButton.y = y === "" ? Graphics.height/2 : Number(y || 0);
    this._continueButton.anchor.y = x === "" ? 0.5 : 0;
    this._continueButton.opacity = this._translucentAlpha;
    this.addChild(this._continueButton);

    this._configButton = new Sprite(ImageManager.loadNormalBitmap($.Param.config, 0));
    position = $.Param.configPos.split(';');
    x = position[0];
    this._configButton.x = x === "" ? Graphics.width/2 : Number(x || 0);
    this._configButton.anchor.x = x === "" ? 0.5 : 0;
    y = position[1]
    this._configButton.y = y === "" ? Graphics.height/2 : Number(y || 0);
    this._configButton.anchor.y = x === "" ? 0.5 : 0;
    this._configButton.opacity = this._translucentAlpha;
    this.addChild(this._configButton);
  };

  /**
   * Verificação de utilização da cena
   */
  Scene_Title.prototype.isBusy = Scene_Base.prototype.isBusy;

  /**
   * Atualização da cena
   *
   * @method update
   * @this {Scene_Title}
   */
  Scene_Title.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    this.updateIndex();
    this.updateButtons();
    this.updateTrigger();
    this.updateCursor();
  };

  /**
   * Atualização dos botões
   *
   * @method updateButtons
   * @this {Scene_Title}
   */
   Scene_Title.prototype.updateButtons = function() {
     this._newGameButton.opacity = this._index == 0 ? 255 : this._translucentAlpha;
     this._continueButton.opacity = this._index == 1 ? 255 : this._translucentAlpha;
     if (!DataManager.isAnySavefileExists()) this._continueButton.tint = 0x777777;
     else this._continueButton.tint = 0xFFFFFF;
     this._configButton.opacity = this._index == 2 ? 255 : this._translucentAlpha;
   };

  /**
   * Atualização do índice selecionado
   *
   * @method updateIndex
   * @this {Scene_Title}
   */
  Scene_Title.prototype.updateIndex = function() {
       if (Input.isRepeated('down')) this._index++;
       if (Input.isRepeated('up')) this._index--;

       for (var i = 0; i < 3; i++) {
         if (this._index == i) continue;
         if (i == 1 && !DataManager.isAnySavefileExists()) continue;
         if (TouchInput.isTriggered() && this.isOverButton(i, TouchInput.x, TouchInput.y)) {
           this._index = i;
           TouchInput.update();
         }
       }

       if (this._index < 0) this._index = 2;
       if (this._index > 2) this._index = 0;

       Scene_Title.index = this._index;
       this._cursor.x = this.getButton(this._index).getBounds(null).x - this._cursor.width;
       this._cursor.y = this.getButton(this._index).getBounds(null).y;
  };

  /**
   * Verificação de se uma coordenada está sobre um botão
   *
   * @method isOverButton
   * @this {Scene_Title}
   * @param {Number} index O índice do botão a ser verificado
   * @param {Number} x A posição X a ser verificada
   * @param {Number} y A posição Y a ser verificada
   * @return {Boolean} Retorna se as coordenadas estião sobre o botão ou não
   */
  Scene_Title.prototype.isOverButton = function(index, x, y) {
    return this.getButton(index).getBounds(null).contains(x, y);
  };

  /**
   * Atualização do índice selecionado
   *
   * @method updateTrigger
   * @this {Scene_Title}
   */
  Scene_Title.prototype.updateTrigger = function() {
        if (Input.isTriggered('ok') || (TouchInput.isTriggered() && this.isOverButton(this._index, TouchInput.x, TouchInput.y))) {
          switch (this._index) {
            case 0:
              this.commandNewGame();
              break;
            case 1:
              if (DataManager.isAnySavefileExists()) {
                this.commandContinue();
              } else {
                SoundManager.playBuzzer();
              }
              break;
            case 2:
              this.commandOptions();
              break;
          }
        }
  };

  /**
   * Novo Jogo
   *
   * @method commandNewGame
   * @this {Scene_Title}
   */
  Scene_Title.prototype.commandNewGame = function () {
      DataManager.setupNewGame();
      this.fadeOutAll();
      SceneManager.goto(Scene_Map)
  };

  /**
   * Continuar
   *
   * @method commandContinue
   * @this {Scene_Title}
   */
  Scene_Title.prototype.commandContinue = function () {
      SceneManager.push(Scene_Load)
  };

  /**
   * Opções
   *
   * @method commandOptions
   * @this {Scene_Title}
   */
  Scene_Title.prototype.commandOptions = function () {
      SceneManager.push(Scene_Options)
  };
})(MBS.CustomTitle);

Imported["MBS_CustomTitle"] = true;
