//=============================================================================
// MBS - Visual Equipment
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
// Plugin specifications (Do not modify!)
//
/*:
 *
 * @author Masked
 * @plugindesc Shows images on characters depending on their equipments.         
 *
 * <MBS VisualEquip>
 * @help
 * =============================================================================
 * Introduction
 * =============================================================================
 * This script creates specific images on characters that makes them look like
 * if it really had that items equipped.
 *
 * =============================================================================
 * How to use
 * =============================================================================
 * You can choose the charset that will represent an item by putting this tag on
 * its notes:
 *
 * <graphic:equip_graphic.png, x>
 *
 * The "equip_graphic.png" part is the file name, the file have to be placed on 
 * the folder you choose on the plugin settings. The "x" is the character index,
 * if it's a single char (the file name starts with '$'), set this to 0.
 * The equipment charset works the same way as every other charset on the game,
 * so you can use $ and ! to specify big characters and stuff.
 *
 * You can set an offset for the equipment graphic if you want by putting this
 * tag on the equip's note:
 *
 * <offset:x, y>
 *
 * The "x" and "y" are the horizontal and vertical offset for the equipment
 * image.
 *
 * And last but not least, you can set the equipment graphic's priority for
 * showing some equipments above others or even below the character, just
 * put this tag on its notes:
 *
 * <priority:z>
 *
 * The "z" is the equipment priority, higher priorities make equipments to be
 * draw above the others and negative priorities will make it to be drawn 
 * below the character.
 *
 * If you want, you can also use the following tag on an event's notes to make
 * the script draw equipments on it:
 *
 * <equips:a id1, w id2, a id3...>
 *
 * The equipments are specified by using the first letter of the equipment 
 * type (that is, a for Armor and w for Weapon) followed by its ID. Ex.:
 * <equips: a 1, w 2>
 *
 * In this example, the event would equip the armor with ID 1 and the weapon 
 * with ID 2 from the database.
 *
 * =============================================================================
 * Credits
 * =============================================================================
 * - Masked, creator.
 *
 * @param Equipments Path
 * @desc Folder where the equipment charsets will be located.
 * @default ./img/equips/
 *
 */
/*:pt
 *
 * @author Masked
 * @plugindesc Cria imagens sobre o personagem dependendo dos equipamentos dele. 
 *
 * <MBS VisualEquip>
 *
 * @help
 * =============================================================================
 * Introdução
 * =============================================================================
 * Este script cria imagens especiais sobre o personagem que variam de acordo
 * com os equipamentos que ele está usando no momento.
 *
 * =============================================================================
 * Utilização
 * =============================================================================
 * Para definir o nome arquivo de imagem da qual o gráfico do equipamento vem
 * adicione nas notas do equipamento:
 *
 * <graphic:equip_graphic.png, x>
 *
 * Sendo o 'equip_graphic.png' o nome do arquivo de gráfico na pasta configurada
 * no plugin e o 'x' o índice do char dentro do set.
 * Os gráficos de equipamento funcionam da mesma forma que os de personagem e os
 * prefixos de gráfico ($ e !) também funcionam com ele.
 *
 * Você pode ainda definir um offset para o equipamento com a tag offset:
 *
 * <offset:x, y>
 *
 * Sendo o x e y as cordenadas para o offset. Também pode usar a tag priority
 * para colocar equipamentos mais acima ou abaixo na tela:
 *
 * <priority:z>
 *
 * Quando maior o z maior a prioridade do equipamento e ele aparece mais acima
 * do resto. Índices negativos fazem com que o gráfico apareça abaixo do
 * personagem.
 *
 * Caso queira adicionar um gráfico de equipamento a um evento, adicione nas
 * notas dele a tag:
 *
 * <equips:a id1, w id2, a id3...>
 *
 * Os ids devem vir precedidos pela inicial do tipo de equipamento seguido por
 * um espaço, para armaduras, use 'a id', e para armas use 'w id'. Ex.:
 * <equips: a 1, w 2>
 *
 * Neste exemplo o evento usaria a armadura de ID 1 e arma de ID 2.
 * Você pode por quantos IDs quiser, basta separá-los por vírgulas.
 *
 * =============================================================================
 * Créditos
 * =============================================================================
 * - Masked, por criar
 *
 * @param Equipments Path
 * @desc Caminho da pasta dos arquivos de gráfico de equipamento
 * @default ./img/equips/
 *
 */

var Imported = Imported || {};

var MBS = MBS || {};
MBS.VisualEquipment = {};

"use strict";

