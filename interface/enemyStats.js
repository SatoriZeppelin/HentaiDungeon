/**
 * 敌方数值：按档位倍率 × 区域 HP/攻/防 基准随机值，得到每只怪的确定 hp / atk / def。
 * 区域由「大层」推导：大层 1 → 区域1，大层 2 → 区域2，大层 ≥3 → 区域3（与 HUD 每 15 层一大层一致）。
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
