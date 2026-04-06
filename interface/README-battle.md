# 战斗逻辑说明（battle.js）

本文件说明战斗网格与前后排规则，对应 `界面/battle.js` 的实现。

## 技能相关模块分工（interface 文件夹）

- **skill.js**：**技能公式与描述解析**（纯数据/规则层）。提供 `window.色色地牢_skill.create(getDisplayStat)`，返回 `getBaseDamageForSkill`、`getBaseDamageFromResolvedEffect`、`resolveSkillEffect`、`resolveSkillEffectWithStats`、`getSkillEffectForLevel`、`getDisplayStatsForSkill`、`getShieldFromResolvedEffect`、`getShieldForSkill`、`SKILL_CALC_PLACEHOLDER_RE`。**加载顺序**：需在 app.js 之前加载；若未预先加载，app.js 会尝试从与 app.js 同目录动态加载 `skill.js`，加载完成后再执行初始化；app 在 getDisplayStat 定义后调用 `色色地牢_skill.create(getDisplayStat)` 取得上述 API，再通过 `initBattleUI(options)` 传给 battle.js。
- **app.js**：侧栏、正文、设置与角色面板；负责 getDisplayStat、getParty、saveBattleData 等，并从 skill.js（若已加载）或占位实现取得技能 API 后传给 battle。
- **battle.js**：**战斗流程**（选目标、扣 AP、命中/暴击、扣血、上 buff、动画、战斗日志）。通过 `initBattleUI(options)` 接收 app 传入的上述技能 API 及 getParty、getEnemyParty、resolveAttack 等，不直接依赖 skill.js。

## 网格约定

- **竖直为一排，横着为一列**：网格为 **3 排 × 2 列**。
- 己方、敌方各 **6 个槽位**，编号 **1～6**。与 DOM 中 `data-slot="ally-1"`～`ally-6`、`enemy-1`～`enemy-6` 一致。
- 网格顺序（与 CSS Grid 一致）：
  - 第 1 排：槽位 1、2  
  - 第 2 排：槽位 3、4  
  - 第 3 排：槽位 5、6  

## 前排与后排

- **前排（图中红色一列）**：槽位 **2、4、6**。
- **后排**：槽位 **1、3、5**。

即：同一“列”中，2、4、6 为前排，1、3、5 为后排。

## 攻击目标规则

- **当前排没有角色或怪物的时候才能攻击后排。**
- 具体：
  - **前排（2、4、6）**：始终可以作为攻击目标。
  - **后排（1、3、5）**：**当且仅当**同一侧的前排三个槽位（2、4、6）**全部**没有角色或怪物时，才能被选为攻击目标。
- 即使 1、3、5 都有单位，只要 2、4、6 中**任意一个**有单位，就不能越过前排去攻击 1、3、5。  
  例如：只有 2 号位有角色时，也不能对 1、3、5 号位进行攻击。

## battle.js 提供的接口

通过全局对象 `window.BattleGrid` 使用：

