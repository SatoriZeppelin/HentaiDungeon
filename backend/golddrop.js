/**
 * 战斗胜利金币掉落：按当前区域档位（区域1/2/3）与战斗类型（普通/精英/首领）在区间内随机。
 * 区域映射与 NEW_GAME_AREAS 顺序一致：艾尔瑟斯→区域1，格里莫瓦→区域2，拉文斯与地狱边缘→区域3。
 */
(function () {
  'use strict';

  var AREA_ORDER = ['艾尔瑟斯森林', '格里莫瓦王国旧都', '拉文斯庄园', '地狱边缘'];

  var RULES_TEXT =
    '区域1·基准掉落\n' +
    '普通战斗\n' +
    '掉落区间：12-20金币\n\n' +
    '精英战斗\n' +
    '掉落区间：30-45金币\n\n' +
    '首领战斗\n' +
    '掉落区间：50-80金币\n\n' +
    '区域2·强化掉落（+50%）\n' +
    '普通战斗\n' +
    '掉落区间：18-30金币\n\n' +
    '精英战斗\n' +
    '掉落区间：45-68金币\n\n' +
    '首领战斗\n' +
    '掉落区间：75-120金币\n\n' +
    '区域3·高级掉落（+100%）\n' +
    '普通战斗\n' +
    '掉落区间：24-40金币\n\n' +
    '精英战斗\n' +
    '掉落区间：60-90金币\n\n' +
    '首领战斗\n' +
    '掉落区间：100-160金币（与区域1首领同比+100%）';

  /** @returns {number} 0=区域1, 1=区域2, 2=区域3 */
  function getTierIndexFromArea(areaName) {
    var a = (areaName || '').toString().trim();
    if (a === '格里莫瓦旧都') a = '格里莫瓦王国旧都';
    var i = AREA_ORDER.indexOf(a);
    if (i < 0) return 0;
    if (i === 0) return 0;
    if (i === 1) return 1;
    return 2;
  }

  function kindKeyFromNodeType(nodeType) {
    var t = (nodeType || '').toString();
    if (t === '精英战斗') return 'elite';
    if (t === '首领战斗') return 'boss';
    return 'normal';
  }

  /**
   * tierIndex: 0,1,2
   * kind: normal | elite | boss
   */
  var DROP_TABLE = {
    normal: [
      [12, 20],
      [18, 30],
      [24, 40],
    ],
    elite: [
      [30, 45],
      [45, 68],
      [60, 90],
    ],
    boss: [
      [50, 80],
      [75, 120],
      [100, 160],
    ],
  };

  function rollInclusive(lo, hi) {
    var a = Math.min(lo, hi);
    var b = Math.max(lo, hi);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  /**
   * @param {string} areaName 地图区域名
   * @param {string} nodeType 普通战斗 | 精英战斗 | 首领战斗
   * @returns {number}
   */
  function rollBattleGold(areaName, nodeType) {
    var tier = getTierIndexFromArea(areaName);
    var kind = kindKeyFromNodeType(nodeType);
    var row = DROP_TABLE[kind];
    if (!row || !row[tier]) return 0;
    var range = row[tier];
    return rollInclusive(range[0], range[1]);
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_goldDrop = {
      AREA_ORDER: AREA_ORDER,
      RULES_TEXT: RULES_TEXT,
      getTierIndexFromArea: getTierIndexFromArea,
      rollBattleGold: rollBattleGold,
    };
  }
})();
