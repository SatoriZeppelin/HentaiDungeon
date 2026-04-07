/**
 * 色色地牢 - 存档模块（浏览器 localStorage）
 * 单槽位含：party, enemyParty, buffDefinitions, map, meta, history.recentBattleLog, nodeStates
 */
(function () {
  'use strict';

  var STORAGE_KEY = '色色地牢_saves';
  // 槽位无限：仅持久化实际存在的数据槽位；UI 额外显示 1 个空槽位供保存
  var SLOT_COUNT = null;
  var RECENT_LOG_CAP = 100;
  var NODE_STATES_CAP = 50;

  function loadRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { slots: [], lastIndex: 0 };
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return { slots: [], lastIndex: 0 };
      if (!Array.isArray(data.slots)) data.slots = [];
      data.lastIndex = Math.max(0, parseInt(data.lastIndex, 10) || 0);
      if (data.lastIndex >= data.slots.length) data.lastIndex = 0;
      return data;
    } catch (e) {
      return { slots: [], lastIndex: 0 };
    }
  }

  function saveRaw(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[色色地牢] 存档写入失败', e);
    }
  }

  /**
   * 获取所有槽位摘要，用于读取存档/保存时选择槽位
   * @returns {{ index: number, savedAt: string, areaName: string, hasData: boolean }[]}
   */
  function getSaveSlots() {
    var data = loadRaw();
    var result = [];
    for (var i = 0; i < data.slots.length; i++) {
      var slot = data.slots[i];
      var hasData = !!slot && (slot.party != null || slot.map != null);
      if (!hasData) continue;
      var partySummary = [];
      try {
        var party = Array.isArray(slot.party) ? slot.party : [];
        for (var pi = 0; pi < party.length; pi++) {
          var ch = party[pi];
          if (!ch) continue;
          partySummary.push({
            name: ch.name || '',
            level: ch.level != null ? ch.level : 1,
            avatar: ch.avatar || '',
          });
          if (partySummary.length >= 4) break;
        }
      } catch (eP) {
        console.warn('[色色地牢] 读取存档队伍摘要失败', eP);
      }
      result.push({
        index: i,
        savedAt: (slot && slot.meta && slot.meta.savedAt) || '',
        areaName: (slot && slot.meta && slot.meta.areaName) || (slot && slot.map && slot.map.area) || '',
        characterNames: (slot && slot.meta && slot.meta.characterNames) || [],
        partySummary: partySummary,
        hasData: true,
      });
    }
    // 栈式顺序：最近保存的在上（ISO 时间可直接字符串比较）；无时间则视为最旧
    result.sort(function (a, b) {
      var as = a && a.savedAt ? String(a.savedAt) : '';
      var bs = b && b.savedAt ? String(b.savedAt) : '';
      if (as === bs) return (b.index | 0) - (a.index | 0);
      if (!as) return 1;
      if (!bs) return -1;
      return bs > as ? 1 : -1;
    });
    // 始终在最上面追加 1 个空槽位，方便“保存为新存档”
    result.unshift({
      index: data.slots.length,
      savedAt: '',
      areaName: '',
      characterNames: [],
      partySummary: [],
      hasData: false,
    });
    return result;
  }

  /**
   * 读取指定槽位
   * @param {number} index 槽位索引
   * @returns {{ party, enemyParty, buffDefinitions, map, history, nodeStates } | null}
   */
  function loadSlot(index) {
    var data = loadRaw();
    var i = Math.max(0, parseInt(index, 10));
    if (i >= data.slots.length) return null;
    var slot = data.slots[i];
    if (!slot || (slot.party == null && slot.map == null)) return null;
    return {
      party: Array.isArray(slot.party) ? slot.party : null,
      enemyParty: Array.isArray(slot.enemyParty) ? slot.enemyParty : null,
      buffDefinitions: Array.isArray(slot.buffDefinitions) ? slot.buffDefinitions : null,
      map: slot && typeof slot.map === 'object' ? slot.map : null,
      history: slot.history && typeof slot.history === 'object' ? slot.history : null,
      nodeStates: slot.nodeStates && typeof slot.nodeStates === 'object' ? slot.nodeStates : null,
      meta: slot.meta && typeof slot.meta === 'object' ? slot.meta : {}
    };
  }

  /**
   * 写入指定槽位
   * @param {number} index 槽位索引
   * @param {object} payload { party, enemyParty, buffDefinitions?, map?, meta?, history?, nodeStates? }
   */
  function saveSlot(index, payload) {
    var data = loadRaw();
    var i = Math.max(0, parseInt(index, 10));
    // 允许写入任意索引：不足部分用 null 补齐
    while (data.slots.length <= i) data.slots.push(null);
    var party = Array.isArray(payload.party) ? payload.party : null;
    var enemyParty = Array.isArray(payload.enemyParty) ? payload.enemyParty : null;
    var recentLog = (payload.history && Array.isArray(payload.history.recentBattleLog))
      ? payload.history.recentBattleLog.slice(-RECENT_LOG_CAP)
      : [];
    var nodeStates = payload.nodeStates && typeof payload.nodeStates === 'object' ? payload.nodeStates : {};
    var keys = Object.keys(nodeStates);
    if (keys.length > NODE_STATES_CAP) {
      var trimmed = {};
      keys.slice(-NODE_STATES_CAP).forEach(function (k) {
        trimmed[k] = nodeStates[k];
      });
      nodeStates = trimmed;
    }
    var map = payload.map && typeof payload.map === 'object' ? payload.map : null;
    var meta = payload.meta && typeof payload.meta === 'object' ? payload.meta : {};
    if (!meta.savedAt) meta.savedAt = new Date().toISOString();
    if (map && map.area && !meta.areaName) meta.areaName = map.area;
    if (party && !meta.characterNames) {
      meta.characterNames = party.filter(Boolean).map(function (ch) { return ch.name; }).filter(Boolean);
    }
    data.slots[i] = {
      party: party,
      enemyParty: enemyParty,
      buffDefinitions: Array.isArray(payload.buffDefinitions) ? payload.buffDefinitions : null,
      map: map,
      meta: meta,
      history: { recentBattleLog: recentLog },
      nodeStates: nodeStates
    };
    data.lastIndex = i;
    saveRaw(data);
  }

  /**
   * 清空指定槽位（置为 null），并在清空 lastIndex 时回退到 0。
   * @param {number} index
   */
  function clearSlot(index) {
    var data = loadRaw();
    var i = Math.max(0, parseInt(index, 10));
    if (i >= data.slots.length) return;
    data.slots[i] = null;
    if ((data.lastIndex | 0) === i) data.lastIndex = 0;
    saveRaw(data);
  }

  function getLastSlotIndex() {
    return loadRaw().lastIndex;
  }

  function setLastSlotIndex(n) {
    var data = loadRaw();
    data.lastIndex = Math.max(0, parseInt(n, 10) || 0);
    if (data.lastIndex >= data.slots.length) data.lastIndex = 0;
    saveRaw(data);
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_save = {
      getSaveSlots: getSaveSlots,
      loadSlot: loadSlot,
      saveSlot: saveSlot,
      clearSlot: clearSlot,
      getLastSlotIndex: getLastSlotIndex,
      setLastSlotIndex: setLastSlotIndex,
      SLOT_COUNT: SLOT_COUNT
    };
  }
})();
