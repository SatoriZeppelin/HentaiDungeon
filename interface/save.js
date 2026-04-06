/**
 * 色色地牢 - 存档模块（浏览器 localStorage）
 * 单槽位含：party, enemyParty, buffDefinitions, map, meta, history.recentBattleLog, nodeStates
 */
(function () {
  'use strict';

  var STORAGE_KEY = '色色地牢_saves';
  var SLOT_COUNT = 5;
  var RECENT_LOG_CAP = 100;
  var NODE_STATES_CAP = 50;

  function loadRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { slots: [], lastIndex: 0 };
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return { slots: [], lastIndex: 0 };
      if (!Array.isArray(data.slots)) data.slots = [];
      while (data.slots.length < SLOT_COUNT) data.slots.push(null);
      data.slots = data.slots.slice(0, SLOT_COUNT);
      data.lastIndex = Math.max(0, parseInt(data.lastIndex, 10) || 0);
      if (data.lastIndex >= SLOT_COUNT) data.lastIndex = 0;
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
    for (var i = 0; i < SLOT_COUNT; i++) {
      var slot = data.slots[i];
      var hasData = !!slot && (slot.party != null || slot.map != null);
      result.push({
        index: i,
        savedAt: (slot && slot.meta && slot.meta.savedAt) || '',
        areaName: (slot && slot.meta && slot.meta.areaName) || (slot && slot.map && slot.map.area) || '',
        characterNames: (slot && slot.meta && slot.meta.characterNames) || [],
        hasData: hasData
      });
    }
    return result;
  }

  /**
   * 读取指定槽位
   * @param {number} index 槽位索引 0 ~ SLOT_COUNT-1
   * @returns {{ party, enemyParty, buffDefinitions, map, history, nodeStates } | null}
   */
  function loadSlot(index) {
    var data = loadRaw();
    var i = Math.max(0, parseInt(index, 10));
    if (i >= SLOT_COUNT) return null;
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
    if (i >= SLOT_COUNT) return;
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

  function getLastSlotIndex() {
    return loadRaw().lastIndex;
  }

  function setLastSlotIndex(n) {
    var data = loadRaw();
    data.lastIndex = Math.max(0, Math.min(SLOT_COUNT - 1, parseInt(n, 10) || 0));
    saveRaw(data);
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_save = {
      getSaveSlots: getSaveSlots,
      loadSlot: loadSlot,
      saveSlot: saveSlot,
      getLastSlotIndex: getLastSlotIndex,
      setLastSlotIndex: setLastSlotIndex,
      SLOT_COUNT: SLOT_COUNT
    };
  }
})();
