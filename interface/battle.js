/**
 * 色色地牢 - 战斗逻辑（前排/后排、可攻击目标）
 * 约定：竖直为一排，横着为一列；网格为 3 排 × 2 列，槽位 1～6。
 * 己方：前排 2、4、6（靠敌），后排 1、3、5。敌方：前排 1、3、5（靠玩家），后排 2、4、6。仅当前排全空时才能攻击后排。
 */
(function () {
  'use strict';

  /** 槽位总数（己方或敌方单侧） */
  var SLOT_COUNT = 6;

  /** 前排槽位编号（己方：图中靠敌的一列）2、4、6。当且仅当这三个槽位都无角色时，后排才可被攻击 */
  var FRONT_ROW_SLOTS = [2, 4, 6];

  /** 后排槽位编号（己方）：1、3、5 */
  var BACK_ROW_SLOTS = [1, 3, 5];

  /** 敌方前排槽位编号（靠玩家的一列，与己方相反）：1、3、5 */
  var ENEMY_FRONT_ROW_SLOTS = [1, 3, 5];
  /** 敌方后排槽位编号：2、4、6 */
  var ENEMY_BACK_ROW_SLOTS = [2, 4, 6];

  /** 所有槽位编号 1～6 */
  var ALL_SLOT_INDICES = [1, 2, 3, 4, 5, 6];

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
    for (var i = 0; i < FRONT_ROW_SLOTS.length; i++) {
      var idx = FRONT_ROW_SLOTS[i] - 1;
      if (slots[idx] != null) return true;
    }
    return false;
  }

  /**
   * 获取敌方在给定槽位状态下可被选为攻击目标的槽位编号列表
   * 敌方前排为 1、3、5（靠玩家），后排为 2、4、6；仅当前排全空时才能攻击后排
   */
  function getTargetableEnemySlotIndices(slots) {
    if (!slots || slots.length < SLOT_COUNT) return [];
    var frontOccupied = false;
    for (var i = 0; i < ENEMY_FRONT_ROW_SLOTS.length; i++) {
      if (slots[ENEMY_FRONT_ROW_SLOTS[i] - 1] != null) {
        frontOccupied = true;
        break;
      }
    }
    var out = ENEMY_FRONT_ROW_SLOTS.slice();
    if (!frontOccupied) {
      for (i = 0; i < ENEMY_BACK_ROW_SLOTS.length; i++) {
        out.push(ENEMY_BACK_ROW_SLOTS[i]);
      }
    }
    return out;
  }

  /**
   * 判断某槽位在当前敌方槽位状态下是否可作为攻击目标（敌方前排=1,3,5）
   */
  function canTargetEnemySlot(targetSlotIndex, slots) {
    var idx = Number(targetSlotIndex);
    if (idx < 1 || idx > SLOT_COUNT) return false;
    if (ENEMY_FRONT_ROW_SLOTS.indexOf(idx) !== -1) return true;
    if (ENEMY_BACK_ROW_SLOTS.indexOf(idx) !== -1) {
      for (var i = 0; i < ENEMY_FRONT_ROW_SLOTS.length; i++) {
        if (slots[ENEMY_FRONT_ROW_SLOTS[i] - 1] != null) return false;
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
    var frontOccupied = hasAnyUnitInFrontRow(slots);
    var out = [];
    var i;
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
    var idx = Number(targetSlotIndex);
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
  var getTargetableAllySlotsForEnemy;

  /**
   * 游戏内 buff 定义。desc：用于显示的描述（悬停/说明均读此字段）；maxLayers：层数上限，不设或 0 表示无上限。
   */
  var BUFF_DEFINITIONS = [
    { id: '护盾', name: '护盾', desc: '抵消伤害', tooltip: '抵消伤害。' },
    {
      id: '力量强化',
      name: '力量强化',
      desc: '力量属性+5',
      tooltip: '对应属性+5。层数仅表示持续回合。',
      maxLayers: 3,
    },
    {
      id: '敏捷强化',
      name: '敏捷强化',
      desc: '敏捷属性+5',
      tooltip: '对应属性+5。层数仅表示持续回合。',
      maxLayers: 3,
    },
    {
      id: '智力强化',
      name: '智力强化',
      desc: '智力属性+5',
      tooltip: '对应属性+5。层数仅表示持续回合。',
      maxLayers: 3,
    },
    {
      id: '攻击强化',
      name: '攻击强化',
      desc: '攻击属性+5',
      tooltip: '对应属性+5。层数仅表示持续回合。',
      maxLayers: 3,
    },
    {
      id: '防御强化',
      name: '防御强化',
      desc: '防御属性+5',
      tooltip: '对应属性+5。层数仅表示持续回合。',
      maxLayers: 3,
    },
    {
      id: '再生',
      name: '再生',
      desc: '回合结束时恢复等同于当前层数的生命值',
      tooltip: '回合结束时恢复等同于当前层数的生命值。无上限。',
    },
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
      desc: '造成伤害-20%',
      tooltip: '造成的所有伤害-20%。上限3层。',
      maxLayers: 3,
    },
    {
      id: '脆弱',
      name: '脆弱',
      desc: '受到伤害+20%',
      tooltip: '受到的所有伤害+20%。上限3层。',
      maxLayers: 3,
    },
    {
      id: '破甲',
      name: '破甲',
      desc: '物理受伤+20%',
      tooltip: '受到的物理伤害+20%。上限3层。',
      maxLayers: 3,
    },
    {
      id: '碎魔',
      name: '碎魔',
      desc: '魔法受伤+20%',
      tooltip: '受到的魔法伤害+20%。上限3层。',
      maxLayers: 3,
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
      tooltip: '无效化该角色任意一次行动',
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
      id: '嘲讽',
      name: '嘲讽',
      desc: '被视为优先攻击的对象',
      tooltip: '被视为优先攻击的对象',
      maxLayers: 3,
    },
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
    {
      id: '精液附着',
      name: '精液附着',
      desc: '追踪各部位精液状态，层级：无→少量→明显→大量',
      tooltip: '追踪各部位精液状态。',
    },
    {
      id: '攻势',
      name: '攻势',
      desc: '力量+2',
      tooltip: '每层力量+2。结算回合清空身上所有的攻势。层数无上限。',
    },
    {
      id: '守势',
      name: '守势',
      desc: '敏捷+2',
      tooltip: '每层敏捷+2。结算回合清空身上所有的守势。层数无上限。',
    },
    {
      id: '坚韧',
      name: '坚韧',
      desc: '受到的所有伤害-10%',
      tooltip: '受到的所有伤害-10%。回合结束阶段-1层。上限5层。',
      maxLayers: 5,
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
      id: '灵巧',
      name: '灵巧',
      desc: '闪避+10%',
      tooltip: '闪避+10%。回合结束阶段-1层。持续回合数由施加技能指定。上限5层。',
      maxLayers: 5,
    },
    {
      id: '专注',
      name: '专注',
      desc: '命中+10%',
      tooltip: '命中+10%。回合结束阶段-1层。持续回合数由施加技能指定。上限5层。',
      maxLayers: 5,
    },
    {
      id: '精准',
      name: '精准',
      desc: '暴击+10%',
      tooltip: '暴击+10%。回合结束阶段-1层。持续回合数由施加技能指定。上限5层。',
      maxLayers: 5,
    },
    {
      id: '激励',
      name: '激励',
      desc: '造成的所有伤害+10%',
      tooltip: '造成的所有伤害+10%。回合结束阶段-1层。持续回合数由施加技能指定。上限5层。',
      maxLayers: 5,
    },
    {
      id: '格挡',
      name: '格挡',
      desc: '受到的物理伤害-10%',
      tooltip: '受到的物理伤害-10%。回合结束阶段-1层。持续回合数由施加技能指定。上限5层。',
      maxLayers: 5,
    },
    {
      id: '扰魔',
      name: '扰魔',
      desc: '受到的魔法伤害-10%',
      tooltip: '受到的魔法伤害-10%。回合结束阶段-1层。持续回合数由施加技能指定。上限5层。',
      maxLayers: 5,
    },
  ];
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

  /** buff 外观主题：id → { fill: 半透明填充, border: 边框色, color: 层数/名字文字色 }，用于角色卡上的 buff 标签 */
  var BUFF_THEME = {
    重伤: { fill: 'rgba(179,36,36,0.45)', border: '#b32424', color: '#b32424' },
    流血: { fill: 'rgba(179,36,36,0.45)', border: '#b32424', color: '#b32424' },
    燃烧: { fill: 'rgba(230,81,0,0.45)', border: '#e65100', color: '#e65100' },
    中毒: { fill: 'rgba(123,31,162,0.45)', border: '#7b1fa2', color: '#7b1fa2' },
    虚弱: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    脆弱: { fill: 'rgba(179,36,36,0.4)', border: '#b32424', color: '#b32424' },
    破甲: { fill: 'rgba(139,90,43,0.5)', border: '#5d4037', color: '#5d4037' },
    碎魔: { fill: 'rgba(21,101,192,0.45)', border: '#1565c0', color: '#1565c0' },
    力量削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    敏捷削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    智力削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    攻击削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    防御削弱: { fill: 'rgba(179,36,36,0.35)', border: '#8b0000', color: '#8b0000' },
    力量强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    敏捷强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    智力强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    攻击强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    防御强化: { fill: 'rgba(46,125,50,0.45)', border: '#2e7d32', color: '#2e7d32' },
    再生: { fill: 'rgba(46,125,50,0.5)', border: '#2e7d32', color: '#2e7d32' },
    护盾: { fill: 'rgba(25,118,210,0.4)', border: '#1976d2', color: '#1976d2' },
    眩晕: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    魅惑: { fill: 'rgba(156,39,176,0.45)', border: '#9c27b0', color: '#9c27b0' },
    沉默: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    缴械: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    混乱: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    嘲讽: { fill: 'rgba(244,67,54,0.45)', border: '#f44336', color: '#f44336' },
    发情: { fill: 'rgba(233,30,99,0.4)', border: '#e91e63', color: '#e91e63' },
    羞耻: { fill: 'rgba(233,30,99,0.4)', border: '#e91e63', color: '#e91e63' },
    轻微破损: { fill: 'rgba(97,97,97,0.4)', border: '#616161', color: '#424242' },
    中度破损: { fill: 'rgba(97,97,97,0.45)', border: '#616161', color: '#424242' },
    严重破损: { fill: 'rgba(97,97,97,0.5)', border: '#616161', color: '#424242' },
    精液附着: { fill: 'rgba(158,158,158,0.4)', border: '#9e9e9e', color: '#616161' },
    攻势: { fill: 'rgba(0,0,0,0.5)', border: '#1a1a1a', color: '#1a1a1a' },
    守势: { fill: 'rgba(250,250,250,0.7)', border: '#e0e0e0', color: '#333333' },
    坚韧: { fill: 'rgba(139,90,43,0.45)', border: '#5d4037', color: '#5d4037' },
    麻痹: { fill: 'rgba(121,85,72,0.5)', border: '#5d4037', color: '#4e342e' },
    冻结: { fill: 'rgba(33,150,243,0.5)', border: '#1976d2', color: '#0d47a1' },
    暗蚀: { fill: 'rgba(63,81,181,0.5)', border: '#3949ab', color: '#1a237e' },
    灵巧: { fill: 'rgba(76,175,80,0.5)', border: '#43a047', color: '#2e7d32' },
    专注: { fill: 'rgba(255,193,7,0.5)', border: '#ffc107', color: '#f57f17' },
    精准: { fill: 'rgba(233,30,99,0.45)', border: '#e91e63', color: '#ad1457' },
    激励: { fill: 'rgba(255,152,0,0.5)', border: '#ff9800', color: '#e65100' },
    格挡: { fill: 'rgba(96,125,139,0.5)', border: '#607d8b', color: '#455a64' },
    扰魔: { fill: 'rgba(103,58,183,0.5)', border: '#673ab7', color: '#4527a0' },
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
  function enterAllyEmptySlotTargetMode(party, onSlotSelected) {
    if (!party || !Array.isArray(party) || typeof onSlotSelected !== 'function') return;
    exitSkillTargetMode();
    injectTargetableStyle();
    for (var i = 1; i <= SLOT_COUNT; i++) {
      if (party[i - 1] == null) {
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
    PLAYER_ACTION: 'player_action',       // 玩家行动回合
    PLAYER_RESOLUTION: 'player_resolution', // 玩家结算回合
    ENEMY_ACTION: 'enemy_action',         // 敌方行动回合
    ENEMY_RESOLUTION: 'enemy_resolution', // 敌方结算回合
  };
  var phaseOrder = [
    BATTLE_PHASE.PLAYER_ACTION,
    BATTLE_PHASE.PLAYER_RESOLUTION,
    BATTLE_PHASE.ENEMY_ACTION,
    BATTLE_PHASE.ENEMY_RESOLUTION,
  ];
  var battleState = { bigRound: 1, phase: BATTLE_PHASE.PLAYER_ACTION };

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
    return battleState.phase;
  }

  // ---------- 命中 / 暴击 / 伤害结算 ----------
  var BASE_PLAYER_HIT = 50;
  var LUK_HIT_PER = 5;
  var BASE_MONSTER_DODGE = 0;
  var BASE_MONSTER_HIT = 90;
  var AGI_DODGE_PER = 2;
  var BASE_PLAYER_CRIT = 20;
  var PLAYER_CRIT_PER_AGI = 1;
  var BASE_MONSTER_CRIT = 25;
  var CRIT_MULT = 2;

  function roll1To100() {
    return Math.floor(Math.random() * 100) + 1;
  }
  function num(val) {
    return Math.max(0, parseInt(val, 10) || 0);
  }

  function getPlayerHitRate(attacker, defender) {
    if (attacker.一闪必中 || attacker.无拍子必中) return 100;
    var luk = num(attacker.luk);
    var dodge = defender && (defender.dodgeRate != null ? num(defender.dodgeRate) : BASE_MONSTER_DODGE);
    var rate = Math.min(100, Math.max(0, BASE_PLAYER_HIT + luk * LUK_HIT_PER - dodge));
    var 专注L = 0;
    if (attacker && attacker.buffs) {
      attacker.buffs.forEach(function (b) { if ((b.id || b.name) === '专注') 专注L = Math.min(5, parseInt(b.layers, 10) || 0); });
      rate = Math.min(100, Math.max(0, rate + 专注L * 10));
    }
    return rate;
  }
  function getMonsterHitRate(attacker, defender) {
    var hitBuff = attacker && (attacker.hitRateBuff != null ? num(attacker.hitRateBuff) : 0);
    var agi = defender ? num(defender.agi) : 0;
    var rate = Math.min(100, Math.max(0, BASE_MONSTER_HIT + hitBuff - agi * AGI_DODGE_PER));
    if (defender && defender.name === '昼墨' && defender.specialSkillsUnlocked && defender.specialSkillsUnlocked.indexOf('心眼') !== -1) {
      var 守势L = 0;
      (defender.buffs || []).forEach(function (b) { if ((b.id || b.name) === '守势') 守势L = parseInt(b.layers, 10) || 0; });
      rate = Math.max(0, rate - 守势L * 5);
    }
    var 灵巧L = 0;
    if (defender && defender.buffs) {
      defender.buffs.forEach(function (b) { if ((b.id || b.name) === '灵巧') 灵巧L = Math.min(5, parseInt(b.layers, 10) || 0); });
      rate = Math.max(0, rate - 灵巧L * 10);
    }
    return rate;
  }
  function getPlayerCritRate(attacker) {
    var agi = num(attacker.agi);
    var rate = Math.min(100, Math.max(0, BASE_PLAYER_CRIT + agi * PLAYER_CRIT_PER_AGI));
    if (attacker.name === '昼墨' && attacker.specialSkillsUnlocked && attacker.specialSkillsUnlocked.indexOf('心眼') !== -1) {
      var 攻势L = 0;
      (attacker.buffs || []).forEach(function (b) { if ((b.id || b.name) === '攻势') 攻势L = parseInt(b.layers, 10) || 0; });
      rate = Math.min(100, rate + 攻势L * 5);
    }
    var 精准L = 0;
    if (attacker && attacker.buffs) {
      attacker.buffs.forEach(function (b) { if ((b.id || b.name) === '精准') 精准L = Math.min(5, parseInt(b.layers, 10) || 0); });
      rate = Math.min(100, Math.max(0, rate + 精准L * 10));
    }
    return rate;
  }
  function getMonsterCritRate(attacker) {
    var buff = attacker && (attacker.critRateBuff != null ? num(attacker.critRateBuff) : 0);
    return Math.min(100, Math.max(0, BASE_MONSTER_CRIT + buff));
  }

  /**
   * 初始化战斗界面：渲染己方/敌方槽位、技能弹窗、换位、攻击结算与受击特效等。由 app 传入 options 调用。
   * @param {object} options 依赖：getParty, getEnemyParty, saveBattleData, getDisplayStat, getHpFromSta, getApByLevel, getMaxExpForLevel, getSkillEffectForLevel, resolveSkillEffect, getBaseDamageFromResolvedEffect, getBaseDamageForSkill, getSpecialSkillsForChar, wrapBuffRefs, SWAP_SVG, AP_FLAME_SVG, SKILL_ATTACK_SVG, SKILL_DEFENSE_SVG
   */
  function initBattleUI(options) {
    if (!options || typeof options.getParty !== 'function' || typeof options.saveBattleData !== 'function') return;
    var getParty = options.getParty;
    var getEnemyParty = options.getEnemyParty;
    var saveBattleData = options.saveBattleData;
    var baseGetDisplayStat = options.getDisplayStat;
    var getDisplayStat = function (unit, key) {
      var v = baseGetDisplayStat ? baseGetDisplayStat(unit, key) : 0;
      if (unit && unit.buffs && unit.buffs.length && (key === 'str' || key === 'agi' || key === 'int' || key === 'def')) {
        for (var i = 0; i < unit.buffs.length; i++) {
          var b = unit.buffs[i];
          var id = (b.id || b.name || '').trim();
          var layers = Math.max(0, parseInt(b.layers, 10) || 0);
          if (id === '攻势' && key === 'str') v += layers * 2;
          if (id === '守势' && key === 'agi') v += layers * 2;
          if (id === '力量强化' && key === 'str') v += 5;
          if (id === '攻击强化' && key === 'str') v += 5;
          if (id === '敏捷强化' && key === 'agi') v += 5;
          if (id === '智力强化' && key === 'int') v += 5;
          if (id === '防御强化' && key === 'def') v += 5;
        }
      }
      return v;
    };
    var 暗夜帷幕A_State = null;
    function resolveAttack(attacker, defender, baseDamage, isPlayerAttacker, opts) {
      var magicOnly = opts && opts.magicOnly === true;
      var rollHit = roll1To100();
      var hitRate = isPlayerAttacker ? getPlayerHitRate(attacker, defender) : getMonsterHitRate(attacker, defender);
      var hit = rollHit <= hitRate;
      if (!hit) {
        return {
          hit: false,
          crit: false,
          rollHit: rollHit,
          rollCrit: 0,
          hitRate: hitRate,
          critRate: 0,
          finalDamage: 0,
          shadowDamage: 0,
          message: '未命中',
        };
      }
      var rollCrit = roll1To100();
      var critRate = isPlayerAttacker ? getPlayerCritRate(attacker) : getMonsterCritRate(attacker);
      var crit = rollCrit <= critRate;
      var rawDamage = crit ? baseDamage * CRIT_MULT : baseDamage;
      var 激励L = 0;
      if (attacker && attacker.buffs) {
        attacker.buffs.forEach(function (b) { if ((b.id || b.name) === '激励') 激励L = Math.min(5, parseInt(b.layers, 10) || 0); });
      }
      if (激励L > 0) rawDamage = rawDamage * (1 + 激励L * 0.1);
      var damageMult = 1;
      var 格挡L = 0;
      var 坚韧L = 0;
      var 扰魔L = 0;
      var 破甲L = 0;
      var 脆弱L = 0;
      if (defender && defender.buffs && defender.buffs.length) {
        for (var i = 0; i < defender.buffs.length; i++) {
          var b = defender.buffs[i];
          var bid = (b.id || b.name || '').trim();
          var layers = Math.max(0, parseInt(b.layers, 10) || 0);
          if (!magicOnly && bid === '破甲') { damageMult += layers * 0.2; 破甲L = Math.min(5, layers); }
          if (bid === '脆弱') { damageMult += layers * 0.2; 脆弱L = Math.min(5, layers); }
          if (!magicOnly && bid === '格挡') 格挡L = Math.min(5, layers);
          if (bid === '坚韧') 坚韧L = Math.min(5, layers);
          if (bid === '扰魔') 扰魔L = Math.min(5, layers);
        }
      }
      var finalDamage;
      if (magicOnly) {
        var magicPart = rawDamage * damageMult * (1 - 扰魔L * 0.1) * (1 - 坚韧L * 0.1);
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
          anShadow = anShadow * (1 - 扰魔L * 0.1) * (1 - 坚韧L * 0.1);
          shadowAdded = Math.max(0, Math.floor(anShadow));
          finalDamage += shadowAdded;
        }
        var increaseReasons = [];
        if (crit) increaseReasons.push('暴击+100%');
        if (激励L > 0) increaseReasons.push('激励+' + (激励L * 10) + '%');
        if (破甲L > 0) increaseReasons.push('破甲+' + (破甲L * 20) + '%');
        if (脆弱L > 0) increaseReasons.push('脆弱+' + (脆弱L * 20) + '%');
        if (shadowAdded > 0) increaseReasons.push('被动暗影+' + shadowAdded);
        var damageIncreaseReasons = increaseReasons.length > 0 ? increaseReasons.join('；') + '；' : '无；';
        var message = crit ? '暴击！造成 ' + finalDamage + ' 点伤害' : '命中，造成 ' + finalDamage + ' 点伤害';
        return {
          hit: true,
          crit: crit,
          rollHit: rollHit,
          rollCrit: rollCrit,
          hitRate: hitRate,
          critRate: critRate,
          finalDamage: finalDamage,
          shadowDamage: shadowAdded,
          damageIncreaseReasons: damageIncreaseReasons,
          message: message,
        };
      } else {
        var physicalPart = rawDamage * damageMult * (1 - 格挡L * 0.1) * (1 - 坚韧L * 0.1);
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
          anShadow = anShadow * (1 - 扰魔L * 0.1) * (1 - 坚韧L * 0.1);
          shadowAdded = Math.max(0, Math.floor(anShadow));
          finalDamage += shadowAdded;
        }
        var increaseReasons = [];
        if (crit) increaseReasons.push('暴击+100%');
        if (激励L > 0) increaseReasons.push('激励+' + (激励L * 10) + '%');
        if (破甲L > 0) increaseReasons.push('破甲+' + (破甲L * 20) + '%');
        if (脆弱L > 0) increaseReasons.push('脆弱+' + (脆弱L * 20) + '%');
        if (shadowAdded > 0) increaseReasons.push('被动暗影+' + shadowAdded);
        var damageIncreaseReasons = increaseReasons.length > 0 ? increaseReasons.join('；') + '；' : '无；';
        var message = crit ? '暴击！造成 ' + finalDamage + ' 点伤害' : '命中，造成 ' + finalDamage + ' 点伤害';
        return {
          hit: true,
          crit: crit,
          rollHit: rollHit,
          rollCrit: rollCrit,
          hitRate: hitRate,
          critRate: critRate,
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
        if ((fHp || 0) > 0) {
          frontHasLiving = true;
          break;
        }
      }
      var base = frontHasLiving ? FRONT_ROW_SLOTS.slice() : FRONT_ROW_SLOTS.slice().concat(BACK_ROW_SLOTS);
      return base.filter(function (slotIdx) {
        var ally = party[slotIdx - 1];
        if (!ally) return false;
        var curHp = ally.hp != null ? parseInt(ally.hp, 10) : getHpFromSta(getDisplayStat(ally, 'sta') || 1);
        return (curHp || 0) > 0;
      });
    };
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
    var SKILL_BAIYA_SVG = options.SKILL_BAIYA_SVG || '';
    var SKILL_WOLF_PACK_SVG = options.SKILL_WOLF_PACK_SVG || '';
    var SKILL_ROAR_SVG = options.SKILL_ROAR_SVG || '';
    var SKILL_EXECUTE_SVG = options.SKILL_EXECUTE_SVG || '';
    var SKILL_BAIYA_SWEEP_SVG = options.SKILL_BAIYA_SWEEP_SVG || '';
    var SKILL_WHIRLWIND_SVG = options.SKILL_WHIRLWIND_SVG || '';
    var SKILL_BLADE_BITE_SVG = options.SKILL_BLADE_BITE_SVG || '';
    var SKILL_SHIELD_SWORD_SVG = options.SKILL_SHIELD_SWORD_SVG || '';
    var SKILL_ZANYUE_SVG = options.SKILL_ZANYUE_SVG || '';
    var SKILL_JIANQIE_SVG = options.SKILL_JIANQIE_SVG || '';
    var SKILL_JUHE_SVG = options.SKILL_JUHE_SVG || '';
    var SKILL_NADAO_SVG = options.SKILL_NADAO_SVG || '';
    var SKILL_CUOJIN_SVG = options.SKILL_CUOJIN_SVG || '';
    var SKILL_BAIYE_SVG = options.SKILL_BAIYE_SVG || '';
    var SKILL_ISHAN_SVG = options.SKILL_ISHAN_SVG || '';
    var SKILL_XINYAN_SVG = options.SKILL_XINYAN_SVG || '';
    var SKILL_MUPAIZI_SVG = options.SKILL_MUPAIZI_SVG || '';

    function renderAllySlots(optionalParty) {
      var party = optionalParty != null && Array.isArray(optionalParty) ? optionalParty : getParty();
      for (var i = 1; i <= 6; i++) {
        var slotEl = document.querySelector('.slot[data-slot="ally-' + i + '"]');
        if (!slotEl) continue;
        var ch = party[i - 1];
        if (!ch) {
          slotEl.innerHTML = '空位';
          slotEl.classList.add('slot-char');
          slotEl.classList.remove('slot-defeated', 'slot-defeated-shake');
          var emptyOb = slotEl.querySelector('.slot-defeated-overlay');
          if (emptyOb) emptyOb.remove();
          slotEl.title = '空位';
          continue;
        }
        if (ch.name === '白牙') {
          var baiyaMaxHp = Math.max(1, parseInt(ch.maxHp, 10) || 1);
          var baiyaHp = ch.hp != null ? Math.min(parseInt(ch.hp, 10) || 0, baiyaMaxHp) : baiyaMaxHp;
          var baiyaAtk = ch.atk != null ? parseInt(ch.atk, 10) : 0;
          var baiyaDef = ch.def != null ? parseInt(ch.def, 10) : 0;
          var baiyaShield = ch.currentShield != null ? Math.max(0, parseInt(ch.currentShield, 10) || 0) : 0;
          var baiyaAp = ch.currentAp !== undefined && ch.currentAp !== null ? Math.max(0, parseInt(ch.currentAp, 10) || 0) : 2;
          var baiyaHpPct = baiyaMaxHp ? Math.min(100, (baiyaHp / baiyaMaxHp) * 100) : 0;
          var baiyaShieldPct = baiyaMaxHp > 0 && baiyaShield > 0 ? Math.min(100, (baiyaShield / baiyaMaxHp) * 100) : 0;
          slotEl.classList.add('slot-char', 'slot-enemy');
          slotEl.title = '白牙 HP ' + baiyaHp + '/' + baiyaMaxHp + (baiyaShield > 0 ? ' 护盾' + baiyaShield : '') + ' 攻击' + baiyaAtk + ' 防御' + baiyaDef;
          if (baiyaHp <= 0) {
            var baiyaNameEl = slotEl.querySelector('.slot-char-name');
            var baiyaHasOverlay = slotEl.querySelector('.slot-defeated-overlay');
            if (baiyaNameEl && baiyaHasOverlay && (baiyaNameEl.textContent || '').trim() === '白牙') {
              slotEl.classList.add('slot-defeated');
              slotEl.classList.remove('slot-defeated-shake');
              continue;
            }
          }
          slotEl.innerHTML =
            '<button type="button" class="slot-swap-btn" title="切换位置" data-ally-slot="' + i + '">' + SWAP_SVG + '</button>' +
            '<div class="slot-char-portrait slot-enemy-portrait-empty" aria-hidden="true"></div>' +
            '<div class="slot-char-info">' +
            '<div class="slot-char-name">白牙</div>' +
            '<div class="slot-char-bar slot-char-hp"><div class="slot-char-bar-fill" style="width:' + baiyaHpPct + '%"></div>' +
            (baiyaShield > 0 ? '<div class="slot-char-bar-shield-edge' + (baiyaShieldPct >= 100 ? ' slot-char-bar-shield-edge-full' : '') + '" style="width:' + baiyaShieldPct + '%"></div>' : '') +
            '<span class="slot-char-bar-text">' + baiyaHp + '/' + baiyaMaxHp + (baiyaShield > 0 ? ' <span class="slot-char-shield">+' + baiyaShield + '</span>' : '') + '</span></div>' +
            '<div class="slot-enemy-stats-row" style="font-size:11px;color:#5c4a3a;margin-top:4px;display:flex;align-items:center;gap:4px">' +
            '<span class="slot-enemy-atk-icon">' + (SKILL_ATTACK_SVG || '') + '</span><span>' + baiyaAtk + '</span><span>·</span>' +
            '<span class="slot-enemy-def-wrap"><span class="slot-enemy-def-icon">' + (SKILL_DEFENSE_SVG || '') + '</span><span>' + baiyaDef + '</span></span></div>' +
            '<div class="slot-char-buffs">' + renderBuffsHtml(ch.buffs || []) + '</div>' +
            '<div class="slot-char-ap"><span class="slot-char-ap-text">行动</span><span class="slot-char-ap-icon">' + AP_FLAME_SVG + '</span><span class="slot-char-ap-value">' + baiyaAp + '</span></div></div>' +
            (baiyaHp <= 0 ? '<div class="slot-defeated-overlay" aria-hidden="true"><span class="slot-defeated-overlay-text">战斗不能</span></div>' : '');
          if (baiyaHp <= 0) {
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
        var maxAp = getApByLevel(level);
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
          '<button type="button" class="slot-swap-btn" title="切换位置" data-ally-slot="' +
          i +
          '">' +
          SWAP_SVG +
          '</button>' +
          '<div class="slot-char-portrait"><img src="' +
          (ch.avatar || '') +
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
          (hp <= 0 ? '<div class="slot-defeated-overlay" aria-hidden="true"><span class="slot-defeated-overlay-text">战斗不能</span></div>' : '');
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
      }
    }
    function renderEnemySlots(optionalEnemies) {
      var enemies = optionalEnemies != null && Array.isArray(optionalEnemies) ? optionalEnemies : getEnemyParty();
      for (var i = 1; i <= 6; i++) {
        var slotEl = document.querySelector('.slot[data-slot="enemy-' + i + '"]');
        if (!slotEl) continue;
        var en = enemies[i - 1];
        if (!en) {
          slotEl.textContent = '空位';
          slotEl.classList.add('slot-enemy');
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
        slotEl.title = name + ' HP ' + hp + '/' + maxHp + (shieldNum > 0 ? ' 护盾' + shieldNum : '') + ' 攻击' + atk + ' 防御' + def;
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
          (shieldNum > 0 ? '<div class="slot-char-bar-shield-edge' + (shieldPct >= 100 ? ' slot-char-bar-shield-edge-full' : '') + '" style="width:' + shieldPct + '%"></div>' : '') +
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
          '<div class="slot-char-buffs">' +
          renderBuffsHtml(en.buffs || []) +
          '</div>' +
          '</div>' +
          (hp <= 0 ? '<div class="slot-defeated-overlay" aria-hidden="true"><span class="slot-defeated-overlay-text">战斗不能</span></div>' : '');
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
    /** 在 slot 上方显示飘字（不放进 slot 内，避免被 render 覆盖），delayMs 后移除 */
    function showFlyOverSlot(slotEl, flyEl, delayMs) {
      if (!slotEl || !flyEl) return;
      var container = getDamageFlyContainer();
      var r = slotEl.getBoundingClientRect();
      flyEl.style.position = 'fixed';
      flyEl.style.left = (r.left + r.width / 2 - 24) + 'px';
      flyEl.style.top = (r.top + 6) + 'px';
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
          imgEl.onload = function () { clearTimeout(loadTimeout); startDurationTimer(); };
          imgEl.onerror = function () { clearTimeout(loadTimeout); startDurationTimer(); };
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
          imgEl.onload = function () { clearTimeout(loadTimeout); startDurationTimer(); };
          imgEl.onerror = function () { clearTimeout(loadTimeout); startDurationTimer(); };
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
    function formatAttackLogLine(attackerName, skillName, targetName, result, baseDamage, attrLabel, mult, finalHp, damageCalcStr) {
      var hitStr = result.hit ? '命中' : '未命中';
      var line =
        attackerName + '使用' + skillName + '对' + targetName + '；' +
        '命中Roll:' + result.rollHit + '/' + result.hitRate + '(' + hitStr + ')；';
      if (!result.hit) return line;
      var critStr = result.crit ? '暴击' : '未暴击';
      var calcStr = damageCalcStr != null ? damageCalcStr : (attrLabel && mult != null ? attrLabel + '×' + mult + '=' + baseDamage : '基础伤害=' + baseDamage);
      var increaseStr = (result.damageIncreaseReasons != null && result.damageIncreaseReasons !== '') ? result.damageIncreaseReasons : '无；';
      line +=
        '暴击Roll:' + result.rollCrit + '/' + result.critRate + '(' + critStr + ')；' +
        '伤害计算:' + calcStr + '；' +
        increaseStr +
        '最终伤害:' + result.finalDamage + '；' + targetName + '剩余Hp:' + (finalHp != null ? finalHp : '') + '；';
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
    function appendCombatLog(text) {
      if (text) console.info('[战斗]', text);
      if (text) appendActionLog(text);
      var el = document.getElementById('battle-combat-log');
      if (!el) return;
      var line = document.createElement('div');
      line.className = 'battle-combat-log-line';
      line.textContent = text;
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
    }
    var PLAYER_BUFF_RESOLVE_MS = 100;
    /** 残暴动力：达芙妮解锁时，每次【重伤】造成伤害后为她回复该伤害 25% 的血量；若有回血则在该槽位播放绿色 +N */
    function healDaphneFor重伤Damage(party, damageFrom重伤) {
      if (!party || !Array.isArray(party) || damageFrom重伤 <= 0) return;
      for (var i = 0; i < party.length; i++) {
        var ch = party[i];
        if (!ch || (ch.name || '') !== '达芙妮') continue;
        var unlocked = ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
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
      /** 结算回合清空所有单位身上的【攻势】与【守势】与本回合攻势守势获得标记；若己方有昼墨且解锁心眼，回合开始获得2层攻势与2层守势。（见切·弹返在进入下一回合玩家行动时清除，以便怪物行动时护盾被打破能反击） */
      function clear攻势守势(p, e) {
        var i, u;
        if (p && p.length) {
          for (i = 0; i < p.length; i++) {
            u = p[i];
            if (u) {
              if (u.本回合已获得攻势守势) u.本回合已获得攻势守势 = false;
              if (u.buffs && u.buffs.length)
                u.buffs = u.buffs.filter(function (x) {
                  var id = (x.id || x.name || '').trim();
                  return id !== '攻势' && id !== '守势';
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
                return id !== '攻势' && id !== '守势';
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
                regenHeal += add;
                curHp = Math.min(maxHp, curHp + layers);
                buff.layers = Math.max(0, layers - 5);
              } else if (id === '重伤' || id === '流血' || id === '燃烧' || id === '中毒') {
                if (id === '重伤') heavyWoundDmg += layers;
                curHp = Math.max(0, curHp - layers);
                buff.layers = Math.max(0, layers - 5);
              } else if (id === '嘲讽') {
                buff.layers = Math.max(0, layers - 1);
              } else if (id === '麻痹' || id === '冻结' || id === '暗蚀' || id === '灵巧' || id === '专注' || id === '精准' || id === '激励' || id === '坚韧' || id === '格挡' || id === '扰魔' || id === '虚弱') {
                buff.layers = Math.max(0, layers - 1);
              } else if (id === '力量强化' || id === '防御强化') {
                buff.layers = Math.max(0, layers - 1);
              }
            }
            unit.hp = curHp;
            damageDealt = Math.max(0, hpBefore - curHp);
            unit.buffs = unit.buffs.filter(function (x) { return (x.layers != null ? parseInt(x.layers, 10) || 0 : 0) > 0; });
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
        if (slot < 6) setTimeout(function () { processSlot(slot + 1); }, PLAYER_BUFF_RESOLVE_MS);
        else setTimeout(function () { processSlot(7); }, PLAYER_BUFF_RESOLVE_MS);
      }
      processSlot(1);
    }
    /** 敌方行动回合：怪物攻击逻辑。支持 单体攻击/群体攻击(AOE)/连击/防御；可通过 window.色色地牢_getEnemyActionType(monster, context) 或 window.色色地牢_ENEMY_ACTION_HANDLERS 扩展。 */
    var ENEMY_ACTION_TYPES = { single_target: '单体攻击', aoe: '群体攻击', multi_hit: '连击', defense: '防御' };
    function getDefaultEnemyActionWeights(monster) {
      var level = (monster && (monster.level || '').toString()) || 'Normal';
      if (level === 'Normal') return { single_target: 40, aoe: 20, multi_hit: 25, defense: 15 };
      return { single_target: 40, aoe: 20, multi_hit: 25, defense: 15 };
    }
    function pickEnemyActionType(monster) {
      if (typeof window !== 'undefined' && typeof window.色色地牢_getEnemyActionType === 'function') {
        var custom = window.色色地牢_getEnemyActionType(monster, { party: getParty(), enemies: getEnemyParty() });
        if (custom && ENEMY_ACTION_TYPES[custom]) return custom;
      }
      var weights = getDefaultEnemyActionWeights(monster);
      var total = weights.single_target + weights.aoe + weights.multi_hit + weights.defense;
      var r = Math.random() * total;
      if (r < weights.single_target) return 'single_target';
      if (r < weights.single_target + weights.aoe) return 'aoe';
      if (r < weights.single_target + weights.aoe + weights.multi_hit) return 'multi_hit';
      return 'defense';
    }
    function applyEnemyAction(monster, actionType, party, enemies, enemySlotNum, onDone) {
      onDone = typeof onDone === 'function' ? onDone : function () {};
      var enemySlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      var atk = Math.max(0, parseInt(monster.atk, 10) || 0);
      var def = Math.max(0, parseInt(monster.def, 10) || 0);
      var name = monster.name || '敌方';
      var targetable = getTargetableAllySlotsForEnemy(party);
      if (actionType === 'defense') {
        var shieldVal = Math.max(0, Math.floor(def * (0.8 + 0.4 * Math.random())));
        if (shieldVal > 0) {
          monster.currentShield = (monster.currentShield != null ? parseInt(monster.currentShield, 10) || 0 : 0) + shieldVal;
          addBuffLayers(monster, '护盾', '护盾', shieldVal);
          appendCombatLog(name + ' 使用防御，获得 ' + shieldVal + ' 点护盾');
          if (enemySlotEl) {
            playAnimationOnSlot(enemySlotEl, 'Recovery4', onDone);
          } else {
            onDone();
          }
        } else {
          onDone();
        }
        return;
      }
      if (targetable.length === 0) {
        onDone();
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
            formatAttackLogLine(name, '单体攻击', ally.name || '己方', result, baseDmg, '攻击', atk > 0 ? (baseDmg / atk).toFixed(2) : null, ally.hp),
          );
          if (!result.hit && ally.name === '黯') try残影步Counter(ally, monster, party, enemies, enemySlotNum);
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
                    formatAttackLogLine(name, '群体攻击', logItem.ally.name || '己方', logItem.result, logItem.baseDmg, '攻击', aoeMultStr, logItem.ally.hp),
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
                  if (!res.hit && item.ally.name === '黯') try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
                  saveBattleData(party, enemies);
                  renderAllySlots(party);
                  renderEnemySlots(enemies);
                  if (!res.hit) playMissEffect(slotEl);
                  idx++;
                  setTimeout(nextAoe, 220);
                });
              } else {
                applyDamageToAllyAndTry弹返(item.ally, monster, res.finalDamage);
                if (!res.hit && item.ally.name === '黯') try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
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
            if (!aoeItem.result.hit && aoeItem.ally.name === '黯') try残影步Counter(aoeItem.ally, monster, party, enemies, enemySlotNum);
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
                    formatAttackLogLine(name, '连击', item.ally.name || '己方', item.result, item.baseDmg, '攻击', multiMultStr, item.ally.hp),
                  );
                  if (!mRes.hit && item.ally.name === '黯') try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
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
              if (!item.result.hit && item.ally.name === '黯') try残影步Counter(item.ally, monster, party, enemies, enemySlotNum);
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
            if (!mItem.result.hit && mItem.ally.name === '黯') try残影步Counter(mItem.ally, monster, party, enemies, enemySlotNum);
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
    var ENEMY_ACTION_LABELS = { single_target: '单体攻击', aoe: '群体攻击', multi_hit: '连击', defense: '防御' };
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
        {
          var actionType = pickEnemyActionType(enemy);
          console.info('[战斗] ' + slot + '号位 ' + (enemy.name || '敌方') + ' 执行 ' + (ENEMY_ACTION_LABELS[actionType] || actionType));
          function afterAction() {
            saveBattleData(party, enemies);
            renderAllySlots(party);
            renderEnemySlots(enemies);
            goNextSlot();
          }
          if (typeof window !== 'undefined' && window.色色地牢_ENEMY_ACTION_HANDLERS && typeof window.色色地牢_ENEMY_ACTION_HANDLERS[actionType] === 'function') {
            window.色色地牢_ENEMY_ACTION_HANDLERS[actionType](enemy, party, enemies, slot, { resolveAttack: resolveAttack, addBuffLayers: addBuffLayers, getTargetableSlotIndices: getTargetableSlotIndices, getDisplayStat: getDisplayStat, getHpFromSta: getHpFromSta, appendCombatLog: appendCombatLog, ENEMY_ACTION_TYPES: ENEMY_ACTION_TYPES });
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
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof onDone === 'function') onDone();
          return;
        }
        var unit = enemies[slot - 1];
        var unitName = unit && (unit.name || '敌方') ? (unit.name || '敌方') : '空';
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
                var layersAfter = (id === '重伤' || id === '流血' || id === '燃烧' || id === '中毒') ? Math.max(0, layers - 5) : Math.max(0, layers - 1);
                if (id === '再生') {
                  var add = Math.min(layers, maxHp - curHp);
                  regenHeal += add;
                  curHp = Math.min(maxHp, curHp + layers);
                  buff.layers = layersAfter;
                  console.info('[战斗] 敌方结算 ' + slot + '号位 【' + id + '】恢复' + layers + '血 减1层 剩余' + layersAfter + '层');
                } else if (id === '重伤' || id === '流血' || id === '燃烧' || id === '中毒') {
                  if (id === '重伤') heavyWoundDmg += layers;
                  curHp = Math.max(0, curHp - layers);
                  buff.layers = layersAfter;
                  console.info('[战斗] 敌方结算 ' + slot + '号位 【' + id + '】造成' + layers + '伤害 减5层 剩余' + layersAfter + '层');
                } else if (id === '嘲讽' || id === '麻痹' || id === '冻结' || id === '暗蚀' || id === '灵巧' || id === '专注' || id === '精准' || id === '激励' || id === '坚韧' || id === '格挡' || id === '扰魔' || id === '虚弱') {
                  buff.layers = layersAfter;
                  console.info('[战斗] 敌方结算 ' + slot + '号位 【' + id + '】减1层 剩余' + layersAfter + '层');
                }
              }
              damageDealt = Math.max(0, hpBefore - curHp);
              unit.hp = curHp;
              if (curHp === 0) unit._justDefeated = true;
              if (heavyWoundDmg > 0) healDaphneFor重伤Damage(party, heavyWoundDmg);
            }
            unit.buffs = unit.buffs.filter(function (x) { return (x.layers != null ? parseInt(x.layers, 10) || 0 : 0) > 0; });
            capUnitBuffs(unit);
          }
        }
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        if (damageDealt > 0) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + slot + '"]');
          if (slotEl) playHitEffect(slotEl, damageDealt);
        }
        if (regenHeal > 0) {
          var healSlotEl = document.querySelector('.slot[data-slot="enemy-' + slot + '"]');
          if (healSlotEl) playHealEffect(healSlotEl, regenHeal);
        }
        var delay = (damageDealt > 0 || regenHeal > 0) ? ENEMY_BUFF_HIT_EFFECT_MS : ENEMY_BUFF_RESOLVE_MS;
        if (slot < 6) setTimeout(function () { processSlot(slot + 1); }, delay);
        else setTimeout(function () { processSlot(7); }, delay);
      }
      processSlot(1);
    }
    /** 判断己方单位是否已战斗不能（hp <= 0），用于禁止使用技能 */
    function isAllyDefeated(unit) {
      if (!unit) return true;
      var hp = unit.name === '白牙'
        ? (unit.hp != null ? Math.min(parseInt(unit.hp, 10) || 0, Math.max(1, parseInt(unit.maxHp, 10) || 1)) : Math.max(1, parseInt(unit.maxHp, 10) || 1))
        : (unit.hp != null ? parseInt(unit.hp, 10) : getHpFromSta(getDisplayStat(unit, 'sta') || 1));
      return (hp || 0) <= 0;
    }
    /** 幽灵舞踏：对单体进行 3 或 4 次攻击判定，每次造成 [Str×系数] 伤害；A 首次命中施加 1 层流血，B 每次命中施加 1 层暗蚀 */
    function executePlayer幽灵舞踏(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill = skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '幽灵舞踏') return;
      var skillAp = 2;
      var maxAp = getApByLevel(attacker.level);
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
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
          applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
          if (result.hit) {
            if (skill.advancement === 'A' && !firstHit流血Done) {
              addBuffLayers(defender, '流血', '流血', 1, attacker);
              firstHit流血Done = true;
            }
            if (skill.advancement === 'B') addBuffLayers(defender, '暗蚀', '暗蚀', 1, attacker);
          }
          var attName = attacker.name || '己方';
          var defName = defender.name || '敌方';
          var multStr = (getDisplayStat(attacker, 'str') || 0) > 0 ? (perHitDamage / (getDisplayStat(attacker, 'str') || 1)).toFixed(2) : null;
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
            playSlashOnSlot(defenderSlotEl, result.hit, applyThisHit);
          });
        } else {
          applyThisHit();
        }
      }
      doOneHit();
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
      var maxAp = getApByLevel(attacker.level);
      var curAp =
        attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足，无法使用该技能');
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
      if (attacker.name === '黯' && (skill.name || '') === '攻击') {
        var un = attacker.specialSkillsUnlocked || [];
        if (un.indexOf('错锋') !== -1) {
          executePlayer错锋Attack(allySlot, enemySlotNum, skillIndex);
          return;
        }
      }
      if (skill.id === '魔龙舞') {
        executePlayer魔龙舞(allySlot, enemySlotNum);
        return;
      }
      if (skill.id === '深渊终结') {
        executePlayer深渊终结(allySlot, enemySlotNum);
        return;
      }
      if (skill.id === '暗蚀之刃') {
        executePlayer暗蚀之刃(allySlot, enemySlotNum);
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
      var 攻势N = 0; var 守势N = 0;
      (attacker.buffs || []).forEach(function (b) {
        if ((b.id || b.name) === '攻势') 攻势N = parseInt(b.layers, 10) || 0;
        if ((b.id || b.name) === '守势') 守势N = parseInt(b.layers, 10) || 0;
      });
      if (skill.id === '一闪') {
        if (攻势N === 5 && 守势N === 5) { baseDamage = Math.floor(baseDamage * 1.5); attacker.一闪必中 = true; }
        else if (攻势N === 5) baseDamage = Math.floor(baseDamage * 1.2);
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
        applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
        var maxAp = getApByLevel(attacker.level);
        var curAp =
          attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
        attacker.currentAp = Math.max(0, curAp - skillAp);
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
            var gs攻 = 0; var gs守 = 0;
            (attacker.buffs || []).forEach(function (b) {
              if ((b.id || b.name) === '攻势') gs攻 = parseInt(b.layers, 10) || 0;
              if ((b.id || b.name) === '守势') gs守 = parseInt(b.layers, 10) || 0;
            });
            if (gs攻 > gs守) addBuffLayers(attacker, '攻势', '攻势', 1);
          } else if (skill.advancement === 'B') {
            var shVal = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 0.5));
            attacker.currentShield = (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shVal;
            if (shVal > 0) addBuffLayers(attacker, '护盾', '护盾', shVal);
            var gs守2 = 0; var gs攻2 = 0;
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
          var 攻5 = 0; var 守5 = 0;
          (attacker.buffs || []).forEach(function (b) {
            if ((b.id || b.name) === '攻势') 攻5 = parseInt(b.layers, 10) || 0;
            if ((b.id || b.name) === '守势') 守5 = parseInt(b.layers, 10) || 0;
          });
          if (攻5 === 5 && 守5 === 5) {
            var sh一闪 = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 2.5));
            if (sh一闪 > 0) {
              attacker.currentShield = (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪;
              addBuffLayers(attacker, '护盾', '护盾', sh一闪);
            }
          } else if (守5 === 5) {
            var sh一闪 = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 1.5));
            if (sh一闪 > 0) {
              attacker.currentShield = (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪;
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
            else { addBuffLayers(defender, '破甲', '破甲', 1); addBuffLayers(defender, '缴械', '缴械', 1); }
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
          if (skill.advancement === 'A') { multStr = 1.0; multAgi = 0.5; }
          if (skill.advancement === 'B') { multStr = 0.8; multAgi = 0.4; }
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
          formatAttackLogLine(attName, skillName, defName, result, baseDamage, damageCalcStr ? null : '力量', mult, defender.hp, damageCalcStr),
        );
        if (typeof window.toastr !== 'undefined') window.toastr.success(result.message);
        if (result.hit && defender.hp === 0 && (skill.name || '') === '斩杀' && skill.advancement === 'A') {
          var wwIdx = -1;
          if (attacker.skills && attacker.skills.length) {
            for (var w = 0; w < attacker.skills.length; w++) {
              if ((attacker.skills[w].name || '') === '狼式旋风') { wwIdx = w; break; }
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
        var result = resolveAttack(attacker, defender, baseDamage, true);
        if (result.crit && attacker.纳刀共鸣暴击加成 != null) {
          result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
          attacker.纳刀共鸣暴击加成 = null;
        }
        applyAttackResult(result);
      }
      var isAttackSkill = (skill.name || '') === '攻击';
      if (isAttackSkill) {
        var result = resolveAttack(attacker, defender, baseDamage, true);
        if (result.crit && attacker.纳刀共鸣暴击加成 != null) {
          result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
          attacker.纳刀共鸣暴击加成 = null;
        }
        playStrikeShake(attackerSlotEl, defenderSlotEl, function () {
          playSlashOnSlot(defenderSlotEl, result.hit, function () {
            applyAttackResult(result);
          });
        });
      } else {
        var result = resolveAttack(attacker, defender, baseDamage, true);
        if (result.crit && attacker.纳刀共鸣暴击加成 != null) {
          result.finalDamage = Math.max(1, Math.floor(result.finalDamage * (1 + attacker.纳刀共鸣暴击加成)));
          attacker.纳刀共鸣暴击加成 = null;
        }
        var animKey = (skill.name || '') === '遒劲猛击' ? 'Claw' : (skill.name || '') === '斩月' || (skill.name || '') === '居合' ? 'Slash5' : (skill.name || '') === '斩杀' ? 'E-blood1' : (skill.id === '狼群围猎' || (skill.name || '') === '狼群围猎') ? 'ClawSpecial2' : (skill.id === '错金') ? 'Slash5' : (skill.id === '一闪' || skill.id === '无拍子') ? 'E-sword6' : null;
        if (animKey) {
          var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
          playStrikeShake(attackerSlotEl, slotEl, function () {
            playAnimationOnSlot(slotEl, animKey, function () {
              applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
              var maxAp = getApByLevel(attacker.level);
              var curAp =
                attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
              attacker.currentAp = Math.max(0, curAp - skillAp);
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
                  var gs攻A = 0; var gs守A = 0;
                  (attacker.buffs || []).forEach(function (b) {
                    if ((b.id || b.name) === '攻势') gs攻A = parseInt(b.layers, 10) || 0;
                    if ((b.id || b.name) === '守势') gs守A = parseInt(b.layers, 10) || 0;
                  });
                  if (gs攻A > gs守A) addBuffLayers(attacker, '攻势', '攻势', 1);
                } else if (skill.advancement === 'B') {
                  var shValB = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 0.5));
                  attacker.currentShield = (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shValB;
                  if (shValB > 0) addBuffLayers(attacker, '护盾', '护盾', shValB);
                  var gs守B = 0; var gs攻B = 0;
                  (attacker.buffs || []).forEach(function (b) {
                    if ((b.id || b.name) === '守势') gs守B = parseInt(b.layers, 10) || 0;
                    if ((b.id || b.name) === '攻势') gs攻B = parseInt(b.layers, 10) || 0;
                  });
                  if (gs守B > gs攻B) addBuffLayers(attacker, '守势', '守势', 1);
                }
                attacker.本回合已获得攻势守势 = true;
              }
              if (skill.id === '一闪') attacker.一闪必中 = null;
              if (skill.id === '无拍子') attacker.无拍子必中 = null;
              if (skill.id === '一闪') {
                var 攻5a = 0; var 守5a = 0;
                (attacker.buffs || []).forEach(function (b) {
                  if ((b.id || b.name) === '攻势') 攻5a = parseInt(b.layers, 10) || 0;
                  if ((b.id || b.name) === '守势') 守5a = parseInt(b.layers, 10) || 0;
                });
                if (攻5a === 5 && 守5a === 5) {
                  var sh一闪a = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 2.5));
                  if (sh一闪a > 0) {
                    attacker.currentShield = (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪a;
                    addBuffLayers(attacker, '护盾', '护盾', sh一闪a);
                  }
                } else if (守5a === 5) {
                  var sh一闪a = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * 1.5));
                  if (sh一闪a > 0) {
                    attacker.currentShield = (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + sh一闪a;
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
      var skill = skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '残影步') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
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
      if (skill.advancement === 'A') { multStr = 0.5; 流血 = true; }
      if (skill.advancement === 'B') { multStr = 0.2; multInt = 0.3; 暗蚀 = true; }
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
      var skill = skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '血舞枪刃') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
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
      var result = resolveAttack(attacker, defender, baseDamage, true, skill.advancement === 'B' ? { magicOnly: true } : undefined);
      applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
      attacker.currentAp = Math.max(0, curAp - skillAp);
      if (result.hit) {
        addBuffLayers(defender, '流血', '流血', 1, attacker);
        if (skill.advancement === 'B') addBuffLayers(defender, '暗蚀', '暗蚀', 1, attacker);
      }
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      var attName = attacker.name || '黯';
      var defName = defender.name || '敌方';
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var int = getDisplayStat(attacker, 'int') || 0;
      var fStr = Math.floor(str * 0.8);
      var fSecond = skill.advancement === 'B' ? Math.floor(int * 0.4) : Math.floor(agi * 0.4);
      var baseForFormula = fStr + fSecond;
      var damageCalcStr = skill.advancement === 'B'
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
      appendCombatLog(formatAttackLogLine(attName, '血舞枪刃', defName, result, baseDamage, null, null, defender.hp, damageCalcStr));
      var defenderSlotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      if (defenderSlotEl) {
        if (!result.hit) playMissEffect(defenderSlotEl);
      }
      if (typeof window.toastr !== 'undefined') window.toastr.info(result.hit ? '造成 ' + result.finalDamage + ' 点伤害' : '未命中');
    }
    /** 暗夜帷幕：不选目标，对敌方全体造成魔法伤害；A 施加虚弱并设 2 回合末伤害，B 对命中目标施加暗蚀 */
    function executePlayer暗夜帷幕(allySlot, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      if (!attacker || attacker.name !== '黯' || isAllyDefeated(attacker)) return;
      var skill = skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || (skill.name || '') !== '暗夜帷幕') return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var maxAp = getApByLevel(attacker.level);
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : maxAp;
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
      for (var t = 0; t < targets.length; t++) {
        var def = targets[t].defender;
        var res = targets[t].result;
        applyDamageToTarget(def, res.finalDamage, res.shadowDamage ? { shadowDamage: res.shadowDamage } : undefined);
        if (skill.advancement === 'A') {
          addBuffLayers(def, '虚弱', '虚弱', 2);
        } else if (skill.advancement === 'B' && res.hit) {
          addBuffLayers(def, '暗蚀', '暗蚀', 2, attacker);
        }
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
      var attName = attacker.name || '黯';
      appendCombatLog(attName + ' 使用暗夜帷幕，对敌方全体造成魔法伤害');
      for (var t = 0; t < targets.length; t++) {
        var slotEl = document.querySelector('.slot[data-slot="enemy-' + targets[t].slotNum + '"]');
        if (slotEl) {
          if (!targets[t].result.hit) playMissEffect(slotEl);
        }
      }
      if (typeof window.toastr !== 'undefined') window.toastr.success('暗夜帷幕 释放完毕');
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
        }
      }
      appendCombatLog('暗夜帷幕·窒息迷雾：回合结束时敌方全体受到 ' + dmg + ' 点魔法伤害');
      saveBattleData(getParty(), enemies);
      renderAllySlots(getParty());
      renderEnemySlots(enemies);
      暗夜帷幕A_State.roundsLeft--;
      if (暗夜帷幕A_State.roundsLeft <= 0) 暗夜帷幕A_State = null;
    }
    /** 魔龙舞：3 + floor(Agi/8) 次判定，每次 [Agi×0.4] 物理伤害 */
    function executePlayer魔龙舞(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || attacker.name !== '黯' || isAllyDefeated(attacker)) return;
      var list = getSpecialSkillsForChar(attacker);
      var skill = list.filter(function (s) { return s.id === '魔龙舞'; })[0];
      if (!skill) return;
      var skillAp = skill.ap != null ? skill.ap : 3;
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : 0;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var numHits = 3 + Math.floor(agi / 8);
      var perHit = Math.max(0, Math.floor(agi * 0.4));
      var hitIdx = 0;
      function doOneHit() {
        if (hitIdx >= numHits) {
          attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof window.toastr !== 'undefined') window.toastr.success('魔龙舞 释放完毕');
          return;
        }
        var result = resolveAttack(attacker, defender, perHit, true);
        applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
        appendCombatLog(formatAttackLogLine(attacker.name || '黯', '魔龙舞', defender.name || '敌方', result, perHit, '敏捷', '0.4', defender.hp));
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
        if (slotEl && !result.hit) playMissEffect(slotEl);
        hitIdx++;
        setTimeout(doOneHit, result.hit ? 220 : 920);
      }
      doOneHit();
    }
    /** 深渊终结：单体 [Int×2] 魔法，每层暗蚀+20%伤害（最高+60%），施放后清空目标暗蚀 */
    function executePlayer深渊终结(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || attacker.name !== '黯' || isAllyDefeated(attacker)) return;
      var list = getSpecialSkillsForChar(attacker);
      var skill = list.filter(function (s) { return s.id === '深渊终结'; })[0];
      if (!skill) return;
      var skillAp = skill.ap != null ? skill.ap : 2;
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : 0;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var 暗蚀L = 0;
      (defender.buffs || []).forEach(function (b) { if ((b.id || b.name) === '暗蚀') 暗蚀L = Math.max(0, parseInt(b.layers, 10) || 0); });
      var mult = 1 + Math.min(3, 暗蚀L) * 0.2;
      baseDamage = Math.max(0, Math.floor(baseDamage * mult));
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
      defender.buffs = (defender.buffs || []).filter(function (b) { return (b.id || b.name) !== '暗蚀'; });
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(formatAttackLogLine(attacker.name || '黯', '深渊终结', defender.name || '敌方', result, baseDamage, null, null, defender.hp, '智力×2.0=' + baseDamage));
      var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      if (slotEl && !result.hit) playMissEffect(slotEl);
      if (typeof window.toastr !== 'undefined') window.toastr.info(result.hit ? '造成 ' + result.finalDamage + ' 点伤害' : '未命中');
    }
    /** 暗蚀之刃：单体 [Int×0.8] 魔法，2层暗蚀；若目标已有暗蚀则再加1层碎魔 */
    function executePlayer暗蚀之刃(allySlot, enemySlotNum) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || attacker.name !== '黯' || isAllyDefeated(attacker)) return;
      var list = getSpecialSkillsForChar(attacker);
      var skill = list.filter(function (s) { return s.id === '暗蚀之刃'; })[0];
      if (!skill) return;
      var skillAp = skill.ap != null ? skill.ap : 1;
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : 0;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var baseDamage = Math.max(0, Math.floor(getBaseDamageForSkill(attacker, skill)));
      var result = resolveAttack(attacker, defender, baseDamage, true, { magicOnly: true });
      applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
      if (result.hit) {
        var had暗蚀 = (defender.buffs || []).some(function (b) { return ((b.id || b.name) === '暗蚀') && ((parseInt(b.layers, 10) || 0) > 0); });
        addBuffLayers(defender, '暗蚀', '暗蚀', 2, attacker);
        if (had暗蚀) addBuffLayers(defender, '碎魔', '碎魔', 1);
      }
      attacker.currentAp = Math.max(0, curAp - skillAp);
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
      appendCombatLog(formatAttackLogLine(attacker.name || '黯', '暗蚀之刃', defender.name || '敌方', result, baseDamage, null, null, defender.hp, '智力×0.8=' + baseDamage));
      var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
      if (slotEl && !result.hit) playMissEffect(slotEl);
      if (typeof window.toastr !== 'undefined') window.toastr.info(result.hit ? '造成 ' + result.finalDamage + ' 点伤害' : '未命中');
    }
    /** 错锋：黯的【攻击】变为 3 次判定，每次 [Str×0.3] */
    function executePlayer错锋Attack(allySlot, enemySlotNum, skillIndex) {
      var party = getParty();
      var enemies = getEnemyParty();
      var attacker = party[allySlot - 1];
      var defender = enemies[enemySlotNum - 1];
      if (!attacker || !defender || isAllyDefeated(attacker)) return;
      var skill = attacker.skills && attacker.skills[skillIndex];
      if (!skill || (skill.name || '') !== '攻击') return;
      var skillAp = 1;
      var curAp = attacker.currentAp !== undefined && attacker.currentAp !== null ? parseInt(attacker.currentAp, 10) : 0;
      if (curAp < skillAp) {
        if (typeof window.toastr !== 'undefined') window.toastr.warning('AP 不足');
        return;
      }
      var perHit = Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 0.3));
      var hitIdx = 0;
      function doOne() {
        if (hitIdx >= 3) {
          attacker.currentAp = Math.max(0, curAp - skillAp);
          saveBattleData(party, enemies);
          renderAllySlots(party);
          renderEnemySlots(enemies);
          if (typeof window.toastr !== 'undefined') window.toastr.success('错锋·攻击 完毕');
          return;
        }
        var result = resolveAttack(attacker, defender, perHit, true);
        applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
        appendCombatLog(formatAttackLogLine(attacker.name || '黯', '攻击（错锋）', defender.name || '敌方', result, perHit, '力量', '0.3', defender.hp));
        saveBattleData(party, enemies);
        renderAllySlots(party);
        renderEnemySlots(enemies);
        var slotEl = document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]');
        if (slotEl && !result.hit) playMissEffect(slotEl);
        hitIdx++;
        setTimeout(doOne, result.hit ? 220 : 920);
      }
      doOne();
    }
    /** 使用防御/剑脊格挡等给自己加盾的技能：不选目标，在己方角色上播放 Recovery4 护盾动画并添加护盾、扣除 AP */
    function executePlayerDefense(allySlot, skillIndex) {
      var party = getParty();
      var attacker = party[allySlot - 1];
      if (!attacker) return;
      if (isAllyDefeated(attacker)) return;
      var skill =
        skillIndex >= 0 && attacker.skills && attacker.skills[skillIndex] ? attacker.skills[skillIndex] : null;
      if (!skill || ((skill.name || '') !== '防御' && (skill.name || '') !== '剑脊格挡' && (skill.name || '') !== '见切')) return;
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
        shieldValue = (skill.name === '防御' || (skill.name || '') === '见切') ? Math.max(0, getDisplayStat(attacker, 'def') || 0) : 0;
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
      if ((skill.name || '') === '见切') logMsg += '，获得' + (skill.advancement === 'B' ? '3' : '2') + '层【守势】' + (skill.advancement === 'B' ? '、1层【坚韧】' : '') + (skill.advancement === 'A' ? '（弹返）' : '');
      appendCombatLog(logMsg);
      if (typeof window.toastr !== 'undefined') window.toastr.success('获得 ' + shieldValue + ' 点护盾');
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
        var b = (unit.buffs || []).find(function (x) { return (x.id || x.name) === id; });
        return b ? (parseInt(b.layers, 10) || 0) : 0;
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
        attacker.buffs = (attacker.buffs || []).filter(function (b) { return (b.id || b.name) !== '守势'; });
        if (converted > 0) addBuffLayers(attacker, '攻势', '攻势', converted);
        attacker.纳刀下次伤害加成 = converted * damagePct;
        logParts.push('消耗' + converted + '层【守势】转化为' + converted + '层【攻势】，下次攻击伤害+' + attacker.纳刀下次伤害加成 + '%');
        if (isA && (攻势 + converted) > 8) {
          addBuffLayers(attacker, '力量强化', '力量强化', 3);
          logParts.push('获得3层【力量强化】持续3回合');
        }
      } else if (守势 > 攻势) {
        var converted2 = 攻势;
        attacker.buffs = (attacker.buffs || []).filter(function (b) { return (b.id || b.name) !== '攻势'; });
        if (converted2 > 0) addBuffLayers(attacker, '守势', '守势', converted2);
        var shVal = Math.max(0, Math.floor((getDisplayStat(attacker, 'def') || 0) * defMult * converted2));
        if (shVal > 0) {
          attacker.currentShield = (attacker.currentShield != null ? parseInt(attacker.currentShield, 10) || 0 : 0) + shVal;
          addBuffLayers(attacker, '护盾', '护盾', shVal);
        }
        logParts.push('消耗' + converted2 + '层【攻势】转化为' + converted2 + '层【守势】' + (shVal > 0 ? '，获得' + shVal + '护盾' : ''));
        if (isA && (守势 + converted2) > 8) {
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
      var 攻势B = 0; var 守势B = 0;
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
            appendCombatLog(formatAttackLogLine(attacker.name || '昼墨', '白夜（双势）', t.def.name || '敌方', t.result, baseDmgBoth, null, null, t.def.hp, '力量×1.2+敏捷×1.2=' + baseDmgBoth));
            continue;
          }
          var roll = roll1To100();
          if (roll <= 即死率) {
            var maxHp = t.def.maxHp != null ? parseInt(t.def.maxHp, 10) : 100;
            var shield = t.def.currentShield != null ? Math.max(0, parseInt(t.def.currentShield, 10) || 0) : 0;
            // 即死：跳过一次自动飘字，改为在动画回调里显示“即死”
            t.def._skipDamageNumberOnce = true;
            applyDamageToTarget(t.def, (t.def.hp != null ? parseInt(t.def.hp, 10) : maxHp) + shield + 1);
            appendCombatLog((attacker.name || '昼墨') + '使用白夜（双势）对' + (t.def.name || '敌方') + '；即死判定：Roll ' + roll + '/100(≤幸运×5%=' + 即死率 + '%，即死成功)；' + (t.def.name || '敌方') + '剩余Hp:0；');
          } else {
            applyDamageToTarget(t.def, t.result.finalDamage, t.result.shadowDamage ? { shadowDamage: t.result.shadowDamage } : undefined);
            var fullLine = formatAttackLogLine(attacker.name || '昼墨', '白夜（双势）', t.def.name || '敌方', t.result, baseDmgBoth, null, null, t.def.hp, '力量×1.2+敏捷×1.2=' + baseDmgBoth);
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
        var baiyaLog = formatAttackLogLine(attacker.name || '昼墨', '白夜（汇聚）', def.name || '敌方', res, baseD, null, null, def.hp, '力量×1.2+敏捷×1.2=' + baseD);
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
      var baseDmg = 守势B >= 10 ? (str * 0.75 + agi * 0.75) : (str * 0.5 + agi * 0.5);
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
        appendCombatLog(formatAttackLogLine(attacker.name || '昼墨', '白夜', t.def.name || '敌方', t.result, baseDmg, null, null, t.def.hp, baseDmgCalcStr));
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
      appendCombatLog(
        (attacker.name || '己方') + ' 使用威慑怒吼，获得2层【嘲讽】与 ' + shieldValue + ' 点护盾',
      );
      if (typeof window.toastr !== 'undefined') window.toastr.success('获得2层【嘲讽】与 ' + shieldValue + ' 点护盾');
      var slotNum = allySlot;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var allySlotEl = document.querySelector('.slot[data-slot="ally-' + slotNum + '"]');
          if (allySlotEl) playAnimationOnSlot(allySlotEl, 'Recovery4', function () {});
        });
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
      var curAp =
        daphne.currentAp !== undefined && daphne.currentAp !== null ? parseInt(daphne.currentAp, 10) : maxAp;
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
      var enemyRow = selectedRowLeftSlot === 1 ? [1, 2] : selectedRowLeftSlot === 3 ? [3, 4] : selectedRowLeftSlot === 5 ? [5, 6] : [];
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
          applyDamageToTarget(t.def, t.result.finalDamage, t.result.shadowDamage ? { shadowDamage: t.result.shadowDamage } : undefined);
          appendCombatLog(
            formatAttackLogLine('白牙', '横扫', t.def.name || '敌方', t.result, baseDamage, null, null, t.def.hp, '攻击×0.6=' + baseDamage),
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
        applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
        if (!options.free) baiya.currentAp = Math.max(0, curAp - needAp);
        if (result.hit) addBuffLayers(defender, '重伤', '重伤', 1);
        saveBattleData(getParty(), getEnemyParty());
        renderAllySlots(getParty());
        renderEnemySlots(getEnemyParty());
        if (defenderSlotEl && !result.hit) playMissEffect(defenderSlotEl);
        appendCombatLog(
          formatAttackLogLine('白牙', '撕咬', defender.name || '敌方', result, baseDamage, null, null, defender.hp, '攻击×1.0=' + baseDamage),
        );
        if (typeof window.toastr !== 'undefined') window.toastr.success(result.message);
      }
      if (defenderSlotEl) {
        playAnimationOnSlot(defenderSlotEl, 'ACQ011_Bite', afterBiteAnim);
      } else {
        afterBiteAnim();
      }
    }
    /** 给单位增加 buff 层数（若无该 buff 则新增）。会按 BUFF_DEFINITIONS 的 maxLayers 封顶；有上限的 buff 施加后也会统一校正。麻痹累计3层时消耗3层并施加1层眩晕。fromChar 可选，用于 黯·暗影渗透：对带暗蚀目标施加流血时层数+50%；对带流血目标施加暗蚀时+1层。 */
    function addBuffLayers(unit, buffId, buffName, layers, fromChar) {
      if (!unit || layers <= 0) return;
      var has暗影渗透 = fromChar && fromChar.name === '黯' && fromChar.specialSkillsUnlocked && fromChar.specialSkillsUnlocked.indexOf('暗影渗透') !== -1;
      if (has暗影渗透 && buffId === '流血') {
        var 暗蚀L = 0;
        (unit.buffs || []).forEach(function (b) { if ((b.id || b.name) === '暗蚀') 暗蚀L = Math.max(0, parseInt(b.layers, 10) || 0); });
        if (暗蚀L > 0) layers = Math.max(1, Math.floor(layers * 1.5));
      }
      if (has暗影渗透 && buffId === '暗蚀') {
        var 流血L = 0;
        (unit.buffs || []).forEach(function (b) { if ((b.id || b.name) === '流血') 流血L = Math.max(0, parseInt(b.layers, 10) || 0); });
        if (流血L > 0) layers += 1;
      }
      unit.buffs = unit.buffs || [];
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
        var ma = unit.buffs.find(function (b) { return (b.id || b.name) === '麻痹'; });
        var mal = ma ? Math.max(0, parseInt(ma.layers, 10) || 0) : 0;
        if (mal >= 3) {
          ma.layers = 0;
          addBuffLayers(unit, '眩晕', '眩晕', 1);
        }
      }
    }
    /** 对目标施加伤害：优先扣除护盾，护盾不足时再扣 HP；会同步扣减【护盾】buff 层数。opts 可选：{ shadowDamage } 当为 黯 被动暗影伤害时，先显示 (damage-shadowDamage) 红色，100ms 后显示 shadowDamage 紫色。 */
    function applyDamageToTarget(unit, damage, opts) {
      if (!unit || damage == null || damage <= 0) return;
      // 为自动飘字定位提供稳定标识（避免 getParty/getEnemyParty 返回新对象导致引用不一致）
      if (unit && !unit._damageFxUid) unit._damageFxUid = 'u' + Math.random().toString(36).slice(2) + Date.now();
      var shield = unit.currentShield != null ? Math.max(0, parseInt(unit.currentShield, 10) || 0) : 0;
      var absorb = Math.min(damage, shield);
      var toHp = Math.max(0, damage - absorb);
      unit.currentShield = Math.max(0, shield - damage);
      if (unit.buffs && absorb > 0) {
        var sh = unit.buffs.find(function (b) { return (b.id || b.name) === '护盾'; });
        if (sh) {
          sh.layers = Math.max(0, (sh.layers || 0) - absorb);
          if (sh.layers <= 0) unit.buffs = unit.buffs.filter(function (b) { return (b.id || b.name) !== '护盾'; });
        }
      }
      var curHp = unit.hp != null ? parseInt(unit.hp, 10) : (unit.maxHp != null ? parseInt(unit.maxHp, 10) : (typeof getHpFromSta === 'function' && typeof getDisplayStat === 'function' ? getHpFromSta(getDisplayStat(unit, 'sta') || 1) : 100));
      unit.hp = Math.max(0, curHp - toHp);
      if (unit.hp === 0 && curHp > 0) unit._justDefeated = true;
      // 统一掉血显示：默认所有伤害都会显示「-N」
      // 如需手动控制（例如显示“即死”文本），可在调用前设置 unit._skipDamageNumberOnce = true 来跳过一次自动飘字。
      if (unit && unit._skipDamageNumberOnce) {
        unit._skipDamageNumberOnce = false;
        return;
      }
      if (damage > 0 && typeof getParty === 'function' && typeof getEnemyParty === 'function') {
        var shadowDamage = (opts && opts.shadowDamage) ? Math.max(0, parseInt(opts.shadowDamage, 10) || 0) : 0;
        var physicalPart = shadowDamage > 0 ? Math.max(0, damage - shadowDamage) : damage;
        // 通过 microtask 延后到本次同步 render 结束后再插入飘字，避免被 render 的 innerHTML 覆盖
        Promise.resolve().then(function () {
          var party = getParty();
          var enemies = getEnemyParty();
          var slotEl = null;
          if (party && party.length) {
            for (var p = 0; p < party.length; p++) {
              if (party[p] === unit || (unit && unit._damageFxUid && party[p] && party[p]._damageFxUid === unit._damageFxUid)) {
                slotEl = document.querySelector('.slot[data-slot="ally-' + (p + 1) + '"]');
                break;
              }
            }
          }
          if (!slotEl && enemies && enemies.length) {
            for (var q = 0; q < enemies.length; q++) {
              if (enemies[q] === unit || (unit && unit._damageFxUid && enemies[q] && enemies[q]._damageFxUid === unit._damageFxUid)) {
                slotEl = document.querySelector('.slot[data-slot="enemy-' + (q + 1) + '"]');
                break;
              }
            }
          }
          if (slotEl) {
            if (shadowDamage > 0 && physicalPart > 0) {
              playHitEffect(slotEl, physicalPart);
              setTimeout(function () { playHitEffect(slotEl, shadowDamage, 'shadow'); }, 100);
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
      applyDamageToTarget(monster, dmg);
      if (r.流血) addBuffLayers(monster, '流血', '流血', 1, ally);
      if (r.暗蚀) addBuffLayers(monster, '暗蚀', '暗蚀', 1, ally);
      appendCombatLog((ally.name || '黯') + '残影步反击对' + (monster.name || '敌方') + '；最终伤害:' + dmg + '；' + (monster.name || '敌方') + '剩余Hp:' + (monster.hp != null ? monster.hp : '') + '；');
      saveBattleData(party, enemies);
      renderAllySlots(party);
      renderEnemySlots(enemies);
    }
    /** 对己方单位施加伤害，若护盾被本次攻击打空且该单位有见切·弹返则对攻击者进行反击 */
    function applyDamageToAllyAndTry弹返(ally, attackerEnemy, finalDamage) {
      var shieldBefore = ally.currentShield != null ? Math.max(0, parseInt(ally.currentShield, 10) || 0) : 0;
      applyDamageToTarget(ally, finalDamage);
      if (shieldBefore > 0 && (ally.currentShield || 0) === 0 && ally.见切弹返 && attackerEnemy) {
        ally.见切弹返 = false;
        var counterDmg = Math.max(0, Math.floor((getDisplayStat(ally, 'str') || 0) * 0.6));
        if (counterDmg > 0 && (parseInt(attackerEnemy.hp, 10) || 0) > 0) {
          var enemies = getEnemyParty();
          var enemySlotNum = 0;
          for (var ei = 0; ei < (enemies && enemies.length); ei++) { if (enemies[ei] === attackerEnemy) { enemySlotNum = ei + 1; break; } }
          var enemySlotEl = enemySlotNum ? document.querySelector('.slot[data-slot="enemy-' + enemySlotNum + '"]') : null;
          if (enemySlotEl) {
            playAnimationOnSlot(enemySlotEl, 'E-sword6', function () {
              applyDamageToTarget(attackerEnemy, counterDmg);
              appendCombatLog((ally.name || '己方') + '见切·弹返对' + (attackerEnemy.name || '敌方') + '；最终伤害:' + counterDmg + '；' + (attackerEnemy.name || '敌方') + '剩余Hp:' + (attackerEnemy.hp != null ? attackerEnemy.hp : '') + '；');
              saveBattleData(getParty(), getEnemyParty());
              renderAllySlots(getParty());
              renderEnemySlots(getEnemyParty());
            });
          } else {
            applyDamageToTarget(attackerEnemy, counterDmg);
            appendCombatLog((ally.name || '己方') + '见切·弹返对' + (attackerEnemy.name || '敌方') + '；最终伤害:' + counterDmg + '；' + (attackerEnemy.name || '敌方') + '剩余Hp:' + (attackerEnemy.hp != null ? attackerEnemy.hp : '') + '；');
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
            applyDamageToTarget(defender, result.finalDamage, result.shadowDamage ? { shadowDamage: result.shadowDamage } : undefined);
            var wwAttName = attacker.name || '己方';
            var wwDefName = defender.name || '敌方';
            var wwLv = Math.max(1, parseInt(skill.level, 10) || 1);
            var wwMult = wwLv === 1 ? 0.9 : wwLv === 2 ? 1.0 : wwLv === 3 ? 1.1 : 1.2;
            var wwCalcStr = damageScale !== 1 ? '力量×' + wwMult + '×' + damageScale + '=' + effectiveDamage : '力量×' + wwMult + '=' + effectiveDamage;
            appendCombatLog(
              formatAttackLogLine(wwAttName, '狼式旋风', wwDefName, result, effectiveDamage, null, null, defender.hp, wwCalcStr),
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
          if (typeof window.toastr !== 'undefined') window.toastr.success(options.free ? '斩杀触发 狼式旋风（50% 效果）释放完毕' : '狼式旋风 释放完毕');
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
      var sideAlly = document.querySelector('.side-ally');
      if (sideAlly) sideAlly.classList.add('swap-mode-active');
      for (var k = 1; k <= 6; k++) {
        var el = document.querySelector('.slot[data-slot="ally-' + k + '"]');
        if (!el) continue;
        if (k === fromSlot) el.classList.add('swap-floating');
        else el.classList.add('swap-target');
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
        if (slotNum >= 1 && slotNum <= 6) enterSwapMode(slotNum);
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
            (slotEl.querySelector('.slot-char-portrait img') || slotEl.querySelector('.slot-char-portrait.slot-enemy-portrait-empty'))
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
                  var allyHp = chForAp.name === '白牙'
                    ? (chForAp.hp != null ? Math.min(parseInt(chForAp.hp, 10) || 0, Math.max(1, parseInt(chForAp.maxHp, 10) || 1)) : Math.max(1, parseInt(chForAp.maxHp, 10) || 1))
                    : (chForAp.hp != null ? parseInt(chForAp.hp, 10) : getHpFromSta(getDisplayStat(chForAp, 'sta') || 1));
                  if ((allyHp || 0) <= 0) {
                    if (typeof window.toastr !== 'undefined') window.toastr.warning('该角色已战斗不能，无法使用技能');
                    return;
                  }
                }
                var curAp =
                  chForAp && chForAp.currentAp !== undefined && chForAp.currentAp !== null
                    ? parseInt(chForAp.currentAp, 10)
                    : chForAp
                      ? getApByLevel(chForAp.level)
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
                var opts = [];
                if (ch && ch.skills) {
                  ch.skills.forEach(function (s, idx) {
                    if (s.locked) return;
                    var needAp = s.ap != null ? s.ap : 1;
                    var insufficientAp = curAp < needAp;
                    var advanceOpt =
                      s.advancement && s.advancementOptions
                        ? s.advancementOptions.filter(function (o) {
                            return o.id === s.advancement;
                          })[0]
                        : null;
                    var displayName = advanceOpt ? (s.name || '') + '-' + (advanceOpt.name || '') : s.name || '';
                    var name = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    var ap = s.ap != null ? s.ap : '—';
                    var rawEffect =
                      s.advancementReplacesEffect && advanceOpt && advanceOpt.effect
                        ? advanceOpt.effect
                        : getSkillEffectForLevel(s, s.level || 1);
                    if (ch && ch.name === '黯' && (s.name || '') === '攻击') {
                      var un = ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
                      if (un.indexOf('错锋') !== -1) rawEffect = '进行3次攻击判定，每次造成 [Str × 0.3] 的物理伤害。';
                    }
                    var effectHtml = wrapBuffRefs(resolveSkillEffect(rawEffect, ch));
                    var icon = s.name === '防御' ? SKILL_DEFENSE_SVG : s.name === '剑脊格挡' ? (SKILL_SHIELD_SWORD_SVG || SKILL_DEFENSE_SVG) : s.name === '见切' ? (SKILL_JIANQIE_SVG || SKILL_SHIELD_SWORD_SVG || SKILL_DEFENSE_SVG) : s.name === '居合' ? (SKILL_JUHE_SVG || SKILL_ATTACK_SVG) : s.name === '纳刀' ? (SKILL_NADAO_SVG || SKILL_ATTACK_SVG) : s.name === '斩杀' ? (SKILL_EXECUTE_SVG || SKILL_ATTACK_SVG) : s.name === '遒劲猛击' ? (SKILL_BLADE_BITE_SVG || SKILL_ATTACK_SVG) : s.name === '斩月' ? (SKILL_ZANYUE_SVG || SKILL_BLADE_BITE_SVG || SKILL_ATTACK_SVG) : s.name === '狼式旋风' ? (SKILL_WHIRLWIND_SVG || SKILL_ATTACK_SVG) : (ch.name === '白牙' && s.name === '横扫') ? (SKILL_BAIYA_SWEEP_SVG || SKILL_ATTACK_SVG) : (ch.name === '白牙' && s.name === '撕咬') ? (SKILL_WOLF_PACK_SVG || SKILL_ATTACK_SVG) : SKILL_ATTACK_SVG;
                    opts.push(
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
                    );
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
                    var skTags = (window.色色地牢_character && window.色色地牢_character.getSkillTagsString ? window.色色地牢_character.getSkillTagsString(sk) : (sk.tags || ''));
                    if (skTags.indexOf('被动') !== -1) return;
                    var needAp = sk.ap != null ? sk.ap : 1;
                    var insufficientAp = curAp < needAp;
                    if (sk.id === '白牙！') insufficientAp = insufficientAp || emptyAllySlots.length === 0 || hasBaiyaOnField;
                    var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    var ap = sk.ap != null ? sk.ap : '—';
                    var effectHtml = wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
                    var iconSvg = sk.id === '白牙！' ? (SKILL_BAIYA_SVG || SKILL_ATTACK_SVG) : sk.id === '狼群围猎' ? (SKILL_WOLF_PACK_SVG || SKILL_ATTACK_SVG) : sk.id === '威慑怒吼' ? (SKILL_ROAR_SVG || SKILL_ATTACK_SVG) : sk.id === '错金' ? (SKILL_CUOJIN_SVG || SKILL_ATTACK_SVG) : sk.id === '白夜' ? (SKILL_BAIYE_SVG || SKILL_ATTACK_SVG) : sk.id === '一闪' ? (SKILL_ISHAN_SVG || SKILL_ATTACK_SVG) : sk.id === '心眼' ? (SKILL_XINYAN_SVG || SKILL_ATTACK_SVG) : sk.id === '无拍子' ? (SKILL_MUPAIZI_SVG || SKILL_ATTACK_SVG) : sk.id === '魔龙舞' || sk.id === '深渊终结' || sk.id === '暗蚀之刃' || sk.id === '暗影渗透' || sk.id === '错锋' ? SKILL_ATTACK_SVG : SKILL_ATTACK_SVG;
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
                skillPopupEl.style.left = (right ? x + pad : Math.max(pad, x - (skillPopupEl.offsetWidth || 160) - pad)) + 'px';
                skillPopupEl
                  .querySelectorAll('.skill-popup-opt[data-skill-index], .skill-popup-opt[data-special-id]')
                  .forEach(function (opt) {
                    opt.addEventListener('click', function (ev) {
                      ev.stopPropagation();
                      if (opt.classList.contains('skill-popup-opt-disabled')) return;
                      var idx = opt.getAttribute('data-skill-index');
                      var specialId = opt.getAttribute('data-special-id');
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
                      if (skillName === '暗夜帷幕') {
                        executePlayer暗夜帷幕(allySlot, parseInt(idx, 10));
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
                        var 攻势B = 0; var 守势B = 0;
                        if (att && att.buffs) {
                          att.buffs.forEach(function (b) {
                            if ((b.id || b.name) === '攻势') 攻势B = parseInt(b.layers, 10) || 0;
                            if ((b.id || b.name) === '守势') 守势B = parseInt(b.layers, 10) || 0;
                          });
                        }
                        if (攻势B >= 10 && 守势B < 10 && window.BattleGrid && window.BattleGrid.enterSkillTargetMode) {
                          window.BattleGrid.enterSkillTargetMode(getEnemyParty(), function (slot) { executePlayer白夜(allySlot, slot); });
                        } else {
                          executePlayer白夜(allySlot, null);
                        }
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
        renderAllySlots();
        renderEnemySlots();
        updateBattlePhaseDisplay();
      };
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
          run暗夜帷幕ATick();
          var party = getParty();
          for (var i = 0; i < (party && party.length) ? party.length : 0; i++) {
            var ch = party[i];
            if (!ch) continue;
            var maxAp = (ch.name === '白牙') ? 2 : getApByLevel(ch.level);
            ch.currentAp = maxAp;
            if (ch.见切弹返) ch.见切弹返 = false;
          }
          saveBattleData(party, getEnemyParty());
          renderAllySlots(party);
          renderEnemySlots(getEnemyParty());
          done();
        } else if (next === 'player_resolution') resolvePlayerBuffs(done);
        else if (next === 'enemy_action') resolveEnemyActions(done);
        else if (next === 'enemy_resolution') resolveEnemyBuffs(done);
        else done();
        return next;
      };
      var endTurnBtn = document.getElementById('battle-end-turn-btn');
      if (endTurnBtn) {
        endTurnBtn.addEventListener('click', function () {
          if (getBattlePhase() !== BATTLE_PHASE.PLAYER_ACTION) return;
          if (typeof window.BattleGrid === 'undefined' || typeof window.BattleGrid.advanceBattlePhase !== 'function') return;
          function runToNextPlayerAction() {
            if (getBattlePhase() === BATTLE_PHASE.PLAYER_ACTION) return;
            window.BattleGrid.advanceBattlePhase(runToNextPlayerAction);
          }
          window.BattleGrid.advanceBattlePhase(runToNextPlayerAction);
        });
      }
    }
    if (typeof window !== 'undefined' && window.BattleGrid) window.BattleGrid.resolveAttack = resolveAttack;
  }

  /**
   * 战斗初始化：接收 app 传入的 options，重置后调用 initBattleUI。由 app 在 DOM 就绪时调用。
   * @param {object} options 同 initBattleUI 的 options
   */
  function initBattle(options) {
    if (!options || typeof options.getParty !== 'function' || typeof options.saveBattleData !== 'function') return;
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
    };
  }
})();
