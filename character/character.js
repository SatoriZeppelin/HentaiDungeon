/**
 * 人物数据（属性 + 被动/基础/可升级技能 + 特殊技能列表），集中维护。
 * 立绘由 resource/illustration.js 的 CHARACTER_PORTRAITS 提供，此处不写。
 * 每角色：specialSkills 为可解锁的特殊技能列表，specialSkillsUnlocked 为已解锁 id 数组。
 */
(function () {
  window.CHARACTERS = {
    达芙妮: {
      name: '达芙妮',
      level: 5,
      sta: 10,
      exp: 0,
      str: 12,
      agi: 8,
      int: 3,
      def: 7,
      luk: 5,
      cha: 5,
      bonusStr: 0,
      bonusAgi: 0,
      bonusInt: 0,
      bonusSta: 0,
      bonusDef: 0,
      passiveSkills: [{ name: '狼族血脉', effect: '达芙妮获得 [等级 × 2] 的力量与防御加成。' }],
      skills: [
        {
          name: '攻击',
          ap: 1,
          effect: '对所选单位造成 [Str × 1] 点伤害',
          basic: true,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
        },
        {
          name: '防御',
          ap: 1,
          effect: '对自身给予 [Def × 1] 点护盾，持续到自己的下个回合开始',
          basic: true,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
        },
        {
          name: '狼式旋风',
          ap: 2,
          level: 1,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '群体',
          effectByLevel: [
            '挥舞巨剑横扫战场。对敌方全体造成 [Str × 0.9] 的物理伤害。',
            '挥舞巨剑横扫战场。对敌方全体造成 [Str × 1.0] 的物理伤害。',
            '挥舞巨剑横扫战场。对敌方全体造成 [Str × 1.1] 的物理伤害。',
            '挥舞巨剑横扫战场。对敌方全体造成 [Str × 1.2] 的物理伤害。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '血腥旋风',
              effect:
                '挥舞巨剑横扫战场。对敌方全体造成 [Str × 1.2] 的物理伤害。对所有命中目标施加 [Str × 0.2] 层【重伤】，如果暴击，额外施加 [Str × 0.2] 层【重伤】。',
            },
            {
              id: 'B',
              name: '重点打击',
              effect:
                '挥舞巨剑横扫战场。对敌方全体造成 [Str × 1.2] 的物理伤害。并对主要目标额外造成 [Str × 0.6] 的物理伤害。',
            },
          ],
        },
        {
          name: '剑脊格挡',
          ap: 1,
          level: 1,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
          effectByLevel: [
            '横置巨剑防御。获得 [Def × 0.5 + Str × 0.3] 的护盾。',
            '横置巨剑防御。获得 [Def × 0.6 + Str × 0.3] 的护盾。',
            '横置巨剑防御。获得 [Def × 0.7 + Str × 0.4] 的护盾。',
            '横置巨剑防御。获得 [Def × 0.8 + Str × 0.4] 的护盾。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '反击姿态',
              effect:
                '横置巨剑防御。获得 [Def × 0.8 + Str × 0.4] 的护盾。护盾被攻击破坏时，立即对攻击者进行反击，造成 [Str × 0.6] 的物理伤害。',
            },
            {
              id: 'B',
              name: '磐石之盾',
              effect: '横置巨剑防御。获得 [Def × 1.5] 的护盾。护盾存续期间，受到的伤害降低25%。',
            },
          ],
        },
        {
          name: '遒劲猛击',
          ap: 1,
          level: 1,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effectByLevel: [
            '蓄力后挥出沉重一击。对单体造成 [Str × 1.05] 的物理伤害。',
            '蓄力后挥出沉重一击。对单体造成 [Str × 1.1] 的物理伤害。',
            '蓄力后挥出沉重一击。对单体造成 [Str × 1.15] 的物理伤害。',
            '蓄力后挥出沉重一击。对单体造成 [Str × 1.2] 的物理伤害。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '碎甲',
              effect: '蓄力后挥出沉重一击。对单体造成 [Str × 1.2] 的物理伤害，并施加1层【破甲】。',
            },
            {
              id: 'B',
              name: '撕裂',
              effect: '蓄力后挥出沉重一击。对单体造成 [Str × 1.2] 的物理伤害，并施加 [Str × 0.2] 层【重伤】。',
            },
          ],
        },
        {
          name: '斩杀',
          ap: 2,
          level: 1,
          locked: true,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effectByLevel: [
            '尝试终结敌人。对单体造成 [Str × 1.3] 的物理伤害。如果目标生命值低于30%，造成2倍伤害。',
            '尝试终结敌人。对单体造成 [Str × 1.4] 的物理伤害。如果目标生命值低于30%，造成2倍伤害。',
            '尝试终结敌人。对单体造成 [Str × 1.5] 的物理伤害。如果目标生命值低于30%，造成2倍伤害。',
            '尝试终结敌人。对单体造成 [Str × 1.6] 的物理伤害。如果目标生命值低于30%，造成2倍伤害。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '乘胜追击',
              effect:
                '对单体造成 [Str × 1.6] 的物理伤害。如果目标生命值低于30%，造成2倍伤害。如果成功击杀敌人，释放一次50%效果的【狼式旋风】。',
            },
            {
              id: 'B',
              name: '龟裂创伤',
              effect: '尝试终结敌人。对单体造成 [Str × 1.6] 的物理伤害，施加 [Str × 0.4] 层【重伤】。',
            },
          ],
        },
      ],
      specialSkills: [
        {
          id: '残暴动力',
          name: '残暴动力',
          ap: 0,
          attribute1: '被动',
          attribute2: '',
          attribute3: '',
          effect: '每次【重伤】所造成的伤害会为达芙妮回复伤害量25%的血量。',
        },
        {
          id: '全副武装',
          name: '全副武装',
          ap: 0,
          attribute1: '被动',
          attribute2: '',
          attribute3: '',
          effect: '达芙妮获得 [Str × 0.25] 的额外防御属性（向下取整）。',
        },
        {
          id: '威慑怒吼',
          name: '威慑怒吼',
          ap: 2,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '群体',
          effect:
            '发出震慑敌人的怒吼，获得2层【嘲讽】，并获得 [Def × 1.2] 的护盾，每存在一个敌人，额外获得 [Def × 0.4] 的护盾。',
        },
        {
          id: '狼群围猎',
          name: '狼群围猎',
          ap: 2,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effect:
            '与白牙协同攻击。对单体造成 [Str × 1.5] 的物理伤害。若【白牙】存活，白牙立即对同一目标发动一次免费的【撕咬】。若【白牙】不存在，改为施加2次【重伤】。',
        },
        {
          id: '白牙！',
          name: '白牙！',
          ap: 2,
          attribute1: '召唤',
          attribute2: '',
          attribute3: '',
          effect: '召唤一头巨狼【白牙】，持续至战斗结束。',
        },
      ],
      specialSkillsUnlocked: [],
    },
    普罗安妲: {
      name: '普罗安妲',
      level: 1,
      sta: 8,
      exp: 0,
      str: 2,
      agi: 8,
      int: 20,
      def: 4,
      luk: 8,
      cha: 6,
      passiveSkills: [],
      skills: [
        {
          name: '攻击',
          ap: 1,
          effect: '对所选单位造成 [Str × 1] 点伤害',
          basic: true,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
        },
        {
          name: '防御',
          ap: 1,
          effect: '对自身给予 [Def × 1] 点护盾，持续到自己的下个回合开始',
          basic: true,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
        },
      ],
      specialSkills: [],
      specialSkillsUnlocked: [],
    },
    黯: {
      name: '黯',
      level: 5,
      sta: 6,
      exp: 0,
      str: 8,
      agi: 14,
      int: 8,
      def: 2,
      luk: 5,
      cha: 9,
      bonusStr: 0,
      bonusAgi: 0,
      bonusInt: 0,
      bonusSta: 0,
      bonusDef: 0,
      passiveSkills: [
        {
          name: '暗黑魔枪术',
          effect:
            '黯造成的任何伤害都会额外附带 [Int × 0.4] 的暗影属性魔法伤害。\n黯获得 [Agi × 0.2] 的智力，获得 [Int × 0.2] 的敏捷。',
        },
      ],
      skills: [
        {
          name: '攻击',
          ap: 1,
          effect: '对所选单位造成 [Str × 1] 点伤害',
          basic: true,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
        },
        {
          name: '防御',
          ap: 1,
          effect: '对自身给予 [Def × 1] 点护盾，持续到自己的下个回合开始',
          basic: true,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
        },
        {
          name: '幽灵舞踏',
          ap: 2,
          level: 4,
          advancement: 'B',
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effectByLevel: [
            '踏入残影进行连续突刺。对单体进行3次攻击判定，每次造成 [Str × 0.35] 的物理伤害。',
            '踏入残影进行连续突刺。对单体进行3次攻击判定，每次造成 [Str × 0.4] 的物理伤害。',
            '踏入残影进行连续突刺。对单体进行3次攻击判定，每次造成 [Str × 0.45] 的物理伤害。',
            '踏入残影进行连续突刺。对单体进行3次攻击判定，每次造成 [Str × 0.5] 的物理伤害。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '疾风',
              effect: '对单体进行4次攻击判定，每次造成 [Str × 0.5] 的物理伤害，首次命中时，施加1层【流血】。',
            },
            {
              id: 'B',
              name: '蚀魂',
              effect: '对单体进行3次攻击判定，每次造成 [Str × 0.5] 的物理伤害。每次命中施加1层【暗蚀】。',
            },
          ],
        },
        {
          name: '残影步',
          ap: 1,
          level: 4,
          advancement: 'B',
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
          effectByLevel: [
            '黯获得2层【灵巧】，持续至下回合。成功闪避时，对攻击者造成 [Str × 0.3] 的物理伤害。',
            '黯获得2层【灵巧】，持续至下回合。成功闪避时，对攻击者造成 [Str × 0.4] 的物理伤害。',
            '黯获得3层【灵巧】，持续至下回合。成功闪避时，对攻击者造成 [Str × 0.4] 的物理伤害。',
            '黯获得3层【灵巧】，持续至下回合。成功闪避时，对攻击者造成 [Str × 0.5] 的物理伤害。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '血影',
              effect: '黯获得3层【灵巧】，持续至下回合。成功闪避时，对攻击者造成 [Str × 0.5] 的物理伤害并施加1次【流血】。',
            },
            {
              id: 'B',
              name: '暗袭',
              effect: '黯获得3层【灵巧】，持续至下回合。成功闪避时，对攻击者造成 [Str × 0.2 + Int × 0.3] 的混合伤害并施加1层【暗蚀】。',
            },
          ],
        },
        {
          name: '血舞枪刃',
          ap: 1,
          level: 4,
          advancement: 'B',
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effectByLevel: [
            '以枪尖划开伤口。对单体造成 [Str × 0.5 + Agi × 0.3] 的物理伤害，并施加1次【流血】。',
            '以枪尖划开伤口。对单体造成 [Str × 0.6 + Agi × 0.3] 的物理伤害，并施加1次【流血】。',
            '以枪尖划开伤口。对单体造成 [Str × 0.7 + Agi × 0.4] 的物理伤害，并施加1次【流血】。',
            '以枪尖划开伤口。对单体造成 [Str × 0.8 + Agi × 0.4] 的物理伤害，并施加1次【流血】。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '撕裂',
              effect: '对单体造成 [Str × 0.8 + Agi × 0.4] 的物理伤害，施加1次【流血】。目标每有10层【流血】，此技能伤害+20%（最高+60%）。',
            },
            {
              id: 'B',
              name: '暗影枪刃',
              effect: '对单体造成 [Str × 0.8 + Int × 0.4] 的魔法伤害，施加1次【流血】和1层【暗蚀】。',
            },
          ],
        },
        {
          name: '暗夜帷幕',
          ap: 1,
          level: 4,
          advancement: 'B',
          attribute1: '暗影',
          attribute2: '远程',
          attribute3: '群体',
          effectByLevel: [
            '释放暗属性雾气笼罩战场。对敌方全体造成 [Int × 0.45] 的魔法伤害。',
            '释放暗属性雾气笼罩战场。对敌方全体造成 [Int × 0.5] 的魔法伤害。',
            '释放暗属性雾气笼罩战场。对敌方全体造成 [Int × 0.55] 的魔法伤害。',
            '释放暗属性雾气笼罩战场。对敌方全体造成 [Int × 0.6] 的魔法伤害。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '窒息迷雾',
              effect: '对敌方全体造成 [Int × 0.6] 的魔法伤害，施加2层【虚弱】。2回合内，每回合结束时敌方全体受到 [Int × 0.25] 的魔法伤害。',
            },
            {
              id: 'B',
              name: '蚀影蔓延',
              effect: '对敌方全体造成 [Int × 0.6] 的魔法伤害，对所有命中目标施加2层【暗蚀】。',
            },
          ],
        },
      ],
      specialSkills: [
        {
          id: '魔龙舞',
          name: '魔龙舞',
          ap: 3,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effect: '化作无数残影进行超高速连击。对单体目标进行3次判定，每次造成 [Agi × 0.4] 的物理伤害。黯每拥有8点敏捷，额外追加1次攻击判定。',
        },
        {
          id: '深渊终结',
          name: '深渊终结',
          ap: 2,
          attribute1: '暗影',
          attribute2: '近战',
          attribute3: '单体',
          effect: '集中暗属性魔力进行贯穿。对单体造成 [Int × 2.0] 的魔法伤害。目标身上每有1层【暗蚀】，伤害额外+20%（最高+60%）。施放后消耗目标所有【暗蚀】层数。',
        },
        {
          id: '暗蚀之刃',
          name: '暗蚀之刃',
          ap: 1,
          attribute1: '暗影',
          attribute2: '近战',
          attribute3: '单体',
          effect: '对单体造成 [Int × 0.8] 的魔法伤害，施加2层【暗蚀】。若目标已有【暗蚀】，额外施加1层【碎魔】。',
        },
        {
          id: '暗影渗透',
          name: '暗影渗透',
          ap: 0,
          attribute1: '被动',
          attribute2: '',
          attribute3: '',
          effect: '黯对拥有【暗蚀】的目标施加【流血】时，层数+50%（向下取整）。黯对拥有【流血】的目标施加【暗蚀】时，额外施加1层。',
        },
        {
          id: '错锋',
          name: '错锋',
          ap: 0,
          attribute1: '被动',
          attribute2: '',
          attribute3: '',
          effect: '黯的基础指令【攻击】改为进行3次攻击判定，每次造成 [Str × 0.3] 的物理伤害。',
        },
      ],
      specialSkillsUnlocked: [],
    },
    昼墨: {
      name: '昼墨',
      level: 5,
      sta: 10,
      exp: 0,
      str: 10,
      agi: 12,
      int: 6,
      def: 8,
      luk: 4,
      cha: 6,
      passiveSkills: [
        { name: '刀势流转', effect: '启用【攻势】和【守势】机制。' },
      ],
      skills: [
        {
          name: '攻击',
          ap: 1,
          effect: '对所选单位造成 [Str × 1] 点伤害',
          basic: true,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
        },
        {
          name: '防御',
          ap: 1,
          effect: '对自身给予 [Def × 1] 点护盾，持续到自己的下个回合开始',
          basic: true,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
        },
        {
          name: '斩月',
          ap: 1,
          level: 1,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effectByLevel: [
            '迅捷的横斩。对单体造成 [Str × 0.9] 的物理伤害。获得2层【攻势】。',
            '迅捷的横斩。对单体造成 [Str × 1.0] 的物理伤害。获得2层【攻势】。',
            '迅捷的横斩。对单体造成 [Str × 1.1] 的物理伤害。获得2层【攻势】。',
            '迅捷的横斩。对单体造成 [Str × 1.2] 的物理伤害。获得2层【攻势】。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '疾风斩月',
              effect:
                '迅捷的横斩。对单体造成 [Str × 1.2] 的物理伤害。获得3层【攻势】。若本回合已拥有【守势】，改为造成 [Str × 1.5] 的物理伤害。',
            },
            {
              id: 'B',
              name: '残月',
              effect:
                '迅捷的横斩。对单体造成 [Str × 1.2] 的物理伤害。命中后施加1次【流血】。若【攻势】≥5层，额外施加1层【破甲】。',
            },
          ],
        },
        {
          name: '见切',
          ap: 1,
          level: 1,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
          effectByLevel: [
            '收刀蓄势，进入见切姿态。获得2层【守势】，并获得 [Def × 0.9] 的护盾。',
            '收刀蓄势，进入见切姿态。获得2层【守势】，并获得 [Def × 1.0] 的护盾。',
            '收刀蓄势，进入见切姿态。获得2层【守势】，并获得 [Def × 1.1] 的护盾。',
            '收刀蓄势，进入见切姿态。获得2层【守势】，并获得 [Def × 1.2] 的护盾。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '弹返',
              effect:
                '获得2层【守势】，并获得 [Def × 1.2] 的护盾。本回合内护盾被攻击破坏时，立即对攻击者进行反击，造成 [Str × 0.6] 的物理伤害。',
            },
            {
              id: 'B',
              name: '残心',
              effect: '获得3层【守势】，并获得 [Def × 1.2] 的护盾。和1层【坚韧】。',
            },
          ],
        },
        {
          name: '居合',
          ap: 1,
          level: 1,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effectByLevel: [
            '拔刀斩击。对单体造成 [Str × 0.6 + Agi × 0.3] 的物理伤害。获得1层【攻势】和1层【守势】。',
            '拔刀斩击。对单体造成 [Str × 0.7 + Agi × 0.3] 的物理伤害。获得1层【攻势】和1层【守势】。',
            '拔刀斩击。对单体造成 [Str × 0.7 + Agi × 0.4] 的物理伤害。获得1层【攻势】和1层【守势】。',
            '拔刀斩击。对单体造成 [Str × 0.8 + Agi × 0.4] 的物理伤害。获得1层【攻势】和1层【守势】。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '破',
              effect: '拔刀斩击。对单体造成 [Str × 1.0 + Agi × 0.5]。若【攻势】>【守势】，额外获得1层【攻势】。',
            },
            {
              id: 'B',
              name: '守',
              effect: '攻击后获得 [Def × 0.5] 的护盾。若【守势】>【攻势】，额外获得1层【守势】。',
            },
          ],
        },
        {
          name: '纳刀',
          ap: 1,
          level: 1,
          locked: false,
          attribute1: '增益',
          attribute2: '自身',
          attribute3: '单体',
          effectByLevel: [
            '调整呼吸，转化刀势。\n若【攻势】>【守势】：消耗所有【守势】转化为等量【攻势】，下一次攻击伤害提升[转化层数×5%]。\n若【守势】>【攻势】：消耗所有【攻势】转化为等量【守势】，获得[Def×0.1×转化层数]护盾。\n若【攻势】=【守势】：获得1层【攻势】和1层【守势】。',
            '调整呼吸，转化刀势。\n若【攻势】>【守势】：消耗所有【守势】转化为等量【攻势】，下一次攻击伤害提升[转化层数×5%]。\n若【守势】>【攻势】：消耗所有【攻势】转化为等量【守势】，获得[Def×0.15×转化层数]护盾。\n若【攻势】=【守势】：获得1层【攻势】和1层【守势】。',
            '调整呼吸，转化刀势。\n若【攻势】>【守势】：消耗所有【守势】转化为等量【攻势】，下一次攻击伤害提升[转化层数×7.5%]。\n若【守势】>【攻势】：消耗所有【攻势】转化为等量【守势】，获得[Def×0.15×转化层数]护盾。\n若【攻势】=【守势】：获得1层【攻势】和1层【守势】。',
            '调整呼吸，转化刀势。\n若【攻势】>【守势】：消耗所有【守势】转化为等量【攻势】，下一次攻击伤害提升[转化层数×10%]。\n若【守势】>【攻势】：消耗所有【攻势】转化为等量【守势】，获得[Def×0.2×转化层数]护盾。\n若【攻势】=【守势】：获得1层【攻势】和1层【守势】。',
          ],
          advancementReplacesEffect: true,
          advancementOptions: [
            {
              id: 'A',
              name: '归鞘',
              effect: '若【攻势】>【守势】：消耗所有【守势】转化为等量【攻势】，下一次攻击伤害提升[转化层数×10%]；若转化后【攻势】＞8层，获得1层【力量强化】持续3回合。\n若【守势】>【攻势】：消耗所有【攻势】转化为等量【守势】，获得[Def×0.2×转化层数]护盾；若转化后【守势】＞8层，获得1层【防御强化】持续3回合。\n若【攻势】=【守势】：获得1层【攻势】和1层【守势】。',
            },
            {
              id: 'B',
              name: '共鸣',
              effect: '若【攻势】>【守势】：消耗所有【守势】转化为等量【攻势】，下一次攻击伤害提升[转化层数×10%]。\n若【守势】>【攻势】：消耗所有【攻势】转化为等量【守势】，获得[Def×0.2×转化层数]护盾。\n若【攻势】=【守势】：获得1层【攻势】和1层【守势】；下一次攻击获得总架势×5%的暴击伤害加成。',
            },
          ],
        },
      ],
      specialSkills: [
        {
          id: '错金',
          name: '错金',
          ap: 2,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effect: '对单体造成 [Str × 1.6] 的物理伤害。\n若【攻势】>【守势】：对目标施加1层【破甲】（3回合）。\n若【守势】>【攻势】：对目标施加1层【缴械】。\n若【攻势】=【守势】：同时施加两种效果。',
        },
        {
          id: '白夜',
          name: '白夜',
          ap: 2,
          attribute1: '物理',
          attribute2: '远程',
          attribute3: '群体',
          effect: '刀身泛起惨白光芒横斩。对敌方全体造成 [Str × 0.5 + Agi × 0.5] 的物理伤害。\n若【攻势】≥10层：斩击汇聚为一点，改为对当前选定目标造成 [Str × 1.2 + Agi × 1.2] 的物理伤害，并施加2层【破甲】。\n若【守势】≥10层：对敌方全体造成 [Str × 0.75 + Agi × 0.75] 的物理伤害，若暴击，施加1层【眩晕】。\n若【攻势】和【守势】均≥10层：对敌方全体造成 [Str × 1.2 + Agi × 1.2] 的物理伤害，且对命中的所有敌人施加一次[幸运×5%]即死判定；未即死则造成正常伤害。',
        },
        {
          id: '一闪',
          name: '一闪',
          ap: 3,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effect: '对单体造成 [Str × 3.0] 的物理伤害。\n若【攻势】恰好为5层：伤害增加20%。\n若【守势】恰好为5层：获得 [Def × 1.5] 的护盾。\n若【攻势】=【守势】且均为5层：伤害+50%，获得 [Def × 2.5] 的护盾，此次攻击必定命中。',
        },
        {
          id: '心眼',
          name: '心眼',
          ap: 0,
          attribute1: '被动',
          attribute2: '',
          attribute3: '',
          effect: '闪避率增加[守势层数×5%]，暴击率增加[攻势层数×5%]，回合开始时获得2层【攻势】和2层【守势】。',
        },
        {
          id: '无拍子',
          name: '无拍子',
          ap: 1,
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          effect: '瞬间拔刀斩击。对单体造成 [Agi × 1.2] 的物理伤害，此次攻击必定命中。\n若本回合未获得过任何【攻势】或【守势】：伤害+50%，并获得3层【攻势】和3层【守势】。',
        },
      ],
      specialSkillsUnlocked: [],
      buffs: [],
    },
  };

  /** 默认队伍顺序：按槽位 1～6 填角色名，空位用 null */
  window.DEFAULT_PARTY_ORDER = ['达芙妮', '黯', null, null, null, '昼墨'];

  function getSpecialSkillsForChar(ch) {
    if (!ch) return [];
    return ch.specialSkills && Array.isArray(ch.specialSkills) ? ch.specialSkills : [];
  }
  /** 白牙召唤数据工厂：需传入 getDisplayStat(owner, key) 以计算属性。达芙妮使用「白牙！」后召唤，MAXHp=[Sta×8]，攻击=[Str×0.8]，防御=[Def×0.4+Str×0.4]，行动 2。 */
  function createSummonBaiya(getDisplayStat) {
    return {
      name: '白牙',
      ap: 2,
      maxHpFromOwner: function (owner) {
        return Math.floor((getDisplayStat(owner, 'sta') || 0) * 8);
      },
      atkFromOwner: function (owner) {
        return Math.floor((getDisplayStat(owner, 'str') || 0) * 0.8);
      },
      defFromOwner: function (owner) {
        return Math.floor((getDisplayStat(owner, 'def') || 0) * 0.4 + (getDisplayStat(owner, 'str') || 0) * 0.4);
      },
      skills: [
        {
          name: '横扫',
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '群体',
          ap: 1,
          effect: '挥舞利爪横扫。对敌方同排造成 [Atk × 0.6] 的物理伤害。',
        },
        {
          name: '撕咬',
          attribute1: '物理',
          attribute2: '近战',
          attribute3: '单体',
          ap: 1,
          effect: '撕咬目标。对敌方单体造成 [Atk × 1.0] 的物理伤害，并施加1次【重伤】。',
        },
      ],
    };
  }
  function getBaiyaStatsFromOwner(owner, getDisplayStat) {
    if (!owner || !getDisplayStat) return { maxHp: 0, atk: 0, def: 0 };
    const summon = createSummonBaiya(getDisplayStat);
    return {
      maxHp: summon.maxHpFromOwner(owner),
      atk: summon.atkFromOwner(owner),
      def: summon.defFromOwner(owner),
    };
  }
  /** 从技能的三个属性字段（attribute1/2/3）拼出显示用字符串，如「物理/近战/群体」；若无则退回 tags */
  function getSkillTagsString(skill) {
    if (!skill) return '';
    const a1 = skill.attribute1 != null ? String(skill.attribute1).trim() : '';
    const a2 = skill.attribute2 != null ? String(skill.attribute2).trim() : '';
    const a3 = skill.attribute3 != null ? String(skill.attribute3).trim() : '';
    if (a1 || a2 || a3) return [a1, a2, a3].filter(Boolean).join('/');
    return skill.tags != null ? String(skill.tags) : '';
  }

  window.色色地牢_character = {
    getSpecialSkillsForChar: getSpecialSkillsForChar,
    createSummonBaiya: createSummonBaiya,
    getBaiyaStatsFromOwner: getBaiyaStatsFromOwner,
    getSkillTagsString: getSkillTagsString,
  };
})();
