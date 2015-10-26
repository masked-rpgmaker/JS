//=============================================================================
// MBS - Equip requirement
//-----------------------------------------------------------------------------
// por Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
//
/*:

  @author Masked
  @plugindesc Define um sistema de requerimentos para usar um equipamento.
  @help
  =============================================================================
  Introdução
  =============================================================================
  Este plugin permite que você defina requerimentos para que um equipamento
  possa ser usado baseado em atributos do peronsagem que o equipa.

  =============================================================================
  Utilização
  =============================================================================
  Coloque nas notas do item que quer que tenha um requerimento:
  <require:atb n, atb2 o, atb3 p, ...>

  Sendo o 'atb/2/3' um atributo (mhp, mmp, atk, def, mat, mdf, agi, luk e
  level) e o n/o/p o valor necessário. Exemplo para requererir nível acima de
  5, ataque maior que 10 e defesa menor que 5:

  <require:level 5, atk 10, def -5>

  =============================================================================
  Créditos
  =============================================================================
  - Masked, por criar

*///---------------------------------------------------------------------------

var Imported = Imported || {};

var MBS = MBS || {};
MBS.EquipRequirement = {};

"use strict";

(function ($) {

  /**
   * Verificação dos requerimentos do item para um actor
   *
   * @method matchRequirements
   * @param {Game_Actor} actor Actor a ser testado
   * @param {~Item} item Item a ser testado
   */
  $.matchRequirements = function (battler, item) {
    var req = Game_Item.requirement(item);
    var res = true;

    var compare = function (a, b) {
      a = Number(a || 0);
      b = Number(b || 0);
      if (b >= 0) {
        return a >= b;
      } else {
        return a <= Math.abs(b);
      }
    };

   var params = [
    'hp',   'mp',  'tp', 'mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi',
    'luk', 'hit', 'eva', 'cri', 'cev', 'mev', 'mrf', 'cnt', 'hrg', 'mrg',
    'trg', 'tgr', 'grd', 'rec', 'pha', 'mcr', 'tcr', 'pdr', 'mdr', 'fdr',
    'exr', 'level'
   ];

   params.forEach(function(atb) {
     res = res && compare(battler[atb], req[atb]);
   });

   return res;
  }

  //---------------------------------------------------------------------------
  // Game_Item
  //
  // Classe dos itens no jogo

  /**
   * Obtenção dos requerimentos do item
   *
   * @method requirement
   * @param {~Item} item Item do qual os requerimentos são obtidos
   */
  Game_Item.requirement = function(item) {
    var req = { };

    if (item.meta.require) {
      item.meta.require.split(',').forEach(function (str) {
        var tsr = str.trim().split(' ');
        req[tsr[0]] = Number(tsr[tsr.length - 1]);
      });
    }

    return req;
  };

  //---------------------------------------------------------------------------
  // Game_Actor
  //
  // Classe dos personagens como battlers no jogo

  // Alias
  var _Game_Actor_canEquip = Game_Actor.prototype.canEquip;

  /**
   * Verificação de quando se pode equipar um item ou não
   *
   * @method canEquip
   * @param {Game_Item} item Item que será testado
   */
  Game_Actor.prototype.canEquip = function(item) {
    if ($.matchRequirements(this, item))
      return _Game_Actor_canEquip.call(this, item);
    return false;
  };

  //---------------------------------------------------------------------------
  // Window_EquipItem
  //
  // Classe das janelas de seleção de equipamento

  // Alias
  var _Window_EquipItem_includes = Window_EquipItem.prototype.includes;

  /**
   * Verificação de quando a janela deve usar o item ou não
   *
   * @method includes
   * @param {Game_Item} item Item que será testado
   */
  Window_EquipItem.prototype.includes = function(item) {
      var r = _Window_EquipItem_includes.call(this, item);
      if (r) return true;
      if (!r && (this._actor ? this._actor.canEquip(item) : true)) return false;
      return Game_BattlerBase.prototype.canEquip.call(this._actor, item);
  };

  // Alias
  var _Window_EquipItem_isEnabled = Window_EquipItem.prototype.isEnabled;

  /**
   * Verificação de quando um item está liberado na janela ou não
   *
   * @method isEnabled
   * @param {Game_Item} item Item que será testado
   */
  Window_EquipItem.prototype.isEnabled = function(item) {
      return _Window_EquipItem_isEnabled.call(this) && this._actor.canEquip(item);
  };

})(MBS.EquipRequirement);

Imported["MBS_EquipRequirement"] = true;