| 属性 / 方法 | 说明 |
| ----------- | ---- |
| `FRONT_ROW_SLOTS` | 前排槽位编号数组 `[2, 4, 6]` |
| `BACK_ROW_SLOTS` | 后排槽位编号数组 `[1, 3, 5]` |
| `SLOT_COUNT` | 单侧槽位数 `6` |
| `ALL_SLOT_INDICES` | 所有槽位 `[1,2,3,4,5,6]` |
| `isFrontRow(slotIndex)` | 是否为前排槽位 |
| `isBackRow(slotIndex)` | 是否为后排槽位 |
| `getFrontRowSlots()` | 返回前排槽位数组副本 |
| `getBackRowSlots()` | 返回后排槽位数组副本 |
| `hasAnyUnitInFrontRow(slots)` | 该侧前排是否至少有一个单位。`slots` 为长度 6 的数组，`slots[i]` 对应槽位 `i+1`，空位为 `null`/`undefined` |
| `getTargetableSlotIndices(slots)` | 该侧在给定槽位状态下可被攻击的槽位编号列表（1～6） |
| `canTargetSlot(targetSlotIndex, slots)` | 指定槽位在给定槽位状态下是否可作为攻击目标 |
| `enterSkillTargetMode(enemySlots, onTargetSelected)` | 进入技能目标选择：高亮可攻击的敌方槽位，用户点击某一高亮槽位后调用 `onTargetSelected(槽位号 1～6)` 并退出模式；点击其他区域则取消 |
| `exitSkillTargetMode()` | 退出技能目标选择模式，移除高亮与监听 |
| `BATTLE_PHASE` | 阶段常量：`PLAYER_ACTION`（玩家行动回合）、`PLAYER_RESOLUTION`（玩家结算回合）、`ENEMY_ACTION`（敌方行动回合）、`ENEMY_RESOLUTION`（敌方结算回合） |
| `getBigRound()` / `setBigRound(n)` | 当前大回合数 |
| `getBattlePhase()` / `setBattlePhase(p)` | 当前阶段 |
| `advanceBattlePhase()` | 推进到下一阶段（玩家行动→玩家结算→敌方行动→敌方结算→下一大回合） |
| `resolveAttack(attacker, defender, baseDamage, isPlayerAttacker)` | 命中与暴击判定，返回 `{ hit, crit, rollHit, rollCrit, hitRate, critRate, finalDamage, message }` |
| `resolveEnemyActions()` | 敌方行动回合：遍历存活怪物，按类型执行单体/群体/连击/防御并刷新视图；可由 `色色地牢_getEnemyActionType`、`色色地牢_ENEMY_ACTION_HANDLERS` 扩展 |
| `initBattleUI(options)` | 初始化战斗界面：渲染己方/敌方槽位、技能弹窗、换位、攻击结算与受击特效等；由 app 传入 `getParty`、`getEnemyParty`、`saveBattleData` 及显示/结算所需回调与常量（如 `getDisplayStat`、`SWAP_SVG` 等） |
| `refreshBattleView()` | 刷新战斗视图（重绘己方/敌方槽位与回合显示）；在 `initBattleUI` 调用后可用，供 app 在切回战斗标签等场景调用 |

## 行动点（AP）与攻击

- **本回合 AP 降为 0 后不可继续攻击**：点击己方角色头像时，若当前行动点为 0，不弹出技能菜单并提示「本回合行动点已用完，无法攻击」。

## 回合阶段

- **大回合**：包含四个子回合 —— **玩家行动回合** → **玩家结算回合** → **敌方行动回合** → **敌方结算回合**，然后进入下一大回合。
- **玩家行动回合**：玩家可选己方角色、选技能与目标并发动攻击（扣 AP、结算命中/暴击/伤害）；非本阶段时点击角色会提示「仅可在玩家行动回合中使用技能」。
- **玩家结算回合**：按己方 **1～6 号位顺序**依次结算每个单位身上的回合结束类 buff：**再生**恢复等同于层数的生命，**重伤 / 流血 / 燃烧 / 中毒**受到等同于层数的伤害；结算后保存并刷新视图。进入本阶段时由 `advanceBattlePhase()` 自动触发上述结算。
- **敌方行动回合**：按敌方 **1～6 号位**顺序，每个存活怪物按权重随机选择一种行动类型并执行；可被 `window.色色地牢_getEnemyActionType` 或 `window.色色地牢_ENEMY_ACTION_HANDLERS` 扩展。
  - **行动类型**（`ENEMY_ACTION_TYPES`）：`single_target` 单体攻击、`aoe` 群体攻击、`multi_hit` 连击、`defense` 防御。
  - **数值**：单体 攻击×0.8～1.2；群体 攻击×0.3～0.5；连击 攻击×0.3～0.5×次数(2～4)；防御 防御×0.8～1.2 护盾。
  - **扩展**：若定义 `window.色色地牢_getEnemyActionType(monster, context)` 则优先返回行动类型 key；若定义 `window.色色地牢_ENEMY_ACTION_HANDLERS[actionType](enemy, party, enemies, slot, helpers)` 则可完全自定义该类型处理。
