/**
 * 色色地牢 - 战斗逻辑（前排/后排、可攻击目标）
 * 约定：竖直为一排，横着为一列；网格为 3 排 × 2 列，槽位 1～6。
 * 己方：前排 2、4、6（靠敌），后排 1、3、5。敌方：前排 1、3、5（靠玩家），后排 2、4、6。仅当前排全空时才能攻击后排。
 */
(function () {
  'use strict';

  /** 槽位总数（己方或敌方单侧） */
  const SLOT_COUNT = 6;

  /** 前排槽位编号（己方：图中靠敌的一列）2、4、6。当且仅当这三个槽位都无角色时，后排才可被攻击 */
  const FRONT_ROW_SLOTS = [2, 4, 6];

  /** 后排槽位编号（己方）：1、3、5 */
  const BACK_ROW_SLOTS = [1, 3, 5];

  /** 敌方前排槽位编号（靠玩家的一列，与己方相反）：1、3、5 */
  const ENEMY_FRONT_ROW_SLOTS = [1, 3, 5];
  /** 敌方后排槽位编号：2、4、6 */
  const ENEMY_BACK_ROW_SLOTS = [2, 4, 6];

  /** 所有槽位编号 1～6 */
  const ALL_SLOT_INDICES = [1, 2, 3, 4, 5, 6];

  /** 最近战斗日志行（供存档用），最多保留条数 */
  const RECENT_LOG_MAX = 100;
  let recentLogLines = [];

  /**
   * 判断槽位是否属于前排
   * @param {number} slotIndex 槽位编号 1～6
   * @returns {boolean}
   */
  function isFrontRow(slotIndex) {
    return FRONT_ROW_SLOTS.indexOf(Number(slotIndex)) !== -1;
  }

  /**
   * 判断槽位是否属于后排
   * @param {number} slotIndex 槽位编号 1～6
   * @returns {boolean}
   */
  function isBackRow(slotIndex) {
    return BACK_ROW_SLOTS.indexOf(Number(slotIndex)) !== -1;
  }

  /**
   * 获取前排槽位编号数组（只读副本）
   * @returns {number[]}
   */
  function getFrontRowSlots() {
    return FRONT_ROW_SLOTS.slice();
  }

  /**
   * 获取后排槽位编号数组（只读副本）
   * @returns {number[]}
   */
  function getBackRowSlots() {
    return BACK_ROW_SLOTS.slice();
  }

  /**
   * 判断一侧（己方或敌方）前排是否至少有一个单位
   * @param {Array<object|null>} slots 该侧 6 个槽位的单位列表，slots[0] 对应 1 号位，slots[5] 对应 6 号位；空位为 null 或 undefined
   * @returns {boolean} 前排(2、4、6)中是否至少有一个非空
   */
  function hasAnyUnitInFrontRow(slots) {
    if (!slots || slots.length < SLOT_COUNT) return false;
    for (let i = 0; i < FRONT_ROW_SLOTS.length; i++) {
      const idx = FRONT_ROW_SLOTS[i] - 1;
      if (slots[idx] != null) return true;
    }
    return false;
  }

  /**
   * 获取敌方在给定槽位状态下可被选为攻击目标的槽位编号列表
   * 敌方前排为 1、3、5（靠玩家），后排为 2、4、6；仅当前排全空或前排无存活单位时才能攻击后排
   * 只返回有存活单位（hp > 0）的槽位；前排有任一存活单位时，后排不可选。
   */
  function getTargetableEnemySlotIndices(slots) {
    if (!slots || slots.length < SLOT_COUNT) return [];
    function isAlive(unit) {
      if (unit == null) return false;
      const hp = unit.hp != null ? parseInt(unit.hp, 10) : 1;
      return hp > 0;
    }
    let frontHasAlive = false;
    for (var i = 0; i < ENEMY_FRONT_ROW_SLOTS.length; i++) {
      if (isAlive(slots[ENEMY_FRONT_ROW_SLOTS[i] - 1])) {
        frontHasAlive = true;
        break;
      }
    }
    const candidateSlots = ENEMY_FRONT_ROW_SLOTS.slice();
    if (!frontHasAlive) {
      for (i = 0; i < ENEMY_BACK_ROW_SLOTS.length; i++) {
        candidateSlots.push(ENEMY_BACK_ROW_SLOTS[i]);
      }
    }
    const out = [];
    for (i = 0; i < candidateSlots.length; i++) {
      if (isAlive(slots[candidateSlots[i] - 1])) out.push(candidateSlots[i]);
    }
    return out;
  }

  /**
   * 判断某槽位在当前敌方槽位状态下是否可作为攻击目标（敌方前排=1,3,5）
   * 仅当该槽位有存活单位时才算可目标；后排仅当前排无存活单位时可选。
   */
  function canTargetEnemySlot(targetSlotIndex, slots) {
    const idx = Number(targetSlotIndex);
    if (idx < 1 || idx > SLOT_COUNT) return false;
    function isAlive(unit) {
      if (unit == null) return false;
      const hp = unit.hp != null ? parseInt(unit.hp, 10) : 1;
      return hp > 0;
    }
    if (!isAlive(slots[idx - 1])) return false;
    if (ENEMY_FRONT_ROW_SLOTS.indexOf(idx) !== -1) return true;
    if (ENEMY_BACK_ROW_SLOTS.indexOf(idx) !== -1) {
      for (let i = 0; i < ENEMY_FRONT_ROW_SLOTS.length; i++) {
        if (isAlive(slots[ENEMY_FRONT_ROW_SLOTS[i] - 1])) return false;
      }
      return true;
    }
    return false;
  }

  /**
   * 获取己方（或通用）在给定槽位状态下可被选为攻击目标的槽位编号列表
   * 规则：前排(2、4、6)始终可被攻击；后排(1、3、5)仅当前排全部无单位时才能被攻击
   * @param {Array<object|null>} slots 被攻击一侧的 6 个槽位单位列表，slots[0]=1号位,…,slots[5]=6号位
   * @returns {number[]} 可被攻击的槽位编号数组（1～6）
   */
  function getTargetableSlotIndices(slots) {
    if (!slots || slots.length < SLOT_COUNT) return [];
    const frontOccupied = hasAnyUnitInFrontRow(slots);
    const out = [];
    let i;
    for (i = 0; i < FRONT_ROW_SLOTS.length; i++) {
      out.push(FRONT_ROW_SLOTS[i]);
    }
    if (!frontOccupied) {
      for (i = 0; i < BACK_ROW_SLOTS.length; i++) {
        out.push(BACK_ROW_SLOTS[i]);
      }
    }
    return out;
  }

  /**
   * 判断某槽位在当前槽位状态下是否可作为攻击目标
   * @param {number} targetSlotIndex 目标槽位编号 1～6
   * @param {Array<object|null>} slots 目标所在侧的 6 个槽位单位列表
   * @returns {boolean}
   */
  function canTargetSlot(targetSlotIndex, slots) {
    const idx = Number(targetSlotIndex);
    if (idx < 1 || idx > SLOT_COUNT) return false;
    if (isFrontRow(idx)) return true;
    if (isBackRow(idx)) return !hasAnyUnitInFrontRow(slots);
    return false;
  }

  /**
   * 己方存在嘲讽时，敌方只能选择带嘲讽且存活的槽位；多人带嘲讽则随机其一。嘲讽优先于占位（后排有嘲讽时也必须打嘲讽）。依赖 getHpFromSta、getDisplayStat，在 initBattleUI 内赋值。
   * @param {Array<object|null>} party 己方 6 槽位
   * @returns {number[]} 可被攻击的己方槽位编号 1～6
   */
  let getTargetableAllySlotsForEnemy;

  /**
   * 游戏内 buff 定义。desc：用于显示的描述（悬停/说明均读此字段）；maxLayers：层数上限，不设或 0 表示无上限。
   * 条目顺序：①通用增益 ②通用减益（debuff）③色情类减益 ④角色专属（仅特定角色技能施加；含 characterExclusive 便于检索）。
   */
  const BUFF_DEFINITIONS = [
    // ---------- ① 通用增益 ----------
    { id: '护盾', name: '护盾', desc: '抵消伤害', tooltip: '抵消伤害。' },
    {
      id: '力量强化',
      name: '力量强化',
      desc: '每层力量+3',
      tooltip: '每层力量+3。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '敏捷强化',
      name: '敏捷强化',
      desc: '每层敏捷+3',
      tooltip: '每层敏捷+3。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '智力强化',
      name: '智力强化',
      desc: '每层智力+3',
      tooltip: '每层智力+3。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '攻击强化',
      name: '攻击强化',
      desc: '每层攻击+3',
      tooltip: '每层攻击+3。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '防御强化',
      name: '防御强化',
      desc: '每层防御+3',
      tooltip: '每层防御+3。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '再生',
      name: '再生',
      desc: '回合结束时恢复等同于当前层数的生命值',
      tooltip: '回合结束时恢复等同于当前层数的生命值。无上限。',
    },
    {
      id: '坚韧',
      name: '坚韧',
      desc: '受到的所有伤害-5%（每层）',
      tooltip: '每层使受到的所有伤害-5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '锁定',
      name: '锁定',
      desc: '下一次远程技能伤害+20%',
      tooltip: '下一次远程技能伤害+20%。触发后消耗一层。玩家结算回合清空。',
      maxLayers: 1,
    },
    {
      id: '扑杀',
      name: '扑杀',
      desc: '下一次近战技能伤害+20%',
      tooltip: '下一次近战技能伤害+20%。触发后消耗一层。玩家结算回合清空。',
      maxLayers: 1,
    },
    {
      id: '剑势',
      name: '剑势',
      desc: '灵犀·涟漪、沧澜等技能累积的剑意',
      tooltip: '上限20层。不会在回合结束时被清除；进入新一场战斗（切换楼层遭遇）时清空。',
      maxLayers: 20,
    },
    {
      id: '踏浪',
      name: '踏浪',
      desc: '踏浪行歌：每使用一个消耗 AP 的指令后额外获得1层【剑势】',
      tooltip: '持续至下个玩家行动回合开始。',
      maxLayers: 1,
    },
    {
      id: '虚无',
      name: '虚无',
      desc: '完全不可选中，持续至下回合开始',
      tooltip: '相位转移中：无法被敌方攻击，无法接受友方增益和治疗。回合开始时解除并对敌方全体造成伤害。',
      maxLayers: 1,
    },
    // ---------- ② 通用减益（debuff）----------
    {
      id: '力量削弱',
      name: '力量削弱',
      desc: '力量属性-5',
      tooltip: '对应属性-5。上限3层。',
      maxLayers: 3,
    },
    {
      id: '敏捷削弱',
      name: '敏捷削弱',
      desc: '敏捷属性-5',
      tooltip: '对应属性-5。上限3层。',
      maxLayers: 3,
    },
    {
      id: '智力削弱',
      name: '智力削弱',
      desc: '智力属性-5',
      tooltip: '对应属性-5。上限3层。',
      maxLayers: 3,
    },
    {
      id: '攻击削弱',
      name: '攻击削弱',
      desc: '攻击属性-5',
      tooltip: '对应属性-5。上限3层。',
      maxLayers: 3,
    },
    {
      id: '防御削弱',
      name: '防御削弱',
      desc: '防御属性-5',
      tooltip: '对应属性-5。上限3层。',
      maxLayers: 3,
    },
    {
      id: '虚弱',
      name: '虚弱',
      desc: '造成的所有伤害-5%（每层）',
      tooltip: '每层使造成的所有伤害-5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '脆弱',
      name: '脆弱',
      desc: '受到的所有伤害+5%（每层）',
      tooltip: '每层使受到的所有伤害+5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '破甲',
      name: '破甲',
      desc: '受到的物理伤害+5%（每层）',
      tooltip: '每层使受到的物理伤害+5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '碎魔',
      name: '碎魔',
      desc: '受到的魔法伤害+5%（每层）',
      tooltip: '每层使受到的魔法伤害+5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '燃烧',
      name: '燃烧',
      desc: '回合结束时受到等同于当前层数的伤害',
      tooltip: '回合结束时受到等同于当前层数的伤害。无上限。',
    },
    {
      id: '流血',
      name: '流血',
      desc: '回合结束时受到等同于当前层数的伤害',
      tooltip: '回合结束时受到等同于当前层数的伤害。无上限。',
    },
    {
      id: '重伤',
      name: '重伤',
      desc: '回合结束时受到等同于当前层数的伤害',
      tooltip: '回合结束时受到等同于当前层数的伤害。无上限。',
    },
    {
      id: '中毒',
      name: '中毒',
      desc: '回合结束时受到等同于当前层数的伤害',
      tooltip: '回合结束时受到等同于当前层数的伤害。无上限',
    },
    {
      id: '眩晕',
      name: '眩晕',
      desc: '无效化该角色任意一次行动',
      tooltip:
        '每次尝试行动会消去 1 层，该次不产生技能效果，但仍消耗该行动对应的 AP（潮汐沧澜、猎手本能等 0 AP 项除外）。不随回合结束衰减。',
      maxLayers: 3,
    },
    {
      id: '魅惑',
      name: '魅惑',
      desc: '无效化该角色任意一次行动',
      tooltip: '无效化该角色任意一次行动',
      maxLayers: 3,
    },
    {
      id: '沉默',
      name: '沉默',
      desc: '无效化该角色一次魔法行动',
      tooltip: '无效化该角色一次魔法行动',
      maxLayers: 3,
    },
    {
      id: '缴械',
      name: '缴械',
      desc: '无效化该角色一次物理行动',
      tooltip: '无效化该角色一次物理行动',
      maxLayers: 3,
    },
    {
      id: '混乱',
      name: '混乱',
      desc: '将行动目标随机更换为场上除自己外任意角色',
      tooltip: '将该行动目标随机更换为场上除自己以外的任意角色',
      maxLayers: 3,
    },
    {
      id: '麻痹',
      name: '麻痹',
      desc: '累计3层时消耗3层并施加1层眩晕',
      tooltip: '累计3层时，消耗3层并施加1层眩晕。行动阶段-1层。上限3层。',
      maxLayers: 3,
    },
    {
      id: '冻结',
      name: '冻结',
      desc: '造成冰霜伤害时暴击率翻倍并消耗1层',
      tooltip: '造成冰霜伤害时，暴击率翻倍，并消耗1层冻结。行动阶段-1层。上限3层。',
      maxLayers: 3,
    },
    {
      id: '暗蚀',
      name: '暗蚀',
      desc: '受到的暗影魔法伤害+10%',
      tooltip: '受到的暗影魔法伤害+10%。行动阶段-1层。上限3层。',
      maxLayers: 3,
    },
    {
      id: '迟缓',
      name: '迟缓',
      desc: '闪避-5%（每层）',
      tooltip: '每层闪避-5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '迟钝',
      name: '迟钝',
      desc: '暴击-5%（每层）',
      tooltip: '每层暴击-5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '恍惚',
      name: '恍惚',
      desc: '命中-5%（每层）',
      tooltip: '每层命中-5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '乏力',
      name: '乏力',
      desc: '爆伤-10%（每层）',
      tooltip: '每层暴击伤害-10%（仅暴击时生效）。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    // ---------- ③ 色情类减益 ----------
    {
      id: '发情',
      name: '发情',
      desc: '暴击率-N%（每层5%，上限15%）',
      tooltip: '暴击率-5%。上限3层。',
      maxLayers: 3,
    },
    {
      id: '羞耻',
      name: '羞耻',
      desc: '命中率-N%（每层5%，上限15%）',
      tooltip: '命中率-5%。上限3层。',
      maxLayers: 3,
    },
    { id: '轻微破损', name: '轻微破损', desc: '防御-10%', tooltip: '防御-10%。永久（无自动结算）。' },
    { id: '中度破损', name: '中度破损', desc: '防御-20%', tooltip: '防御-20%。永久（无自动结算）。' },
    { id: '严重破损', name: '严重破损', desc: '防御-30%', tooltip: '防御-30%。永久（无自动结算）。' },
    // ---------- ④ 角色专属 buff ----------
    {
      id: '攻势',
      name: '攻势',
      desc: '力量+2',
      tooltip: '每层力量+2。结算回合清空身上所有的攻势。层数无上限。',
      characterExclusive: '昼墨',
    },
    {
      id: '守势',
      name: '守势',
      desc: '敏捷+2',
      tooltip: '每层敏捷+2。结算回合清空身上所有的守势。层数无上限。',
      characterExclusive: '昼墨',
    },
    {
      id: '灵巧',
      name: '灵巧',
      desc: '闪避+5%（每层）',
      tooltip: '每层闪避+5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
      characterExclusive: '黯 / 岚',
    },
    {
      id: '专注',
      name: '专注',
      desc: '命中+5%（每层）',
      tooltip: '每层命中+5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
      characterExclusive: '岚',
    },
    {
      id: '精准',
      name: '精准',
      desc: '暴击+5%（每层）',
      tooltip: '每层暴击+5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
      characterExclusive: '岚',
    },
    {
      id: '残暴',
      name: '残暴',
      desc: '爆伤+10%（每层）',
      tooltip: '每层暴击伤害+10%（仅暴击时生效）。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
    },
    {
      id: '心满意足',
      name: '心满意足',
      desc: '力量+1，敏捷+1',
      tooltip: '每层力量+1、敏捷+1。上限10层。',
      maxLayers: 10,
      characterExclusive: '岚',
    },
    {
      id: '激励',
      name: '激励',
      desc: '造成的所有伤害+5%（每层）',
      tooltip: '每层使造成的所有伤害+5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
      characterExclusive: '预留（当前无技能叠加，仅结算公式读取）',
    },
    {
      id: '格挡',
      name: '格挡',
      desc: '受到的物理伤害-5%（每层）',
      tooltip: '每层使受到的物理伤害-5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
      characterExclusive: '预留（当前无技能叠加，仅结算公式读取）',
    },
    {
      id: '扰魔',
      name: '扰魔',
      desc: '受到的魔法伤害-5%（每层）',
      tooltip: '每层使受到的魔法伤害-5%。施加时生效，回合结束阶段-1层。上限5层。',
      maxLayers: 5,
      characterExclusive: '预留（当前无技能叠加，仅结算公式读取）',
    },
    {
      id: '嘲讽',
      name: '嘲讽',
      desc: '被视为优先攻击的对象',
      tooltip: '被视为优先攻击的对象。上限2层。',
      maxLayers: 2,
      characterExclusive: '达芙妮 / 艾丽卡；敌方意图可自施',
    },
    {
      id: '孕育',
      name: '孕育',
      desc: '每层治疗+3%、防御+5%',
      tooltip: '丝伊德·白被动「共生母胎」：受到伤害时叠加，上限10层。每层受到的治疗效果+3%、防御属性+5%。',
      maxLayers: 10,
      characterExclusive: '丝伊德·白',
    },
    {
      id: '姬骑',
      name: '姬骑',
      desc: '全武装形态：全属性+50%，免疫控制，AP上限-2',
      tooltip:
        '特殊技能「姬骑解禁」：全属性+50%，免疫眩晕等控制，AP上限-2；每回合开始自动对随机敌方发动无消耗碧血魔剑。持续至战斗结束。',
      maxLayers: 1,
      characterExclusive: '丝伊德·白',
    },
    {
      id: '诗章',
      name: '诗章',
      desc: '每层智力+1；≥10层时额外耐力+5',
      tooltip:
        '凌遥仙被动「星海咏叹」：可从技能获得或使用。每层智力+1；【诗章】≥10层时额外耐力+5。上限15层。回合结束阶段-1层。',
      maxLayers: 15,
      characterExclusive: '凌遥仙',
    },
    {
      id: '星辰加速',
      name: '星辰加速',
      desc: '本回合下数次行动的 AP 消耗-1（至少1）',
      tooltip:
        '凌遥仙特殊技能：每层使下一次行动的 AP 消耗减少1（最少为1），使用该次减免时消耗一层。回合结束时清除剩余【星辰加速】。',
      maxLayers: 3,
      characterExclusive: '凌遥仙',
    },
    {
      id: '星命',
      name: '星命',
      desc: '受到致死伤害时保留1点生命并获得护盾，随后移除',
      tooltip: '受到致死伤害时保留1点生命并获得护盾，随后移除。',
      maxLayers: 1,
    },
    {
      id: '命仪精准',
      name: '命仪精准',
      desc: '下次攻击必中必暴',
      tooltip: '本回合下一次攻击必定命中且必定暴击。',
      maxLayers: 1,
    },
    {
      id: '愉悦',
      name: '愉悦',
      desc: '每层智力+2',
      tooltip:
        '月见遥被动「观测者的愉悦」：场上任意单位攻击未命中，或攻击方带有【混乱】且攻击命中时叠加，上限10层。每层智力+2。',
      maxLayers: 10,
      characterExclusive: '月见遥',
    },
    {
      id: '虚实颠倒',
      name: '虚实颠倒',
      desc: '伤害与治疗对 HP 的效果反转',
      tooltip:
        '月见遥特殊「虚实颠倒」：持续1回合。期间受到的 HP 伤害转化为治疗，受到的治疗转化为伤害（护盾结算仍正常扣盾）。',
      maxLayers: 1,
      characterExclusive: '月见遥',
    },
    {
      id: '力量增幅',
      name: '力量增幅',
      desc: '每层力量+3',
      tooltip: '永恒咏唱升华：每层力量+3。',
      maxLayers: 5,
    },
    {
      id: '敏捷增幅',
      name: '敏捷增幅',
      desc: '每层敏捷+3',
      tooltip: '永恒咏唱升华：每层敏捷+3。',
      maxLayers: 5,
    },
    {
      id: '智力增幅',
      name: '智力增幅',
      desc: '每层智力+3',
      tooltip: '永恒咏唱升华：每层智力+3。',
      maxLayers: 5,
    },
    {
      id: '防御增幅',
      name: '防御增幅',
      desc: '每层防御+3',
      tooltip: '永恒咏唱升华：每层防御+3。',
      maxLayers: 5,
    },
  ];
  /** 净化斩击等驱散技能视为「增益」的 buff id 列表（驱散时只移除此类）。顺序：通用增益 → 角色专属。 */
  var POSITIVE_BUFF_IDS = [
    // 通用增益
    '护盾',
    '力量强化',
    '敏捷强化',
    '智力强化',
    '攻击强化',
    '防御强化',
    '再生',
    '坚韧',
    '锁定',
    '扑杀',
    '剑势',
    '踏浪',
    // 角色专属
    '攻势',
    '守势',
    '灵巧',
    '专注',
    '精准',
    '残暴',
    '心满意足',
    '激励',
    '格挡',
    '扰魔',
    '嘲讽',
    '孕育',
    '姬骑',
    '诗章',
    '星辰加速',
    '星命',
    '命仪精准',
    '愉悦',
    '力量增幅',
    '敏捷增幅',
    '智力增幅',
    '防御增幅',
  ];
  /** 救赎等清除负面状态时移除的 debuff id 列表。顺序：通用减益 → 色情类减益。 */
  var NEGATIVE_DEBUFF_IDS = [
    // 通用减益
    '虚弱',
    '脆弱',
    '破甲',
    '碎魔',
    '流血',
    '燃烧',
    '重伤',
    '中毒',
    '眩晕',
    '魅惑',
    '沉默',
    '缴械',
    '混乱',
    '恍惚',
    '迟钝',
    '迟缓',
    '乏力',
    '力量削弱',
    '敏捷削弱',
    '智力削弱',
    '攻击削弱',
    '防御削弱',
    // 色情类减益
    '发情',
    '羞耻',
    '虚实颠倒',
  ];
  /**
   * 月见遥「镜花水月」：以下减益视为「控制类」——目标任一层数大于 0 即触发控制增伤与 Lv5-A「心碎镜像」回复等。
   * 与【眩晕】【魅惑】【沉默】【缴械】【混乱】一致。
   */
  var 镜花水月_CONTROL_DEBUFF_IDS = ['眩晕', '魅惑', '沉默', '缴械', '混乱'];
  /** 取 buff 的层数上限，无则返回 null（表示不封顶） */
  function getBuffMaxLayers(buffId) {
    var def = BUFF_DEFINITIONS.filter(function (x) {
      return x.id === buffId || x.name === buffId;
    })[0];
    return def && def.maxLayers != null && def.maxLayers > 0 ? def.maxLayers : null;
  }
  /** 对单位身上所有 buff 按 BUFF_DEFINITIONS 的 maxLayers 做层数封顶（用于加载旧数据或施加后统一校正） */
  function capUnitBuffs(unit) {
    if (!unit || !unit.buffs || !unit.buffs.length) return;
    for (var i = 0; i < unit.buffs.length; i++) {
      var b = unit.buffs[i];
      var id = (b.id || b.name || '').trim();
      var maxL = getBuffMaxLayers(id);
      if (maxL != null) b.layers = Math.min(Math.max(0, parseInt(b.layers, 10) || 0), maxL);
    }
  }

  /** buff 外观主题：id → { fill, border, color }，用于角色卡上的 buff 标签。顺序与 BUFF_DEFINITIONS 一致：通用增益 → debuff → 色情减益 → 角色专属。 */
  var BUFF_THEME = {
    // --- ① 通用增益 ---
    护盾: { fill: 'rgba(25,118,210,0.4)', border: '#1976d2', color: '#1976d2' },
    力量强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    敏捷强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    智力强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    攻击强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    防御强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    再生: { fill: 'rgba(46,125,50,0.5)', border: '#2e7d32', color: '#2e7d32' },
    坚韧: { fill: 'rgba(139,90,43,0.45)', border: '#5d4037', color: '#5d4037' },
    锁定: { fill: 'rgba(33,150,243,0.45)', border: '#1976d2', color: '#1976d2' },
    扑杀: { fill: 'rgba(244,67,54,0.45)', border: '#e65100', color: '#e65100' },
    剑势: { fill: 'rgba(32,153,145,0.35)', border: '#209991', color: '#209991' },
    踏浪: { fill: 'rgba(0,172,193,0.35)', border: '#0097a7', color: '#00838f' },
    // --- ② 通用减益 ---
    力量削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    敏捷削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    智力削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    攻击削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    防御削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    虚弱: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    脆弱: { fill: 'rgba(179,36,36,0.4)', border: '#b32424', color: '#b32424' },
    破甲: { fill: 'rgba(139,90,43,0.5)', border: '#5d4037', color: '#5d4037' },
    碎魔: { fill: 'rgba(21,101,192,0.45)', border: '#1565c0', color: '#1565c0' },
    燃烧: { fill: 'rgba(230,81,0,0.45)', border: '#e65100', color: '#e65100' },
    流血: { fill: 'rgba(179,36,36,0.45)', border: '#b32424', color: '#b32424' },
    重伤: { fill: 'rgba(179,36,36,0.45)', border: '#b32424', color: '#b32424' },
    中毒: { fill: 'rgba(123,31,162,0.45)', border: '#7b1fa2', color: '#7b1fa2' },
    眩晕: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    魅惑: { fill: 'rgba(156,39,176,0.45)', border: '#9c27b0', color: '#9c27b0' },
    沉默: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    缴械: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    混乱: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    麻痹: { fill: 'rgba(121,85,72,0.5)', border: '#5d4037', color: '#4e342e' },
    冻结: { fill: 'rgba(33,150,243,0.5)', border: '#1976d2', color: '#0d47a1' },
    暗蚀: { fill: 'rgba(63,81,181,0.5)', border: '#3949ab', color: '#1a237e' },
    迟缓: { fill: 'rgba(158,158,158,0.5)', border: '#616161', color: '#424242' },
    迟钝: { fill: 'rgba(96,125,139,0.5)', border: '#546e7a', color: '#37474f' },
    恍惚: { fill: 'rgba(158,158,158,0.5)', border: '#757575', color: '#424242' },
    乏力: { fill: 'rgba(121,85,72,0.5)', border: '#6d4c41', color: '#4e342e' },
    // --- ③ 色情类减益 ---
    发情: { fill: 'rgba(233,30,99,0.4)', border: '#e91e63', color: '#e91e63' },
    羞耻: { fill: 'rgba(233,30,99,0.4)', border: '#e91e63', color: '#e91e63' },
    轻微破损: { fill: 'rgba(97,97,97,0.4)', border: '#616161', color: '#424242' },
    中度破损: { fill: 'rgba(97,97,97,0.45)', border: '#616161', color: '#424242' },
    严重破损: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    // --- ④ 角色专属（配色与 BUFF_DEFINITIONS ④ 一致）---
    攻势: { fill: 'rgba(0,0,0,0.5)', border: '#1a1a1a', color: '#1a1a1a' },
    守势: { fill: 'rgba(250,250,250,0.7)', border: '#e0e0e0', color: '#333333' },
    灵巧: { fill: 'rgba(76,175,80,0.5)', border: '#43a047', color: '#2e7d32' },
    专注: { fill: 'rgba(255,193,7,0.5)', border: '#ffc107', color: '#f57f17' },
    精准: { fill: 'rgba(233,30,99,0.45)', border: '#e91e63', color: '#ad1457' },
    残暴: { fill: 'rgba(183,28,28,0.45)', border: '#b71c1c', color: '#b71c1c' },
    心满意足: { fill: 'rgba(255,193,7,0.45)', border: '#ffa000', color: '#f57c00' },
    激励: { fill: 'rgba(255,152,0,0.5)', border: '#ff9800', color: '#e65100' },
    格挡: { fill: 'rgba(96,125,139,0.5)', border: '#607d8b', color: '#455a64' },
    扰魔: { fill: 'rgba(103,58,183,0.5)', border: '#673ab7', color: '#4527a0' },
    嘲讽: { fill: 'rgba(244,67,54,0.45)', border: '#f44336', color: '#f44336' },
    姬骑: { fill: 'rgba(106,27,154,0.4)', border: '#6a1b9a', color: '#4a148c' },
    孕育: { fill: 'rgba(233,30,99,0.35)', border: '#c2185b', color: '#880e4f' },
    诗章: { fill: 'rgba(63,81,181,0.38)', border: '#5c6bc0', color: '#3949ab' },
    星辰加速: { fill: 'rgba(0,188,212,0.4)', border: '#00acc1', color: '#00838f' },
    星命: { fill: 'rgba(121,85,72,0.45)', border: '#8d6e63', color: '#5d4037' },
    命仪精准: { fill: 'rgba(255,193,7,0.45)', border: '#ffa000', color: '#f57f17' },
    愉悦: { fill: 'rgba(156,39,176,0.4)', border: '#ab47bc', color: '#6a1b9a' },
    虚实颠倒: { fill: 'rgba(103,58,183,0.45)', border: '#7e57c2', color: '#4a148c' },
    力量增幅: { fill: 'rgba(27,94,32,0.5)', border: '#2e7d32', color: '#1b5e20' },
    敏捷增幅: { fill: 'rgba(46,125,50,0.5)', border: '#43a047', color: '#2e7d32' },
    智力增幅: { fill: 'rgba(56,142,60,0.5)', border: '#66bb6a', color: '#388e3c' },
    防御增幅: { fill: 'rgba(100,141,82,0.5)', border: '#7cb342', color: '#558b2f' },
  };
  function getBuffTheme(buffId) {
    return BUFF_THEME[buffId] || { fill: 'rgba(97,97,97,0.4)', border: '#757575', color: '#616161' };
  }
  /** 根据 buff 生成说明，用于角色卡/敌人槽位上的 buff pill 悬停或点击显示。统一读取 BUFF_DEFINITIONS 的 desc。 */
  function getBuffEffectTooltip(buffId, layers) {
    var id = (buffId || '').trim();
    var def = BUFF_DEFINITIONS.filter(function (x) {
      return x.id === id || x.name === id;
    })[0];
    return def && def.desc ? def.desc : id;
  }
  /** 渲染角色/敌人身上的 buff 列表 HTML。buffs 为 { id, name, layers }[]，无则 []。护盾作为 buff 存在但不显示在栏位中。 */
  function renderBuffsHtml(buffs) {
    if (!buffs || !buffs.length) return '';
    var html = '';
    for (var i = 0; i < buffs.length; i++) {
      var b = buffs[i];
      var id = (b.id || b.name || '').trim();
      if (id === '护盾') continue;
      var name = (b.name || b.id || 'buff').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var layers = b.layers != null ? Math.max(0, parseInt(b.layers, 10) || 0) : 1;
      var theme = getBuffTheme(id);
      var textColor = theme.color || theme.border;
      var effectText = getBuffEffectTooltip(id, layers);
      html +=
        '<span class="slot-buff-pill" data-buff-id="' +
        id.replace(/"/g, '&quot;') +
        '" data-buff-layers="' +
        layers +
        '" data-buff-tooltip="' +
        effectText.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '" style="background:' +
        theme.fill +
        ';border-color:' +
        theme.border +
        ';color:' +
        textColor +
        '"><span class="slot-buff-layers">' +
        layers +
        '</span><span class="slot-buff-name">' +
        name +
        '</span></span>';
    }
    return html;
  }

  /** 技能目标选择状态：高亮可攻击的敌方槽位，点击后回调并退出 */
  var skillTargetState = { active: false, callback: null, listener: null };

  function injectTargetableStyle() {
    if (document.getElementById('battle-skill-targetable-style')) return;
    var style = document.createElement('style');
    style.id = 'battle-skill-targetable-style';
    style.textContent =
      '.slot.skill-targetable{cursor:pointer;box-shadow:0 0 0 3px #c9a227;border-color:#c9a227;background:#e8dfd0;transition:box-shadow .2s,border-color .2s,background .2s}.slot.skill-targetable:hover{box-shadow:0 0 0 5px #c9a227,0 0 16px rgba(201,162,39,.5);background:#f0e8dc}';
    (document.head || document.documentElement).appendChild(style);
  }

  function injectEnemyIntentStyle() {
    if (document.getElementById('battle-enemy-intent-style')) return;
    var st = document.createElement('style');
    st.id = 'battle-enemy-intent-style';
    st.textContent =
      '.slot-enemy-intent-ribbon{margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;align-items:center;min-height:22px}' +
      '.enemy-intent-chip{display:inline-flex;align-items:center;gap:4px;border-radius:8px;padding:2px 6px;font-size:11px;font-weight:900;line-height:1.15;border:1px solid rgba(0,0,0,.12);box-shadow:0 1px 2px rgba(0,0,0,.06)}' +
      '.enemy-intent-chip .enemy-intent-nums{letter-spacing:.04em;font-variant-numeric:tabular-nums}' +
      '.enemy-intent-chip .enemy-intent-icon{display:inline-flex;width:14px;height:14px;flex-shrink:0;align-items:center;justify-content:center}' +
      '.enemy-intent-chip .enemy-intent-icon svg{width:12px;height:12px;display:block}' +
      '.enemy-intent-chip--red{background:rgba(220,80,80,.22);border-color:rgba(160,40,40,.35);color:#6b1c1c}' +
      '.enemy-intent-chip--blue{background:rgba(70,120,220,.20);border-color:rgba(40,80,180,.35);color:#1a2f6e}' +
      '.enemy-intent-chip--green{background:rgba(60,170,100,.22);border-color:rgba(30,120,60,.35);color:#143d22}' +
      '.enemy-intent-chip--pink{background:rgba(255,120,170,.24);border-color:rgba(200,70,130,.38);color:#8b1c4a}';
    (document.head || document.documentElement).appendChild(st);
  }

  /**
   * 进入技能目标选择模式：根据敌方槽位状态高亮可被选为目标的敌方槽位，点击某一高亮槽位后调用 onTargetSelected(槽位号 1～6) 并退出模式
   * @param {Array<object|null>} enemySlots 敌方 6 个槽位单位列表（同 getTargetableEnemySlotIndices 参数）
   * @param {function(number): void} onTargetSelected 用户选中目标时调用，参数为敌方槽位编号 1～6
   */
  function enterSkillTargetMode(enemySlots, onTargetSelected) {
    if (!enemySlots || !Array.isArray(enemySlots) || typeof onTargetSelected !== 'function') return;
    exitSkillTargetMode();
    injectTargetableStyle();
    var targetable = getTargetableEnemySlotIndices(enemySlots);
    for (var i = 0; i < targetable.length; i++) {
      var slotIndex = targetable[i];
      if (enemySlots[slotIndex - 1] != null) {
        var el = document.querySelector('.slot[data-slot="enemy-' + slotIndex + '"]');
        if (el) el.classList.add('skill-targetable');
      }
    }
    skillTargetState.active = true;
    skillTargetState.callback = onTargetSelected;
    var listener = function (e) {
      if (!skillTargetState.active) return;
      var slot = e.target.closest && e.target.closest('.slot.skill-targetable[data-slot^="enemy-"]');
      if (slot) {
        var slotNum = parseInt(slot.getAttribute('data-slot').replace('enemy-', ''), 10);
        if (skillTargetState.callback) skillTargetState.callback(slotNum);
        exitSkillTargetMode();
      } else {
        exitSkillTargetMode();
      }
    };
    skillTargetState.listener = listener;
    document.addEventListener('click', listener, true);
  }

  /**
   * 进入己方空位选择模式（用于召唤白牙等）：高亮己方空槽位，点击某一高亮空位后调用 onSlotSelected(槽位号 1～6) 并退出模式
   * @param {Array<object|null>} party 己方 6 个槽位单位列表
   * @param {function(number): void} onSlotSelected 用户选中空位时调用，参数为槽位编号 1～6
   */
  function enterAllyEmptySlotTargetMode(party, onSlotSelected, opts) {
    if (!party || !Array.isArray(party) || typeof onSlotSelected !== 'function') return;
    exitSkillTargetMode();
    injectTargetableStyle();
    var exclude = opts && opts.excludeSlotNums ? opts.excludeSlotNums : [];
    for (var i = 1; i <= SLOT_COUNT; i++) {
      if (party[i - 1] == null && exclude.indexOf(i) === -1) {
        var el = document.querySelector('.slot[data-slot="ally-' + i + '"]');
        if (el) el.classList.add('skill-targetable');
      }
    }
    skillTargetState.active = true;
    skillTargetState.callback = onSlotSelected;
    var listener = function (e) {
      if (!skillTargetState.active) return;
      var slot = e.target.closest && e.target.closest('.slot.skill-targetable[data-slot^="ally-"]');
      if (slot) {
        var slotNum = parseInt(slot.getAttribute('data-slot').replace('ally-', ''), 10);
        if (skillTargetState.callback) skillTargetState.callback(slotNum);
        exitSkillTargetMode();
      } else {
        exitSkillTargetMode();
      }
    };
    skillTargetState.listener = listener;
    document.addEventListener('click', listener, true);
  }

  /**
   * 进入己方单位选择模式（用于治疗等）：高亮己方有人的槽位，点击后调用 onAllySlotSelected(槽位号 1～6) 并退出模式
   */
  function enterAllyFilledSlotTargetMode(party, onAllySlotSelected) {
    if (!party || !Array.isArray(party) || typeof onAllySlotSelected !== 'function') return;
    exitSkillTargetMode();
    injectTargetableStyle();
    for (var i = 1; i <= SLOT_COUNT; i++) {
      if (party[i - 1] != null) {
        var el = document.querySelector('.slot[data-slot="ally-' + i + '"]');
        if (el) el.classList.add('skill-targetable');
      }
    }
    skillTargetState.active = true;
    skillTargetState.callback = onAllySlotSelected;
    var listener = function (e) {
      if (!skillTargetState.active) return;
      var slot = e.target.closest && e.target.closest('.slot.skill-targetable[data-slot^="ally-"]');
      if (slot) {
        var slotNum = parseInt(slot.getAttribute('data-slot').replace('ally-', ''), 10);
        if (skillTargetState.callback) skillTargetState.callback(slotNum);
        exitSkillTargetMode();
      } else {
        exitSkillTargetMode();
      }
    };
    skillTargetState.listener = listener;
    document.addEventListener('click', listener, true);
  }

  /**
   * 退出技能目标选择模式：移除所有敌方/己方槽位的高亮与点击监听
   */
  function exitSkillTargetMode() {
    var list = document.querySelectorAll('.slot[data-slot^="enemy-"], .slot[data-slot^="ally-"]');
    for (var j = 0; j < list.length; j++) list[j].classList.remove('skill-targetable');
    if (skillTargetState.listener) {
      document.removeEventListener('click', skillTargetState.listener, true);
      skillTargetState.listener = null;
    }
    skillTargetState.active = false;
    skillTargetState.callback = null;
  }

  /**
   * 进入「选敌方横排」模式：仅高亮三排的最左侧单位（1、3、5 号位），且仅当该最左槽位有存活敌人时才可选；选中后回调 onRowLeftSelected(1|3|5)
   */
  function enterSkillTargetModeEnemyRowLeft(enemySlots, onRowLeftSelected) {
    if (!enemySlots || !Array.isArray(enemySlots) || typeof onRowLeftSelected !== 'function') return;
    exitSkillTargetMode();
    injectTargetableStyle();
    var rowLeftSlots = [1, 3, 5];
    for (var i = 0; i < rowLeftSlots.length; i++) {
      var left = rowLeftSlots[i];
      var unit = enemySlots[left - 1];
      if (unit == null) continue;
      var hp = unit.hp != null ? parseInt(unit.hp, 10) : 1;
      if (hp <= 0) continue;
      var el = document.querySelector('.slot[data-slot="enemy-' + left + '"]');
      if (el) el.classList.add('skill-targetable');
    }
    skillTargetState.active = true;
    skillTargetState.callback = onRowLeftSelected;
    var listener = function (e) {
      if (!skillTargetState.active) return;
      var slot = e.target.closest && e.target.closest('.slot.skill-targetable[data-slot^="enemy-"]');
      if (slot) {
        var slotNum = parseInt(slot.getAttribute('data-slot').replace('enemy-', ''), 10);
        if (skillTargetState.callback) skillTargetState.callback(slotNum);
        exitSkillTargetMode();
      } else {
        exitSkillTargetMode();
      }
    };
    skillTargetState.listener = listener;
    document.addEventListener('click', listener, true);
  }

  // ---------- 回合阶段（大回合内四个子回合）----------
  var BATTLE_PHASE = {
    PLAYER_ACTION: 'player_action', // 玩家行动回合
    PLAYER_RESOLUTION: 'player_resolution', // 玩家结算回合
    ENEMY_ACTION: 'enemy_action', // 敌方行动回合
    ENEMY_RESOLUTION: 'enemy_resolution', // 敌方结算回合
  };
  var phaseOrder = [
    BATTLE_PHASE.PLAYER_ACTION,
    BATTLE_PHASE.PLAYER_RESOLUTION,
    BATTLE_PHASE.ENEMY_ACTION,
    BATTLE_PHASE.ENEMY_RESOLUTION,
  ];
  var battleState = {
    bigRound: 1,
    phase: BATTLE_PHASE.PLAYER_ACTION,
    erika奉献TriggeredThisRound: false,
    currentActingAllySlot: null,
    /** 凌遥仙：星辰定锚 / 星命逆转 / 命仪精准 每场各仅能使用一次，用后记入 id */
    lingyaoOnceSpecialUsed: {},
    /** 月见遥 Lv5-A「迷雾幻境·虚实倒错」：开启时敌方每次攻击 Miss 对自身造成 Atk×0.3 魔法伤害 */
    迷雾幻境虚实倒错: false,
    /** 月见遥特殊「心灵震爆」：本场战斗已触发次数（上限 2） */
    月见遥心灵震爆次数: 0,
    /** 月见遥特殊「完美谎言」：下一次敌方随机单体攻击若选中月见遥，改为攻击该友方槽位（1～6），用后即清 */
    月见遥完美谎言替身槽: null,
    /** 是否在敌方卡上显示「本回合将执行的意图」预览（玩家回合为 true，敌方行动结束后为 false） */
    showEnemyIntentUI: false,
    /** 敌方 1～6 号位本回合锁定行动（与 pickEnemyActionType 返回值同格式）；不写入存档 */
    plannedEnemyActions: [null, null, null, null, null, null],
  };

  function getBigRound() {
    return battleState.bigRound;
  }
  function setBigRound(n) {
    battleState.bigRound = Math.max(1, parseInt(n, 10) || 1);
  }
  function getBattlePhase() {
    return battleState.phase;
  }
  function setBattlePhase(p) {
    battleState.phase = p || BATTLE_PHASE.PLAYER_ACTION;
  }
  function advanceBattlePhase() {
    var idx = phaseOrder.indexOf(battleState.phase);
    if (idx < 0) idx = 0;
    idx++;
    if (idx >= phaseOrder.length) {
      battleState.bigRound++;
      idx = 0;
    }
    battleState.phase = phaseOrder[idx];
    if (battleState.phase === BATTLE_PHASE.PLAYER_ACTION) battleState.erika奉献TriggeredThisRound = false;
    return battleState.phase;
  }

  // ---------- 命中 / 暴击 / 伤害结算 ----------
  var BASE_PLAYER_HIT = 50;
  var LUK_HIT_PER = 5;
  var BASE_MONSTER_DODGE = 0;
  var BASE_MONSTER_HIT = 90;
  /** 闪避=敏捷×1；闪避上限 80%（等价：怪物命中率下限 20%） */
  var AGI_DODGE_PER = 1;
  var MAX_DODGE_RATE = 80;
  var BASE_PLAYER_CRIT = 20;
  var PLAYER_CRIT_PER_AGI = 1;
  var BASE_MONSTER_CRIT = 25;
  var CRIT_MULT = 2;
  var MAX_SEMEN_ML =
    typeof window !== 'undefined' && window.HENTAI_DUNGEON_MAX_SEMEN_ML != null
      ? Number(window.HENTAI_DUNGEON_MAX_SEMEN_ML) || 100
      : 100;

  function roll1To100() {
    return Math.floor(Math.random() * 100) + 1;
  }
  function num(val) {
    return Math.max(0, parseInt(val, 10) || 0);
  }

  function getPlayerHitRate(attacker, defender) {
    if (attacker.一闪必中 || attacker.无拍子必中) return 100;
    var luk = num(attacker.luk);
    // 命中判定改为：攻击方命中率 × (1 - 敌方闪避率)
    // 因此此处只计算“攻击方命中率”，不再在这里减去对方闪避
    var rate = Math.min(100, Math.max(0, BASE_PLAYER_HIT + luk * LUK_HIT_PER));
    var 专注L = 0;
    if (attacker && attacker.buffs) {
      attacker.buffs.forEach(function (b) {
        if ((b.id || b.name) === '专注') 专注L = Math.min(5, parseInt(b.layers, 10) || 0);
      });
      rate = Math.min(100, Math.max(0, rate + 专注L * 5));
    }
    var 迟缓L = 0;
    if (defender && defender.buffs) {
      defender.buffs.forEach(function (b) {
        if ((b.id || b.name) === '迟缓') 迟缓L = Math.min(5, parseInt(b.layers, 10) || 0);
      });
      rate = Math.min(100, Math.max(0, rate + 迟缓L * 5));
    }
    var 恍惚L = 0;
    if (defender && defender.buffs) {
      defender.buffs.forEach(function (b) {
        if ((b.id || b.name) === '恍惚') 恍惚L = Math.min(5, parseInt(b.layers, 10) || 0);
      });
      rate = Math.max(0, rate - 恍惚L * 5);
    }
    return rate;
  }
  function getMonsterHitRate(attacker, defender) {
    // 需求：若怪物在战斗中没有命中率字段，则按 50% 默认处理
    var baseHit =
      attacker && attacker.baseHitRate != null
        ? num(attacker.baseHitRate)
        : attacker && attacker.hitRate != null
          ? num(attacker.hitRate)
          : 50;
    var hitBuff = attacker && (attacker.hitRateBuff != null ? num(attacker.hitRateBuff) : 0);
    // 命中判定改为：攻击方命中率 × (1 - 敌方闪避率)
    // 因此此处只计算“攻击方命中率”，不再在这里减去对方闪避/心眼/灵巧等闪避因素
    var rate = Math.min(100, Math.max(0, baseHit + hitBuff));
    return rate;
  }

  /**
   * 防守方闪避率（0~MAX_DODGE_RATE）。
   * - 怪物：优先读 dodgeRate（捕获时生成 0~50%）；缺省为 0
   * - 角色：Agi×1，叠 灵巧(+5%/层)、迟缓(-5%/层)，并做上限
   */
  function getUnitDodgeRate(unit) {
    if (!unit) return 0;
    if (unit.dodgeRate != null) return Math.max(0, Math.min(MAX_DODGE_RATE, num(unit.dodgeRate)));
    var agi = num(unit.agi);
    var base = agi * AGI_DODGE_PER;
    var 灵巧L = 0;
    var 迟缓L = 0;
    if (unit.buffs && unit.buffs.length) {
      unit.buffs.forEach(function (b) {
        var id = (b.id || b.name || '').trim();
        var layers = Math.max(0, parseInt(b.layers, 10) || 0);
        if (id === '灵巧') 灵巧L = Math.min(5, layers);
        if (id === '迟缓') 迟缓L = Math.min(5, layers);
      });
    }
    var rate = base + 灵巧L * 5 - 迟缓L * 5;
    return Math.max(0, Math.min(MAX_DODGE_RATE, rate));
  }
  function getPlayerCritRate(attacker) {
    // 需求：暴击率范围 0~100%，角色基础 0%，增加=精准(+5%/层)，减少=迟钝(-5%/层)
    var rate = 0;
    var 精准L = 0;
    var 迟钝L = 0;
    if (attacker && attacker.buffs) {
      attacker.buffs.forEach(function (b) {
        if ((b.id || b.name) === '精准') 精准L = Math.min(5, parseInt(b.layers, 10) || 0);
        if ((b.id || b.name) === '迟钝') 迟钝L = Math.min(5, parseInt(b.layers, 10) || 0);
      });
    }
    rate = rate + 精准L * 5 - 迟钝L * 5;
    rate = Math.max(0, Math.min(100, rate));
    return rate;
  }
  function getMonsterCritRate(attacker) {
    // 需求：怪物基础暴击率 0~100%（生成 baseCritRate）；缺省为 0
    var base =
      attacker && attacker.baseCritRate != null
        ? num(attacker.baseCritRate)
        : attacker && attacker.critRate != null
          ? num(attacker.critRate)
          : 0;
    var buff = attacker && (attacker.critRateBuff != null ? num(attacker.critRateBuff) : 0);
    var rate = Math.min(100, Math.max(0, base + buff));
    var 精准L = 0;
    var 迟钝L = 0;
    if (attacker && attacker.buffs) {
      attacker.buffs.forEach(function (b) {
        if ((b.id || b.name) === '迟钝') 迟钝L = Math.min(5, parseInt(b.layers, 10) || 0);
        if ((b.id || b.name) === '精准') 精准L = Math.min(5, parseInt(b.layers, 10) || 0);
      });
    }
    rate = rate + 精准L * 5 - 迟钝L * 5;
    rate = Math.max(0, Math.min(100, rate));
    return rate;
  }

  /**
   * 初始化战斗界面：渲染己方/敌方槽位、技能弹窗、换位、攻击结算与受击特效等。由 app 传入 options 调用。
   * @param {object} options 依赖：getParty, getEnemyParty, saveBattleData, getDisplayStat, getHpFromSta, getApByLevel, getMaxExpForLevel, getSkillEffectForLevel, resolveSkillEffect, getBaseDamageFromResolvedEffect, getBaseDamageForSkill, getSpecialSkillsForChar, wrapBuffRefs, SWAP_SVG, AP_FLAME_SVG, SKILL_ATTACK_SVG, SKILL_DEFENSE_SVG
   */
  function initBattleUI(options) {
    if (!options || typeof options.getParty !== 'function' || typeof options.saveBattleData !== 'function') return;
    battleState.lingyaoOnceSpecialUsed = {};
    battleState.迷雾幻境虚实倒错 = false;
    battleState.月见遥心灵震爆次数 = 0;
    battleState.月见遥完美谎言替身槽 = null;
    var getBattleFloorTitle =
      typeof options.getBattleFloorTitle === 'function'
        ? options.getBattleFloorTitle
        : function () {
            return '';
          };
    var getParty = options.getParty;
    var getEnemyParty = options.getEnemyParty;
    var saveBattleData = options.saveBattleData;
    var baseGetDisplayStat = options.getDisplayStat;
    var getDisplayStat = function (unit, key) {
      var v = baseGetDisplayStat ? baseGetDisplayStat(unit, key) : 0;
      // 清漓·福泽：清漓存活时，全体友方幸运 +3
      if (key === 'luk') {
        try {
          var party0 = getParty ? getParty() : null;
          if (party0 && Array.isArray(party0)) {
            for (var qi = 0; qi < party0.length; qi++) {
              var q = party0[qi];
              if (q && q.name === '清漓' && (parseInt(q.hp, 10) || 0) > 0) {
                v += 3;
                break;
              }
            }
          }
        } catch (eQ) {}
      }
      if (
        unit &&
        unit.buffs &&
        unit.buffs.length &&
        (key === 'str' || key === 'agi' || key === 'int' || key === 'def')
      ) {
        for (var i = 0; i < unit.buffs.length; i++) {
          var b = unit.buffs[i];
          var id = (b.id || b.name || '').trim();
          var layers = Math.max(0, parseInt(b.layers, 10) || 0);
          if (id === '攻势' && key === 'str') v += layers * 2;
          if (id === '守势' && key === 'agi') v += layers * 2;
          if (id === '心满意足' && (key === 'str' || key === 'agi')) v += layers * 1;
          if (id === '力量强化' && key === 'str') v += layers * 3;
          if (id === '攻击强化' && key === 'str') v += layers * 3;
          if (id === '敏捷强化' && key === 'agi') v += layers * 3;
          if (id === '智力强化' && key === 'int') v += layers * 3;
          if (id === '防御强化' && key === 'def') v += layers * 3;
          if (id === '力量增幅' && key === 'str') v += layers * 3;
          if (id === '敏捷增幅' && key === 'agi') v += layers * 3;
          if (id === '智力增幅' && key === 'int') v += layers * 3;
          if (id === '防御增幅' && key === 'def') v += layers * 3;
          if (id === '愉悦' && key === 'int') v += layers * 2;
        }
      }
      if (unit && (unit.name || '') === '丝伊德·白') {
        var yuLayersS = 0;
        var jqLayersS = 0;
        if (unit.buffs && unit.buffs.length) {
          for (var ys = 0; ys < unit.buffs.length; ys++) {
            var bbs = unit.buffs[ys];
            var ids = (bbs.id || bbs.name || '').trim();
            if (ids === '孕育') yuLayersS = Math.max(0, parseInt(bbs.layers, 10) || 0);
            if (ids === '姬骑') jqLayersS = Math.max(0, parseInt(bbs.layers, 10) || 0);
          }
        }
        if (
          unit.specialSkillsUnlocked &&
          unit.specialSkillsUnlocked.indexOf('枝叶硕茂') !== -1 &&
          yuLayersS > 0 &&
          (key === 'str' || key === 'int')
        ) {
          var monteOk = false;
          try {
            var pMonte = getParty ? getParty() : null;
            if (pMonte) {
              for (var ms = 0; ms < pMonte.length; ms++) {
                var uMonte = pMonte[ms];
                if (!uMonte || (uMonte.name || '') !== '蒙特卡洛') continue;
                var hpM = uMonte.hp != null ? parseInt(uMonte.hp, 10) : 1;
                if (hpM > 0) {
                  monteOk = true;
                  break;
                }
              }
            }
          } catch (eMonte) {}
          v += yuLayersS * (monteOk ? 2 : 1);
        }
        if (jqLayersS > 0 && (key === 'str' || key === 'agi' || key === 'int' || key === 'sta' || key === 'def'))
          v = Math.floor(v * 1.5);
      }
      if ((unit.name || '') === '凌遥仙') {
        var szLayersB = 0;
        if (unit.buffs && unit.buffs.length) {
          for (var szB = 0; szB < unit.buffs.length; szB++) {
            var bbSz = unit.buffs[szB];
            if ((bbSz.id || bbSz.name) === '诗章') {
              szLayersB = Math.max(0, parseInt(bbSz.layers, 10) || 0);
              break;
            }
          }
        }
        if (key === 'int') v += szLayersB;
        if (key === 'sta' && szLayersB >= 10) v += 5;
      }
      return v;
    };
    /** 岚的远程多段技能结束时调用：消耗 1 层【锁定】并增加 1 层【心满意足】（若当前有锁定） */
    function tryConsume岚锁定And心满意足(attacker) {
      if (!attacker || attacker.name !== '岚' || !attacker.buffs) return;
      for (var i = 0; i < attacker.buffs.length; i++) {
        if ((attacker.buffs[i].id || attacker.buffs[i].name) === '锁定') {
          var layers = Math.max(0, (parseInt(attacker.buffs[i].layers, 10) || 0) - 1);
          attacker.buffs[i].layers = layers;
          if (layers <= 0)
            attacker.buffs = attacker.buffs.filter(function (b) {
              return (b.id || b.name) !== '锁定';
            });
          addBuffLayers(attacker, '心满意足', '心满意足', 1);
          break;
        }
      }
    }
    /** 月见遥被动「观测者的愉悦」：全场任意单位每次攻击判定未命中，或攻击方带【混乱】且本次攻击命中时，月见遥获得1层【愉悦】（上限10）。 */
    function try月见遥观测者的愉悦OnAttackResult(attacker, hit) {
      var party = getParty ? getParty() : null;
      if (!party || !Array.isArray(party)) return;
      var yue = null;
      for (var yi = 0; yi < party.length; yi++) {
        var u = party[yi];
        if (u && (u.name || '') === '月见遥') {
          yue = u;
          break;
        }
      }
      if (!yue) return;
      try {
        if (typeof isAllyDefeated === 'function' && isAllyDefeated(yue)) return;
      } catch (eY) {}
      var hpY = parseInt(yue.hp, 10) || 0;
      if (hpY <= 0) return;
      var gain = 0;
      if (!hit) gain += 1;
      else if (attacker && attacker.buffs && attacker.buffs.length) {
        for (var bi = 0; bi < attacker.buffs.length; bi++) {
          var bb = attacker.buffs[bi];
          if ((bb.id || bb.name) === '混乱' && (parseInt(bb.layers, 10) || 0) > 0) {
            gain += 1;
            break;
          }
        }
      }
      if (gain <= 0) return;
      var cur = typeof getUnitBuffLayers === 'function' ? getUnitBuffLayers(yue, '愉悦') : 0;
      if (cur >= 10) return;
      var add = Math.min(gain, 10 - cur);
      if (add <= 0) return;
      addBuffLayers(yue, '愉悦', '愉悦', add);
      capUnitBuffs(yue);
      try月见遥心灵震爆IfReady(yue);
      saveBattleData();
      try {
        if (typeof renderAllySlots === 'function') renderAllySlots();
      } catch (eR) {}
    }
    /** 月见遥特殊「心灵震爆」：【愉悦】满层时触发全体心灵伤害并清空【愉悦】，每场最多 2 次（需解锁）。 */
    function try月见遥心灵震爆IfReady(yue) {
      if (!yue || (yue.name || '') !== '月见遥') return;
      if (!yue.specialSkillsUnlocked || yue.specialSkillsUnlocked.indexOf('心灵震爆') === -1) return;
      var layers = typeof getUnitBuffLayers === 'function' ? getUnitBuffLayers(yue, '愉悦') : 0;
      if (layers < 10) return;
      battleState.月见遥心灵震爆次数 = battleState.月见遥心灵震爆次数 || 0;
      if (battleState.月见遥心灵震爆次数 >= 2) return;
      battleState.月见遥心灵震爆次数++;
      var intv = getDisplayStat(yue, 'int') || 0;
      var baseDmg = Math.max(0, Math.floor(intv * 1.5));
      var enemies = getEnemyParty ? getEnemyParty() : null;
      var party = getParty ? getParty() : null;
      if (!enemies || !party) return;
      var yi = 0;
      for (yi = 1; yi <= 6; yi++) {
        var def = enemies[yi - 1];
        if (!def || (parseInt(def.hp, 10) || 0) <= 0) continue;
        var res = resolveAttack(yue, def, baseDmg, true, { magicOnly: true });
        applyDamageToTarget(def, res.finalDamage);
        if (typeof appendCombatLog === 'function')
          appendCombatLog(
            (yue.name || '月见遥') +
              ' 「心灵震爆」对 ' +
              (def.name || '敌方') +
              ' 造成 ' +
              res.finalDamage +
              ' 心灵伤害',
          );
      }
      consumeBuffLayersFromUnit(yue, '愉悦', 99);
      yue.buffs = (yue.buffs || []).filter(function (bx) {
        return (bx.id || bx.name) !== '愉悦';
      });
      capUnitBuffs(yue);
      if (typeof appendCombatLog === 'function')
        appendCombatLog((yue.name || '月见遥') + ' 「心灵震爆」：清空【愉悦】（本场第 ' + battleState.月见遥心灵震爆次数 + ' 次）');
      try {
        saveBattleData(party, enemies);
      } catch (eS) {}
      try {
        if (typeof renderEnemySlots === 'function') renderEnemySlots(enemies);
      } catch (eR) {}
    }
    /** 月见遥「迷雾幻境·虚实倒错」：敌方攻击未命中时对攻击者自身造成 [Atk×0.3]（魔法伤害，走受击结算）。 */
    function try月见遥迷雾幻境虚实倒错OnEnemyMiss(monster) {
      if (!battleState.迷雾幻境虚实倒错) return;
      if (!monster) return;
      var hp = monster.hp != null ? parseInt(monster.hp, 10) : 0;
      if (hp <= 0) return;
      var atk = Math.max(0, parseInt(monster.atk, 10) || 0);
      var dmg = Math.max(1, Math.floor(atk * 0.3));
      applyDamageToTarget(monster, dmg);
      if (typeof appendCombatLog === 'function')
        appendCombatLog(
          (monster.name || '敌方') + ' 「虚实倒错」：未命中，自受 ' + dmg + ' 点魔法伤害',
        );
      try {
        saveBattleData(getParty(), getEnemyParty());
      } catch (eM) {}
      try {
        if (typeof renderEnemySlots === 'function') renderEnemySlots(getEnemyParty());
      } catch (eM2) {}
    }
    var 暗夜帷幕A_State = null;
    function resolveAttack(attacker, defender, baseDamage, isPlayerAttacker, opts) {
      var magicOnly = opts && opts.magicOnly === true;
      var rollHit = roll1To100();
      var attackerHitRate = isPlayerAttacker ? getPlayerHitRate(attacker, defender) : getMonsterHitRate(attacker, defender);
      var defenderDodgeRate = getUnitDodgeRate(defender);
      // 命中判定：攻击方命中率 × (1 - 敌方闪避率)
      var hitRate = Math.max(0, Math.min(100, attackerHitRate * (1 - defenderDodgeRate / 100)));
      var hit = opts && opts.forceHit === true ? true : rollHit <= hitRate;
      if (!hit) {
        try月见遥观测者的愉悦OnAttackResult(attacker, false);
        if (!isPlayerAttacker) try月见遥迷雾幻境虚实倒错OnEnemyMiss(attacker);
        return {
          hit: false,
          crit: false,
          rollHit: rollHit,
          rollCrit: 0,
          hitRate: hitRate,
          critRate: 0,
          attackerHitRate: attackerHitRate,
          defenderDodgeRate: defenderDodgeRate,
          finalDamage: 0,
          shadowDamage: 0,
          message: '未命中',
        };
      }
      var rollCrit = roll1To100();
      var critRate = isPlayerAttacker ? getPlayerCritRate(attacker) : getMonsterCritRate(attacker);
      var crit = opts && opts.forceCrit === true ? true : rollCrit <= critRate;
      var critMult = opts && opts.critMult != null && opts.critMult > 0 ? opts.critMult : CRIT_MULT;
      var 残暴L = 0;
      var 乏力L = 0;
      if (crit && attacker && attacker.buffs && attacker.buffs.length) {
        attacker.buffs.forEach(function (b) {
          if ((b.id || b.name) === '残暴') 残暴L = Math.min(5, parseInt(b.layers, 10) || 0);
          if ((b.id || b.name) === '乏力') 乏力L = Math.min(5, parseInt(b.layers, 10) || 0);
        });
        if (残暴L > 0) critMult = critMult * (1 + 残暴L * 0.1);
        if (乏力L > 0) critMult = Math.max(0.1, critMult * (1 - 乏力L * 0.1));
      }
      var rawDamage = crit ? baseDamage * critMult : baseDamage;
      var 虚弱L = 0;
      var 激励L = 0;
      if (attacker && attacker.buffs) {
        attacker.buffs.forEach(function (b) {
          if ((b.id || b.name) === '虚弱') 虚弱L = Math.min(5, parseInt(b.layers, 10) || 0);
          if ((b.id || b.name) === '激励') 激励L = Math.min(5, parseInt(b.layers, 10) || 0);
        });
      }
      // 增伤以 100% 为基础：100% + 激励 - 虚弱；下限为 50%
      var dmgUpMult = 1 + 激励L * 0.05 - 虚弱L * 0.05;
      if (dmgUpMult < 0.5) dmgUpMult = 0.5;
      rawDamage = rawDamage * dmgUpMult;
      var damageMult = 1;
      var 格挡L = 0;
      var 坚韧L = 0;
      var 扰魔L = 0;
      var 破甲L = 0;
      var 脆弱L = 0;
      var 碎魔L = 0;
      var baseDamageReduction = defender && defender.baseDamageReduction != null ? num(defender.baseDamageReduction) : 0;
      if (baseDamageReduction > 50) baseDamageReduction = 50;
      var 魔力渴求Bonus = false;
      if (defender && defender.buffs && defender.buffs.length) {
        for (var i = 0; i < defender.buffs.length; i++) {
          var b = defender.buffs[i];
          var bid = (b.id || b.name || '').trim();
          var layers = Math.max(0, parseInt(b.layers, 10) || 0);
          if (!magicOnly && bid === '破甲') {
            damageMult += layers * 0.05;
            破甲L = Math.min(5, layers);
          }
          if (bid === '脆弱') {
            脆弱L = Math.min(5, layers);
          }
          if (magicOnly && bid === '碎魔') {
            damageMult += layers * 0.05;
            碎魔L = Math.min(5, layers);
          }
          if (bid === '魅惑' || bid === '混乱' || bid === '眩晕') 魔力渴求Bonus = true;
          if (!magicOnly && bid === '格挡') 格挡L = Math.min(5, layers);
          if (bid === '坚韧') 坚韧L = Math.min(5, layers);
          if (bid === '扰魔') 扰魔L = Math.min(5, layers);
        }
      }
      if (isPlayerAttacker && attacker && attacker.name === '夜露' && 魔力渴求Bonus) damageMult += 0.2;
      var 岚锁定L = 0;
      var 岚扑杀L = 0;
      if (isPlayerAttacker && attacker && attacker.name === '岚' && attacker.buffs) {
        for (var li = 0; li < attacker.buffs.length; li++) {
          var bid = (attacker.buffs[li].id || attacker.buffs[li].name || '').trim();
          if (bid === '锁定') 岚锁定L = Math.max(0, parseInt(attacker.buffs[li].layers, 10) || 0);
          if (bid === '扑杀') 岚扑杀L = Math.max(0, parseInt(attacker.buffs[li].layers, 10) || 0);
        }
      }
      if (opts && opts.isRanged && 岚锁定L > 0) damageMult += 0.2;
      if (opts && opts.isMelee && 岚扑杀L > 0) damageMult += 0.2;
      var has猎手本能 =
        isPlayerAttacker &&
        attacker &&
        attacker.name === '岚' &&
        attacker.specialSkillsUnlocked &&
        attacker.specialSkillsUnlocked.indexOf('猎手本能') !== -1;
      if (has猎手本能 && defender) {
        var defHp = parseInt(defender.hp, 10) || 0;
        var defMaxHp = defender.maxHp != null ? parseInt(defender.maxHp, 10) : 0;
        if (defMaxHp > 0 && defHp / defMaxHp < 0.3) damageMult += 0.25;
      }
      if (opts && opts.isRanged && attacker && attacker.name === '岚' && attacker.弹跳踩踏) damageMult += 0.3;
      // 敌人减伤（0~50%）：基础(baseDamageReduction) + 坚韧 +（物理：格挡 / 魔法：扰魔） - 脆弱
      // 与面板「受到伤害减少」一致，并按公式：基础伤害×增伤×(1-敌人减伤)
      var enemyDamageReductionPct =
        baseDamageReduction +
        坚韧L * 5 +
        (magicOnly ? 扰魔L * 5 : 格挡L * 5) -
        脆弱L * 5;
      if (enemyDamageReductionPct < 0) enemyDamageReductionPct = 0;
      if (enemyDamageReductionPct > 50) enemyDamageReductionPct = 50;
      var finalDamage;
      if (magicOnly) {
        var magicPart = rawDamage * damageMult * (1 - enemyDamageReductionPct * 0.01);
        finalDamage = Math.max(1, Math.floor(magicPart));
        var shadowAdded = 0;
        if (isPlayerAttacker && attacker && attacker.name === '黯') {
          var anShadow = Math.max(0, Math.floor((getDisplayStat(attacker, 'int') || 0) * 0.4));
          if (defender && defender.buffs && defender.buffs.length && anShadow > 0) {
            var anShiL = 0;
            for (var ai = 0; ai < defender.buffs.length; ai++) {
              if ((defender.buffs[ai].id || defender.buffs[ai].name) === '暗蚀')
                anShiL = Math.max(0, parseInt(defender.buffs[ai].layers, 10) || 0);
            }
            if (anShiL > 0) anShadow = Math.max(0, Math.floor(anShadow * (1 + anShiL * 0.1)));
          }
          anShadow = anShadow * (1 - enemyDamageReductionPct * 0.01);
          shadowAdded = Math.max(0, Math.floor(anShadow));
          finalDamage += shadowAdded;
        }
        if (defender && defender.trait柔软躯体 === true) {
          var lilimRm = 1.2;
          finalDamage = Math.max(1, Math.floor(finalDamage * lilimRm));
          if (shadowAdded > 0) shadowAdded = Math.min(finalDamage, Math.max(0, Math.floor(shadowAdded * lilimRm)));
        }
        var increaseReasons = [];
        if (defender && defender.trait柔软躯体 === true) increaseReasons.push('柔软躯体+20%魔法承伤');
        if (crit) increaseReasons.push('暴击+' + Math.round((critMult - 1) * 100) + '%');
        if (乏力L > 0 && crit) increaseReasons.push('乏力-' + 乏力L * 10 + '%爆伤');
        if (残暴L > 0 && crit) increaseReasons.push('残暴+' + 残暴L * 10 + '%爆伤');
        if (虚弱L > 0) increaseReasons.push('虚弱-' + 虚弱L * 5 + '%');
        if (激励L > 0) increaseReasons.push('激励+' + 激励L * 5 + '%');
        if (碎魔L > 0) increaseReasons.push('碎魔+' + 碎魔L * 5 + '%');
        if (破甲L > 0) increaseReasons.push('破甲+' + 破甲L * 5 + '%');
        if (脆弱L > 0) increaseReasons.push('脆弱-' + 脆弱L * 5 + '%减伤');
        if (isPlayerAttacker && attacker && attacker.name === '夜露' && 魔力渴求Bonus)
          increaseReasons.push('魔力渴求+20%');
        if (opts && opts.isRanged && 岚锁定L > 0) increaseReasons.push('锁定+20%');
        if (opts && opts.isMelee && 岚扑杀L > 0) increaseReasons.push('扑杀+20%');
        if (has猎手本能 && defender) {
          var defHpM = parseInt(defender.hp, 10) || 0;
          var defMaxHpM = defender.maxHp != null ? parseInt(defender.maxHp, 10) : 0;
          if (defMaxHpM > 0 && defHpM / defMaxHpM < 0.3) increaseReasons.push('猎手本能+25%');
        }
        if (opts && opts.isRanged && attacker && attacker.name === '岚' && attacker.弹跳踩踏)
          increaseReasons.push('弹跳踩踏+30%');
        if (shadowAdded > 0) increaseReasons.push('被动暗影+' + shadowAdded);
        var damageIncreaseReasons = increaseReasons.length > 0 ? increaseReasons.join('；') + '；' : '无；';
        var message = crit ? '暴击！造成 ' + finalDamage + ' 点伤害' : '命中，造成 ' + finalDamage + ' 点伤害';
        if (isPlayerAttacker && attacker && attacker.name === '岚') {
          if (!(opts && opts.skipConsumeLockKill)) {
            if (opts && opts.isRanged && 岚锁定L > 0) {
              for (var ci = 0; ci < attacker.buffs.length; ci++) {
                if ((attacker.buffs[ci].id || attacker.buffs[ci].name) === '锁定') {
                  attacker.buffs[ci].layers = Math.max(0, (parseInt(attacker.buffs[ci].layers, 10) || 0) - 1);
                  if (attacker.buffs[ci].layers <= 0)
                    attacker.buffs = attacker.buffs.filter(function (b) {
                      return (b.id || b.name) !== '锁定';
                    });
                  break;
                }
              }
            }
            if (opts && opts.isMelee && 岚扑杀L > 0) {
              for (var ci = 0; ci < attacker.buffs.length; ci++) {
                if ((attacker.buffs[ci].id || attacker.buffs[ci].name) === '扑杀') {
                  attacker.buffs[ci].layers = Math.max(0, (parseInt(attacker.buffs[ci].layers, 10) || 0) - 1);
                  if (attacker.buffs[ci].layers <= 0)
                    attacker.buffs = attacker.buffs.filter(function (b) {
                      return (b.id || b.name) !== '扑杀';
                    });
                  break;
                }
              }
            }
            if ((opts && opts.isRanged && 岚锁定L > 0) || (opts && opts.isMelee && 岚扑杀L > 0))
              addBuffLayers(attacker, '心满意足', '心满意足', 1);
          }
          if (opts && opts.isRanged && attacker.弹跳踩踏) attacker.弹跳踩踏 = false;
        }
        try月见遥观测者的愉悦OnAttackResult(attacker, true);
        return {
          hit: true,
          crit: crit,
          rollHit: rollHit,
          rollCrit: rollCrit,
          hitRate: hitRate,
          critRate: critRate,
          attackerHitRate: attackerHitRate,
          defenderDodgeRate: defenderDodgeRate,
          finalDamage: finalDamage,
          shadowDamage: shadowAdded,
          damageIncreaseReasons: damageIncreaseReasons,
          message: message,
        };
      } else {
        var physicalPart = rawDamage * damageMult * (1 - enemyDamageReductionPct * 0.01);
        finalDamage = Math.max(1, Math.floor(physicalPart));
        var shadowAdded = 0;
        if (isPlayerAttacker && attacker && attacker.name === '黯') {
          var anShadow = Math.max(0, Math.floor((getDisplayStat(attacker, 'int') || 0) * 0.4));
          if (defender && defender.buffs && defender.buffs.length && anShadow > 0) {
            var anShiL = 0;
            for (var ai = 0; ai < defender.buffs.length; ai++) {
              if ((defender.buffs[ai].id || defender.buffs[ai].name) === '暗蚀')
                anShiL = Math.max(0, parseInt(defender.buffs[ai].layers, 10) || 0);
            }
            if (anShiL > 0) anShadow = Math.max(0, Math.floor(anShadow * (1 + anShiL * 0.1)));
          }
          anShadow = anShadow * (1 - enemyDamageReductionPct * 0.01);
          shadowAdded = Math.max(0, Math.floor(anShadow));
          finalDamage += shadowAdded;
        }
        if (defender && defender.trait柔软躯体 === true) {
          var lilimRp = 0.7;
          finalDamage = Math.max(1, Math.floor(finalDamage * lilimRp));
          if (shadowAdded > 0) shadowAdded = Math.min(finalDamage, Math.max(0, Math.floor(shadowAdded * lilimRp)));
        }
        var increaseReasons = [];
        if (defender && defender.trait柔软躯体 === true) increaseReasons.push('柔软躯体-30%物理承伤');
        if (crit) increaseReasons.push('暴击+' + Math.round((critMult - 1) * 100) + '%');
        if (乏力L > 0 && crit) increaseReasons.push('乏力-' + 乏力L * 10 + '%爆伤');
        if (残暴L > 0 && crit) increaseReasons.push('残暴+' + 残暴L * 10 + '%爆伤');
        if (虚弱L > 0) increaseReasons.push('虚弱-' + 虚弱L * 5 + '%');
        if (激励L > 0) increaseReasons.push('激励+' + 激励L * 5 + '%');
        if (破甲L > 0) increaseReasons.push('破甲+' + 破甲L * 5 + '%');
        if (脆弱L > 0) increaseReasons.push('脆弱-' + 脆弱L * 5 + '%减伤');
        if (isPlayerAttacker && attacker && attacker.name === '夜露' && 魔力渴求Bonus)
          increaseReasons.push('魔力渴求+20%');
        if (opts && opts.isRanged && 岚锁定L > 0) increaseReasons.push('锁定+20%');
        if (opts && opts.isMelee && 岚扑杀L > 0) increaseReasons.push('扑杀+20%');
        if (has猎手本能 && defender) {
          var defHpP = parseInt(defender.hp, 10) || 0;
          var defMaxHpP = defender.maxHp != null ? parseInt(defender.maxHp, 10) : 0;
          if (defMaxHpP > 0 && defHpP / defMaxHpP < 0.3) increaseReasons.push('猎手本能+25%');
        }
        if (opts && opts.isRanged && attacker && attacker.name === '岚' && attacker.弹跳踩踏)
          increaseReasons.push('弹跳踩踏+30%');
        if (shadowAdded > 0) increaseReasons.push('被动暗影+' + shadowAdded);
        var damageIncreaseReasons = increaseReasons.length > 0 ? increaseReasons.join('；') + '；' : '无；';
        var message = crit ? '暴击！造成 ' + finalDamage + ' 点伤害' : '命中，造成 ' + finalDamage + ' 点伤害';
        if (isPlayerAttacker && attacker && attacker.name === '岚') {
          if (!(opts && opts.skipConsumeLockKill)) {
            if (opts && opts.isRanged && 岚锁定L > 0) {
              for (var cj = 0; cj < attacker.buffs.length; cj++) {
                if ((attacker.buffs[cj].id || attacker.buffs[cj].name) === '锁定') {
                  attacker.buffs[cj].layers = Math.max(0, (parseInt(attacker.buffs[cj].layers, 10) || 0) - 1);
                  if (attacker.buffs[cj].layers <= 0)
                    attacker.buffs = attacker.buffs.filter(function (b) {
                      return (b.id || b.name) !== '锁定';
                    });
                  break;
                }
              }
            }
            if (opts && opts.isMelee && 岚扑杀L > 0) {
              for (var cj = 0; cj < attacker.buffs.length; cj++) {
                if ((attacker.buffs[cj].id || attacker.buffs[cj].name) === '扑杀') {
                  attacker.buffs[cj].layers = Math.max(0, (parseInt(attacker.buffs[cj].layers, 10) || 0) - 1);
                  if (attacker.buffs[cj].layers <= 0)
                    attacker.buffs = attacker.buffs.filter(function (b) {
                      return (b.id || b.name) !== '扑杀';
                    });
                  break;
                }
              }
            }
            if ((opts && opts.isRanged && 岚锁定L > 0) || (opts && opts.isMelee && 岚扑杀L > 0))
              addBuffLayers(attacker, '心满意足', '心满意足', 1);
          }
          if (opts && opts.isRanged && attacker.弹跳踩踏) attacker.弹跳踩踏 = false;
        }
        try月见遥观测者的愉悦OnAttackResult(attacker, true);
        return {
          hit: true,
          crit: crit,
          rollHit: rollHit,
          rollCrit: rollCrit,
          hitRate: hitRate,
          critRate: critRate,
        attackerHitRate: attackerHitRate,
        defenderDodgeRate: defenderDodgeRate,
          finalDamage: finalDamage,
          shadowDamage: shadowAdded,
          damageIncreaseReasons: damageIncreaseReasons,
          message: message,
        };
      }
    }
    var getHpFromSta = options.getHpFromSta;
    var createSummonBaiya =
      window.色色地牢_character && window.色色地牢_character.createSummonBaiya
        ? window.色色地牢_character.createSummonBaiya(getDisplayStat)
        : null;
    var getBaiyaStatsFromOwner =
      window.色色地牢_character && window.色色地牢_character.getBaiyaStatsFromOwner
        ? function (owner) {
            return window.色色地牢_character.getBaiyaStatsFromOwner(owner, getDisplayStat);
          }
        : function () {
            return { maxHp: 0, atk: 0, def: 0 };
          };
    var createSummonLilim =
      window.色色地牢_character && window.色色地牢_character.createSummonLilim
        ? window.色色地牢_character.createSummonLilim(getDisplayStat)
        : null;
    var getLilimStatsFromOwner =
      window.色色地牢_character && window.色色地牢_character.getLilimStatsFromOwner
        ? function (owner) {
            return window.色色地牢_character.getLilimStatsFromOwner(owner, getDisplayStat);
          }
        : function () {
            return { maxHp: 0, atk: 0, def: 0 };
          };
    var createSummonKerui =
      window.色色地牢_character && window.色色地牢_character.createSummonKerui
        ? window.色色地牢_character.createSummonKerui(getDisplayStat)
        : null;
    var getKeruiStatsFromOwner =
      window.色色地牢_character && window.色色地牢_character.getKeruiStatsFromOwner
        ? function (owner) {
            return window.色色地牢_character.getKeruiStatsFromOwner(owner, getDisplayStat);
          }
        : function () {
            return { maxHp: 0, atk: 0, def: 0 };
          };
    var createSummonMonteCarlo =
      window.色色地牢_character && window.色色地牢_character.createSummonMonteCarlo
        ? window.色色地牢_character.createSummonMonteCarlo(getDisplayStat)
        : null;
    var getMonteCarloStatsFromOwner =
      window.色色地牢_character && window.色色地牢_character.getMonteCarloStatsFromOwner
        ? function (owner) {
            return window.色色地牢_character.getMonteCarloStatsFromOwner(owner, getDisplayStat);
          }
        : function () {
            return { maxHp: 0, atk: 0, def: 0 };
          };
    var createSummonJin =
      window.色色地牢_character && window.色色地牢_character.createSummonJin
        ? window.色色地牢_character.createSummonJin(getDisplayStat)
        : null;
    var getJinStatsFromOwner =
      window.色色地牢_character && window.色色地牢_character.getJinStatsFromOwner
        ? function (owner) {
            return window.色色地牢_character.getJinStatsFromOwner(owner, getDisplayStat);
          }
        : function () {
            return { maxHp: 0, atk: 0, def: 0 };
          };
    var getApByLevel = options.getApByLevel;
    var getMaxExpForLevel = options.getMaxExpForLevel;
    var getSkillEffectForLevel = options.getSkillEffectForLevel;
    var resolveSkillEffect = options.resolveSkillEffect;
    var getBaseDamageFromResolvedEffect = options.getBaseDamageFromResolvedEffect;
    var getBaseDamageForSkill = options.getBaseDamageForSkill;
    getTargetableAllySlotsForEnemy = function (party) {
      if (!party || party.length < SLOT_COUNT) return [];
      var tauntSlots = [];
      var i;
      for (i = 1; i <= SLOT_COUNT; i++) {
        var u = party[i - 1];
        if (!u) continue;
        var hp = u.hp != null ? parseInt(u.hp, 10) : getHpFromSta(getDisplayStat(u, 'sta') || 1);
        if ((hp || 0) <= 0) continue;
        var hasVoid = (u.buffs || []).some(function (b) {
          return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
        });
        if (hasVoid) continue;
        var buffs = u.buffs || [];
        var hasTaunt = buffs.some(function (b) {
          return (b.id === '嘲讽' || b.name === '嘲讽') && (b.layers || 0) > 0;
        });
        if (hasTaunt) tauntSlots.push(i);
      }
      if (tauntSlots.length > 0) return tauntSlots;
      var frontHasLiving = false;
      for (i = 0; i < FRONT_ROW_SLOTS.length; i++) {
        var fu = party[FRONT_ROW_SLOTS[i] - 1];
        if (!fu) continue;
        var fHp = fu.hp != null ? parseInt(fu.hp, 10) : getHpFromSta(getDisplayStat(fu, 'sta') || 1);
        if ((fHp || 0) <= 0) continue;
        var fuVoid = (fu.buffs || []).some(function (b) {
          return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
        });
        if (!fuVoid) {
          frontHasLiving = true;
          break;
        }
      }
      var base = frontHasLiving ? FRONT_ROW_SLOTS.slice() : FRONT_ROW_SLOTS.slice().concat(BACK_ROW_SLOTS);
      return base.filter(function (slotIdx) {
        var ally = party[slotIdx - 1];
        if (!ally) return false;
        var curHp = ally.hp != null ? parseInt(ally.hp, 10) : getHpFromSta(getDisplayStat(ally, 'sta') || 1);
        if ((curHp || 0) <= 0) return false;
        var hasVoid = (ally.buffs || []).some(function (b) {
          return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
        });
        return !hasVoid;
      });
    };
    function getAllySlotForCharacterName(party, name) {
      if (!party || !name) return null;
      for (var gsi = 0; gsi < party.length && gsi < SLOT_COUNT; gsi++) {
        if (party[gsi] && (party[gsi].name || '') === name) return gsi + 1;
      }
      return null;
    }
    /** 月见遥「完美谎言」：敌方随机单体意图若选中月见遥，改为攻击替身槽位（一次性）。 */
    function tryRedirect月见遥完美谎言(ts, party) {
      if (ts == null || !party) return ts;
      var yueSlot = getAllySlotForCharacterName(party, '月见遥');
      var dec = battleState.月见遥完美谎言替身槽;
      if (dec == null || !yueSlot || ts !== yueSlot) return ts;
      var decUnit = party[dec - 1];
      var decHp = decUnit ? parseInt(decUnit.hp, 10) || 0 : 0;
      if (!decUnit || decHp <= 0 || dec === yueSlot) {
        battleState.月见遥完美谎言替身槽 = null;
        return ts;
      }
      battleState.月见遥完美谎言替身槽 = null;
      if (typeof appendCombatLog === 'function')
        appendCombatLog('「完美谎言」：攻击转向 ' + (decUnit.name || '友方'));
      return dec;
    }
    /** 「大妃的魔宴」：目标身上不同减益种类数（含 NEGATIVE_DEBUFF_IDS 及 暗蚀/麻痹/冻结）。 */
    function countDistinctDebuffTypesFor大妃魔宴(unit) {
      if (!unit || !unit.buffs) return 0;
      var extra = { 暗蚀: true, 麻痹: true, 冻结: true };
      var seen = {};
      var n = 0;
      for (var di = 0; di < unit.buffs.length; di++) {
        var b = unit.buffs[di];
        var bid = (b.id || b.name || '').trim();
        if ((parseInt(b.layers, 10) || 0) <= 0) continue;
        if (NEGATIVE_DEBUFF_IDS.indexOf(bid) === -1 && !extra[bid]) continue;
        if (seen[bid]) continue;
        seen[bid] = true;
        n++;
      }
      return n;
    }
    var getShieldFromResolvedEffect =
      options.getShieldFromResolvedEffect ||
      function () {
        return NaN;
      };
    var getShieldForSkill =
      options.getShieldForSkill ||
      function () {
        return NaN;
      };
    var getSpecialSkillsForChar = options.getSpecialSkillsForChar;
    var wrapBuffRefs =
      options.wrapBuffRefs ||
      function (x) {
        return x;
      };
    var SWAP_SVG = options.SWAP_SVG || '';
    var AP_FLAME_SVG = options.AP_FLAME_SVG || '';
    var SKILL_ATTACK_SVG = options.SKILL_ATTACK_SVG || '';
    var SKILL_DEFENSE_SVG = options.SKILL_DEFENSE_SVG || '';
    var INTENT_CLOTHES_BREAK_SVG = options.INTENT_CLOTHES_BREAK_SVG || '';
    var INTENT_BIND_CHAIN_SVG = options.INTENT_BIND_CHAIN_SVG || '';
    var INTENT_LEWD_HEART_SVG = options.INTENT_LEWD_HEART_SVG || '';
    var SKILL_BAIYA_SVG = options.SKILL_BAIYA_SVG || '';
    var SKILL_WOLF_PACK_SVG = options.SKILL_WOLF_PACK_SVG || '';
    var SKILL_ROAR_SVG = options.SKILL_ROAR_SVG || '';
    var SKILL_EXECUTE_SVG = options.SKILL_EXECUTE_SVG || '';
    var SKILL_BAIYA_SWEEP_SVG = options.SKILL_BAIYA_SWEEP_SVG || '';
    var SKILL_WHIRLWIND_SVG = options.SKILL_WHIRLWIND_SVG || '';
    var SKILL_BLADE_BITE_SVG = options.SKILL_BLADE_BITE_SVG || '';
    var SKILL_SHIELD_SWORD_SVG = options.SKILL_SHIELD_SWORD_SVG || '';
    var SKILL_ZANYUE_SVG = options.SKILL_ZANYUE_SVG || '';
    var SKILL_FEISELUNWU_SVG = options.SKILL_FEISELUNWU_SVG || '';
    var SKILL_MOWUYUNYU_SVG = options.SKILL_MOWUYUNYU_SVG || '';
    var SKILL_JIQIJIEJIN_SVG = options.SKILL_JIQIJIEJIN_SVG || '';
    var SKILL_FUSHIYU_SVG = options.SKILL_FUSHIYU_SVG || '';
    var SKILL_YIZHONGWAIKE_SVG = options.SKILL_YIZHONGWAIKE_SVG || '';
    var SKILL_POZHENCHONGFENG_SVG = options.SKILL_POZHENCHONGFENG_SVG || '';
    var SKILL_JIANQIE_SVG = options.SKILL_JIANQIE_SVG || '';
    var SKILL_JUHE_SVG = options.SKILL_JUHE_SVG || '';
    var SKILL_LINGXI_SVG = options.SKILL_LINGXI_SVG || '';
    var SKILL_BILUO_SVG = options.SKILL_BILUO_SVG || '';
    var SKILL_TALANGXINGGE_SVG = options.SKILL_TALANGXINGGE_SVG || '';
    var SKILL_XIANGRUIPUYOU_SVG = options.SKILL_XIANGRUIPUYOU_SVG || '';
    var SKILL_NADAO_SVG = options.SKILL_NADAO_SVG || '';
    var SKILL_CUOJIN_SVG = options.SKILL_CUOJIN_SVG || '';
    var SKILL_BAIYE_SVG = options.SKILL_BAIYE_SVG || '';
    var SKILL_ISHAN_SVG = options.SKILL_ISHAN_SVG || '';
    var SKILL_XINYAN_SVG = options.SKILL_XINYAN_SVG || '';
    var SKILL_MUPAIZI_SVG = options.SKILL_MUPAIZI_SVG || '';
    var SKILL_CANYINGBU_SVG = options.SKILL_CANYINGBU_SVG || '';
    var SKILL_MAOBU_SVG = options.SKILL_MAOBU_SVG || '';
    var SKILL_SHUNXING_SVG = options.SKILL_SHUNXING_SVG || '';
    var SKILL_JIAOSHOU_SVG = options.SKILL_JIAOSHOU_SVG || '';
    var SKILL_QIANGWEI_SVG = options.SKILL_QIANGWEI_SVG || '';
    var SKILL_FUKONG_SVG = options.SKILL_FUKONG_SVG || '';
    var SKILL_SIWANGZHIYAN_SVG = options.SKILL_SIWANGZHIYAN_SVG || '';
    var SKILL_TANTIAO_SVG = options.SKILL_TANTIAO_SVG || '';
    var SKILL_YOULINGWUTA_SVG = options.SKILL_YOULINGWUTA_SVG || '';
    var SKILL_XUEWUQIANGVEN_SVG = options.SKILL_XUEWUQIANGVEN_SVG || '';
    var SKILL_ANYEWEIMU_SVG = options.SKILL_ANYEWEIMU_SVG || '';
    var SKILL_MOLONGWU_SVG = options.SKILL_MOLONGWU_SVG || '';
    var SKILL_SHENYUANZHONGJIE_SVG = options.SKILL_SHENYUANZHONGJIE_SVG || '';
    var SKILL_ANSHIZHIREN_SVG = options.SKILL_ANSHIZHIREN_SVG || '';
    var SKILL_YANMOCHUIXI_SVG = options.SKILL_YANMOCHUIXI_SVG || '';
    var SKILL_XINLINGQINSHI_SVG = options.SKILL_XINLINGQINSHI_SVG || '';
    var SKILL_XUWUFANGZHU_SVG = options.SKILL_XUWUFANGZHU_SVG || '';
    var SKILL_YAOYANYEHUO_SVG = options.SKILL_YAOYANYEHUO_SVG || '';
    var SKILL_MEIMOZHIWEN_SVG = options.SKILL_MEIMOZHIWEN_SVG || '';
    var SKILL_LINGHUNSHENGYAN_SVG = options.SKILL_LINGHUNSHENGYAN_SVG || '';
    var SKILL_JIEHUNZHIHUO_SVG = options.SKILL_JIEHUNZHIHUO_SVG || '';
    var SKILL_SHENGUANGZHAN_SVG = options.SKILL_SHENGUANGZHAN_SVG || '';
    var SKILL_QINGSUANZHISHOU_SVG = options.SKILL_QINGSUANZHISHOU_SVG || '';
    var SKILL_SHENENJISHU_SVG = options.SKILL_SHENENJISHU_SVG || '';
    var SKILL_ZUIFAXUANGAO_SVG = options.SKILL_ZUIFAXUANGAO_SVG || '';
    var SKILL_MANGMOUZHIGUANG_SVG = options.SKILL_MANGMOUZHIGUANG_SVG || '';
    var SKILL_JISHU_SVG = options.SKILL_JISHU_SVG || '';
    var SKILL_SHENGHUOJINGSHI_SVG = options.SKILL_SHENGHUOJINGSHI_SVG || '';
    var SKILL_XINGYUZHUDAO_SVG = options.SKILL_XINGYUZHUDAO_SVG || '';
    var SKILL_HUIJINBIZHANG_SVG = options.SKILL_HUIJINBIZHANG_SVG || '';
    var SKILL_XINGHAITIAOHE_SVG = options.SKILL_XINGHAITIAOHE_SVG || '';
    var SKILL_TIANQIONGSONGE_SVG = options.SKILL_TIANQIONGSONGE_SVG || '';
    var SKILL_XINGCHENDINGMAO_SVG = options.SKILL_XINGCHENDINGMAO_SVG || '';
    var SKILL_XINGCHENJIASU_SVG = options.SKILL_XINGCHENJIASU_SVG || '';
    var SKILL_XINGMINGNIZHUAN_SVG = options.SKILL_XINGMINGNIZHUAN_SVG || '';

    function hasBuffName(unit, buffId) {
      if (!unit || !unit.buffs || !unit.buffs.length) return false;
      for (var bi = 0; bi < unit.buffs.length; bi++) {
        var b = unit.buffs[bi];
        if ((b.id || b.name) !== buffId) continue;
        if ((parseInt(b.layers, 10) || 0) > 0) return true;
      }
      return false;
    }
    function renderAllySlots(optionalParty) {
      var party = optionalParty != null && Array.isArray(optionalParty) ? optionalParty : getParty();
      for (var i = 1; i <= 6; i++) {
        var slotEl = document.querySelector('.slot[data-slot="ally-' + i + '"]');
        if (!slotEl) continue;
        var ch = party[i - 1];
        if (!ch) {
          slotEl.removeAttribute('data-ally-render-key');
          slotEl.innerHTML = '空位';
          slotEl.classList.add('slot-char');
          slotEl.classList.remove('slot-defeated', 'slot-defeated-shake');
          var emptyOb = slotEl.querySelector('.slot-defeated-overlay');
          if (emptyOb) emptyOb.remove();
          slotEl.title = '空位';
          continue;
        }
        /** 白牙与女儿等召唤物：仅 HP条 + 攻防数值 + AP，无等级/经验条；立绘用占位（与白牙一致） */
        if (ch.name === '白牙' || ch.daughterUnit === true) {
          slotEl.removeAttribute('data-ally-render-key');
          var summName = (ch.name || '').trim() || '召唤物';
          var summMaxHp = Math.max(1, parseInt(ch.maxHp, 10) || 1);
          var summHp = ch.hp != null ? Math.min(parseInt(ch.hp, 10) || 0, summMaxHp) : summMaxHp;
          var summAtk = ch.atk != null ? parseInt(ch.atk, 10) : 0;
          var summDef = ch.def != null ? parseInt(ch.def, 10) : 0;
          var summShield = ch.currentShield != null ? Math.max(0, parseInt(ch.currentShield, 10) || 0) : 0;
          var summApFallback = ch.name === '白牙' || ch.daughterUnit === true ? 2 : getApByLevel(ch.level != null ? ch.level : 1);
          var summAp =
            ch.currentAp !== undefined && ch.currentAp !== null
              ? Math.max(0, parseInt(ch.currentAp, 10) || 0)
              : summApFallback;
          var summHpPct = summMaxHp ? Math.min(100, (summHp / summMaxHp) * 100) : 0;
          var summShieldPct = summMaxHp > 0 && summShield > 0 ? Math.min(100, (summShield / summMaxHp) * 100) : 0;
          slotEl.classList.add('slot-char', 'slot-enemy');
          slotEl.title =
            summName +
            ' HP ' +
            summHp +
            '/' +
            summMaxHp +
            (summShield > 0 ? ' 护盾' + summShield : '') +
            ' 攻击' +
            summAtk +
            ' 防御' +
            summDef;
          if (summHp <= 0) {
            var summNameEl = slotEl.querySelector('.slot-char-name');
            var summHasOverlay = slotEl.querySelector('.slot-defeated-overlay');
            if (summNameEl && summHasOverlay && (summNameEl.textContent || '').trim() === summName) {
              slotEl.classList.add('slot-defeated');
              slotEl.classList.remove('slot-defeated-shake');
              continue;
            }
          }
          slotEl.innerHTML =
            '<button type="button" class="slot-swap-btn" title="切换位置" data-ally-slot="' +
            i +
            '">' +
            SWAP_SVG +
            '</button>' +
            '<div class="slot-char-portrait slot-enemy-portrait-empty" aria-hidden="true"></div>' +
            '<div class="slot-char-info">' +
            '<div class="slot-char-name">' +
            summName.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
            '</div>' +
            '<div class="slot-char-bar slot-char-hp"><div class="slot-char-bar-fill" style="width:' +
            summHpPct +
            '%"></div>' +
            (summShield > 0
              ? '<div class="slot-char-bar-shield-edge' +
                (summShieldPct >= 100 ? ' slot-char-bar-shield-edge-full' : '') +
                '" style="width:' +
                summShieldPct +
                '%"></div>'
              : '') +
            '<span class="slot-char-bar-text">' +
            summHp +
            '/' +
            summMaxHp +
            (summShield > 0 ? ' <span class="slot-char-shield">+' + summShield + '</span>' : '') +
            '</span></div>' +
            '<div class="slot-enemy-stats-row" style="font-size:11px;color:#5c4a3a;margin-top:4px;display:flex;align-items:center;gap:4px">' +
            '<span class="slot-enemy-atk-icon">' +
            (SKILL_ATTACK_SVG || '') +
            '</span><span>' +
            summAtk +
            '</span><span>·</span>' +
            '<span class="slot-enemy-def-wrap"><span class="slot-enemy-def-icon">' +
            (SKILL_DEFENSE_SVG || '') +
            '</span><span>' +
            summDef +
            '</span></span></div>' +
            '<div class="slot-char-buffs">' +
            renderBuffsHtml(ch.buffs || []) +
            '</div>' +
            '<div class="slot-char-ap"><span class="slot-char-ap-text">行动</span><span class="slot-char-ap-icon">' +
            AP_FLAME_SVG +
            '</span><span class="slot-char-ap-value">' +
            summAp +
            '</span></div></div>' +
            (summHp <= 0
              ? '<div class="slot-defeated-overlay" aria-hidden="true"><span class="slot-defeated-overlay-text">战斗不能</span></div>'
              : '');
          if (summHp <= 0) {
            slotEl.classList.add('slot-defeated');
            if (ch._justDefeated) {
              slotEl.classList.add('slot-defeated-shake');
              ch._justDefeated = false;
              slotEl.addEventListener('animationend', function once(ev) {
                if (ev.animationName === 'slot-defeated-shake') {
                  slotEl.removeEventListener('animationend', once);
                  slotEl.classList.remove('slot-defeated-shake');
                }
              });
            } else {
              slotEl.classList.remove('slot-defeated-shake');
            }
          } else {
            slotEl.classList.remove('slot-defeated', 'slot-defeated-shake');
          }
          continue;
        }
        var level = ch.level != null ? ch.level : 1;
        var sta = getDisplayStat(ch, 'sta') || 1;
        var maxHp = getHpFromSta(sta);
        var hp = ch.hp != null ? Math.min(ch.hp, maxHp) : maxHp;
        var exp = ch.exp != null ? ch.exp : 0;
        var maxExp = getMaxExpForLevel(level);
        var maxAp = getEffectiveMaxApForAlly(ch);
        var ap =
          ch.currentAp !== undefined && ch.currentAp !== null ? Math.max(0, parseInt(ch.currentAp, 10) || 0) : maxAp;
        var shieldNum = ch.currentShield != null ? Math.max(0, parseInt(ch.currentShield, 10) || 0) : 0;
        var hpPct = maxHp ? Math.min(100, (hp / maxHp) * 100) : 0;
        var expPct = maxExp ? Math.min(100, (exp / maxExp) * 100) : 0;
        var shieldPct = maxHp > 0 && shieldNum > 0 ? Math.min(100, (shieldNum / maxHp) * 100) : 0;
        var levelRow =
          '<div class="slot-char-level-wrap">' +
          (shieldNum > 0 ? '<span class="slot-char-shield">' + shieldNum + '</span>' : '') +
          '<span class="slot-char-level">Lv' +
          level +
          '</span></div>';
        var hasVoid = (ch.buffs || []).some(function (b) {
          return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
        });
        var portraitSrc =
          typeof window !== 'undefined' && typeof window.buildHentaiDungeonPortraitUrl === 'function'
            ? window.buildHentaiDungeonPortraitUrl(ch, ch.avatar || '')
            : ch.avatar || '';
        var renderKey =
          (ch.name || '') +
          '|' +
          hp +
          '|' +
          maxHp +
          '|' +
          ap +
          '|' +
          (hasVoid ? '1' : '0') +
          '|' +
          (hp <= 0 ? '1' : '0') +
          '|' +
          level +
          '|' +
          exp +
          '|' +
          maxExp +
          '|' +
          shieldNum +
          '|' +
          portraitSrc +
          '|' +
          (ch.buffs || [])
            .map(function (b) {
              return (b.id || b.name) + ':' + (b.layers || 0);
            })
            .join(',');
        var lastKey = slotEl.getAttribute('data-ally-render-key');
        if (lastKey === renderKey) {
          slotEl.classList.add('slot-char');
          slotEl.title = ch.name || '空位';
          if (hasVoid) slotEl.classList.add('slot-void');
          else slotEl.classList.remove('slot-void');
          if (hp <= 0) slotEl.classList.add('slot-defeated');
          else slotEl.classList.remove('slot-defeated', 'slot-defeated-shake');
          continue;
        }
        slotEl.setAttribute('data-ally-render-key', renderKey);
        var hpBarInner =
          '<div class="slot-char-bar-fill" style="width:' +
          hpPct +
          '%"></div>' +
          (shieldNum > 0
            ? '<div class="slot-char-bar-shield-edge' +
              (shieldPct >= 100 ? ' slot-char-bar-shield-edge-full' : '') +
              '" style="width:' +
              shieldPct +
              '%"></div>'
            : '') +
          '<span class="slot-char-bar-text">' +
          hp +
          '/' +
          maxHp +
          '</span>';
        slotEl.classList.add('slot-char');
        slotEl.title = ch.name || '空位';
        if (hp <= 0) {
          var nameEl = slotEl.querySelector('.slot-char-name');
          var hasOverlay = slotEl.querySelector('.slot-defeated-overlay');
          if (nameEl && hasOverlay && (nameEl.textContent || '').trim() === (ch.name || '')) {
            slotEl.classList.add('slot-defeated');
            slotEl.classList.remove('slot-defeated-shake');
            continue;
          }
        }
        slotEl.innerHTML =
          (hasVoid
            ? ''
            : '<button type="button" class="slot-swap-btn" title="切换位置" data-ally-slot="' +
              i +
              '">' +
              SWAP_SVG +
              '</button>') +
          '<div class="slot-char-portrait"><img src="' +
          portraitSrc +
          '" alt="' +
          (ch.name || '') +
          '"/></div>' +
          '<div class="slot-char-info">' +
          '<div class="slot-char-name">' +
          (ch.name || '') +
          '</div>' +
          levelRow +
          '<div class="slot-char-bar slot-char-hp">' +
          hpBarInner +
          '</div>' +
          '<div class="slot-char-bar slot-char-exp"><div class="slot-char-bar-fill" style="width:' +
          expPct +
          '%"></div><span class="slot-char-bar-text">' +
          exp +
          '/' +
          maxExp +
          '</span></div>' +
          '<div class="slot-char-buffs">' +
          renderBuffsHtml(ch.buffs || []) +
          '</div>' +
          '<div class="slot-char-ap"><span class="slot-char-ap-text">行动</span><span class="slot-char-ap-icon">' +
          AP_FLAME_SVG +
          '</span><span class="slot-char-ap-value">' +
          ap +
          '</span></div>' +
          '</div>' +
          (hp <= 0
            ? '<div class="slot-defeated-overlay" aria-hidden="true"><span class="slot-defeated-overlay-text">战斗不能</span></div>'
            : '') +
          (hasVoid
            ? '<div class="slot-void-overlay" aria-hidden="true"><span class="slot-void-overlay-text">虚无</span></div>'
            : '');
        if (hp <= 0) {
          slotEl.classList.add('slot-defeated');
          if (ch._justDefeated) {
            slotEl.classList.add('slot-defeated-shake');
            ch._justDefeated = false;
            slotEl.addEventListener('animationend', function once(ev) {
              if (ev.animationName === 'slot-defeated-shake') {
                slotEl.removeEventListener('animationend', once);
                slotEl.classList.remove('slot-defeated-shake');
              }
            });
          } else {
            slotEl.classList.remove('slot-defeated-shake');
          }
        } else {
          slotEl.classList.remove('slot-defeated', 'slot-defeated-shake');
        }
        if (hasVoid) slotEl.classList.add('slot-void');
        else slotEl.classList.remove('slot-void');
      }
    }
    function hasAnyLivingEnemy(enemies) {
      if (!enemies || !Array.isArray(enemies)) return false;
      for (var hi = 0; hi < enemies.length; hi++) {
        var h = enemies[hi];
        if (h && (parseInt(h.hp, 10) || 0) > 0) return true;
      }
      return false;
    }
    function syncBattleEndTurnButton() {
      var btn = document.getElementById('battle-end-turn-btn');
      if (!btn || typeof window.BattleGrid === 'undefined') return;
      var phase = window.BattleGrid.getBattlePhase();
      var enemies = getEnemyParty();
      var showContinue =
        phase === BATTLE_PHASE.PLAYER_ACTION && !hasAnyLivingEnemy(enemies);
      btn.textContent = showContinue ? '继续前进' : '结束回合';
      btn.setAttribute('data-battle-btn-mode', showContinue ? 'continue-map' : 'end-turn');
    }
    function renderEnemySlots(optionalEnemies) {
      var enemies = optionalEnemies != null && Array.isArray(optionalEnemies) ? optionalEnemies : getEnemyParty();
      for (var i = 1; i <= 6; i++) {
        var slotEl = document.querySelector('.slot[data-slot="enemy-' + i + '"]');
        if (!slotEl) continue;
        var en = enemies[i - 1];
        if (!en) {
          slotEl.innerHTML =
            '<div class="slot-char-portrait slot-enemy-portrait-empty" aria-hidden="true"></div>' +
            '<div class="slot-char-info"><div class="slot-char-name" style="opacity:.65;font-size:12px">空位</div></div>';
          slotEl.classList.add('slot-enemy', 'slot-char');
          slotEl.classList.remove('slot-defeated', 'slot-defeated-shake');
          slotEl.title = '空位';
          continue;
        }
        var name = (en.name || '敌人').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var maxHp = Math.max(1, parseInt(en.maxHp, 10) || 100);
        var hp = en.hp != null ? Math.min(parseInt(en.hp, 10) || 0, maxHp) : maxHp;
        var atk = en.atk != null ? parseInt(en.atk, 10) : 0;
        var def = en.def != null ? parseInt(en.def, 10) : 0;
        var shieldNum = en.currentShield != null ? Math.max(0, parseInt(en.currentShield, 10) || 0) : 0;
        var hpPct = maxHp ? Math.min(100, (hp / maxHp) * 100) : 0;
        var shieldPct = maxHp > 0 && shieldNum > 0 ? Math.min(100, (shieldNum / maxHp) * 100) : 0;
        slotEl.classList.add('slot-enemy', 'slot-char');
        var genderHint =
          en.gender && String(en.gender).trim() ? ' · ' + String(en.gender).trim().replace(/</g, '&lt;') : '';
        var bodySizeHint =
          en.bodySize && String(en.bodySize).trim()
            ? ' · ' + String(en.bodySize).trim().replace(/</g, '&lt;')
            : '';
        slotEl.title =
          name +
          genderHint +
          bodySizeHint +
          ' HP ' +
          hp +
          '/' +
          maxHp +
          (shieldNum > 0 ? ' 护盾' + shieldNum : '') +
          ' 攻击' +
          atk +
          ' 防御' +
          def;
        if (hp <= 0) {
          var nameEl = slotEl.querySelector('.slot-char-name');
          var hasOverlay = slotEl.querySelector('.slot-defeated-overlay');
          if (nameEl && hasOverlay && (nameEl.textContent || '').trim() === (en.name || '敌人').trim()) {
            slotEl.classList.add('slot-defeated');
            slotEl.classList.remove('slot-defeated-shake');
            if (en._justDefeated) {
              slotEl.classList.add('slot-defeated-shake');
              en._justDefeated = false;
              slotEl.addEventListener('animationend', function once(ev) {
                if (ev.animationName === 'slot-defeated-shake') {
                  slotEl.removeEventListener('animationend', once);
                  slotEl.classList.remove('slot-defeated-shake');
                }
              });
            }
            continue;
          }
        }
        slotEl.innerHTML =
          '<div class="slot-char-portrait slot-enemy-portrait-empty" aria-hidden="true"></div>' +
          '<div class="slot-char-info">' +
          '<div class="slot-char-name">' +
          name +
          '</div>' +
          '<div class="slot-char-bar slot-char-hp"><div class="slot-char-bar-fill" style="width:' +
          hpPct +
          '%"></div>' +
          (shieldNum > 0
            ? '<div class="slot-char-bar-shield-edge' +
              (shieldPct >= 100 ? ' slot-char-bar-shield-edge-full' : '') +
              '" style="width:' +
              shieldPct +
              '%"></div>'
            : '') +
          '<span class="slot-char-bar-text">' +
          hp +
          '/' +
          maxHp +
          (shieldNum > 0 ? ' <span class="slot-char-shield">+' + shieldNum + '</span>' : '') +
          '</span></div>' +
          '<div class="slot-enemy-stats-row" style="font-size:11px;color:#5c4a3a;margin-top:4px;display:flex;align-items:center;gap:4px"><span class="slot-enemy-atk-icon">' +
          (SKILL_ATTACK_SVG || '') +
          '</span><span>' +
          atk +
          '</span><span>·</span><span class="slot-enemy-def-wrap"><span class="slot-enemy-def-icon">' +
          (SKILL_DEFENSE_SVG || '') +
          '</span><span>' +
          def +
          '</span></span></div>' +
          (battleState.showEnemyIntentUI &&
          hp > 0 &&
          battleState.plannedEnemyActions[i - 1] != null &&
          battleState.plannedEnemyActions[i - 1] !== ''
            ? '<div class="slot-enemy-intent-ribbon">' +
              buildEnemyIntentRibbonHtml(en, battleState.plannedEnemyActions[i - 1]) +
              '</div>'
            : '') +
          '<div class="slot-char-buffs">' +
          renderBuffsHtml(en.buffs || []) +
          '</div>' +
          '</div>' +
          (hp <= 0
            ? '<div class="slot-defeated-overlay" aria-hidden="true"><span class="slot-defeated-overlay-text">战斗不能</span></div>'
            : '');
        if (hp <= 0) {
          slotEl.classList.add('slot-defeated');
          if (en._justDefeated) {
            slotEl.classList.add('slot-defeated-shake');
            en._justDefeated = false;
            slotEl.addEventListener('animationend', function once(ev) {
              if (ev.animationName === 'slot-defeated-shake') {
                slotEl.removeEventListener('animationend', once);
                slotEl.classList.remove('slot-defeated-shake');
              }
            });
          } else {
            slotEl.classList.remove('slot-defeated-shake');
          }
        } else {
          slotEl.classList.remove('slot-defeated', 'slot-defeated-shake');
        }
      }
      syncBattleEndTurnButton();
    }
    /** 获取或创建“掉血/治疗/Miss”飘字专用容器，避免被 slot 的 innerHTML 重绘清掉（多段攻击每段都能看到数字） */
    function getDamageFlyContainer() {
      var id = 'battle-damage-fly-container';
      var el = document.getElementById(id);
      if (el) return el;
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
      document.body.appendChild(el);
      return el;
    }
    /** 在 slot 正中央显示飘字（不放进 slot 内，避免被 render 覆盖），delayMs 后移除 */
    function showFlyOverSlot(slotEl, flyEl, delayMs) {
      if (!slotEl || !flyEl) return;
      var container = getDamageFlyContainer();
      var r = slotEl.getBoundingClientRect();
      flyEl.style.position = 'fixed';
      flyEl.style.left = r.left + r.width / 2 + 'px';
      flyEl.style.top = r.top + r.height / 2 + 'px';
      container.appendChild(flyEl);
      setTimeout(function () {
        if (flyEl.parentNode) flyEl.remove();
      }, delayMs);
    }
    function playHitEffect(slotEl, damage, color) {
      if (!slotEl || damage == null || damage < 0) return;
      if (color !== 'shadow') {
        slotEl.classList.add('slot-hit-shake');
        setTimeout(function () {
          slotEl.classList.remove('slot-hit-shake');
        }, 400);
      }
      var fly = document.createElement('div');
      fly.className = color === 'shadow' ? 'slot-hit-damage-shadow' : 'slot-hit-damage';
      fly.textContent = '-' + damage;
      showFlyOverSlot(slotEl, fly, 920);
    }
    function playMissEffect(slotEl) {
      if (!slotEl) return;
      var fly = document.createElement('div');
      fly.className = 'slot-hit-miss';
      fly.textContent = 'Miss';
      showFlyOverSlot(slotEl, fly, 920);
    }
    /** 在槽位上播放绿色加血数字 +N，持续约 0.9s */
    function playHealEffect(slotEl, amount) {
      if (!slotEl || amount == null || amount < 0) return;
      var fly = document.createElement('div');
      fly.className = 'slot-heal-number';
      fly.textContent = '+' + amount;
      showFlyOverSlot(slotEl, fly, 920);
    }
    /** 在目标槽位上播放 Slash 动画：命中时卡片不动，未命中时卡片颤抖一次。结束后调用 onComplete */
    function playSlashOnSlot(slotEl, hit, onComplete) {
      if (!slotEl || typeof onComplete !== 'function') {
        onComplete();
        return;
      }
      var slashUrl = (window.ANIMATIONS && window.ANIMATIONS.Slash) || '';
      var durationMs = (window.ANIMATION_DURATIONS && window.ANIMATION_DURATIONS.Slash) || 520;
      var overlay = document.createElement('div');
      overlay.className = 'slot-animation-overlay';
      if (slashUrl) {
        var img = document.createElement('img');
        img.src = slashUrl;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        overlay.appendChild(img);
      }
      slotEl.style.position = 'relative';
      slotEl.appendChild(overlay);
      if (!hit) slotEl.classList.add('slot-miss-shake');
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        slotEl.classList.remove('slot-miss-shake');
        if (overlay.parentNode) overlay.remove();
        onComplete();
      }
      function startDurationTimer() {
        setTimeout(finish, durationMs);
      }
      if (slashUrl && overlay.querySelector('img')) {
        var imgEl = overlay.querySelector('img');
        if (imgEl.complete) startDurationTimer();
        else {
          imgEl.onload = startDurationTimer;
          imgEl.onerror = startDurationTimer;
        }
      } else {
        setTimeout(finish, durationMs);
      }
    }
    /** APNG 加载超时(ms)：超时则跳过动画并在后台继续加载。技能动画（如狼群围猎 ClawSpecial2）给足时间避免未加载即被跳过 */
    var APNG_LOAD_TIMEOUT_MS = 600;
    /** 在目标槽位上播放指定动画（如 Recovery4 护盾），播完后调用 onComplete。APNG 最多等 100ms，超时则跳过并在后台预加载。 */
    function playAnimationOnSlot(slotEl, animationKey, onComplete) {
      if (!slotEl) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      var url = (window.ANIMATIONS && window.ANIMATIONS[animationKey]) || '';
      var durationMs = (window.ANIMATION_DURATIONS && window.ANIMATION_DURATIONS[animationKey]) || 500;
      var overlay = document.createElement('div');
      overlay.className = 'slot-animation-overlay';
      if (url) {
        var img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        overlay.appendChild(img);
      }
      slotEl.style.position = 'relative';
      slotEl.appendChild(overlay);
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        if (overlay.parentNode) overlay.remove();
        if (typeof onComplete === 'function') onComplete();
      }
      function startDurationTimer() {
        setTimeout(finish, durationMs);
      }
      if (url && overlay.querySelector('img')) {
        var imgEl = overlay.querySelector('img');
        var loadTimeout = setTimeout(function () {
          if (!done && imgEl && !imgEl.complete) {
            if (url) {
              var bg = new Image();
              bg.src = url;
            }
            finish();
          }
        }, APNG_LOAD_TIMEOUT_MS);
        if (imgEl.complete) {
          clearTimeout(loadTimeout);
          startDurationTimer();
        } else {
          imgEl.onload = function () {
            clearTimeout(loadTimeout);
            startDurationTimer();
          };
          imgEl.onerror = function () {
            clearTimeout(loadTimeout);
            startDurationTimer();
          };
        }
      } else {
        setTimeout(finish, durationMs);
      }
    }
    /** 在任意容器上播放指定动画（如敌方整体 SlashSpecial1），播完后调用 onComplete。APNG 最多等 100ms，超时则跳过并在后台预加载。 */
    function playAnimationOnContainer(containerEl, animationKey, onComplete) {
      if (!containerEl) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }
      var url = (window.ANIMATIONS && window.ANIMATIONS[animationKey]) || '';
      var durationMs = (window.ANIMATION_DURATIONS && window.ANIMATION_DURATIONS[animationKey]) || 500;
      var overlay = document.createElement('div');
      overlay.className = 'slot-animation-overlay';
      if (url) {
        var img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        overlay.appendChild(img);
      }
      containerEl.style.position = 'relative';
      containerEl.appendChild(overlay);
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        if (overlay.parentNode) overlay.remove();
        if (typeof onComplete === 'function') onComplete();
      }
      function startDurationTimer() {
        setTimeout(finish, durationMs);
      }
      if (url && overlay.querySelector('img')) {
        var imgEl = overlay.querySelector('img');
        var loadTimeout = setTimeout(function () {
          if (!done && imgEl && !imgEl.complete) {
            if (url) {
              var bg = new Image();
              bg.src = url;
            }
            finish();
          }
        }, APNG_LOAD_TIMEOUT_MS);
        if (imgEl.complete) {
          clearTimeout(loadTimeout);
          startDurationTimer();
        } else {
          imgEl.onload = function () {
            clearTimeout(loadTimeout);
            startDurationTimer();
          };
          imgEl.onerror = function () {
            clearTimeout(loadTimeout);
            startDurationTimer();
          };
        }
      } else {
        setTimeout(finish, durationMs);
      }
    }
    var STRIKE_SHAKE_MS = 200;
    /** 攻击方角色卡向目标方向抖动一次，结束后调用 onComplete */
    function playStrikeShake(attackerSlotEl, defenderSlotEl, onComplete) {
      if (!attackerSlotEl || typeof onComplete !== 'function') {
        onComplete();
        return;
      }
      var dx = 12;
      if (defenderSlotEl) {
        var ar = attackerSlotEl.getBoundingClientRect();
        var dr = defenderSlotEl.getBoundingClientRect();
        dx = dr.left > ar.left ? 12 : -12;
      }
      attackerSlotEl.style.setProperty('--strike-dx', dx + 'px');
      attackerSlotEl.classList.add('slot-strike-shake');
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        attackerSlotEl.classList.remove('slot-strike-shake');
        attackerSlotEl.style.removeProperty('--strike-dx');
        onComplete();
      }
      attackerSlotEl.addEventListener('animationend', function handler() {
        attackerSlotEl.removeEventListener('animationend', handler);
        finish();
      });
      setTimeout(finish, STRIKE_SHAKE_MS + 50);
    }
    /** 格式化单条攻击日志（标准格式）：[角色名]使用[技能名]对[目标]；命中Roll:…；暴击Roll:…；伤害计算:…；（增加部分：所有增伤原因）最终伤害:…；[目标]剩余Hp:…；未命中则只到命中Roll 为止。damageCalcStr 可选。result.damageIncreaseReasons 由 resolveAttack 返回。 */
    function formatAttackLogLine(
      attackerName,
      skillName,
      targetName,
      result,
      baseDamage,
      attrLabel,
      mult,
      finalHp,
      damageCalcStr,
    ) {
      var hitStr = result.hit ? '命中' : '未命中';
      var hitDenom = result.attackerHitRate != null && result.defenderDodgeRate != null ? '（命中' + result.attackerHitRate + '×(1-' + result.defenderDodgeRate + '%)）' : '';
      var line =
        attackerName +
        '使用' +
        skillName +
        '对' +
        targetName +
        '；' +
        '命中Roll:' +
        result.rollHit +
        '/' +
        result.hitRate +
        hitDenom +
        '(' +
        hitStr +
        ')；';
      if (!result.hit) return line;
      var critStr = result.crit ? '暴击' : '未暴击';
      var calcStr =
        damageCalcStr != null
          ? damageCalcStr
          : attrLabel && mult != null
            ? attrLabel + '×' + mult + '=' + baseDamage
            : '基础伤害=' + baseDamage;
      var increaseStr =
        result.damageIncreaseReasons != null && result.damageIncreaseReasons !== ''
          ? result.damageIncreaseReasons
          : '无；';
      line +=
        '暴击Roll:' +
        result.rollCrit +
        '/' +
        result.critRate +
        '(' +
        critStr +
        ')；' +
        '伤害计算:' +
        calcStr +
        '；' +
        increaseStr +
        '最终伤害:' +
        result.finalDamage +
        '；' +
        targetName +
        '剩余Hp:' +
        (finalHp != null ? finalHp : '') +
        '；';
      return line;
    }
    /** 行动日志：战斗界面左下角悬浮，半透明黑底白字，最多5行，单条5秒后淡出，不占布局 */
    var BATTLE_ACTION_LOG_MAX = 6;
    var BATTLE_ACTION_LOG_DURATION_MS = 5000;
    var BATTLE_ACTION_LOG_FADE_MS = 300;
    function appendActionLog(text) {
      if (!text) return;
      var container = document.getElementById('battle-action-log');
      if (!container) return;
      var line = document.createElement('div');
      line.className = 'battle-action-log-line';
      line.textContent = text;
      container.appendChild(line);
      while (container.children.length > BATTLE_ACTION_LOG_MAX) container.removeChild(container.firstChild);
      setTimeout(function () {
        line.classList.add('battle-action-log-fade');
        setTimeout(function () {
          if (line.parentNode) line.parentNode.removeChild(line);
        }, BATTLE_ACTION_LOG_FADE_MS);
      }, BATTLE_ACTION_LOG_DURATION_MS);
    }
    function appendCombatLog(textOrOpts) {
      var text = typeof textOrOpts === 'string' ? textOrOpts : textOrOpts && textOrOpts.text;
      var html = textOrOpts && textOrOpts.html;
      if (text) {
        console.info('[战斗]', text);
        recentLogLines.push(text);
        if (recentLogLines.length > RECENT_LOG_MAX) recentLogLines.shift();
      }
      if (text) appendActionLog(text);
      var el = document.getElementById('battle-combat-log');
      if (!el) return;
      var line = document.createElement('div');
      line.className = 'battle-combat-log-line';
      if (html) {
        line.innerHTML = html;
      } else {
        line.textContent = text || '';
      }
      el.appendChild(line);
      while (el.children.length > 30) el.removeChild(el.firstChild);
      el.scrollTop = el.scrollHeight;
    }
    function getPhaseLabel(phase) {
      return phase === 'player_action'
        ? '玩家行动回合'
        : phase === 'player_resolution'
          ? '玩家结算回合'
          : phase === 'enemy_action'
            ? '敌方行动回合'
            : phase === 'enemy_resolution'
              ? '敌方结算回合'
              : phase || '';
    }
    function updateBattlePhaseDisplay() {
      var phaseEl = document.getElementById('battle-phase-display');
      var roundNumEl = document.getElementById('battle-round-number');
      var phaseLabelEl = document.getElementById('battle-round-phase');
      if (typeof window.BattleGrid === 'undefined') return;
      var round = window.BattleGrid.getBigRound();
      var phase = window.BattleGrid.getBattlePhase();
      var phaseLabel = getPhaseLabel(phase);
      if (phaseEl) phaseEl.textContent = '大回合 ' + round + ' · ' + phaseLabel;
      if (roundNumEl) roundNumEl.textContent = '第' + round + '回合';
      if (phaseLabelEl) phaseLabelEl.textContent = phaseLabel;
      syncBattleEndTurnButton();
    }
    function updateBattleFloorTitle() {
      var wrap = document.getElementById('battle-floor-title-wrap');
      var el = document.getElementById('battle-floor-title');
      if (!el || !wrap) return;
      var t = typeof getBattleFloorTitle === 'function' ? getBattleFloorTitle() : '';
      t = (t || '').toString().trim();
      el.textContent = t;
      wrap.style.display = t ? '' : 'none';
    }
    var PLAYER_BUFF_RESOLVE_MS = 100;
    /** 奉献：艾丽卡回合开始时对自身和敌方全体造成 Sta×1.0 神圣伤害。由打开技能弹窗时调用 tryTriggerErika奉献 触发。 */
    function tryTriggerErika奉献(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var erika = party && party[allySlot - 1];
      if (!erika || erika.name !== '艾丽卡' || isAllyDefeated(erika)) return;
      var sta = getDisplayStat(erika, 'sta') || 0;
      var baseDmg = Math.max(0, Math.floor(sta * 1.0));
      var enemyResults = [];
      for (var i = 0; i < (enemies || []).length; i++) {
        var en = enemies[i];
        if (!en || (en.hp != null && parseInt(en.hp, 10) <= 0)) continue;
        var res = resolveAttack(erika, en, baseDmg, true, { magicOnly: true });
        enemyResults.push({ index: i, defender: en, result: res });
      }
      function apply奉献Damage() {
        if (baseDmg > 0) {
          applyDamageToTarget(erika, baseDmg);
          appendCombatLog((erika.name || '艾丽卡') + ' 奉献：对自身造成 ' + baseDmg + ' 神圣伤害');
        }
        for (var j = 0; j < enemyResults.length; j++) {
          var en = enemyResults[j].defender;
          var res = enemyResults[j].result;
          applyDamageToTarget(en, res.finalDamage, res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined);
          appendCombatLog(
            (erika.name || '艾丽卡') + ' 奉献：对 ' + (en.name || '敌方') + ' 造成 ' + res.finalDamage + ' 神圣伤害',
          );
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
      }
      var enemySideEl = document.querySelector('.side-enemy');
      if (enemySideEl && (baseDmg > 0 || enemyResults.length > 0)) {
        playAnimationOnContainer(enemySideEl, 'Holy5', apply奉献Damage);
      } else {
        apply奉献Damage();
      }
    }
    /** 残暴动力：达芙妮解锁时，每次【重伤】造成伤害后为她回复该伤害 25% 的血量；若有回血则在该槽位播放绿色 +N */
    function healDaphneFor重伤Damage(party, damageFrom重伤) {
      if (!party || !Array.isArray(party) || damageFrom重伤 <= 0) return;
      for (var i = 0; i < party.length; i++) {
        var ch = party[i];
        if (!ch || (ch.name || '') !== '达芙妮') continue;
        var unlocked =
          ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
        if (unlocked.indexOf('残暴动力') === -1) continue;
        var sta = getDisplayStat(ch, 'sta') || 1;
        var maxHp = getHpFromSta(sta);
        var curHp = ch.hp != null ? parseInt(ch.hp, 10) : maxHp;
        if (curHp <= 0) continue;
        var heal = Math.floor(damageFrom重伤 * 0.25);
        if (heal > 0) {
          ch.hp = Math.min(maxHp, curHp + heal);
          var slotEl = document.querySelector('.slot[data-slot="ally-' + (i + 1) + '"]');
          if (slotEl) playHealEffect(slotEl, heal);
        }
        break;
      }
    }
    /** 玩家结算回合：按 1～6 号位依次结算己方单位身上的回合结束类 buff，每槽间隔 0.1s；onDone 可选，全部完成后调用 */
    function resolvePlayerBuffs(onDone) {
      var party = getParty();
      var enemies = getEnemyParty();
      run清漓沧澜潮汐End(party, enemies);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      /** 结算回合清空所有单位身上的【攻势】与【守势】与本回合攻势守势获得标记；若己方有昼墨且解锁心眼，回合开始获得2层攻势与2层守势。（见切·弹返在进入下一回合玩家行动时清除，以便怪物行动时护盾被打破能反击） */
      function clear攻势守势(p, e) {
        var i, u;
        if (p && p.length) {
          for (i = 0; i < p.length; i++) {
            u = p[i];
            if (u) {
              if (u.本回合已获得攻势守势) u.本回合已获得攻势守势 = false;
              if (u.name === '岚') {
                if (u.本回合用过近战) u.本回合用过近战 = false;
              }
              if (u.buffs && u.buffs.length)
                u.buffs = u.buffs.filter(function (x) {
                  var id = (x.id || x.name || '').trim();
                  return id !== '攻势' && id !== '守势' && id !== '锁定' && id !== '扑杀';
                });
            }
          }
          for (i = 0; i < p.length; i++) {
            u = p[i];
            if (u && u.name === '昼墨' && u.specialSkillsUnlocked && u.specialSkillsUnlocked.indexOf('心眼') !== -1) {
              addBuffLayers(u, '攻势', '攻势', 2);
              addBuffLayers(u, '守势', '守势', 2);
            }
          }
        }
        if (e && e.length) {
          for (i = 0; i < e.length; i++) {
            u = e[i];
            if (u && u.buffs && u.buffs.length)
              u.buffs = u.buffs.filter(function (x) {
                var id = (x.id || x.name || '').trim();
                return id !== '攻势' && id !== '守势' && id !== '锁定' && id !== '扑杀';
              });
          }
        }
      }
      clear攻势守势(party, enemies);
      function processSlot(slot) {
        if (slot > 6) {
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof onDone === 'function') onDone();
          return;
        }
        var unit = party[slot - 1];
        var heavyWoundDmg = 0;
        var regenHeal = 0;
        var damageDealt = 0;
        if (unit && unit.buffs && unit.buffs.length) {
          var hasVoid = unit.buffs.some(function (b) {
            return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
          });
          if (hasVoid) {
            processSlot(slot + 1);
            return;
          }
        }
        if (unit && unit.buffs && unit.buffs.length) {
          var sta = getDisplayStat(unit, 'sta') || 1;
          var maxHp = getHpFromSta(sta);
          var curHp = unit.hp != null ? parseInt(unit.hp, 10) : maxHp;
          var hpBefore = curHp;
          if (curHp > 0) {
            for (var b = 0; b < unit.buffs.length; b++) {
              var buff = unit.buffs[b];
              var id = (buff.id || buff.name || '').trim();
              var layers = Math.max(0, parseInt(buff.layers, 10) || 0);
              if (layers <= 0) continue;
              if (id === '再生') {
                var add = Math.min(layers, maxHp - curHp);
                var effRegen = apply丝伊德共生母胎HealMultiplier(unit, add);
                if (typeof getUnitBuffLayers === 'function' && getUnitBuffLayers(unit, '虚实颠倒') > 0) {
                  applyDamageToTarget(unit, effRegen, { skip虚实颠倒: true });
                  curHp = unit.hp != null ? parseInt(unit.hp, 10) : curHp;
                  if (typeof appendCombatLog === 'function')
                    appendCombatLog((unit.name || '友方') + ' 【虚实颠倒】【再生】治疗转为 ' + effRegen + ' 伤害');
                } else {
                  regenHeal += effRegen;
                  curHp = Math.min(maxHp, curHp + effRegen);
                }
                buff.layers = Math.max(0, layers - 5);
              } else if (id === '重伤' || id === '流血' || id === '燃烧' || id === '中毒') {
                if (id === '重伤') heavyWoundDmg += layers;
                curHp = Math.max(0, curHp - layers);
                buff.layers = Math.max(0, layers - 5);
              } else if (id === '嘲讽') {
                buff.layers = Math.max(0, layers - 1);
              } else if (
                id === '麻痹' ||
                id === '冻结' ||
                id === '暗蚀' ||
                id === '迟缓' ||
                id === '迟钝' ||
                id === '恍惚' ||
                id === '虚实颠倒' ||
                id === '灵巧' ||
                id === '专注' ||
                id === '精准' ||
                id === '残暴' ||
                id === '激励' ||
                id === '坚韧' ||
                id === '格挡' ||
                id === '扰魔' ||
                id === '虚弱' ||
                id === '脆弱' ||
                id === '破甲' ||
                id === '碎魔' ||
                id === '乏力'
              ) {
                buff.layers = Math.max(0, layers - 1);
              } else if (
                id === '力量强化' ||
                id === '敏捷强化' ||
                id === '智力强化' ||
                id === '攻击强化' ||
                id === '防御强化' ||
                id === '力量增幅' ||
                id === '敏捷增幅' ||
                id === '智力增幅' ||
                id === '防御增幅'
              ) {
                buff.layers = Math.max(0, layers - 1);
              } else if (id === '诗章') {
                buff.layers = Math.max(0, layers - 1);
              } else if (id === '星辰加速') {
                buff.layers = 0;
              }
            }
            unit.hp = curHp;
            damageDealt = Math.max(0, hpBefore - curHp);
            unit.buffs = unit.buffs.filter(function (x) {
              return (x.layers != null ? parseInt(x.layers, 10) || 0 : 0) > 0;
            });
            capUnitBuffs(unit);
            if (heavyWoundDmg > 0) healDaphneFor重伤Damage(party, heavyWoundDmg);
            if (regenHeal > 0) {
              var slotEl = document.querySelector('.slot[data-slot="ally-' + slot + '"]');
              if (slotEl) playHealEffect(slotEl, regenHeal);
            }
            if (damageDealt > 0) {
              var dmgSlotEl = document.querySelector('.slot[data-slot="ally-' + slot + '"]');
              if (dmgSlotEl) playHitEffect(dmgSlotEl, damageDealt);
            }
          }
        }
        if (slot < 6)
          setTimeout(function () {
            processSlot(slot + 1);
          }, PLAYER_BUFF_RESOLVE_MS);
        else
          setTimeout(function () {
            processSlot(7);
          }, PLAYER_BUFF_RESOLVE_MS);
      }
      processSlot(1);
    }
    /** 敌方行动：意图行（AI）+ 程序侧 服装破坏/猥亵/束缚/强制侵犯；无意图时回退单体/AOE/连击/防御。 */
    var ENEMY_ACTION_TYPES = {
      single_target: '单体攻击',
      aoe: '群体攻击',
      multi_hit: '连击',
      defense: '防御',
      prog_clothes_break: '服装破坏',
      prog_lewd_grope: '猥亵',
      prog_bind: '束缚',
      prog_forced_rape: '强制侵犯',
    };
    var ENEMY_ACTION_LABELS = ENEMY_ACTION_TYPES;
    function isEnemyFemaleForLewd(monster) {
      var g = monster && monster.gender != null ? String(monster.gender).toLowerCase().trim() : '';
      return g === 'female' || String(monster && monster.gender).trim() === '女';
    }
    function isTauntIntentLine(act, eff) {
      var a = (act || '').toLowerCase().trim();
      var e = (eff || '').toLowerCase().trim();
      return a === 'taunt' || e === 'taunt';
    }
    function allyHasBuffName(ally, buffName) {
      if (!ally || !buffName) return false;
      return (ally.buffs || []).some(function (b) {
        return (b.id === buffName || b.name === buffName) && (parseInt(b.layers, 10) || 0) > 0;
      });
    }
    function allyQualifiesForForcedRape(ally) {
      if (!ally) return false;
      if (allyHasBuffName(ally, '严重破损')) return true;
      var tag = (ally.outfitTag || ally.outfit || '').toString();
      return /泳装|舞娘|swimsuit|dancer/i.test(tag);
    }
    function getForcedRapeTargetSlots(party) {
      var t = getTargetableAllySlotsForEnemy(party);
      var out = [];
      for (var i = 0; i < t.length; i++) {
        var al = party[t[i] - 1];
        if (al && allyQualifiesForForcedRape(al)) out.push(t[i]);
      }
      return out;
    }
    function getOtherAliveEnemySlots(enemies, selfSlot) {
      if (!enemies) return [];
      var all = getTargetableEnemySlotIndices(enemies);
      var out = [];
      for (var i = 0; i < all.length; i++) {
        var s = all[i];
        if (s === selfSlot) continue;
        if (enemies[s - 1]) out.push(s);
      }
      return out;
    }
    function canExecuteIntentLine(intent, party, enemies, selfSlot) {
      if (!intent) return false;
      var tgt = (intent.target || '').toLowerCase();
      var act = (intent.action || '').toLowerCase();
      var eff = (intent.effect || '').toLowerCase();
      if (isTauntIntentLine(act, eff) && tgt === 'self') return true;
      if (tgt === 'player') return getTargetableAllySlotsForEnemy(party).length > 0;
      if (tgt === 'ally') return getOtherAliveEnemySlots(enemies, selfSlot).length > 0;
      return false;
    }
    function getClothingDamageTier(ally) {
      if (allyHasBuffName(ally, '严重破损')) return 3;
      if (allyHasBuffName(ally, '中度破损')) return 2;
      if (allyHasBuffName(ally, '轻微破损')) return 1;
      return 0;
    }
    function stripClothingDamageBuffs(ally) {
      ally.buffs = (ally.buffs || []).filter(function (b) {
        var id = b.id || b.name;
        return id !== '轻微破损' && id !== '中度破损' && id !== '严重破损';
      });
    }
    function bumpClothingDamageOneLevel(ally) {
      var t = getClothingDamageTier(ally);
      stripClothingDamageBuffs(ally);
      if (t === 0) addBuffLayers(ally, '轻微破损', '轻微破损', 1);
      else if (t === 1) addBuffLayers(ally, '中度破损', '中度破损', 1);
      else addBuffLayers(ally, '严重破损', '严重破损', 1);
    }
    function formatEnemyActionLabel(monster, actionType) {
      if (actionType.indexOf('intent:') === 0) {
        var ix = parseInt(actionType.split(':')[1], 10);
        var it = monster.intents && monster.intents[ix];
        if (!it) return '意图';
        var hint = (it.action || it.effect || '').slice(0, 20);
        return '意图#' + (ix + 1) + (hint ? '（' + hint + '）' : '');
      }
      return ENEMY_ACTION_TYPES[actionType] || actionType;
    }
    function pickWeightedEnemyAction(weights) {
      var keys = Object.keys(weights);
      var total = 0;
      for (var wi = 0; wi < keys.length; wi++) total += Math.max(0, parseInt(weights[keys[wi]], 10) || 0);
      if (total <= 0) return 'defense';
      var r = Math.random() * total;
      var acc = 0;
      for (var wj = 0; wj < keys.length; wj++) {
        var ww = Math.max(0, parseInt(weights[keys[wj]], 10) || 0);
        acc += ww;
        if (r < acc) return keys[wj];
      }
      return keys[keys.length - 1];
    }
    /** 正常项与色情项权重（总和 1000，组内均分）。随开局难度：普通 75%/25%，休闲 50%/50%，困难 90%/10%。正常项：可执行 intent:*、无意图时的单体/AOE/连击/防御。色情项：prog_clothes_break、prog_bind、prog_lewd_grope、prog_forced_rape（后两者仅非 female）。若当前池无色情项则全部为正常（100%）。 */
    function addEqualShareWeights(weights, keys, total) {
      var n = keys.length;
      if (n === 0 || total <= 0) return;
      var base = Math.floor(total / n);
      var rem = total - base * n;
      for (var i = 0; i < n; i++) {
        weights[keys[i]] = base + (i < rem ? 1 : 0);
      }
    }
    /** @returns {{ normal: number, lewd: number }} 二者之和为 1000 */
    function getDifficultyNormalLewdWeightSplit() {
      var d = '';
      try {
        if (typeof getVariables === 'function') {
          var v = getVariables({ type: 'chat' });
          if (v && v.difficulty != null) d = String(v.difficulty).trim();
        }
      } catch (eDiff) {}
      if (d === '休闲') return { normal: 500, lewd: 500 };
      if (d === '困难') return { normal: 900, lewd: 100 };
      return { normal: 750, lewd: 250 };
    }
    function buildEnemyActionWeights(monster, party, enemies, enemySlotNum) {
      var normalKeys = [];
      var lewdKeys = [];
      var intents = monster.intents || [];
      var isFemale = isEnemyFemaleForLewd(monster);
      var hasPlayers = getTargetableAllySlotsForEnemy(party).length > 0;
      var hasForcedTarget = getForcedRapeTargetSlots(party).length > 0;
      if (intents.length > 0) {
        for (var ii = 0; ii < intents.length; ii++) {
          if (canExecuteIntentLine(intents[ii], party, enemies, enemySlotNum)) normalKeys.push('intent:' + ii);
        }
        if (hasPlayers) {
          lewdKeys.push('prog_clothes_break');
          lewdKeys.push('prog_bind');
        }
        if (!isFemale && hasPlayers) lewdKeys.push('prog_lewd_grope');
        if (!isFemale && hasPlayers && hasForcedTarget) lewdKeys.push('prog_forced_rape');
      } else {
        normalKeys.push('single_target', 'aoe', 'multi_hit', 'defense');
        if (hasPlayers) {
          lewdKeys.push('prog_clothes_break');
          lewdKeys.push('prog_bind');
        }
        if (!isFemale && hasPlayers) lewdKeys.push('prog_lewd_grope');
        if (!isFemale && hasPlayers && hasForcedTarget) lewdKeys.push('prog_forced_rape');
      }
      var weights = {};
      var nN = normalKeys.length;
      var nL = lewdKeys.length;
      if (nN === 0 && nL === 0) {
        weights.defense = 1;
        return weights;
      }
      if (nL === 0) {
        addEqualShareWeights(weights, normalKeys, 1000);
      } else if (nN === 0) {
        addEqualShareWeights(weights, lewdKeys, 1000);
      } else {
        var split = getDifficultyNormalLewdWeightSplit();
        addEqualShareWeights(weights, normalKeys, split.normal);
        addEqualShareWeights(weights, lewdKeys, split.lewd);
      }
      return weights;
    }
    function pickEnemyActionType(monster, battleCtx) {
      battleCtx = battleCtx || {};
      var party = battleCtx.party || getParty();
      var enemies = battleCtx.enemies || getEnemyParty();
      var slot = battleCtx.slot != null ? battleCtx.slot : 1;
      if (typeof window !== 'undefined' && typeof window.色色地牢_getEnemyActionType === 'function') {
        var custom = window.色色地牢_getEnemyActionType(monster, { party: party, enemies: enemies, slot: slot });
        if (custom && (ENEMY_ACTION_TYPES[custom] || /^intent:\d+$/.test(custom))) return custom;
      }
      return pickWeightedEnemyAction(buildEnemyActionWeights(monster, party, enemies, slot));
    }

    /**
     * 玩家回合开始时为每个存活敌方锁定本回合行动（敌方行动阶段按此执行，不写入存档）。
     */
    function planEnemyActionsForRound() {
      var party = getParty();
      var enemies = getEnemyParty();
      for (var s = 1; s <= 6; s++) {
        battleState.plannedEnemyActions[s - 1] = null;
        var e = enemies[s - 1];
        if (!e || (parseInt(e.hp, 10) || 0) <= 0) continue;
        battleState.plannedEnemyActions[s - 1] = pickEnemyActionType(e, { party: party, enemies: enemies, slot: s });
      }
    }

    function getIntentColorFromAction(monster, actionType) {
      if (!actionType) return 'red';
      if (
        actionType === 'prog_clothes_break' ||
        actionType === 'prog_bind' ||
        actionType === 'prog_forced_rape' ||
        actionType === 'prog_lewd_grope'
      )
        return 'pink';
      if (actionType.indexOf('intent:') === 0) {
        var iix = parseInt(actionType.split(':')[1], 10);
        var it0 = monster.intents && monster.intents[iix];
        if (it0) {
          var tgt0 = (it0.target || '').toLowerCase();
          if (tgt0 === 'self') return 'green';
          if (tgt0 === 'ally') return 'blue';
        }
        return 'red';
      }
      if (actionType === 'defense') return 'green';
      return 'red';
    }

    function buildEnemyIntentNumsText(monster, actionType) {
      if (actionType && actionType.indexOf('intent:') === 0) {
        var iix2 = parseInt(actionType.split(':')[1], 10);
        var it1 = monster.intents && monster.intents[iix2];
        if (it1) {
          var a = it1.param1 != null && String(it1.param1).trim() !== '' ? String(it1.param1).trim() : '';
          var b = it1.param2 != null && String(it1.param2).trim() !== '' ? String(it1.param2).trim() : '';
          if (a && b) return a + b;
          if (a) return a;
          if (b) return b;
        }
      }
      return '';
    }

    function getIntentIconInnerHtml(monster, actionType) {
      var atkSvg = SKILL_ATTACK_SVG || '';
      var defSvg = SKILL_DEFENSE_SVG || '';
      if (actionType && actionType.indexOf('intent:') === 0) {
        var iix3 = parseInt(actionType.split(':')[1], 10);
        var it2 = monster.intents && monster.intents[iix3];
        if (it2) {
          var act0 = (it2.action || '').toLowerCase();
          var eff0 = (it2.effect || '').toLowerCase();
          if (act0 === 'taunt' || eff0 === 'taunt') return defSvg;
          if (act0 === 'attack' || act0 === 'multi_attack') return atkSvg;
          if (act0 === 'debuff')
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';
          if (act0 === 'buff' || act0 === 'heal')
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"/></svg>';
        }
      }
      switch (actionType) {
        case 'single_target':
        case 'multi_hit':
          return atkSvg;
        case 'prog_clothes_break':
          return INTENT_CLOTHES_BREAK_SVG || atkSvg;
        case 'aoe':
          return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
        case 'defense':
          return defSvg;
        case 'prog_bind':
          return INTENT_BIND_CHAIN_SVG || atkSvg;
        case 'prog_forced_rape':
        case 'prog_lewd_grope':
          return INTENT_LEWD_HEART_SVG || atkSvg;
        default:
          return atkSvg;
      }
    }

    function buildEnemyIntentRibbonHtml(monster, actionType) {
      if (!actionType) return '';
      var color = getIntentColorFromAction(monster, actionType);
      var cls = 'enemy-intent-chip enemy-intent-chip--' + color;
      var nums = buildEnemyIntentNumsText(monster, actionType) || '';
      var numsHtml = nums
        ? '<span class="enemy-intent-nums">' + nums.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>'
        : '';
      var iconHtml = '<span class="enemy-intent-icon">' + getIntentIconInnerHtml(monster, actionType) + '</span>';
      var title = formatEnemyActionLabel(monster, actionType);
      return (
        '<span class="' +
        cls +
        '" title="' +
        title.replace(/"/g, '&quot;').replace(/</g, '&lt;') +
        '">' +
        numsHtml +
        iconHtml +
        '</span>'
      );
    }

    /** 执行 enemy_design 第 idx 条意图 */
    function applyEnemyIntentByIndex(monster, idx, party, enemies, enemySlotNum, onDone) {
      onDone = typeof onDone === 'function' ? onDone : function () {};
      var it = monster.intents && monster.intents[idx];
      if (!it) {
        onDone();
        return;
      }
      var tgt = (it.target || '').toLowerCase();
      var scope = (it.scope || '').toLowerCase();
      var act = (it.action || '').toLowerCase();
      var eff = (it.effect || '').toLowerCase();
      var p1 = it.param1;
      var p2 = it.param2;
      var name = monster.name || '敌方';
      var atk = Math.max(0, parseInt(monster.atk, 10) || 0);
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      if (isTauntIntentLine(act, eff) && tgt === 'self') {
        var tl = 2;
        if (
          typeof window !== 'undefined' &&
          window.色色地牢_enemyDesign &&
          window.色色地牢_enemyDesign.TAUNT_LAYERS_FIXED != null
        )
          tl = window.色色地牢_enemyDesign.TAUNT_LAYERS_FIXED;
        addBuffLayers(monster, '嘲讽', '嘲讽', tl);
        appendCombatLog(name + ' 对自身施加【嘲讽】' + tl + '层');
        function ft() {
          saveBattleData(party, enemies);
          renderEnemySlots(enemies);
          onDone({ partyChanged: false });
        }
        if (enemySlotEl) playAnimationOnSlot(enemySlotEl, 'Recovery4', ft);
        else ft();
        return;
      }
      if (tgt === 'player' && scope === 'single' && act === 'attack') {
        var tA = getTargetableAllySlotsForEnemy(party);
        if (tA.length === 0) {
          onDone({ partyChanged: false });
          return;
        }
        var ts = tA[Math.floor(Math.random() * tA.length)];
        ts = tryRedirect月见遥完美谎言(ts, party);
        var ally = party[ts - 1];
        var baseDmg = Math.max(1, parseInt(p1, 10) || Math.floor(atk * 0.85));
        var result = resolveAttack(monster, ally, baseDmg, false);
        var allySlotEl = document.querySelector('.slot[data-slot="ally-' + ts + '"]');
        function afterDmg() {
          applyDamageToAllyAndTry弹返(ally, monster, result.finalDamage);
          appendCombatLog(
            formatAttackLogLine(name, '单体攻击（意图）', ally.name || '己方', result, baseDmg, '攻击', null, ally.hp),
          );
          if (!result.hit && ally.name === '黯') try残影步Counter(ally, monster, party, enemies, enemySlotNum);
          if (!result.hit && ally.name === '岚' && ally.影舞反击)
            try岚影舞Counter(ally, monster, party, enemies, enemySlotNum);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          onDone();
        }
        if (enemySlotEl && allySlotEl) {
          playStrikeShake(enemySlotEl, allySlotEl, function () {
            playSlashOnSlot(allySlotEl, result.hit, afterDmg);
          });
        } else afterDmg();
        return;
      }
      /** 对己方单体多段伤害（与 aoe+multi_attack 区分：aoe=可每段换目标，single=锁定同一目标） */
      if (tgt === 'player' && scope === 'single' && act === 'multi_attack') {
        var perHitS = Math.max(1, parseInt(p1, 10) || 4);
        var hitsS = Math.max(1, parseInt(p2, 10) || 3);
        var taS = getTargetableAllySlotsForEnemy(party);
        if (taS.length === 0) {
          onDone({ partyChanged: false });
          return;
        }
        var lockSlot = tryRedirect月见遥完美谎言(taS[Math.floor(Math.random() * taS.length)], party);
        var mIdxS = 0;
        function nextHitSingle() {
          if (mIdxS >= hitsS) {
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            onDone();
            return;
          }
          var taCheck = getTargetableAllySlotsForEnemy(party);
          if (taCheck.indexOf(lockSlot) === -1) {
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            onDone();
            return;
          }
          var alS = party[lockSlot - 1];
          if (!alS || (parseInt(alS.hp, 10) || 0) <= 0) {
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            onDone();
            return;
          }
          var resS = resolveAttack(monster, alS, perHitS, false);
          var elS = document.querySelector('.slot[data-slot="ally-' + lockSlot + '"]');
          function applyOneS() {
            applyDamageToAllyAndTry弹返(alS, monster, resS.finalDamage);
            appendCombatLog(
              formatAttackLogLine(
                name,
                '单体多段攻击（意图）',
                alS.name || '己方',
                resS,
                perHitS,
                '攻击',
                null,
                alS.hp,
              ),
            );
            if (!resS.hit && alS.name === '黯') try残影步Counter(alS, monster, party, enemies, enemySlotNum);
            if (!resS.hit && alS.name === '岚' && alS.影舞反击)
              try岚影舞Counter(alS, monster, party, enemies, enemySlotNum);
            mIdxS++;
            setTimeout(nextHitSingle, 220);
          }
          if (elS && enemySlotEl) {
            playStrikeShake(enemySlotEl, elS, function () {
              playSlashOnSlot(elS, resS.hit, applyOneS);
            });
          } else applyOneS();
        }
        nextHitSingle();
        return;
      }
      if (tgt === 'player' && scope === 'aoe' && act === 'multi_attack') {
        var perHit = Math.max(1, parseInt(p1, 10) || 4);
        var hits = Math.max(1, parseInt(p2, 10) || 3);
        var mIdx = 0;
        function nextHit() {
          if (mIdx >= hits) {
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            onDone();
            return;
          }
          var ta = getTargetableAllySlotsForEnemy(party);
          if (ta.length === 0) {
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            onDone();
            return;
          }
          var slot = tryRedirect月见遥完美谎言(ta[Math.floor(Math.random() * ta.length)], party);
          var al = party[slot - 1];
          var res = resolveAttack(monster, al, perHit, false);
          var el = document.querySelector('.slot[data-slot="ally-' + slot + '"]');
          function applyOne() {
            applyDamageToAllyAndTry弹返(al, monster, res.finalDamage);
            appendCombatLog(
              formatAttackLogLine(name, 'AOE多段攻击（意图）', al.name || '己方', res, perHit, '攻击', null, al.hp),
            );
            if (!res.hit && al.name === '黯') try残影步Counter(al, monster, party, enemies, enemySlotNum);
            if (!res.hit && al.name === '岚' && al.影舞反击)
              try岚影舞Counter(al, monster, party, enemies, enemySlotNum);
            mIdx++;
            setTimeout(nextHit, 220);
          }
          if (el && enemySlotEl) {
            playStrikeShake(enemySlotEl, el, function () {
              playSlashOnSlot(el, res.hit, applyOne);
            });
          } else applyOne();
        }
        nextHit();
        return;
      }
      if (tgt === 'player' && scope === 'single' && act === 'debuff') {
        var tD = getTargetableAllySlotsForEnemy(party);
        if (tD.length === 0) {
          onDone({ partyChanged: false });
          return;
        }
        var ds = tD[Math.floor(Math.random() * tD.length)];
        var alD = party[ds - 1];
        var debuffLayers = Math.max(1, parseInt(p1, 10) || 2);
        if (eff === 'vulnerability' || eff === '') addBuffLayers(alD, '脆弱', '脆弱', debuffLayers);
        else addBuffLayers(alD, '虚弱', '虚弱', debuffLayers);
        appendCombatLog(
          name +
            ' 对 ' +
            (alD.name || '己方') +
            ' 施加【' +
            (eff === 'vulnerability' || eff === '' ? '脆弱' : '虚弱') +
            '】' +
            debuffLayers +
            '层',
        );
        var elD = document.querySelector('.slot[data-slot="ally-' + ds + '"]');
        function fd() {
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          onDone();
        }
        if (enemySlotEl && elD) playAnimationOnSlot(enemySlotEl, 'Recovery4', fd);
        else fd();
        return;
      }
      if (tgt === 'ally' && scope === 'aoe' && act === 'buff') {
        var oSlots = getOtherAliveEnemySlots(enemies, enemySlotNum);
        if (oSlots.length === 0) {
          onDone({ partyChanged: false });
          return;
        }
        var bl = Math.max(1, parseInt(p1, 10) || 1);
        var buffId = '力量强化';
        if (eff && eff.indexOf('strength') === -1 && eff !== 'strength_up' && eff !== '') buffId = '攻击强化';
        for (var oi = 0; oi < oSlots.length; oi++) {
          var eu = enemies[oSlots[oi] - 1];
          if (eu) addBuffLayers(eu, buffId, buffId, bl);
        }
        appendCombatLog(name + ' 对友方全体施加【' + buffId + '】' + bl + '层');
        function fb() {
          saveBattleData(party, enemies);
          renderEnemySlots(enemies);
          onDone({ partyChanged: false });
        }
        if (enemySlotEl) playAnimationOnSlot(enemySlotEl, 'Recovery4', fb);
        else fb();
        return;
      }
      /** 对单个友方怪上 buff（与 aoe 区分：single=随机一名其它敌方） */
      if (tgt === 'ally' && scope === 'single' && act === 'buff') {
        var oSlots1 = getOtherAliveEnemySlots(enemies, enemySlotNum);
        if (oSlots1.length === 0) {
          onDone({ partyChanged: false });
          return;
        }
        var pickB = oSlots1[Math.floor(Math.random() * oSlots1.length)];
        var eu1 = enemies[pickB - 1];
        var bl1 = Math.max(1, parseInt(p1, 10) || 1);
        var effLower = (eff || '').toLowerCase();
        var buffId1 = '力量强化';
        if (effLower === 'regeneration' || effLower.indexOf('regen') !== -1) buffId1 = '再生';
        else if (effLower === 'strength_up' || effLower.indexOf('strength') !== -1) buffId1 = '力量强化';
        else if (effLower.indexOf('attack') !== -1) buffId1 = '攻击强化';
        if (eu1) addBuffLayers(eu1, buffId1, buffId1, bl1);
        appendCombatLog(
          name + ' 对友方「' + (eu1 && eu1.name ? eu1.name : '') + '」施加【' + buffId1 + '】' + bl1 + '层',
        );
        function fb1() {
          saveBattleData(party, enemies);
          renderEnemySlots(enemies);
          onDone({ partyChanged: false });
        }
        if (enemySlotEl) playAnimationOnSlot(enemySlotEl, 'Recovery4', fb1);
        else fb1();
        return;
      }
      if (tgt === 'ally' && scope === 'single' && act === 'heal') {
        var hSlots = getOtherAliveEnemySlots(enemies, enemySlotNum);
        if (hSlots.length === 0) {
          onDone({ partyChanged: false });
          return;
        }
        var hs = hSlots[Math.floor(Math.random() * hSlots.length)];
        var he = enemies[hs - 1];
        var hv = Math.max(1, parseInt(p1, 10) || 10);
        var hvEff = apply丝伊德共生母胎HealMultiplier(he, hv);
        var curHp = parseInt(he.hp, 10) || 0;
        var mxHp = parseInt(he.maxHp, 10) || curHp || 1;
        he.hp = Math.min(mxHp, curHp + hvEff);
        appendCombatLog(name + ' 治疗友方「' + (he.name || '') + '」回复 ' + hvEff + ' HP');
        function fh() {
          saveBattleData(party, enemies);
          renderEnemySlots(enemies);
          onDone({ partyChanged: false });
        }
        if (enemySlotEl) playAnimationOnSlot(enemySlotEl, 'Recovery4', fh);
        else fh();
        return;
      }
      if (tgt === 'player' && getTargetableAllySlotsForEnemy(party).length > 0) {
        var tA2 = getTargetableAllySlotsForEnemy(party);
        var ts2 = tA2[Math.floor(Math.random() * tA2.length)];
        var ally2 = party[ts2 - 1];
        var baseDmg2 = Math.max(1, Math.floor(atk * 0.85));
        var res2 = resolveAttack(monster, ally2, baseDmg2, false);
        applyDamageToAllyAndTry弹返(ally2, monster, res2.finalDamage);
        appendCombatLog(
          formatAttackLogLine(
            name,
            '单体攻击（意图回退）',
            ally2.name || '己方',
            res2,
            baseDmg2,
            '攻击',
            null,
            ally2.hp,
          ),
        );
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        onDone();
        return;
      }
      onDone({ partyChanged: false });
    }
    function applyProgClothesBreak(monster, party, enemies, enemySlotNum, onDone) {
      onDone = typeof onDone === 'function' ? onDone : function () {};
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var atk = Math.max(0, parseInt(monster.atk, 10) || 0);
      var name = monster.name || '敌方';
      var targetable = getTargetableAllySlotsForEnemy(party);
      if (targetable.length === 0) {
        onDone({ partyChanged: false });
        return;
      }
      var targetSlot = targetable[Math.floor(Math.random() * targetable.length)];
      var ally = party[targetSlot - 1];
      var baseDmg = Math.max(1, Math.floor(atk * 0.3));
      var result = resolveAttack(monster, ally, baseDmg, false);
      var allySlotEl = document.querySelector('.slot[data-slot="ally-' + targetSlot + '"]');
      function afterCloth() {
        applyDamageToAllyAndTry弹返(ally, monster, result.finalDamage);
        if (result.hit) bumpClothingDamageOneLevel(ally);
        appendCombatLog(
          name +
            ' 「服装破坏」对 ' +
            (ally.name || '己方') +
            ' 造成 ' +
            result.finalDamage +
            ' 伤害' +
            (result.hit ? '，服装破损+1级' : ''),
        );
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        onDone();
      }
      if (enemySlotEl && allySlotEl) {
        playStrikeShake(enemySlotEl, allySlotEl, function () {
          playSlashOnSlot(allySlotEl, result.hit, afterCloth);
        });
      } else afterCloth();
    }
    function applyProgLewdGrope(monster, party, enemies, enemySlotNum, onDone) {
      onDone = typeof onDone === 'function' ? onDone : function () {};
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var name = monster.name || '敌方';
      var targetable = getTargetableAllySlotsForEnemy(party);
      if (targetable.length === 0) {
        onDone({ partyChanged: false });
        return;
      }
      var lewdSlot = targetable[Math.floor(Math.random() * targetable.length)];
      var lewdAlly = party[lewdSlot - 1];
      var edSemen = typeof window !== 'undefined' ? window.色色地牢_enemyDesign : null;
      var mlAdd =
        edSemen && typeof edSemen.rollSemenMlForBodySize === 'function'
          ? edSemen.rollSemenMlForBodySize(monster.bodySize || 'medium')
          : 0;
      if (lewdAlly) {
        var prevMl = parseFloat(lewdAlly.semenVolumeMl);
        if (isNaN(prevMl)) prevMl = 0;
        lewdAlly.semenVolumeMl = Math.min(MAX_SEMEN_ML, prevMl + mlAdd);
      }
      appendCombatLog(
        name +
          ' 「猥亵」对 ' +
          (lewdAlly && lewdAlly.name ? lewdAlly.name : '己方') +
          '（体表精液 +' +
          mlAdd +
          'ml，累计 ' +
          (lewdAlly && lewdAlly.semenVolumeMl != null ? lewdAlly.semenVolumeMl : 0) +
          'ml）',
      );
      var lewdAllyEl = document.querySelector('.slot[data-slot="ally-' + lewdSlot + '"]');
      function finishLewd() {
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        onDone();
      }
      if (enemySlotEl && lewdAllyEl) {
        playAnimationOnSlot(enemySlotEl, 'Recovery4', function () {
          finishLewd();
        });
      } else finishLewd();
    }
    function applyProgBind(monster, party, enemies, enemySlotNum, onDone) {
      onDone = typeof onDone === 'function' ? onDone : function () {};
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var name = monster.name || '敌方';
      var targetable = getTargetableAllySlotsForEnemy(party);
      if (targetable.length === 0) {
        onDone({ partyChanged: false });
        return;
      }
      var slot = targetable[Math.floor(Math.random() * targetable.length)];
      var ally = party[slot - 1];
      addBuffLayers(ally, '眩晕', '眩晕', 1);
      appendCombatLog(name + ' 「束缚」对 ' + (ally.name || '己方') + ' 施加1层【眩晕】');
      var allyEl = document.querySelector('.slot[data-slot="ally-' + slot + '"]');
      function fin() {
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        onDone();
      }
      if (enemySlotEl && allyEl) playAnimationOnSlot(enemySlotEl, 'Recovery4', fin);
      else fin();
    }
    function applyProgForcedRape(monster, party, enemies, enemySlotNum, onDone) {
      onDone = typeof onDone === 'function' ? onDone : function () {};
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var name = monster.name || '敌方';
      var slots = getForcedRapeTargetSlots(party);
      if (slots.length === 0) {
        onDone({ partyChanged: false });
        return;
      }
      var targetSlot = slots[Math.floor(Math.random() * slots.length)];
      var ally = party[targetSlot - 1];
      addBuffLayers(ally, '眩晕', '眩晕', 1);
      var edSemen = typeof window !== 'undefined' ? window.色色地牢_enemyDesign : null;
      var ml1 =
        edSemen && typeof edSemen.rollSemenMlForBodySize === 'function'
          ? edSemen.rollSemenMlForBodySize(monster.bodySize || 'medium')
          : 0;
      var ml2 =
        edSemen && typeof edSemen.rollSemenMlForBodySize === 'function'
          ? edSemen.rollSemenMlForBodySize(monster.bodySize || 'medium')
          : 0;
      var prev = parseFloat(ally.semenVolumeMl);
      if (isNaN(prev)) prev = 0;
      ally.semenVolumeMl = Math.min(MAX_SEMEN_ML, prev + ml1 + ml2);
      appendCombatLog(
        name +
          ' 「强制侵犯」对 ' +
          (ally.name || '己方') +
          '：1层【眩晕】，下体/体内精液 +' +
          (ml1 + ml2) +
          'ml（累计 ' +
          ally.semenVolumeMl +
          'ml）',
      );
      var allyEl = document.querySelector('.slot[data-slot="ally-' + targetSlot + '"]');
      function fin2() {
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        onDone();
      }
      if (enemySlotEl && allyEl) playAnimationOnSlot(enemySlotEl, 'Recovery4', fin2);
      else fin2();
    }
    function applyEnemyAction(monster, actionType, party, enemies, enemySlotNum, onDone) {
      onDone = typeof onDone === 'function' ? onDone : function () {};
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var atk = Math.max(0, parseInt(monster.atk, 10) || 0);
      var def = Math.max(0, parseInt(monster.def, 10) || 0);
      var name = monster.name || '敌方';
      if (actionType === 'defense') {
        var shieldVal = Math.max(0, Math.floor(def * (0.8 + 0.4 * Math.random())));
        if (shieldVal > 0) {
          monster.currentShield =
            (monster.currentShield != null ? parseInt(monster.currentShield, 10) || 0 : 0) + shieldVal;
          addBuffLayers(monster, '护盾', '护盾', shieldVal);
          appendCombatLog(name + ' 使用防御，获得 ' + shieldVal + ' 点护盾');
          if (enemySlotEl) {
            playAnimationOnSlot(enemySlotEl, 'Recovery4', function () {
              onDone({ partyChanged: false });
            });
          } else {
            onDone({ partyChanged: false });
          }
        } else {
          onDone({ partyChanged: false });
        }
        return;
      }
      if (actionType.indexOf('intent:') === 0) {
        var iidx = parseInt(actionType.split(':')[1], 10);
        applyEnemyIntentByIndex(monster, iidx, party, enemies, enemySlotNum, onDone);
        return;
      }
      if (actionType === 'prog_clothes_break') {
        applyProgClothesBreak(monster, party, enemies, enemySlotNum, onDone);
        return;
      }
      if (actionType === 'prog_lewd_grope') {
        applyProgLewdGrope(monster, party, enemies, enemySlotNum, onDone);
        return;
      }
      if (actionType === 'prog_bind') {
        applyProgBind(monster, party, enemies, enemySlotNum, onDone);
        return;
      }
      if (actionType === 'prog_forced_rape') {
        applyProgForcedRape(monster, party, enemies, enemySlotNum, onDone);
        return;
      }
      var targetable = getTargetableAllySlotsForEnemy(party);
      if (targetable.length === 0) {
        onDone({ partyChanged: false });
        return;
      }
      if (actionType === 'single_target') {
        var targetSlot = targetable[Math.floor(Math.random() * targetable.length)];
        var ally = party[targetSlot - 1];
        var baseDmg = Math.max(1, Math.floor(atk * (0.8 + 0.4 * Math.random())));
        var result = resolveAttack(monster, ally, baseDmg, false);
        var allySlotEl = document.querySelector('.slot[data-slot="ally-' + targetSlot + '"]');
        if (enemySlotEl && allySlotEl) {
          playStrikeShake(enemySlotEl, allySlotEl, function () {
            playSlashOnSlot(allySlotEl, result.hit, function () {
              applyDamageToAllyAndTry弹返(ally, monster, result.finalDamage);
              var allyName = ally.name || '己方';
              var singleMult = atk > 0 ? (baseDmg / atk).toFixed(2) : null;
              appendCombatLog(
                formatAttackLogLine(name, '单体攻击', allyName, result, baseDmg, '攻击', singleMult, ally.hp),
              );
              if (!result.hit && ally.name === '黯') try残影步Counter(ally, monster, party, enemies, enemySlotNum);
              if (!result.hit && ally.name === '岚' && ally.影舞反击)
                try岚影舞Counter(ally, monster, party, enemies, enemySlotNum);
              saveBattleData(party, enemies);
              renderAllySlots(party);
              renderEnemySlots(enemies);
              if (!result.hit) playMissEffect(allySlotEl);
              onDone();
            });
          });
        } else {
          applyDamageToAllyAndTry弹返(ally, monster, result.finalDamage);
          appendCombatLog(
            formatAttackLogLine(
              name,
              '单体攻击',
              ally.name || '己方',
              result,
              baseDmg,
              '攻击',
              atk > 0 ? (baseDmg / atk).toFixed(2) : null,
              ally.hp,
            ),
          );
          if (!result.hit && ally.name === '黯') try残影步Counter(ally, monster, party, enemies, enemySlotNum);
          if (!result.hit && ally.name === '岚' && ally.影舞反击)
            try岚影舞Counter(ally, monster, party, enemies, enemySlotNum);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          onDone();
        }
        return;
      }
      if (actionType === 'aoe') {
        var aoeMult = 0.3 + 0.2 * Math.random();
        var aoeResults = [];
        for (var s = 0; s < targetable.length; s++) {
          var aoeAlly = party[targetable[s] - 1];
          if (!aoeAlly || (parseInt(aoeAlly.hp, 10) || 0) <= 0) continue;
          var aoeDmg = Math.max(1, Math.floor(atk * aoeMult));
          var aoeRes = resolveAttack(monster, aoeAlly, aoeDmg, false);
          aoeResults.push({ slotNum: targetable[s], ally: aoeAlly, result: aoeRes, baseDmg: aoeDmg });
        }
        if (enemySlotEl && aoeResults.length > 0) {
          playStrikeShake(enemySlotEl, null, function () {
            var idx = 0;
            function nextAoe() {
              if (idx >= aoeResults.length) {
                for (var s = 0; s < aoeResults.length; s++) {
                  var logItem = aoeResults[s];
                  var aoeMultStr = atk > 0 ? (logItem.baseDmg / atk).toFixed(2) : null;
                  appendCombatLog(
                    formatAttackLogLine(
                      name,
                      '群体攻击',
                      logItem.ally.name || '己方',
                      logItem.result,
                      logItem.baseDmg,
                      '攻击',
                      aoeMultStr,
                      logItem.ally.hp,
                    ),
                  );
                }
                onDone();
                return;
              }
              var item = aoeResults[idx];
              var slotNum = item.slotNum;
              var res = item.result;
              var slotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
              if (slotEl) {
                playSlashOnSlot(slotEl, res.hit, function () {
                  applyDamageToAllyAndTry弹返(item.ally, monster, res.finalDamage);
                  if (!res.hit && item.ally.name === '黯')
                    try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
                  if (!res.hit && item.ally.name === '岚' && item.ally.影舞反击)
                    try岚影舞Counter(item.ally, monster, party, enemies, enemySlotNum);
                  saveBattleData(party, enemies);
                  renderAllySlots(party);
                  renderEnemySlots(enemies);
                  if (!res.hit) playMissEffect(slotEl);
                  idx++;
                  setTimeout(nextAoe, 220);
                });
              } else {
                applyDamageToAllyAndTry弹返(item.ally, monster, res.finalDamage);
                if (!res.hit && item.ally.name === '黯')
                  try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
                if (!res.hit && item.ally.name === '岚' && item.ally.影舞反击)
                  try岚影舞Counter(item.ally, monster, party, enemies, enemySlotNum);
                idx++;
                setTimeout(nextAoe, 0);
              }
            }
            nextAoe();
          });
        } else {
          for (var s = 0; s < aoeResults.length; s++) {
            var aoeItem = aoeResults[s];
            applyDamageToAllyAndTry弹返(aoeItem.ally, monster, aoeItem.result.finalDamage);
            if (!aoeItem.result.hit && aoeItem.ally.name === '黯')
              try残影步Counter(aoeItem.ally, monster, party, enemies, enemySlotNum);
            if (!aoeItem.result.hit && aoeItem.ally.name === '岚' && aoeItem.ally.影舞反击)
              try岚影舞Counter(aoeItem.ally, monster, party, enemies, enemySlotNum);
          }
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          onDone();
        }
        return;
      }
      if (actionType === 'multi_hit') {
        var hits = 2 + Math.floor(Math.random() * 3);
        var hitMult = 0.3 + 0.2 * Math.random();
        var multiResults = [];
        for (var h = 0; h < hits; h++) {
          targetable = getTargetableAllySlotsForEnemy(party);
          if (targetable.length === 0) break;
          var tIdx = Math.floor(Math.random() * targetable.length);
          var multiAlly = party[targetable[tIdx] - 1];
          if (!multiAlly) continue;
          var multiDmg = Math.max(1, Math.floor(atk * hitMult));
          var multiRes = resolveAttack(monster, multiAlly, multiDmg, false);
          multiResults.push({ slotNum: targetable[tIdx], ally: multiAlly, result: multiRes, baseDmg: multiDmg });
        }
        if (enemySlotEl && multiResults.length > 0) {
          var mIdx = 0;
          function nextMulti() {
            if (mIdx >= multiResults.length) {
              onDone();
              return;
            }
            var item = multiResults[mIdx];
            var mSlotNum = item.slotNum;
            var mRes = item.result;
            var mSlotEl = document.querySelector('.slot[data-slot="ally-' + mSlotNum + '"]');
            if (mSlotEl) {
              playStrikeShake(enemySlotEl, mSlotEl, function () {
                playSlashOnSlot(mSlotEl, mRes.hit, function () {
                  applyDamageToAllyAndTry弹返(item.ally, monster, item.result.finalDamage);
                  var multiMultStr = atk > 0 ? (item.baseDmg / atk).toFixed(2) : null;
                  appendCombatLog(
                    formatAttackLogLine(
                      name,
                      '连击',
                      item.ally.name || '己方',
                      item.result,
                      item.baseDmg,
                      '攻击',
                      multiMultStr,
                      item.ally.hp,
                    ),
                  );
                  if (!mRes.hit && item.ally.name === '黯')
                    try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
                  if (!mRes.hit && item.ally.name === '岚' && item.ally.影舞反击)
                    try岚影舞Counter(item.ally, monster, party, enemies, enemySlotNum);
                  saveBattleData(party, enemies);
                  renderAllySlots(party);
                  renderEnemySlots(enemies);
                  if (!mRes.hit) playMissEffect(mSlotEl);
                  mIdx++;
                  setTimeout(nextMulti, 220);
                });
              });
            } else {
              applyDamageToAllyAndTry弹返(item.ally, monster, item.result.finalDamage);
              if (!item.result.hit && item.ally.name === '黯')
                try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
              if (!item.result.hit && item.ally.name === '岚' && item.ally.影舞反击)
                try岚影舞Counter(item.ally, monster, party, enemies, enemySlotNum);
              saveBattleData(party, enemies);
              renderAllySlots(party);
              renderEnemySlots(enemies);
              mIdx++;
              setTimeout(nextMulti, 0);
            }
          }
          nextMulti();
        } else {
          for (var h = 0; h < multiResults.length; h++) {
            var mItem = multiResults[h];
            applyDamageToAllyAndTry弹返(mItem.ally, monster, mItem.result.finalDamage);
            if (!mItem.result.hit && mItem.ally.name === '黯')
              try残影步Counter(mItem.ally, monster, party, enemies, enemySlotNum);
            if (!mItem.result.hit && mItem.ally.name === '岚' && mItem.ally.影舞反击)
              try岚影舞Counter(mItem.ally, monster, party, enemies, enemySlotNum);
          }
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          onDone();
        }
      } else {
        onDone();
      }
    }
    var ENEMY_ACTION_WAIT_MS = 500;
    /** 敌方行动回合：1～6 号位严格依次行动，每怪行动后保存并刷新界面，再等 0.5s 进行下一怪；onDone 可选 */
    function resolveEnemyActions(onDone) {
      var party = getParty();
      var enemies = getEnemyParty();
      var totalSlots = 0;
      var aliveCount = 0;
      for (var i = 0; i < 6; i++) {
        if (enemies[i]) totalSlots++;
        if (enemies[i] && (parseInt(enemies[i].hp, 10) || 0) > 0) aliveCount++;
      }
      console.info('[战斗] 敌方行动：6 槽位，' + totalSlots + ' 有单位，' + aliveCount + ' 存活');
      function processSlot(slot) {
        if (slot > 6) {
          if (typeof onDone === 'function') onDone();
          return;
        }
        var enemy = enemies[slot - 1];
        function goNextSlot() {
          setTimeout(function () {
            if (slot < 6) processSlot(slot + 1);
            else if (typeof onDone === 'function') onDone();
          }, ENEMY_ACTION_WAIT_MS);
        }
        if (!enemy) {
          console.info('[战斗] ' + slot + '号位 无单位 跳过');
          goNextSlot();
          return;
        }
        if ((parseInt(enemy.hp, 10) || 0) <= 0) {
          console.info('[战斗] ' + slot + '号位 ' + (enemy.name || '敌方') + ' 已倒下 跳过');
          goNextSlot();
          return;
        }
        if (tryConsume眩晕浪费行动(enemy)) {
          goNextSlot();
          return;
        }
        {
          var actionType =
            battleState.plannedEnemyActions[slot - 1] != null && battleState.plannedEnemyActions[slot - 1] !== ''
              ? battleState.plannedEnemyActions[slot - 1]
              : pickEnemyActionType(enemy, { party: party, enemies: enemies, slot: slot });
          console.info(
            '[战斗] ' +
              slot +
              '号位 ' +
              (enemy.name || '敌方') +
              ' 执行 ' +
              formatEnemyActionLabel(enemy, actionType),
          );
          function afterAction(opts) {
            saveBattleData(party, enemies);
            if (!(opts && opts.partyChanged === false)) renderAllySlots(party);
            renderEnemySlots(enemies);
            goNextSlot();
          }
          if (
            typeof window !== 'undefined' &&
            window.色色地牢_ENEMY_ACTION_HANDLERS &&
            typeof window.色色地牢_ENEMY_ACTION_HANDLERS[actionType] === 'function'
          ) {
            window.色色地牢_ENEMY_ACTION_HANDLERS[actionType](enemy, party, enemies, slot, {
              resolveAttack: resolveAttack,
              addBuffLayers: addBuffLayers,
              getTargetableSlotIndices: getTargetableSlotIndices,
              getDisplayStat: getDisplayStat,
              getHpFromSta: getHpFromSta,
              appendCombatLog: appendCombatLog,
              ENEMY_ACTION_TYPES: ENEMY_ACTION_TYPES,
            });
            afterAction();
          } else {
            applyEnemyAction(enemy, actionType, party, enemies, slot, afterAction);
          }
        }
      }
      processSlot(1);
    }
    var ENEMY_BUFF_RESOLVE_MS = 100;
    var ENEMY_BUFF_HIT_EFFECT_MS = 920;
    /** 敌方结算回合：按 1～6 号位依次结算敌方单位身上的回合结束类 buff，每槽打日志并播放掉血动画；onDone 可选 */
    function resolveEnemyBuffs(onDone) {
      var party = getParty();
      var enemies = getEnemyParty();
      function processSlot(slot) {
        if (slot > 6) {
          saveBattleData(party, enemies);
          renderEnemySlots(enemies);
          if (typeof onDone === 'function') onDone();
          return;
        }
        var unit = enemies[slot - 1];
        var unitName = unit && (unit.name || '敌方') ? unit.name || '敌方' : '空';
        console.info('[战斗] 敌方结算 ' + slot + '号位 ' + unitName + ' 结算buff');
        var damageDealt = 0;
        var heavyWoundDmg = 0;
        var regenHeal = 0;
        if (unit) {
          unit.buffs = unit.buffs || [];
          if (unit.buffs.length > 0) {
            var maxHp = unit.maxHp != null ? parseInt(unit.maxHp, 10) : 100;
            var curHp = unit.hp != null ? parseInt(unit.hp, 10) : maxHp;
            var hpBefore = curHp;
            if (curHp > 0) {
              for (var b = 0; b < unit.buffs.length; b++) {
                var buff = unit.buffs[b];
                var id = (buff.id || buff.name || '').trim();
                var layers = Math.max(0, parseInt(buff.layers, 10) || 0);
                if (layers <= 0) continue;
                var layersAfter =
                  id === '重伤' || id === '流血' || id === '燃烧' || id === '中毒'
                    ? Math.max(0, layers - 5)
                    : Math.max(0, layers - 1);
                if (id === '再生') {
                  var addE = Math.min(layers, maxHp - curHp);
                  var effRegenE = apply丝伊德共生母胎HealMultiplier(unit, addE);
                  if (typeof getUnitBuffLayers === 'function' && getUnitBuffLayers(unit, '虚实颠倒') > 0) {
                    applyDamageToTarget(unit, effRegenE, { skip虚实颠倒: true });
                    curHp = unit.hp != null ? parseInt(unit.hp, 10) : curHp;
                  } else {
                    regenHeal += effRegenE;
                    curHp = Math.min(maxHp, curHp + effRegenE);
                  }
                  buff.layers = layersAfter;
                  console.info(
                    '[战斗] 敌方结算 ' +
                      slot +
                      '号位 【' +
                      id +
                      '】恢复' +
                      layers +
                      '血 减1层 剩余' +
                      layersAfter +
                      '层',
                  );
                } else if (id === '重伤' || id === '流血' || id === '燃烧' || id === '中毒') {
                  if (id === '重伤') heavyWoundDmg += layers;
                  curHp = Math.max(0, curHp - layers);
                  buff.layers = layersAfter;
                  console.info(
                    '[战斗] 敌方结算 ' +
                      slot +
                      '号位 【' +
                      id +
                      '】造成' +
                      layers +
                      '伤害 减5层 剩余' +
                      layersAfter +
                      '层',
                  );
                } else if (
                  id === '嘲讽' ||
                  id === '麻痹' ||
                  id === '冻结' ||
                  id === '暗蚀' ||
                  id === '迟缓' ||
                  id === '迟钝' ||
                  id === '恍惚' ||
                  id === '虚实颠倒' ||
                  id === '灵巧' ||
                  id === '专注' ||
                  id === '精准' ||
                  id === '残暴' ||
                  id === '激励' ||
                  id === '坚韧' ||
                  id === '格挡' ||
                  id === '扰魔' ||
                  id === '虚弱' ||
                  id === '脆弱' ||
                  id === '破甲' ||
                  id === '碎魔' ||
                  id === '乏力'
                ) {
                  buff.layers = layersAfter;
                  console.info('[战斗] 敌方结算 ' + slot + '号位 【' + id + '】减1层 剩余' + layersAfter + '层');
                }
              }
              damageDealt = Math.max(0, hpBefore - curHp);
              unit.hp = curHp;
              if (curHp === 0) unit._justDefeated = true;
              if (heavyWoundDmg > 0) healDaphneFor重伤Damage(party, heavyWoundDmg);
            }
            unit.buffs = unit.buffs.filter(function (x) {
              return (x.layers != null ? parseInt(x.layers, 10) || 0 : 0) > 0;
            });
            capUnitBuffs(unit);
          }
        }
        saveBattleData(party, enemies);
        renderEnemySlots(enemies);
        if (damageDealt > 0) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + slot + '"]');
          if (slotEl) playHitEffect(slotEl, damageDealt);
        }
        if (regenHeal > 0) {
          var healSlotEl = document.querySelector('.slot[data-slot="enemy-' + slot + '"]');
          if (healSlotEl) playHealEffect(healSlotEl, regenHeal);
        }
        var delay = damageDealt > 0 || regenHeal > 0 ? ENEMY_BUFF_HIT_EFFECT_MS : ENEMY_BUFF_RESOLVE_MS;
        if (slot < 6)
          setTimeout(function () {
            processSlot(slot + 1);
          }, delay);
        else
          setTimeout(function () {
            processSlot(7);
          }, delay);
      }
      processSlot(1);
    }
    /** 判断己方单位是否已战斗不能（hp <= 0），用于禁止使用技能 */
    function isAllyDefeated(unit) {
      if (!unit) return true;
      var hp =
        unit.name === '白牙' || unit.daughterUnit === true
          ? unit.hp != null
            ? Math.min(parseInt(unit.hp, 10) || 0, Math.max(1, parseInt(unit.maxHp, 10) || 1))
            : Math.max(1, parseInt(unit.maxHp, 10) || 1)
          : unit.hp != null
            ? parseInt(unit.hp, 10)
            : getHpFromSta(getDisplayStat(unit, 'sta') || 1);
      return (hp || 0) <= 0;
    }
    /** 幽灵舞踏：对单体进行 3 或 4 次攻击判定，每次造成 [Str×系数] 伤害；A 首次命中施加 1 层流血，B 每次命中施加 1 层暗蚀 */
    function executePlayer幽灵舞踏(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '幽灵舞踏') return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var perHitDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var numHits = skill.advancement === 'A' ? 4 : 3;
      var firstHit流血Done = false;
      var hitIdx = 0;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function doOneHit() {
        if (hitIdx >= numHits) {
          attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof window.toastr !== 'undefined') window.toastr.success('幽灵舞踏 释放完毕');
          return;
        }
        var result = resolveAttack(attacker, defender, perHitDamage, true);
        function applyThisHit() {
          applyDamageToTarget(
            defender,
            result.finalDamage,
            result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
          );
          if (result.hit) {
            if (skill.advancement === 'A' && !firstHit流血Done) {
              addBuffLayers(defender, '流血', '流血', 1, attacker);
              firstHit流血Done = true;
            }
            if (skill.advancement === 'B') addBuffLayers(defender, '暗蚀', '暗蚀', 1, attacker);
          }
          var attName = attacker.name || '己方';
          var defName = defender.name || '敌方';
          var multStr =
            (getDisplayStat(attacker, 'str') || 0) > 0
              ? (perHitDamage / (getDisplayStat(attacker, 'str') || 1)).toFixed(2)
              : null;
          appendCombatLog(
            formatAttackLogLine(attName, '幽灵舞踏', defName, result, perHitDamage, '力量', multStr, defender.hp),
          );
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (defenderSlotEl) {
            if (!result.hit) playMissEffect(defenderSlotEl);
          }
          hitIdx++;
          setTimeout(doOneHit, result.hit ? 220 : 920);
        }
        if (attackerSlotEl && defenderSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            if (result.hit) playAnimationOnSlot(defenderSlotEl, 'E-dark1', applyThisHit);
            else applyThisHit();
          });
        } else {
          applyThisHit();
        }
      }
      doOneHit();
    }
    /** 错锋：黯被动。基础【攻击】改为 3 次判定，每次 [Str×0.3] 物理伤害，消耗 1 AP。 */
    function executePlayer错锋Attack(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '黯' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var str = getDisplayStat(attacker, 'str') || 0;
      var perHitDamage = Math.max(0, Math.floor(str * 0.3));
      if (attacker.纳刀下次伤害加成 != null && attacker.纳刀下次伤害加成 > 0) {
        perHitDamage = Math.max(0, Math.floor(perHitDamage * (1 + attacker.纳刀下次伤害加成 / 100)));
        attacker.纳刀下次伤害加成 = null;
      }
      var numHits = 3;
      var hitIdx = 0;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function doOneHit() {
        if (hitIdx >= numHits) {
          attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof window.toastr !== 'undefined') window.toastr.success('攻击（错锋）释放完毕');
          return;
        }
        var result = resolveAttack(attacker, defender, perHitDamage, true);
        function applyThisHit() {
          applyDamageToTarget(
            defender,
            result.finalDamage,
            result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
          );
          var attName = attacker.name || '黯';
          var defName = defender.name || '敌方';
          var multStr = str > 0 ? (perHitDamage / str).toFixed(2) : null;
          appendCombatLog(
            formatAttackLogLine(attName, '攻击（错锋）', defName, result, perHitDamage, '力量', multStr, defender.hp),
          );
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (defenderSlotEl && !result.hit) playMissEffect(defenderSlotEl);
          hitIdx++;
          setTimeout(doOneHit, result.hit ? 220 : 920);
        }
        if (attackerSlotEl && defenderSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            if (result.hit) playAnimationOnSlot(defenderSlotEl, 'E-dark1', applyThisHit);
            else applyThisHit();
          });
        } else {
          applyThisHit();
        }
      }
      doOneHit();
    }
    /** 清漓·灵犀：主段 Str×系数；暴击时追加敏捷段；Lv5-A 破浪命中施加破甲+迟钝；Lv5-B 涟漪每次暴击叠【剑势】（剑势不随回合清除，新战斗由 preparePartyForNewBattle 清空） */
    function executePlayer灵犀(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '灵犀') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var strM = lv === 1 ? 1.0 : lv === 2 ? 1.1 : lv === 3 ? 1.1 : 1.2;
      var agiM = lv === 1 ? 0.3 : lv === 2 ? 0.3 : lv === 3 ? 0.4 : 0.4;
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var baseDamage = Math.max(0, Math.floor(str * strM));
      var bonusDamage = Math.max(0, Math.floor(agi * agiM));
      var skillDisplayName = '灵犀';
      if (lv >= 5 && skill.advancement === 'A') skillDisplayName = '灵犀·破浪';
      else if (lv >= 5 && skill.advancement === 'B') skillDisplayName = '灵犀·涟漪';
      var result1 = resolveAttack(attacker, defender, baseDamage, true, { isMelee: true });
      if (result1.crit && attacker.纳刀共鸣暴击加成 != null) {
        result1.finalDamage = Math.max(1, Math.floor(result1.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
        attacker.纳刀共鸣暴击加成 = null;
      }
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var damageCalcStr1 = '力量×' + strM + '=' + baseDamage;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function applyAfterFirstHit() {
        applyDamageToTarget(
          defender,
          result1.finalDamage,
          result1.shadowDamage ? { shadowDamage: result1.shadowDamage } : undefined,
        );
        var curAp2 =
          attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
        attacker.currentAp = Math.max(0, curAp2 - skillAp);
        if (result1.hit && lv >= 5 && skill.advancement === 'A') {
          addBuffLayers(defender, '破甲', '破甲', 1, attacker);
          addBuffLayers(defender, '迟钝', '迟钝', 1, attacker);
        }
        if (lv >= 5 && skill.advancement === 'B' && result1.hit && result1.crit) {
          addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
          capUnitBuffs(attacker);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            skillDisplayName,
            defName,
            result1,
            baseDamage,
            null,
            null,
            defender.hp,
            damageCalcStr1,
          ),
        );
        function finish灵犀清漓钩子() {
          if (attacker.name === '清漓')
            on清漓指令完成(attacker, skill, { apCost: skillAp, commandUniqueKey: '灵犀' });
        }
        function doSecondHit() {
          if (!result1.crit || !result1.hit || bonusDamage <= 0) {
            if (typeof window.toastr !== 'undefined') window.toastr.success(result1.message);
            finish灵犀清漓钩子();
            return;
          }
          var result2 = resolveAttack(attacker, defender, bonusDamage, true, { isMelee: true });
          if (result2.crit && attacker.纳刀共鸣暴击加成 != null) {
            result2.finalDamage = Math.max(1, Math.floor(result2.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
            attacker.纳刀共鸣暴击加成 = null;
          }
          applyDamageToTarget(
            defender,
            result2.finalDamage,
            result2.shadowDamage ? { shadowDamage: result2.shadowDamage } : undefined,
          );
          if (lv >= 5 && skill.advancement === 'B' && result2.hit && result2.crit) {
            addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
            capUnitBuffs(attacker);
          }
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          var calc2 = '敏捷×' + agiM + '=' + bonusDamage;
          appendCombatLog(
            formatAttackLogLine(
              attName,
              skillDisplayName + '（追击）',
              defName,
              result2,
              bonusDamage,
              null,
              null,
              defender.hp,
              calc2,
            ),
          );
          if (typeof window.toastr !== 'undefined') window.toastr.success(result1.message + '（追击）');
          finish灵犀清漓钩子();
        }
        if (result1.crit && result1.hit && bonusDamage > 0) {
          setTimeout(function () {
            if (defenderSlotEl && attackerSlotEl) {
              playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
                playAnimationOnSlot(defenderSlotEl, 'Slash6', function () {
                  doSecondHit();
                });
              });
            } else {
              doSecondHit();
            }
          }, 380);
        } else {
          if (typeof window.toastr !== 'undefined') window.toastr.success(result1.message);
          finish灵犀清漓钩子();
        }
      }
      if (attackerSlotEl && defenderSlotEl) {
        playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
          if (result1.hit) {
            playAnimationOnSlot(defenderSlotEl, 'Slash6', function () {
              applyAfterFirstHit();
            });
          } else {
            playMissEffect(defenderSlotEl);
            applyAfterFirstHit();
          }
        });
      } else {
        applyAfterFirstHit();
      }
    }
    /** 清漓·护卫：1 AP，自身护盾 Def×a + Agi×b（随等级）；Lv5-A 叠浪再给当前生命比例最低的友方 50% 护盾；Lv5-B 剑心额外 +1【剑势】+1【精准】 */
    function executePlayer护卫(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '清漓' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '护卫') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var def = getDisplayStat(attacker, 'def') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var defM = 0.8;
      var agiM = 0.6;
      if (lv === 1) {
        defM = 0.6;
        agiM = 0.4;
      } else if (lv === 2) {
        defM = 0.7;
        agiM = 0.4;
      } else if (lv === 3) {
        defM = 0.7;
        agiM = 0.6;
      } else {
        defM = 0.8;
        agiM = 0.6;
      }
      var shieldValue = Math.max(0, Math.floor(def * defM + agi * agiM));
      var skillLabel = '护卫';
      if (lv >= 5 && skill.advancement === 'A') skillLabel = '护卫·叠浪';
      else if (lv >= 5 && skill.advancement === 'B') skillLabel = '护卫·剑心';
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shieldValue;
      if (shieldValue > 0) addBuffLayers(attacker, '护盾', '护盾', shieldValue);
      var logExtra = '';
      if (lv >= 5 && skill.advancement === 'B') {
        addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
        addBuffLayers(attacker, '精准', '精准', 1, attacker);
        capUnitBuffs(attacker);
        logExtra = '，获得1层【剑势】与1层【精准】';
      } else if (lv >= 5 && skill.advancement === 'A') {
        var bestRatio = 2;
        var targetUnit = null;
        var targetSlot = -1;
        for (var si = 0; si < party.length; si++) {
          if (si + 1 === allySlot) continue;
          var u = party[si];
          if (!u || isAllyDefeated(u)) continue;
          var maxHpU = u.maxHp != null ? parseInt(u.maxHp, 10) : getHpFromSta(getDisplayStat(u, 'sta') || 1);
          var hpU = u.hp != null ? parseInt(u.hp, 10) : maxHpU;
          if (maxHpU <= 0) continue;
          var ratio = hpU / maxHpU;
          if (ratio < bestRatio) {
            bestRatio = ratio;
            targetUnit = u;
            targetSlot = si + 1;
          }
        }
        if (targetUnit && targetSlot > 0) {
          var allyShield = Math.max(0, Math.floor(shieldValue * 0.5));
          if (allyShield > 0) {
            targetUnit.currentShield =
              (targetUnit.currentShield != null ? parseInt(targetUnit.currentShield, 10) || 0 : 0) + allyShield;
            addBuffLayers(targetUnit, '护盾', '护盾', allyShield);
            logExtra =
              '，为 ' +
              (targetUnit.name || '友方') +
              '（槽位' +
              targetSlot +
              '）提供 ' +
              allyShield +
              ' 点护盾（50%）';
          }
        }
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(
        (attacker.name || '清漓') + ' 使用' + skillLabel + '，获得 ' + shieldValue + ' 点护盾' + logExtra,
      );
      if (typeof window.toastr !== 'undefined')
        window.toastr.success(
          skillLabel +
            '：' +
            shieldValue +
            ' 护盾' +
            (logExtra.indexOf('提供') !== -1 ? '（已援护友方）' : ''),
        );
      on清漓指令完成(attacker, skill, { apCost: skillAp, commandUniqueKey: '护卫' });
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          if (allySlotEl) playAnimationOnSlot(allySlotEl, 'Recovery2', function () {});
        });
      });
    }
    function 清漓HasSpecial(ch, specialId) {
      return (
        ch &&
        ch.name === '清漓' &&
        ch.specialSkillsUnlocked &&
        Array.isArray(ch.specialSkillsUnlocked) &&
        ch.specialSkillsUnlocked.indexOf(specialId) !== -1
      );
    }
    function tryRemove剑势Layers(unit, n) {
      if (!unit || !unit.buffs || n <= 0) return;
      for (var ri = 0; ri < unit.buffs.length; ri++) {
        var b = unit.buffs[ri];
        if ((b.id || b.name || '').trim() !== '剑势') continue;
        var L = Math.max(0, parseInt(b.layers, 10) || 0);
        var next = Math.max(0, L - n);
        if (next <= 0) unit.buffs.splice(ri, 1);
        else b.layers = next;
        return;
      }
    }
    /** 行云流水：用 attribute1|2|3 作为「指令类型」 */
    function get清漓行云流水类型(skill) {
      if (!skill) return 'unknown';
      var a1 = skill.attribute1 || '';
      var a2 = skill.attribute2 || '';
      var a3 = skill.attribute3 || '';
      return String(a1) + '|' + String(a2) + '|' + String(a3);
    }
    /** 清漓特殊技能联动：行云流水、踏浪行歌（本回合不同指令计数、踏浪额外剑势） */
    function on清漓指令完成(attacker, skill, options) {
      options = options || {};
      if (!attacker || attacker.name !== '清漓' || isAllyDefeated(attacker)) return;
      var apCost = options.apCost != null ? options.apCost : skill && skill.ap != null ? skill.ap : 0;
      var typeKey = get清漓行云流水类型(skill);
      if (清漓HasSpecial(attacker, '行云流水')) {
        var prev = attacker.清漓行云流水_上次类型;
        if (prev != null && prev !== '') {
          if (prev === typeKey) tryRemove剑势Layers(attacker, 1);
          else {
            addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
            capUnitBuffs(attacker);
          }
        }
        attacker.清漓行云流水_上次类型 = typeKey;
      }
      var cmdKey = options.commandUniqueKey;
      if (!cmdKey && skill) cmdKey = skill.id || skill.name;
      if (清漓HasSpecial(attacker, '踏浪行歌') && cmdKey && cmdKey !== '踏浪行歌') {
        attacker.清漓本回合不同指令 = attacker.清漓本回合不同指令 || {};
        attacker.清漓本回合不同指令[cmdKey] = true;
      }
      if (getUnitBuffLayers(attacker, '踏浪') > 0 && apCost > 0) {
        addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
        capUnitBuffs(attacker);
      }
    }
    /** 沧澜·潮汐+千里剑光：同列优先攻击后排存活目标，再回退原正前方逻辑 */
    function findAliveEnemySlotFor潮汐(allySlot, enemies, preferBackRow) {
      if (!enemies || !enemies.length) return null;
      function alive(slotNum) {
        var u = enemies[slotNum - 1];
        return u && (parseInt(u.hp, 10) || 0) > 0;
      }
      if (preferBackRow) {
        var prefFront = getEnemySlotInFrontOfAlly(allySlot);
        var backPair = prefFront === 1 ? 2 : prefFront === 3 ? 4 : prefFront === 5 ? 6 : null;
        if (backPair != null && alive(backPair)) return backPair;
        for (var bi = 0; bi < ENEMY_BACK_ROW_SLOTS.length; bi++) {
          var bs = ENEMY_BACK_ROW_SLOTS[bi];
          if (alive(bs)) return bs;
        }
      }
      return findAliveEnemySlotInFront(allySlot, enemies);
    }
    /** 玩家行动回合开始：清除【踏浪】、重置本回合指令统计、潮汐 Int 叠剑势、剑心通明激励 */
    function run清漓玩家回合开始处理() {
      var party = getParty();
      if (party && party.length) {
        for (var ui = 0; ui < party.length; ui++) {
          var uc = party[ui];
          if (!uc || uc.name !== '清漓') continue;
          removeUnitBuffById(uc, '踏浪');
          uc.清漓本回合不同指令 = {};
        }
      }
      run清漓沧澜潮汐TurnStart();
      party = getParty();
      if (party && party.length) {
        for (var uj = 0; uj < party.length; uj++) {
          var uq = party[uj];
          if (!uq || uq.name !== '清漓' || isAllyDefeated(uq)) continue;
          if (清漓HasSpecial(uq, '剑心通明') && getUnitBuffLayers(uq, '剑势') >= 10) {
            addBuffLayers(uq, '激励', '激励', 1, uq);
            capUnitBuffs(uq);
          }
        }
      }
      saveBattleData(getParty(), getEnemyParty());
    }
    /** 清漓是否已解锁技能「沧澜」 */
    function get清漓沧澜Skill(attacker) {
      if (!attacker || attacker.name !== '清漓' || !attacker.skills) return null;
      for (var ci = 0; ci < attacker.skills.length; ci++) {
        if ((attacker.skills[ci].name || '') === '沧澜') return attacker.skills[ci];
      }
      return null;
    }
    function is沧澜潮汐B(skill) {
      if (!skill || (skill.name || '') !== '沧澜') return false;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      return lv >= 5 && skill.advancement === 'B';
    }
    function getUnitBuffLayers(unit, buffId) {
      if (!unit || !unit.buffs) return 0;
      for (var bi = 0; bi < unit.buffs.length; bi++) {
        var bb = unit.buffs[bi];
        if ((bb.id || bb.name || '').trim() === buffId) return Math.max(0, parseInt(bb.layers, 10) || 0);
      }
      return 0;
    }
    function removeUnitBuffById(unit, buffId) {
      if (!unit || !unit.buffs) return;
      unit.buffs = unit.buffs.filter(function (x) {
        return (x.id || x.name || '').trim() !== buffId;
      });
    }
    /** 扣除单位身上某 buff 的层数；层数不足则返回 false 且不修改。扣至 0 时移除该 buff。 */
    function consumeUnitBuffLayers(unit, buffId, count) {
      if (!unit || !unit.buffs || count <= 0) return false;
      var bid = (buffId || '').trim();
      var b = null;
      for (var i = 0; i < unit.buffs.length; i++) {
        if ((unit.buffs[i].id || unit.buffs[i].name || '').trim() === bid) {
          b = unit.buffs[i];
          break;
        }
      }
      if (!b) return false;
      var L = Math.max(0, parseInt(b.layers, 10) || 0);
      if (L < count) return false;
      b.layers = L - count;
      if (b.layers <= 0) {
        unit.buffs = unit.buffs.filter(function (x) {
          return (x.id || x.name || '').trim() !== bid;
        });
      }
      return true;
    }
    /** 丝伊德·白 AP 上限：姬骑形态 -2（至少 1） */
    function getEffectiveMaxApForAlly(unit) {
      if (!unit) return 3;
      if (unit.name === '白牙' || unit.daughterUnit === true) return 2;
      var lv = unit.level != null ? unit.level : 1;
      var m = getApByLevel(lv);
      if ((unit.name || '') === '丝伊德·白' && getUnitBuffLayers(unit, '姬骑') > 0) m = Math.max(1, m - 2);
      // 服装：泳装/舞娘 AP+1
      var outfit = (unit && (unit._portraitOutfit || unit.outfitTag || unit.outfit)) || '';
      if (outfit === '泳装' || outfit === '舞娘') m += 1;
      return m;
    }
    function hasAnyNegativeDebuffFor异种外壳(unit) {
      if (!unit || !unit.buffs || !unit.buffs.length) return false;
      for (var ni = 0; ni < unit.buffs.length; ni++) {
        var bb = unit.buffs[ni];
        var idn = (bb.id || bb.name || '').trim();
        if (NEGATIVE_DEBUFF_IDS.indexOf(idn) === -1) continue;
        if ((parseInt(bb.layers, 10) || 0) > 0) return true;
      }
      return false;
    }
    function removeOneNegativeDebuffStack(unit) {
      if (!unit || !unit.buffs) return false;
      for (var ki = 0; ki < NEGATIVE_DEBUFF_IDS.length; ki++) {
        var want = NEGATIVE_DEBUFF_IDS[ki];
        for (var jj = 0; jj < unit.buffs.length; jj++) {
          var bx = unit.buffs[jj];
          if ((bx.id || bx.name || '').trim() !== want) continue;
          var L = Math.max(0, parseInt(bx.layers, 10) || 0);
          if (L <= 0) continue;
          bx.layers = L - 1;
          if (bx.layers <= 0) unit.buffs.splice(jj, 1);
          return true;
        }
      }
      return false;
    }
    /** 从单位身上消耗指定 buff 的层数（不足则只扣现有层数），返回实际消耗层数。 */
    function consumeBuffLayersFromUnit(unit, buffId, amount) {
      if (!unit || !unit.buffs || amount <= 0) return 0;
      for (var ci = 0; ci < unit.buffs.length; ci++) {
        var bb = unit.buffs[ci];
        if ((bb.id || bb.name) !== buffId) continue;
        var L = Math.max(0, parseInt(bb.layers, 10) || 0);
        var take = Math.min(amount, L);
        bb.layers = L - take;
        if (bb.layers <= 0) unit.buffs.splice(ci, 1);
        return take;
      }
      return 0;
    }
    /** 凌遥仙【星辰加速】：本回合下数次行动 AP 消耗可视作 nominal 或 nominal-1（至少 1）。 */
    function getEffectiveSkillApCostForAlly(unit, nominalAp) {
      var n = nominalAp != null ? Math.max(0, parseInt(nominalAp, 10) || 0) : 1;
      if (!unit || n <= 0) return n;
      if (getUnitBuffLayers(unit, '星辰加速') > 0) return Math.max(1, n - 1);
      return n;
    }
    /** 扣除 AP 并消耗 1 层【星辰加速】（若适用）。curApBefore 为扣减前读数。 */
    function applyAllySkillApCost(ally, nominalCost, curApBefore) {
      var cost = nominalCost != null ? nominalCost : 1;
      if (ally && getUnitBuffLayers(ally, '星辰加速') > 0 && cost > 0) {
        cost = Math.max(1, cost - 1);
        consumeBuffLayersFromUnit(ally, '星辰加速', 1);
      }
      ally.currentAp = Math.max(0, curApBefore - cost);
    }
    function markLingyaoOnceSpecialUsed(skillId) {
      if (!skillId) return;
      battleState.lingyaoOnceSpecialUsed = battleState.lingyaoOnceSpecialUsed || {};
      battleState.lingyaoOnceSpecialUsed[skillId] = true;
    }
    /** 丝伊德·白「魔物孕育」Lv5-A：玩家行动回合开始时获得 1 层【孕育】。 */
    function run丝伊德魔物孕育Lv5A玩家回合开始() {
      var party = getParty();
      if (!party || !party.length) return;
      var changed = false;
      for (var i = 0; i < party.length; i++) {
        var u = party[i];
        if (!u || (u.name || '') !== '丝伊德·白' || isAllyDefeated(u)) continue;
        var sk = null;
        if (u.skills) {
          for (var si = 0; si < u.skills.length; si++) {
            if ((u.skills[si].name || '') === '魔物孕育') {
              sk = u.skills[si];
              break;
            }
          }
        }
        if (!sk) continue;
        var lv = Math.max(1, parseInt(sk.level, 10) || 1);
        if (lv < 5 || sk.advancement !== 'A') continue;
        addBuffLayers(u, '孕育', '孕育', 1, u);
        capUnitBuffs(u);
        changed = true;
      }
      if (changed) saveBattleData(getParty(), getEnemyParty());
    }
    /** 姬骑解禁：每回合开始自动对随机存活敌方发动一次无消耗【碧血魔剑】。 */
    function run丝伊德姬骑自动碧血魔剑玩家回合开始() {
      var party = getParty();
      var enemies = getEnemyParty();
      if (!party || !enemies || !party.length) return;
      for (var i = 0; i < party.length; i++) {
        var u = party[i];
        if (!u || (u.name || '') !== '丝伊德·白') continue;
        var hpU = u.hp != null ? parseInt(u.hp, 10) : 1;
        if (hpU <= 0) continue;
        if (!u.specialSkillsUnlocked || u.specialSkillsUnlocked.indexOf('姬骑解禁') === -1) continue;
        if (getUnitBuffLayers(u, '姬骑') <= 0) continue;
        var skIdx = -1;
        if (u.skills) {
          for (var si = 0; si < u.skills.length; si++) {
            if ((u.skills[si].name || '') === '碧血魔剑') {
              skIdx = si;
              break;
            }
          }
        }
        if (skIdx < 0) continue;
        var alive = [];
        for (var es = 1; es <= 6; es++) {
          var d = enemies[es - 1];
          if (d && (parseInt(d.hp, 10) || 0) > 0) alive.push(es);
        }
        if (!alive.length) continue;
        var pick = alive[Math.floor(Math.random() * alive.length)];
        executePlayer碧血魔剑(i + 1, pick, skIdx, { free: true, logSuffix: '（姬骑·自动）' });
      }
    }
    /** 魔物孕育：按技能等级与分支返回需消耗的【孕育】层数。 */
    function get魔物孕育消耗层数(skill) {
      if (!skill || (skill.name || '') !== '魔物孕育') return 999;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement || null;
      if (lv >= 5 && adv === 'B') return 8;
      if (lv >= 5 && adv === 'A') return 5;
      return Math.max(5, 9 - lv);
    }
    /** 技能弹窗某一选项对应的 AP 消耗（与弹窗禁用规则一致：潮汐沧澜视为 0；猎手本能单独排除）。 */
    function getApCostForSkillPopupChoice(ch, idx, specialId) {
      if (specialId === '猎手本能') return 0;
      if (idx != null && ch && ch.skills) {
        var sk = ch.skills[parseInt(idx, 10)];
        if (!sk) return 0;
        var canglanTideB =
          ch.name === '清漓' &&
          (sk.name || '') === '沧澜' &&
          Math.max(1, parseInt(sk.level, 10) || 1) >= 5 &&
          sk.advancement === 'B';
        if (canglanTideB) return 0;
        var baseAp = sk.ap != null ? parseInt(sk.ap, 10) : 1;
        return getEffectiveSkillApCostForAlly(ch, baseAp);
      }
      if (specialId && ch && typeof getSpecialSkillsForChar === 'function') {
        var list = getSpecialSkillsForChar(ch);
        for (var si = 0; si < list.length; si++) {
          if (list[si].id === specialId) {
            var spAp = list[si].ap != null ? parseInt(list[si].ap, 10) : 1;
            return getEffectiveSkillApCostForAlly(ch, spAp);
          }
        }
      }
      return 0;
    }
    /**
     * 【眩晕】统一判定：若单位带有眩晕层数，则消去 1 层，本次不产生技能/行动效果；若 apCost > 0 仍扣除对应 AP。
     * 在技能弹窗、换位、敌方行动入口各调用一次即可，勿在单个技能内重复判断。
     * @param {number} [apCost] 本次被浪费行动应扣的 AP，默认 0（换位、敌方无效行动不传）
     * @returns {boolean} true 表示已因眩晕浪费行动，调用方须立即 return
     */
    function tryConsume眩晕浪费行动(unit, apCost) {
      if (!unit || !unit.buffs || !unit.buffs.length) return false;
      if ((unit.name || '') === '丝伊德·白' && getUnitBuffLayers(unit, '姬骑') > 0) return false;
      var payAp = apCost != null ? Math.max(0, parseInt(apCost, 10) || 0) : 0;
      var stunBuff = null;
      for (var si = 0; si < unit.buffs.length; si++) {
        var sb = unit.buffs[si];
        if ((sb.id || sb.name || '').trim() !== '眩晕') continue;
        var sl = Math.max(0, parseInt(sb.layers, 10) || 0);
        if (sl > 0) {
          stunBuff = sb;
          break;
        }
      }
      if (!stunBuff) return false;
      var beforeL = Math.max(0, parseInt(stunBuff.layers, 10) || 0);
      stunBuff.layers = Math.max(0, beforeL - 1);
      unit.buffs = unit.buffs.filter(function (x) {
        return (parseInt(x.layers, 10) || 0) > 0;
      });
      capUnitBuffs(unit);
      if (payAp > 0) {
        var maxAp = getEffectiveMaxApForAlly(unit);
        var curAp = unit.currentAp !== undefined && unit.currentAp != null ? parseInt(unit.currentAp, 10) : maxAp;
        unit.currentAp = Math.max(0, curAp - payAp);
      }
      var label = unit.name || '单位';
      var remain = Math.max(0, beforeL - 1);
      var logLine = label + ' 【眩晕】使本次行动无效（剩余 ' + remain + ' 层）';
      if (payAp > 0) logLine += '，仍消耗 ' + payAp + ' AP';
      appendCombatLog(logLine);
      saveBattleData(getParty(), getEnemyParty());
      renderAllySlots(getParty());
      renderEnemySlots(getEnemyParty());
      if (typeof window.toastr !== 'undefined')
        window.toastr.warning(payAp > 0 ? '眩晕：本次行动无效（已扣除 ' + payAp + ' AP）' : '眩晕：本次行动无效');
      return true;
    }
    /** 己方槽位 1～6 → 前排三列对应的敌方前排槽位 1/3/5（列对齐） */
    function getEnemySlotInFrontOfAlly(allySlot) {
      var col = Math.ceil(allySlot / 2);
      return [1, 3, 5][col - 1];
    }
    /** 正前方优先：同列前排敌；否则任意 ENEMY_FRONT_ROW 存活；再否则任意存活敌 */
    function findAliveEnemySlotInFront(allySlot, enemies) {
      if (!enemies || !enemies.length) return null;
      function alive(slotNum) {
        var u = enemies[slotNum - 1];
        return u && (parseInt(u.hp, 10) || 0) > 0;
      }
      var pref = getEnemySlotInFrontOfAlly(allySlot);
      if (alive(pref)) return pref;
      for (var fi = 0; fi < ENEMY_FRONT_ROW_SLOTS.length; fi++) {
        var s = ENEMY_FRONT_ROW_SLOTS[fi];
        if (alive(s)) return s;
      }
      for (var j = 1; j <= 6; j++) {
        if (alive(j)) return j;
      }
      return null;
    }
    /** 清漓·沧澜被动：基础【攻击】命中时 +1【剑势】 */
    function try清漓沧澜被动剑势(attacker) {
      if (!attacker || attacker.name !== '清漓') return;
      if (!get清漓沧澜Skill(attacker)) return;
      addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
      capUnitBuffs(attacker);
    }
    /** 沧澜·潮汐：玩家回合开始时按 Int/5 叠剑势 */
    function run清漓沧澜潮汐TurnStart() {
      var party = getParty();
      if (!party || !party.length) return;
      for (var ti = 0; ti < party.length; ti++) {
        var ch = party[ti];
        if (!ch || ch.name !== '清漓' || isAllyDefeated(ch)) continue;
        var sk = get清漓沧澜Skill(ch);
        if (!is沧澜潮汐B(sk)) continue;
        var intv = getDisplayStat(ch, 'int') || 0;
        var addL = Math.floor(intv / 5);
        if (addL > 0) {
          addBuffLayers(ch, '剑势', '剑势', addL, ch);
          capUnitBuffs(ch);
        }
      }
    }
    /** 沧澜·潮汐：玩家回合结束结算前，自动泄剑势对正前方单体伤害 */
    function run清漓沧澜潮汐End(party, enemies) {
      if (!party || !enemies) return;
      for (var slot = 1; slot <= 6; slot++) {
        var ch = party[slot - 1];
        if (!ch || ch.name !== '清漓' || isAllyDefeated(ch)) continue;
        var sk = get清漓沧澜Skill(ch);
        if (!is沧澜潮汐B(sk)) continue;
        var layers = getUnitBuffLayers(ch, '剑势');
        if (layers <= 0) continue;
        var str = getDisplayStat(ch, 'str') || 0;
        var agi = getDisplayStat(ch, 'agi') || 0;
        var raw = Math.max(0, Math.floor((str + agi) * layers * 0.25));
        removeUnitBuffById(ch, '剑势');
        var preferBack = 清漓HasSpecial(ch, '千里剑光');
        var es = findAliveEnemySlotFor潮汐(slot, enemies, preferBack);
        if (!es || raw <= 0) {
          appendCombatLog((ch.name || '清漓') + ' 沧澜·潮汐：剑势已消散（无有效目标或伤害为0）');
          continue;
        }
        var defender = enemies[es - 1];
        var tideResOpts = 清漓HasSpecial(ch, '千里剑光') ? { isRanged: true } : { isMelee: true };
        if (清漓HasSpecial(ch, '剑心通明')) tideResOpts.critMult = 3;
        var result = resolveAttack(ch, defender, raw, true, tideResOpts);
        if (result.crit && ch.纳刀共鸣暴击加成 != null) {
          result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + ch.纳刀共鸣暴击加成)));
          ch.纳刀共鸣暴击加成 = null;
        }
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit && 清漓HasSpecial(ch, '千里剑光')) {
          addBuffLayers(defender, '破甲', '破甲', 2, ch);
          addBuffLayers(defender, '迟钝', '迟钝', 2, ch);
          if (layers >= 12) addBuffLayers(defender, '虚弱', '虚弱', 1, ch);
        }
        var calcStr = '(Str+Agi)×' + layers + '×0.25=' + raw;
        appendCombatLog(
          formatAttackLogLine(
            ch.name || '清漓',
            '沧澜·潮汐',
            defender.name || '敌方',
            result,
            raw,
            null,
            null,
            defender.hp,
            calcStr,
          ),
        );
      }
    }
    /** 清漓·沧澜：消耗全部剑势，单体物理；Lv5-A 流溯返还 40% 剑势（向下取整）；Lv5-B 潮汐无主动 */
    function executePlayer沧澜(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || attacker.name !== '清漓' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '沧澜') return;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      if (lv >= 5 && skill.advancement === 'B') {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('潮汐形态下沧澜为被动，无法主动释放');
        return;
      }
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var layers = getUnitBuffLayers(attacker, '剑势');
      if (layers <= 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('无【剑势】，无法释放沧澜');
        return;
      }
      var coef = lv === 1 ? 0.175 : lv === 2 ? 0.2 : lv === 3 ? 0.225 : 0.25;
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var baseDamage = Math.max(0, Math.floor((str + agi) * layers * coef));
      var consumed = layers;
      var distinctCmd = Object.keys(attacker.清漓本回合不同指令 || {}).length;
      if (清漓HasSpecial(attacker, '踏浪行歌') && distinctCmd >= 3)
        baseDamage = Math.max(0, Math.floor(baseDamage * 1.3));
      removeUnitBuffById(attacker, '剑势');
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var qianliKm = 清漓HasSpecial(attacker, '千里剑光');
      var jianxinTm = 清漓HasSpecial(attacker, '剑心通明');
      var canglanResOpts = qianliKm ? { isRanged: true } : { isMelee: true };
      if (jianxinTm) canglanResOpts.critMult = 3;
      var result = resolveAttack(attacker, defender, baseDamage, true, canglanResOpts);
      if (result.crit && attacker.纳刀共鸣暴击加成 != null) {
        result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
        attacker.纳刀共鸣暴击加成 = null;
      }
      var skillLabel = '沧澜';
      if (lv >= 5 && skill.advancement === 'A') skillLabel = '沧澜·流溯';
      var damageCalcStr = '(Str+Agi)×' + consumed + '×' + coef + '=' + baseDamage;
      if (清漓HasSpecial(attacker, '踏浪行歌') && distinctCmd >= 3) damageCalcStr += '×1.3(踏浪行歌)';
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function apply沧澜Damage() {
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit && qianliKm) {
          addBuffLayers(defender, '破甲', '破甲', 2, attacker);
          addBuffLayers(defender, '迟钝', '迟钝', 2, attacker);
          if (consumed >= 12) addBuffLayers(defender, '虚弱', '虚弱', 1, attacker);
        }
        if (lv >= 5 && skill.advancement === 'A') {
          var refund = Math.floor(consumed * 0.4);
          if (refund > 0) {
            addBuffLayers(attacker, '剑势', '剑势', refund, attacker);
            capUnitBuffs(attacker);
            appendCombatLog((attacker.name || '清漓') + ' 沧澜·流溯：返还 ' + refund + ' 层【剑势】');
          }
        }
        on清漓指令完成(attacker, skill, { apCost: skillAp, commandUniqueKey: '沧澜' });
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attacker.name || '清漓',
            skillLabel,
            defender.name || '敌方',
            result,
            baseDamage,
            null,
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (typeof window.toastr !== 'undefined') window.toastr.success(result.message);
      }
      if (attackerSlotEl && defenderSlotEl) {
        playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
          if (result.hit) {
            playAnimationOnSlot(defenderSlotEl, 'Slash6', function () {
              apply沧澜Damage();
            });
          } else {
            playMissEffect(defenderSlotEl);
            apply沧澜Damage();
          }
        });
      } else {
        apply沧澜Damage();
      }
    }
    /** 清漓·碧落：物理远程群体，对敌方全体分别判定；Lv1～4 与 Lv5-B 暴击时 +1【剑势】；Lv5-A 万剑归宗每次命中 +1【剑势】；Lv5-B 一剑霜寒对命中目标施加【迟缓】 */
    function executePlayer碧落(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '清漓' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '碧落') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var strM = 0.6;
      var agiM = 0.5;
      if (lv === 1) {
        strM = 0.5;
        agiM = 0.3;
      } else if (lv === 2) {
        strM = 0.5;
        agiM = 0.4;
      } else if (lv === 3) {
        strM = 0.6;
        agiM = 0.4;
      }
      var baseDamage = Math.max(0, Math.floor(str * strM + agi * agiM));
      var damageCalcStr = 'Str×' + strM + '+Agi×' + agiM + '=' + baseDamage;
      var skillLabel = '碧落';
      if (lv >= 5 && skill.advancement === 'A') skillLabel = '碧落·万剑归宗';
      else if (lv >= 5 && skill.advancement === 'B') skillLabel = '碧落·一剑霜寒';
      var targets = [];
      for (var bi = 1; bi <= 6; bi++) {
        var def = enemies[bi - 1];
        if (def) {
          var res = resolveAttack(attacker, def, baseDamage, true, { isRanged: true });
          if (res.crit && attacker.纳刀共鸣暴击加成 != null) {
            res.finalDamage = Math.max(1, Math.floor(res.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
            attacker.纳刀共鸣暴击加成 = null;
          }
          targets.push({ slotNum: bi, defender: def, result: res });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      playStrikeShake(attackerSlotEl, null, function () {
        playAnimationOnContainer(enemySideEl, 'SlashIce', function () {
          for (var t = 0; t < targets.length; t++) {
            var defender = targets[t].defender;
            var result = targets[t].result;
            applyDamageToTarget(
              defender,
              result.finalDamage,
              result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
            );
            appendCombatLog(
              formatAttackLogLine(
                attacker.name || '清漓',
                skillLabel,
                defender.name || '敌方',
                result,
                baseDamage,
                null,
                null,
                defender.hp,
                damageCalcStr,
              ),
            );
            var advA = lv >= 5 && skill.advancement === 'A';
            var advB = lv >= 5 && skill.advancement === 'B';
            if (advA && result.hit) {
              addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
              capUnitBuffs(attacker);
            } else if (!advA && result.crit) {
              addBuffLayers(attacker, '剑势', '剑势', 1, attacker);
              capUnitBuffs(attacker);
            }
            if (advB && result.hit) addBuffLayers(defender, '迟缓', '迟缓', 1, attacker);
          }
          attacker.currentAp = Math.max(0, curAp - skillAp);
          on清漓指令完成(attacker, skill, { apCost: skillAp, commandUniqueKey: '碧落' });
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          for (var u = 0; u < targets.length; u++) {
            var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[u].slotNum + '"]');
            if (slotEl && !targets[u].result.hit) playMissEffect(slotEl);
          }
          if (typeof window.toastr !== 'undefined') window.toastr.success(skillLabel + ' 释放完毕');
        });
      });
    }
    /** 清漓特殊·踏浪行歌 */
    function executePlayer踏浪行歌(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '清漓' || isAllyDefeated(attacker)) return;
      var list = getSpecialSkillsForChar(attacker);
      var skSp = null;
      for (var ti = 0; ti < list.length; ti++) {
        if (list[ti].id === '踏浪行歌') {
          skSp = list[ti];
          break;
        }
      }
      if (!skSp) return;
      var skillAp = skSp.ap != null ? skSp.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      addBuffLayers(attacker, '踏浪', '踏浪', 1, attacker);
      capUnitBuffs(attacker);
      on清漓指令完成(attacker, skSp, { isSpecial: true, apCost: skillAp, commandUniqueKey: '踏浪行歌' });
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '清漓') + ' 使用踏浪行歌，进入【踏浪】状态');
      if (typeof window.toastr !== 'undefined') window.toastr.success('踏浪行歌：已进入【踏浪】');
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          if (allySlotEl) playAnimationOnSlot(allySlotEl, 'Recovery2', function () {});
        });
      });
    }
    /** 清漓特殊·祥瑞庇佑 */
    function executePlayer祥瑞庇佑(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '清漓' || isAllyDefeated(attacker)) return;
      var list = getSpecialSkillsForChar(attacker);
      var skSp = null;
      for (var xi = 0; xi < list.length; xi++) {
        if (list[xi].id === '祥瑞庇佑') {
          skSp = list[xi];
          break;
        }
      }
      if (!skSp) return;
      var skillAp = skSp.ap != null ? skSp.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      for (var pi = 0; pi < party.length; pi++) {
        var ally = party[pi];
        if (!ally || isAllyDefeated(ally)) continue;
        addBuffLayers(ally, '精准', '精准', 2, attacker);
        addBuffLayers(ally, '激励', '激励', 1, attacker);
        capUnitBuffs(ally);
      }
      addBuffLayers(attacker, '剑势', '剑势', 2, attacker);
      capUnitBuffs(attacker);
      on清漓指令完成(attacker, skSp, { isSpecial: true, apCost: skillAp, commandUniqueKey: '祥瑞庇佑' });
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '清漓') + ' 使用祥瑞庇佑：友方全体获得2层【精准】与1层【激励】，自身获得2层【剑势】');
      if (typeof window.toastr !== 'undefined') window.toastr.success('祥瑞庇佑 释放完毕');
      var enemySideEl = document.querySelector('.side-enemy');
      var allySideEl = document.querySelector('.side-ally');
      if (enemySideEl && allySideEl) {
        playAnimationOnContainer(allySideEl, 'Cure2', function () {});
      }
    }
    function executePlayerAttack(allySlot, enemySlotNum, skillIndex, specialId) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender) return;
      if (isAllyDefeated(attacker)) return;
      var skill = null;
      var skillAp = 1;
      if (skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex]) {
        skill = attacker.skills[skillIndex];
        skillAp = skill.ap != null ? skill.ap : 1;
      } else if (specialId) {
        var list = getSpecialSkillsForChar(attacker);
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === specialId) {
            skill = list[i];
            skillAp = skill.ap != null ? skill.ap : 1;
            break;
          }
        }
      }
      if (!skill) return;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effApAtk = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effApAtk) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      if (specialId === '破阵冲锋') {
        executePlayer破阵冲锋(allySlot, enemySlotNum);
        return;
      }
      if ((skill.name || '') === '幽灵舞踏') {
        executePlayer幽灵舞踏(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '血舞枪刃') {
        executePlayer血舞枪刃(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '炎魔吹息') {
        executePlayer炎魔吹息(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '心灵侵蚀') {
        executePlayer心灵侵蚀(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '镜花水月') {
        executePlayer镜花水月(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '心智侵蚀') {
        executePlayer心智侵蚀(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '圣光斩') {
        executePlayer圣光斩(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '碧血魔剑') {
        executePlayer碧血魔剑(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '清算之手') {
        executePlayer清算之手(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if ((skill.name || '') === '灵犀') {
        executePlayer灵犀(allySlot, enemySlotNum, skillIndex);
        return;
      }
      if (
        skill.basic &&
        (skill.name || '') === '攻击' &&
        attacker.name === '黯' &&
        attacker.specialSkillsUnlocked &&
        attacker.specialSkillsUnlocked.indexOf('错锋') !== -1
      ) {
        executePlayer错锋Attack(allySlot, enemySlotNum, skillIndex);
        return;
      }
      var rawEffect = skill.effectByLevel ? getSkillEffectForLevel(skill, skill.level || 1) : skill.effect || '';
      var resolvedEffect = resolveSkillEffect(rawEffect, attacker);
      var baseDamage = getBaseDamageFromResolvedEffect(resolvedEffect);
      if (baseDamage !== baseDamage || baseDamage <= 0) baseDamage = getBaseDamageForSkill(attacker, skill);
      baseDamage = Math.max(0, Math.floor(baseDamage));
      if (attacker.纳刀下次伤害加成 != null && attacker.纳刀下次伤害加成 > 0) {
        baseDamage = Math.max(0, Math.floor(baseDamage * (1 + attacker.纳刀下次伤害加成 / 100)));
        attacker.纳刀下次伤害加成 = null;
      }
      var 攻势N = 0;
      var 守势N = 0;
      (attacker.buffs || []).forEach(function (b) {
        if ((b.id || b.name) === '攻势') 攻势N = parseInt(b.layers, 10) || 0;
        if ((b.id || b.name) === '守势') 守势N = parseInt(b.layers, 10) || 0;
      });
      if (skill.id === '一闪') {
        if (攻势N === 5 && 守势N === 5) {
          baseDamage = Math.floor(baseDamage * 1.5);
          attacker.一闪必中 = true;
        } else if (攻势N === 5) baseDamage = Math.floor(baseDamage * 1.2);
      }
      if (skill.id === '无拍子') {
        attacker.无拍子必中 = true;
        if (!attacker.本回合已获得攻势守势) baseDamage = Math.floor(baseDamage * 1.5);
      }
      if ((skill.name || '') === '斩月' && skill.advancement === 'A') {
        var has守势 = (attacker.buffs || []).some(function (b) {
          return (b.id === '守势' || b.name === '守势') && ((b.layers != null ? parseInt(b.layers, 10) : 0) || 0) > 0;
        });
        if (has守势) baseDamage = Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 1.5));
      }
      if ((skill.name || '') === '斩杀' && defender) {
        var maxHpDef = defender.maxHp != null ? parseInt(defender.maxHp, 10) : 100;
        var curHpDef = defender.hp != null ? parseInt(defender.hp, 10) : maxHpDef;
        if (maxHpDef > 0 && curHpDef / maxHpDef < 0.3) baseDamage = Math.floor(baseDamage * 2);
      }
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      /** 被攻击的抖动、-N 掉血示意与血量条渲染同时发生：先扣血并渲染（避免 render 的 innerHTML 覆盖 -N/Miss），再播掉血/未命中表现 */
      var HIT_EFFECT_MS = 920;
      function applyAttackResult(result) {
        var had命仪精准 = getUnitBuffLayers(attacker, '命仪精准') > 0;
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        var maxAp = getApByLevel(attacker.level);
        var curAp =
          attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
        applyAllySkillApCost(attacker, skillAp, curAp);
        if (had命仪精准 && result.hit) {
          consumeBuffLayersFromUnit(attacker, '命仪精准', 99);
          attacker.buffs = (attacker.buffs || []).filter(function (bx) {
            return (bx.id || bx.name) !== '命仪精准';
          });
          var dhAfter = defender.hp != null ? parseInt(defender.hp, 10) : 0;
          if (dhAfter <= 0) {
            var partyLx = getParty();
            if (partyLx && partyLx.length) {
              for (var li = 0; li < partyLx.length; li++) {
                var lx = partyLx[li];
                if (!lx || (lx.name || '') !== '凌遥仙' || isAllyDefeated(lx)) continue;
                var maxLxAp = getEffectiveMaxApForAlly(lx);
                var curLxAp =
                  lx.currentAp !== undefined && lx.currentAp !== null ? parseInt(lx.currentAp, 10) : maxLxAp;
                lx.currentAp = Math.min(maxLxAp, curLxAp + 1);
                appendCombatLog(
                  (lx.name || '凌遥仙') + ' 命仪精准：友方击杀，回复 1 AP',
                );
                break;
              }
            }
          }
        }
        if ((skill.name || '') === '斩月') {
          var 攻势Layers = skill.advancement === 'A' ? 3 : 2;
          addBuffLayers(attacker, '攻势', '攻势', 攻势Layers);
          attacker.本回合已获得攻势守势 = true;
        }
        if ((skill.name || '') === '居合') {
          if (!skill.advancement) {
            addBuffLayers(attacker, '攻势', '攻势', 1);
            addBuffLayers(attacker, '守势', '守势', 1);
          } else if (skill.advancement === 'A') {
            var gs攻 = 0;
            var gs守 = 0;
            (attacker.buffs || []).forEach(function (b) {
              if ((b.id || b.name) === '攻势') gs攻 = parseInt(b.layers, 10) || 0;
              if ((b.id || b.name) === '守势') gs守 = parseInt(b.layers, 10) || 0;
            });
            if (gs攻 > gs守) addBuffLayers(attacker, '攻势', '攻势', 1);
          } else if (skill.advancement === 'B') {
            var shVal = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 0.5));
            attacker.currentShield =
              (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shVal;
            if (shVal > 0) addBuffLayers(attacker, '护盾', '护盾', shVal);
            var gs守2 = 0;
            var gs攻2 = 0;
            (attacker.buffs || []).forEach(function (b) {
              if ((b.id || b.name) === '守势') gs守2 = parseInt(b.layers, 10) || 0;
              if ((b.id || b.name) === '攻势') gs攻2 = parseInt(b.layers, 10) || 0;
            });
            if (gs守2 > gs攻2) addBuffLayers(attacker, '守势', '守势', 1);
          }
          attacker.本回合已获得攻势守势 = true;
        }
        if (skill.id === '一闪') {
          attacker.一闪必中 = null;
        }
        if (skill.id === '无拍子') {
          attacker.无拍子必中 = null;
        }
        if (skill.id === '一闪') {
          var 攻5 = 0;
          var 守5 = 0;
          (attacker.buffs || []).forEach(function (b) {
            if ((b.id || b.name) === '攻势') 攻5 = parseInt(b.layers, 10) || 0;
            if ((b.id || b.name) === '守势') 守5 = parseInt(b.layers, 10) || 0;
          });
          if (攻5 === 5 && 守5 === 5) {
            var sh一闪 = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 2.5));
            if (sh一闪 > 0) {
              attacker.currentShield =
                (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪;
              addBuffLayers(attacker, '护盾', '护盾', sh一闪);
            }
          } else if (守5 === 5) {
            var sh一闪 = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 1.5));
            if (sh一闪 > 0) {
              attacker.currentShield =
                (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪;
              addBuffLayers(attacker, '护盾', '护盾', sh一闪);
            }
          }
        }
        if (skill.id === '无拍子' && !attacker.本回合已获得攻势守势) {
          addBuffLayers(attacker, '攻势', '攻势', 3);
          addBuffLayers(attacker, '守势', '守势', 3);
          attacker.本回合已获得攻势守势 = true;
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (defenderSlotEl) {
          if (!result.hit) playMissEffect(defenderSlotEl);
        }
        applyAttackResultPart2(result, defenderSlotEl, { skipHitEffect: true });
      }
      /** 仅命中表现（可选）、debuff 延迟施加、日志与后续联动。opts.skipHitEffect 为 true 时不再播放命中表现（已在扣血前播放） */
      function applyAttackResultPart2(result, slotEl, opts) {
        if ((!opts || !opts.skipHitEffect) && slotEl) {
          if (!result.hit) playMissEffect(slotEl);
        }
        var HIT_EFFECT_MS = 920;
        var applyDebuffAfterHitAnim = function () {
          if (!result.hit) return;
          var skillName = skill.name || '';
          var str = getDisplayStat(attacker, 'str') || 0;
          if (skillName === '遒劲猛击') {
            if (skill.advancement === 'A') addBuffLayers(defender, '破甲', '破甲', 1);
            else if (skill.advancement === 'B')
              addBuffLayers(defender, '重伤', '重伤', Math.max(0, Math.floor(str * 0.2)));
          } else if (skillName === '斩杀') {
            if (skill.advancement === 'B') addBuffLayers(defender, '重伤', '重伤', Math.max(0, Math.floor(str * 0.4)));
          } else if (skillName === '斩月') {
            if (skill.advancement === 'B') {
              addBuffLayers(defender, '流血', '流血', 1);
              var 攻势Layers = 0;
              var ab = attacker.buffs || [];
              for (var zb = 0; zb < ab.length; zb++) {
                if (ab[zb].id === '攻势' || ab[zb].name === '攻势') {
                  攻势Layers = parseInt(ab[zb].layers, 10) || 0;
                  break;
                }
              }
              if (攻势Layers >= 5) addBuffLayers(defender, '破甲', '破甲', 1);
            }
          } else if (skill.id === '错金') {
            if (攻势N > 守势N) addBuffLayers(defender, '破甲', '破甲', 1);
            else if (守势N > 攻势N) addBuffLayers(defender, '缴械', '缴械', 1);
            else {
              addBuffLayers(defender, '破甲', '破甲', 1);
              addBuffLayers(defender, '缴械', '缴械', 1);
            }
          } else if (skillName === '缠绕撕咬') {
            addBuffLayers(defender, '破甲', '破甲', 1, attacker);
          } else if (skillName === '血触侵蚀') {
            addBuffLayers(defender, '中毒', '中毒', 2, attacker);
          }
          if (skill.id === '狼群围猎') {
            var partyAfter = getParty();
            var baiyaSlotNum = null;
            for (var si = 0; si < 6; si++) {
              if (partyAfter[si] && partyAfter[si].name === '白牙') {
                baiyaSlotNum = si + 1;
                break;
              }
            }
            if (!baiyaSlotNum) {
              addBuffLayers(defender, '重伤', '重伤', 2);
            }
          }
          saveBattleData(getParty(), getEnemyParty());
          renderAllySlots(getParty());
          renderEnemySlots(getEnemyParty());
        };
        setTimeout(applyDebuffAfterHitAnim, HIT_EFFECT_MS);
        if (skill.id === '狼群围猎') {
          var partyAfter = getParty();
          var baiyaSlotNum = null;
          for (var si = 0; si < 6; si++) {
            if (partyAfter[si] && partyAfter[si].name === '白牙') {
              baiyaSlotNum = si + 1;
              break;
            }
          }
          if (baiyaSlotNum) {
            setTimeout(function () {
              executeBaiyaBite(baiyaSlotNum, enemySlotNum, { free: true });
            }, 400);
          }
        }
        var attName = attacker.name || '己方';
        var defName = defender.name || '敌方';
        var skillName = skill.name || '攻击';
        var str = getDisplayStat(attacker, 'str') || 0;
        var agi = getDisplayStat(attacker, 'agi') || 0;
        var damageCalcStr = null;
        if ((skill.name || '') === '居合') {
          var lv = Math.max(1, parseInt(skill.level, 10) || 1);
          var multStr = lv === 1 ? 0.6 : lv === 2 ? 0.7 : lv === 3 ? 0.7 : 0.8;
          var multAgi = lv === 1 ? 0.3 : lv === 2 ? 0.3 : lv === 3 ? 0.4 : 0.4;
          if (skill.advancement === 'A') {
            multStr = 1.0;
            multAgi = 0.5;
          }
          if (skill.advancement === 'B') {
            multStr = 0.8;
            multAgi = 0.4;
          }
          damageCalcStr = '力量×' + multStr + '+敏捷×' + multAgi + '=' + baseDamage;
        } else if ((skill.name || '') === '斩月') {
          var lv = Math.max(1, parseInt(skill.level, 10) || 1);
          var mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
          if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
          if (skill.advancement === 'A') {
            var strVal = getDisplayStat(attacker, 'str') || 0;
            if (baseDamage === Math.max(0, Math.floor(strVal * 1.5))) mult = 1.5;
          }
          damageCalcStr = '力量×' + mult + '=' + baseDamage;
        } else if ((skill.name || '') === '错金' || (skill.id || '') === '错金') {
          damageCalcStr = '力量×1.6=' + baseDamage;
        } else if ((skill.name || '') === '一闪' || (skill.id || '') === '一闪') {
          damageCalcStr = '力量×3=' + baseDamage;
        } else if ((skill.name || '') === '无拍子' || (skill.id || '') === '无拍子') {
          damageCalcStr = '敏捷×1.2=' + baseDamage;
        } else if ((skill.name || '') === '遒劲猛击') {
          var lv = Math.max(1, parseInt(skill.level, 10) || 1);
          var mult = lv === 1 ? 1.05 : lv === 2 ? 1.1 : lv === 3 ? 1.15 : 1.2;
          damageCalcStr = '力量×' + mult + '=' + baseDamage;
        } else if ((skill.name || '') === '斩杀') {
          var lv = Math.max(1, parseInt(skill.level, 10) || 1);
          var mult = lv === 1 ? 1.3 : lv === 2 ? 1.4 : lv === 3 ? 1.5 : 1.6;
          var maxHpDef = defender.maxHp != null ? parseInt(defender.maxHp, 10) : 100;
          var curHpDef = defender.hp != null ? parseInt(defender.hp, 10) : maxHpDef;
          if (maxHpDef > 0 && curHpDef / maxHpDef < 0.3) damageCalcStr = '力量×' + mult + '×2(斩杀线)=' + baseDamage;
          else damageCalcStr = '力量×' + mult + '=' + baseDamage;
        } else if ((skill.name || '') === '狼牙碎击') {
          damageCalcStr = '力量×3=' + baseDamage;
        }
        var mult = str > 0 && !damageCalcStr ? (baseDamage / str).toFixed(2) : null;
        appendCombatLog(
          formatAttackLogLine(
            attName,
            skillName,
            defName,
            result,
            baseDamage,
            damageCalcStr ? null : '力量',
            mult,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (typeof window.toastr !== 'undefined') window.toastr.success(result.message);
        if (result.hit && defender.hp === 0 && (skill.name || '') === '斩杀' && skill.advancement === 'A') {
          var wwIdx = -1;
          if (attacker.skills && attacker.skills.length) {
            for (var w = 0; w < attacker.skills.length; w++) {
              if ((attacker.skills[w].name || '') === '狼式旋风') {
                wwIdx = w;
                break;
              }
            }
          }
          if (wwIdx >= 0) {
            setTimeout(function () {
              executePlayerWhirlwind(allySlot, wwIdx, { damageScale: 0.5, free: true });
            }, 400);
          }
        }
      }
      function doResolutionAndHit() {
        var raOpts = {};
        if (skillRangeOpts) {
          for (var rk in skillRangeOpts) {
            if (Object.prototype.hasOwnProperty.call(skillRangeOpts, rk)) raOpts[rk] = skillRangeOpts[rk];
          }
        }
        if (getUnitBuffLayers(attacker, '命仪精准') > 0) {
          raOpts.forceHit = true;
          raOpts.forceCrit = true;
        }
        var result = resolveAttack(attacker, defender, baseDamage, true, raOpts);
        if (result.crit && attacker.纳刀共鸣暴击加成 != null) {
          result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
          attacker.纳刀共鸣暴击加成 = null;
        }
        applyAttackResult(result);
        if (attacker.name === '岚') {
          if ((skill.attribute2 || '') === '近战') attacker.本回合用过近战 = true;
          if (result.hit) {
            if ((skill.attribute2 || '') === '近战') addBuffLayers(attacker, '锁定', '锁定', 1);
            else if ((skill.attribute2 || '') === '远程') addBuffLayers(attacker, '扑杀', '扑杀', 1);
            try岚死亡之眼Apply(attacker, defender, enemySlotNum);
          }
          try岚猎手本能Heal(attacker, defender);
        }
      }
      var isAttackSkill = (skill.name || '') === '攻击';
      var skillRangeOpts = null;
      var _rangeTmp = {};
      if ((skill.attribute2 || '') === '近战') _rangeTmp.isMelee = true;
      else if ((skill.attribute2 || '') === '远程') _rangeTmp.isRanged = true;
      var _a1 = String(skill.attribute1 || '').trim();
      if (_a1 === '自然' || _a1 === '奥术' || _a1 === '心灵' || _a1 === '火焰') _rangeTmp.magicOnly = true;
      if (Object.keys(_rangeTmp).length) skillRangeOpts = _rangeTmp;
      if (isAttackSkill) {
        var atkOpts0 = { isMelee: true };
        if (getUnitBuffLayers(attacker, '命仪精准') > 0) {
          atkOpts0.forceHit = true;
          atkOpts0.forceCrit = true;
        }
        var result = resolveAttack(attacker, defender, baseDamage, true, atkOpts0);
        if (result.crit && attacker.纳刀共鸣暴击加成 != null) {
          result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
          attacker.纳刀共鸣暴击加成 = null;
        }
        playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
          playSlashOnSlot(defenderSlotEl, result.hit, function () {
            applyAttackResult(result);
            if (attacker.name === '岚') {
              attacker.本回合用过近战 = true;
              if (result.hit) {
                addBuffLayers(attacker, '锁定', '锁定', 1);
                try岚死亡之眼Apply(attacker, defender, enemySlotNum);
              }
              try岚猎手本能Heal(attacker, defender);
            }
            if (attacker.name === '清漓' && result.hit) try清漓沧澜被动剑势(attacker);
            if (attacker.name === '清漓')
              on清漓指令完成(attacker, skill, { apCost: skillAp, commandUniqueKey: '攻击' });
          });
        });
      } else {
        var raOptsAnim = {};
        if (skillRangeOpts) {
          for (var rka in skillRangeOpts) {
            if (Object.prototype.hasOwnProperty.call(skillRangeOpts, rka)) raOptsAnim[rka] = skillRangeOpts[rka];
          }
        }
        if (getUnitBuffLayers(attacker, '命仪精准') > 0) {
          raOptsAnim.forceHit = true;
          raOptsAnim.forceCrit = true;
        }
        var result = resolveAttack(attacker, defender, baseDamage, true, raOptsAnim);
        if (result.crit && attacker.纳刀共鸣暴击加成 != null) {
          result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
          attacker.纳刀共鸣暴击加成 = null;
        }
        var animKey =
          (skill.name || '') === '遒劲猛击'
            ? 'Claw'
            : (skill.name || '') === '斩月' || (skill.name || '') === '居合'
              ? 'Slash5'
              : (skill.name || '') === '斩杀'
                ? 'E-blood1'
                : skill.id === '狼群围猎' || (skill.name || '') === '狼群围猎'
                  ? 'ClawSpecial2'
                  : skill.id === '错金'
                    ? 'Slash5'
                    : skill.id === '一闪' || skill.id === '无拍子'
                      ? 'E-sword6'
                      : null;
        if (animKey) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
          playStrikeShake(attackerSlotEl, slotEl, function () {
            playAnimationOnSlot(slotEl, animKey, function () {
              var had命仪精准Anim = getUnitBuffLayers(attacker, '命仪精准') > 0;
              applyDamageToTarget(
                defender,
                result.finalDamage,
                result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
              );
              var maxAp = getApByLevel(attacker.level);
              var curAp =
                attacker.currentAp !== undefined && attacker.currentAp !== null
                  ? parseInt(attacker.currentAp, 10)
                  : maxAp;
              applyAllySkillApCost(attacker, skillAp, curAp);
              if (had命仪精准Anim && result.hit) {
                consumeBuffLayersFromUnit(attacker, '命仪精准', 99);
                attacker.buffs = (attacker.buffs || []).filter(function (bx) {
                  return (bx.id || bx.name) !== '命仪精准';
                });
                var dhAnim = defender.hp != null ? parseInt(defender.hp, 10) : 0;
                if (dhAnim <= 0) {
                  var partyMx = getParty();
                  if (partyMx && partyMx.length) {
                    for (var mi = 0; mi < partyMx.length; mi++) {
                      var lxU = partyMx[mi];
                      if (!lxU || (lxU.name || '') !== '凌遥仙' || isAllyDefeated(lxU)) continue;
                      var maxLxU = getEffectiveMaxApForAlly(lxU);
                      var curLxU =
                        lxU.currentAp !== undefined && lxU.currentAp !== null
                          ? parseInt(lxU.currentAp, 10)
                          : maxLxU;
                      lxU.currentAp = Math.min(maxLxU, curLxU + 1);
                      appendCombatLog((lxU.name || '凌遥仙') + ' 命仪精准：友方击杀，回复 1 AP');
                      break;
                    }
                  }
                }
              }
              if ((skill.name || '') === '斩月') {
                var 攻势Layers = skill.advancement === 'A' ? 3 : 2;
                addBuffLayers(attacker, '攻势', '攻势', 攻势Layers);
                attacker.本回合已获得攻势守势 = true;
              }
              if ((skill.name || '') === '居合') {
                if (!skill.advancement) {
                  addBuffLayers(attacker, '攻势', '攻势', 1);
                  addBuffLayers(attacker, '守势', '守势', 1);
                } else if (skill.advancement === 'A') {
                  var gs攻A = 0;
                  var gs守A = 0;
                  (attacker.buffs || []).forEach(function (b) {
                    if ((b.id || b.name) === '攻势') gs攻A = parseInt(b.layers, 10) || 0;
                    if ((b.id || b.name) === '守势') gs守A = parseInt(b.layers, 10) || 0;
                  });
                  if (gs攻A > gs守A) addBuffLayers(attacker, '攻势', '攻势', 1);
                } else if (skill.advancement === 'B') {
                  var shValB = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 0.5));
                  attacker.currentShield =
                    (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shValB;
                  if (shValB > 0) addBuffLayers(attacker, '护盾', '护盾', shValB);
                  var gs守B = 0;
                  var gs攻B = 0;
                  (attacker.buffs || []).forEach(function (b) {
                    if ((b.id || b.name) === '守势') gs守B = parseInt(b.layers, 10) || 0;
                    if ((b.id || b.name) === '攻势') gs攻B = parseInt(b.layers, 10) || 0;
                  });
                  if (gs守B > gs攻B) addBuffLayers(attacker, '守势', '守势', 1);
                }
                attacker.本回合已获得攻势守势 = true;
              }
              if (attacker.name === '岚') {
                if ((skill.attribute2 || '') === '近战') attacker.本回合用过近战 = true;
                if (result.hit) {
                  if ((skill.attribute2 || '') === '近战') addBuffLayers(attacker, '锁定', '锁定', 1);
                  else if ((skill.attribute2 || '') === '远程') addBuffLayers(attacker, '扑杀', '扑杀', 1);
                  try岚死亡之眼Apply(attacker, defender, enemySlotNum);
                }
                try岚猎手本能Heal(attacker, defender);
              }
              if (skill.id === '一闪') attacker.一闪必中 = null;
              if (skill.id === '无拍子') attacker.无拍子必中 = null;
              if (skill.id === '一闪') {
                var 攻5a = 0;
                var 守5a = 0;
                (attacker.buffs || []).forEach(function (b) {
                  if ((b.id || b.name) === '攻势') 攻5a = parseInt(b.layers, 10) || 0;
                  if ((b.id || b.name) === '守势') 守5a = parseInt(b.layers, 10) || 0;
                });
                if (攻5a === 5 && 守5a === 5) {
                  var sh一闪a = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 2.5));
                  if (sh一闪a > 0) {
                    attacker.currentShield =
                      (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪a;
                    addBuffLayers(attacker, '护盾', '护盾', sh一闪a);
                  }
                } else if (守5a === 5) {
                  var sh一闪a = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 1.5));
                  if (sh一闪a > 0) {
                    attacker.currentShield =
                      (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪a;
                    addBuffLayers(attacker, '护盾', '护盾', sh一闪a);
                  }
                }
              }
              if (skill.id === '无拍子' && !attacker.本回合已获得攻势守势) {
                addBuffLayers(attacker, '攻势', '攻势', 3);
                addBuffLayers(attacker, '守势', '守势', 3);
                attacker.本回合已获得攻势守势 = true;
              }
              saveBattleData(party, enemies);
              renderAllySlots(party);
              renderEnemySlots(enemies);
              if (slotEl) {
                if (!result.hit) playMissEffect(slotEl);
              }
              applyAttackResultPart2(result, slotEl, { skipHitEffect: true });
            });
          });
        } else {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            applyAttackResult(result);
          });
        }
      }
    }
    /** 残影步：黯获得灵巧层数并设置闪避反击参数，不选目标 */
    function executePlayer残影步(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '黯' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '残影步') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var layers = lv <= 2 ? 2 : 3;
      if (skill.advancement === 'A' || skill.advancement === 'B') layers = 3;
      addBuffLayers(attacker, '灵巧', '灵巧', layers);
      var multStr = 0.3;
      var multInt = 0;
      var 流血 = false;
      var 暗蚀 = false;
      if (lv >= 2) multStr = 0.4;
      if (lv >= 4) multStr = 0.5;
      if (skill.advancement === 'A') {
        multStr = 0.5;
        流血 = true;
      }
      if (skill.advancement === 'B') {
        multStr = 0.2;
        multInt = 0.3;
        暗蚀 = true;
      }
      attacker.残影步反击 = { multStr: multStr, multInt: multInt, 流血: 流血, 暗蚀: 暗蚀 };
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '黯') + ' 使用残影步，获得' + layers + '层【灵巧】');
      if (typeof window.toastr !== 'undefined') window.toastr.success('获得' + layers + '层【灵巧】');
      var slotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      if (slotEl) playAnimationOnSlot(slotEl, 'Recovery2', function () {});
    }
    /** 血舞枪刃：单体物理/魔法伤害，施加流血；A 按目标流血层数增伤，B 魔法伤害并施加暗蚀 */
    function executePlayer血舞枪刃(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '血舞枪刃') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      if (skill.advancement === 'A') {
        var 流血L = 0;
        (defender.buffs || []).forEach(function (b) {
          if ((b.id || b.name) === '流血') 流血L = Math.max(0, parseInt(b.layers, 10) || 0);
        });
        var mult = 1 + Math.min(3, Math.floor(流血L / 10)) * 0.2;
        baseDamage = Math.max(0, Math.floor(baseDamage * mult));
      }
      var result = resolveAttack(
        attacker,
        defender,
        baseDamage,
        true,
        skill.advancement === 'B' ? { magicOnly: true } : undefined,
      );
      var attName = attacker.name || '黯';
      var defName = defender.name || '敌方';
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var int = getDisplayStat(attacker, 'int') || 0;
      var fStr = Math.floor(str * 0.8);
      var fSecond = skill.advancement === 'B' ? Math.floor(int * 0.4) : Math.floor(agi * 0.4);
      var baseForFormula = fStr + fSecond;
      var damageCalcStr =
        skill.advancement === 'B'
          ? '力量×0.8=' + fStr + '+智力×0.4=' + fSecond + '=' + baseForFormula
          : '力量×0.8=' + fStr + '+敏捷×0.4=' + fSecond + '=' + baseForFormula;
      if (skill.advancement === 'A' && baseDamage !== baseForFormula) {
        var 流血L = 0;
        (defender.buffs || []).forEach(function (b) {
          if ((b.id || b.name) === '流血') 流血L = Math.max(0, parseInt(b.layers, 10) || 0);
        });
        var 流血Pct = Math.min(3, Math.floor(流血L / 10)) * 20;
        damageCalcStr += '；流血+' + 流血Pct + '%=' + baseDamage;
      }
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit) {
          addBuffLayers(defender, '流血', '流血', 1, attacker);
          if (skill.advancement === 'B') addBuffLayers(defender, '暗蚀', '暗蚀', 1, attacker);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(attName, '血舞枪刃', defName, result, baseDamage, null, null, defender.hp, damageCalcStr),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.info(result.hit ? '造成 ' + result.finalDamage + ' 点伤害' : '未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'E-dark1', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 暗夜帷幕：不选目标，对敌方全体造成魔法伤害；A 施加虚弱并设 2 回合末伤害，B 对命中目标施加暗蚀 */
    function executePlayer暗夜帷幕(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '黯' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '暗夜帷幕') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var targets = [];
      for (var i = 1; i <= 6; i++) {
        var def = enemies[i - 1];
        if (def && (def.hp == null || parseInt(def.hp, 10) > 0)) {
          var res = resolveAttack(attacker, def, baseDamage, true, { magicOnly: true });
          targets.push({ slotNum: i, defender: def, result: res });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var attName = attacker.name || '黯';
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.45 : lv === 2 ? 0.5 : lv === 3 ? 0.55 : 0.6;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 0.6;
      var damageCalcStr = '智力×' + mult + '=' + baseDamage;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function afterDarknessAnim() {
        for (var t = 0; t < targets.length; t++) {
          var def = targets[t].defender;
          var res = targets[t].result;
          applyDamageToTarget(def, res.finalDamage, res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined);
          if (skill.advancement === 'A') {
            addBuffLayers(def, '虚弱', '虚弱', 2);
          } else if (skill.advancement === 'B' && res.hit) {
            addBuffLayers(def, '暗蚀', '暗蚀', 2, attacker);
          }
          appendCombatLog(
            formatAttackLogLine(
              attName,
              '暗夜帷幕',
              def.name || '敌方',
              res,
              baseDamage,
              null,
              null,
              def.hp,
              damageCalcStr,
            ),
          );
        }
        if (skill.advancement === 'A') {
          暗夜帷幕A_State = {
            roundsLeft: 2,
            damagePerTick: Math.max(0, Math.floor((getDisplayStat(attacker, 'int') || 0) * 0.25)),
          };
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var t2 = 0; t2 < targets.length; t2++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t2].slotNum + '"]');
          if (slotEl && !targets[t2].result.hit) playMissEffect(slotEl);
        }
        if (typeof window.toastr !== 'undefined') window.toastr.success('暗夜帷幕 释放完毕');
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'Darkness1', afterDarknessAnim);
        });
      } else {
        afterDarknessAnim();
      }
    }
    /** 每回合开始时（进入 player_action 时）结算 虚无放逐 回归伤害：移除虚无状态并对敌方全体造成伤害 */
    function run虚无放逐Return() {
      var party = getParty();
      var enemies = getEnemyParty();
      if (!party || !enemies) return;
      var toProcess = [];
      var i;
      for (i = 0; i < party.length; i++) {
        var ch = party[i];
        if (!ch || !ch.buffs || !ch.虚无放逐_return) continue;
        var hasVoid = ch.buffs.some(function (b) {
          return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
        });
        if (!hasVoid) continue;
        var ret = ch.虚无放逐_return;
        ch.buffs = ch.buffs.filter(function (b) {
          return b.id !== '虚无' && b.name !== '虚无';
        });
        delete ch.虚无放逐_return;
        var fakeSkill = { name: '虚无放逐', level: ret.level || 1, advancement: ret.advancement || null };
        var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(ch, fakeSkill)));
        var attName = ch.name || '夜露';
        var has精神渗透 =
          ch.name === '夜露' && ch.specialSkillsUnlocked && ch.specialSkillsUnlocked.indexOf('精神渗透') !== -1;
        var isMental = ret.advancement === 'A';
        var targets = [];
        for (var j = 0; j < enemies.length; j++) {
          var def = enemies[j];
          if (def && (def.hp == null || parseInt(def.hp, 10) > 0)) {
            var res = resolveAttack(ch, def, baseDamage, true, isMental ? { magicOnly: true } : undefined);
            var effDmg = res.finalDamage;
            if (!res.hit && isMental && has精神渗透) effDmg = Math.max(0, Math.floor(baseDamage * 0.5));
            targets.push({ slotNum: j + 1, defender: def, result: res, effectiveDamage: effDmg });
          }
        }
        toProcess.push({ ch: ch, ret: ret, targets: targets, baseDamage: baseDamage, attName: attName });
      }
      if (toProcess.length === 0) return;
      function applyReturnDamage() {
        for (var k = 0; k < toProcess.length; k++) {
          var item = toProcess[k];
          for (var t = 0; t < item.targets.length; t++) {
            applyDamageToTarget(item.targets[t].defender, item.targets[t].effectiveDamage);
            if (item.ch.name === '夜露')
              yoruConsumeCharmIfHit(item.ch, item.targets[t].defender, item.targets[t].effectiveDamage > 0);
            if (item.ret.advancement === 'B') addBuffLayers(item.targets[t].defender, '燃烧', '燃烧', 1, item.ch);
            var logResult =
              item.targets[t].effectiveDamage > 0 && !item.targets[t].result.hit
                ? { ...item.targets[t].result, hit: true, finalDamage: item.targets[t].effectiveDamage }
                : item.targets[t].result;
            appendCombatLog(
              formatAttackLogLine(
                item.attName,
                '虚无放逐回归',
                item.targets[t].defender.name || '敌方',
                logResult,
                item.baseDamage,
                null,
                null,
                item.targets[t].defender.hp,
                '智力×系数=' + item.baseDamage,
              ),
            );
          }
        }
        saveBattleData(party, getEnemyParty());
        renderAllySlots(party);
        renderEnemySlots(getEnemyParty());
      }
      var enemySideEl = document.querySelector('.side-enemy');
      if (enemySideEl && window.ANIMATIONS && window.ANIMATIONS.Blackhole) {
        playAnimationOnContainer(enemySideEl, 'Blackhole', applyReturnDamage);
      } else {
        applyReturnDamage();
      }
    }
    /** 每回合开始时（进入 player_action 时）结算 暗夜帷幕 A 的回合末伤害 */
    function run暗夜帷幕ATick() {
      if (!暗夜帷幕A_State || 暗夜帷幕A_State.roundsLeft <= 0) return;
      var enemies = getEnemyParty();
      var dmg = 暗夜帷幕A_State.damagePerTick || 0;
      if (dmg <= 0 || !enemies || !enemies.length) {
        暗夜帷幕A_State.roundsLeft--;
        if (暗夜帷幕A_State.roundsLeft <= 0) 暗夜帷幕A_State = null;
        return;
      }
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (e && (e.hp == null || parseInt(e.hp, 10) > 0)) {
          applyDamageToTarget(e, dmg);
          appendCombatLog(
            '暗夜帷幕·窒息迷雾：对 ' +
              (e.name || '敌方') +
              ' 造成 ' +
              dmg +
              ' 点魔法伤害；' +
              (e.name || '敌方') +
              '剩余Hp:' +
              (e.hp != null ? e.hp : '') +
              '；',
          );
        }
      }
      saveBattleData(getParty(), enemies);
      renderAllySlots(getParty());
      renderEnemySlots(enemies);
      暗夜帷幕A_State.roundsLeft--;
      if (暗夜帷幕A_State.roundsLeft <= 0) 暗夜帷幕A_State = null;
    }
    /** 魔龙舞：黯特殊技能。物理/近战/单体，消耗 3 AP。对单体进行 3+[Agi×0.125] 次判定，每次造成 [Agi×0.4] 的物理伤害。 */
    function executePlayer魔龙舞(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '黯' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 3;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var numHits = 3 + Math.floor(agi * 0.125);
      var perHitDamage = Math.max(0, Math.floor(agi * 0.4));
      var hitIdx = 0;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function doOneHit() {
        if (hitIdx >= numHits) {
          attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof window.toastr !== 'undefined') window.toastr.success('魔龙舞 释放完毕');
          return;
        }
        var result = resolveAttack(attacker, defender, perHitDamage, true);
        function applyThisHit() {
          applyDamageToTarget(
            defender,
            result.finalDamage,
            result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
          );
          var attName = attacker.name || '黯';
          var defName = defender.name || '敌方';
          var multAgi = agi > 0 ? (perHitDamage / agi).toFixed(2) : null;
          appendCombatLog(
            formatAttackLogLine(attName, '魔龙舞', defName, result, perHitDamage, '敏捷', multAgi, defender.hp),
          );
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (defenderSlotEl) {
            if (!result.hit) playMissEffect(defenderSlotEl);
          }
          hitIdx++;
          setTimeout(doOneHit, result.hit ? 220 : 920);
        }
        if (attackerSlotEl && defenderSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            if (result.hit) playAnimationOnSlot(defenderSlotEl, 'E-dark1', applyThisHit);
            else applyThisHit();
          });
        } else {
          applyThisHit();
        }
      }
      doOneHit();
    }
    /** 威慑怒吼：不选目标，自身获得 2 层【嘲讽】及护盾（Def×1.2 + Def×0.4×敌方存在数量） */
    function executePlayerWeiSheNuHou(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var def = getDisplayStat(attacker, 'def') || 0;
      var enemyCount = 0;
      for (var e = 0; e < (enemies && enemies.length ? enemies.length : 0); e++) {
        if (enemies[e] != null) enemyCount++;
      }
      var shieldValue = Math.floor(def * 1.2) + Math.floor(def * 0.4) * enemyCount;
      shieldValue = Math.max(0, shieldValue);
      addBuffLayers(attacker, '嘲讽', '嘲讽', 2);
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shieldValue;
      if (shieldValue > 0) addBuffLayers(attacker, '护盾', '护盾', shieldValue);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '己方') + ' 使用威慑怒吼，获得2层【嘲讽】与 ' + shieldValue + ' 点护盾');
      if (typeof window.toastr !== 'undefined') window.toastr.success('获得2层【嘲讽】与 ' + shieldValue + ' 点护盾');
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          if (allySlotEl) playAnimationOnSlot(allySlotEl, 'Recovery4', function () {});
        });
      });
    }
    /** 深渊终结：黯特殊技能。暗影/近战/单体，消耗 2 AP。对单体造成 [Int×2.0] 魔法伤害；目标每有1层【暗蚀】伤害+20%（最高+60%）；施放后消耗目标所有【暗蚀】。 */
    function executePlayer深渊终结(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '黯' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var int = getDisplayStat(attacker, 'int') || 0;
      var baseDamage = Math.max(0, Math.floor(int * 2.0));
      var 暗蚀L = 0;
      (defender.buffs || []).forEach(function (b) {
        if ((b.id || b.name) === '暗蚀') 暗蚀L = Math.max(0, parseInt(b.layers, 10) || 0);
      });
      var mult = 1 + Math.min(3, 暗蚀L) * 0.2;
      baseDamage = Math.max(0, Math.floor(baseDamage * mult));
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var attName = attacker.name || '黯';
      var defName = defender.name || '敌方';
      var damageCalcStr = '智力×2.0=' + Math.floor(int * 2.0);
      if (暗蚀L > 0) damageCalcStr += '；暗蚀+' + Math.min(3, 暗蚀L) * 20 + '%=' + baseDamage;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (defender.buffs && defender.buffs.length) {
          for (var i = 0; i < defender.buffs.length; i++) {
            if ((defender.buffs[i].id || defender.buffs[i].name) === '暗蚀') defender.buffs[i].layers = 0;
          }
          defender.buffs = defender.buffs.filter(function (b) {
            return (parseInt(b.layers, 10) || 0) > 0;
          });
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            '深渊终结',
            defName,
            result,
            baseDamage,
            '智力',
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (暗蚀L > 0) appendCombatLog(defName + ' 的【暗蚀】已消耗');
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(result.hit ? '深渊终结 造成 ' + result.finalDamage + ' 点伤害' : '深渊终结 未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'E-fire2', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 魅魔之吻：夜露特殊技能。心灵/近战/单体，1 AP。对单体造成 [Int×0.8+Cha×0.8] 心灵伤害，施加1层【魅惑】；若【魅惑】达3层则目标对自身造成 [目标ATK×1.0] 伤害。 */
    function executePlayer魅魔之吻(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '夜露' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, { id: '魅魔之吻' })));
      var has精神渗透 = attacker.specialSkillsUnlocked && attacker.specialSkillsUnlocked.indexOf('精神渗透') !== -1;
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var attName = attacker.name || '夜露';
      var defName = defender.name || '敌方';
      var damageCalcStr = 'Int×0.8+Cha×0.8=' + baseDamage;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var effectiveDamage = result.finalDamage;
      var applyCharm = result.hit;
      var applySelfDamage = false;
      var selfDamageVal = 0;
      if (!result.hit && has精神渗透) {
        effectiveDamage = Math.max(0, Math.floor(baseDamage * 0.5));
        applyCharm = false;
      } else if (result.hit) {
        var 魅惑Before = 0;
        (defender.buffs || []).forEach(function (b) {
          if ((b.id || b.name) === '魅惑') 魅惑Before = Math.max(0, parseInt(b.layers, 10) || 0);
        });
        var 魅惑After = 魅惑Before + 1;
        if (魅惑After >= 3) {
          var defAtk = defender.atk != null ? parseInt(defender.atk, 10) : 0;
          selfDamageVal = Math.max(0, Math.floor(defAtk * 1.0));
          applySelfDamage = selfDamageVal > 0;
        }
      }
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(defender, effectiveDamage, undefined);
        if (applyCharm) {
          addBuffLayers(defender, '魅惑', '魅惑', 1, attacker);
          appendCombatLog(attName + ' 对 ' + defName + ' 施加1层【魅惑】');
        }
        if (applySelfDamage) {
          applyDamageToTarget(defender, selfDamageVal, undefined);
          var escapeLogHtml = function (s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
          };
          var atkIconHtml =
            '<span class="slot-enemy-atk-icon" style="display:inline-flex;align-items:center;vertical-align:middle">' +
            (SKILL_ATTACK_SVG || '') +
            '</span>';
          appendCombatLog({
            text: defName + ' 【魅惑】达3层，对自身造成 ' + selfDamageVal + ' 点伤害',
            html:
              escapeLogHtml(defName) + ' 【魅惑】达3层，对自身造成 ' + atkIconHtml + ' ' + selfDamageVal + ' 的伤害',
          });
        }
        yoruConsumeCharmIfHit(attacker, defender, result.hit);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            '魅魔之吻',
            defName,
            { hit: result.hit, finalDamage: effectiveDamage, message: result.message },
            baseDamage,
            null,
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(
            result.hit || has精神渗透 ? '魅魔之吻 造成 ' + effectiveDamage + ' 点伤害' : '魅魔之吻 未命中',
          );
      }
      if (defenderSlotEl) {
        if (!result.hit && !has精神渗透) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Mist-Pink', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 灵魂盛宴：夜露特殊技能。心灵/远程/群体，2 AP。对敌方全体造成 [Cha×1.2] 心灵伤害；每个【魅惑】敌人使夜露回复 [Cha×1.0] 生命。 */
    function executePlayer灵魂盛宴(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '夜露' || isAllyDefeated(attacker)) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, { id: '灵魂盛宴' })));
      var has精神渗透 = attacker.specialSkillsUnlocked && attacker.specialSkillsUnlocked.indexOf('精神渗透') !== -1;
      var cha = getDisplayStat(attacker, 'cha') || 0;
      var healPerCharm = Math.max(0, Math.floor(cha * 1.0));
      var targets = [];
      for (var i = 1; i <= 6; i++) {
        var def = enemies[i - 1];
        if (def && (def.hp == null || parseInt(def.hp, 10) > 0)) {
          var res = resolveAttack(attacker, def, baseDamage, true, { magicOnly: true });
          var effDmg = res.finalDamage;
          if (!res.hit && has精神渗透) effDmg = Math.max(0, Math.floor(baseDamage * 0.5));
          targets.push({ slotNum: i, defender: def, result: res, effectiveDamage: effDmg });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var attName = attacker.name || '夜露';
      var damageCalcStr = 'Cha×1.2=' + baseDamage;
      var charmCount = 0;
      for (var t = 0; t < targets.length; t++) {
        var def = targets[t].defender;
        var hasCharm = (def.buffs || []).some(function (b) {
          return (b.id === '魅惑' || b.name === '魅惑') && (parseInt(b.layers, 10) || 0) > 0;
        });
        if (hasCharm) charmCount++;
      }
      var totalHeal = charmCount * healPerCharm;
      totalHeal = apply丝伊德共生母胎HealMultiplier(attacker, totalHeal);
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function afterSoulAnim() {
        for (var t = 0; t < targets.length; t++) {
          var def = targets[t].defender;
          var effDmg = targets[t].effectiveDamage;
          applyDamageToTarget(def, effDmg, undefined);
          yoruConsumeCharmIfHit(attacker, def, targets[t].result.hit || has精神渗透);
          appendCombatLog(
            formatAttackLogLine(
              attName,
              '灵魂盛宴',
              def.name || '敌方',
              { hit: targets[t].result.hit, finalDamage: effDmg },
              baseDamage,
              null,
              null,
              def.hp,
              damageCalcStr,
            ),
          );
        }
        if (totalHeal > 0) {
          var mHp =
            attacker.maxHp != null ? parseInt(attacker.maxHp, 10) : getHpFromSta(getDisplayStat(attacker, 'sta') || 1);
          var cHp = attacker.hp != null ? parseInt(attacker.hp, 10) : mHp;
          attacker.hp = Math.min(mHp, cHp + totalHeal);
          appendCombatLog(attName + ' 灵魂盛宴：' + charmCount + ' 个【魅惑】目标，回复 ' + totalHeal + ' 点生命');
          if (attackerSlotEl) playHealEffect(attackerSlotEl, totalHeal);
        }
        for (var tt = 0; tt < targets.length; tt++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[tt].slotNum + '"]');
          if (slotEl && !targets[tt].result.hit && !has精神渗透) playMissEffect(slotEl);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (typeof window.toastr !== 'undefined')
          window.toastr.success('灵魂盛宴 释放完毕' + (totalHeal > 0 ? '，回复 ' + totalHeal + ' 生命' : ''));
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'Mist-Pink', afterSoulAnim);
        });
      } else {
        afterSoulAnim();
      }
    }
    /** 大妃的魔宴：月见遥特殊。奥术/远程/单体，3 AP。[Int×2.5]；每种不同减益 +15%（至多 5 种）。 */
    function executePlayer大妃的魔宴(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '月见遥' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 3;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp != null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var intv = getDisplayStat(attacker, 'int') || 0;
      var baseDmg = Math.max(0, Math.floor(intv * 2.5));
      var distinct = countDistinctDebuffTypesFor大妃魔宴(defender);
      var bonusPct = Math.min(5, distinct) * 0.15;
      var finalBase = Math.max(0, Math.floor(baseDmg * (1 + bonusPct)));
      var result = resolveAttack(attacker, defender, finalBase, true, { magicOnly: true });
      applyAllySkillApCost(attacker, skillAp, curAp);
      applyDamageToTarget(defender, result.finalDamage);
      appendCombatLog(
        formatAttackLogLine(
          attacker.name || '月见遥',
          '大妃的魔宴',
          defender.name || '敌方',
          result,
          finalBase,
          null,
          null,
          defender.hp,
          'Int×2.5，' + distinct + ' 种减益',
        ),
      );
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      if (typeof window.toastr !== 'undefined') window.toastr.success('大妃的魔宴');
    }
    function pick傀儡剧场随机目标槽(party, enemies, yueSlot) {
      var opts = [];
      var i,
        u,
        hp,
        hpE = 0;
      for (i = 1; i <= SLOT_COUNT; i++) {
        u = party[i - 1];
        if (!u || i === yueSlot) continue;
        hp = u.hp != null ? parseInt(u.hp, 10) : getHpFromSta(getDisplayStat(u, 'sta') || 1);
        if ((hp || 0) <= 0) continue;
        opts.push({ side: 'ally', slot: i, unit: u });
      }
      for (i = 1; i <= SLOT_COUNT; i++) {
        u = enemies[i - 1];
        if (!u) continue;
        hpE = parseInt(u.hp, 10) || 0;
        if (hpE <= 0) continue;
        opts.push({ side: 'enemy', slot: i, unit: u });
      }
      if (opts.length === 0) return null;
      return opts[Math.floor(Math.random() * opts.length)];
    }
    /** 傀儡剧场：月见遥特殊。心灵/远程/群体，2 AP。 */
    function executePlayer傀儡剧场(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '月见遥' || isAllyDefeated(attacker)) return;
      var skillAp = 2;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp != null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var intv = getDisplayStat(attacker, 'int') || 0;
      var baseAoe = Math.max(0, Math.floor(intv * 0.6));
      var yueSlot = allySlot;
      var hasAnyEnemy = false;
      var ei;
      for (ei = 1; ei <= 6; ei++) {
        var de = enemies[ei - 1];
        if (de && (parseInt(de.hp, 10) || 0) > 0) {
          hasAnyEnemy = true;
          break;
        }
      }
      if (!hasAnyEnemy) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      applyAllySkillApCost(attacker, skillAp, curAp);
      for (ei = 1; ei <= 6; ei++) {
        var def = enemies[ei - 1];
        if (!def || (parseInt(def.hp, 10) || 0) <= 0) continue;
        var res = resolveAttack(attacker, def, baseAoe, true, { magicOnly: true });
        applyDamageToTarget(def, res.finalDamage);
        appendCombatLog(
          formatAttackLogLine(
            attacker.name || '月见遥',
            '傀儡剧场（群体）',
            def.name || '敌方',
            res,
            baseAoe,
            null,
            null,
            def.hp,
            'Int×0.6',
          ),
        );
      }
      for (ei = 1; ei <= 6; ei++) {
        var mon = enemies[ei - 1];
        if (!mon || (parseInt(mon.hp, 10) || 0) <= 0) continue;
        var atkVal = Math.max(1, parseInt(mon.atk, 10) || 0);
        var pick = pick傀儡剧场随机目标槽(party, enemies, yueSlot);
        if (!pick) continue;
        var tgt = pick.unit;
        var res2 = resolveAttack(mon, tgt, atkVal, false);
        if (pick.side === 'ally') {
          applyDamageToAllyAndTry弹返(tgt, mon, res2.finalDamage);
        } else {
          applyDamageToTarget(tgt, res2.finalDamage);
        }
        appendCombatLog(
          (mon.name || '敌方') +
            ' 傀儡剧场：攻击 ' +
            (tgt.name || '目标') +
            ' ' +
            (res2.hit ? '命中' : '未命中') +
            '，' +
            res2.finalDamage +
            ' 伤害',
        );
      }
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      if (typeof window.toastr !== 'undefined') window.toastr.success('傀儡剧场');
    }
    /** 完美谎言：月见遥特殊。1 AP，指定友方为替身。 */
    function executePlayer完美谎言(allySlot, decoySlot) {
      var party = getParty();
      var attacker = party[allySlot - 1];
      var decoy = decoySlot >= 1 && decoySlot <= 6 ? party[decoySlot - 1] : null;
      if (!attacker || attacker.name !== '月见遥' || isAllyDefeated(attacker)) return;
      if (!decoy || decoySlot === allySlot || (parseInt(decoy.hp, 10) || 0) <= 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('请选择一名其他友方作为替身');
        return;
      }
      var skillAp = 1;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp != null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      applyAllySkillApCost(attacker, skillAp, curAp);
      battleState.月见遥完美谎言替身槽 = decoySlot;
      appendCombatLog(
        (attacker.name || '月见遥') + ' 「完美谎言」：' + (decoy.name || '友方') + ' 成为幻术替身（下一次敌方随机单体攻击若指向月见遥则改打该目标）',
      );
      saveBattleData(party, getEnemyParty());
      renderAllySlots(party);
      if (typeof window.toastr !== 'undefined') window.toastr.success('完美谎言');
    }
    /** 虚实颠倒：月见遥特殊。魔法/远程/单体，2 AP。 */
    function executePlayer虚实颠倒(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '月见遥' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 2;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp != null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      if ((parseInt(defender.hp, 10) || 0) <= 0) return;
      applyAllySkillApCost(attacker, skillAp, curAp);
      addBuffLayers(defender, '虚实颠倒', '虚实颠倒', 1);
      capUnitBuffs(defender);
      appendCombatLog(
        (attacker.name || '月见遥') + ' 对 ' + (defender.name || '敌方') + ' 施加【虚实颠倒】（1 回合）',
      );
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      if (typeof window.toastr !== 'undefined') window.toastr.success('虚实颠倒');
    }
    /** 竭魂之火：夜露特殊技能。火焰/远程/单体，2 AP。对单体造成 [Int×1.2] 火焰伤害；消耗目标全部【燃烧】层数，造成双倍于消耗层数的伤害。 */
    function executePlayer竭魂之火(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '夜露' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, { id: '竭魂之火' })));
      var 燃烧L = 0;
      (defender.buffs || []).forEach(function (b) {
        if ((b.id || b.name) === '燃烧') 燃烧L = Math.max(0, parseInt(b.layers, 10) || 0);
      });
      var extraDamage = 燃烧L * 2;
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var totalDamage = result.finalDamage + extraDamage;
      var attName = attacker.name || '夜露';
      var defName = defender.name || '敌方';
      var damageCalcStr = 'Int×1.2=' + baseDamage;
      if (燃烧L > 0) damageCalcStr += '；消耗【燃烧】' + 燃烧L + '层，追加' + extraDamage + '伤害';
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(defender, totalDamage, undefined);
        if (defender.buffs && defender.buffs.length) {
          for (var i = 0; i < defender.buffs.length; i++) {
            if ((defender.buffs[i].id || defender.buffs[i].name) === '燃烧') defender.buffs[i].layers = 0;
          }
          defender.buffs = defender.buffs.filter(function (b) {
            return (parseInt(b.layers, 10) || 0) > 0;
          });
        }
        if (燃烧L > 0) appendCombatLog(defName + ' 的【燃烧】已消耗');
        yoruConsumeCharmIfHit(attacker, defender, result.hit);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            '竭魂之火',
            defName,
            Object.assign({}, result, { finalDamage: totalDamage }),
            baseDamage,
            null,
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(result.hit ? '竭魂之火 造成 ' + totalDamage + ' 点伤害' : '竭魂之火 未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'E-fire2', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 夜露对【魅惑】目标造成伤害后，按甜蜜支配 50% 概率不消耗魅惑层数；否则消耗 1 层。 */
    function yoruConsumeCharmIfHit(attacker, defender, didHit) {
      if (!attacker || attacker.name !== '夜露' || !defender || !didHit) return;
      var has甜蜜支配 = attacker.specialSkillsUnlocked && attacker.specialSkillsUnlocked.indexOf('甜蜜支配') !== -1;
      var charmBuf = (defender.buffs || []).find(function (b) {
        return (b.id || b.name) === '魅惑';
      });
      if (!charmBuf || (parseInt(charmBuf.layers, 10) || 0) <= 0) return;
      if (has甜蜜支配 && Math.random() < 0.5) return;
      charmBuf.layers = Math.max(0, (parseInt(charmBuf.layers, 10) || 0) - 1);
      if (charmBuf.layers <= 0)
        defender.buffs = (defender.buffs || []).filter(function (b) {
          return (b.id || b.name) !== '魅惑';
        });
    }
    /** 暗蚀之刃：黯特殊技能。暗影/近战/单体，消耗 1 AP。对单体造成 [Int×0.8] 魔法伤害，施加2层【暗蚀】；若目标已有【暗蚀】则额外施加1层【碎魔】。 */
    function executePlayer暗蚀之刃(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '黯' || !defender || isAllyDefeated(attacker)) return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var int = getDisplayStat(attacker, 'int') || 0;
      var baseDamage = Math.max(0, Math.floor(int * 0.8));
      var had暗蚀 = false;
      (defender.buffs || []).forEach(function (b) {
        if ((b.id || b.name) === '暗蚀' && (parseInt(b.layers, 10) || 0) > 0) had暗蚀 = true;
      });
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var attName = attacker.name || '黯';
      var defName = defender.name || '敌方';
      var damageCalcStr = '智力×0.8=' + baseDamage;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit) {
          addBuffLayers(defender, '暗蚀', '暗蚀', 2, attacker);
          if (had暗蚀) addBuffLayers(defender, '碎魔', '碎魔', 1, attacker);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            '暗蚀之刃',
            defName,
            result,
            baseDamage,
            '智力',
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (result.hit)
          appendCombatLog(attName + ' 对 ' + defName + ' 施加2层【暗蚀】' + (had暗蚀 ? '、1层【碎魔】' : ''));
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(result.hit ? '暗蚀之刃 造成 ' + result.finalDamage + ' 点伤害' : '暗蚀之刃 未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'E-dark1', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 瞬星射击：岚的物理/远程/单体，2 AP。对选定目标进行3次射击判定，每次 Agi×系数；A 穿甲弹：首次命中施加1层【破甲】、获得1层【精准】；B 爆裂弹：获得2层【精准】、暴击伤害250%。 */
    function executePlayer瞬星射击(allySlot, skillIndex, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '岚' || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '瞬星射击') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = getBaseDamageForSkill(attacker, skill);
      baseDamage = Math.max(0, Math.floor(baseDamage));
      var skillDisplayName = skill.advancement === 'A' ? '穿甲弹' : skill.advancement === 'B' ? '爆裂弹' : '瞬星射击';
      var critMult = skill.advancement === 'B' ? 2.5 : undefined;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multNum = lv === 1 ? 0.4 : lv === 2 || lv === 3 ? 0.45 : 0.5;
      if (skill.advancement === 'A' || skill.advancement === 'B') multNum = 0.5;
      var damageCalcStr = '敏捷×' + multNum + '=' + baseDamage;
      var hits = [];
      for (var i = 0; i < 3; i++) {
        var opts = { isRanged: true, skipConsumeLockKill: true };
        if (critMult != null) opts.critMult = critMult;
        var res = resolveAttack(attacker, defender, baseDamage, true, opts);
        hits.push(res);
      }
      if (skill.advancement === 'A') addBuffLayers(attacker, '精准', '精准', 1);
      if (skill.advancement === 'B') addBuffLayers(attacker, '精准', '精准', 2);
      var anyHit = hits[0].hit || hits[1].hit || hits[2].hit;
      if (anyHit) addBuffLayers(attacker, '扑杀', '扑杀', 1);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndRender() {
        for (var i = 0; i < 3; i++) {
          var res = hits[i];
          applyDamageToTarget(
            defender,
            res.finalDamage,
            res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined,
          );
          appendCombatLog(
            formatAttackLogLine(
              attacker.name || '岚',
              skillDisplayName + '·第' + (i + 1) + '击',
              defender.name || '敌方',
              res,
              baseDamage,
              null,
              null,
              defender.hp,
              damageCalcStr,
            ),
          );
          try岚猎手本能Heal(attacker, defender);
          if (res.hit) try岚死亡之眼Apply(attacker, defender, enemySlotNum);
          if (skill.advancement === 'A' && res.hit && i === 0) addBuffLayers(defender, '破甲', '破甲', 1);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var j = 0; j < 3; j++) {
          if (!hits[j].hit) {
            var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
            if (slotEl) playMissEffect(slotEl);
            break;
          }
        }
        if (typeof window.toastr !== 'undefined') window.toastr.success(skillDisplayName + ' 3次射击完毕');
      }
      if (!defenderSlotEl || !attackerSlotEl) {
        applyDamageAndRender();
        return;
      }
      if (!hits[0].hit && !hits[1].hit && !hits[2].hit) {
        playMissEffect(defenderSlotEl);
        applyDamageAndRender();
        return;
      }
      playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
        function doHit(index) {
          if (index >= 3) {
            tryConsume岚锁定And心满意足(attacker);
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            for (var j = 0; j < 3; j++) {
              if (!hits[j].hit) {
                if (defenderSlotEl) playMissEffect(defenderSlotEl);
                break;
              }
            }
            if (typeof window.toastr !== 'undefined') window.toastr.success(skillDisplayName + ' 3次射击完毕');
            return;
          }
          var res = hits[index];
          playAnimationOnSlot(defenderSlotEl, 'Shot', function () {
            applyDamageToTarget(
              defender,
              res.finalDamage,
              res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined,
            );
            appendCombatLog(
              formatAttackLogLine(
                attacker.name || '岚',
                skillDisplayName + '·第' + (index + 1) + '击',
                defender.name || '敌方',
                res,
                baseDamage,
                null,
                null,
                defender.hp,
                damageCalcStr,
              ),
            );
            try岚猎手本能Heal(attacker, defender);
            if (res.hit) try岚死亡之眼Apply(attacker, defender, enemySlotNum);
            if (skill.advancement === 'A' && res.hit && index === 0) addBuffLayers(defender, '破甲', '破甲', 1);
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            if (!res.hit && defenderSlotEl) playMissEffect(defenderSlotEl);
            doHit(index + 1);
          });
        }
        doHit(0);
      });
    }
    /** 绞首射击：岚的物理/混合/单体，2 AP。先近战段（绞锁 Str×系数），再远程段（Agi×系数）；A 处刑：射击必定暴击；B 压制：绞锁后施加2层【迟缓】+2层【迟钝】。 */
    function executePlayer绞首射击(allySlot, skillIndex, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '岚' || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '绞首射击') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
      var meleeDmg = Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
      var rangedDmg = Math.max(0, Math.floor((getDisplayStat(attacker, 'agi') || 0) * mult));
      var skillDisplayName = skill.advancement === 'A' ? '处刑' : skill.advancement === 'B' ? '压制' : '绞首射击';
      attacker.本回合用过近战 = true;
      var res1 = resolveAttack(attacker, defender, meleeDmg, true, { isMelee: true });
      var shotOpts = { isRanged: true };
      if (skill.advancement === 'A') shotOpts.forceCrit = true;
      var res2 = resolveAttack(attacker, defender, rangedDmg, true, shotOpts);
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndRender() {
        applyDamageToTarget(
          defender,
          res1.finalDamage,
          res1.shadowDamage ? { shadowDamage: res1.shadowDamage } : undefined,
        );
        appendCombatLog(
          formatAttackLogLine(
            attacker.name || '岚',
            skillDisplayName + '·绞锁',
            defender.name || '敌方',
            res1,
            meleeDmg,
            null,
            null,
            defender.hp,
            '力量×' + mult + '=' + meleeDmg,
          ),
        );
        if (res1.hit) {
          addBuffLayers(attacker, '锁定', '锁定', 1);
          try岚死亡之眼Apply(attacker, defender, enemySlotNum);
        }
        if (skill.advancement === 'B') {
          addBuffLayers(defender, '迟缓', '迟缓', 2);
          addBuffLayers(defender, '迟钝', '迟钝', 2);
        }
        applyDamageToTarget(
          defender,
          res2.finalDamage,
          res2.shadowDamage ? { shadowDamage: res2.shadowDamage } : undefined,
        );
        appendCombatLog(
          formatAttackLogLine(
            attacker.name || '岚',
            skillDisplayName + '·射击',
            defender.name || '敌方',
            res2,
            rangedDmg,
            null,
            null,
            defender.hp,
            '敏捷×' + mult + '=' + rangedDmg,
          ),
        );
        if (res2.hit) {
          addBuffLayers(attacker, '扑杀', '扑杀', 1);
          try岚死亡之眼Apply(attacker, defender, enemySlotNum);
        }
        try岚猎手本能Heal(attacker, defender);
        attacker.currentAp = Math.max(0, curAp - skillAp);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (!res1.hit && defenderSlotEl) playMissEffect(defenderSlotEl);
        if (!res2.hit && defenderSlotEl) playMissEffect(defenderSlotEl);
        if (typeof window.toastr !== 'undefined') window.toastr.success(skillDisplayName + ' 绞锁与射击完毕');
      }
      if (!defenderSlotEl || !attackerSlotEl) {
        applyDamageAndRender();
        return;
      }
      if (!res1.hit && !res2.hit) {
        playMissEffect(defenderSlotEl);
        applyDamageAndRender();
        return;
      }
      playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
        playAnimationOnSlot(defenderSlotEl, 'E-blow6', function () {
          applyDamageToTarget(
            defender,
            res1.finalDamage,
            res1.shadowDamage ? { shadowDamage: res1.shadowDamage } : undefined,
          );
          appendCombatLog(
            formatAttackLogLine(
              attacker.name || '岚',
              skillDisplayName + '·绞锁',
              defender.name || '敌方',
              res1,
              meleeDmg,
              null,
              null,
              defender.hp,
              '力量×' + mult + '=' + meleeDmg,
            ),
          );
          if (res1.hit) {
            addBuffLayers(attacker, '锁定', '锁定', 1);
            try岚死亡之眼Apply(attacker, defender, enemySlotNum);
          }
          if (skill.advancement === 'B') {
            addBuffLayers(defender, '迟缓', '迟缓', 2);
            addBuffLayers(defender, '迟钝', '迟钝', 2);
          }
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (!res1.hit && defenderSlotEl) playMissEffect(defenderSlotEl);
          playAnimationOnSlot(defenderSlotEl, 'Shot', function () {
            applyDamageToTarget(
              defender,
              res2.finalDamage,
              res2.shadowDamage ? { shadowDamage: res2.shadowDamage } : undefined,
            );
            appendCombatLog(
              formatAttackLogLine(
                attacker.name || '岚',
                skillDisplayName + '·射击',
                defender.name || '敌方',
                res2,
                rangedDmg,
                null,
                null,
                defender.hp,
                '敏捷×' + mult + '=' + rangedDmg,
              ),
            );
            if (res2.hit) {
              addBuffLayers(attacker, '扑杀', '扑杀', 1);
              try岚死亡之眼Apply(attacker, defender, enemySlotNum);
            }
            try岚猎手本能Heal(attacker, defender);
            attacker.currentAp = Math.max(0, curAp - skillAp);
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            if (!res2.hit && defenderSlotEl) playMissEffect(defenderSlotEl);
            if (typeof window.toastr !== 'undefined') window.toastr.success(skillDisplayName + ' 绞锁与射击完毕');
          });
        });
      });
    }
    /** 蔷薇风暴：岚特殊技能。物理/远程/单体，3 AP，6 次判定每次 Agi×0.5；每次暴击使下一次判定伤害+25%。 */
    function executePlayer蔷薇风暴(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '岚' || !defender || isAllyDefeated(attacker)) return;
      var unlocked =
        attacker.specialSkillsUnlocked && Array.isArray(attacker.specialSkillsUnlocked)
          ? attacker.specialSkillsUnlocked
          : [];
      if (unlocked.indexOf('蔷薇风暴') === -1) return;
      var skillAp = 3;
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null
          ? parseInt(attacker.currentAp, 10)
          : getApByLevel(attacker.level);
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var baseDmg = Math.max(0, Math.floor((getDisplayStat(attacker, 'agi') || 0) * 0.5));
      var nextBonus = 0;
      var results = [];
      for (var i = 0; i < 6; i++) {
        var dmg = Math.max(0, Math.floor(baseDmg * (1 + nextBonus)));
        var res = resolveAttack(attacker, defender, dmg, true, { isRanged: true, skipConsumeLockKill: true });
        results.push({ dmg: dmg, res: res, nextBonus: nextBonus });
        if (res.crit) nextBonus += 0.25;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndRender() {
        for (var i = 0; i < 6; i++) {
          var item = results[i];
          applyDamageToTarget(
            defender,
            item.res.finalDamage,
            item.res.shadowDamage ? { shadowDamage: item.res.shadowDamage } : undefined,
          );
          var calcStr =
            item.nextBonus > 0 ? '敏捷×0.5×(1+' + item.nextBonus * 100 + '%)=' + item.dmg : '敏捷×0.5=' + item.dmg;
          appendCombatLog(
            formatAttackLogLine(
              attacker.name || '岚',
              '蔷薇风暴·第' + (i + 1) + '击',
              defender.name || '敌方',
              item.res,
              item.dmg,
              null,
              null,
              defender.hp,
              calcStr,
            ),
          );
          try岚猎手本能Heal(attacker, defender);
          if (item.res.hit) try岚死亡之眼Apply(attacker, defender, enemySlotNum);
          if (item.res.hit) addBuffLayers(attacker, '扑杀', '扑杀', 1);
        }
        attacker.currentAp = Math.max(0, curAp - skillAp);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (typeof window.toastr !== 'undefined') window.toastr.success('蔷薇风暴 6 击完毕');
      }
      if (!defenderSlotEl || !attackerSlotEl) {
        applyDamageAndRender();
        return;
      }
      var anyHit = results.some(function (r) {
        return r.res.hit;
      });
      if (!anyHit) {
        playMissEffect(defenderSlotEl);
        applyDamageAndRender();
        return;
      }
      playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
        function doHit(index) {
          if (index >= 6) {
            tryConsume岚锁定And心满意足(attacker);
            attacker.currentAp = Math.max(0, curAp - skillAp);
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            if (typeof window.toastr !== 'undefined') window.toastr.success('蔷薇风暴 6 击完毕');
            return;
          }
          var item = results[index];
          playAnimationOnSlot(defenderSlotEl, 'Shot', function () {
            applyDamageToTarget(
              defender,
              item.res.finalDamage,
              item.res.shadowDamage ? { shadowDamage: item.res.shadowDamage } : undefined,
            );
            var calcStr =
              item.nextBonus > 0 ? '敏捷×0.5×(1+' + item.nextBonus * 100 + '%)=' + item.dmg : '敏捷×0.5=' + item.dmg;
            appendCombatLog(
              formatAttackLogLine(
                attacker.name || '岚',
                '蔷薇风暴·第' + (index + 1) + '击',
                defender.name || '敌方',
                item.res,
                item.dmg,
                null,
                null,
                defender.hp,
                calcStr,
              ),
            );
            try岚猎手本能Heal(attacker, defender);
            if (item.res.hit) try岚死亡之眼Apply(attacker, defender, enemySlotNum);
            if (item.res.hit) addBuffLayers(attacker, '扑杀', '扑杀', 1);
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            doHit(index + 1);
          });
        }
        doHit(0);
      });
    }
    /** 浮空速射：岚特殊技能。物理/远程/群体，2 AP，对全体 2 次射击每次 Agi×0.4（若本回合已用近战则 Agi×0.6）；施放后获得 2 层【灵巧】。 */
    function executePlayer浮空速射(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '岚' || isAllyDefeated(attacker)) return;
      var unlocked =
        attacker.specialSkillsUnlocked && Array.isArray(attacker.specialSkillsUnlocked)
          ? attacker.specialSkillsUnlocked
          : [];
      if (unlocked.indexOf('浮空速射') === -1) return;
      var skillAp = 2;
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null
          ? parseInt(attacker.currentAp, 10)
          : getApByLevel(attacker.level);
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var mult = attacker.本回合用过近战 ? 0.6 : 0.4;
      var baseDmg = Math.max(0, Math.floor((getDisplayStat(attacker, 'agi') || 0) * mult));
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      var allTargets = [];
      for (var shot = 0; shot < 2; shot++) {
        for (var s = 1; s <= 6; s++) {
          var def = enemies[s - 1];
          if (!def || (def.hp != null && parseInt(def.hp, 10) <= 0)) continue;
          var res = resolveAttack(attacker, def, baseDmg, true, { isRanged: true, skipConsumeLockKill: true });
          allTargets.push({ shot: shot, slotNum: s, defender: def, result: res });
        }
      }
      function applyDamageAndRender() {
        for (var t = 0; t < allTargets.length; t++) {
          var item = allTargets[t];
          applyDamageToTarget(
            item.defender,
            item.result.finalDamage,
            item.result.shadowDamage ? { shadowDamage: item.result.shadowDamage } : undefined,
          );
          appendCombatLog(
            formatAttackLogLine(
              attacker.name || '岚',
              '浮空速射·第' + (item.shot + 1) + '击',
              item.defender.name || '敌方',
              item.result,
              baseDmg,
              null,
              null,
              item.defender.hp,
              '敏捷×' + mult + '=' + baseDmg,
            ),
          );
          try岚猎手本能Heal(attacker, item.defender);
          if (item.result.hit) try岚死亡之眼Apply(attacker, item.defender, item.slotNum);
          if (item.result.hit) addBuffLayers(attacker, '扑杀', '扑杀', 1);
        }
        addBuffLayers(attacker, '灵巧', '灵巧', 2);
        attacker.currentAp = Math.max(0, curAp - skillAp);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (typeof window.toastr !== 'undefined') window.toastr.success('浮空速射 完毕，获得 2 层【灵巧】');
      }
      if (!enemySideEl) {
        applyDamageAndRender();
        return;
      }
      function doShot(shotIndex) {
        if (shotIndex >= 2) {
          tryConsume岚锁定And心满意足(attacker);
          addBuffLayers(attacker, '灵巧', '灵巧', 2);
          attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof window.toastr !== 'undefined') window.toastr.success('浮空速射 完毕，获得 2 层【灵巧】');
          return;
        }
        playAnimationOnContainer(enemySideEl, 'Shot', function () {
          for (var t = 0; t < allTargets.length; t++) {
            var item = allTargets[t];
            if (item.shot !== shotIndex) continue;
            applyDamageToTarget(
              item.defender,
              item.result.finalDamage,
              item.result.shadowDamage ? { shadowDamage: item.result.shadowDamage } : undefined,
            );
            appendCombatLog(
              formatAttackLogLine(
                attacker.name || '岚',
                '浮空速射·第' + (shotIndex + 1) + '击',
                item.defender.name || '敌方',
                item.result,
                baseDmg,
                null,
                null,
                item.defender.hp,
                '敏捷×' + mult + '=' + baseDmg,
              ),
            );
            try岚猎手本能Heal(attacker, item.defender);
            if (item.result.hit) try岚死亡之眼Apply(attacker, item.defender, item.slotNum);
            if (item.result.hit) addBuffLayers(attacker, '扑杀', '扑杀', 1);
          }
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          doShot(shotIndex + 1);
        });
      }
      doShot(0);
    }
    /** 死亡之眼：岚特殊技能。1 AP，选定目标后获得 2【精准】+2【专注】，下一次命中该目标时施加 1【迟缓】+1【流血】。 */
    function executePlayer死亡之眼(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '岚' || !defender || isAllyDefeated(attacker)) return;
      var unlocked =
        attacker.specialSkillsUnlocked && Array.isArray(attacker.specialSkillsUnlocked)
          ? attacker.specialSkillsUnlocked
          : [];
      if (unlocked.indexOf('死亡之眼') === -1) return;
      var skillAp = 1;
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null
          ? parseInt(attacker.currentAp, 10)
          : getApByLevel(attacker.level);
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      attacker.死亡之眼目标 = enemySlotNum;
      addBuffLayers(attacker, '精准', '精准', 2);
      addBuffLayers(attacker, '专注', '专注', 2);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(
        (attacker.name || '岚') +
          ' 使用死亡之眼锁定 ' +
          (defender.name || '敌方') +
          '，获得 2 层【精准】与 2 层【专注】',
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('死亡之眼：已锁定目标');
    }
    /** 弹跳踩踏：岚特殊技能。物理/近战/单体，1 AP，Str×0.8（目标有【迟缓】时+50%）；下一次远程技能伤害+30%。 */
    function executePlayer弹跳踩踏(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || attacker.name !== '岚' || !defender || isAllyDefeated(attacker)) return;
      var unlocked =
        attacker.specialSkillsUnlocked && Array.isArray(attacker.specialSkillsUnlocked)
          ? attacker.specialSkillsUnlocked
          : [];
      if (unlocked.indexOf('弹跳踩踏') === -1) return;
      var skillAp = 1;
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null
          ? parseInt(attacker.currentAp, 10)
          : getApByLevel(attacker.level);
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var baseDmg = Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 0.8));
      var has迟缓 =
        defender.buffs &&
        defender.buffs.some(function (b) {
          return (b.id || b.name) === '迟缓' && (parseInt(b.layers, 10) || 0) > 0;
        });
      if (has迟缓) baseDmg = Math.max(0, Math.floor(baseDmg * 1.5));
      var res = resolveAttack(attacker, defender, baseDmg, true, { isMelee: true });
      var calcStr = has迟缓 ? '力量×0.8×1.5(迟缓)=' + baseDmg : '力量×0.8=' + baseDmg;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndRender() {
        applyDamageToTarget(
          defender,
          res.finalDamage,
          res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined,
        );
        appendCombatLog(
          formatAttackLogLine(
            attacker.name || '岚',
            '弹跳踩踏',
            defender.name || '敌方',
            res,
            baseDmg,
            null,
            null,
            defender.hp,
            calcStr,
          ),
        );
        try岚猎手本能Heal(attacker, defender);
        if (res.hit) {
          addBuffLayers(attacker, '锁定', '锁定', 1);
          try岚死亡之眼Apply(attacker, defender, enemySlotNum);
        }
        attacker.弹跳踩踏 = true;
        attacker.本回合用过近战 = true;
        attacker.currentAp = Math.max(0, curAp - skillAp);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (typeof window.toastr !== 'undefined') window.toastr.success('弹跳踩踏 完毕，下次远程伤害+30%');
      }
      if (!defenderSlotEl || !attackerSlotEl) {
        applyDamageAndRender();
        return;
      }
      if (!res.hit) {
        playMissEffect(defenderSlotEl);
        applyDamageAndRender();
        return;
      }
      playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
        playAnimationOnSlot(defenderSlotEl, 'E-blow6', applyDamageAndRender);
      });
    }
    /** 白牙！：在选定的己方空位召唤白牙，消耗达芙妮 2 AP */
    function executePlayerSummonBaiya(daphneAllySlot, emptySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var daphne = party[daphneAllySlot - 1];
      if (!daphne || (daphne.name || '') !== '达芙妮') return;
      if (isAllyDefeated(daphne)) return;
      if (party[emptySlotNum - 1] != null) return;
      if (!createSummonBaiya || !getBaiyaStatsFromOwner) return;
      var skillAp = 2;
      var maxAp = getApByLevel(daphne.level);
      var curAp = daphne.currentAp !== undefined && daphne.currentAp !== null ? parseInt(daphne.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var stats = getBaiyaStatsFromOwner(daphne);
      var maxHp = Math.max(1, stats.maxHp || 1);
      var baiyaUnit = {
        name: '白牙',
        hp: maxHp,
        maxHp: maxHp,
        atk: Math.max(0, stats.atk || 0),
        def: Math.max(0, stats.def || 0),
        currentAp: 2,
        skills: createSummonBaiya.skills ? createSummonBaiya.skills.slice() : [],
        buffs: [],
      };
      party[emptySlotNum - 1] = baiyaUnit;
      daphne.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((daphne.name || '达芙妮') + ' 使用白牙！，在 ' + emptySlotNum + ' 号位召唤了白牙');
      if (typeof window.toastr !== 'undefined') window.toastr.success('白牙已召唤');
      var baiyaSlotEl = document.querySelector('.slot[data-slot="ally-' + emptySlotNum + '"]');
      if (baiyaSlotEl) playAnimationOnSlot(baiyaSlotEl, 'StateUp2', function () {});
    }
    /** 炎魔吹息：夜露技能。火焰/远程/单体，消耗 1 AP。火焰伤害，施加【燃烧】；Lv5-A 炼狱吐息 2 次燃烧，Lv5-B 灼心之火 有 Cha×5% 概率施加 1 层【魅惑】。 */
    /** 虚无放逐：夜露技能。奥术/自身/单体，消耗 2 AP。进入虚无状态（不可选中）至下回合开始，回归时对敌方全体造成 [Int×0.6～0.9] 伤害；Lv5-B 并对全体施加 1 次【燃烧】。 */
    function executePlayer虚无放逐(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '夜露' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '虚无放逐') return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      addBuffLayers(attacker, '虚无', '虚无', 1);
      attacker.虚无放逐_return = {
        level: skill.level != null ? skill.level : 1,
        advancement: skill.advancement || null,
      };
      attacker.currentAp = Math.max(0, curAp - skillAp);
      function done() {
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog((attacker.name || '夜露') + ' 使用虚无放逐，进入相位转移');
        if (typeof window.toastr !== 'undefined')
          window.toastr.success('虚无放逐：下回合开始时回归并对敌方全体造成伤害');
      }
      var allySlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      if (allySlotEl) {
        playAnimationOnSlot(allySlotEl, 'Blackhole', done);
      } else {
        done();
      }
    }
    /** 炎魔吹息：夜露技能。火焰/远程/单体，消耗 1 AP。火焰伤害，施加【燃烧】；Lv5-A 炼狱吐息 2 次燃烧，Lv5-B 灼心之火 有 Cha×5% 概率施加 1 层【魅惑】。 */
    /** 心灵侵蚀：夜露技能。心灵/远程/单体，消耗 1 AP。心灵伤害；Lv5-A 心碎 目标生命值低于40%时伤害+50%；Lv5-B 蛊惑 施加1层【魅惑】。 */
    function executePlayer心灵侵蚀(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '心灵侵蚀') return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var int = getDisplayStat(attacker, 'int') || 0;
      var cha = getDisplayStat(attacker, 'cha') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multInt = lv === 1 ? 0.6 : lv === 2 ? 0.7 : lv === 3 ? 0.8 : 0.9;
      var multCha = lv === 1 ? 0.3 : lv === 2 ? 0.3 : lv === 3 ? 0.6 : 0.6;
      if (skill.advancement === 'A' || skill.advancement === 'B') {
        multInt = 0.9;
        multCha = 0.4;
      }
      var intPart = Math.floor(int * multInt);
      var chaPart = Math.floor(cha * multCha);
      var baseBeforeBonus = intPart + chaPart;
      var baseDamage = baseBeforeBonus;
      var damageCalcStr =
        '智力×' + multInt + '+魅力×' + multCha + '=' + intPart + '+' + chaPart + '=' + baseBeforeBonus;
      if (skill.advancement === 'A') {
        var defMaxHp =
          defender.maxHp != null ? parseInt(defender.maxHp, 10) : getHpFromSta(getDisplayStat(defender, 'sta') || 1);
        var defCurHp = defender.hp != null ? parseInt(defender.hp, 10) : defMaxHp;
        if (defMaxHp > 0 && defCurHp / defMaxHp < 0.4) {
          baseDamage = Math.floor(baseBeforeBonus * 1.5);
          damageCalcStr += '；生命<40%×1.5=' + baseDamage;
        }
      }
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var has精神渗透 =
        attacker.name === '夜露' &&
        attacker.specialSkillsUnlocked &&
        attacker.specialSkillsUnlocked.indexOf('精神渗透') !== -1;
      var effectiveDamage = result.finalDamage;
      var applyCharm = result.hit && skill.advancement === 'B';
      if (!result.hit && has精神渗透) {
        effectiveDamage = Math.max(0, Math.floor(baseDamage * 0.5));
      }
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          effectiveDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (applyCharm) {
          addBuffLayers(defender, '魅惑', '魅惑', 1, attacker);
          appendCombatLog(attName + ' 对 ' + defName + ' 施加1层【魅惑】');
        }
        if (attacker.name === '夜露') yoruConsumeCharmIfHit(attacker, defender, effectiveDamage > 0);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            '心灵侵蚀',
            defName,
            effectiveDamage > 0 ? { ...result, hit: true, finalDamage: effectiveDamage } : result,
            baseDamage,
            null,
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(
            result.hit || effectiveDamage > 0 ? '心灵侵蚀 造成 ' + effectiveDamage + ' 点伤害' : '心灵侵蚀 未命中',
          );
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Mist-Pink', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 镜花水月：月见遥技能。心灵/远程/单体，1 AP。Int 倍率随等级；目标带控制类减益时增伤；Lv5-A 心碎镜像 控制时 +50% 并回复 Int×0.3；Lv5-B 幻影穿刺 目标有【魅惑】时必中并施加1层【碎魔】。 */
    function targetHas镜花水月控制状态(unit) {
      if (!unit || !unit.buffs || !unit.buffs.length) return false;
      for (var ti = 0; ti < unit.buffs.length; ti++) {
        var tb = unit.buffs[ti];
        var tid = (tb.id || tb.name || '').trim();
        if (镜花水月_CONTROL_DEBUFF_IDS.indexOf(tid) === -1) continue;
        if ((parseInt(tb.layers, 10) || 0) > 0) return true;
      }
      return false;
    }
    function executePlayer镜花水月(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '镜花水月') return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var intStat = getDisplayStat(attacker, 'int') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multInt = lv === 1 ? 0.7 : lv === 2 ? 0.75 : lv === 3 ? 0.75 : 0.8;
      if (lv >= 5 && (skill.advancement === 'A' || skill.advancement === 'B')) multInt = 0.8;
      var baseBefore = Math.max(0, Math.floor(intStat * multInt));
      var hasControl = targetHas镜花水月控制状态(defender);
      var ctrlPct = 0;
      if (hasControl) {
        if (lv <= 2) ctrlPct = 0.2;
        else if (lv <= 4) ctrlPct = 0.25;
        else if (skill.advancement === 'A') ctrlPct = 0.5;
        else ctrlPct = 0.25;
      }
      var baseDamage = hasControl ? Math.max(0, Math.floor(baseBefore * (1 + ctrlPct))) : baseBefore;
      var damageCalcStr =
        '智力×' + multInt + '=' + baseBefore + (hasControl ? '；控制+' + Math.round(ctrlPct * 100) + '%=' + baseDamage : '');
      var has魅惑 =
        defender.buffs &&
        defender.buffs.some(function (b) {
          return (b.id || b.name) === '魅惑' && (parseInt(b.layers, 10) || 0) > 0;
        });
      var atkOpts = { magicOnly: true };
      if (lv >= 5 && skill.advancement === 'B' && has魅惑) atkOpts.forceHit = true;
      var result = resolveAttack(attacker, defender, baseDamage, true, atkOpts);
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var adv = skill.advancement;
      var skillLogName =
        lv >= 5 && adv === 'A' ? '心碎镜像' : lv >= 5 && adv === 'B' ? '幻影穿刺' : '镜花水月';
      var effectiveDamage = result.finalDamage;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          effectiveDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit && lv >= 5 && adv === 'A' && hasControl) {
          var healRaw = Math.max(0, Math.floor(intStat * 0.3));
          healRaw = apply丝伊德共生母胎HealMultiplier(attacker, healRaw);
          var maxHp =
            attacker.maxHp != null
              ? parseInt(attacker.maxHp, 10)
              : getHpFromSta(getDisplayStat(attacker, 'sta') || 1);
          var beforeHp = attacker.hp != null ? parseInt(attacker.hp, 10) : 0;
          attacker.hp = Math.min(maxHp, beforeHp + healRaw);
          appendCombatLog(attName + ' 「心碎镜像」回复 ' + healRaw + ' 生命');
        }
        if (result.hit && lv >= 5 && adv === 'B' && has魅惑) {
          addBuffLayers(defender, '碎魔', '碎魔', 1, attacker);
          appendCombatLog(attName + ' 「幻影穿刺」对 ' + defName + ' 施加1层【碎魔】');
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            skillLogName,
            defName,
            effectiveDamage > 0 ? { ...result, hit: true, finalDamage: effectiveDamage } : result,
            baseDamage,
            null,
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(
            result.hit || effectiveDamage > 0 ? skillLogName + ' 造成 ' + effectiveDamage + ' 点伤害' : skillLogName + ' 未命中',
          );
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Mist-Pink', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 心智侵蚀：月见遥。心灵/远程/单体，1 AP。Lv1～2 命中后 50%【碎魔】；Lv3+ 必【碎魔】；Lv5-A 断筋蚀骨、Lv5-B 封喉噤声：额外 Cha×5% 施加【缴械】/【沉默】。 */
    function executePlayer心智侵蚀(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '心智侵蚀') return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var intStat = getDisplayStat(attacker, 'int') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multInt = lv === 1 ? 0.6 : lv === 2 ? 0.7 : lv === 3 ? 0.8 : 0.9;
      if (lv >= 5 && (skill.advancement === 'A' || skill.advancement === 'B')) multInt = 0.9;
      var baseDamage = Math.max(0, Math.floor(intStat * multInt));
      var damageCalcStr = '智力×' + multInt + '=' + baseDamage;
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var adv = skill.advancement;
      var skillLogName =
        lv >= 5 && adv === 'A' ? '断筋蚀骨' : lv >= 5 && adv === 'B' ? '封喉噤声' : '心智侵蚀';
      var effectiveDamage = result.finalDamage;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          effectiveDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit) {
          var apply碎魔 = lv >= 3 ? true : roll1To100() <= 50;
          if (apply碎魔) {
            addBuffLayers(defender, '碎魔', '碎魔', 1, attacker);
            appendCombatLog(attName + ' 「' + skillLogName + '」对 ' + defName + ' 施加1层【碎魔】');
          }
          if (lv >= 5 && adv === 'A') {
            var chaA = getDisplayStat(attacker, 'cha') || 0;
            var p缴械 = Math.min(100, Math.floor(chaA * 5));
            if (roll1To100() <= p缴械) {
              addBuffLayers(defender, '缴械', '缴械', 1, attacker);
              appendCombatLog(attName + ' 「断筋蚀骨」对 ' + defName + ' 施加1层【缴械】');
            }
          }
          if (lv >= 5 && adv === 'B') {
            var chaB = getDisplayStat(attacker, 'cha') || 0;
            var p沉默 = Math.min(100, Math.floor(chaB * 5));
            if (roll1To100() <= p沉默) {
              addBuffLayers(defender, '沉默', '沉默', 1, attacker);
              appendCombatLog(attName + ' 「封喉噤声」对 ' + defName + ' 施加1层【沉默】');
            }
          }
          capUnitBuffs(defender);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            skillLogName,
            defName,
            effectiveDamage > 0 ? { ...result, hit: true, finalDamage: effectiveDamage } : result,
            baseDamage,
            null,
            null,
            defender.hp,
            damageCalcStr,
          ),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(
            result.hit || effectiveDamage > 0 ? skillLogName + ' 造成 ' + effectiveDamage + ' 点伤害' : skillLogName + ' 未命中',
          );
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Mist-Pink', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 圣光斩：艾丽卡技能。混合/近战/单体，1 AP。Lv1~4 物理+神圣伤害；Lv5-A 炽天之剑 +2 次燃烧；Lv5-B 净化斩击 驱散目标 1 个增益，成功则艾丽卡回复 Int×0.4 生命。 */
    function executePlayer圣光斩(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '圣光斩') return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var result = resolveAttack(attacker, defender, baseDamage, true);
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var advancement = skill.advancement;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit) {
          if (advancement === 'A') {
            addBuffLayers(defender, '燃烧', '燃烧', 2, attacker);
            appendCombatLog(defName + ' 被施加2次【燃烧】');
          } else if (advancement === 'B') {
            var dispelled = false;
            var buffs = defender.buffs || [];
            for (var i = 0; i < buffs.length; i++) {
              var bid = (buffs[i].id || buffs[i].name || '').trim();
              if (POSITIVE_BUFF_IDS.indexOf(bid) === -1) continue;
              var layers = parseInt(buffs[i].layers, 10) || 0;
              if (layers <= 0) continue;
              layers = Math.max(0, layers - 1);
              dispelled = true;
              if (layers <= 0) {
                defender.buffs = defender.buffs.filter(function (b, idx) {
                  return idx !== i;
                });
              } else {
                buffs[i].layers = layers;
              }
              break;
            }
            if (dispelled) {
              var healVal = Math.floor((getDisplayStat(attacker, 'int') || 0) * 0.4);
              healVal = apply丝伊德共生母胎HealMultiplier(attacker, healVal);
              var beforeHp = attacker.hp != null ? parseInt(attacker.hp, 10) : 0;
              var maxHp =
                attacker.maxHp != null
                  ? parseInt(attacker.maxHp, 10)
                  : getHpFromSta(getDisplayStat(attacker, 'sta') || 1);
              attacker.hp = Math.min(maxHp, beforeHp + healVal);
              appendCombatLog(attName + ' 驱散 ' + defName + ' 的【' + bid + '】，回复 ' + healVal + ' 生命');
            }
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            advancement === 'A' ? '炽天之剑' : advancement === 'B' ? '净化斩击' : '圣光斩',
            defName,
            result,
            baseDamage,
            null,
            null,
            defender.hp,
            '',
          ),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(result.hit ? '圣光斩 造成 ' + result.finalDamage + ' 点伤害' : '圣光斩 未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Holy3', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 碧血魔剑：丝伊德·白技能。混合/近战/单体，1 AP。物理段+自然段分别判定；Lv5-A 侵蚀共鸣：可瑞存活时对目标叠2层【破甲】；Lv5-B 粘液浸透：莉莉姆存活时叠1层【迟缓】且莉莉姆与丝伊德回复莉莉姆DEF×0.3。execOpts.free 时不扣 AP、不校验 AP；logSuffix 追加在战斗日志技能名上。 */
    function executePlayer碧血魔剑(allySlot, enemySlotNum, skillIndex, execOpts) {
      execOpts = execOpts || {};
      var freeCast = !!execOpts.free;
      var logSuffix = execOpts.logSuffix || '';
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '碧血魔剑') return;
      var skillAp = 1;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (!freeCast && curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var strV = getDisplayStat(attacker, 'str') || 0;
      var intV = getDisplayStat(attacker, 'int') || 0;
      var multStr = lv === 1 ? 0.4 : lv === 2 ? 0.5 : lv === 3 ? 0.5 : 0.6;
      var multInt = lv === 1 ? 0.4 : lv === 2 ? 0.4 : lv === 3 ? 0.5 : 0.6;
      if (lv >= 5 && (skill.advancement === 'A' || skill.advancement === 'B')) {
        multStr = 0.6;
        multInt = 0.6;
      }
      var physDmg = Math.max(0, Math.floor(strV * multStr));
      var natDmg = Math.max(0, Math.floor(intV * multInt));
      var resP = resolveAttack(attacker, defender, physDmg, true);
      var resN = resolveAttack(attacker, defender, natDmg, true, { magicOnly: true });
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var advancement = skill.advancement;
      var skillLabel =
        lv >= 5 && advancement === 'A' ? '侵蚀共鸣' : lv >= 5 && advancement === 'B' ? '粘液浸透' : '碧血魔剑';
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function findAliveAllyByName(nm) {
        if (!party || !nm) return null;
        for (var ai = 0; ai < party.length; ai++) {
          var u = party[ai];
          if (!u || (u.name || '') !== nm) continue;
          if (isAllyDefeated(u)) continue;
          return u;
        }
        return null;
      }
      function applyHealToAlly(unit, raw) {
        if (!unit || raw == null || raw <= 0) return 0;
        var eff = apply丝伊德共生母胎HealMultiplier(unit, raw);
        var mHp =
          unit.maxHp != null
            ? parseInt(unit.maxHp, 10)
            : typeof getHpFromSta === 'function'
              ? getHpFromSta(getDisplayStat(unit, 'sta') || 1)
              : 100;
        var bHp = unit.hp != null ? parseInt(unit.hp, 10) : mHp;
        unit.hp = Math.min(mHp, bHp + eff);
        return eff;
      }
      function applyDamageAndLog() {
        if (!freeCast) attacker.currentAp = Math.max(0, curAp - skillAp);
        var anyHit = resP.hit || resN.hit;
        var hpAfterPhys = defender.hp;
        if (resP.hit) {
          applyDamageToTarget(
            defender,
            resP.finalDamage,
            resP.shadowDamage ? { shadowDamage: resP.shadowDamage } : undefined,
          );
          hpAfterPhys = defender.hp;
        }
        if (resN.hit) {
          applyDamageToTarget(
            defender,
            resN.finalDamage,
            resN.shadowDamage ? { shadowDamage: resN.shadowDamage } : undefined,
          );
        }
        if (anyHit && lv >= 5 && advancement === 'A') {
          var kerui = findAliveAllyByName('可瑞');
          if (kerui) {
            addBuffLayers(defender, '破甲', '破甲', 2, kerui);
            appendCombatLog((kerui.name || '可瑞') + ' 对 ' + defName + ' 施加2层【破甲】（侵蚀共鸣）');
          }
        }
        if (anyHit && lv >= 5 && advancement === 'B') {
          var lilim = findAliveAllyByName('莉莉姆');
          if (lilim) {
            addBuffLayers(defender, '迟缓', '迟缓', 1, lilim);
            appendCombatLog((lilim.name || '莉莉姆') + ' 对 ' + defName + ' 施加1层【迟缓】（粘液浸透）');
            var baseHeal = Math.max(0, Math.floor((getDisplayStat(lilim, 'def') || 0) * 0.3));
            if (baseHeal > 0) {
              var hL = applyHealToAlly(lilim, baseHeal);
              var hS = applyHealToAlly(attacker, baseHeal);
              appendCombatLog(
                (lilim.name || '莉莉姆') +
                  ' 回复 ' +
                  hL +
                  ' 点生命，' +
                  attName +
                  ' 回复 ' +
                  hS +
                  ' 点生命（粘液浸透，基础为莉莉姆防御×0.3）',
              );
            }
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            skillLabel + '·物理' + logSuffix,
            defName,
            resP,
            physDmg,
            '力量',
            multStr,
            hpAfterPhys,
            '力量×' + multStr + '=' + physDmg,
          ),
        );
        appendCombatLog(
          formatAttackLogLine(
            attName,
            skillLabel + '·自然' + logSuffix,
            defName,
            resN,
            natDmg,
            '智力',
            multInt,
            defender.hp,
            '智力×' + multInt + '=' + natDmg,
          ),
        );
        var totalD = (resP.hit ? resP.finalDamage : 0) + (resN.hit ? resN.finalDamage : 0);
        if (typeof window.toastr !== 'undefined' && !freeCast) {
          if (!anyHit) window.toastr.success('碧血魔剑 未命中');
          else window.toastr.success('碧血魔剑 共造成 ' + totalD + ' 点伤害');
        }
      }
      if (defenderSlotEl) {
        if (!resP.hit && !resN.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Holy3', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 威吓：丝伊德·白。2层【嘲讽】+护盾；Lv5-A 堇在场则免费再生菌丝；Lv5-B 蒙特卡洛在场则免费金粉弥漫。 */
    function executePlayer姬骑解禁(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '丝伊德·白' || isAllyDefeated(attacker)) return;
      if (!attacker.specialSkillsUnlocked || attacker.specialSkillsUnlocked.indexOf('姬骑解禁') === -1) return;
      var skillAp = 3;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      addBuffLayers(attacker, '姬骑', '姬骑', 1, attacker);
      capUnitBuffs(attacker);
      var newMax = getEffectiveMaxApForAlly(attacker);
      attacker.currentAp = Math.min(Math.max(0, curAp - skillAp), newMax);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '丝伊德·白') + ' 发动「全武装形态·姬骑解禁」，进入【姬骑】形态');
      if (typeof window.toastr !== 'undefined') window.toastr.success('姬骑解禁：已进入姬骑形态');
    }
    function executePlayer腐蚀领域(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '丝伊德·白' || isAllyDefeated(attacker)) return;
      if (!attacker.specialSkillsUnlocked || attacker.specialSkillsUnlocked.indexOf('腐蚀领域') === -1) return;
      var skillAp = 2;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var jinAlive = false;
      for (var ji = 0; ji < party.length; ji++) {
        var uj = party[ji];
        if (!uj || (uj.name || '') !== '\u5807') continue;
        if (isAllyDefeated(uj)) continue;
        jinAlive = true;
        break;
      }
      var poisonStacks = Math.max(1, Math.floor(1 * (jinAlive ? 1.5 : 1)));
      var intV = getDisplayStat(attacker, 'int') || 0;
      var natDmg = Math.max(0, Math.floor(intV * 1.2));
      var attName = attacker.name || '丝伊德·白';
      var targets = [];
      for (var ti = 1; ti <= 6; ti++) {
        var def = enemies[ti - 1];
        if (!def || (def.hp != null && parseInt(def.hp, 10) <= 0)) continue;
        var resN = resolveAttack(attacker, def, natDmg, true, { magicOnly: true });
        targets.push({ slotNum: ti, defender: def, resN: resN });
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function afterAnim腐蚀领域() {
        for (var t = 0; t < targets.length; t++) {
          var d = targets[t].defender;
          var rn = targets[t].resN;
          if (rn.hit) {
            applyDamageToTarget(
              d,
              rn.finalDamage,
              rn.shadowDamage ? { shadowDamage: rn.shadowDamage } : undefined,
            );
            addBuffLayers(d, '中毒', '中毒', poisonStacks, attacker);
          }
          appendCombatLog(
            formatAttackLogLine(
              attName,
              '腐蚀领域·自然',
              d.name || '敌方',
              rn,
              natDmg,
              '智力',
              1.2,
              d.hp,
              '智力×1.2=' + natDmg,
            ),
          );
        }
        var poisonedCount = 0;
        for (var ei = 0; ei < enemies.length; ei++) {
          var en = enemies[ei];
          if (!en) continue;
          var eh = en.hp != null ? parseInt(en.hp, 10) : 0;
          if (eh <= 0) continue;
          if (getUnitBuffLayers(en, '中毒') > 0) poisonedCount++;
        }
        if (poisonedCount > 0) {
          addBuffLayers(attacker, '孕育', '孕育', poisonedCount, attacker);
          capUnitBuffs(attacker);
          appendCombatLog(
            attName + ' 腐蚀领域：场上 ' + poisonedCount + ' 名敌人处于【中毒】，获得 ' + poisonedCount + ' 层【孕育】',
          );
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var tt = 0; tt < targets.length; tt++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[tt].slotNum + '"]');
          if (slotEl && !targets[tt].resN.hit) playMissEffect(slotEl);
        }
        if (typeof window.toastr !== 'undefined') window.toastr.success('腐蚀领域 释放完毕');
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'SlashSpecial1', afterAnim腐蚀领域);
        });
      } else {
        afterAnim腐蚀领域();
      }
    }
    function executePlayer异种外壳(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '丝伊德·白' || isAllyDefeated(attacker)) return;
      if (!attacker.specialSkillsUnlocked || attacker.specialSkillsUnlocked.indexOf('异种外壳') === -1) return;
      var skillAp = 2;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lilim = null;
      for (var li = 0; li < party.length; li++) {
        var ul = party[li];
        if (!ul || (ul.name || '') !== '莉莉姆') continue;
        if (isAllyDefeated(ul)) continue;
        lilim = ul;
        break;
      }
      var shield = 0;
      if (lilim) {
        var lh = lilim.hp != null ? parseInt(lilim.hp, 10) : 0;
        shield = Math.max(0, Math.floor(lh * 1.2));
      } else {
        var staV = getDisplayStat(attacker, 'sta') || 0;
        var defV = getDisplayStat(attacker, 'def') || 0;
        shield = Math.max(0, Math.floor(staV * 1.2 + defV * 1.6));
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shield;
      if (shield > 0) addBuffLayers(attacker, '护盾', '护盾', shield);
      var cleansed = 0;
      for (var ci = 0; ci < 2; ci++) {
        if (getUnitBuffLayers(attacker, '孕育') <= 0) break;
        if (!hasAnyNegativeDebuffFor异种外壳(attacker)) break;
        if (!consumeUnitBuffLayers(attacker, '孕育', 1)) break;
        if (removeOneNegativeDebuffStack(attacker)) cleansed++;
      }
      var yuFromShield = Math.min(3, Math.floor(shield / 20));
      if (yuFromShield > 0) {
        addBuffLayers(attacker, '孕育', '孕育', yuFromShield, attacker);
        capUnitBuffs(attacker);
      }
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(
        (attacker.name || '丝伊德·白') +
          ' 异种外壳：获得 ' +
          shield +
          ' 点护盾' +
          (cleansed > 0 ? '，消耗【孕育】清除 ' + cleansed + ' 个负面' : '') +
          (yuFromShield > 0 ? '，护盾转化 ' + yuFromShield + ' 层【孕育】' : ''),
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('异种外壳：+' + shield + ' 护盾');
      var el = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      if (el) playAnimationOnSlot(el, 'Recovery4', function () {});
    }
    function executePlayer破阵冲锋(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || (attacker.name || '') !== '丝伊德·白' || isAllyDefeated(attacker)) return;
      if (!attacker.specialSkillsUnlocked || attacker.specialSkillsUnlocked.indexOf('破阵冲锋') === -1) return;
      var skillAp = 2;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var strV = getDisplayStat(attacker, 'str') || 0;
      var defV = getDisplayStat(attacker, 'def') || 0;
      var baseDmg = Math.max(0, Math.floor(strV * 1.5 + defV * 0.75));
      var result = resolveAttack(attacker, defender, baseDmg, true);
      var attName = attacker.name || '丝伊德·白';
      var defName = defender.name || '敌方';
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var keruiSlot = -1;
      for (var ks = 0; ks < party.length; ks++) {
        var ku = party[ks];
        if (!ku || (ku.name || '') !== '可瑞') continue;
        if (isAllyDefeated(ku)) continue;
        keruiSlot = ks + 1;
        break;
      }
      function applyMainAndKerui() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        if (result.hit) {
          applyDamageToTarget(
            defender,
            result.finalDamage,
            result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
          );
          addBuffLayers(defender, '破甲', '破甲', 1, attacker);
        }
        appendCombatLog(
          formatAttackLogLine(
            attName,
            '破阵冲锋',
            defName,
            result,
            baseDmg,
            '力+防',
            null,
            defender.hp,
            'Str×1.5+Def×0.75=' + baseDmg,
          ),
        );
        if (keruiSlot > 0) {
          for (var es = 1; es <= 6; es++) {
            var d2 = enemies[es - 1];
            if (!d2) continue;
            var h2 = d2.hp != null ? parseInt(d2.hp, 10) : 0;
            if (h2 <= 0) continue;
            executeKerui缠绕撕咬Scaled(keruiSlot, es, 0.5, '破阵冲锋');
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(result.hit ? '破阵冲锋 命中' : '破阵冲锋 未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyMainAndKerui();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Holy3', applyMainAndKerui);
          });
        } else {
          applyMainAndKerui();
        }
      } else {
        applyMainAndKerui();
      }
    }
    function executePlayer威吓(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '丝伊德·白' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '威吓') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.5 : lv === 2 ? 0.6 : lv === 3 ? 0.7 : 0.8;
      var adv = skill.advancement;
      var label =
        lv >= 5 && adv === 'A' ? '菌丝摇篮' : lv >= 5 && adv === 'B' ? '金粉帷幕' : '威吓';
      addBuffLayers(attacker, '嘲讽', '嘲讽', 2);
      var shield = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * mult));
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shield;
      if (shield > 0) addBuffLayers(attacker, '护盾', '护盾', shield);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      if (lv >= 5 && adv === 'A') {
        var jinUnit = null;
        for (var ji = 0; ji < party.length; ji++) {
          var uj = party[ji];
          if (!uj || (uj.name || '') !== '堇') continue;
          if (isAllyDefeated(uj)) continue;
          jinUnit = uj;
          break;
        }
        if (jinUnit) {
          addBuffLayers(attacker, '再生', '再生', 2, jinUnit);
          addBuffLayers(attacker, '孕育', '孕育', 1);
          capUnitBuffs(attacker);
          appendCombatLog((jinUnit.name || '堇') + '（威吓）对丝伊德·白发动再生菌丝');
        }
      }
      if (lv >= 5 && adv === 'B') {
        var mcUnit = null;
        for (var mi = 0; mi < party.length; mi++) {
          var um = party[mi];
          if (!um || (um.name || '') !== '蒙特卡洛') continue;
          if (isAllyDefeated(um)) continue;
          mcUnit = um;
          break;
        }
        if (mcUnit) {
          for (var ei = 0; ei < enemies.length; ei++) {
            var en = enemies[ei];
            if (!en) continue;
            var ehp = en.hp != null ? parseInt(en.hp, 10) : 1;
            if (ehp <= 0) continue;
            addBuffLayers(en, '恍惚', '恍惚', 1, mcUnit);
            addBuffLayers(en, '迟钝', '迟钝', 1, mcUnit);
          }
          appendCombatLog((mcUnit.name || '蒙特卡洛') + '（威吓）发动金粉弥漫');
        }
      }
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(
        (attacker.name || '丝伊德·白') + ' 使用「' + label + '」：2层【嘲讽】，' + shield + ' 点护盾',
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('威吓：嘲讽 + ' + shield + ' 护盾');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var el = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
          playAnimationOnSlot(el, 'Recovery2', function () {});
        });
      });
    }
    /** 绯色轮舞：丝伊德·白。混合近战群体 2 AP，敌方全体物+然双段；Lv5-A 蒙特卡洛在场则命中者恍惚+虚弱；Lv5-B 可瑞在场则命中者破甲+随机血触侵蚀。 */
    function executePlayer绯色轮舞(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '丝伊德·白' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '绯色轮舞') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var strV = getDisplayStat(attacker, 'str') || 0;
      var intV = getDisplayStat(attacker, 'int') || 0;
      var multStr = lv === 1 ? 0.4 : lv === 2 ? 0.5 : lv === 3 ? 0.5 : 0.6;
      var multInt = lv === 1 ? 0.4 : lv === 2 ? 0.4 : lv === 3 ? 0.5 : 0.6;
      if (lv >= 5 && (skill.advancement === 'A' || skill.advancement === 'B')) {
        multStr = 0.6;
        multInt = 0.6;
      }
      var physDmg = Math.max(0, Math.floor(strV * multStr));
      var natDmg = Math.max(0, Math.floor(intV * multInt));
      var targets = [];
      for (var ti = 1; ti <= 6; ti++) {
        var def = enemies[ti - 1];
        if (!def || (def.hp != null && parseInt(def.hp, 10) <= 0)) continue;
        var resP = resolveAttack(attacker, def, physDmg, true);
        var resN = resolveAttack(attacker, def, natDmg, true, { magicOnly: true });
        targets.push({ slotNum: ti, defender: def, resP: resP, resN: resN });
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var adv = skill.advancement;
      var skillLabel =
        lv >= 5 && adv === 'A' ? '孢子旋风' : lv >= 5 && adv === 'B' ? '血触风暴' : '绯色轮舞';
      var attName = attacker.name || '丝伊德·白';
      var monteUnit = null;
      var keruiUnit = null;
      for (var pi = 0; pi < party.length; pi++) {
        var pu = party[pi];
        if (!pu || isAllyDefeated(pu)) continue;
        if ((pu.name || '') === '蒙特卡洛') monteUnit = pu;
        if ((pu.name || '') === '可瑞') keruiUnit = pu;
      }
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function afterAnim() {
        var totalAll = 0;
        for (var t = 0; t < targets.length; t++) {
          var d = targets[t].defender;
          var rp = targets[t].resP;
          var rn = targets[t].resN;
          var anyHit = rp.hit || rn.hit;
          if (rp.hit) {
            applyDamageToTarget(
              d,
              rp.finalDamage,
              rp.shadowDamage ? { shadowDamage: rp.shadowDamage } : undefined,
            );
            totalAll += rp.finalDamage;
          }
          var hpAfterPhys = d.hp;
          if (rn.hit) {
            applyDamageToTarget(
              d,
              rn.finalDamage,
              rn.shadowDamage ? { shadowDamage: rn.shadowDamage } : undefined,
            );
            totalAll += rn.finalDamage;
          }
          if (lv >= 5 && adv === 'A' && monteUnit && anyHit) {
            addBuffLayers(d, '恍惚', '恍惚', 1, monteUnit);
            addBuffLayers(d, '虚弱', '虚弱', 1, monteUnit);
          }
          if (lv >= 5 && adv === 'B' && keruiUnit && anyHit) {
            addBuffLayers(d, '破甲', '破甲', 1, keruiUnit);
          }
          appendCombatLog(
            formatAttackLogLine(
              attName,
              skillLabel + '·物理',
              d.name || '敌方',
              rp,
              physDmg,
              '力量',
              multStr,
              hpAfterPhys,
              '力量×' + multStr + '=' + physDmg,
            ),
          );
          appendCombatLog(
            formatAttackLogLine(
              attName,
              skillLabel + '·自然',
              d.name || '敌方',
              rn,
              natDmg,
              '智力',
              multInt,
              d.hp,
              '智力×' + multInt + '=' + natDmg,
            ),
          );
        }
        if (lv >= 5 && adv === 'B' && keruiUnit) {
          var candidates = [];
          for (var ci = 0; ci < enemies.length; ci++) {
            var en = enemies[ci];
            if (!en) continue;
            var eh = en.hp != null ? parseInt(en.hp, 10) : 1;
            if (eh > 0) candidates.push({ slotNum: ci + 1, defender: en });
          }
          if (candidates.length > 0) {
            var pick = candidates[Math.floor(Math.random() * candidates.length)];
            var keruiAtk = parseInt(keruiUnit.atk, 10) || 0;
            var bleedBase = Math.max(0, Math.floor(keruiAtk * 0.7));
            var resBleed = resolveAttack(keruiUnit, pick.defender, bleedBase, true, { magicOnly: true });
            if (resBleed.hit) {
              applyDamageToTarget(
                pick.defender,
                resBleed.finalDamage,
                resBleed.shadowDamage ? { shadowDamage: resBleed.shadowDamage } : undefined,
              );
              addBuffLayers(pick.defender, '中毒', '中毒', 2, keruiUnit);
              totalAll += resBleed.finalDamage;
              appendCombatLog(
                (keruiUnit.name || '可瑞') +
                  ' 血触侵蚀（绯色轮舞）对 ' +
                  (pick.defender.name || '敌方') +
                  ' 造成 ' +
                  resBleed.finalDamage +
                  ' 伤害并施加【中毒】',
              );
            } else {
              appendCombatLog(
                (keruiUnit.name || '可瑞') + ' 血触侵蚀（绯色轮舞）未命中 ' + (pick.defender.name || '敌方'),
              );
            }
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var tt = 0; tt < targets.length; tt++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[tt].slotNum + '"]');
          if (slotEl && !targets[tt].resP.hit && !targets[tt].resN.hit) playMissEffect(slotEl);
        }
        if (typeof window.toastr !== 'undefined')
          window.toastr.success('绯色轮舞 完毕，共造成约 ' + totalAll + ' 点伤害');
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'SlashSpecial1', afterAnim);
        });
      } else {
        afterAnim();
      }
    }
    /** 魔物孕育：校验通过返回上下文，失败返回 null（并已 toastr） */
    function 魔物孕育TryGetContext(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '丝伊德·白' || isAllyDefeated(attacker)) return null;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '魔物孕育') return null;
      var factories = [];
      if (createSummonLilim) factories.push(createSummonLilim);
      if (createSummonKerui) factories.push(createSummonKerui);
      if (createSummonMonteCarlo) factories.push(createSummonMonteCarlo);
      if (createSummonJin) factories.push(createSummonJin);
      if (!factories.length) {
        if (typeof window.toastr !== 'undefined') window.toastr.error('召唤数据未加载');
        return null;
      }
      var skillAp = skill.ap != null ? parseInt(skill.ap, 10) : 2;
      var maxAp = getEffectiveMaxApForAlly(attacker);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return null;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement || null;
      var dual = lv >= 5 && adv === 'B';
      var needLayers = get魔物孕育消耗层数(skill);
      var haveLayers = getUnitBuffLayers(attacker, '孕育');
      if (haveLayers < needLayers) {
        if (typeof window.toastr !== 'undefined')
          window.toastr.warning('【孕育】不足（需要 ' + needLayers + ' 层，当前 ' + haveLayers + ' 层）');
        return null;
      }
      var emptySlots = [];
      for (var ei = 0; ei < SLOT_COUNT; ei++) {
        if (party[ei] == null) emptySlots.push(ei + 1);
      }
      if (dual) {
        if (emptySlots.length < 2) {
          if (typeof window.toastr !== 'undefined') window.toastr.warning('需要至少 2 个己方空位才能双生孕育');
          return null;
        }
        if (factories.length < 2) {
          if (typeof window.toastr !== 'undefined') window.toastr.warning('女儿模板不足，无法双生召唤');
          return null;
        }
      } else {
        if (emptySlots.length < 1) {
          if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可用的己方空位');
          return null;
        }
      }
      function filterFactoriesExcludingPresentDaughters(allFactories, partyArr) {
        return allFactories.filter(function (fac) {
          var nm = fac && fac.name ? String(fac.name) : '';
          if (!nm) return true;
          for (var pi = 0; pi < partyArr.length; pi++) {
            var pu = partyArr[pi];
            if (!pu || isAllyDefeated(pu)) continue;
            if ((pu.name || '') === nm) return false;
          }
          return true;
        });
      }
      var factoriesAvailable = filterFactoriesExcludingPresentDaughters(factories, party);
      if (dual) {
        if (factoriesAvailable.length < 2) {
          if (typeof window.toastr !== 'undefined')
            window.toastr.warning('可召唤的不同女儿不足 2 名（每种女儿同时只能存在 1 个）');
          return null;
        }
      } else {
        if (factoriesAvailable.length < 1) {
          if (typeof window.toastr !== 'undefined')
            window.toastr.warning('四种女儿均已在场，无法召唤重复种类');
          return null;
        }
      }
      return {
        party: party,
        enemies: enemies,
        attacker: attacker,
        skill: skill,
        skillAp: skillAp,
        curAp: curAp,
        dual: dual,
        needLayers: needLayers,
        emptySlots: emptySlots,
        factoriesAvailable: factoriesAvailable,
        hpMult: dual ? 0.8 : 1,
        lv: lv,
        adv: adv,
      };
    }
    /** 魔物孕育：先高亮己方空位供玩家选择，再执行召唤（双生孕育需选两个不同空位） */
    function startPlayer魔物孕育SlotPick(allySlot, skillIndex) {
      var ctx = 魔物孕育TryGetContext(allySlot, skillIndex);
      if (!ctx) return;
      if (!window.BattleGrid || !window.BattleGrid.enterAllyEmptySlotTargetMode) {
        if (typeof window.toastr !== 'undefined') window.toastr.error('目标选择未就绪');
        return;
      }
      if (typeof window.toastr !== 'undefined') {
        window.toastr.info(ctx.dual ? '请选择第一个己方空位（双生孕育需再选第二个）' : '请选择己方空位以召唤女儿');
      }
      if (!ctx.dual) {
        window.BattleGrid.enterAllyEmptySlotTargetMode(ctx.party, function (slotNum) {
          executePlayer魔物孕育(allySlot, skillIndex, [slotNum]);
        });
        return;
      }
      window.BattleGrid.enterAllyEmptySlotTargetMode(ctx.party, function (slot1) {
        var party2 = getParty();
        if (typeof window.toastr !== 'undefined') window.toastr.info('请选择第二个己方空位');
        window.BattleGrid.enterAllyEmptySlotTargetMode(
          party2,
          function (slot2) {
            executePlayer魔物孕育(allySlot, skillIndex, [slot1, slot2]);
          },
          { excludeSlotNums: [slot1] },
        );
      });
    }
    /** 魔物孕育：丝伊德·白。消耗【孕育】在玩家选择的己方空位召唤女儿；女儿种类仍随机；Lv5-B 双生孕育 MaxHP×0.8。召唤特效使用 Revival1。 */
    function executePlayer魔物孕育(allySlot, skillIndex, chosenSlots) {
      var ctx = 魔物孕育TryGetContext(allySlot, skillIndex);
      if (!ctx) return;
      if (!chosenSlots || !chosenSlots.length) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('未指定召唤位置');
        return;
      }
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker) return;
      var dual = ctx.dual;
      var needLen = dual ? 2 : 1;
      if (chosenSlots.length !== needLen) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('所选空位数量不正确');
        return;
      }
      var emptyNow = [];
      for (var ei = 0; ei < SLOT_COUNT; ei++) {
        if (party[ei] == null) emptyNow.push(ei + 1);
      }
      var chosen = [];
      for (var ci = 0; ci < chosenSlots.length; ci++) {
        var sn = parseInt(chosenSlots[ci], 10);
        if (sn < 1 || sn > 6 || emptyNow.indexOf(sn) === -1) {
          if (typeof window.toastr !== 'undefined') window.toastr.warning('所选空位已不可用，请重试');
          return;
        }
        chosen.push(sn);
      }
      if (dual && chosen[0] === chosen[1]) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('双生孕育需要两个不同的空位');
        return;
      }
      function cloneSkillList(skills) {
        if (!skills || !skills.length) return [];
        return skills.map(function (sk) {
          var o = {};
          for (var k in sk) {
            if (Object.prototype.hasOwnProperty.call(sk, k)) o[k] = sk[k];
          }
          return o;
        });
      }
      function buildUnitFromTemplate(template, hpMult) {
        hpMult = hpMult == null ? 1 : hpMult;
        var maxHp = Math.max(1, Math.floor(template.maxHpFromOwner(attacker) * hpMult));
        var u = {
          name: template.name,
          hp: maxHp,
          maxHp: maxHp,
          atk: Math.max(0, template.atkFromOwner(attacker)),
          def: Math.max(0, template.defFromOwner(attacker)),
          currentAp: template.ap != null ? parseInt(template.ap, 10) || 2 : 2,
          level: Math.max(1, parseInt(attacker.level, 10) || 1),
          skills: cloneSkillList(template.skills),
          buffs: [],
        };
        if (template.daughterUnit) u.daughterUnit = true;
        if (template.trait柔软躯体) u.trait柔软躯体 = true;
        if (template.introduce) u.introduce = template.introduce;
        if (template.passiveSkills) {
          u.passiveSkills = template.passiveSkills.map(function (ps) {
            var po = {};
            for (var pk in ps) {
              if (Object.prototype.hasOwnProperty.call(ps, pk)) po[pk] = ps[pk];
            }
            return po;
          });
        }
        return u;
      }
      var needLayers = ctx.needLayers;
      var skillAp = ctx.skillAp;
      var curAp = ctx.curAp;
      var factoriesAvailable = ctx.factoriesAvailable;
      var hpMult = ctx.hpMult;
      var dualFlag = ctx.dual;
      var lv = ctx.lv;
      var adv = ctx.adv;
      if (!consumeUnitBuffLayers(attacker, '孕育', needLayers)) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('【孕育】扣除失败');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var chosenSlotsFinal = chosen;
      var units = [];
      var names = [];
      if (dualFlag) {
        var idxA = Math.floor(Math.random() * factoriesAvailable.length);
        var idxB = Math.floor(Math.random() * (factoriesAvailable.length - 1));
        if (idxB >= idxA) idxB++;
        var tA = factoriesAvailable[idxA];
        var tB = factoriesAvailable[idxB];
        units.push(buildUnitFromTemplate(tA, hpMult));
        units.push(buildUnitFromTemplate(tB, hpMult));
        names.push(units[0].name || '');
        names.push(units[1].name || '');
      } else {
        var t0 = factoriesAvailable[Math.floor(Math.random() * factoriesAvailable.length)];
        units.push(buildUnitFromTemplate(t0, hpMult));
        names.push(units[0].name || '');
      }
      for (var pi = 0; pi < chosenSlotsFinal.length; pi++) {
        party[chosenSlotsFinal[pi] - 1] = units[pi];
      }
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var label = lv >= 5 && adv === 'A' ? '孕育加速' : lv >= 5 && adv === 'B' ? '双生孕育' : '魔物孕育';
      var logExtra = dualFlag ? names.join('、') : names[0];
      appendCombatLog(
        (attacker.name || '丝伊德·白') +
          ' 使用「' +
          label +
          '」：消耗 ' +
          needLayers +
          ' 层【孕育】，在 ' +
          chosenSlotsFinal.join('、') +
          ' 号位召唤 ' +
          logExtra,
      );
      if (typeof window.toastr !== 'undefined')
        window.toastr.success(dualFlag ? '已召唤：' + logExtra : '已召唤 ' + (names[0] || '女儿'));
      function playOnSlotSeq(slotNums, idx, animDone) {
        if (idx >= slotNums.length) {
          if (typeof animDone === 'function') animDone();
          return;
        }
        var el = document.querySelector('.slot[data-slot="ally-' + slotNums[idx] + '"]');
        if (el) {
          playAnimationOnSlot(el, 'Revival1', function () {
            playOnSlotSeq(slotNums, idx + 1, animDone);
          });
        } else {
          playOnSlotSeq(slotNums, idx + 1, animDone);
        }
      }
      playOnSlotSeq(chosenSlotsFinal, 0, function () {});
    }
    /** 清算之手：艾丽卡技能。神圣/远程/单体，1 AP。Int×0.4～0.6 神圣伤害，艾丽卡获得2层【嘲讽】；Lv5-A 制裁 施加1层【眩晕】；Lv5-B 罪印 施加1层【碎魔】和1层【破甲】。 */
    function executePlayer清算之手(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '清算之手') return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var advancement = skill.advancement;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        addBuffLayers(attacker, '嘲讽', '嘲讽', 2);
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (result.hit) {
          if (advancement === 'A') {
            addBuffLayers(defender, '眩晕', '眩晕', 1, attacker);
            appendCombatLog(defName + ' 被施加1层【眩晕】');
          } else if (advancement === 'B') {
            addBuffLayers(defender, '碎魔', '碎魔', 1, attacker);
            addBuffLayers(defender, '破甲', '破甲', 1, attacker);
            appendCombatLog(defName + ' 被施加1层【碎魔】和1层【破甲】');
          }
        }
        appendCombatLog(attName + ' 获得2层【嘲讽】');
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(
            attName,
            advancement === 'A' ? '制裁' : advancement === 'B' ? '罪印' : '清算之手',
            defName,
            result,
            baseDamage,
            '智力',
            null,
            defender.hp,
            '',
          ),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(result.hit ? '清算之手 造成 ' + result.finalDamage + ' 点伤害' : '清算之手 未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Holy3', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 神恩救赎：艾丽卡技能。治疗/远程/单体，1 AP。为友方单体回复 Int×0.7～1.0；Lv5-A 自愈圣光 若目标为自身治疗+50%；Lv5-B 厚泽 回复 Int×1.0+Sta×0.8。 */
    function executePlayer神恩救赎(allySlot, targetAllySlot, skillIndex) {
      var party = getParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || !target || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '神恩救赎') return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var int = getDisplayStat(attacker, 'int') || 0;
      var sta = getDisplayStat(attacker, 'sta') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var advancement = skill.advancement;
      var baseHeal = 0;
      if (advancement === 'B') {
        baseHeal = Math.floor(int * 1.0) + Math.floor(sta * 0.8);
      } else {
        var mult = lv === 1 ? 0.7 : lv === 2 ? 0.8 : lv === 3 ? 0.9 : 1.0;
        if (advancement === 'A') mult = 1.0;
        baseHeal = Math.floor(int * mult);
        if (advancement === 'A' && target === attacker) baseHeal = Math.floor(baseHeal * 1.5);
      }
      baseHeal = Math.max(0, baseHeal);
      var appliedHeal = apply丝伊德共生母胎HealMultiplier(target, baseHeal);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var maxHp = target.maxHp != null ? parseInt(target.maxHp, 10) : getHpFromSta(getDisplayStat(target, 'sta') || 1);
      var curHp = target.hp != null ? parseInt(target.hp, 10) : maxHp;
      target.hp = Math.min(maxHp, curHp + appliedHeal);
      var attName = attacker.name || '己方';
      var targetName = target.name || '友方';
      var skillDisplayName = advancement === 'A' ? '自愈圣光' : advancement === 'B' ? '厚泽' : '神恩救赎';
      saveBattleData(party, getEnemyParty());
      renderAllySlots(party);
      appendCombatLog(attName + ' 使用 ' + skillDisplayName + ' 为 ' + targetName + ' 回复 ' + appliedHeal + ' 生命');
      var targetSlotEl = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      if (targetSlotEl) playHealEffect(targetSlotEl, appliedHeal);
      if (attackerSlotEl && targetSlotEl && attackerSlotEl !== targetSlotEl) {
        playStrikeShake(attackerSlotEl, targetSlotEl, function () {
          if (targetSlotEl) playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
        });
      } else if (targetSlotEl) {
        playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
      }
      if (typeof window.toastr !== 'undefined')
        window.toastr.success('神恩救赎 为 ' + targetName + ' 回复 ' + appliedHeal + ' 生命');
    }
    /** 星语祝祷：凌遥仙。增益/远程/单体，2 AP。回复 Int×系数；对目标施加最高属性对应强化（2 层，Lv5-A 为 3 层）；Lv5-B 额外 2 层【防御强化】；凌遥仙获得 2 层【诗章】。 */
    function pick星语祝祷HighestStatBuffId(target) {
      if (!target || typeof getDisplayStat !== 'function') return { id: '智力强化', label: '智力强化' };
      var s = getDisplayStat(target, 'str') || 0;
      var a = getDisplayStat(target, 'agi') || 0;
      var i = getDisplayStat(target, 'int') || 0;
      if (i >= s && i >= a) return { id: '智力强化', label: '智力强化' };
      if (s >= a && s >= i) return { id: '力量强化', label: '力量强化' };
      return { id: '敏捷强化', label: '敏捷强化' };
    }
    function executePlayer星语祝祷(allySlot, targetAllySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '星语祝祷') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement;
      var baseHeal = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill) || 0));
      var appliedHeal = apply丝伊德共生母胎HealMultiplier(target, baseHeal);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var maxHp = target.maxHp != null ? parseInt(target.maxHp, 10) : getHpFromSta(getDisplayStat(target, 'sta') || 1);
      var curHp = target.hp != null ? parseInt(target.hp, 10) : maxHp;
      target.hp = Math.min(maxHp, curHp + appliedHeal);
      var statLayers = lv >= 5 && adv === 'A' ? 3 : 2;
      var pick = pick星语祝祷HighestStatBuffId(target);
      addBuffLayers(target, pick.id, pick.label, statLayers, attacker);
      if (lv >= 5 && adv === 'B') addBuffLayers(target, '防御强化', '防御强化', 2, attacker);
      addBuffLayers(attacker, '诗章', '诗章', 2, attacker);
      capUnitBuffs(target);
      capUnitBuffs(attacker);
      var attName = attacker.name || '凌遥仙';
      var targetName = target.name || '友方';
      var skillDisplayName =
        lv >= 5 && adv === 'A' ? '星辉灌注' : lv >= 5 && adv === 'B' ? '星光共鸣' : '星语祝祷';
      saveBattleData(party, enemies);
      renderAllySlots(party);
      var logExtra =
        statLayers +
        '层【' +
        pick.label +
        '】' +
        (lv >= 5 && adv === 'B' ? '、2层【防御强化】' : '') +
        '，2层【诗章】';
      appendCombatLog(
        attName +
          ' 使用「' +
          skillDisplayName +
          '」为 ' +
          targetName +
          ' 回复 ' +
          appliedHeal +
          ' 生命，' +
          logExtra,
      );
      var targetSlotEl = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      if (targetSlotEl) playHealEffect(targetSlotEl, appliedHeal);
      if (attackerSlotEl && targetSlotEl && attackerSlotEl !== targetSlotEl) {
        playStrikeShake(attackerSlotEl, targetSlotEl, function () {
          if (targetSlotEl) playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
        });
      } else if (targetSlotEl) {
        playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
      }
      if (typeof window.toastr !== 'undefined')
        window.toastr.success(skillDisplayName + '：为 ' + targetName + ' 回复 ' + appliedHeal + ' 生命');
    }
    /** 辉烬壁障：凌遥仙。增益/远程/单体，1 AP。Int×+Def× 护盾；凌遥仙获得 2 层【诗章】。Lv5-A 星纱帷幕：诗章≥5 时清 1 负面+【扰魔】；Lv5-B 辉烬坚壁：破盾时剩余辉烬的 50% 治疗+【格挡】。 */
    function executePlayer辉烬壁障(allySlot, targetAllySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '辉烬壁障') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement;
      var poemBefore = getUnitBuffLayers(attacker, '诗章');
      var shieldValue = getShieldForSkill(attacker, skill);
      if (shieldValue !== shieldValue || shieldValue <= 0) shieldValue = 0;
      shieldValue = Math.max(0, Math.floor(shieldValue));
      attacker.currentAp = Math.max(0, curAp - skillAp);
      if (adv === 'B') {
        var prevH = target._辉烬坚壁剩余 != null ? Math.max(0, parseInt(target._辉烬坚壁剩余, 10) || 0) : 0;
        target._辉烬坚壁剩余 = prevH + shieldValue;
      } else if (target._辉烬坚壁剩余 != null) delete target._辉烬坚壁剩余;
      if (shieldValue > 0) {
        target.currentShield =
          (target.currentShield != null ? parseInt(target.currentShield, 10) || 0 : 0) + shieldValue;
        addBuffLayers(target, '护盾', '护盾', shieldValue, attacker);
      }
      addBuffLayers(attacker, '诗章', '诗章', 2, attacker);
      if (lv >= 5 && adv === 'A') {
        if (poemBefore >= 5) removeOneNegativeDebuffStack(target);
        addBuffLayers(target, '扰魔', '扰魔', 1, attacker);
      } else if (lv >= 5 && adv === 'B') {
        addBuffLayers(target, '格挡', '格挡', 1, attacker);
      }
      capUnitBuffs(target);
      capUnitBuffs(attacker);
      var attName = attacker.name || '凌遥仙';
      var targetName = target.name || '友方';
      var skillDisplayName =
        lv >= 5 && adv === 'A' ? '星纱帷幕' : lv >= 5 && adv === 'B' ? '辉烬坚壁' : '辉烬壁障';
      saveBattleData(party, enemies);
      renderAllySlots(party);
      var logLine =
        attName +
        ' 使用「' +
        skillDisplayName +
        '」为 ' +
        targetName +
        ' 提供 ' +
        shieldValue +
        ' 点护盾，2层【诗章】';
      if (lv >= 5 && adv === 'A') {
        logLine += '，1层【扰魔】';
        if (poemBefore >= 5) logLine += '，清除1个负面状态';
      } else if (lv >= 5 && adv === 'B') logLine += '，1层【格挡】';
      appendCombatLog(logLine);
      if (typeof window.toastr !== 'undefined')
        window.toastr.success(skillDisplayName + '：' + shieldValue + ' 护盾');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var targetSlotEl = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (targetSlotEl) playAnimationOnSlot(targetSlotEl, 'Recovery2', function () {});
          if (attackerSlotEl && targetSlotEl && attackerSlotEl !== targetSlotEl)
            playStrikeShake(attackerSlotEl, targetSlotEl, function () {});
        });
      });
    }
    /** 星海调和：凌遥仙。治疗/远程/单体，1 AP。2 层【再生】+ 即时治疗（Lv.1 无）；+1【诗章】。Lv5-A 星海漫灌：目标当前生命低于 50% 时消耗 2 层【诗章】使本次治疗翻倍；Lv5-B 星辉回流：消耗 2 层【诗章】额外施加 Int×0.6 护盾。 */
    function executePlayer星海调和(allySlot, targetAllySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '星海调和') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement;
      attacker.currentAp = Math.max(0, curAp - skillAp);
      addBuffLayers(target, '再生', '再生', 2, attacker);
      var baseHeal = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill) || 0));
      var intStat = getDisplayStat(attacker, 'int') || 0;
      var maxHp = target.maxHp != null ? parseInt(target.maxHp, 10) : getHpFromSta(getDisplayStat(target, 'sta') || 1);
      var curHp = target.hp != null ? parseInt(target.hp, 10) : maxHp;
      var shieldExtra = 0;
      var doubledHeal = false;
      if (lv >= 5 && adv === 'A' && maxHp > 0 && curHp / maxHp < 0.5 && getUnitBuffLayers(attacker, '诗章') >= 2) {
        if (consumeBuffLayersFromUnit(attacker, '诗章', 2) === 2) {
          baseHeal *= 2;
          doubledHeal = true;
        }
      } else if (lv >= 5 && adv === 'B' && getUnitBuffLayers(attacker, '诗章') >= 2) {
        if (consumeBuffLayersFromUnit(attacker, '诗章', 2) === 2) {
          shieldExtra = Math.max(0, Math.floor(intStat * 0.6));
        }
      }
      var appliedHeal = apply丝伊德共生母胎HealMultiplier(target, baseHeal);
      target.hp = Math.min(maxHp, curHp + appliedHeal);
      if (shieldExtra > 0) {
        target.currentShield =
          (target.currentShield != null ? parseInt(target.currentShield, 10) || 0 : 0) + shieldExtra;
        addBuffLayers(target, '护盾', '护盾', shieldExtra, attacker);
      }
      addBuffLayers(attacker, '诗章', '诗章', 1, attacker);
      capUnitBuffs(target);
      capUnitBuffs(attacker);
      var attName = attacker.name || '凌遥仙';
      var targetName = target.name || '友方';
      var skillDisplayName =
        lv >= 5 && adv === 'A' ? '星海漫灌' : lv >= 5 && adv === 'B' ? '星辉回流' : '星海调和';
      saveBattleData(party, enemies);
      renderAllySlots(party);
      var logLine =
        attName +
        ' 使用「' +
        skillDisplayName +
        '」：' +
        targetName +
        ' 获得2层【再生】';
      if (appliedHeal > 0) logLine += '，回复 ' + appliedHeal + ' 生命';
      if (doubledHeal) logLine += '（诗章翻倍）';
      if (shieldExtra > 0) logLine += '，' + shieldExtra + ' 额外护盾（星辉回流）';
      logLine += '，1层【诗章】';
      appendCombatLog(logLine);
      if (typeof window.toastr !== 'undefined')
        window.toastr.success(skillDisplayName + (appliedHeal > 0 ? ' +' + appliedHeal : ''));
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var targetSlotEl = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
      if (targetSlotEl && appliedHeal > 0) playHealEffect(targetSlotEl, appliedHeal);
      if (attackerSlotEl && targetSlotEl && attackerSlotEl !== targetSlotEl) {
        playStrikeShake(attackerSlotEl, targetSlotEl, function () {
          if (targetSlotEl) playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
        });
      } else if (targetSlotEl) {
        playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
      }
    }
    /** 天穹颂歌：凌遥仙。增益/远程/群体，2 AP。友方全体 Int× 护盾；诗章≥5 时消耗 5 层并对友方全体施加【激励】；Lv5-A 终末咏唱另对敌方全体【脆弱】；Lv5-B 星河永续另对友方全体 1 层【再生】。 */
    function executePlayer天穹颂歌(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '天穹颂歌') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effApTq = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effApTq) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement;
      var shieldValue = getShieldForSkill(attacker, skill);
      if (shieldValue !== shieldValue || shieldValue <= 0) shieldValue = 0;
      shieldValue = Math.max(0, Math.floor(shieldValue));
      applyAllySkillApCost(attacker, skillAp, curAp);
      var poemBonus = false;
      if (getUnitBuffLayers(attacker, '诗章') >= 5 && consumeBuffLayersFromUnit(attacker, '诗章', 5) === 5) {
        poemBonus = true;
      }
      var ai;
      for (ai = 0; ai < party.length; ai++) {
        var ally = party[ai];
        if (!ally || isAllyDefeated(ally)) continue;
        if (shieldValue > 0) {
          ally.currentShield =
            (ally.currentShield != null ? parseInt(ally.currentShield, 10) || 0 : 0) + shieldValue;
          addBuffLayers(ally, '护盾', '护盾', shieldValue, attacker);
        }
        if (poemBonus) {
          addBuffLayers(ally, '激励', '激励', 1, attacker);
          if (lv >= 5 && adv === 'B') addBuffLayers(ally, '再生', '再生', 1, attacker);
        }
        capUnitBuffs(ally);
      }
      if (poemBonus && lv >= 5 && adv === 'A' && enemies && enemies.length) {
        for (var ei = 0; ei < enemies.length; ei++) {
          var en = enemies[ei];
          if (!en || (en.hp != null && parseInt(en.hp, 10) <= 0)) continue;
          addBuffLayers(en, '脆弱', '脆弱', 1, attacker);
          capUnitBuffs(en);
        }
      }
      capUnitBuffs(attacker);
      var attName = attacker.name || '凌遥仙';
      var skillDisplayName =
        lv >= 5 && adv === 'A' ? '终末咏唱' : lv >= 5 && adv === 'B' ? '星河永续' : '天穹颂歌';
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var logLine =
        attName +
        ' 使用「' +
        skillDisplayName +
        '」：友方全体' +
        (shieldValue > 0 ? ' +' + shieldValue + ' 护盾' : '');
      if (poemBonus) {
        logLine += '，消耗5层【诗章】，友方全体1层【激励】';
        if (lv >= 5 && adv === 'A') logLine += '，敌方全体1层【脆弱】';
        if (lv >= 5 && adv === 'B') logLine += '，友方全体1层【再生】';
      }
      appendCombatLog(logLine);
      if (typeof window.toastr !== 'undefined') window.toastr.success(skillDisplayName + ' 释放完毕');
      var allySideEl = document.querySelector('.side-ally');
      if (allySideEl) playAnimationOnContainer(allySideEl, 'Cure2', function () {});
    }
    /** 凌遥仙特殊：星辰定锚。3 次命中判定，每次成功叠 1 层【眩晕】；+3【诗章】。每场 1 次。 */
    function executePlayer星辰定锚(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      if (!defender || (defender.hp != null && parseInt(defender.hp, 10) <= 0)) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var hits = 0;
      var t;
      for (t = 0; t < 3; t++) {
        var hr = getPlayerHitRate(attacker, defender);
        var roll = roll1To100();
        if (roll <= hr) {
          hits++;
          addBuffLayers(defender, '眩晕', '眩晕', 1, attacker);
        }
      }
      addBuffLayers(attacker, '诗章', '诗章', 3, attacker);
      capUnitBuffs(defender);
      capUnitBuffs(attacker);
      applyAllySkillApCost(attacker, skillAp, curAp);
      markLingyaoOnceSpecialUsed('星辰定锚');
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(
        (attacker.name || '凌遥仙') +
          ' 星辰定锚：3 次判定命中 ' +
          hits +
          ' 次，眩晕叠加；获得3层【诗章】',
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('星辰定锚');
    }
    /** 凌遥仙特殊：星辰加速。友方 3 层【星辰加速】。 */
    function executePlayer星辰加速(allySlot, targetAllySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      addBuffLayers(target, '星辰加速', '星辰加速', 3, attacker);
      capUnitBuffs(target);
      applyAllySkillApCost(attacker, skillAp, curAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      appendCombatLog(
        (attacker.name || '凌遥仙') + ' 星辰加速：' + (target.name || '友方') + ' 获得3层【星辰加速】',
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('星辰加速');
    }
    /** 凌遥仙特殊：星命逆转。耗 5【诗章】，友方【星命】+ 护盾快照。每场 1 次。 */
    function executePlayer星命逆转(allySlot, targetAllySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      if (getUnitBuffLayers(attacker, '诗章') < 5) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('【诗章】不足 5 层');
        return;
      }
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      if (consumeBuffLayersFromUnit(attacker, '诗章', 5) < 5) return;
      var intL = getDisplayStat(attacker, 'int') || 0;
      var defL = getDisplayStat(attacker, 'def') || 0;
      var shSnap = Math.max(0, Math.floor(intL * 1.5) + Math.floor(defL * 1.0));
      target._星命护盾值 = shSnap;
      addBuffLayers(target, '星命', '星命', 1, attacker);
      capUnitBuffs(target);
      applyAllySkillApCost(attacker, skillAp, curAp);
      markLingyaoOnceSpecialUsed('星命逆转');
      saveBattleData(party, enemies);
      renderAllySlots(party);
      appendCombatLog(
        (attacker.name || '凌遥仙') +
          ' 星命逆转：' +
          (target.name || '友方') +
          ' 获得【星命】（免死护盾 ' +
          shSnap +
          '）',
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('星命逆转');
    }
    /** 凌遥仙特殊：命仪精准。友方 1 层【命仪精准】。每场 1 次。 */
    function executePlayer命仪精准(allySlot, targetAllySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '凌遥仙' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      var effAp = getEffectiveSkillApCostForAlly(attacker, skillAp);
      if (curAp < effAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      addBuffLayers(target, '命仪精准', '命仪精准', 1, attacker);
      capUnitBuffs(target);
      applyAllySkillApCost(attacker, skillAp, curAp);
      markLingyaoOnceSpecialUsed('命仪精准');
      saveBattleData(party, enemies);
      renderAllySlots(party);
      appendCombatLog(
        (attacker.name || '凌遥仙') + ' 命仪精准：' + (target.name || '友方') + ' 下次攻击必中必暴',
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('命仪精准');
    }
    /** 孢子云：自然/远程/群体，对敌方全体自然伤害并【中毒】。 */
    function executePlayer孢子云(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '\u5807' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '孢子云') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp =
        attacker.name === '白牙' || attacker.daughterUnit === true
          ? 2
          : getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var rawEffect = skill.effectByLevel ? getSkillEffectForLevel(skill, skill.level || 1) : skill.effect || '';
      var resolvedEffect = resolveSkillEffect(rawEffect, attacker);
      var baseDamage = getBaseDamageFromResolvedEffect(resolvedEffect);
      if (baseDamage !== baseDamage || baseDamage <= 0) baseDamage = getBaseDamageForSkill(attacker, skill);
      baseDamage = Math.max(0, Math.floor(baseDamage));
      var targets = [];
      for (var si = 1; si <= 6; si++) {
        var def = enemies[si - 1];
        if (def && (def.hp == null || parseInt(def.hp, 10) > 0)) {
          var res = resolveAttack(attacker, def, baseDamage, true, { isRanged: true, magicOnly: true });
          targets.push({ slotNum: si, defender: def, result: res });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var attName = attacker.name || '\u5807';
      var damageCalcStr = '攻击×0.4=' + baseDamage;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function after孢子云Anim() {
        for (var t = 0; t < targets.length; t++) {
          var d = targets[t].defender;
          var r = targets[t].result;
          applyDamageToTarget(d, r.finalDamage, r.shadowDamage ? { shadowDamage: r.shadowDamage } : undefined);
          if (r.hit) addBuffLayers(d, '中毒', '中毒', 1, attacker);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var tt = 0; tt < targets.length; tt++) {
          var d2 = targets[tt].defender;
          var r2 = targets[tt].result;
          appendCombatLog(
            formatAttackLogLine(attName, '孢子云', d2.name || '敌方', r2, baseDamage, null, null, d2.hp, damageCalcStr),
          );
        }
        for (var t2 = 0; t2 < targets.length; t2++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t2].slotNum + '"]');
          if (slotEl && !targets[t2].result.hit) playMissEffect(slotEl);
        }
        if (typeof window.toastr !== 'undefined') window.toastr.success('孢子云 释放完毕');
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'SlashSpecial1', after孢子云Anim);
        });
      } else {
        after孢子云Anim();
      }
    }
    /** 黏液包裹：莉莉姆。自然/近战/单体，1 AP。ATK×0.6 自然伤害，命中叠 1 层【迟缓】。 */
    function executePlayer黏液包裹(allySlot, skillIndex, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || (attacker.name || '') !== '莉莉姆' || isAllyDefeated(attacker)) return;
      if (!defender || (defender.hp != null && parseInt(defender.hp, 10) <= 0)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '黏液包裹') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = attacker.daughterUnit === true ? 2 : getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true, isMelee: true });
      var attName = attacker.name || '莉莉姆';
      var defName = defender.name || '敌方';
      var damageCalcStr = 'ATK×0.6=' + baseDamage;
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        if (result.hit) {
          applyDamageToTarget(
            defender,
            result.finalDamage,
            result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
          );
          addBuffLayers(defender, '迟缓', '迟缓', 1, attacker);
          appendCombatLog(attName + ' 对 ' + defName + ' 施加1层【迟缓】');
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(attName, '黏液包裹', defName, result, baseDamage, null, null, defender.hp, damageCalcStr),
        );
        if (typeof window.toastr !== 'undefined') {
          window.toastr.success(result.hit ? '黏液包裹 命中' : '黏液包裹 未命中');
        }
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'Holy3', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 弹性护盾：莉莉姆。增益/自身，1 AP。DEF×1.2 护盾。 */
    function executePlayer弹性护盾(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '莉莉姆' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '弹性护盾') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = attacker.daughterUnit === true ? 2 : getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var rawEffect = skill.effect || '';
      var resolvedEffect = resolveSkillEffect(rawEffect, attacker);
      var shieldValue = getShieldFromResolvedEffect(resolvedEffect);
      if (shieldValue !== shieldValue || shieldValue <= 0) shieldValue = getShieldForSkill(attacker, skill);
      shieldValue = Math.max(0, Math.floor(shieldValue));
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shieldValue;
      if (shieldValue > 0) addBuffLayers(attacker, '护盾', '护盾', shieldValue);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '莉莉姆') + ' 使用弹性护盾，获得 ' + shieldValue + ' 点护盾');
      if (typeof window.toastr !== 'undefined') window.toastr.success('弹性护盾：' + shieldValue + ' 护盾');
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          if (allySlotEl) playAnimationOnSlot(allySlotEl, 'Recovery2', function () {});
        });
      });
    }
    /** 虚妄护盾：月见遥。1 AP。Int×a+Def×a 特殊护盾，仅第一次受击即整层清空；Lv5-A 镜面反射：被敌方攻击打碎护盾时反弹本次受到伤害的50%；Lv5-B 幻影替身：对任意友方施加。施放时替换目标身上原有【护盾】。 */
    function executePlayer虚妄护盾(allySlot, targetAllySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || !target || isAllyDefeated(attacker) || isAllyDefeated(target)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '虚妄护盾') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement;
      var coeff = lv === 1 ? 0.5 : lv === 2 ? 0.6 : lv === 3 ? 0.7 : 0.8;
      var intV = getDisplayStat(attacker, 'int') || 0;
      var defV = getDisplayStat(attacker, 'def') || 0;
      var shieldValue = Math.max(0, Math.floor(intV * coeff + defV * coeff));
      var isMirror = lv >= 5 && adv === 'A';
      if (target.buffs)
        target.buffs = target.buffs.filter(function (b) {
          return (b.id || b.name) !== '护盾';
        });
      target.currentShield = 0;
      target._虚妄护盾一击 = false;
      target._虚妄护盾镜面反射 = false;
      if (shieldValue > 0) {
        target.currentShield = shieldValue;
        addBuffLayers(target, '护盾', '护盾', shieldValue, attacker);
        target._虚妄护盾一击 = true;
        if (isMirror) target._虚妄护盾镜面反射 = true;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      capUnitBuffs(target);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var skillLabel =
        lv >= 5 && adv === 'A' ? '镜面反射' : lv >= 5 && adv === 'B' ? '幻影替身' : '虚妄护盾';
      var attName = attacker.name || '月见遥';
      var tgtName = target.name || '友方';
      var logExtra =
        targetAllySlot !== allySlot
          ? '为 ' + tgtName + ' 施加 ' + shieldValue + ' 点虚妄护盾（仅承受1次攻击）'
          : '获得 ' + shieldValue + ' 点虚妄护盾（仅承受1次攻击）';
      appendCombatLog(attName + ' 使用「' + skillLabel + '」，' + logExtra);
      if (typeof window.toastr !== 'undefined')
        window.toastr.success(skillLabel + '：' + shieldValue + ' 护盾');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var tel = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
          if (tel) playAnimationOnSlot(tel, 'Recovery4', function () {});
        });
      });
    }
    /** 再生菌丝：治疗/远程/单体，对友方 2 层【再生】；目标为丝伊德·白时 +1 层【孕育】。 */
    function executePlayer再生菌丝(allySlot, targetAllySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '\u5807' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '再生菌丝') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp =
        attacker.name === '白牙' || attacker.daughterUnit === true
          ? 2
          : getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      addBuffLayers(target, '再生', '再生', 2, attacker);
      if ((target.name || '') === '丝伊德·白') addBuffLayers(target, '孕育', '孕育', 1, attacker);
      capUnitBuffs(target);
      var attName = attacker.name || '\u5807';
      var targetName = target.name || '友方';
      saveBattleData(party, enemies);
      renderAllySlots(party);
      appendCombatLog(
        attName +
          ' 对 ' +
          targetName +
          ' 使用再生菌丝：2层【再生】' +
          ((target.name || '') === '丝伊德·白' ? '，1层【孕育】' : ''),
      );
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var targetSlotEl = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
      if (targetSlotEl) playAnimationOnSlot(targetSlotEl, 'Recovery2', function () {});
      if (attackerSlotEl && targetSlotEl && attackerSlotEl !== targetSlotEl)
        playStrikeShake(attackerSlotEl, targetSlotEl, function () {});
      if (typeof window.toastr !== 'undefined') window.toastr.success('再生菌丝 已施加');
    }
    /** 金粉弥漫：蒙特卡洛。减益/远程/群体，对存活敌方全体各 1 层【恍惚】【迟钝】。 */
    function executePlayer金粉弥漫(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '蒙特卡洛' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '金粉弥漫') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp =
        attacker.name === '白牙' || attacker.daughterUnit === true
          ? 2
          : getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var hitAny = false;
      for (var i = 0; i < (enemies || []).length; i++) {
        var en = enemies[i];
        if (en && (en.hp == null || parseInt(en.hp, 10) > 0)) {
          addBuffLayers(en, '恍惚', '恍惚', 1, attacker);
          addBuffLayers(en, '迟钝', '迟钝', 1, attacker);
          capUnitBuffs(en);
          hitAny = true;
        }
      }
      if (!hitAny) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可施加减益的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var attName = attacker.name || '蒙特卡洛';
      appendCombatLog(attName + ' 使用 金粉弥漫，对所有存活敌人施加1层【恍惚】和1层【迟钝】');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function afterMonteDebuff() {
        if (typeof window.toastr !== 'undefined') window.toastr.success('金粉弥漫 释放完毕');
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'Holy2', afterMonteDebuff);
        });
      } else {
        afterMonteDebuff();
      }
    }
    /** 迷雾幻境：月见遥。减益/远程/群体，2 AP。对存活敌方全体施加【恍惚】；Lv5-A 虚实倒错 敌方每次 Miss 对自身 Atk×0.3 魔法伤害；Lv5-B 认知崩解 另施加【迟钝】。 */
    function executePlayer迷雾幻境(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || (attacker.name || '') !== '月见遥' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '迷雾幻境') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var adv = skill.advancement;
      var huanLayers = lv <= 2 ? 2 : 3;
      battleState.迷雾幻境虚实倒错 = lv >= 5 && adv === 'A';
      var hitAny = false;
      for (var ei = 0; ei < (enemies || []).length; ei++) {
        var en = enemies[ei];
        if (en && (en.hp == null || parseInt(en.hp, 10) > 0)) {
          addBuffLayers(en, '恍惚', '恍惚', huanLayers, attacker);
          if (lv >= 5 && adv === 'B') addBuffLayers(en, '迟钝', '迟钝', 3, attacker);
          capUnitBuffs(en);
          hitAny = true;
        }
      }
      if (!hitAny) {
        battleState.迷雾幻境虚实倒错 = false;
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可施加减益的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var skillLabel =
        lv >= 5 && adv === 'A' ? '虚实倒错' : lv >= 5 && adv === 'B' ? '认知崩解' : '迷雾幻境';
      var logExtra =
        huanLayers +
        '层【恍惚】' +
        (lv >= 5 && adv === 'B' ? '，3层【迟钝】' : '') +
        (lv >= 5 && adv === 'A' ? '（虚实倒错：敌方 Miss 时自伤 Atk×0.3）' : '');
      appendCombatLog((attacker.name || '月见遥') + ' 使用「' + skillLabel + '」，对存活敌方全体施加' + logExtra);
      if (typeof window.toastr !== 'undefined') window.toastr.success(skillLabel + ' 已释放');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'Mist-Pink', function () {});
        });
      }
    }
    /** 芬芳治愈：蒙特卡洛。治疗/远程/单体，回复 ATK×0.8；目标为丝伊德·白时 +1 层【孕育】。 */
    function executePlayer芬芳治愈(allySlot, targetAllySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || (attacker.name || '') !== '蒙特卡洛' || isAllyDefeated(attacker)) return;
      if (!target || isAllyDefeated(target)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '芬芳治愈') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp =
        attacker.name === '白牙' || attacker.daughterUnit === true
          ? 2
          : getApByLevel(attacker.level != null ? attacker.level : 1);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var atkVal = attacker.atk != null ? parseInt(attacker.atk, 10) : 0;
      var baseHeal = Math.max(0, Math.floor(atkVal * 0.8));
      var appliedHeal = apply丝伊德共生母胎HealMultiplier(target, baseHeal);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var maxHp = target.maxHp != null ? parseInt(target.maxHp, 10) : getHpFromSta(getDisplayStat(target, 'sta') || 1);
      var curHp = target.hp != null ? parseInt(target.hp, 10) : maxHp;
      target.hp = Math.min(maxHp, curHp + appliedHeal);
      if ((target.name || '') === '丝伊德·白') {
        addBuffLayers(target, '孕育', '孕育', 1, attacker);
        capUnitBuffs(target);
      }
      var attName = attacker.name || '蒙特卡洛';
      var targetName = target.name || '友方';
      saveBattleData(party, enemies);
      renderAllySlots(party);
      appendCombatLog(attName + ' 使用 芬芳治愈 为 ' + targetName + ' 回复 ' + appliedHeal + ' 生命');
      var targetSlotEl = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      if (targetSlotEl) playHealEffect(targetSlotEl, appliedHeal);
      if (attackerSlotEl && targetSlotEl && attackerSlotEl !== targetSlotEl) {
        playStrikeShake(attackerSlotEl, targetSlotEl, function () {
          if (targetSlotEl) playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
        });
      } else if (targetSlotEl) {
        playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
      }
      if (typeof window.toastr !== 'undefined')
        window.toastr.success('芬芳治愈 为 ' + targetName + ' 回复 ' + appliedHeal + ' 生命');
    }
    /** 罪罚宣告：艾丽卡技能。神圣/远程/群体，2 AP。对敌方全体 Int×0.8～1.1 神圣伤害+1层【虚弱】；Lv5-A 血祭宣判 消耗自身20%当前HP，伤害 Int×1.1+Sta×0.6，命中目标1层【虚弱】；Lv5-B 圣言镇压 伤害 Int×1.1，命中目标1层【虚弱】+2层【脆弱】。 */
    function executePlayer罪罚宣告(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || !attacker.skills || isAllyDefeated(attacker)) return;
      var skill = skillIndex >= 0 && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '罪罚宣告') return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var advancement = skill.advancement;
      if (advancement === 'A') {
        var maxHpA =
          attacker.maxHp != null ? parseInt(attacker.maxHp, 10) : getHpFromSta(getDisplayStat(attacker, 'sta') || 1);
        var curHpA = attacker.hp != null ? parseInt(attacker.hp, 10) : maxHpA;
        var cost = Math.max(0, Math.floor(curHpA * 0.2));
        attacker.hp = Math.max(0, curHpA - cost);
        if (cost > 0) appendCombatLog((attacker.name || '艾丽卡') + ' 消耗 ' + cost + ' 生命（血祭宣判）');
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var targets = [];
      for (var i = 1; i <= 6; i++) {
        var def = enemies[i - 1];
        if (def && (def.hp == null || parseInt(def.hp, 10) > 0)) {
          var res = resolveAttack(attacker, def, baseDamage, true, { magicOnly: true });
          targets.push({ slotNum: i, defender: def, result: res });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var attName = attacker.name || '艾丽卡';
      var skillDisplayName = advancement === 'A' ? '血祭宣判' : advancement === 'B' ? '圣言镇压' : '罪罚宣告';
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function afterAnim() {
        for (var t = 0; t < targets.length; t++) {
          var def = targets[t].defender;
          var res = targets[t].result;
          applyDamageToTarget(def, res.finalDamage, res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined);
          if (res.hit) {
            addBuffLayers(def, '虚弱', '虚弱', 1, attacker);
            if (advancement === 'B') addBuffLayers(def, '脆弱', '脆弱', 2, attacker);
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var tt = 0; tt < targets.length; tt++) {
          var d = targets[tt].defender;
          var r = targets[tt].result;
          appendCombatLog(
            formatAttackLogLine(attName, skillDisplayName, d.name || '敌方', r, baseDamage, null, null, d.hp, ''),
          );
        }
        for (var t = 0; t < targets.length; t++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t].slotNum + '"]');
          if (slotEl && !targets[t].result.hit) playMissEffect(slotEl);
        }
        if (typeof window.toastr !== 'undefined') window.toastr.success('罪罚宣告 释放完毕');
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'Holy5', afterAnim);
        });
      } else {
        afterAnim();
      }
    }
    /** 盲目之光：艾丽卡特殊技能。减益/远程/群体，1 AP。对所有敌人施加2层【恍惚】和2层【迟钝】。 */
    function executePlayer盲目之光(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '艾丽卡' || isAllyDefeated(attacker)) return;
      var skillAp = 1;
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null
          ? parseInt(attacker.currentAp, 10)
          : getApByLevel(attacker.level);
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      for (var i = 0; i < (enemies || []).length; i++) {
        var en = enemies[i];
        if (en && (en.hp == null || parseInt(en.hp, 10) > 0)) {
          addBuffLayers(en, '恍惚', '恍惚', 2, attacker);
          addBuffLayers(en, '迟钝', '迟钝', 2, attacker);
        }
      }
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '艾丽卡') + ' 使用 盲目之光，对所有敌人施加2层【恍惚】和2层【迟钝】');
      if (typeof window.toastr !== 'undefined') window.toastr.success('盲目之光 释放完毕');
    }
    /** 救赎：艾丽卡特殊技能。治疗/远程/单体，3 AP。消耗自身30%当前HP，回复目标150%消耗量并清除负面状态；若目标未满血则获得 Sta×1.5 护盾。 */
    function executePlayer救赎(allySlot, targetAllySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var target = party[targetAllySlot - 1];
      if (!attacker || attacker.name !== '艾丽卡' || !target || isAllyDefeated(attacker)) return;
      var skillAp = 3;
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null
          ? parseInt(attacker.currentAp, 10)
          : getApByLevel(attacker.level);
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var curHpSelf =
        attacker.hp != null ? parseInt(attacker.hp, 10) : getHpFromSta(getDisplayStat(attacker, 'sta') || 1);
      var cost = Math.max(0, Math.floor(curHpSelf * 0.3));
      attacker.hp = Math.max(0, curHpSelf - cost);
      var healVal = Math.floor(cost * 1.5);
      healVal = apply丝伊德共生母胎HealMultiplier(target, healVal);
      if (cost > 0) appendCombatLog((attacker.name || '艾丽卡') + ' 消耗 ' + cost + ' 生命（救赎）');
      target.buffs = (target.buffs || []).filter(function (b) {
        return NEGATIVE_DEBUFF_IDS.indexOf((b.id || b.name || '').trim()) === -1;
      });
      var maxHpTarget =
        target.maxHp != null ? parseInt(target.maxHp, 10) : getHpFromSta(getDisplayStat(target, 'sta') || 1);
      var curHpTarget = target.hp != null ? parseInt(target.hp, 10) : maxHpTarget;
      target.hp = Math.min(maxHpTarget, curHpTarget + healVal);
      if (target.hp < maxHpTarget) {
        var shieldVal = Math.max(0, Math.floor((getDisplayStat(attacker, 'sta') || 0) * 1.5));
        target.currentShield = (target.currentShield != null ? parseInt(target.currentShield, 10) || 0 : 0) + shieldVal;
        addBuffLayers(target, '护盾', '护盾', shieldVal);
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(
        (attacker.name || '艾丽卡') +
          ' 使用 救赎 为 ' +
          (target.name || '友方') +
          ' 回复 ' +
          healVal +
          ' 生命并清除负面状态',
      );
      var targetSlotEl = document.querySelector('.slot[data-slot="ally-' + targetAllySlot + '"]');
      if (targetSlotEl) {
        playHealEffect(targetSlotEl, healVal);
        playAnimationOnSlot(targetSlotEl, 'Holy2', function () {});
      }
      if (typeof window.toastr !== 'undefined')
        window.toastr.success('救赎 为 ' + (target.name || '友方') + ' 回复 ' + healVal + ' 生命');
    }
    /** 圣火净世：艾丽卡特殊技能。神圣/远程/群体，2 AP。对敌方全体 Int×0.8 神圣伤害；对自身和所有命中目标施加2次【燃烧】；自伤 Sta×0.5；每命中1敌获得 Def×0.4 护盾。 */
    function executePlayer圣火净世(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '艾丽卡' || isAllyDefeated(attacker)) return;
      var skillAp = 2;
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null
          ? parseInt(attacker.currentAp, 10)
          : getApByLevel(attacker.level);
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor((getDisplayStat(attacker, 'int') || 0) * 0.8));
      var selfDmg = Math.max(0, Math.floor((getDisplayStat(attacker, 'sta') || 0) * 0.5));
      var hitCount = 0;
      var targets = [];
      for (var i = 1; i <= 6; i++) {
        var def = enemies[i - 1];
        if (def && (def.hp == null || parseInt(def.hp, 10) > 0)) {
          var res = resolveAttack(attacker, def, baseDamage, true, { magicOnly: true });
          targets.push({ slotNum: i, defender: def, result: res });
          if (res.hit) hitCount++;
        }
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      applyDamageToTarget(attacker, selfDmg);
      addBuffLayers(attacker, '燃烧', '燃烧', 2, attacker);
      if (selfDmg > 0) appendCombatLog((attacker.name || '艾丽卡') + ' 承受 ' + selfDmg + ' 自伤（圣火净世）');
      var shieldPerHit = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 0.4));
      var totalShield = shieldPerHit * hitCount;
      if (totalShield > 0) {
        attacker.currentShield =
          (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + totalShield;
        addBuffLayers(attacker, '护盾', '护盾', totalShield);
        appendCombatLog((attacker.name || '艾丽卡') + ' 获得 ' + totalShield + ' 护盾');
      }
      function afterHolyAnim() {
        for (var t = 0; t < targets.length; t++) {
          var def = targets[t].defender;
          var res = targets[t].result;
          applyDamageToTarget(def, res.finalDamage, res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined);
          if (res.hit) addBuffLayers(def, '燃烧', '燃烧', 2, attacker);
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var tt = 0; tt < targets.length; tt++) {
          var d = targets[tt].defender;
          var r = targets[tt].result;
          appendCombatLog(
            formatAttackLogLine(
              attacker.name || '艾丽卡',
              '圣火净世',
              d.name || '敌方',
              r,
              baseDamage,
              null,
              null,
              d.hp,
              '',
            ),
          );
        }
        for (var t = 0; t < targets.length; t++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t].slotNum + '"]');
          if (slotEl && !targets[t].result.hit) playMissEffect(slotEl);
        }
        if (typeof window.toastr !== 'undefined') window.toastr.success('圣火净世 释放完毕');
      }
      var enemySideEl = document.querySelector('.side-enemy');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'Holy5', afterHolyAnim);
        });
      } else {
        afterHolyAnim();
      }
    }
    /** 炎魔吹息：夜露技能。火焰/远程/单体，消耗 1 AP。火焰伤害，施加【燃烧】；Lv5-A 炼狱吐息 2 次燃烧，Lv5-B 灼心之火 有 Cha×5% 概率施加 1 层【魅惑】。 */
    /** 妖艳业火：夜露技能。火焰/远程/群体，消耗 2 AP。对敌方全体造成 [Int×0.9～1.2] 火焰伤害并施加 2 次【燃烧】；A 炼狱 立即结算一次燃烧伤害；B 魅焰 每目标 Cha×5% 魅惑，对【魅惑】目标再施加 2 次【燃烧】。 */
    function executePlayer妖艳业火(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '夜露' || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '妖艳业火') return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var targets = [];
      for (var i = 1; i <= 6; i++) {
        var def = enemies[i - 1];
        if (def && (def.hp == null || parseInt(def.hp, 10) > 0)) {
          var res = resolveAttack(attacker, def, baseDamage, true, { magicOnly: true });
          targets.push({ slotNum: i, defender: def, result: res });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      var attName = attacker.name || '夜露';
      var int = getDisplayStat(attacker, 'int') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
      var damageCalcStr = '智力×' + mult + '=' + baseDamage;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      function afterFlameAnim() {
        for (var t = 0; t < targets.length; t++) {
          var def = targets[t].defender;
          var res = targets[t].result;
          applyDamageToTarget(def, res.finalDamage, res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined);
          if (attacker.name === '夜露') yoruConsumeCharmIfHit(attacker, def, res.hit);
          if (res.hit) addBuffLayers(def, '燃烧', '燃烧', 2, attacker);
        }
        if (skill.advancement === 'A') {
          for (var t = 0; t < targets.length; t++) {
            var def = targets[t].defender;
            if (def.hp == null || parseInt(def.hp, 10) <= 0) continue;
            var buffs = def.buffs || [];
            for (var b = 0; b < buffs.length; b++) {
              var buf = buffs[b];
              if ((buf.id !== '燃烧' && buf.name !== '燃烧') || (parseInt(buf.layers, 10) || 0) <= 0) continue;
              var layers = parseInt(buf.layers, 10) || 0;
              var burnDmg = layers;
              var curHp = def.hp != null ? parseInt(def.hp, 10) : 100;
              def.hp = Math.max(0, curHp - burnDmg);
              if (def.hp === 0) def._justDefeated = true;
              buf.layers = Math.max(0, layers - 5);
              break;
            }
          }
        } else if (skill.advancement === 'B') {
          var cha = getDisplayStat(attacker, 'cha') || 0;
          var charmChance = Math.min(100, Math.floor(cha * 5));
          for (var t = 0; t < targets.length; t++) {
            var def = targets[t].defender;
            if (def.hp == null || parseInt(def.hp, 10) <= 0) continue;
            if (charmChance > 0 && Math.floor(Math.random() * 100) < charmChance) {
              addBuffLayers(def, '魅惑', '魅惑', 1, attacker);
            }
          }
          for (var t = 0; t < targets.length; t++) {
            var def = targets[t].defender;
            if (def.hp == null || parseInt(def.hp, 10) <= 0) continue;
            var hasCharm = (def.buffs || []).some(function (b) {
              return (b.id === '魅惑' || b.name === '魅惑') && (parseInt(b.layers, 10) || 0) > 0;
            });
            if (hasCharm) addBuffLayers(def, '燃烧', '燃烧', 2, attacker);
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        for (var tt = 0; tt < targets.length; tt++) {
          var d = targets[tt].defender;
          var r = targets[tt].result;
          appendCombatLog(
            formatAttackLogLine(attName, '妖艳业火', d.name || '敌方', r, baseDamage, null, null, d.hp, damageCalcStr),
          );
        }
        for (var t = 0; t < targets.length; t++) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t].slotNum + '"]');
          if (slotEl && !targets[t].result.hit) playMissEffect(slotEl);
        }
        if (typeof window.toastr !== 'undefined') window.toastr.success('妖艳业火 释放完毕');
      }
      if (attackerSlotEl && enemySideEl) {
        playStrikeShake(attackerSlotEl, null, function () {
          playAnimationOnContainer(enemySideEl, 'E-fire2', afterFlameAnim);
        });
      } else {
        afterFlameAnim();
      }
    }
    /** 使用防御/剑脊格挡等给自己加盾的技能：不选目标，在己方角色上播放 Recovery4 护盾动画并添加护盾、扣除 AP */
    function executePlayer炎魔吹息(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '炎魔吹息') return;
      var skillAp = 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var baseDamage = getBaseDamageForSkill(attacker, skill);
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      var attName = attacker.name || '己方';
      var defName = defender.name || '敌方';
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      function applyDamageAndLog() {
        attacker.currentAp = Math.max(0, curAp - skillAp);
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (attacker.name === '夜露') yoruConsumeCharmIfHit(attacker, defender, result.hit);
        if (result.hit) {
          var burnLayers = skill.advancement === 'A' ? 2 : 1;
          addBuffLayers(defender, '燃烧', '燃烧', burnLayers, attacker);
          if (skill.advancement === 'B') {
            var cha = getDisplayStat(attacker, 'cha') || 0;
            var charmChance = Math.min(100, Math.floor(cha * 5));
            if (charmChance > 0 && Math.floor(Math.random() * 100) < charmChance) {
              addBuffLayers(defender, '魅惑', '魅惑', 1, attacker);
              appendCombatLog(attName + ' 对 ' + defName + ' 施加1层【魅惑】');
            }
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        appendCombatLog(
          formatAttackLogLine(attName, '炎魔吹息', defName, result, baseDamage, '智力', null, defender.hp, 'Int×系数'),
        );
        if (typeof window.toastr !== 'undefined')
          window.toastr.success(result.hit ? '炎魔吹息 造成 ' + result.finalDamage + ' 点伤害' : '炎魔吹息 未命中');
      }
      if (defenderSlotEl) {
        if (!result.hit) {
          playMissEffect(defenderSlotEl);
          applyDamageAndLog();
        } else if (attackerSlotEl) {
          playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
            playAnimationOnSlot(defenderSlotEl, 'E-fire2', applyDamageAndLog);
          });
        } else {
          applyDamageAndLog();
        }
      } else {
        applyDamageAndLog();
      }
    }
    /** 使用防御/剑脊格挡等给自己加盾的技能：不选目标，在己方角色上播放 Recovery4 护盾动画并添加护盾、扣除 AP */
    function executePlayerDefense(allySlot, skillIndex) {
      var party = getParty();
      var attacker = party[allySlot - 1];
      if (!attacker) return;
      if (isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (
        !skill ||
        ((skill.name || '') !== '防御' && (skill.name || '') !== '剑脊格挡' && (skill.name || '') !== '见切')
      )
        return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var rawEffect = skill.effectByLevel ? getSkillEffectForLevel(skill, skill.level || 1) : skill.effect || '';
      var resolvedEffect = resolveSkillEffect(rawEffect, attacker);
      var shieldValue = getShieldFromResolvedEffect(resolvedEffect);
      if (shieldValue !== shieldValue || shieldValue <= 0) shieldValue = getShieldForSkill(attacker, skill);
      if (shieldValue !== shieldValue || shieldValue <= 0)
        shieldValue =
          skill.name === '防御' || (skill.name || '') === '见切'
            ? Math.max(0, getDisplayStat(attacker, 'def') || 0)
            : 0;
      if ((skill.name || '') === '见切') {
        var jqLv = Math.max(1, parseInt(skill.level, 10) || 1);
        var jqMult = jqLv === 1 ? 0.9 : jqLv === 2 ? 1.0 : jqLv === 3 ? 1.1 : 1.2;
        if (skill.advancement === 'A' || skill.advancement === 'B') jqMult = 1.2;
        shieldValue = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * jqMult));
      }
      shieldValue = Math.floor(shieldValue);
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shieldValue;
      if (shieldValue > 0) addBuffLayers(attacker, '护盾', '护盾', shieldValue);
      if ((skill.name || '') === '见切') {
        var 守势Layers = skill.advancement === 'B' ? 3 : 2;
        addBuffLayers(attacker, '守势', '守势', 守势Layers);
        if (skill.advancement === 'B') addBuffLayers(attacker, '坚韧', '坚韧', 1);
        if (skill.advancement === 'A') attacker.见切弹返 = true;
        attacker.本回合已获得攻势守势 = true;
      }
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, getEnemyParty());
      renderAllySlots(party);
      renderEnemySlots(getEnemyParty());
      var logMsg = (attacker.name || '己方') + ' 使用' + (skill.name || '') + '，获得 ' + shieldValue + ' 点护盾';
      if ((skill.name || '') === '见切')
        logMsg +=
          '，获得' +
          (skill.advancement === 'B' ? '3' : '2') +
          '层【守势】' +
          (skill.advancement === 'B' ? '、1层【坚韧】' : '') +
          (skill.advancement === 'A' ? '（弹返）' : '');
      appendCombatLog(logMsg);
      if (typeof window.toastr !== 'undefined') window.toastr.success('获得 ' + shieldValue + ' 点护盾');
      if (attacker.name === '清漓')
        on清漓指令完成(attacker, skill, { apCost: skillAp, commandUniqueKey: skill.name || '防御' });
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          playAnimationOnSlot(allySlotEl, 'Recovery2', function () {});
        });
      });
    }
    /** 猫步：岚的增益/自身技能。获得护盾 + 灵巧；A 影舞：2层灵巧 + 闪避时反击 Agi×0.4；B 疾风：1灵巧 + 1敏捷强化 */
    function executePlayer猫步(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '岚') return;
      if (isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '猫步') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var rawEffect = skill.effectByLevel ? getSkillEffectForLevel(skill, skill.level || 1) : skill.effect || '';
      if (skill.advancement === 'A' && skill.advancementOptions) {
        var optA = skill.advancementOptions.find(function (o) {
          return o.id === 'A';
        });
        if (optA && optA.effect) rawEffect = optA.effect;
      } else if (skill.advancement === 'B' && skill.advancementOptions) {
        var optB = skill.advancementOptions.find(function (o) {
          return o.id === 'B';
        });
        if (optB && optB.effect) rawEffect = optB.effect;
      }
      var resolvedEffect = resolveSkillEffect(rawEffect, attacker);
      var shieldValue = getShieldFromResolvedEffect(resolvedEffect);
      if (shieldValue !== shieldValue || shieldValue <= 0) shieldValue = getShieldForSkill(attacker, skill);
      shieldValue = Math.max(0, Math.floor(shieldValue));
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shieldValue;
      if (shieldValue > 0) addBuffLayers(attacker, '护盾', '护盾', shieldValue);
      if (skill.advancement === 'A') {
        addBuffLayers(attacker, '灵巧', '灵巧', 2);
        attacker.影舞反击 = { multAgi: 0.4 };
      } else if (skill.advancement === 'B') {
        addBuffLayers(attacker, '灵巧', '灵巧', 1);
        addBuffLayers(attacker, '敏捷强化', '敏捷强化', 1);
      } else {
        addBuffLayers(attacker, '灵巧', '灵巧', 1);
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var logMsg =
        (attacker.name || '岚') +
        ' 使用猫步，获得 ' +
        shieldValue +
        ' 点护盾，获得' +
        (skill.advancement === 'A' ? '2' : '1') +
        '层【灵巧】';
      if (skill.advancement === 'B') logMsg += '、1层【敏捷强化】';
      if (skill.advancement === 'A') logMsg += '（影舞：闪避时反击）';
      appendCombatLog(logMsg);
      if (typeof window.toastr !== 'undefined') window.toastr.success('猫步：获得护盾与灵巧');
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          playAnimationOnSlot(allySlotEl, 'Recovery2', function () {});
        });
      });
    }
    /** 纳刀：增益/自身，根据当前【攻势】与【守势】转化刀势，或获得 1 攻势 + 1 守势；可设置下次攻击伤害加成或暴击加成 */
    function executePlayer纳刀(allySlot, skillIndex) {
      var party = getParty();
      var attacker = party[allySlot - 1];
      if (!attacker) return;
      if (isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '纳刀') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      function getGs(unit, id) {
        var b = (unit.buffs || []).find(function (x) {
          return (x.id || x.name) === id;
        });
        return b ? parseInt(b.layers, 10) || 0 : 0;
      }
      var 攻势 = getGs(attacker, '攻势');
      var 守势 = getGs(attacker, '守势');
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var isA = skill.advancement === 'A';
      var isB = skill.advancement === 'B';
      var damagePct = lv === 1 ? 5 : lv === 2 ? 5 : lv === 3 ? 7.5 : 10;
      if (isA || isB) damagePct = 10;
      var defMult = lv === 1 ? 0.1 : lv === 2 ? 0.15 : lv === 3 ? 0.15 : 0.2;
      if (isA || isB) defMult = 0.2;
      var logParts = [];
      if (攻势 > 守势) {
        var converted = 守势;
        attacker.buffs = (attacker.buffs || []).filter(function (b) {
          return (b.id || b.name) !== '守势';
        });
        if (converted > 0) addBuffLayers(attacker, '攻势', '攻势', converted);
        attacker.纳刀下次伤害加成 = converted * damagePct;
        logParts.push(
          '消耗' +
            converted +
            '层【守势】转化为' +
            converted +
            '层【攻势】，下次攻击伤害+' +
            attacker.纳刀下次伤害加成 +
            '%',
        );
        if (isA && 攻势 + converted > 8) {
          addBuffLayers(attacker, '力量强化', '力量强化', 3);
          logParts.push('获得3层【力量强化】持续3回合');
        }
      } else if (守势 > 攻势) {
        var converted2 = 攻势;
        attacker.buffs = (attacker.buffs || []).filter(function (b) {
          return (b.id || b.name) !== '攻势';
        });
        if (converted2 > 0) addBuffLayers(attacker, '守势', '守势', converted2);
        var shVal = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * defMult * converted2));
        if (shVal > 0) {
          attacker.currentShield =
            (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shVal;
          addBuffLayers(attacker, '护盾', '护盾', shVal);
        }
        logParts.push(
          '消耗' +
            converted2 +
            '层【攻势】转化为' +
            converted2 +
            '层【守势】' +
            (shVal > 0 ? '，获得' + shVal + '护盾' : ''),
        );
        if (isA && 守势 + converted2 > 8) {
          addBuffLayers(attacker, '防御强化', '防御强化', 3);
          logParts.push('获得3层【防御强化】持续3回合');
        }
      } else {
        addBuffLayers(attacker, '攻势', '攻势', 1);
        addBuffLayers(attacker, '守势', '守势', 1);
        logParts.push('获得1层【攻势】和1层【守势】');
        if (isB) {
          var totalStance = 攻势 + 守势;
          attacker.纳刀共鸣暴击加成 = totalStance * 0.05;
          logParts.push('下次攻击暴击伤害+' + (attacker.纳刀共鸣暴击加成 * 100).toFixed(0) + '%');
        }
      }
      attacker.本回合已获得攻势守势 = true;
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, getEnemyParty());
      renderAllySlots(party);
      renderEnemySlots(getEnemyParty());
      appendCombatLog((attacker.name || '己方') + ' 使用纳刀，' + logParts.join('；'));
      if (typeof window.toastr !== 'undefined') window.toastr.success(logParts[0] || '纳刀');
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          playAnimationOnSlot(allySlotEl, 'Recovery2', function () {});
        });
      });
    }
    /** 白夜：昼墨特殊技能。基础 AOE（Str×0.5+Agi×0.5）。若【攻势】≥10 且未双势≥10：单体（Str×1.2+Agi×1.2，2层破甲）。若【守势】≥10 且未双势≥10：AOE（Str×0.75+Agi×0.75），暴击眩晕。若【攻势】和【守势】均≥10：AOE（Str×1.2+Agi×1.2），对命中目标进行[幸运×5%]即死判定，未即死则造成正常伤害。消耗 2 AP。 */
    function executePlayer白夜(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '昼墨') return;
      if (isAllyDefeated(attacker)) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp = attacker.currentAp != null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var 攻势B = 0;
      var 守势B = 0;
      (attacker.buffs || []).forEach(function (b) {
        if ((b.id || b.name) === '攻势') 攻势B = parseInt(b.layers, 10) || 0;
        if ((b.id || b.name) === '守势') 守势B = parseInt(b.layers, 10) || 0;
      });
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var luk = getDisplayStat(attacker, 'luk') || 0;
      var bothStance10 = 攻势B >= 10 && 守势B >= 10;
      if (bothStance10) {
        var baseDmgBoth = Math.max(0, Math.floor(str * 1.2 + agi * 1.2));
        var 即死率 = Math.min(100, Math.max(0, luk * 5));
        var targetsBoth = [];
        for (var s = 1; s <= 6; s++) {
          var e = enemies[s - 1];
          if (!e || (parseInt(e.hp, 10) || 0) <= 0) continue;
          var r = resolveAttack(attacker, e, baseDmgBoth, true);
          targetsBoth.push({ slotNum: s, def: e, result: r });
        }
        attacker.currentAp = Math.max(0, curAp - skillAp);
        for (var i = 0; i < targetsBoth.length; i++) {
          var t = targetsBoth[i];
          if (!t.result.hit) {
            appendCombatLog(
              formatAttackLogLine(
                attacker.name || '昼墨',
                '白夜（双势）',
                t.def.name || '敌方',
                t.result,
                baseDmgBoth,
                null,
                null,
                t.def.hp,
                '力量×1.2+敏捷×1.2=' + baseDmgBoth,
              ),
            );
            continue;
          }
          var roll = roll1To100();
          if (roll <= 即死率) {
            var maxHp = t.def.maxHp != null ? parseInt(t.def.maxHp, 10) : 100;
            var shield = t.def.currentShield != null ? Math.max(0, parseInt(t.def.currentShield, 10) || 0) : 0;
            // 即死：跳过一次自动飘字，改为在动画回调里显示“即死”
            t.def._skipDamageNumberOnce = true;
            applyDamageToTarget(t.def, (t.def.hp != null ? parseInt(t.def.hp, 10) : maxHp) + shield + 1);
            appendCombatLog(
              (attacker.name || '昼墨') +
                '使用白夜（双势）对' +
                (t.def.name || '敌方') +
                '；即死判定：Roll ' +
                roll +
                '/100(≤幸运×5%=' +
                即死率 +
                '%，即死成功)；' +
                (t.def.name || '敌方') +
                '剩余Hp:0；',
            );
          } else {
            applyDamageToTarget(
              t.def,
              t.result.finalDamage,
              t.result.shadowDamage ? { shadowDamage: t.result.shadowDamage } : undefined,
            );
            var fullLine = formatAttackLogLine(
              attacker.name || '昼墨',
              '白夜（双势）',
              t.def.name || '敌方',
              t.result,
              baseDmgBoth,
              null,
              null,
              t.def.hp,
              '力量×1.2+敏捷×1.2=' + baseDmgBoth,
            );
            var prefix = (attacker.name || '昼墨') + '使用白夜（双势）对' + (t.def.name || '敌方') + '；';
            var 即死Part = '即死判定：Roll ' + roll + '/100，＞ 幸运×5%=' + 即死率 + '%，未即死；';
            var rest = fullLine.substring(prefix.length);
            appendCombatLog(prefix + 即死Part + rest);
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        var enemySideEl = document.querySelector('.side-enemy');
        if (enemySideEl && targetsBoth.length > 0) {
          playAnimationOnContainer(enemySideEl, 'E-sword7', function () {
            for (var j = 0; j < targetsBoth.length; j++) {
              var slotEl = document.querySelector('.slot[data-slot="enemy-' + targetsBoth[j].slotNum + '"]');
              if (slotEl && targetsBoth[j].result.hit) {
                if ((parseInt(targetsBoth[j].def.hp, 10) || 0) <= 0) playHitEffect(slotEl, '即死');
              } else if (slotEl && !targetsBoth[j].result.hit) playMissEffect(slotEl);
            }
          });
        }
        return;
      }
      if (攻势B >= 10 && enemySlotNum != null) {
        var def = enemies[enemySlotNum - 1];
        if (!def) return;
        var baseD = Math.max(0, Math.floor(str * 1.2 + agi * 1.2));
        var res = resolveAttack(attacker, def, baseD, true);
        applyDamageToTarget(def, res.finalDamage);
        if (res.hit) addBuffLayers(def, '破甲', '破甲', 2);
        attacker.currentAp = Math.max(0, curAp - skillAp);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        var baiyaLog = formatAttackLogLine(
          attacker.name || '昼墨',
          '白夜（汇聚）',
          def.name || '敌方',
          res,
          baseD,
          null,
          null,
          def.hp,
          '力量×1.2+敏捷×1.2=' + baseD,
        );
        if (res.hit) baiyaLog += '施加2层【破甲】；';
        appendCombatLog(baiyaLog);
        var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
        if (slotEl) {
          playAnimationOnSlot(slotEl, 'Slash4', function () {
            if (!res.hit) playMissEffect(slotEl);
          });
        }
        return;
      }
      var baseDmg = 守势B >= 10 ? str * 0.75 + agi * 0.75 : str * 0.5 + agi * 0.5;
      baseDmg = Math.max(0, Math.floor(baseDmg));
      var baseDmgCalcStr = 守势B >= 10 ? '力量×0.75+敏捷×0.75=' + baseDmg : '力量×0.5+敏捷×0.5=' + baseDmg;
      var targets = [];
      for (var s = 1; s <= 6; s++) {
        var e = enemies[s - 1];
        if (!e || (parseInt(e.hp, 10) || 0) <= 0) continue;
        var r = resolveAttack(attacker, e, baseDmg, true);
        if (守势B >= 10 && r.crit) addBuffLayers(e, '眩晕', '眩晕', 1);
        targets.push({ slotNum: s, def: e, result: r });
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        applyDamageToTarget(t.def, t.result.finalDamage);
        appendCombatLog(
          formatAttackLogLine(
            attacker.name || '昼墨',
            '白夜',
            t.def.name || '敌方',
            t.result,
            baseDmg,
            null,
            null,
            t.def.hp,
            baseDmgCalcStr,
          ),
        );
      }
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var enemySideEl = document.querySelector('.side-enemy');
      if (enemySideEl && targets.length > 0) {
        playAnimationOnContainer(enemySideEl, 'E-sword7', function () {
          for (var i = 0; i < targets.length; i++) {
            var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[i].slotNum + '"]');
            if (slotEl) {
              if (!targets[i].result.hit) playMissEffect(slotEl);
            }
          }
        });
      }
    }
    /** 威慑怒吼：不选目标，自身获得 2 层【嘲讽】及护盾（Def×1.2 + Def×0.4×敌方存在数量） */
    function executePlayerWeiSheNuHou(allySlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker) return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var def = getDisplayStat(attacker, 'def') || 0;
      var enemyCount = 0;
      for (var e = 0; e < (enemies && enemies.length ? enemies.length : 0); e++) {
        if (enemies[e] != null) enemyCount++;
      }
      var shieldValue = Math.floor(def * 1.2) + Math.floor(def * 0.4) * enemyCount;
      shieldValue = Math.max(0, shieldValue);
      addBuffLayers(attacker, '嘲讽', '嘲讽', 2);
      attacker.currentShield =
        (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shieldValue;
      if (shieldValue > 0) addBuffLayers(attacker, '护盾', '护盾', shieldValue);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog((attacker.name || '己方') + ' 使用威慑怒吼，获得2层【嘲讽】与 ' + shieldValue + ' 点护盾');
      if (typeof window.toastr !== 'undefined') window.toastr.success('获得2层【嘲讽】与 ' + shieldValue + ' 点护盾');
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          if (allySlotEl) playAnimationOnSlot(allySlotEl, 'Recovery4', function () {});
        });
      });
    }
    /** 白牙技能「横扫」：选择敌方某一横排（最左 1/3/5 高亮），对该排所有敌方单位造成 [Atk × 0.6] 的物理伤害，消耗 1 AP */
    function executeBaiyaSweep(baiyaSlot, skillIndex, selectedRowLeftSlot) {
      var party = getParty();
      var enemies = getEnemyParty();
      var baiya = party[baiyaSlot - 1];
      if (!baiya || baiya.name !== '白牙') return;
      if (isAllyDefeated(baiya)) return;
      var skill = baiya.skills && baiya.skills[skillIndex];
      if (!skill || (skill.name || '') !== '横扫') return;
      var needAp = 1;
      var curAp = baiya.currentAp !== undefined && baiya.currentAp !== null ? parseInt(baiya.currentAp, 10) : 2;
      if (curAp < needAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      /** 选定横排：selectedRowLeftSlot 为 1、3 或 5，该排为 [left, left+1] */
      var enemyRow =
        selectedRowLeftSlot === 1
          ? [1, 2]
          : selectedRowLeftSlot === 3
            ? [3, 4]
            : selectedRowLeftSlot === 5
              ? [5, 6]
              : [];
      if (enemyRow.length === 0) return;
      var atk = baiya.atk != null ? parseInt(baiya.atk, 10) : 0;
      var baseDamage = Math.max(0, Math.floor(atk * 0.6));
      var targets = [];
      for (var r = 0; r < enemyRow.length; r++) {
        var es = enemyRow[r];
        var def = enemies[es - 1];
        if (!def || (def.hp != null && parseInt(def.hp, 10) <= 0)) continue;
        var result = resolveAttack(baiya, def, baseDamage, true);
        targets.push({ slotNum: es, result: result, def: def });
      }
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        var defEl = document.querySelector('.slot[data-slot="enemy-' + t.slotNum + '"]');
        if (defEl) playSlashOnSlot(defEl, t.result.hit, function () {});
        if (defEl && !t.result.hit) playMissEffect(defEl);
      }
      setTimeout(function () {
        for (var i = 0; i < targets.length; i++) {
          var t = targets[i];
          applyDamageToTarget(
            t.def,
            t.result.finalDamage,
            t.result.shadowDamage ? { shadowDamage: t.result.shadowDamage } : undefined,
          );
          appendCombatLog(
            formatAttackLogLine(
              '白牙',
              '横扫',
              t.def.name || '敌方',
              t.result,
              baseDamage,
              null,
              null,
              t.def.hp,
              '攻击×0.6=' + baseDamage,
            ),
          );
        }
        baiya.currentAp = Math.max(0, curAp - needAp);
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
      }, 920);
    }
    /** 白牙技能「撕咬」：对敌方单体造成 [Atk × 1.0] 的物理伤害并施加 1 次【重伤】，消耗 1 AP。options.free 为 true 时（狼群围猎触发）不扣 AP */
    function executeBaiyaBite(baiyaSlot, enemySlotNum, options) {
      options = options || {};
      var party = getParty();
      var enemies = getEnemyParty();
      var baiya = party[baiyaSlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!baiya || baiya.name !== '白牙' || !defender) return;
      if (isAllyDefeated(baiya)) return;
      var needAp = options.free ? 0 : 1;
      var curAp = baiya.currentAp !== undefined && baiya.currentAp !== null ? parseInt(baiya.currentAp, 10) : 2;
      if (!options.free && curAp < needAp) return;
      var atk = baiya.atk != null ? parseInt(baiya.atk, 10) : 0;
      var baseDamage = Math.max(0, Math.floor(atk * 1.0));
      var result = resolveAttack(baiya, defender, baseDamage, true);
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function afterBiteAnim() {
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        if (!options.free) baiya.currentAp = Math.max(0, curAp - needAp);
        if (result.hit) addBuffLayers(defender, '重伤', '重伤', 1);
        saveBattleData(getParty(), getEnemyParty());
        renderAllySlots(getParty());
        renderEnemySlots(getEnemyParty());
        if (defenderSlotEl && !result.hit) playMissEffect(defenderSlotEl);
        appendCombatLog(
          formatAttackLogLine(
            '白牙',
            '撕咬',
            defender.name || '敌方',
            result,
            baseDamage,
            null,
            null,
            defender.hp,
            '攻击×1.0=' + baseDamage,
          ),
        );
        if (typeof window.toastr !== 'undefined') window.toastr.success(result.message);
      }
      if (defenderSlotEl) {
        playAnimationOnSlot(defenderSlotEl, 'ACQ011_Bite', afterBiteAnim);
      } else {
        afterBiteAnim();
      }
    }
    /** 可瑞【缠绕撕咬】按 damageScale 倍率（如破阵冲锋 0.5）；不扣 AP；命中施加 1 层【破甲】。 */
    function executeKerui缠绕撕咬Scaled(keruiAllySlot, enemySlotNum, damageScale, logTag) {
      var party = getParty();
      var enemies = getEnemyParty();
      var kerui = party[keruiAllySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!kerui || (kerui.name || '') !== '可瑞' || !defender) return;
      if (isAllyDefeated(kerui)) return;
      var dh = defender.hp != null ? parseInt(defender.hp, 10) : 0;
      if (dh <= 0) return;
      var sc = damageScale != null ? damageScale : 1;
      var atk = kerui.atk != null ? parseInt(kerui.atk, 10) : 0;
      var baseDamage = Math.max(0, Math.floor(atk * 1.0 * sc));
      var result = resolveAttack(kerui, defender, baseDamage, true);
      var tag = logTag || '联动';
      if (result.hit) {
        applyDamageToTarget(
          defender,
          result.finalDamage,
          result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
        );
        addBuffLayers(defender, '破甲', '破甲', 1, kerui);
      }
      appendCombatLog(
        (kerui.name || '可瑞') +
          ' 「缠绕撕咬」（' +
          tag +
          '，' +
          Math.floor(sc * 100) +
          '%）对 ' +
          (defender.name || '敌方') +
          (result.hit ? ' 造成 ' + result.finalDamage + ' 伤害并1层【破甲】' : ' 未命中'),
      );
    }
    /** 岚 猎手本能：击杀敌人时回复 [Agi×0.5] 生命。在 岚 造成伤害并应用后调用，defender 为被攻击者。 */
    function try岚猎手本能Heal(attacker, defender) {
      if (!attacker || attacker.name !== '岚' || !defender) return;
      var hp = defender.hp != null ? parseInt(defender.hp, 10) : 0;
      if (hp > 0) return;
      var unlocked =
        attacker.specialSkillsUnlocked && Array.isArray(attacker.specialSkillsUnlocked)
          ? attacker.specialSkillsUnlocked
          : [];
      if (unlocked.indexOf('猎手本能') === -1) return;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var healVal = Math.max(0, Math.floor(agi * 0.5));
      healVal = apply丝伊德共生母胎HealMultiplier(attacker, healVal);
      if (healVal <= 0) return;
      var maxHp =
        attacker.maxHp != null ? parseInt(attacker.maxHp, 10) : getHpFromSta(getDisplayStat(attacker, 'sta') || 1);
      var curHp = attacker.hp != null ? parseInt(attacker.hp, 10) : maxHp;
      attacker.hp = Math.min(maxHp, curHp + healVal);
      appendCombatLog(
        (attacker.name || '岚') + ' 猎手本能：击杀回复 ' + healVal + ' 生命，当前 HP ' + attacker.hp + '/' + maxHp,
      );
    }
    /** 岚 死亡之眼：下一次命中锁定目标时施加 1 层【迟缓】+ 1 次【流血】并清除标记。在 岚 命中后调用，enemySlotNum 为被命中敌方的槽位号。 */
    function try岚死亡之眼Apply(attacker, defender, enemySlotNum) {
      if (
        !attacker ||
        attacker.name !== '岚' ||
        attacker.死亡之眼目标 == null ||
        attacker.死亡之眼目标 !== enemySlotNum
      )
        return;
      addBuffLayers(defender, '迟缓', '迟缓', 1, attacker);
      addBuffLayers(defender, '流血', '流血', 1, attacker);
      appendCombatLog((attacker.name || '岚') + ' 死亡之眼：对目标施加 1 层【迟缓】与 1 次【流血】');
      attacker.死亡之眼目标 = null;
    }
    /** 给单位增加 buff 层数（若无该 buff 则新增）。会按 BUFF_DEFINITIONS 的 maxLayers 封顶；有上限的 buff 施加后也会统一校正。麻痹累计3层时消耗3层并施加1层眩晕。黯被动「暗影渗透」：对有【暗蚀】目标施加【流血】时层数+50%；对有【流血】目标施加【暗蚀】时额外+1层。 */
    function addBuffLayers(unit, buffId, buffName, layers, fromChar) {
      if (!unit || layers <= 0) return;
      unit.buffs = unit.buffs || [];
      if (
        fromChar &&
        fromChar.name === '黯' &&
        fromChar.specialSkillsUnlocked &&
        fromChar.specialSkillsUnlocked.indexOf('暗影渗透') !== -1
      ) {
        if (buffId === '流血') {
          var has暗蚀 = unit.buffs.some(function (b) {
            return (b.id || b.name) === '暗蚀' && (parseInt(b.layers, 10) || 0) > 0;
          });
          if (has暗蚀) layers = layers + Math.floor(layers * 0.5);
        } else if (buffId === '暗蚀') {
          var has流血 = unit.buffs.some(function (b) {
            return (b.id || b.name) === '流血' && (parseInt(b.layers, 10) || 0) > 0;
          });
          if (has流血) layers = layers + 1;
        }
      }
      if (
        fromChar &&
        fromChar.name === '凌遥仙' &&
        fromChar.specialSkillsUnlocked &&
        fromChar.specialSkillsUnlocked.indexOf('永恒咏唱') !== -1
      ) {
        var mapYong = {
          力量强化: '力量增幅',
          敏捷强化: '敏捷增幅',
          智力强化: '智力增幅',
          防御强化: '防御增幅',
          攻击强化: '力量增幅',
        };
        if (mapYong[buffId]) {
          buffId = mapYong[buffId];
          buffName = buffId;
        }
      }
      if (layers <= 0) return;
      var maxL = getBuffMaxLayers(buffId);
      if (maxL != null) layers = Math.min(layers, maxL);
      if (layers <= 0) return;
      var existing = unit.buffs.find(function (b) {
        return (b.id || b.name) === buffId;
      });
      if (existing) {
        existing.layers = (existing.layers || 0) + layers;
        if (maxL != null) existing.layers = Math.min(existing.layers, maxL);
      } else {
        unit.buffs.push({ id: buffId, name: buffName || buffId, layers: layers });
      }
      if (buffId === '麻痹') {
        var ma = unit.buffs.find(function (b) {
          return (b.id || b.name) === '麻痹';
        });
        var mal = ma ? Math.max(0, parseInt(ma.layers, 10) || 0) : 0;
        if (mal >= 3) {
          ma.layers = 0;
          addBuffLayers(unit, '眩晕', '眩晕', 1);
        }
      }
      if (buffId === '魅惑' && fromChar && fromChar.name === '夜露') {
        var healVal = Math.max(0, Math.floor((getDisplayStat(fromChar, 'cha') || 0) * 0.5));
        if (healVal > 0) {
          var mHp =
            fromChar.maxHp != null
              ? parseInt(fromChar.maxHp, 10)
              : typeof getHpFromSta === 'function' && typeof getDisplayStat === 'function'
                ? getHpFromSta(getDisplayStat(fromChar, 'sta') || 1)
                : 100;
          var cHp = fromChar.hp != null ? parseInt(fromChar.hp, 10) : mHp;
          fromChar.hp = Math.min(mHp, cHp + healVal);
          if (typeof appendCombatLog === 'function')
            appendCombatLog(
              (fromChar.name || '夜露') +
                ' 魔力渴求：施加【魅惑】后回复 ' +
                healVal +
                ' 点生命，当前 HP ' +
                fromChar.hp +
                '/' +
                mHp +
                '；',
            );
        }
        addBuffLayers(fromChar, '智力强化', '智力强化', 1);
      }
    }
    /** 丝伊德·白 被动「共生母胎」：每层【孕育】使实际回复量 +3%。 */
    function apply丝伊德共生母胎HealMultiplier(unit, rawHeal) {
      if (!unit || unit.name !== '丝伊德·白' || rawHeal == null || rawHeal <= 0)
        return Math.max(0, Math.floor(rawHeal));
      var L = getUnitBuffLayers(unit, '孕育');
      if (L <= 0) return Math.max(0, Math.floor(rawHeal));
      return Math.max(0, Math.floor(rawHeal * (1 + 0.03 * L)));
    }
    /** 对目标施加伤害：优先扣除护盾，护盾不足时再扣 HP；会同步扣减【护盾】buff 层数。opts 可选：{ shadowDamage } 当为 黯 被动暗影伤害时，先显示 (damage-shadowDamage) 红色，0.25s 后显示 shadowDamage 紫色。 */
    function applyDamageToTarget(unit, damage, opts) {
      if (!unit || damage == null || damage <= 0) return;
      // 为自动飘字定位提供稳定标识（避免 getParty/getEnemyParty 返回新对象导致引用不一致）
      if (unit && !unit._damageFxUid) unit._damageFxUid = 'u' + Math.random().toString(36).slice(2) + Date.now();
      var shield = unit.currentShield != null ? Math.max(0, parseInt(unit.currentShield, 10) || 0) : 0;
      var huijinRemBefore =
        unit._辉烬坚壁剩余 != null ? Math.max(0, parseInt(unit._辉烬坚壁剩余, 10) || 0) : 0;
      var absorb, newShieldAfter, toHp;
      if (unit._虚妄护盾一击 && shield > 0 && damage > 0) {
        absorb = Math.min(damage, shield);
        var huijinAbsorbedX = Math.min(absorb, huijinRemBefore);
        unit._辉烬坚壁剩余 = Math.max(0, huijinRemBefore - huijinAbsorbedX);
        toHp = Math.max(0, damage - absorb);
        newShieldAfter = 0;
        unit.currentShield = 0;
        if (unit.buffs)
          unit.buffs = unit.buffs.filter(function (b) {
            return (b.id || b.name) !== '护盾';
          });
        unit._虚妄护盾一击 = false;
      } else {
        absorb = Math.min(damage, shield);
        var huijinAbsorbed = Math.min(absorb, huijinRemBefore);
        unit._辉烬坚壁剩余 = Math.max(0, huijinRemBefore - huijinAbsorbed);
        newShieldAfter = Math.max(0, shield - damage);
        toHp = Math.max(0, damage - absorb);
        unit.currentShield = newShieldAfter;
        if (unit.buffs && absorb > 0) {
          var sh = unit.buffs.find(function (b) {
            return (b.id || b.name) === '护盾';
          });
          if (sh) {
            sh.layers = Math.max(0, (sh.layers || 0) - absorb);
            if (sh.layers <= 0)
              unit.buffs = unit.buffs.filter(function (b) {
                return (b.id || b.name) !== '护盾';
              });
          }
        }
      }
      var skip虚实颠倒 = opts && opts.skip虚实颠倒;
      var curHp =
        unit.hp != null
          ? parseInt(unit.hp, 10)
          : unit.maxHp != null
            ? parseInt(unit.maxHp, 10)
            : typeof getHpFromSta === 'function' && typeof getDisplayStat === 'function'
              ? getHpFromSta(getDisplayStat(unit, 'sta') || 1)
              : 100;
      var newHpAfterDmg = curHp - toHp;
      var maxHpFor虚实 =
        unit.maxHp != null
          ? parseInt(unit.maxHp, 10)
          : typeof getHpFromSta === 'function' && typeof getDisplayStat === 'function'
            ? getHpFromSta(getDisplayStat(unit, 'sta') || 1)
            : 100;
      var invert虚实颠倒 =
        !skip虚实颠倒 &&
        typeof getUnitBuffLayers === 'function' &&
        getUnitBuffLayers(unit, '虚实颠倒') > 0 &&
        toHp > 0;
      if (invert虚实颠倒) {
        unit.hp = Math.min(maxHpFor虚实, curHp + toHp);
        if (typeof appendCombatLog === 'function')
          appendCombatLog(
            (unit.name || '单位') + ' 【虚实颠倒】：将 ' + toHp + ' 点 HP 伤害转为治疗',
          );
        unit._justDefeated = false;
      } else if (newHpAfterDmg <= 0 && toHp > 0 && unit && getUnitBuffLayers(unit, '星命') > 0) {
        var shStar =
          unit._星命护盾值 != null ? Math.max(0, parseInt(unit._星命护盾值, 10) || 0) : 0;
        consumeBuffLayersFromUnit(unit, '星命', 99);
        unit.buffs = (unit.buffs || []).filter(function (bx) {
          return (bx.id || bx.name) !== '星命';
        });
        unit._星命护盾值 = null;
        unit.hp = 1;
        if (shStar > 0) {
          unit.currentShield =
            (unit.currentShield != null ? parseInt(unit.currentShield, 10) || 0 : 0) + shStar;
          addBuffLayers(unit, '护盾', '护盾', shStar);
        }
        if (typeof appendCombatLog === 'function')
          appendCombatLog(
            (unit.name || '友方') +
              ' 【星命】：免除致死，生命保留为 1' +
              (shStar > 0 ? '，获得 ' + shStar + ' 护盾' : ''),
          );
        unit._justDefeated = false;
      } else {
        unit.hp = Math.max(0, newHpAfterDmg);
      }
      if (shield > 0 && newShieldAfter <= 0 && huijinRemBefore > 0) {
        var rawHuijinHeal = Math.floor(huijinRemBefore * 0.5);
        if (rawHuijinHeal > 0) {
          var appliedHuijin = apply丝伊德共生母胎HealMultiplier(unit, rawHuijinHeal);
          var maxHpH =
            unit.maxHp != null ? parseInt(unit.maxHp, 10) : getHpFromSta(getDisplayStat(unit, 'sta') || 1);
          var curHpH = unit.hp != null ? parseInt(unit.hp, 10) : maxHpH;
          if (typeof getUnitBuffLayers === 'function' && getUnitBuffLayers(unit, '虚实颠倒') > 0) {
            applyDamageToTarget(unit, appliedHuijin, { skip虚实颠倒: true });
            if (typeof appendCombatLog === 'function')
              appendCombatLog((unit.name || '友方') + ' 【虚实颠倒】辉烬破裂治疗转为 ' + appliedHuijin + ' 伤害');
          } else {
            unit.hp = Math.min(maxHpH, curHpH + appliedHuijin);
            if (typeof appendCombatLog === 'function')
              appendCombatLog((unit.name || '友方') + ' 辉烬坚壁：护盾破裂，回复 ' + appliedHuijin + ' 生命');
            Promise.resolve().then(function () {
              var partyH = getParty();
              if (partyH && partyH.length) {
                for (var hi = 0; hi < partyH.length; hi++) {
                  if (
                    partyH[hi] === unit ||
                    (unit._damageFxUid && partyH[hi] && partyH[hi]._damageFxUid === unit._damageFxUid)
                  ) {
                    var slotHeal = document.querySelector('.slot[data-slot="ally-' + (hi + 1) + '"]');
                    if (slotHeal) playHealEffect(slotHeal, appliedHuijin);
                    break;
                  }
                }
              }
            });
          }
        }
      }
      if (unit.hp === 0 && curHp > 0) unit._justDefeated = true;
      if (unit.name === '丝伊德·白' && (absorb > 0 || toHp > 0)) {
        addBuffLayers(unit, '孕育', '孕育', 1);
        capUnitBuffs(unit);
      }
      if (
        toHp > 0 &&
        unit.name === '艾丽卡' &&
        unit.specialSkillsUnlocked &&
        unit.specialSkillsUnlocked.indexOf('殉道圣躯') !== -1
      ) {
        var p = getParty();
        var curActor = p && battleState.currentActingAllySlot != null ? p[battleState.currentActingAllySlot - 1] : null;
        if (battleState.phase === BATTLE_PHASE.PLAYER_ACTION && curActor === unit)
          addBuffLayers(unit, '智力强化', '智力强化', 1);
        else addBuffLayers(unit, '防御强化', '防御强化', 1);
      }
      // 统一掉血显示
      // 如需手动控制（例如显示“即死”文本），可在调用前设置 unit._skipDamageNumberOnce = true 来跳过一次自动飘字。
      if (unit && unit._skipDamageNumberOnce) {
        unit._skipDamageNumberOnce = false;
        return;
      }
      if (damage > 0 && typeof getParty === 'function' && typeof getEnemyParty === 'function') {
        var shadowDamage = opts && opts.shadowDamage ? Math.max(0, parseInt(opts.shadowDamage, 10) || 0) : 0;
        var physicalPart = shadowDamage > 0 ? Math.max(0, damage - shadowDamage) : damage;
        // 通过 microtask 延后到本次同步 render 结束后再插入飘字，避免被 render 的 innerHTML 覆盖
        Promise.resolve().then(function () {
          var party = getParty();
          var enemies = getEnemyParty();
          var slotEl = null;
          if (party && party.length) {
            for (var p = 0; p < party.length; p++) {
              if (
                party[p] === unit ||
                (unit && unit._damageFxUid && party[p] && party[p]._damageFxUid === unit._damageFxUid)
              ) {
                slotEl = document.querySelector('.slot[data-slot="ally-' + (p + 1) + '"]');
                break;
              }
            }
          }
          if (!slotEl && enemies && enemies.length) {
            for (var q = 0; q < enemies.length; q++) {
              if (
                enemies[q] === unit ||
                (unit && unit._damageFxUid && enemies[q] && enemies[q]._damageFxUid === unit._damageFxUid)
              ) {
                slotEl = document.querySelector('.slot[data-slot="enemy-' + (q + 1) + '"]');
                break;
              }
            }
          }
          if (slotEl) {
            if (shadowDamage > 0 && physicalPart > 0) {
              playHitEffect(slotEl, physicalPart);
              setTimeout(function () {
                playHitEffect(slotEl, shadowDamage, 'shadow');
              }, 250);
            } else if (shadowDamage > 0) {
              playHitEffect(slotEl, shadowDamage, 'shadow');
            } else {
              playHitEffect(slotEl, damage);
            }
          }
        });
      }
    }
    /** 黯 残影步：成功闪避时若带有灵巧且已设置残影步反击参数，对攻击者造成反击伤害并可能施加流血/暗蚀 */
    function try残影步Counter(ally, monster, party, enemies, enemySlotNum) {
      if (!ally || ally.name !== '黯' || !monster) return;
      var lingqiao = 0;
      if (ally.buffs && ally.buffs.length) {
        for (var i = 0; i < ally.buffs.length; i++) {
          if ((ally.buffs[i].id || ally.buffs[i].name) === '灵巧') {
            lingqiao = Math.max(0, parseInt(ally.buffs[i].layers, 10) || 0);
            break;
          }
        }
      }
      if (lingqiao <= 0 || !ally.残影步反击) return;
      var r = ally.残影步反击;
      var str = getDisplayStat(ally, 'str') || 0;
      var int = getDisplayStat(ally, 'int') || 0;
      var dmg = Math.max(0, Math.floor(str * (r.multStr || 0) + int * (r.multInt || 0)));
      if (dmg <= 0) return;
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function applyCounter() {
        applyDamageToTarget(monster, dmg);
        if (r.流血) addBuffLayers(monster, '流血', '流血', 1, ally);
        if (r.暗蚀) addBuffLayers(monster, '暗蚀', '暗蚀', 1, ally);
        appendCombatLog(
          (ally.name || '黯') +
            '残影步反击对' +
            (monster.name || '敌方') +
            '；最终伤害:' +
            dmg +
            '；' +
            (monster.name || '敌方') +
            '剩余Hp:' +
            (monster.hp != null ? monster.hp : '') +
            '；',
        );
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
      }
      if (enemySlotEl) {
        playAnimationOnSlot(enemySlotEl, 'E-dark1', applyCounter);
      } else {
        applyCounter();
      }
    }
    /** 岚 猫步·影舞：成功闪避时对攻击者反击，造成 Agi×0.4 物理伤害 */
    function try岚影舞Counter(ally, monster, party, enemies, enemySlotNum) {
      if (!ally || ally.name !== '岚' || !ally.影舞反击 || !monster) return;
      var r = ally.影舞反击;
      var agi = getDisplayStat(ally, 'agi') || 0;
      var dmg = Math.max(0, Math.floor(agi * (r.multAgi || 0.4)));
      if (dmg <= 0) return;
      ally.影舞反击 = null;
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      function applyCounter() {
        applyDamageToTarget(monster, dmg);
        appendCombatLog(
          (ally.name || '岚') +
            ' 影舞反击对' +
            (monster.name || '敌方') +
            '；最终伤害:' +
            dmg +
            '；' +
            (monster.name || '敌方') +
            '剩余Hp:' +
            (monster.hp != null ? monster.hp : '') +
            '；',
        );
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
      }
      if (enemySlotEl) {
        playAnimationOnSlot(enemySlotEl, 'Shot', applyCounter);
      } else {
        applyCounter();
      }
    }
    /** 对己方单位施加伤害，若护盾被本次攻击打空且该单位有见切·弹返则对攻击者进行反击 */
    function applyDamageToAllyAndTry弹返(ally, attackerEnemy, finalDamage) {
      var shieldBefore = ally.currentShield != null ? Math.max(0, parseInt(ally.currentShield, 10) || 0) : 0;
      applyDamageToTarget(ally, finalDamage);
      if (
        shieldBefore > 0 &&
        (ally.currentShield || 0) === 0 &&
        ally._虚妄护盾镜面反射 &&
        attackerEnemy &&
        finalDamage > 0
      ) {
        ally._虚妄护盾镜面反射 = false;
        var reflectDmg = Math.max(0, Math.floor(finalDamage * 0.5));
        if (reflectDmg > 0 && (parseInt(attackerEnemy.hp, 10) || 0) > 0) {
          applyDamageToTarget(attackerEnemy, reflectDmg);
          appendCombatLog(
            (ally.name || '己方') +
              ' 「镜面反射」反弹 ' +
              reflectDmg +
              ' 伤害至 ' +
              (attackerEnemy.name || '敌方'),
          );
          saveBattleData(getParty(), getEnemyParty());
          renderAllySlots(getParty());
          renderEnemySlots(getEnemyParty());
        }
      }
      if (shieldBefore > 0 && (ally.currentShield || 0) === 0 && ally.见切弹返 && attackerEnemy) {
        ally.见切弹返 = false;
        var counterDmg = Math.max(0, Math.floor((getDisplayStat(ally, 'str') || 0) * 0.6));
        if (counterDmg > 0 && (parseInt(attackerEnemy.hp, 10) || 0) > 0) {
          var enemies = getEnemyParty();
          var enemySlotNum = 0;
          for (var ei = 0; ei < (enemies && enemies.length); ei++) {
            if (enemies[ei] === attackerEnemy) {
              enemySlotNum = ei + 1;
              break;
            }
          }
          var enemySlotEl = enemySlotNum
            ? document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]')
            : null;
          if (enemySlotEl) {
            playAnimationOnSlot(enemySlotEl, 'E-sword6', function () {
              applyDamageToTarget(attackerEnemy, counterDmg);
              appendCombatLog(
                (ally.name || '己方') +
                  '见切·弹返对' +
                  (attackerEnemy.name || '敌方') +
                  '；最终伤害:' +
                  counterDmg +
                  '；' +
                  (attackerEnemy.name || '敌方') +
                  '剩余Hp:' +
                  (attackerEnemy.hp != null ? attackerEnemy.hp : '') +
                  '；',
              );
              saveBattleData(getParty(), getEnemyParty());
              renderAllySlots(getParty());
              renderEnemySlots(getEnemyParty());
            });
          } else {
            applyDamageToTarget(attackerEnemy, counterDmg);
            appendCombatLog(
              (ally.name || '己方') +
                '见切·弹返对' +
                (attackerEnemy.name || '敌方') +
                '；最终伤害:' +
                counterDmg +
                '；' +
                (attackerEnemy.name || '敌方') +
                '剩余Hp:' +
                (attackerEnemy.hp != null ? attackerEnemy.hp : '') +
                '；',
            );
          }
        }
      }
    }
    /** 狼式旋风：不选目标，对敌方全体分别判定命中/伤害，在敌方整体上播放 SlashSpecial1 后结算；命中目标施加【重伤】层数（Str×0.2，暴击额外 Str×0.2）。options: { damageScale: 1, free: false } 用于斩杀-乘胜追击触发的 50% 免费释放 */
    function executePlayerWhirlwind(allySlot, skillIndex, options) {
      options = options || {};
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker) return;
      if (isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '狼式旋风') return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (!options.free && curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var rawEffect = skill.effectByLevel ? getSkillEffectForLevel(skill, skill.level || 1) : skill.effect || '';
      var resolvedEffect = resolveSkillEffect(rawEffect, attacker);
      var baseDamage = getBaseDamageFromResolvedEffect(resolvedEffect);
      if (baseDamage !== baseDamage || baseDamage <= 0) baseDamage = getBaseDamageForSkill(attacker, skill);
      baseDamage = Math.max(0, Math.floor(baseDamage));
      var damageScale = options.damageScale != null ? options.damageScale : 1;
      var effectiveDamage = Math.max(0, Math.floor(baseDamage * damageScale));
      var targets = [];
      for (var i = 1; i <= 6; i++) {
        var def = enemies[i - 1];
        if (def) {
          var res = resolveAttack(attacker, def, effectiveDamage, true);
          targets.push({ slotNum: i, defender: def, result: res });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      playStrikeShake(attackerSlotEl, null, function () {
        playAnimationOnContainer(enemySideEl, 'SlashSpecial1', function () {
          for (var t = 0; t < targets.length; t++) {
            var defender = targets[t].defender;
            var result = targets[t].result;
            applyDamageToTarget(
              defender,
              result.finalDamage,
              result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
            );
            var wwAttName = attacker.name || '己方';
            var wwDefName = defender.name || '敌方';
            var wwLv = Math.max(1, parseInt(skill.level, 10) || 1);
            var wwMult = wwLv === 1 ? 0.9 : wwLv === 2 ? 1.0 : wwLv === 3 ? 1.1 : 1.2;
            var wwCalcStr =
              damageScale !== 1
                ? '力量×' + wwMult + '×' + damageScale + '=' + effectiveDamage
                : '力量×' + wwMult + '=' + effectiveDamage;
            appendCombatLog(
              formatAttackLogLine(
                wwAttName,
                '狼式旋风',
                wwDefName,
                result,
                effectiveDamage,
                null,
                null,
                defender.hp,
                wwCalcStr,
              ),
            );
          }
          var maxAp = getApByLevel(attacker.level);
          var curAp =
            attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
          if (!options.free) attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          for (var t = 0; t < targets.length; t++) {
            var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t].slotNum + '"]');
            if (slotEl) {
              if (!targets[t].result.hit) playMissEffect(slotEl);
            }
          }
          var HIT_EFFECT_MS = 920;
          setTimeout(function () {
            for (var t = 0; t < targets.length; t++) {
              var defender = targets[t].defender;
              var result = targets[t].result;
              if (result.hit) {
                var str = getDisplayStat(attacker, 'str') || 0;
                var layersPerHit = Math.max(0, Math.floor(str * 0.2));
                var totalLayers = layersPerHit + (result.crit ? layersPerHit : 0);
                if (totalLayers > 0) addBuffLayers(defender, '重伤', '重伤', totalLayers);
              }
            }
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
          }, HIT_EFFECT_MS);
          if (typeof window.toastr !== 'undefined')
            window.toastr.success(options.free ? '斩杀触发 狼式旋风（50% 效果）释放完毕' : '狼式旋风 释放完毕');
        });
      });
    }
    /** 旋风踢：岚的物理/近战/群体技能。不选目标，对敌方全体判定命中/伤害；命中至少1个后获得1层【灵巧】。Lv5 A 疾风踢：主目标（1号位）额外一次 Agi×0.4 判定。Lv5 B 击崩踢：对所有命中目标施加1层【迟缓】。 */
    function executePlayer旋风踢(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '岚') return;
      if (isAllyDefeated(attacker)) return;
      attacker.本回合用过近战 = true;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '旋风踢') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
        return;
      }
      var rawEffect = skill.effectByLevel ? getSkillEffectForLevel(skill, skill.level || 1) : skill.effect || '';
      if (skill.advancement === 'A' && skill.advancementOptions) {
        var optA = skill.advancementOptions.find(function (o) {
          return o.id === 'A';
        });
        if (optA && optA.effect) rawEffect = optA.effect;
      } else if (skill.advancement === 'B' && skill.advancementOptions) {
        var optB = skill.advancementOptions.find(function (o) {
          return o.id === 'B';
        });
        if (optB && optB.effect) rawEffect = optB.effect;
      }
      var resolvedEffect = resolveSkillEffect(rawEffect, attacker);
      var baseDamage = getBaseDamageFromResolvedEffect(resolvedEffect);
      if (baseDamage !== baseDamage || baseDamage <= 0) baseDamage = getBaseDamageForSkill(attacker, skill);
      baseDamage = Math.max(0, Math.floor(baseDamage));
      var skillDisplayName = skill.advancement === 'A' ? '疾风踢' : skill.advancement === 'B' ? '击崩踢' : '旋风踢';
      var targets = [];
      for (var i = 1; i <= 6; i++) {
        var def = enemies[i - 1];
        if (def) {
          var res = resolveAttack(attacker, def, baseDamage, true, { isMelee: true });
          targets.push({ slotNum: i, defender: def, result: res });
        }
      }
      if (targets.length === 0) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('没有可攻击的敌方单位');
        return;
      }
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.5 : lv === 2 ? 0.55 : lv === 3 ? 0.6 : 0.65;
      var calcStr = '力量×' + mult + '=' + baseDamage;
      var attackerSlotEl = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
      var enemySideEl = document.querySelector('.side-enemy');
      playStrikeShake(attackerSlotEl, null, function () {
        playAnimationOnContainer(enemySideEl, 'SlashSpecial1', function () {
          for (var t = 0; t < targets.length; t++) {
            var defender = targets[t].defender;
            var result = targets[t].result;
            applyDamageToTarget(
              defender,
              result.finalDamage,
              result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined,
            );
            appendCombatLog(
              formatAttackLogLine(
                attacker.name || '岚',
                skillDisplayName,
                defender.name || '敌方',
                result,
                baseDamage,
                null,
                null,
                defender.hp,
                calcStr,
              ),
            );
            try岚猎手本能Heal(attacker, defender);
            if (result.hit) try岚死亡之眼Apply(attacker, defender, targets[t].slotNum);
          }
          var anyHit = targets.some(function (x) {
            return x.result.hit;
          });
          if (anyHit) {
            addBuffLayers(attacker, '灵巧', '灵巧', 1);
            addBuffLayers(attacker, '锁定', '锁定', 1);
          }
          if (skill.advancement === 'B') {
            for (var u = 0; u < targets.length; u++) {
              if (targets[u].result.hit) addBuffLayers(targets[u].defender, '迟缓', '迟缓', 1);
            }
          }
          if (skill.advancement === 'A') {
            var mainDef = targets[0] && targets[0].defender ? targets[0].defender : null;
            if (mainDef) {
              var extraDmg = Math.max(0, Math.floor((getDisplayStat(attacker, 'agi') || 0) * 0.4));
              var extraRes = resolveAttack(attacker, mainDef, extraDmg, true, { isMelee: true });
              applyDamageToTarget(mainDef, extraRes.finalDamage);
              try岚猎手本能Heal(attacker, mainDef);
              if (extraRes.hit) try岚死亡之眼Apply(attacker, mainDef, targets[0].slotNum);
              appendCombatLog(
                formatAttackLogLine(
                  attacker.name || '岚',
                  skillDisplayName + '·额外踢击',
                  mainDef.name || '敌方',
                  extraRes,
                  extraDmg,
                  null,
                  null,
                  mainDef.hp,
                  '敏捷×0.4=' + extraDmg,
                ),
              );
            }
          }
          attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          for (var t = 0; t < targets.length; t++) {
            var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t].slotNum + '"]');
            if (slotEl && !targets[t].result.hit) playMissEffect(slotEl);
          }
          if (typeof window.toastr !== 'undefined') window.toastr.success(skillDisplayName + ' 释放完毕');
        });
      });
    }
    function setPartyOrder(fromSlot, toSlot) {
      var party = getParty();
      while (party.length < 6) party.push(null);
      var fromIdx = fromSlot - 1;
      var toIdx = toSlot - 1;
      var t = party[fromIdx];
      party[fromIdx] = party[toIdx];
      party[toIdx] = t;
      saveBattleData(party, getEnemyParty());
      renderAllySlots(party);
      renderEnemySlots(getEnemyParty());
    }
    var swapState = { active: false, fromSlot: 0 };
    var SWAP_ANIM_MS = 350;
    function runSwapAnimation(fromSlot, toSlot, onDone) {
      var fromEl = document.querySelector('.slot[data-slot="ally-' + fromSlot + '"]');
      var toEl = document.querySelector('.slot[data-slot="ally-' + toSlot + '"]');
      if (!fromEl || !toEl) {
        onDone();
        return;
      }
      var fromRect = fromEl.getBoundingClientRect();
      var toRect = toEl.getBoundingClientRect();
      var hasTargetChar = toEl.querySelector('.slot-char-portrait') != null;
      var overlay = document.createElement('div');
      overlay.className = 'swap-overlay';
      document.body.appendChild(overlay);
      var finished = false;
      function cleanup() {
        fromEl.style.visibility = '';
        toEl.style.visibility = '';
        overlay.remove();
      }
      function finish() {
        if (finished) return;
        finished = true;
        cleanup();
        onDone();
      }
      function makeClone(slotEl, left, top, w, h) {
        var clone = document.createElement('div');
        clone.className = 'swap-clone slot-char';
        clone.style.left = left + 'px';
        clone.style.top = top + 'px';
        clone.style.width = w + 'px';
        clone.style.minHeight = h + 'px';
        clone.style.height = 'auto';
        clone.innerHTML = slotEl.innerHTML;
        var swapBtn = clone.querySelector('.slot-swap-btn');
        if (swapBtn) swapBtn.remove();
        overlay.appendChild(clone);
        return clone;
      }
      if (hasTargetChar) {
        fromEl.style.visibility = 'hidden';
        toEl.style.visibility = 'hidden';
        var c1 = makeClone(fromEl, fromRect.left, fromRect.top, fromRect.width, fromRect.height);
        var c2 = makeClone(toEl, toRect.left, toRect.top, toRect.width, toRect.height);
        var dx = toRect.left - fromRect.left;
        var dy = toRect.top - fromRect.top;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            c1.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            c2.style.transform = 'translate(' + -dx + 'px,' + -dy + 'px)';
          });
        });
        var ended = 0;
        function onEnd() {
          ended++;
          if (ended >= 2) finish();
        }
        c1.addEventListener('transitionend', onEnd);
        c2.addEventListener('transitionend', onEnd);
        setTimeout(function () {
          finish();
        }, SWAP_ANIM_MS + 80);
      } else {
        fromEl.style.visibility = 'hidden';
        var c1 = makeClone(fromEl, fromRect.left, fromRect.top, fromRect.width, fromRect.height);
        var dx = toRect.left - fromRect.left;
        var dy = toRect.top - fromRect.top;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            c1.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
          });
        });
        c1.addEventListener('transitionend', finish);
        setTimeout(finish, SWAP_ANIM_MS + 80);
      }
    }
    function enterSwapMode(fromSlot) {
      swapState.active = true;
      swapState.fromSlot = fromSlot;
      var party = getParty();
      var sideAlly = document.querySelector('.side-ally');
      if (sideAlly) sideAlly.classList.add('swap-mode-active');
      for (var k = 1; k <= 6; k++) {
        var el = document.querySelector('.slot[data-slot="ally-' + k + '"]');
        if (!el) continue;
        if (k === fromSlot) {
          el.classList.add('swap-floating');
        } else {
          var ally = party && party[k - 1];
          var hasVoid =
            ally &&
            (ally.buffs || []).some(function (b) {
              return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
            });
          if (!hasVoid) el.classList.add('swap-target');
        }
      }
    }
    function exitSwapMode() {
      swapState.active = false;
      var sideAlly = document.querySelector('.side-ally');
      if (sideAlly) sideAlly.classList.remove('swap-mode-active');
      for (var k = 1; k <= 6; k++) {
        var el = document.querySelector('.slot[data-slot="ally-' + k + '"]');
        if (el) {
          el.classList.remove('swap-floating');
          el.classList.remove('swap-target');
        }
      }
    }
    renderAllySlots();
    renderEnemySlots();
    updateBattlePhaseDisplay();
    if (getBattlePhase() === BATTLE_PHASE.PLAYER_ACTION && getBigRound() === 1) {
      var partyR1 = getParty();
      var enemiesR1 = getEnemyParty();
      if (partyR1 && partyR1.length) {
        for (var r = 0; r < partyR1.length; r++) {
          var uR = partyR1[r];
          if (uR && uR.name === '昼墨' && uR.specialSkillsUnlocked && uR.specialSkillsUnlocked.indexOf('心眼') !== -1) {
            addBuffLayers(uR, '攻势', '攻势', 2);
            addBuffLayers(uR, '守势', '守势', 2);
          }
        }
      }
      run清漓玩家回合开始处理();
      run丝伊德魔物孕育Lv5A玩家回合开始();
      run丝伊德姬骑自动碧血魔剑玩家回合开始();
      saveBattleData(partyR1, enemiesR1);
      renderAllySlots(partyR1);
      renderEnemySlots(enemiesR1);
    }
    var battleArea = document.querySelector('.battle-area');
    if (!battleArea) return;
    battleArea.addEventListener('click', function (e) {
      var swapBtn = e.target.closest('.slot-swap-btn');
      if (swapBtn) {
        e.preventDefault();
        e.stopPropagation();
        var slotNum = parseInt(swapBtn.getAttribute('data-ally-slot'), 10);
        if (swapState.active) {
          if (slotNum === swapState.fromSlot) exitSwapMode();
          return;
        }
        if (slotNum >= 1 && slotNum <= 6) {
          var partyForSwap = getParty();
          var chSwap = partyForSwap && partyForSwap[slotNum - 1];
          var hasVoid =
            chSwap &&
            (chSwap.buffs || []).some(function (b) {
              return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
            });
          if (hasVoid) {
            if (typeof window.toastr !== 'undefined') window.toastr.warning('虚无状态无法换位');
            return;
          }
          if (tryConsume眩晕浪费行动(chSwap)) return;
          enterSwapMode(slotNum);
        }
        return;
      }
      if (swapState.active && e.target.closest('.slot.swap-floating')) {
        exitSwapMode();
        return;
      }
      var targetSlot = e.target.closest('.slot.swap-target');
      if (targetSlot && swapState.active) {
        e.preventDefault();
        var dataSlot = targetSlot.getAttribute('data-slot');
        if (dataSlot && dataSlot.indexOf('ally-') === 0) {
          var toSlot = parseInt(dataSlot.replace('ally-', ''), 10);
          if (toSlot >= 1 && toSlot <= 6 && toSlot !== swapState.fromSlot) {
            runSwapAnimation(swapState.fromSlot, toSlot, function () {
              setPartyOrder(swapState.fromSlot, toSlot);
              exitSwapMode();
            });
          }
        }
        return;
      }
      if (!swapState.active) {
        var portrait = e.target.closest('.slot-char-portrait');
        if (portrait) {
          var slotEl = portrait.closest('.slot[data-slot^="ally-"]');
          if (
            slotEl &&
            slotEl.classList.contains('slot-char') &&
            !slotEl.classList.contains('swap-floating') &&
            !slotEl.classList.contains('swap-target') &&
            (slotEl.querySelector('.slot-char-portrait img') ||
              slotEl.querySelector('.slot-char-portrait.slot-enemy-portrait-empty'))
          ) {
            var dataSlot = slotEl.getAttribute('data-slot');
            if (dataSlot) {
              var allySlot = parseInt(dataSlot.replace('ally-', ''), 10);
              if (allySlot >= 1 && allySlot <= 6) {
                e.preventDefault();
                var curPhase = getBattlePhase();
                if (curPhase !== 'player_action') {
                  if (typeof window.toastr !== 'undefined') window.toastr.warning('仅可在玩家行动回合中使用技能');
                  return;
                }
                var partyForAp = getParty();
                var chForAp = partyForAp && partyForAp[allySlot - 1];
                if (chForAp) {
                  var allyHp =
                    chForAp.name === '白牙' || chForAp.daughterUnit === true
                      ? chForAp.hp != null
                        ? Math.min(parseInt(chForAp.hp, 10) || 0, Math.max(1, parseInt(chForAp.maxHp, 10) || 1))
                        : Math.max(1, parseInt(chForAp.maxHp, 10) || 1)
                      : chForAp.hp != null
                        ? parseInt(chForAp.hp, 10)
                        : getHpFromSta(getDisplayStat(chForAp, 'sta') || 1);
                  if ((allyHp || 0) <= 0) {
                    if (typeof window.toastr !== 'undefined') window.toastr.warning('该角色已战斗不能，无法使用技能');
                    return;
                  }
                  var hasVoid = (chForAp.buffs || []).some(function (b) {
                    return (b.id === '虚无' || b.name === '虚无') && (b.layers || 0) > 0;
                  });
                  if (hasVoid) {
                    if (typeof window.toastr !== 'undefined') window.toastr.warning('该角色处于虚无状态，无法行动');
                    return;
                  }
                }
                var curAp =
                  chForAp && chForAp.currentAp !== undefined && chForAp.currentAp !== null
                    ? parseInt(chForAp.currentAp, 10)
                    : chForAp
                      ? getEffectiveMaxApForAlly(chForAp)
                      : 0;
                if (!chForAp || curAp <= 0) {
                  if (typeof window.toastr !== 'undefined') window.toastr.warning('本回合行动点已用完，无法攻击');
                  return;
                }
                var skillPopupEl = document.getElementById('skill-popup');
                if (!skillPopupEl) return;
                var x = e.clientX;
                var y = e.clientY;
                var popupW = 160;
                var pad = 8;
                var right = x + popupW + pad <= window.innerWidth;
                var party = getParty();
                var ch = party && party[allySlot - 1];
                battleState.currentActingAllySlot = allySlot;
                if (
                  ch &&
                  ch.name === '艾丽卡' &&
                  ch.specialSkillsUnlocked &&
                  ch.specialSkillsUnlocked.indexOf('奉献') !== -1 &&
                  !battleState.erika奉献TriggeredThisRound
                ) {
                  tryTriggerErika奉献(allySlot);
                  battleState.erika奉献TriggeredThisRound = true;
                }
                var opts = [];
                var regularSkillPopupRows = [];
                if (ch && ch.skills) {
                  ch.skills.forEach(function (s, idx) {
                    if (s.locked) return;
                    if (is沧澜潮汐B(s)) return;
                    var needAp = s.ap != null ? s.ap : 1;
                    var needApEff =
                      ch && typeof getEffectiveSkillApCostForAlly === 'function'
                        ? getEffectiveSkillApCostForAlly(ch, needAp)
                        : needAp;
                    var insufficientAp = curAp < needApEff;
                    if ((s.name || '') === '魔物孕育' && ch && (ch.name || '') === '丝伊德·白') {
                      var needYu = get魔物孕育消耗层数(s);
                      var dualYu = Math.max(1, parseInt(s.level, 10) || 1) >= 5 && s.advancement === 'B';
                      var needSlotsYu = dualYu ? 2 : 1;
                      var emptyYu = 0;
                      if (party && party.length >= SLOT_COUNT) {
                        for (var yu = 0; yu < SLOT_COUNT; yu++) if (party[yu] == null) emptyYu++;
                      }
                      insufficientAp =
                        insufficientAp ||
                        getUnitBuffLayers(ch, '孕育') < needYu ||
                        emptyYu < needSlotsYu;
                    }
                    var advanceOpt =
                      s.advancement && s.advancementOptions
                        ? s.advancementOptions.filter(function (o) {
                            return o.id === s.advancement;
                          })[0]
                        : null;
                    var displayName = advanceOpt ? (s.name || '') + '-' + (advanceOpt.name || '') : s.name || '';
                    var name = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    var ap = s.ap != null ? needApEff : '—';
                    var rawEffect =
                      s.advancementReplacesEffect && advanceOpt && advanceOpt.effect
                        ? advanceOpt.effect
                        : getSkillEffectForLevel(s, s.level || 1);
                    if (
                      ch &&
                      ch.name === '黯' &&
                      (s.name || '') === '攻击' &&
                      s.basic &&
                      (ch.specialSkillsUnlocked || []).indexOf('错锋') !== -1
                    ) {
                      rawEffect = '进行3次攻击判定，每次造成 [Str × 0.3] 的物理伤害。';
                    }
                    var effectHtml = wrapBuffRefs(resolveSkillEffect(rawEffect, ch));
                    var icon =
                      s.name === '防御'
                        ? SKILL_DEFENSE_SVG
                        : s.name === '剑脊格挡'
                          ? SKILL_SHIELD_SWORD_SVG || SKILL_DEFENSE_SVG
                          : s.name === '见切'
                            ? SKILL_JIANQIE_SVG || SKILL_SHIELD_SWORD_SVG || SKILL_DEFENSE_SVG
                            : s.name === '灵犀'
                              ? SKILL_LINGXI_SVG || SKILL_JUHE_SVG || SKILL_ATTACK_SVG
                            : s.name === '护卫'
                              ? SKILL_SHIELD_SWORD_SVG || SKILL_DEFENSE_SVG
                              : s.name === '沧澜'
                                ? SKILL_ZANYUE_SVG || SKILL_JUHE_SVG || SKILL_ATTACK_SVG
                              : s.name === '碧落'
                                ? SKILL_BILUO_SVG || SKILL_WHIRLWIND_SVG || SKILL_ZANYUE_SVG || SKILL_ATTACK_SVG
                              : s.name === '居合'
                              ? SKILL_JUHE_SVG || SKILL_ATTACK_SVG
                              : s.name === '纳刀'
                                ? SKILL_NADAO_SVG || SKILL_ATTACK_SVG
                                : s.name === '斩杀'
                                  ? SKILL_EXECUTE_SVG || SKILL_ATTACK_SVG
                                  : s.name === '遒劲猛击'
                                    ? SKILL_BLADE_BITE_SVG || SKILL_ATTACK_SVG
                                    : s.name === '斩月'
                                      ? SKILL_ZANYUE_SVG || SKILL_BLADE_BITE_SVG || SKILL_ATTACK_SVG
                                      : s.name === '狼式旋风'
                                        ? SKILL_WHIRLWIND_SVG || SKILL_ATTACK_SVG
                                        : s.name === '旋风踢'
                                          ? SKILL_WHIRLWIND_SVG || SKILL_ATTACK_SVG
                                          : s.name === '猫步'
                                            ? SKILL_MAOBU_SVG || SKILL_CANYINGBU_SVG || SKILL_DEFENSE_SVG
                                            : s.name === '瞬星射击'
                                              ? SKILL_SHUNXING_SVG || SKILL_ATTACK_SVG
                                              : s.name === '绞首射击'
                                                ? SKILL_JIAOSHOU_SVG || SKILL_ATTACK_SVG
                                                : ch.name === '白牙' && s.name === '横扫'
                                                  ? SKILL_BAIYA_SWEEP_SVG || SKILL_ATTACK_SVG
                                                  : ch.name === '白牙' && s.name === '撕咬'
                                                    ? SKILL_WOLF_PACK_SVG || SKILL_ATTACK_SVG
                                                    : s.name === '残影步'
                                                      ? SKILL_CANYINGBU_SVG || SKILL_ATTACK_SVG
                                                      : s.name === '幽灵舞踏'
                                                        ? SKILL_YOULINGWUTA_SVG || SKILL_ATTACK_SVG
                                                        : s.name === '血舞枪刃'
                                                          ? SKILL_XUEWUQIANGVEN_SVG || SKILL_ATTACK_SVG
                                                          : s.name === '暗夜帷幕'
                                                            ? SKILL_ANYEWEIMU_SVG || SKILL_ATTACK_SVG
                                                            : s.name === '炎魔吹息'
                                                              ? SKILL_YANMOCHUIXI_SVG || SKILL_ATTACK_SVG
                                                              : s.name === '心灵侵蚀'
                                                                ? SKILL_XINLINGQINSHI_SVG || SKILL_ATTACK_SVG
                                                              : s.name === '镜花水月'
                                                                ? SKILL_XINLINGQINSHI_SVG || SKILL_ATTACK_SVG
                                                                : s.name === '心智侵蚀'
                                                                  ? SKILL_XINLINGQINSHI_SVG || SKILL_ATTACK_SVG
                                                                  : s.name === '虚无放逐'
                                                                  ? SKILL_XUWUFANGZHU_SVG || SKILL_ATTACK_SVG
                                                                  : s.name === '妖艳业火'
                                                                    ? SKILL_YAOYANYEHUO_SVG || SKILL_ATTACK_SVG
                                                                    : s.name === '迷雾幻境'
                                                                      ? SKILL_YAOYANYEHUO_SVG || SKILL_ATTACK_SVG
                                                                    : s.name === '圣光斩'
                                                                      ? SKILL_SHENGUANGZHAN_SVG || SKILL_ATTACK_SVG
                                                                      : s.name === '碧血魔剑'
                                                                        ? SKILL_ZANYUE_SVG || SKILL_BLADE_BITE_SVG || SKILL_ATTACK_SVG
                                                                      : s.name === '威吓'
                                                                        ? SKILL_ROAR_SVG || SKILL_DEFENSE_SVG || SKILL_ATTACK_SVG
                                                                      : s.name === '绯色轮舞'
                                                                        ? SKILL_FEISELUNWU_SVG ||
                                                                          SKILL_WHIRLWIND_SVG ||
                                                                          SKILL_ZANYUE_SVG ||
                                                                          SKILL_ATTACK_SVG
                                                                        : s.name === '魔物孕育'
                                                                        ? SKILL_MOWUYUNYU_SVG ||
                                                                          SKILL_BAIYA_SVG ||
                                                                          SKILL_WHIRLWIND_SVG ||
                                                                          SKILL_ATTACK_SVG
                                                                        : s.name === '黏液包裹'
                                                                          ? SKILL_YANMOCHUIXI_SVG || SKILL_ATTACK_SVG
                                                                          : s.name === '弹性护盾'
                                                                            ? SKILL_DEFENSE_SVG ||
                                                                              SKILL_SHIELD_SWORD_SVG ||
                                                                              SKILL_ATTACK_SVG
                                                                            : s.name === '虚妄护盾'
                                                                              ? SKILL_DEFENSE_SVG ||
                                                                                SKILL_SHIELD_SWORD_SVG ||
                                                                                SKILL_ATTACK_SVG
                                                                        : s.name === '清算之手'
                                                                        ? SKILL_QINGSUANZHISHOU_SVG || SKILL_ATTACK_SVG
                                                                        : s.name === '神恩救赎'
                                                                          ? SKILL_SHENENJISHU_SVG || SKILL_ATTACK_SVG
                                                                          : s.name === '星语祝祷'
                                                                            ? SKILL_XINGYUZHUDAO_SVG ||
                                                                              SKILL_SHENENJISHU_SVG ||
                                                                              SKILL_ATTACK_SVG
                                                                            : s.name === '辉烬壁障'
                                                                              ? SKILL_HUIJINBIZHANG_SVG ||
                                                                                SKILL_SHENENJISHU_SVG ||
                                                                                SKILL_ATTACK_SVG
                                                                              : s.name === '星海调和'
                                                                                ? SKILL_XINGHAITIAOHE_SVG ||
                                                                                  SKILL_SHENENJISHU_SVG ||
                                                                                  SKILL_ATTACK_SVG
                                                                                : s.name === '天穹颂歌'
                                                                                  ? SKILL_TIANQIONGSONGE_SVG ||
                                                                                    SKILL_SHENENJISHU_SVG ||
                                                                                    SKILL_ATTACK_SVG
                                                                          : s.name === '罪罚宣告'
                                                                            ? SKILL_ZUIFAXUANGAO_SVG || SKILL_ATTACK_SVG
                                                                            : SKILL_ATTACK_SVG;
                    regularSkillPopupRows.push({
                      idx: idx,
                      baseName: s.name || '',
                      html:
                        '<div class="skill-popup-opt' +
                        (insufficientAp ? ' skill-popup-opt-disabled' : '') +
                        '" data-skill-index="' +
                        idx +
                        '"><span class="skill-popup-opt-icon">' +
                        icon +
                        '</span><div class="skill-popup-opt-main"><div class="skill-popup-opt-head"><span>' +
                        name +
                        '</span><span class="skill-popup-opt-ap">' +
                        AP_FLAME_SVG +
                        '<span>' +
                        ap +
                        '</span></span></div><div class="skill-popup-opt-desc">' +
                        effectHtml +
                        '</div></div></div>',
                    });
                  });
                  regularSkillPopupRows.sort(function (a, b) {
                    function skPri(n) {
                      if (n === '攻击') return 0;
                      if (n === '防御') return 1;
                      return 2;
                    }
                    var pa = skPri(a.baseName);
                    var pb = skPri(b.baseName);
                    if (pa !== pb) return pa - pb;
                    return a.idx - b.idx;
                  });
                  regularSkillPopupRows.forEach(function (row) {
                    opts.push(row.html);
                  });
                }
                if (ch) {
                  var specialList = getSpecialSkillsForChar(ch);
                  var unlocked =
                    ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
                  var emptyAllySlots = [];
                  var hasBaiyaOnField = false;
                  if (party && party.length >= SLOT_COUNT) {
                    for (var ei = 0; ei < SLOT_COUNT; ei++) {
                      if (party[ei] == null) emptyAllySlots.push(ei + 1);
                      else if (party[ei].name === '白牙') hasBaiyaOnField = true;
                    }
                  }
                  specialList.forEach(function (sk) {
                    if (unlocked.indexOf(sk.id) === -1) return;
                    if (
                      ch &&
                      ch.name === '凌遥仙' &&
                      battleState.lingyaoOnceSpecialUsed &&
                      ['星辰定锚', '星命逆转', '命仪精准'].indexOf(sk.id) !== -1 &&
                      battleState.lingyaoOnceSpecialUsed[sk.id]
                    )
                      return;
                    var skTags =
                      window.色色地牢_character && window.色色地牢_character.getSkillTagsString
                        ? window.色色地牢_character.getSkillTagsString(sk)
                        : sk.tags || '';
                    if (skTags.indexOf('被动') !== -1 || (sk.attribute1 || '') === '被动') return;
                    var needAp = sk.ap != null ? sk.ap : 1;
                    var needApSpEff =
                      ch && typeof getEffectiveSkillApCostForAlly === 'function'
                        ? getEffectiveSkillApCostForAlly(ch, needAp)
                        : needAp;
                    var insufficientAp = curAp < needApSpEff;
                    if (sk.id === '白牙！')
                      insufficientAp = insufficientAp || emptyAllySlots.length === 0 || hasBaiyaOnField;
                    var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    var ap = sk.ap != null ? needApSpEff : '—';
                    var effectHtml = wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
                    var iconSvg =
                      sk.id === '白牙！'
                        ? SKILL_BAIYA_SVG || SKILL_ATTACK_SVG
                        : sk.id === '狼群围猎'
                          ? SKILL_WOLF_PACK_SVG || SKILL_ATTACK_SVG
                          : sk.id === '威慑怒吼'
                            ? SKILL_ROAR_SVG || SKILL_ATTACK_SVG
                            : sk.id === '错金'
                              ? SKILL_CUOJIN_SVG || SKILL_ATTACK_SVG
                              : sk.id === '白夜'
                                ? SKILL_BAIYE_SVG || SKILL_ATTACK_SVG
                                : sk.id === '一闪'
                                  ? SKILL_ISHAN_SVG || SKILL_ATTACK_SVG
                                  : sk.id === '心眼'
                                    ? SKILL_XINYAN_SVG || SKILL_ATTACK_SVG
                                    : sk.id === '无拍子'
                                      ? SKILL_MUPAIZI_SVG || SKILL_ATTACK_SVG
                                      : sk.id === '魔龙舞'
                                        ? SKILL_MOLONGWU_SVG || SKILL_ATTACK_SVG
                                        : sk.id === '深渊终结'
                                          ? SKILL_SHENYUANZHONGJIE_SVG || SKILL_ATTACK_SVG
                                          : sk.id === '暗蚀之刃'
                                            ? SKILL_ANSHIZHIREN_SVG || SKILL_ATTACK_SVG
                                            : sk.id === '魅魔之吻'
                                              ? SKILL_MEIMOZHIWEN_SVG || SKILL_ATTACK_SVG
                                              : sk.id === '灵魂盛宴'
                                                ? SKILL_LINGHUNSHENGYAN_SVG || SKILL_ATTACK_SVG
                                                : sk.id === '竭魂之火'
                                                  ? SKILL_JIEHUNZHIHUO_SVG || SKILL_ATTACK_SVG
                                                  : sk.id === '蔷薇风暴'
                                                    ? SKILL_QIANGWEI_SVG || SKILL_ATTACK_SVG
                                                    : sk.id === '浮空速射'
                                                      ? SKILL_FUKONG_SVG || SKILL_ATTACK_SVG
                                                      : sk.id === '死亡之眼'
                                                        ? SKILL_SIWANGZHIYAN_SVG || SKILL_ATTACK_SVG
                                                        : sk.id === '弹跳踩踏'
                                                          ? SKILL_TANTIAO_SVG || SKILL_ATTACK_SVG
                                                          : sk.id === '盲目之光'
                                                            ? SKILL_MANGMOUZHIGUANG_SVG || SKILL_ATTACK_SVG
                                                            : sk.id === '救赎'
                                                              ? SKILL_JISHU_SVG || SKILL_ATTACK_SVG
                                                              : sk.id === '圣火净世'
                                                                ? SKILL_SHENGHUOJINGSHI_SVG || SKILL_ATTACK_SVG
                                                                : sk.id === '踏浪行歌'
                                                                  ? SKILL_TALANGXINGGE_SVG || SKILL_MAOBU_SVG || SKILL_DEFENSE_SVG
                                                                  : sk.id === '祥瑞庇佑'
                                                                    ? SKILL_XIANGRUIPUYOU_SVG ||
                                                                      SKILL_SHENENJISHU_SVG ||
                                                                      SKILL_SHENGUANGZHAN_SVG ||
                                                                      SKILL_ATTACK_SVG
                                                                    : sk.id === '姬骑解禁'
                                                                      ? SKILL_JIQIJIEJIN_SVG ||
                                                                        SKILL_ZANYUE_SVG ||
                                                                        SKILL_BLADE_BITE_SVG ||
                                                                        SKILL_ATTACK_SVG
                                                                      : sk.id === '腐蚀领域'
                                                                        ? SKILL_FUSHIYU_SVG ||
                                                                          SKILL_YANMOCHUIXI_SVG ||
                                                                          SKILL_ATTACK_SVG
                                                                        : sk.id === '异种外壳'
                                                                          ? SKILL_YIZHONGWAIKE_SVG ||
                                                                            SKILL_DEFENSE_SVG ||
                                                                            SKILL_ROAR_SVG ||
                                                                            SKILL_ATTACK_SVG
                                                                          : sk.id === '破阵冲锋'
                                                                            ? SKILL_POZHENCHONGFENG_SVG ||
                                                                              SKILL_BLADE_BITE_SVG ||
                                                                              SKILL_WOLF_PACK_SVG ||
                                                                              SKILL_ATTACK_SVG
                                                                            : sk.id === '星辰定锚'
                                                                              ? SKILL_XINGCHENDINGMAO_SVG ||
                                                                                SKILL_SHENENJISHU_SVG ||
                                                                                SKILL_ATTACK_SVG
                                                                              : sk.id === '星辰加速'
                                                                                ? SKILL_XINGCHENJIASU_SVG ||
                                                                                  SKILL_SHENENJISHU_SVG ||
                                                                                  SKILL_ATTACK_SVG
                                                                                : sk.id === '星命逆转'
                                                                                  ? SKILL_XINGMINGNIZHUAN_SVG ||
                                                                                    SKILL_SHENENJISHU_SVG ||
                                                                                    SKILL_ATTACK_SVG
                                                                                  : sk.id === '命仪精准'
                                                                                    ? SKILL_SHENENJISHU_SVG ||
                                                                                      SKILL_ATTACK_SVG
                                                                                    : sk.id === '大妃的魔宴' ||
                                                                                        sk.id === '傀儡剧场' ||
                                                                                        sk.id === '完美谎言' ||
                                                                                        sk.id === '虚实颠倒'
                                                                                      ? SKILL_MEIMOZHIWEN_SVG ||
                                                                                        SKILL_SHENENJISHU_SVG ||
                                                                                        SKILL_ATTACK_SVG
                                                                              : SKILL_ATTACK_SVG;
                    opts.push(
                      '<div class="skill-popup-opt' +
                        (insufficientAp ? ' skill-popup-opt-disabled' : '') +
                        '" data-special-id="' +
                        String(sk.id || '').replace(/"/g, '&quot;') +
                        '"><span class="skill-popup-opt-icon">' +
                        iconSvg +
                        '</span><div class="skill-popup-opt-main"><div class="skill-popup-opt-head"><span>' +
                        name +
                        '</span><span class="skill-popup-opt-ap">' +
                        AP_FLAME_SVG +
                        '<span>' +
                        ap +
                        '</span></span></div><div class="skill-popup-opt-desc">' +
                        effectHtml +
                        '</div></div></div>',
                    );
                  });
                }
                skillPopupEl.innerHTML =
                  '<div class="skill-popup-title">技能</div>' +
                  (opts.length
                    ? opts.join('')
                    : '<div class="skill-popup-opt" style="pointer-events:none;color:#9a8b72">暂无可用技能</div>');
                skillPopupEl.classList.add('show');
                var popupH = skillPopupEl.offsetHeight;
                var pad = 8;
                var maxH = window.innerHeight - 2 * pad;
                var effectiveH = popupH;
                if (popupH > maxH) {
                  skillPopupEl.style.maxHeight = maxH + 'px';
                  effectiveH = maxH;
                } else {
                  skillPopupEl.style.maxHeight = '';
                }
                skillPopupEl.style.bottom = '';
                var topIdeal = y - effectiveH / 2;
                var top = Math.max(pad, Math.min(topIdeal, window.innerHeight - pad - effectiveH));
                skillPopupEl.style.top = top + 'px';
                skillPopupEl.style.left =
                  (right ? x + pad : Math.max(pad, x - (skillPopupEl.offsetWidth || 160) - pad)) + 'px';
                skillPopupEl
                  .querySelectorAll('.skill-popup-opt[data-skill-index], .skill-popup-opt[data-special-id]')
                  .forEach(function (opt) {
                    opt.addEventListener('click', function (ev) {
                      ev.stopPropagation();
                      if (opt.classList.contains('skill-popup-opt-disabled')) return;
                      var idx = opt.getAttribute('data-skill-index');
                      var specialId = opt.getAttribute('data-special-id');
                      if (specialId !== '猎手本能') {
                        var partyStun = getParty();
                        var unitStun = partyStun && partyStun[allySlot - 1];
                        var apStun = getApCostForSkillPopupChoice(ch, idx, specialId);
                        if (tryConsume眩晕浪费行动(unitStun, apStun)) return;
                      }
                      var skillName = null;
                      if (idx != null && ch && ch.skills) {
                        var skill = ch.skills[parseInt(idx, 10)];
                        skillName = skill && skill.name;
                      }
                      skillPopupEl.classList.remove('show');
                      if (skillName === '防御') {
                        executePlayerDefense(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '剑脊格挡') {
                        executePlayerDefense(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '见切') {
                        executePlayerDefense(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '威吓') {
                        executePlayer威吓(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '护卫') {
                        executePlayer护卫(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '沧澜') {
                        var skIdx沧 = parseInt(idx, 10);
                        var skRef沧 = ch && ch.skills && ch.skills[skIdx沧];
                        if (skRef沧 && is沧澜潮汐B(skRef沧)) {
                          if (typeof window.toastr !== 'undefined')
                            window.toastr.warning('潮汐形态下沧澜为被动，无法主动释放');
                          return;
                        }
                        if (window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                          window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                            executePlayer沧澜(allySlot, enemySlotNum, skIdx沧);
                          });
                        }
                        return;
                      }
                      if (skillName === '碧落') {
                        executePlayer碧落(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '纳刀') {
                        executePlayer纳刀(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '残影步') {
                        executePlayer残影步(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '狼式旋风') {
                        executePlayerWhirlwind(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '旋风踢') {
                        executePlayer旋风踢(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '猫步') {
                        executePlayer猫步(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '瞬星射击') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                          window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                            executePlayer瞬星射击(allySlot, parseInt(idx, 10), enemySlotNum);
                          });
                        }
                        return;
                      }
                      if (skillName === '绞首射击') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                          window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                            executePlayer绞首射击(allySlot, parseInt(idx, 10), enemySlotNum);
                          });
                        }
                        return;
                      }
                      if (skillName === '暗夜帷幕') {
                        executePlayer暗夜帷幕(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '虚无放逐') {
                        skillPopupEl.classList.remove('show');
                        executePlayer虚无放逐(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '神恩救赎') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer神恩救赎(allySlot, targetAllySlot, parseInt(idx, 10));
                          });
                        }
                        return;
                      }
                      if (skillName === '星语祝祷') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer星语祝祷(allySlot, targetAllySlot, parseInt(idx, 10));
                          });
                        }
                        return;
                      }
                      if (skillName === '辉烬壁障') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer辉烬壁障(allySlot, targetAllySlot, parseInt(idx, 10));
                          });
                        }
                        return;
                      }
                      if (skillName === '星海调和') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer星海调和(allySlot, targetAllySlot, parseInt(idx, 10));
                          });
                        }
                        return;
                      }
                      if (skillName === '天穹颂歌') {
                        skillPopupEl.classList.remove('show');
                        executePlayer天穹颂歌(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '罪罚宣告') {
                        skillPopupEl.classList.remove('show');
                        executePlayer罪罚宣告(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '绯色轮舞') {
                        skillPopupEl.classList.remove('show');
                        executePlayer绯色轮舞(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '魔物孕育') {
                        skillPopupEl.classList.remove('show');
                        startPlayer魔物孕育SlotPick(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '孢子云') {
                        skillPopupEl.classList.remove('show');
                        executePlayer孢子云(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '黏液包裹') {
                        if (window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                          window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                            executePlayer黏液包裹(allySlot, parseInt(idx, 10), enemySlotNum);
                          });
                        }
                        return;
                      }
                      if (skillName === '弹性护盾') {
                        skillPopupEl.classList.remove('show');
                        executePlayer弹性护盾(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '虚妄护盾') {
                        skillPopupEl.classList.remove('show');
                        var skIdx虚 = parseInt(idx, 10);
                        var skRef虚 = ch && ch.skills && ch.skills[skIdx虚];
                        var lv虚 = skRef虚 && skRef虚.level != null ? parseInt(skRef虚.level, 10) || 1 : 1;
                        var advB虚 = lv虚 >= 5 && skRef虚 && skRef虚.advancement === 'B';
                        if (advB虚 && window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer虚妄护盾(allySlot, targetAllySlot, skIdx虚);
                          });
                        } else {
                          executePlayer虚妄护盾(allySlot, allySlot, skIdx虚);
                        }
                        return;
                      }
                      if (skillName === '再生菌丝') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer再生菌丝(allySlot, targetAllySlot, parseInt(idx, 10));
                          });
                        }
                        return;
                      }
                      if (skillName === '金粉弥漫') {
                        skillPopupEl.classList.remove('show');
                        executePlayer金粉弥漫(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '芬芳治愈') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer芬芳治愈(allySlot, targetAllySlot, parseInt(idx, 10));
                          });
                        }
                        return;
                      }
                      if (skillName === '妖艳业火') {
                        skillPopupEl.classList.remove('show');
                        executePlayer妖艳业火(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (skillName === '迷雾幻境') {
                        skillPopupEl.classList.remove('show');
                        executePlayer迷雾幻境(allySlot, parseInt(idx, 10));
                        return;
                      }
                      if (ch.name === '白牙' && skillName === '横扫') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterSkillTargetModeEnemyRowLeft) {
                          window.BattleGrid.enterSkillTargetModeEnemyRowLeft(getEnemyParty(), function (rowLeftSlot) {
                            executeBaiyaSweep(allySlot, parseInt(idx, 10), rowLeftSlot);
                          });
                        } else {
                          executeBaiyaSweep(allySlot, parseInt(idx, 10), null);
                        }
                        return;
                      }
                      if (ch.name === '白牙' && skillName === '撕咬') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                          window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                            executeBaiyaBite(allySlot, enemySlotNum);
                          });
                        }
                        return;
                      }
                      if (specialId === '威慑怒吼') {
                        skillPopupEl.classList.remove('show');
                        executePlayerWeiSheNuHou(allySlot);
                        return;
                      }
                      if (specialId === '盲目之光') {
                        skillPopupEl.classList.remove('show');
                        executePlayer盲目之光(allySlot);
                        return;
                      }
                      if (specialId === '救赎') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                          window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                            executePlayer救赎(allySlot, targetAllySlot);
                          });
                        }
                        return;
                      }
                      if (specialId === '圣火净世') {
                        skillPopupEl.classList.remove('show');
                        executePlayer圣火净世(allySlot);
                        return;
                      }
                      if (specialId === '白牙！') {
                        skillPopupEl.classList.remove('show');
                        if (window.BattleGrid && window.BattleGrid.enterAllyEmptySlotTargetMode) {
                          window.BattleGrid.enterAllyEmptySlotTargetMode(getParty(), function (emptySlotNum) {
                            executePlayerSummonBaiya(allySlot, emptySlotNum);
                          });
                        }
                        return;
                      }
                      if (specialId === '白夜') {
                        skillPopupEl.classList.remove('show');
                        var partyBy = getParty();
                        var att = partyBy && partyBy[allySlot - 1];
                        var 攻势B = 0;
                        var 守势B = 0;
                        if (att && att.buffs) {
                          att.buffs.forEach(function (b) {
                            if ((b.id || b.name) === '攻势') 攻势B = parseInt(b.layers, 10) || 0;
                            if ((b.id || b.name) === '守势') 守势B = parseInt(b.layers, 10) || 0;
                          });
                        }
                        if (攻势B >= 10 && 守势B < 10 && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                          window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                            executePlayer白夜(allySlot, slot);
                          });
                        } else {
                          executePlayer白夜(allySlot, null);
                        }
                        return;
                      }
                      if (specialId === '魔龙舞' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer魔龙舞(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '深渊终结' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer深渊终结(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '暗蚀之刃' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer暗蚀之刃(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '魅魔之吻' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer魅魔之吻(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '灵魂盛宴') {
                        skillPopupEl.classList.remove('show');
                        executePlayer灵魂盛宴(allySlot);
                        return;
                      }
                      if (specialId === '竭魂之火' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer竭魂之火(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '蔷薇风暴' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer蔷薇风暴(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '浮空速射') {
                        skillPopupEl.classList.remove('show');
                        executePlayer浮空速射(allySlot);
                        return;
                      }
                      if (specialId === '死亡之眼' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer死亡之眼(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '弹跳踩踏' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) {
                          executePlayer弹跳踩踏(allySlot, slot);
                        });
                        return;
                      }
                      if (specialId === '猎手本能') {
                        skillPopupEl.classList.remove('show');
                        return;
                      }
                      if (specialId === '踏浪行歌') {
                        skillPopupEl.classList.remove('show');
                        executePlayer踏浪行歌(allySlot);
                        return;
                      }
                      if (specialId === '祥瑞庇佑') {
                        skillPopupEl.classList.remove('show');
                        executePlayer祥瑞庇佑(allySlot);
                        return;
                      }
                      if (specialId === '姬骑解禁') {
                        skillPopupEl.classList.remove('show');
                        executePlayer姬骑解禁(allySlot);
                        return;
                      }
                      if (specialId === '腐蚀领域') {
                        skillPopupEl.classList.remove('show');
                        executePlayer腐蚀领域(allySlot);
                        return;
                      }
                      if (specialId === '异种外壳') {
                        skillPopupEl.classList.remove('show');
                        executePlayer异种外壳(allySlot);
                        return;
                      }
                      if (specialId === '破阵冲锋' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                          executePlayer破阵冲锋(allySlot, enemySlotNum);
                        });
                        return;
                      }
                      if (specialId === '星辰定锚' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                          executePlayer星辰定锚(allySlot, enemySlotNum);
                        });
                        return;
                      }
                      if (specialId === '星辰加速' && window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                          executePlayer星辰加速(allySlot, targetAllySlot);
                        });
                        return;
                      }
                      if (specialId === '星命逆转' && window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                          executePlayer星命逆转(allySlot, targetAllySlot);
                        });
                        return;
                      }
                      if (specialId === '命仪精准' && window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                          executePlayer命仪精准(allySlot, targetAllySlot);
                        });
                        return;
                      }
                      if (specialId === '大妃的魔宴' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                          executePlayer大妃的魔宴(allySlot, enemySlotNum);
                        });
                        return;
                      }
                      if (specialId === '傀儡剧场') {
                        skillPopupEl.classList.remove('show');
                        executePlayer傀儡剧场(allySlot);
                        return;
                      }
                      if (specialId === '完美谎言' && window.BattleGrid && window.BattleGrid.enterAllyFilledSlotTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterAllyFilledSlotTargetMode(getParty(), function (targetAllySlot) {
                          executePlayer完美谎言(allySlot, targetAllySlot);
                        });
                        return;
                      }
                      if (specialId === '虚实颠倒' && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        skillPopupEl.classList.remove('show');
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                          executePlayer虚实颠倒(allySlot, enemySlotNum);
                        });
                        return;
                      }
                      if (window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                        var skillIndex = idx != null ? parseInt(idx, 10) : -1;
                        window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (enemySlotNum) {
                          executePlayerAttack(allySlot, enemySlotNum, skillIndex, specialId);
                        });
                      }
                    });
                  });
              }
            }
          }
        }
      }
    });
    document.addEventListener('click', function closeSkillPopup(ev) {
      var skillPopupEl = document.getElementById('skill-popup');
      if (
        skillPopupEl &&
        skillPopupEl.classList.contains('show') &&
        !skillPopupEl.contains(ev.target) &&
        !ev.target.closest('.slot-char-portrait')
      )
        skillPopupEl.classList.remove('show');
    });
    if (typeof window !== 'undefined' && window.BattleGrid) {
      window.BattleGrid.appendActionLog = appendActionLog;
      window.BattleGrid.refreshBattleView = function () {
        // 遭遇写入 enemyParty、存档同步等会在此刷新；须与玩家回合「规划意图」同步，否则仅 initBattleUI 时规划一次会在敌方仍为空时锁定全 null，后续刷新不会补上。
        if (getBattlePhase() === BATTLE_PHASE.PLAYER_ACTION) {
          injectEnemyIntentStyle();
          planEnemyActionsForRound();
          battleState.showEnemyIntentUI = true;
        }
        renderAllySlots();
        renderEnemySlots();
        updateBattlePhaseDisplay();
        updateBattleFloorTitle();
      };
      updateBattleFloorTitle();
      var origAdvance = advanceBattlePhase;
      window.BattleGrid.advanceBattlePhase = function (callback) {
        var roundBefore = getBigRound();
        var phaseBefore = getBattlePhase();
        var next = origAdvance();
        var roundAfter = getBigRound();
        var nextLabel = getPhaseLabel(next);
        console.info('[战斗] 第' + roundBefore + '大回合 - ' + getPhaseLabel(phaseBefore) + ' 结束');
        console.info('[战斗] 第' + roundAfter + '大回合 - ' + nextLabel + ' 开始');
        updateBattlePhaseDisplay();
        function done() {
          updateBattlePhaseDisplay();
          if (typeof callback === 'function') callback();
        }
        if (next === 'player_action') {
          run虚无放逐Return();
          run暗夜帷幕ATick();
          var party = getParty();
          for (var i = 0; i < (party && party.length) ? party.length : 0; i++) {
            var ch = party[i];
            if (!ch) continue;
            var maxAp = getEffectiveMaxApForAlly(ch);
            ch.currentAp = maxAp;
            if (ch.见切弹返) ch.见切弹返 = false;
            if (ch.影舞反击) ch.影舞反击 = false;
          }
          run清漓玩家回合开始处理();
          run丝伊德魔物孕育Lv5A玩家回合开始();
          run丝伊德姬骑自动碧血魔剑玩家回合开始();
          saveBattleData(party, getEnemyParty());
          renderAllySlots(party);
          injectEnemyIntentStyle();
          planEnemyActionsForRound();
          battleState.showEnemyIntentUI = true;
          renderEnemySlots(getEnemyParty());
          done();
        } else if (next === 'player_resolution') resolvePlayerBuffs(done);
        else if (next === 'enemy_action')
          resolveEnemyActions(function () {
            battleState.showEnemyIntentUI = false;
            for (var pi = 0; pi < 6; pi++) battleState.plannedEnemyActions[pi] = null;
            saveBattleData(getParty(), getEnemyParty());
            renderEnemySlots(getEnemyParty());
            done();
          });
        else if (next === 'enemy_resolution') resolveEnemyBuffs(done);
        else done();
        return next;
      };
      var endTurnBtn = document.getElementById('battle-end-turn-btn');
      if (endTurnBtn) {
        endTurnBtn.addEventListener('click', function () {
          if (getBattlePhase() !== BATTLE_PHASE.PLAYER_ACTION) return;
          if (endTurnBtn.getAttribute('data-battle-btn-mode') === 'continue-map') {
            if (typeof window.色色地牢_onBattleVictoryUi === 'function') {
              try {
                window.色色地牢_onBattleVictoryUi();
              } catch (eV) {
                console.warn('[色色地牢] 色色地牢_onBattleVictoryUi', eV);
              }
            }
            // 首领战斗：交由 app 的统一处理（进入下一层 / 第三层结算）
            try {
              var intent = typeof window !== 'undefined' ? window._色色地牢_lastBattleIntent : null;
              if (
                intent &&
                intent.nodeType === '首领战斗' &&
                typeof window.色色地牢_onBossVictoryContinue === 'function'
              ) {
                window.色色地牢_onBossVictoryContinue();
                return;
              }
            } catch (eBoss) {
              console.warn('[色色地牢] 首领胜利继续流程失败', eBoss);
            }
            if (typeof window.色色地牢_commitPendingMapPosAfterBattle === 'function')
              window.色色地牢_commitPendingMapPosAfterBattle();
            if (typeof window.色色地牢_showMapDrawer === 'function') window.色色地牢_showMapDrawer({});
            return;
          }
          if (typeof window.BattleGrid === 'undefined' || typeof window.BattleGrid.advanceBattlePhase !== 'function')
            return;
          function runToNextPlayerAction() {
            if (getBattlePhase() === BATTLE_PHASE.PLAYER_ACTION) return;
            window.BattleGrid.advanceBattlePhase(runToNextPlayerAction);
          }
          window.BattleGrid.advanceBattlePhase(runToNextPlayerAction);
        });
      }
      injectEnemyIntentStyle();
      planEnemyActionsForRound();
      battleState.showEnemyIntentUI = true;
      renderEnemySlots(getEnemyParty());
    }
    if (typeof window !== 'undefined' && window.BattleGrid) window.BattleGrid.resolveAttack = resolveAttack;
  }

  /**
   * 战斗初始化：接收 app 传入的 options，重置后调用 initBattleUI。由 app 在 DOM 就绪时调用。
   * 若 options 中未包含某 SVG 图标，则从 window.色色地牢_SVG 补全（需先加载 resource/svg.js）。
   * @param {object} options 同 initBattleUI 的 options
   */
  function initBattle(options) {
    if (!options || typeof options.getParty !== 'function' || typeof options.saveBattleData !== 'function') return;
    if (typeof window !== 'undefined' && window.色色地牢_SVG && typeof window.色色地牢_SVG === 'object') {
      var svg = window.色色地牢_SVG;
      for (var key in svg) {
        if (Object.prototype.hasOwnProperty.call(svg, key) && (options[key] == null || options[key] === '')) {
          options[key] = svg[key];
        }
      }
    }
    initBattleUI(options);
  }

  if (typeof window !== 'undefined') {
    window.BattleGrid = {
      BUFF_DEFINITIONS: BUFF_DEFINITIONS,
      renderBuffsHtml: renderBuffsHtml,
      getBuffEffectTooltip: getBuffEffectTooltip,
      getBuffMaxLayers: getBuffMaxLayers,
      capUnitBuffs: capUnitBuffs,
      SLOT_COUNT: SLOT_COUNT,
      FRONT_ROW_SLOTS: FRONT_ROW_SLOTS,
      BACK_ROW_SLOTS: BACK_ROW_SLOTS,
      ENEMY_FRONT_ROW_SLOTS: ENEMY_FRONT_ROW_SLOTS,
      ENEMY_BACK_ROW_SLOTS: ENEMY_BACK_ROW_SLOTS,
      ALL_SLOT_INDICES: ALL_SLOT_INDICES,
      isFrontRow: isFrontRow,
      isBackRow: isBackRow,
      getFrontRowSlots: getFrontRowSlots,
      getBackRowSlots: getBackRowSlots,
      hasAnyUnitInFrontRow: hasAnyUnitInFrontRow,
      getTargetableSlotIndices: getTargetableSlotIndices,
      getTargetableAllySlotsForEnemy: getTargetableAllySlotsForEnemy,
      getTargetableEnemySlotIndices: getTargetableEnemySlotIndices,
      canTargetSlot: canTargetSlot,
      canTargetEnemySlot: canTargetEnemySlot,
      enterSkillTargetMode: enterSkillTargetMode,
      enterAllyEmptySlotTargetMode: enterAllyEmptySlotTargetMode,
      enterAllyFilledSlotTargetMode: enterAllyFilledSlotTargetMode,
      enterSkillTargetModeEnemyRowLeft: enterSkillTargetModeEnemyRowLeft,
      exitSkillTargetMode: exitSkillTargetMode,
      getBigRound: getBigRound,
      setBigRound: setBigRound,
      getBattlePhase: getBattlePhase,
      setBattlePhase: setBattlePhase,
      advanceBattlePhase: advanceBattlePhase,
      BATTLE_PHASE: BATTLE_PHASE,
      roll1To100: roll1To100,
      initBattle: initBattle,
      initBattleUI: initBattleUI,
      getRecentBattleLog: function (maxLines) {
        var n = Math.max(0, parseInt(maxLines, 10) || RECENT_LOG_MAX);
        return recentLogLines.slice(-n);
      },
      setBattleLog: function (lines) {
        recentLogLines = Array.isArray(lines) ? lines.slice() : [];
        var el = document.getElementById('battle-combat-log');
        if (el) {
          el.innerHTML = '';
          recentLogLines.forEach(function (t) {
            var line = document.createElement('div');
            line.className = 'battle-combat-log-line';
            line.textContent = t;
            el.appendChild(line);
          });
          el.scrollTop = el.scrollHeight;
        }
      },
    };
  }
})();
