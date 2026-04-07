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

  function compositionScore(comp) {
    if (!comp) return 0;
    return (comp.z | 0) * 1 + (comp.p | 0) * 2 + (comp.q | 0) * 3 + (comp.e | 0) * 5 + (comp.b | 0) * 0;
  }

  function getNormalBudgetRange(layer) {
    var L = layer | 0;
    var key = 'tier13';
    if (L >= 4 && L <= 6) key = 'tier46';
    else if (L >= 7 && L <= 9) key = 'tier79';
    else if (L >= 10 && L <= 14) key = 'tier1014';
    else if (L >= 15) key = 'tier1014';
    var arr = NORMAL_BATTLE_COMPOSITIONS[key] || [];
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < arr.length; i++) {
      var sc = compositionScore(arr[i]);
      if (sc < min) min = sc;
      if (sc > max) max = sc;
    }
    if (!isFinite(min) || !isFinite(max)) return { min: 0, max: 0, key: key };
    return { min: min, max: max, key: key };
  }

  /**
   * 4.3 精英战斗预算修正：
   * - 精英怪物（5分值）必出 1 单位
   * - 精英战斗总预算 = 当前层普通战斗预算 + 2
   * - 剩余预算用于配置随从
   */
  function pickEliteBattleComposition(layer) {
    var range = getNormalBudgetRange(layer);
    var totalMin = (range.min | 0) + 2;
    var totalMax = (range.max | 0) + 2;
    if (totalMax < totalMin) totalMax = totalMin;
    var total = totalMin + Math.floor(Math.random() * (totalMax - totalMin + 1));

    var remainder = total - 5; // 先扣除 1 个精英（5 分）
    if (remainder < 0) remainder = 0;

    // 随从仅用 z/p/q（1/2/3 分），并限制总单位数不超过 6（精英占 1）
    var followers = [];
    for (var z = 0; z <= 5; z++) {
      for (var p = 0; p <= 5; p++) {
        for (var q = 0; q <= 5; q++) {
          var units = z + p + q;
          if (units > 5) continue;
          var sc = z * 1 + p * 2 + q * 3;
          if (sc !== remainder) continue;
          followers.push({ z: z, p: p, q: q });
        }
      }
    }

    var f = followers.length ? followers[Math.floor(Math.random() * followers.length)] : { z: 0, p: 0, q: 0 };
    return {
      e: 1,
      z: f.z | 0,
      p: f.p | 0,
      q: f.q | 0,
      _budget: {
        normalKey: range.key,
        normalMin: range.min,
        normalMax: range.max,
        totalMin: totalMin,
        totalMax: totalMax,
        total: total,
        remainder: remainder,
      },
    };
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

  /** @param {string} nodeId 地图节点 id，拼在标签行下一行：前往x-y（仅经 generate 发送，不写输入框） */
  function buildNormalBattleAiPrompt(areaName, comp, nodeId, nodeType, layer) {
    var lines = getAreaNormalBattlePromptLines(areaName);
    var gen = formatCompositionGenLine(comp);
    var goLine = '前往' + (nodeId != null ? String(nodeId).trim() : '');
    var extra = '';
    if (nodeType === '精英战斗' && comp && comp._budget) {
      var b = comp._budget;
      extra =
        '\n\n' +
        '4.3 精英战斗的预算修正\n' +
        '  精英怪物（5分值）为必出单位，剩余预算用于配置随从。\n' +
        '  精英战斗总预算 = 当前层普通战斗预算 + 2。\n' +
        '  示例：第7层精英战斗，预算 = 7至9 + 2 = 9至11。\n' +
        '  组合：1精英(5)+2普通(4)=9 / 1精英(5)+1强力+1杂兵(4)=9 / 1精英(5)+1强力+1普通(5)=10。\n' +
        '\n' +
        '（本次：普通预算 ' +
        b.normalMin +
        '至' +
        b.normalMax +
        '，精英预算 ' +
        b.totalMin +
        '至' +
        b.totalMax +
        '，抽中总预算=' +
        b.total +
        '，随从预算=' +
        b.remainder +
        '）';
    }
    return (
      lines.title +
      '\n' +
      lines.line2 +
      '\n' +
      lines.line3 +
      '\n' +
      lines.tags +
      '\n' +
      goLine +
      '\n' +
      gen +
      extra
    );
  }

  /** 最近一次普通战斗 generate 的上下文，供「再次生成」与错误面板使用 */
  var lastNormalBattleGenCtx = null;

  function clearLastNormalBattleGenCtx() {
    lastNormalBattleGenCtx = null;
  }

  function formatGenerateErrorDetail(err) {
    if (err == null) return '(无详情)';
    if (typeof err === 'string') return err;
    if (err && err.message) return String(err.message) + (err.stack ? '\n' + err.stack : '');
    try {
      return JSON.stringify(err);
    } catch (e) {
      return String(err);
    }
  }

  function showNormalBattleGenerateErrorPanel(payload) {
    payload = payload || {};
    if (typeof window.色色地牢_showNormalBattleGenerateError === 'function') {
      window.色色地牢_showNormalBattleGenerateError(payload);
    } else {
      console.error('[色色地牢][普通战斗] 生成出错', payload);
    }
  }

  function handleNormalBattleGenerateCommitted() {
    clearLastNormalBattleGenCtx();
  }

  /**
   * 使用已拼好的提示词执行 generate → 解析 enemy_design → 写入战斗。
   * @param {string} text
   * @param {string} areaName
   * @param {string} nodeId
   */
  function runNormalBattleGenerate(text, areaName, nodeId) {
    if (typeof generate !== 'function') {
      console.warn('[色色地牢][普通战斗] generate 不可用');
      showNormalBattleGenerateErrorPanel({
        title: '生成出错',
        body: '当前环境未提供酒馆助手 generate 接口，无法请求 AI。',
      });
      return;
    }
    generate({ user_input: text, should_silence: true })
      .then(function (result) {
        var raw = result == null ? '' : String(result);
        console.info(
          '[色色地牢][普通战斗] AI 生成结束，返回长度=' + (raw != null ? raw.length : 0),
        );
        var ed = window.色色地牢_enemyDesign;
        if (!ed || typeof ed.tryParseAiReply !== 'function') {
          showNormalBattleGenerateErrorPanel({
            title: '生成出错',
            body: raw || '(空回复)',
          });
          return;
        }
        var parsed = ed.tryParseAiReply(result);
        if (!parsed || !parsed.enemies || !parsed.enemies.length) {
          showNormalBattleGenerateErrorPanel({
            title: '生成出错',
            body: raw || '(回复中未找到可解析的 <enemy_design> 或敌方配置为空)',
          });
          return;
        }
        if (typeof ed.buildSpawnPlanFromDesign !== 'function') {
          showNormalBattleGenerateErrorPanel({
            title: '生成出错',
            body: raw,
          });
          return;
        }
        var plan = ed.buildSpawnPlanFromDesign(parsed, { nodeId: nodeId });
        if (!plan) {
          showNormalBattleGenerateErrorPanel({
            title: '生成出错',
            body: raw,
          });
          return;
        }
        console.info('[色色地牢][enemy_design] 生成计划（含数值）:', plan);
        if (typeof window.色色地牢_commitSpawnPlanToBattle !== 'function') {
          showNormalBattleGenerateErrorPanel({
            title: '生成出错',
            body: raw + '\n\n(内部错误：commitSpawnPlanToBattle 不可用)',
          });
          return;
        }
        var committed = window.色色地牢_commitSpawnPlanToBattle(plan);
        if (committed) {
          console.info('[色色地牢][enemy_design] 解析成功并已写入战斗');
          handleNormalBattleGenerateCommitted();
        } else {
          showNormalBattleGenerateErrorPanel({
            title: '生成出错',
            body: raw + '\n\n(无法根据生成结果构建敌方队伍，请检查 AI 输出格式)',
          });
        }
      })
      .catch(function (err) {
        console.error('[色色地牢][普通战斗] generate 失败', err);
        showNormalBattleGenerateErrorPanel({
          title: '生成出错',
          body: formatGenerateErrorDetail(err),
        });
      });
  }

  /** 进入「普通战斗」格时：按层数档位等概率抽组合，拼区域文案 +「生成…」，控制台输出并调用 generate（不经输入框） */
  function requestNormalBattleAiPrompt(areaName, nodeId, nodeType) {
    var layer = getLayerFromMapNodeId(nodeId);
    var t = nodeType != null ? String(nodeType).trim() : '普通战斗';
    var comp = t === '精英战斗' ? pickEliteBattleComposition(layer) : pickNormalBattleComposition(layer);
    var text = buildNormalBattleAiPrompt(areaName, comp, nodeId, t, layer);
    lastNormalBattleGenCtx = { areaName: areaName, nodeId: nodeId, text: text };
    console.info(
      '[色色地牢][' +
        t +
        '] 层数(列号)=' +
        layer +
        ' 组合=' +
        JSON.stringify(comp),
    );
    console.info('[色色地牢][' + t + '] 发送给 AI 的提示词:\n' + text);
    runNormalBattleGenerate(text, areaName, nodeId);
  }

  /** 再次生成：沿用上一次抽中的提示词与同 nodeId（不重新随机组合） */
  function retryLastNormalBattleGenerate() {
    if (!lastNormalBattleGenCtx || !lastNormalBattleGenCtx.text) {
      console.warn('[色色地牢][普通战斗] 无可用重试上下文');
      return;
    }
    var c = lastNormalBattleGenCtx;
    runNormalBattleGenerate(c.text, c.areaName, c.nodeId);
  }

  if (typeof window !== 'undefined') {
    window.色色地牢_encounter = {
      AREA_NORMAL_BATTLE_PROMPT: AREA_NORMAL_BATTLE_PROMPT,
      NORMAL_BATTLE_COMPOSITIONS: NORMAL_BATTLE_COMPOSITIONS,
      getLayerFromMapNodeId: getLayerFromMapNodeId,
      pickNormalBattleComposition: pickNormalBattleComposition,
      pickEliteBattleComposition: pickEliteBattleComposition,
      getNormalBudgetRange: getNormalBudgetRange,
      compositionScore: compositionScore,
      formatCompositionGenLine: formatCompositionGenLine,
      getAreaNormalBattlePromptLines: getAreaNormalBattlePromptLines,
      buildNormalBattleAiPrompt: buildNormalBattleAiPrompt,
      requestNormalBattleAiPrompt: requestNormalBattleAiPrompt,
      retryLastNormalBattleGenerate: retryLastNormalBattleGenerate,
      clearLastNormalBattleGenCtx: clearLastNormalBattleGenCtx,
      runNormalBattleGenerate: runNormalBattleGenerate,
    };
    window.色色地牢_requestNormalBattleAiPrompt = requestNormalBattleAiPrompt;
    window.色色地牢_retryLastNormalBattleGenerate = retryLastNormalBattleGenerate;
    window.色色地牢_clearLastNormalBattleGenCtx = clearLastNormalBattleGenCtx;
  }
})();