- **敌方结算回合**：预留，用于结算敌方 buff/debuff 等回合结束效果。

## 命中与暴击

- **Roll 1～100**：命中与暴击各掷一次。
- **玩家命中率**：`50% + 幸运×5% - 怪物闪避率`；**玩家暴击率**：`敏捷×2%`；暴击伤害为原始伤害×200%。
- **怪物命中率**：`90% + buff - 防御方敏捷×2%`；**怪物暴击率**：`25% + buff`；暴击伤害为原始伤害×200%。
- **最终伤害**：`max(1, floor(原始伤害或暴击后伤害))`，不减去防御方防御。由 app.js 在选定目标后调用 `resolveAttack`，再根据结果扣血、扣 AP 并写回聊天变量，在界面与战斗日志中显示。

## 攻击日志标准格式

单次攻击的 combat log 统一采用以下格式（由 `formatAttackLogLine` 生成）：

```
[角色名]使用[技能名]对[目标]；命中Roll:[掷骰]/[命中率](命中/未命中)；暴击Roll:[掷骰]/[暴击率](暴击/未暴击)；伤害计算:[属性]×[倍率]=[基础伤害]；（增加部分）最终伤害:[数值]；[目标]剩余Hp:[数值]；
```

- **未命中**时只输出到「命中Roll:…(未命中)；」为止。
- **命中**后依次输出暴击 Roll、伤害计算、**增加部分**、最终伤害与目标剩余 Hp。
- **增加部分**：列出从基础伤害到最终伤害之间的**所有增伤原因**，每项以分号结尾；无任何增伤时写「无；」。可能出现的项包括：
  - **暴击+100%**：暴击判定成功时
  - **激励+N%**：攻击方有【激励】buff 时（N = 层数×10）
  - **破甲+N%**：目标有【破甲】时（N = 层数×20，仅物理）
  - **脆弱+N%**：目标有【脆弱】时（N = 层数×20）
  - **被动暗影+N**：黯的被动【暗黑魔枪术】附加的暗影伤害数值
- 伤害计算可为单一属性×倍率，或由调用方传入完整字符串（如复合公式「力量×0.8=6+敏捷×0.4=6=12」）。

**全体技能（对多目标）**：当技能为「全体」或对多个目标分别判定命中/暴击时，**必须对每个目标各输出一条**上述格式的日志（即挨个输出「[角色名]使用[技能名]对[该目标]；命中Roll:…；暴击Roll:…；伤害计算:…；…；最终伤害:…；[该目标]剩余Hp:…；」），不得只打一条汇总。这样可以从日志中清楚看到每个目标的命中/暴击/伤害结果。参考：狼式旋风、敌方群体攻击、白牙横扫等，均为按目标逐条 `formatAttackLogLine`。无命中判定的全体效果（如暗夜帷幕·窒息迷雾的回合末固定伤害）可按目标逐条输出「对 [目标] 造成 N 点…；[目标]剩余Hp:…；」。

示例（狼式旋风对 5 个敌人，逐条输出）：
```
[战斗] 达芙妮使用狼式旋风对史莱姆；命中Roll:87/75(未命中)；
[战斗] 达芙妮使用狼式旋风对史莱姆；命中Roll:53/75(命中)；暴击Roll:95/28(未暴击)；伤害计算:力量×0.9=19；无；最终伤害:19；史莱姆剩余Hp:51；
[战斗] 达芙妮使用狼式旋风对史莱姆；命中Roll:54/75(命中)；暴击Roll:25/28(暴击)；伤害计算:力量×0.9=19；暴击+100%；最终伤害:38；史莱姆剩余Hp:34；
...
```

示例：`黯使用血舞枪刃对史莱姆；命中Roll:11/75(命中)；暴击Roll:71/34(未暴击)；伤害计算:力量×0.8+敏捷×0.4=12；激励+50%；被动暗影+5；最终伤害:23；史莱姆剩余Hp:77；`