(function ($) {

  $.Parameters = $plugins.filter(function(p) {return p.description.contains('<MBS VisualEquip>');})[0].parameters;
  $.Param = $.Param || {};

  //-----------------------------------------------------------------------------
  // Configuração

  // Caminho dos arquivos
  $.Param.path = $.Parameters["Equipments Path"];

  //-----------------------------------------------------------------------------
  // ImageManager
  //
  // Gerenciador de imagens do jogo

  /**
   * Carregamento de uma imagem de equipamento
   * @method loadEquipment
   * @param {String} filename Nome do arquivo
   * @param {Number} hue Matiz do Bitmap
   * @return Retorna um bitmap de uma imagem de equipamento
   */
  ImageManager.loadEquipment = function (filename, hue) {
    return this.loadBitmap($.Param.path, filename, hue, false);
  };

  //-----------------------------------------------------------------------------
  // Sprite_Equipment
  //
  // Sprite de um equipamento

  /**
   * @constructor
   */
  function Sprite_Equipment() {
    this.initialize.apply(this, arguments)
  }

  Sprite_Equipment.prototype = Object.create(Sprite_Base.prototype);
  Sprite_Equipment.prototype.constructor = Sprite_Base;

  /**
   * Inicialização do objeto
   *
   * @method initialize
   * @param {Sprite_Character} spriteChar Sprite do character ao qual o equip pertence
   * @this {Sprite_Equipment}
   */
  Sprite_Equipment.prototype.initialize = function (spriteChar, equip) {
    Sprite_Base.prototype.initialize.call(this);
    this._charSprite = spriteChar;
    this.x = this.y = 0;
    this._charSprite.addChild(this);
    this._equip = equip;
    if (this._equip.meta.offset) {
      this._offset.x = Number(this._equip.meta.offset.split(',')[0]);
      if (this._equip.meta.offset.split(',').length > 1)
        this._offset.y = Number(this._equip.meta.offset.split(',')[1]);
    }
    this.anchor.x = this._charSprite.anchor.x;
    this.anchor.y = this._charSprite.anchor.y;
    this.z = this._charSprite.z + Number(this._equip.meta.priority || 0);
    this._index = Number(this._equip.meta.graphic.split(',')[1]);
    this._characterName = this._equip.meta.graphic.split(',')[0];
    this.bitmap = ImageManager.loadEquipment(this._characterName, 0);
  };

  /**
   * Atualização do objeto
   *
   * @method update
   * @this {Sprite_Equipment}
   */
  Sprite_Equipment.prototype.update = function () {
    Sprite_Base.prototype.update.call(this);
    this.updateCharacterFrame();
  };

  /**
   * Atualização do frame do sprite
   *
   * @method updateFrame
   * @this {Sprite_Equipment}
   */
  Sprite_Equipment.prototype.updateCharacterFrame = function () {
     var isBig = ImageManager.isBigCharacter(this._characterName);

     var pw = isBig ? this.bitmap.width / 3 : this.bitmap.width / 12;
     var ph = isBig ? this.bitmap.height / 4 : this.bitmap.height / 8;

     var sx = ((isBig ? 0 : (this._index % 4 * 3)) + this._charSprite.characterPatternX()) * pw;
     var sy = ((isBig ? 0 : (Math.floor(this._index / 4) * 4)) + this._charSprite.characterPatternY()) * ph;

     this.setFrame(sx, sy, pw, ph);
   };

  //-----------------------------------------------------------------------------
  // Sprite_Character
  //
  // Sprite de um personagem ou evento

  // Alias
  var _Sprite_Character_initMembers = Sprite_Character.prototype.initMembers;

  /**
   * Atualização do bitmap do character
   *
   * @method updateBitmap
   * @this {Sprite_Character}
   */
  Sprite_Character.prototype.initMembers = function() {
    _Sprite_Character_initMembers.call(this);
  };

  // Alias
  var _Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter;

  /**
   * Definição do character
   *
   * @method updateBitmap
   * @param {Game_Character} character Character usado pelo sprite
   * @this {Sprite_Character}
   */
  Sprite_Character.prototype.setCharacter = function(character) {
    _Sprite_Character_setCharacter.call(this, character);
    this._equipments = [];
    if (this._character instanceof Game_Player) {
      $gameParty.leader().equips().forEach(function (equip) {
        if (equip) {
          if (equip.meta.graphic)
            this._equipments.push(new Sprite_Equipment(this, equip));
        }
      }, this);
    } else if (this._character instanceof Game_Follower) {
      if (this._character.actor()) {
        this._character.actor().equips().forEach(function (equip) {
          if (equip) {
            if (equip.meta.graphic)
              this._equipments.push(new Sprite_Equipment(this, equip));
          }
        }, this);
      }
    } else if (this._character instanceof Game_Event) {
      if (this._character.event().meta.equips) {
        this._character.event().meta.equips.split(',').forEach(function (id) {
          var t = id.trim().split(' ');
          var equip;
          if (t[0] === 'a') {
            equip = $dataArmors[Number(t[t.length - 1])];
          } else if (t[0] === 'w') {
            equip = $dataWeapons[Number(t[t.length - 1])];
          }
          if (equip)
            this._equipments.push(new Sprite_Equipment(this, equip));
        }, this);
      }
    }
  };

})(MBS.VisualEquipment);

Imported["MBS_VisualEquipment"] = 1.0;

if (Imported["MVCommons"]) {
  PluginManager.register("MBS_VisualEquipment", 1.0, "Displays images that represent the equipments characters are using", {  
      email: "masked.rpg@gmail.com",
      name: "Masked", 
      website: "N/A"
    }, "28-10-2015");
}
