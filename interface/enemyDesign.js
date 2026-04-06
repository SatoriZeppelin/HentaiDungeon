/**
 * 解析 AI 可能返回的 <enemy_design> 片段（精英/杂兵等 + 意图管道符）。
 * 意图行格式：<target|scope|action|effect|param1|param2>，字段可为空。
 *
 * 怪物名片：`<名称|种族>`、`<名称|种族|性别>`，或 `<名称|种族|性别|体型>`。
 * 体型（第四段，可选）：tiny / small / medium / large / huge；省略时按 medium。
 * 示例：
 * <player|single|attack||14|> — 对单个玩家造成 14 点伤害
 * <player|aoe|multi_attack||4|3> — 对全体玩家 3 段、每段 4 点
 * <self||taunt|||> — 对自身嘲讽：程序侧**固定为 2 层**（忽略 AI 填写的层数）
 */
(function () {
  'use strict';

  var RANK_TAGS = ['elite', 'fodder', 'normal', 'strong', 'boss'];
  /** 嘲讽（taunt）在战斗规则中固定为 2 层，与 AI 是否在 param 中写层数无关 */
  var TAUNT_LAYERS_FIXED = 2;

  var BODY_SIZE_KEYS = ['tiny', 'small', 'medium', 'large', 'huge'];
  /** 体型：省略或非法时视为 medium */
  function normalizeBodySize(s) {
    var k = (s || '').toString().toLowerCase().trim();
    if (BODY_SIZE_KEYS.indexOf(k) !== -1) return k;
    return 'medium';
  }
  /** tiny 基础 1～5ml（整数），其余体型为 tiny 的 2、3、4、5 倍（猥亵/侵犯等用） */
  function getBodySizeMultiplier(size) {
    var i = BODY_SIZE_KEYS.indexOf(normalizeBodySize(size));
    return i >= 0 ? i + 1 : 3;
  }
  function rollSemenMlForBodySize(bodySize, rng) {
    rng = rng || Math.random;
    var mult = getBodySizeMultiplier(bodySize);
    var base = Math.floor(rng() * 5) + 1;
    return base * mult;
  }

  /** 将管道串解析为固定 6 段（不足补空） */
  function parsePipeSegments(body) {
    var parts = String(body || '').split('|');
    while (parts.length < 6) parts.push('');
    return parts.slice(0, 6);
  }

  function isTauntIntent(action, effect) {
    var a = (action || '').toLowerCase().trim();
    var e = (effect || '').toLowerCase().trim();
    return a === 'taunt' || e === 'taunt';
  }

  /**
   * 解析单条意图（不含尖括号的内容），如 player|single|attack||14|
   * 嘲讽：始终附带 tauntLayers=2，param1 规范为 '2'
   * @returns {{ target: string, scope: string, action: string, effect: string, param1: string, param2: string, tauntLayers: number|null, raw: string }}
   */
  function parseIntentLine(body) {
    var p = parsePipeSegments(body);
    var action = p[2] || '';
    var effect = p[3] || '';
    var param1 = p[4] || '';
    var param2 = p[5] || '';
    var tauntLayers = null;
    if (isTauntIntent(action, effect)) {
      tauntLayers = TAUNT_LAYERS_FIXED;
      param1 = String(TAUNT_LAYERS_FIXED);
    }
    return {
      target: p[0] || '',
      scope: p[1] || '',
      action: action,
      effect: effect,
      param1: param1,
      param2: param2,
      tauntLayers: tauntLayers,
      raw: body,
    };
  }

  /** 从 <intent>...</intent> 内提取所有 <...|...|...> 意图行 */
  function parseIntentBlock(intentInner) {
    var intents = [];
    var re = /<([^>\n]+)>/g;
    var m;
    while ((m = re.exec(intentInner)) !== null) {
      var inner = m[1].trim();
      if (inner.indexOf('|') === -1) continue;
      intents.push(parseIntentLine(inner));
    }
    return intents;
  }

  /**
   * 解析怪物名片：`<名称|种族>`、`<名称|种族|性别>`、`<名称|种族|性别|体型>`。
   * 第三段性别、第四段体型可选；体型为 tiny|small|medium|large|huge。
   */
  function parseNameSpeciesLine(lineInner) {
    var p = parsePipeSegments(lineInner);
    return {
      name: (p[0] || '').trim(),
      species: (p[1] || '').trim(),
      gender: (p[2] || '').trim(),
      bodySize: normalizeBodySize(p[3]),
      raw: lineInner,
    };
  }

  /**
   * 解析单个 rank 块（如 <elite>...</elite> 内部）
   */
  function parseRankBlock(rank, chunk) {
    var trimmed = String(chunk || '').trim();
    var intentMatch = trimmed.match(/<intent\s*>([\s\S]*?)<\/intent>/i);
    var intents = [];
    var rest = trimmed;
    if (intentMatch) {
      intents = parseIntentBlock(intentMatch[1]);
      rest = trimmed.replace(intentMatch[0], '').trim();
    }
    var nameLine = rest.match(/<([^>\n]+)>/);
    var name = '';
    var species = '';
    var gender = '';
    var bodySize = 'medium';
    if (nameLine && nameLine[1].indexOf('|') !== -1) {
      var ns = parseNameSpeciesLine(nameLine[1]);
      name = ns.name;
      species = ns.species;
      gender = ns.gender || '';
      bodySize = ns.bodySize || 'medium';
    } else if (nameLine) {
      name = nameLine[1].trim();
    }
    return {
      rank: rank,
      name: name,
      species: species,
      gender: gender,
      bodySize: bodySize,
      intents: intents,
    };
  }

  /**
   * 从整段文本中解析 <enemy_design>...</enemy_design>
   * @returns {{ enemies: Array<{ rank, name, species, gender, bodySize, intents }> } | null}
   */
  function parseEnemyDesign(text) {
    if (!text || typeof text !== 'string') return null;
    var root = text.match(/<enemy_design\s*>([\s\S]*?)<\/enemy_design>/i);
    if (!root) return null;
    var inner = root[1];
    var enemies = [];
    RANK_TAGS.forEach(function (rank) {
      var re = new RegExp('<' + rank + '\\s*>([\\s\\S]*?)<\\/' + rank + '>', 'gi');
      var m;
      while ((m = re.exec(inner)) !== null) {
        enemies.push(parseRankBlock(rank, m[1]));
      }
    });
    return { enemies: enemies };
  }

  /** 若文本中含 enemy_design 则解析，否则返回 null */
  function tryParseAiReply(text) {
    if (!text || String(text).indexOf('<enemy_design') === -1) return null;
    try {
      return parseEnemyDesign(text);
    } catch (e) {
      console.warn('[色色地牢][enemy_design] 解析异常', e);
      return null;
    }
  }

  /** Fisher–Yates 打乱数组（副本） */
  function shuffleInPlace(arr, rng) {
    var a = arr;
    var random = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /**
   * 在 1～6 号槽中随机且不重复地取 n 个槽位（与 enemies 顺序一一对应配对）。
   */
  function pickRandomEnemySlots(n, rng) {
    var pool = [1, 2, 3, 4, 5, 6];
    shuffleInPlace(pool, rng);
    return pool.slice(0, Math.min(6, Math.max(0, n | 0)));
  }

  /** 与 battle 中敌方 level 字段一致，供 AI 权重等读取 */
  function rankToDisplayLevel(rank) {
    var k = (rank || '').toString().toLowerCase().trim();
    var map = {
      fodder: 'Fodder',
      normal: 'Normal',
      strong: 'Strong',
      elite: 'Elite',
      boss: 'Boss',
    };
    return map[k] || 'Normal';
  }

  /**
   * 将含 stats 的 spawn plan 转为 6 槽 enemyParty（与 getEnemyParty / renderEnemySlots 字段一致）。
   * @returns {Array|null} 长度 6；若无任何有效单位则 null
   */
  function buildEnemyPartyFromSpawnPlan(plan) {
    if (!plan || !Array.isArray(plan.units)) return null;
    var arr = [null, null, null, null, null, null];
    var placed = 0;
    for (var i = 0; i < plan.units.length; i++) {
      var u = plan.units[i];
      var slot = u.enemySlot | 0;
      if (slot < 1 || slot > 6) continue;
      var st = u.stats;
      if (!st) continue;
      arr[slot - 1] = {
        name: u.name || '未命名',
        species: u.species || '',
        gender: u.gender != null && String(u.gender).trim() !== '' ? String(u.gender).trim() : '',
        bodySize: u.bodySize != null ? normalizeBodySize(u.bodySize) : 'medium',
        rank: u.rank,
        level: rankToDisplayLevel(u.rank),
        hp: st.hp,
        maxHp: st.maxHp,
        atk: st.atk,
        def: st.def,
        buffs: [],
        intents: u.intents || [],
        intentSummary: u.intentSummary,
      };
      placed++;
    }
    return placed > 0 ? arr : null;
  }

  /**
   * 根据解析结果描述「会如何生成」敌方单位；stats 由 enemyStats 填入；写入战斗由 app 的 commitSpawnPlanToBattle 完成。
   * 规则简述：enemies 与单位一一对应，但 **敌方槽位 1～6 随机填充**（互不重复）；每只怪带 name/species/gender/bodySize（可选）/rank 与意图列表；嘲讽意图一律按 2 层处理。
   * @param {{ enemies: Array }} parsed
   * @param {{ rng?: () => number }} options 可选，传入 rng 便于测试固定随机序列
   */
  function buildSpawnPlanFromDesign(parsed, options) {
    if (!parsed || !Array.isArray(parsed.enemies) || parsed.enemies.length === 0) return null;
    options = options || {};
    var rng = typeof options.rng === 'function' ? options.rng : Math.random;
    var n = Math.min(6, parsed.enemies.length);
    var slots = pickRandomEnemySlots(n, rng);
    var units = [];
    for (var i = 0; i < n; i++) {
      var e = parsed.enemies[i];
      units.push({
        enemySlot: slots[i],
        rank: e.rank,
        name: e.name || '未命名',
        species: e.species || '',
        gender: e.gender != null && String(e.gender).trim() !== '' ? String(e.gender).trim() : '',
        bodySize: e.bodySize != null ? normalizeBodySize(e.bodySize) : 'medium',
        intents: e.intents || [],
        intentSummary: (e.intents || []).map(function (it) {
          if (it.tauntLayers != null) return 'taunt×' + it.tauntLayers + '(固定)';
          return [it.action || it.effect, it.param1, it.param2].filter(Boolean).join('/');
        }),
      });
    }
    var plan = {
      totalUnits: units.length,
      slotAssignment: 'random',
      slotsUsed: slots.slice(),
      units: units,
      note: '按 units[].enemySlot 填入 enemyParty；stats 由 enemyStats 计算。调用方应 commitSpawnPlanToBattle(plan) 写入变量并刷新战斗视图。',
    };
    if (
      typeof window.色色地牢_enemyStats !== 'undefined' &&
      window.色色地牢_enemyStats &&
      typeof window.色色地牢_enemyStats.applySpawnPlanStats === 'function'
    ) {
      window.色色地牢_enemyStats.applySpawnPlanStats(plan, options);
    }
    return plan;
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_enemyDesign = {
      RANK_TAGS: RANK_TAGS,
      TAUNT_LAYERS_FIXED: TAUNT_LAYERS_FIXED,
      parseIntentLine: parseIntentLine,
      parseEnemyDesign: parseEnemyDesign,
      parseNameSpeciesLine: parseNameSpeciesLine,
      tryParseAiReply: tryParseAiReply,
      buildSpawnPlanFromDesign: buildSpawnPlanFromDesign,
      buildEnemyPartyFromSpawnPlan: buildEnemyPartyFromSpawnPlan,
      rankToDisplayLevel: rankToDisplayLevel,
      pickRandomEnemySlots: pickRandomEnemySlots,
      BODY_SIZE_KEYS: BODY_SIZE_KEYS,
      normalizeBodySize: normalizeBodySize,
      getBodySizeMultiplier: getBodySizeMultiplier,
      rollSemenMlForBodySize: rollSemenMlForBodySize,
    };
  }
})();