**约定**：所有会造成伤害并写入战斗日志的技能，都必须通过 `formatAttackLogLine` 输出，并依赖 `resolveAttack` 返回的 `damageIncreaseReasons` 填写增加部分，保证格式一致。

**伤害计算与公式对齐**：战斗日志中的「伤害计算」必须与 **interface/skill.js** 中 `getBaseDamageForSkill`（及实际结算中的特殊修正）一致，具体约定如下：

| 技能 | 计算公式（与 getBaseDamageForSkill / 结算一致） | 日志中的伤害计算示例 |
|------|-----------------------------------------------|----------------------|
| 攻击 | floor(Str) | 力量×1=14 |
| 斩月 | floor(Str×mult)，mult 按等级/分支；A 有守势时 floor(Str×1.5) | 力量×1.2=16 或 力量×1.5=21 |
| 居合 | floor(Str×multStr + Agi×multAgi) | 力量×0.6+敏捷×0.3=12 |
| 错金 | floor(Str×1.6) | 力量×1.6=22 |
| 一闪 | floor(Str×3) | 力量×3=42 |
| 无拍子 | floor(Agi×1.2) | 敏捷×1.2=14 |
| 遒劲猛击 | floor(Str×mult) | 力量×1.2=16 |
| 斩杀 | floor(Str×mult)；目标 HP＜30% 时再×2 | 力量×1.6=22 或 力量×1.6×2(斩杀线)=44 |
| 狼牙碎击 | floor(Str×3) | 力量×3=42 |
| 狼式旋风 | floor(Str×mult)，mult 按等级；斩杀追击时×damageScale | 力量×1.2=18 或 力量×1.2×0.5=9 |
| 血舞枪刃 | 见 interface/skill.js（两项分别取整相加；A 有流血增伤） | 力量×0.8=6+敏捷×0.4=6=12；流血+60%=19 |
| 幽灵舞踏 | 每击 floor(Str×mult) | 力量×0.5=7（每击） |
| 暗夜帷幕 | floor(Int×mult) | 智力×0.6=8 |
| 魔龙舞 | 每击 floor(Agi×0.4) | 敏捷×0.4=6（每击） |
| 深渊终结 | floor(Int×2) | 智力×2.0=20 |
| 暗蚀之刃 | floor(Int×0.8) | 智力×0.8=8 |
| 虚无放逐（回归） | floor(Int×0.6～0.9)，Lv/A/B 同 skill.js | 智力×0.9=14（回归时全体） |
| 炎魔吹息 | floor(Int×mult) | 智力×0.8=12 等 |
| 心灵侵蚀 | floor(Int×multInt + Cha×multCha)；Lv1～4 与 A/B 见 skill.js；A 心碎 目标 HP＜40% 时×1.5 | 智力×0.9+魅力×0.4=14 等 |
| 妖艳业火 | floor(Int×mult)，Lv1～4 为 0.9/1.0/1.1/1.2，A/B 为 1.2；全体火焰伤害并 2 次【燃烧】；A 立即结算一次燃烧；B 每目标 Cha×5% 魅惑、对【魅惑】目标再 2 次【燃烧】 | 智力×1.2=14 等 |
| 错锋（攻击） | 每击 floor(Str×0.3) | 力量×0.3=4（每击） |
| 白夜（双势/汇聚） | floor(Str×1.2 + Agi×1.2) | 力量×1.2+敏捷×1.2=28 |
| 白夜（基础/守势≥10） | floor(Str×0.5+Agi×0.5) 或 floor(Str×0.75+Agi×0.75) | 力量×0.5+敏捷×0.5=14 或 力量×0.75+敏捷×0.75=21 |
| 白牙 横扫 | floor(Atk×0.6) | 攻击×0.6=10 |
| 白牙 撕咬 | floor(Atk×1.0) | 攻击×1.0=17 |
| 敌方 单体/群体/连击 | 攻击×倍率（见 ENEMY_ACTION 等） | 攻击×0.8=14 等 |

新增或修改技能时，需在 **interface/skill.js** 的 `getBaseDamageForSkill` 中维护对应公式，并在 `battle.js` 中为对应分支设置与上述计算方式一致的 `damageCalcStr`（或等价参数），避免出现「公式与最终伤害对不上」的情况。

