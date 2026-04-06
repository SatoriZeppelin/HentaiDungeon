/**
 * 色色地牢 - 技能公式与描述解析（独立模块）
 * 由 app.js 在 getDisplayStat 就绪后调用 window.色色地牢_skill.create(getDisplayStat) 取得 API，
 * 再传给 battle.js 的 initBattleUI(options)。
 */
(function () {
  'use strict';

  /** 从已解析的技能描述中提取伤害数字（与界面显示的“造成 12 点伤害”等一致），用于结算。会先把 CALC 占位符替换为数值再匹配；所有伤害向下取整。 */
  function getBaseDamageFromResolvedEffect(resolvedEffect, SKILL_CALC_PLACEHOLDER_RE) {
    if (!resolvedEffect || typeof resolvedEffect !== 'string') return NaN;
    var str = resolvedEffect.replace(SKILL_CALC_PLACEHOLDER_RE, function (_, _key, _formula, val) {
      return val;
    });
    var m = str.match(/造成\s*([\d\s.+]+)\s*(?:点伤害|的(?:物理|心灵|火焰|奥术)?伤害)/);
    if (!m) return NaN;
    var part = m[1].split(/\s*\+\s*/);
    var sum = 0;
    for (var i = 0; i < part.length; i++) {
      var n = parseFloat(part[i].trim());
      if (!isNaN(n)) sum += n;
    }
    return Math.floor(sum);
  }

  /** 根据技能计算本次攻击的原始伤害（用于 resolveAttack 的 baseDamage）。仅支持部分技能，否则返回 0 */
  function getBaseDamageForSkill(attacker, skill, getDisplayStat) {
    if (!attacker || !skill) return 0;
    var name = skill.name || '';
    var lv, mult, str, agi, int, sta, multStr, multAgi;
    if (name === '攻击') return Math.max(0, Math.floor(getDisplayStat(attacker, 'str') || 0));
    if (name === '狼牙碎击') return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 3));
    if (name === '狼式旋风') {
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '旋风踢' || name === '疾风踢' || name === '击崩踢') {
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.5 : lv === 2 ? 0.55 : lv === 3 ? 0.6 : 0.65;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '瞬星射击' || name === '穿甲弹' || name === '爆裂弹') {
      agi = getDisplayStat(attacker, 'agi') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.4 : lv === 2 || lv === 3 ? 0.45 : 0.5;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 0.5;
      return Math.max(0, Math.floor(agi * mult));
    }
    if (name === '绞首射击' || name === '处刑' || name === '压制') {
      str = getDisplayStat(attacker, 'str') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
      return Math.max(0, Math.floor(str * mult));
    }
    if (name === '蔷薇风暴') {
      agi = getDisplayStat(attacker, 'agi') || 0;
      return Math.max(0, Math.floor(agi * 0.5));
    }
    if (name === '浮空速射') {
      agi = getDisplayStat(attacker, 'agi') || 0;
      return Math.max(0, Math.floor(agi * 0.4));
    }
    if (name === '弹跳踩踏') {
      str = getDisplayStat(attacker, 'str') || 0;
      return Math.max(0, Math.floor(str * 0.8));
    }
    if (name === '遒劲猛击') {
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 1.05 : lv === 2 ? 1.1 : lv === 3 ? 1.15 : 1.2;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '斩杀') {
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 1.3 : lv === 2 ? 1.4 : lv === 3 ? 1.5 : 1.6;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '斩月') {
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '居合') {
      str = getDisplayStat(attacker, 'str') || 0;
      agi = getDisplayStat(attacker, 'agi') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      multStr = lv === 1 ? 0.6 : lv === 2 ? 0.7 : lv === 3 ? 0.7 : 0.8;
      multAgi = lv === 1 ? 0.3 : lv === 2 ? 0.3 : lv === 3 ? 0.4 : 0.4;
      if (skill.advancement === 'A') {
        multStr = 1.0;
        multAgi = 0.5;
      }
      if (skill.advancement === 'B') {
        multStr = 0.8;
        multAgi = 0.4;
      }
      return Math.max(0, Math.floor(str * multStr + agi * multAgi));
    }
    if (name === '错金' || skill.id === '错金')
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 1.6));
    if (name === '一闪' || skill.id === '一闪')
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 3));
    if (name === '无拍子' || skill.id === '无拍子')
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'agi') || 0) * 1.2));
    var atkVal = attacker.atk != null ? parseInt(attacker.atk, 10) : getDisplayStat(attacker, 'str');
    if (name === '横扫') return Math.max(0, Math.floor((atkVal || 0) * 0.6));
    if (name === '撕咬') return Math.max(0, Math.floor((atkVal || 0) * 1.0));
    if (name === '幽灵舞踏') {
      str = getDisplayStat(attacker, 'str') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.35 : lv === 2 ? 0.4 : lv === 3 ? 0.45 : 0.5;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 0.5;
      return Math.max(0, Math.floor(str * mult));
    }
    if (name === '血舞枪刃') {
      str = getDisplayStat(attacker, 'str') || 0;
      agi = getDisplayStat(attacker, 'agi') || 0;
      int = getDisplayStat(attacker, 'int') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      multStr = 0.5;
      multAgi = 0.3;
      if (skill.advancement === 'A') {
        multStr = 0.8;
        multAgi = 0.4;
        return Math.max(0, Math.floor(str * multStr) + Math.floor(agi * multAgi));
      }
      if (skill.advancement === 'B') return Math.max(0, Math.floor(str * 0.8) + Math.floor(int * 0.4));
      if (lv === 2) {
        multStr = 0.6;
        multAgi = 0.3;
      } else if (lv === 3) {
        multStr = 0.7;
        multAgi = 0.4;
      } else if (lv >= 4) {
        multStr = 0.8;
        multAgi = 0.4;
      }
      return Math.max(0, Math.floor(str * multStr) + Math.floor(agi * multAgi));
    }
    if (name === '暗夜帷幕') {
      int = getDisplayStat(attacker, 'int') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.45 : lv === 2 ? 0.5 : lv === 3 ? 0.55 : 0.6;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 0.6;
      return Math.max(0, Math.floor(int * mult));
    }
    if (name === '炎魔吹息') {
      int = getDisplayStat(attacker, 'int') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.8 : lv === 2 ? 0.9 : lv === 3 ? 1.0 : 1.1;
      if (skill.advancement === 'A') mult = 1.3;
      if (skill.advancement === 'B') mult = 1.1;
      return Math.max(0, Math.floor(int * mult));
    }
    if (name === '虚无放逐') {
      int = getDisplayStat(attacker, 'int') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.6 : lv === 2 ? 0.7 : lv === 3 ? 0.8 : 0.9;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 0.9;
      return Math.max(0, Math.floor(int * mult));
    }
    if (name === '心灵侵蚀') {
      int = getDisplayStat(attacker, 'int') || 0;
      var cha = getDisplayStat(attacker, 'cha') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multInt = lv === 1 ? 0.6 : lv === 2 ? 0.7 : lv === 3 ? 0.8 : 0.9;
      var multCha = lv === 1 ? 0.3 : lv === 2 ? 0.3 : lv === 3 ? 0.6 : 0.6;
      if (skill.advancement === 'A' || skill.advancement === 'B') {
        multInt = 0.9;
        multCha = 0.4;
      }
      return Math.max(0, Math.floor(int * multInt + cha * multCha));
    }
    if (name === '妖艳业火') {
      int = getDisplayStat(attacker, 'int') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
      return Math.max(0, Math.floor(int * mult));
    }
    if (name === '魅魔之吻' || (skill && skill.id === '魅魔之吻')) {
      int = getDisplayStat(attacker, 'int') || 0;
      var cha = getDisplayStat(attacker, 'cha') || 0;
      return Math.max(0, Math.floor(int * 0.8 + cha * 0.8));
    }
    if (name === '灵魂盛宴' || (skill && skill.id === '灵魂盛宴')) {
      var cha = getDisplayStat(attacker, 'cha') || 0;
      return Math.max(0, Math.floor(cha * 1.2));
    }
    if (name === '竭魂之火' || (skill && skill.id === '竭魂之火')) {
      int = getDisplayStat(attacker, 'int') || 0;
      return Math.max(0, Math.floor(int * 1.2));
    }
    if (name === '圣光斩' || name === '炽天之剑' || name === '净化斩击') {
      str = getDisplayStat(attacker, 'str') || 0;
      int = getDisplayStat(attacker, 'int') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multStr = lv === 1 ? 0.5 : lv === 2 ? 0.6 : lv === 3 ? 0.6 : 0.7;
      var multInt = lv === 1 ? 0.4 : lv === 2 ? 0.4 : lv === 3 ? 0.5 : 0.5;
      if (skill.advancement === 'A' || skill.advancement === 'B') {
        multStr = 0.7;
        multInt = 0.5;
      }
      return Math.max(0, Math.floor(str * multStr) + Math.floor(int * multInt));
    }
    if (name === '清算之手' || name === '制裁' || name === '罪印') {
      int = getDisplayStat(attacker, 'int') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multIntReckon = lv === 1 ? 0.4 : lv === 2 ? 0.45 : lv === 3 ? 0.5 : 0.6;
      if (skill.advancement === 'A' || skill.advancement === 'B') multIntReckon = 0.6;
      return Math.max(0, Math.floor(int * multIntReckon));
    }
    if (name === '罪罚宣告' || name === '血祭宣判' || name === '圣言镇压') {
      int = getDisplayStat(attacker, 'int') || 0;
      sta = getDisplayStat(attacker, 'sta') || 0;
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multIntDecl = lv === 1 ? 0.8 : lv === 2 ? 0.9 : lv === 3 ? 1.0 : 1.1;
      if (skill.advancement === 'A') return Math.max(0, Math.floor(int * 1.1) + Math.floor(sta * 0.6));
      if (skill.advancement === 'B') return Math.max(0, Math.floor(int * 1.1));
      return Math.max(0, Math.floor(int * multIntDecl));
    }
    return 0;
  }

  /** 从已解析的技能描述中提取护盾数值（支持「获得 7 点护盾」「获得 6 + 5 的护盾」等，CALC 占位符会先被替换为数值） */
  function getShieldFromResolvedEffect(resolvedEffect, SKILL_CALC_PLACEHOLDER_RE) {
    if (!resolvedEffect || typeof resolvedEffect !== 'string') return NaN;
    var str = resolvedEffect.replace(SKILL_CALC_PLACEHOLDER_RE, function (_, _key, _formula, val) {
      return val;
    });
    var m = str.match(/(?:给予|获得)\s*([\d\s+]+)\s*(?:点护盾|的护盾)/);
    if (!m) return NaN;
    var part = m[1].split(/\s*\+\s*/);
    var sum = 0;
    for (var i = 0; i < part.length; i++) {
      var n = parseInt(part[i].trim(), 10);
      if (!isNaN(n)) sum += n;
    }
    return sum;
  }

  /** 根据技能计算护盾值（当 getShieldFromResolvedEffect 无法解析时使用） */
  function getShieldForSkill(attacker, skill, getDisplayStat) {
    if (!attacker || !skill) return NaN;
    var name = skill.name || '';
    if (name === '防御') return Math.max(0, getDisplayStat(attacker, 'def') || 0);
    if (name === '剑脊格挡') {
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var def = getDisplayStat(attacker, 'def') || 0;
      var str = getDisplayStat(attacker, 'str') || 0;
      var mult =
        lv === 1
          ? { def: 0.5, str: 0.3 }
          : lv === 2
            ? { def: 0.6, str: 0.3 }
            : lv === 3
              ? { def: 0.7, str: 0.4 }
              : { def: 0.8, str: 0.4 };
      return Math.max(0, Math.floor(def * mult.def + str * mult.str));
    }
    if (name === '见切') {
      lv = Math.max(1, parseInt(skill.level, 10) || 1);
      def = getDisplayStat(attacker, 'def') || 0;
      var multDef = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') multDef = 1.2;
      return Math.max(0, Math.floor(def * multDef));
    }
    if (name === '猫步' || name === '影舞' || name === '疾风') {
      var defVal = getDisplayStat(attacker, 'def') || 0;
      var agiVal = getDisplayStat(attacker, 'agi') || 0;
      if (skill.advancement === 'A') return Math.max(0, Math.floor(defVal * 1.4));
      if (skill.advancement === 'B') return Math.max(0, Math.floor(defVal * 0.8) + Math.floor(agiVal * 0.6));
      var maoLv = Math.max(1, parseInt(skill.level, 10) || 1);
      var maoMult = maoLv === 1 ? 0.8 : maoLv === 2 ? 1.0 : maoLv === 3 ? 1.2 : 1.4;
      return Math.max(0, Math.floor(defVal * maoMult));
    }
    return NaN;
  }

  /** 按等级取技能描述（effectByLevel[level-1] 或 effect） */
  function getSkillEffectForLevel(skill, lv) {
    if (!skill) return '';
    var level = Math.max(1, parseInt(lv, 10) || 1);
    if (skill.effectByLevel && skill.effectByLevel.length) {
      level = Math.min(level, skill.effectByLevel.length);
      return skill.effectByLevel[level - 1] || skill.effectByLevel[0];
    }
    return skill.effect || '';
  }

  /** 构建用于技能描述解析的显示属性（可含未固化加点 deltas），供 resolveSkillEffectWithStats 使用 */
  function getDisplayStatsForSkill(ch, deltas, getDisplayStat) {
    if (!ch) return null;
    var d = deltas || {};
    var str = getDisplayStat(ch, 'str') + (d.str || 0);
    var agi = getDisplayStat(ch, 'agi') + (d.agi || 0);
    var int = getDisplayStat(ch, 'int') + (d.int || 0);
    var sta = getDisplayStat(ch, 'sta') + (d.sta || 0);
    var def = getDisplayStat(ch, 'def') + (d.def || 0);
    var displayStats = {
      str: str,
      agi: agi,
      int: int,
      sta: sta,
      def: def,
      luk: getDisplayStat(ch, 'luk') || 0,
      cha: getDisplayStat(ch, 'cha') || 0,
      level: ch.level != null ? ch.level : 1,
    };
    if (ch.atk != null && ch.atk !== undefined) displayStats.atk = parseInt(ch.atk, 10) || 0;
    else displayStats.atk = str;
    var 守势L = 0;
    var 攻势L = 0;
    if (ch.buffs && ch.buffs.length) {
      for (var i = 0; i < ch.buffs.length; i++) {
        var b = ch.buffs[i];
        if ((b.id || b.name) === '守势') 守势L = Math.max(0, parseInt(b.layers, 10) || 0);
        if ((b.id || b.name) === '攻势') 攻势L = Math.max(0, parseInt(b.layers, 10) || 0);
      }
    }
    displayStats.转化层数 = 守势L;
    displayStats.守势层数 = 守势L;
    displayStats.攻势层数 = 攻势L;
    return displayStats;
  }

  var CALC_MARK = '\x01CALC\x02';
  var CALC_END = '\x02\x01';
  var SKILL_CALC_PLACEHOLDER_RE = /\x01CALC\x02([^\x02]+)\x02([^\x02]+)\x02([^\x02]+)\x02\x01/g;

  /** 用给定的显示属性对象解析技能描述中的占位符（支持 [Str × 0.2]、[等级 × 2]、[Def × 0.8 + Str × 0.4] 等）；计算结果以占位符输出，由 wrapBuffRefs 转为带颜色、加粗、悬停显示公式的 span */
  function resolveSkillEffectWithStats(effect, displayStats) {
    if (!effect || !displayStats) return effect || '';
    var statMap = { Str: 'str', Agi: 'agi', Int: 'int', Sta: 'sta', Def: 'def', Atk: 'atk', Cha: 'cha' };
    var termRe = /(Str|Agi|Int|Sta|Def|Atk|Cha)\s*×\s*([\d.]+)/g;
    var levelRe = /等级\s*×\s*([\d.]+)/g;
    function makePlaceholder(key, formula, value) {
      return CALC_MARK + key + '\x02' + formula + '\x02' + value + CALC_END;
    }
    return effect.replace(/\[([^\]]+)\]/g, function (_, inner) {
      var convertMatch = inner.match(/^转化层数×([\d.]+)%$/);
      if (convertMatch) {
        var pct = parseFloat(convertMatch[1], 10);
        var layers = displayStats.转化层数 != null ? displayStats.转化层数 : 0;
        var valueNum = layers * pct;
        var valueStr = valueNum % 1 === 0 ? String(valueNum) : valueNum.toFixed(1);
        var formula =
          '转化层数×' + convertMatch[1] + '% = 守势' + layers + '层×' + convertMatch[1] + '% = ' + valueStr + '%';
        return makePlaceholder('纳刀伤害', formula, valueStr + '%');
      }
      var lukPctMatch = inner.match(/^幸运×5%$/);
      if (lukPctMatch) {
        var lukVal = displayStats.luk != null ? displayStats.luk : 0;
        var pctVal = Math.min(100, Math.max(0, lukVal * 5));
        var pctStr = pctVal % 1 === 0 ? String(pctVal) : pctVal.toFixed(1);
        var formulaLuk = '幸运×5% = ' + lukVal + '×5% = ' + pctStr + '%';
        return makePlaceholder('白夜即死', formulaLuk, pctStr + '%');
      }
      var shouMatch = inner.match(/^守势层数×([\d.]+)%$/);
      if (shouMatch) {
        var shouPct = parseFloat(shouMatch[1], 10);
        var shouLayers = displayStats.守势层数 != null ? displayStats.守势层数 : 0;
        var shouVal = shouLayers * shouPct;
        var shouStr = shouVal % 1 === 0 ? String(shouVal) : shouVal.toFixed(1);
        var formulaShou =
          '守势层数×' + shouMatch[1] + '% = ' + shouLayers + '层×' + shouMatch[1] + '% = ' + shouStr + '%';
        return makePlaceholder('心眼闪避', formulaShou, shouStr + '%');
      }
      var gongMatch = inner.match(/^攻势层数×([\d.]+)%$/);
      if (gongMatch) {
        var gongPct = parseFloat(gongMatch[1], 10);
        var gongLayers = displayStats.攻势层数 != null ? displayStats.攻势层数 : 0;
        var gongVal = gongLayers * gongPct;
        var gongStr = gongVal % 1 === 0 ? String(gongVal) : gongVal.toFixed(1);
        var formulaGong =
          '攻势层数×' + gongMatch[1] + '% = ' + gongLayers + '层×' + gongMatch[1] + '% = ' + gongStr + '%';
        return makePlaceholder('心眼暴击', formulaGong, gongStr + '%');
      }
      var terms = [];
      inner.replace(levelRe, function (_, coef) {
        var val = Math.floor((Number(displayStats.level) || 1) * parseFloat(coef));
        terms.push({ key: 'level', formula: 'Lv × ' + coef, value: val });
        return '';
      });
      var innerForStat = inner.replace(levelRe, function () {
        return '';
      });
      var m;
      termRe.lastIndex = 0;
      while ((m = termRe.exec(innerForStat)) !== null) {
        var key = statMap[m[1]];
        if (key) {
          var mult = parseFloat(m[2], 10);
          var val = Math.floor((Number(displayStats[key]) || 0) * mult);
          terms.push({ key: key, formula: m[1] + ' × ' + m[2], value: val });
        }
      }
      if (terms.length === 0) return '[' + inner + ']';
      return terms
        .map(function (t) {
          return makePlaceholder(t.key, t.formula, String(t.value));
        })
        .join(' + ');
    });
  }

  /**
   * 创建技能模块 API，依赖 getDisplayStat（由 app 提供）。
   * 返回供 app / battle 使用的 { getBaseDamageForSkill, getBaseDamageFromResolvedEffect, resolveSkillEffect, resolveSkillEffectWithStats, getSkillEffectForLevel, getDisplayStatsForSkill, getShieldFromResolvedEffect, getShieldForSkill, SKILL_CALC_PLACEHOLDER_RE }。
   */
  function create(getDisplayStat) {
    if (typeof getDisplayStat !== 'function')
      getDisplayStat = function () {
        return 0;
      };
    return {
      SKILL_CALC_PLACEHOLDER_RE: SKILL_CALC_PLACEHOLDER_RE,
      getBaseDamageFromResolvedEffect: function (resolvedEffect) {
        return getBaseDamageFromResolvedEffect(resolvedEffect, SKILL_CALC_PLACEHOLDER_RE);
      },
      getBaseDamageForSkill: function (attacker, skill) {
        return getBaseDamageForSkill(attacker, skill, getDisplayStat);
      },
      getShieldFromResolvedEffect: function (resolvedEffect) {
        return getShieldFromResolvedEffect(resolvedEffect, SKILL_CALC_PLACEHOLDER_RE);
      },
      getShieldForSkill: function (attacker, skill) {
        return getShieldForSkill(attacker, skill, getDisplayStat);
      },
      getSkillEffectForLevel: getSkillEffectForLevel,
      getDisplayStatsForSkill: function (ch, deltas) {
        return getDisplayStatsForSkill(ch, deltas, getDisplayStat);
      },
      resolveSkillEffect: function (effect, ch) {
        if (!effect || !ch) return effect || '';
        var displayStats = getDisplayStatsForSkill(ch, null, getDisplayStat);
        return resolveSkillEffectWithStats(effect, displayStats);
      },
      resolveSkillEffectWithStats: resolveSkillEffectWithStats,
    };
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_skill = { create: create };
  }
})();
