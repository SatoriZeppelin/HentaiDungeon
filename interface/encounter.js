/**
 * 地图遭遇：进入「普通战斗」等格子时，按层数抽敌方组合并发给 AI（generate）。
 * 依赖酒馆助手的全局 generate；由 app.js 在点击地图格子时调用。
 */
(function () {
  'use strict';

  /** 与 begining.js NEW_GAME_AREAS 一致：用于普通战斗发给 AI 的区域四行文案（标题用短名 title） */
  var AREA_NORMAL_BATTLE_PROMPT = {
    艾尔瑟斯森林: {
      title: '艾尔瑟斯森林',
      line2: '古老密林深处的腐化蔓延',
      line3: '妖异的花香与黏稠的藤蔓',
      tags: '精灵(友方) · 腐化植物 · 腐化动物 · 触手',
    },
    格里莫瓦王国旧都: {
      title: '格里莫瓦旧都',
      line2: '覆灭王国的残骸与白骨',
      line3: '徘徊的亡魂与觊觎的盗墓者',
      tags: '亡灵 · 野兽 · 寻宝者',
    },
    拉文斯庄园: {
      title: '拉文斯庄园',
      line2: '永夜笼罩的贵族宅邸',
      line3: '优雅的猎食者与忠诚的仆从',
      tags: '吸血鬼贵族 · 仆从 · 活化物品',
    },
    地狱边缘: {
      title: '地狱边缘',
      line2: '炼狱与现世的交界裂隙',
      line3: '恶魔与堕落者的欲望乐园',
      tags: '恶魔 · 堕落天使 · 魔化生物',
    },
  };

  /**
   * 分值组合（内部仍用 z/p/q）：z=杂兵 fodder，p=普通 normal，q=强力 strong；预留 elite / boss 供扩展。
   * 同档内等概率抽取。
   */
  var NORMAL_BATTLE_COMPOSITIONS = {
    tier13: [
      { z: 3, p: 0, q: 0 },
      { z: 1, p: 1, q: 0 },
      { z: 4, p: 0, q: 0 },
      { z: 0, p: 2, q: 0 },
      { z: 2, p: 1, q: 0 },
      { z: 1, p: 2, q: 0 },
    ],
    tier46: [
      { z: 2, p: 0, q: 1 },
      { z: 1, p: 2, q: 0 },
      { z: 0, p: 1, q: 1 },
      { z: 0, p: 3, q: 0 },
      { z: 1, p: 1, q: 1 },
      { z: 2, p: 2, q: 0 },
    ],
    tier79: [
      { z: 0, p: 2, q: 1 },
      { z: 1, p: 0, q: 2 },
      { z: 2, p: 1, q: 1 },
      { z: 0, p: 1, q: 2 },
      { z: 0, p: 4, q: 0 },
      { z: 0, p: 0, q: 3 },
    ],
    tier1014: [
      { z: 0, p: 0, q: 3 },
      { z: 0, p: 2, q: 2 },
      { z: 1, p: 1, q: 2 },
      { z: 1, p: 0, q: 3 },
    ],
  };

  function getLayerFromMapNodeId(nodeId) {
    var parts = (nodeId || '').toString().split('-');
    var col = parseInt(parts[0], 10);
    return isNaN(col) ? 0 : col;
  }

  function pickNormalBattleComposition(layer) {
    var L = layer | 0;
    var key = 'tier13';
    if (L >= 4 && L <= 6) key = 'tier46';
    else if (L >= 7 && L <= 9) key = 'tier79';
    else if (L >= 10 && L <= 14) key = 'tier1014';
    else if (L >= 15) key = 'tier1014';
    var arr = NORMAL_BATTLE_COMPOSITIONS[key];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function formatCompositionGenLine(comp) {
    if (!comp) return '生成';
    var parts = [];
    if (comp.q) parts.push(comp.q + 'strong');
    if (comp.p) parts.push(comp.p + 'normal');
    if (comp.z) parts.push(comp.z + 'fodder');
    if (comp.e) parts.push(comp.e + 'elite');
    if (comp.b) parts.push(comp.b + 'boss');
    return '生成' + parts.join('');
  }

  function getAreaNormalBattlePromptLines(areaName) {
    var raw = (areaName || '').toString().trim();
    if (AREA_NORMAL_BATTLE_PROMPT[raw]) return AREA_NORMAL_BATTLE_PROMPT[raw];
    if (raw === '格里莫瓦旧都') return AREA_NORMAL_BATTLE_PROMPT['格里莫瓦王国旧都'];
    return {
      title: raw || '未知区域',
      line2: '',
      line3: '',
      tags: '',
    };
  }

  function buildNormalBattleAiPrompt(areaName, comp) {
    var lines = getAreaNormalBattlePromptLines(areaName);
    var gen = formatCompositionGenLine(comp);
    return (
      lines.title +
      '\n' +
      lines.line2 +
      '\n' +
      lines.line3 +
      '\n' +
      lines.tags +
      '\n' +
      gen
    );
  }

  /** 进入「普通战斗」格时：按层数档位等概率抽组合，拼区域文案 +「生成…」，控制台输出并调用 generate（不经输入框） */
  function requestNormalBattleAiPrompt(areaName, nodeId) {
    var layer = getLayerFromMapNodeId(nodeId);
    var comp = pickNormalBattleComposition(layer);
    var text = buildNormalBattleAiPrompt(areaName, comp);
    console.info('[色色地牢][普通战斗] 层数(列号)=' + layer + ' 组合=' + JSON.stringify(comp));
    console.info('[色色地牢][普通战斗] 发送给 AI 的提示词:\n' + text);
    if (typeof generate !== 'function') {
      console.warn('[色色地牢][普通战斗] generate 不可用，仅已输出控制台');
      return;
    }
    generate({ user_input: text, should_silence: true })
      .then(function (result) {
        console.info(
          '[色色地牢][普通战斗] AI 生成结束，返回长度=' + (result && result.length != null ? result.length : 0),
        );
        if (
          typeof window.色色地牢_enemyDesign !== 'undefined' &&
          window.色色地牢_enemyDesign &&
          typeof window.色色地牢_enemyDesign.tryParseAiReply === 'function'
        ) {
          var parsed = window.色色地牢_enemyDesign.tryParseAiReply(result);
          if (parsed && parsed.enemies && parsed.enemies.length) {
            console.info('[色色地牢][enemy_design] 解析成功:', parsed);
            if (typeof window.色色地牢_enemyDesign.buildSpawnPlanFromDesign === 'function') {
              var plan = window.色色地牢_enemyDesign.buildSpawnPlanFromDesign(parsed, { nodeId: nodeId });
              if (plan) {
                console.info('[色色地牢][enemy_design] 生成计划（含数值）:', plan);
                if (typeof window.色色地牢_commitSpawnPlanToBattle === 'function')
                  window.色色地牢_commitSpawnPlanToBattle(plan);
              }
            }
          }
        }
      })
      .catch(function (err) {
        console.error('[色色地牢][普通战斗] generate 失败', err);
      });
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_encounter = {
      AREA_NORMAL_BATTLE_PROMPT: AREA_NORMAL_BATTLE_PROMPT,
      NORMAL_BATTLE_COMPOSITIONS: NORMAL_BATTLE_COMPOSITIONS,
      getLayerFromMapNodeId: getLayerFromMapNodeId,
      pickNormalBattleComposition: pickNormalBattleComposition,
      formatCompositionGenLine: formatCompositionGenLine,
      getAreaNormalBattlePromptLines: getAreaNormalBattlePromptLines,
      buildNormalBattleAiPrompt: buildNormalBattleAiPrompt,
      requestNormalBattleAiPrompt: requestNormalBattleAiPrompt,
    };
    window.色色地牢_requestNormalBattleAiPrompt = requestNormalBattleAiPrompt;
  }
})();