## 怪物（敌方单位）字段

敌方槽位中每个单位（`v.enemyParty[i]` 或 `getEnemyParty()[i]`）当前在代码中使用的字段如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 显示名称（如「史莱姆」），缺省时界面显示「敌人」 |
| `level` | string | 等级（如 `'Normal'`），用于攻击逻辑与扩展；场上默认均为 Normal |
| `hp` | number | 当前生命值，会被战斗结算修改 |
| `maxHp` | number | 最大生命值，用于血条与斩杀 30% 判定，缺省按 100 处理 |
| `atk` | number | 攻击力（界面显示用；若敌方主动攻击时参与伤害公式则用此值） |
| `def` | number | 防御力（界面显示用；当前最终伤害不减去防御） |
| `buffs` | array | 与己方同结构的 buff 列表 `[{ id, name, layers }]`，用于槽位上的 buff 显示与后续结算 |
| `dodgeRate` | number（可选） | 闪避率（%），参与玩家命中率计算：`玩家命中率 = 50 + 幸运×5 - dodgeRate`，缺省为 0 |
| `hitRateBuff` | number（可选） | 命中率加成（%），参与怪物命中率：`怪物命中率 = 90 + hitRateBuff - 防御方敏捷×2` |
| `critRateBuff` | number（可选） | 暴击率加成（%），参与怪物暴击率：`怪物暴击率 = 25 + critRateBuff` |

默认示例（app.js 中的 `slimeTemplate`）：`{ name: '史莱姆', hp: 100, maxHp: 100, atk: 17, def: 18, level: 'Normal' }`。敌方阵容存于聊天变量 `v.enemyParty`（6 槽，空位 `null`），与己方 `v.party` 同结构。

## 动画（APNG）加载

- 槽位/容器上的 APNG 动画预留 **0.1s** 加载时间（`APNG_LOAD_TIMEOUT_MS`）；若超时仍未加载完成则**跳过该次动画**并调用 onComplete，同时在后台用 `new Image()` 预加载同一 URL（便于后续播放时命中缓存）。

## 使用示例

```javascript
// 己方 party 对应 ally 槽位：party[0] 为 1 号位，party[5] 为 6 号位
var allySlots = [party[0], party[1], party[2], party[3], party[4], party[5]];
var canHitBack = !window.BattleGrid.hasAnyUnitInFrontRow(allySlots);

// 敌方可被攻击的槽位
var enemySlots = [null, enemy2, null, null, null, null]; // 仅 2 号位有人
var targetable = window.BattleGrid.getTargetableSlotIndices(enemySlots);
// targetable === [2, 4, 6]（后排 1、3、5 不可选，因前排 2 有人）

// 判断 3 号位是否可被攻击
var ok = window.BattleGrid.canTargetSlot(3, enemySlots); // false
```

## 与 app.js / skill.js 的配合

- `界面/battle.js` 需在 `界面/app.js` 之前加载（见入口 HTML 或构建配置中的 script 顺序）。**skill.js** 需在 app.js 之前加载，否则 app.js 会从与 app.js 同目录动态加载 skill.js 后再初始化；app 在 getDisplayStat 就绪后从 `window.色色地牢_skill.create(getDisplayStat)` 取得技能 API。
- **战斗界面逻辑**（己方/敌方槽位渲染、技能弹窗、换位、攻击结算、受击特效、战斗日志与回合显示）均在 **battle.js** 中通过 `initBattleUI(options)` 完成；app.js 只负责侧边栏、正文面板、设置面板与角色面板，在加载时调用 `BattleGrid.initBattleUI(options)` 并传入 `getParty`、`getEnemyParty`、`saveBattleData` 及 **来自 skill.js 的技能 API**（getBaseDamageForSkill、resolveSkillEffect 等）与显示/结算所需回调与常量。
- 角色面板等在保存后需刷新战斗视图时，调用 `BattleGrid.refreshBattleView()`（若存在）。
