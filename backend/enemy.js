/**
 * backend/enemy.js — 敌方数值 + `<enemy_design>` 解析（合并自原 `enemyStats.js`、`enemyDesign.js`）。
 * 对外仍为 **`window.色色地牢_enemyStats`** 与 **`window.色色地牢_enemyDesign`**；本文件内先执行数值 IIFE，再执行解析 IIFE。
 */
(function () {
  'use strict';

  var RANK_STATS = {
    fodder: { score: 1, hpMult: 0.5, atkMult: 0.6, defMult: 0.3 },
    normal: { score: 2, hpMult: 1.0, atkMult: 1.0, defMult: 1.0 },
    strong: { score: 3, hpMult: 1.6, atkMult: 1.2, defMult: 1.2 },
    elite: { score: 5, hpMult: 2.5, atkMult: 1.35, defMult: 1.35 },
    /** Boss：HP 倍率在 800%～1000% 间随机；攻防 150% */
    boss: { score: 0, hpMultMin: 8.0, hpMultMax: 10.0, atkMult: 1.5, defMult: 1.5 },
  };

  /** 区域1～3 的基准区间（与开局可选区域剧情档对应，数值侧为三段成长） */
  var REGION_BASE = [
    { id: 1, hpMin: 40, hpMax: 50, atkMin: 10, atkMax: 18, defMin: 5, defMax: 10 },
    { id: 2, hpMin: 100, hpMax: 175, atkMin: 15, atkMax: 25, defMin: 10, defMax: 20 },
    { id: 3, hpMin: 200, hpMax: 300, atkMin: 20, atkMax: 35, defMin: 20, defMax: 30 },
  ];

  function randomIntInclusive(min, max, rng) {
    var r = rng || Math.random;
    var lo = Math.ceil(Math.min(min, max));
    var hi = Math.floor(Math.max(min, max));
    if (hi < lo) return lo;
    return Math.floor(lo + r() * (hi - lo + 1));
  }

  /** 与 app 中 computeFloorHUDFromPos 一致：列号即累计层 N，大层 = ceil(N/15)，N=0 视为大层 1 */
  function majorFromNodeId(nodeId) {
    var parts = (nodeId || '0-0').toString().split('-');
    var col = parseInt(parts[0], 10);
    if (isNaN(col) || col <= 0) return 1;
    var globalN = col;
    return Math.ceil(globalN / 15);
  }

  /** 大层 1→区域索引0，大层2→1，大层≥3→2 */
  function regionIndexFromMajor(major) {
    var m = major | 0;
    if (m <= 1) return 0;
    if (m === 2) return 1;
    return 2;
  }

  function regionIndexFromNodeId(nodeId) {
    return regionIndexFromMajor(majorFromNodeId(nodeId));
  }

  function normalizeRankKey(rank) {
    var k = (rank || '').toString().toLowerCase().trim();
    if (RANK_STATS[k]) return k;
    if (k === 'fodder') return 'fodder';
    return 'normal';
  }

  /**
   * 开局难度 → 敌方最终数值在「基准×档位倍率」之后再乘的系数（与 begining.js 文案一致）。
   * 休闲：生命100%、伤害(攻击)60%；普通：均衡 100%；困难：生命与伤害(攻击)+20%（防御不变）。
   */
  function getDifficultyMonsterMult(difficultyId) {
    var id = (difficultyId != null ? String(difficultyId) : '').trim();
    if (id === '休闲') return { hp: 1.0, atk: 0.6, def: 1.0 };
    if (id === '困难') return { hp: 1.2, atk: 1.2, def: 1.0 };
    return { hp: 1.0, atk: 1.0, def: 1.0 };
  }

  /** 在 computeStatsForRank 结果上再乘难度系数（整数化，至少为 1） */
  function applyDifficultyMultipliersToStats(st, mult) {
    if (!st || !mult) return st;
    var hpM = mult.hp != null ? Number(mult.hp) : 1;
    var atkM = mult.atk != null ? Number(mult.atk) : 1;
    var defM = mult.def != null ? Number(mult.def) : 1;
    if (hpM !== hpM || hpM <= 0) hpM = 1;
    if (atkM !== atkM || atkM <= 0) atkM = 1;
    if (defM !== defM || defM <= 0) defM = 1;
    st.hp = Math.max(1, Math.round(st.hp * hpM));
    st.maxHp = st.hp;
    st.atk = Math.max(1, Math.round(st.atk * atkM));
    st.def = Math.max(1, Math.round(st.def * defM));
    return st;
  }

  /**
   * 对单只怪：在指定区域基准内各掷一次整数，再乘档位倍率。
   * @returns {{ baseHp, baseAtk, baseDef, hp, maxHp, atk, def, rank, score, hpMultUsed, atkMultUsed, defMultUsed, regionId }}
   */
  function computeStatsForRank(rank, regionIndex, rng) {
    rng = rng || Math.random;
    var rk = normalizeRankKey(rank);
    var rs = RANK_STATS[rk] || RANK_STATS.normal;
    var ri = Math.max(0, Math.min(REGION_BASE.length - 1, regionIndex | 0));
    var base = REGION_BASE[ri];

    var baseHp = randomIntInclusive(base.hpMin, base.hpMax, rng);
    var baseAtk = randomIntInclusive(base.atkMin, base.atkMax, rng);
    var baseDef = randomIntInclusive(base.defMin, base.defMax, rng);

    var hpMultUsed;
    var hp;
    var maxHp;
    if (rk === 'boss') {
      hpMultUsed = rs.hpMultMin + rng() * (rs.hpMultMax - rs.hpMultMin);
      hp = Math.max(1, Math.round(baseHp * hpMultUsed));
      maxHp = hp;
    } else {
      hpMultUsed = rs.hpMult;
      hp = Math.max(1, Math.round(baseHp * rs.hpMult));
      maxHp = hp;
    }

    var atkMultUsed = rk === 'boss' ? rs.atkMult : rs.atkMult;
    var defMultUsed = rk === 'boss' ? rs.defMult : rs.defMult;
    var atk = Math.max(1, Math.round(baseAtk * atkMultUsed));
    var def = Math.max(1, Math.round(baseDef * defMultUsed));

    return {
      regionId: base.id,
      score: rs.score != null ? rs.score : 0,
      baseHp: baseHp,
      baseAtk: baseAtk,
      baseDef: baseDef,
      hp: hp,
      maxHp: maxHp,
      atk: atk,
      def: def,
      rank: rk,
      hpMultUsed: hpMultUsed,
      atkMultUsed: atkMultUsed,
      defMultUsed: defMultUsed,
    };
  }

  /**
   * 给 buildSpawnPlanFromDesign 的 plan.units 逐项填入 stats（需已有 rank、enemySlot）。
   * options：{ nodeId } 或 { major } 或 { regionIndex }，{ rng }
   */
  function applySpawnPlanStats(plan, options) {
    if (!plan || !Array.isArray(plan.units)) return plan;
    options = options || {};
    var rng = options.rng || Math.random;
    var ri = options.regionIndex;
    if (ri == null && options.major != null) ri = regionIndexFromMajor(options.major);
    if (ri == null && options.nodeId != null) ri = regionIndexFromNodeId(options.nodeId);
    if (ri == null) ri = 0;

    var difficulty = options.difficulty;
    if (difficulty == null && typeof getVariables === 'function') {
      try {
        var v0 = getVariables({ type: 'chat' });
        if (v0 && v0.difficulty != null) difficulty = v0.difficulty;
      } catch (e0) {}
    }
    var diffMult = getDifficultyMonsterMult(difficulty);

    plan.regionIndex = ri;
    plan.regionId = REGION_BASE[ri] && REGION_BASE[ri].id;
    plan.major = options.major != null ? options.major : majorFromNodeId(options.nodeId);
    plan.difficulty = difficulty != null ? difficulty : '普通';
    plan.difficultyMonsterMult = diffMult;

    for (var i = 0; i < plan.units.length; i++) {
      var u = plan.units[i];
      u.stats = computeStatsForRank(u.rank, ri, rng);
      applyDifficultyMultipliersToStats(u.stats, diffMult);
    }
    plan.statsNote =
      '基准来自区域' +
      (REGION_BASE[ri] && REGION_BASE[ri].id) +
      '（大层' +
      (plan.major != null ? plan.major : '?') +
      '）；各怪独立掷基准再乘档位倍率；再乘开局难度系数（当前「' +
      (difficulty != null && String(difficulty) !== '' ? difficulty : '普通') +
      '」：生命×' +
      diffMult.hp +
      '、攻击×' +
      diffMult.atk +
      '、防御×' +
      diffMult.def +
      '）。';
    return plan;
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_enemyStats = {
      RANK_STATS: RANK_STATS,
      REGION_BASE: REGION_BASE,
      majorFromNodeId: majorFromNodeId,
      regionIndexFromMajor: regionIndexFromMajor,
      regionIndexFromNodeId: regionIndexFromNodeId,
      computeStatsForRank: computeStatsForRank,
      applySpawnPlanStats: applySpawnPlanStats,
      getDifficultyMonsterMult: getDifficultyMonsterMult,
      applyDifficultyMultipliersToStats: applyDifficultyMultipliersToStats,
      randomIntInclusive: randomIntInclusive,
    };
  }
})();

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

  /** elite/fodder/…/intent 等不可作楼层名 */
  function isReservedEnemyDesignTag(tag) {
    var t = (tag || '').toString().toLowerCase().trim();
    if (!t) return true;
    if (RANK_TAGS.indexOf(t) !== -1) return true;
    if (t === 'intent' || t === 'enemy_design') return true;
    return false;
  }

  /**
   * 解析 `<enemy_design>` 内紧跟根后的可选楼层标签，如 `<封印监牢>` 或 `<封印监牢></封印监牢>`；
   * 标签名即为当前 floor 显示名。去掉该段后再解析 rank 块。
   * @returns {{ floorName: string, inner: string }}
   */
  function extractFloorNameFromEnemyDesignInner(inner) {
    var trimmed = String(inner || '').replace(/^\s+/, '');
    if (!trimmed) return { floorName: '', inner: inner };
    var sc = trimmed.match(/^<([^\s>/]+)\s*\/>/);
    if (sc && !isReservedEnemyDesignTag(sc[1])) {
      return { floorName: sc[1].trim(), inner: trimmed.slice(sc[0].length) };
    }
    var pair = trimmed.match(/^<([^\s>/]+)(\s[^>]*)?>([\s\S]*?)<\/\1\s*>/i);
    if (pair && !isReservedEnemyDesignTag(pair[1])) {
      return { floorName: pair[1].trim(), inner: trimmed.slice(pair[0].length) };
    }
    var open = trimmed.match(/^<([^\s>/]+)(\s[^>]*)?>/);
    if (open && !isReservedEnemyDesignTag(open[1])) {
      return { floorName: open[1].trim(), inner: trimmed.slice(open[0].length) };
    }
    return { floorName: '', inner: inner };
  }

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
   * @returns {{ enemies: Array<{ rank, name, species, gender, bodySize, intents }>, floorName?: string } | null}
   */
  function parseEnemyDesign(text) {
    if (!text || typeof text !== 'string') return null;
    var root = text.match(/<enemy_design\s*>([\s\S]*?)<\/enemy_design>/i);
    if (!root) return null;
    var floorExtract = extractFloorNameFromEnemyDesignInner(root[1]);
    var inner = floorExtract.inner;
    var floorName = floorExtract.floorName || '';
    var enemies = [];
    RANK_TAGS.forEach(function (rank) {
      var re = new RegExp('<' + rank + '\\s*>([\\s\\S]*?)<\\/' + rank + '>', 'gi');
      var m;
      while ((m = re.exec(inner)) !== null) {
        enemies.push(parseRankBlock(rank, m[1]));
      }
    });
    return { enemies: enemies, floorName: floorName };
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
   * 根据解析结果描述「会如何生成」敌方单位；stats 由同文件内 `window.色色地牢_enemyStats` 填入；写入战斗由 app 的 commitSpawnPlanToBattle 完成。
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
      floorName: parsed.floorName != null && String(parsed.floorName).trim() !== '' ? String(parsed.floorName).trim() : '',
      note: '按 units[].enemySlot 填入 enemyParty；stats 由 window.色色地牢_enemyStats 计算。调用方应 commitSpawnPlanToBattle(plan) 写入变量并刷新战斗视图。',
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
      extractFloorNameFromEnemyDesignInner: extractFloorNameFromEnemyDesignInner,
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
