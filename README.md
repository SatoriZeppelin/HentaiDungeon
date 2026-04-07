# 色色地牢 - 说明文档

所有文件均属于 **色色地牢** 项目。

## 项目概述

色色地牢（HentaiDungeon）是一个基于网页的战斗部署界面，支持在 SillyTavern 等 AI 对话环境中以前端界面形式运行。左侧为功能列表（切换、角色、杂项、设置），主区域可在战斗区（己方 6 槽、敌方 6 槽）与文字区（字号/字体可调正文）之间切换。点击「切换」后保留选中效果，鼠标离开不会回退。

## 文件结构

```
色色地牢/
├── index.html              # 主 HTML，按顺序引用 character/、resource/、interface/、backend/ 下脚本
├── HentaiDungeon.html      # 可选：由仓库根目录 node scripts/inline-hentai-dungeon-html.js 将上述脚本内联成的单文件 HTML，便于整包分发
├── character/
│   └── character.js        # 角色数据：属性、被动/基础/可升级技能、特殊技能列表、已解锁特殊技能（见下方职责表）
├── resource/
│   ├── illustration.js     # 角色立绘 URL（CHARACTER_PORTRAITS）
│   ├── svg.js              # 界面用 SVG 图标（技能攻击/防御、AP、换位等）
│   └── animations.js       # 战斗动画资源 URL（斩击、恢复、状态等 APNG）
├── interface/              # 与**前端界面**直接相关的脚本（DOM、布局、内联样式、开局/设置/文字区、战斗视图等）
│   ├── begining.js         # 开局界面：载入时显示 HentaiDungeon / 色色地牢 标题与左下角协议，需在 app.js 之前加载
│   ├── app.js              # 入口：内联样式、侧边栏、调用 battle 的 initBattle；角色/地图/背包抽屉、与酒馆变量同步等
│   ├── battle.js           # 战斗初始化与 UI：initBattle/initBattleUI、网格、技能弹窗、攻击结算、回合推进（详见 README-battle.md）
│   ├── story.js            # 文字区：字号/字体、正文内容与 setStoryText / getStoryContent
│   ├── settings.js         # 设置面板：打开/关闭、关闭按钮与退出动画
│   └── README-battle.md    # 战斗逻辑说明
├── backend/                # 与**后端/数据与 AI 管线**相关的脚本（规则、遭遇 generate、存档、技能公式等，无页面专用壳层）
│   ├── enemy.js            # 敌方数值 + `<enemy_design>` 解析（色色地牢_enemyStats / 色色地牢_enemyDesign）
│   ├── encounter.js        # 普通战斗：抽组合、拼提示词、`generate` 调酒馆 AI、解析敌方设计
│   ├── save.js             # 存档：localStorage 槽位与快照（详见「存档系统」）
│   ├── skill.js            # 技能公式与描述解析，由 app 取得 API 后传入 battle
│   └── golddrop.js         # 战斗胜利金币区间投掷（色色地牢_goldDrop）
├── App.vue                 # 预留 Vue 组件
├── 技能编写说明.md
├── .gitignore
└── README.md
```

**脚本加载顺序（`index.html` 底部）**：`character` → `resource/*` → `interface/story.js` → `interface/settings.js` → **`interface/battle.js` → `backend/enemy.js` → `backend/encounter.js` → `backend/save.js` → `backend/skill.js` → `backend/golddrop.js` → `interface/app.js`**。`enemy.js` 须整文件在 `encounter.js` 之前；`encounter.js` 须在 `app.js` 之前。

**命名约定**：色色地牢项目下 **JavaScript 源文件名一律小写**（如 `enemy.js`、`golddrop.js`），避免出现骆驼峰文件名。

## 各 JS 职责规范

| 文件                         | 职责                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **interface/begining.js**    | **开局界面**。载入时全屏显示「HentaiDungeon」「色色地牢」与左下角 CC 协议；背景与参考 index 的 body 底色一致；点击后关闭。需在 app.js 之前加载。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **character/character.js**   | **角色数据与角色相关逻辑唯一来源**。定义 `window.CHARACTERS`（每人：name、level、六维、passiveSkills、skills、**specialSkills**、specialSkillsUnlocked）、`window.DEFAULT_PARTY_ORDER`；**特殊技能列表**（getSpecialSkillsForChar）；**白牙召唤**（createSummonBaiya(getDisplayStat)、getBaiyaStatsFromOwner(owner, getDisplayStat)）。通过 `window.色色地牢_character` 暴露给 app/battle。不包含立绘 URL。                                                                                                                                                                                                                          |
| **resource/illustration.js** | **立绘资源**。`window.CHARACTER_PORTRAITS`：角色名 → 图片 URL 或相对路径。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **resource/svg.js**          | **界面 SVG 图标**。`window.色色地牢_SVG`：攻击/防御/AP/换位/关闭等图标字符串，供技能卡、弹窗、按钮使用。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **resource/animations.js**   | **战斗动画资源**。`window.ANIMATIONS`：斩击、恢复、状态等 APNG 的 URL，按 Slash / Recovery / State 等分组。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **interface/app.js**         | **界面入口与全局逻辑**。内联注入全部 CSS；侧边栏点击与视图切换（initSidebar）；**调用** battle 的 `initBattle(options)` 完成战斗初始化；**特殊技能点**（getSpecialSkillPointsTotal、getUnspentSpecialSkillPoints）计算与解锁、特殊技能弹窗；角色细则抽屉、地图/背包抽屉（`fillPath` 等在「普通战斗」时调用 **`window.色色地牢_requestNormalBattleAiPrompt`**，逻辑在 backend/encounter.js）；从 `window.色色地牢_character` 取得特殊技能列表/白牙工厂并封装 SUMMON_BAIYA、getBaiyaStatsFromOwner；特殊技能弹窗；getDisplayStat；**依赖** backend/skill.js 取得技能公式与描述解析 API 并传入 battle。                                                 |
| **backend/skill.js**         | **技能公式与描述解析（独立模块）**。由 app 在 getDisplayStat 就绪后通过 `window.色色地牢_skill.create(getDisplayStat)` 取得 API，再传给 battle。提供 getBaseDamageForSkill（各技能伤害公式）、resolveSkillEffect / resolveSkillEffectWithStats（占位符解析）、getBaseDamageFromResolvedEffect、getSkillEffectForLevel、getShieldForSkill 等；与 **技能编写说明.md** 中的占位符、BUFF_DEFINITIONS 对应。                                                                                                                                                                                                                              |
| **interface/battle.js**      | **战斗初始化与战斗 UI/回合逻辑**。提供 `initBattle(options)` 与 `initBattleUI(options)`，完成己方/敌方槽位渲染、技能选择弹窗、换位、攻击结算与受击表现；依赖 app 传入的 getParty、getEnemyParty、saveBattleData、getSpecialSkillsForChar、**getBaseDamageForSkill**、**resolveSkillEffect** 等。详见 **interface/README-battle.md**。                                                                                                                                                                                                                                                                                                |
| **backend/enemy.js**         | **敌方模块（单文件双导出）**。**数值**：档位（fodder/normal/strong/elite/boss）与区域基准、大层→区域映射、`applySpawnPlanStats` 等 → **`window.色色地牢_enemyStats`**。**解析**：`<enemy_design>`、意图管道、`buildSpawnPlanFromDesign`（内部调用 `色色地牢_enemyStats.applySpawnPlanStats`）、`buildEnemyPartyFromSpawnPlan` 等 → **`window.色色地牢_enemyDesign`**。由 **backend/encounter.js** 在 `generate` 成功后解析；**`window.色色地牢_commitSpawnPlanToBattle`**（app.js）写入 **`enemyParty`**。 |
| **backend/encounter.js**     | **普通战斗遭遇与 AI 提示**。在玩家点击地图上的「普通战斗」可前往格时，按节点列号（层数）分档、等概率抽取敌方分值组合，拼上与开局区域一致的四行区域文案 + `生成…`（英文档位名：fodder / normal / strong 等），经 **`generate({ user_input, should_silence: true })`** 发给酒馆 AI；控制台输出完整提示词；若已加载 **`backend/enemy.js`** 则尝试解析 AI 回复中的 `<enemy_design>`，**`buildSpawnPlanFromDesign`** 传入 **`nodeId`** 以计算数值。对外 **`window.色色地牢_encounter`**（含组合表与工具函数）及 **`window.色色地牢_requestNormalBattleAiPrompt`**。依赖酒馆助手全局 **`generate`**；须在 **battle.js 之后、app.js 之前** 加载。 |
| **backend/golddrop.js**      | **战斗胜利金币**。按区域档与战斗类型（普通/精英/首领）在区间内随机 **`rollBattleGold`**；对外 **`window.色色地牢_goldDrop`**（含 `RULES_TEXT` 等）。须在 **app.js** 之前加载。                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **backend/save.js**          | **存档模块**。所有存档存于浏览器 localStorage（key：`色色地牢_saves`）。单槽位含：party、enemyParty、buffDefinitions、map、meta、history.recentBattleLog、nodeStates（每地图节点「刚进入时」快照）。对外 `window.色色地牢_save`：getSaveSlots、loadSlot、saveSlot、getLastSlotIndex、setLastSlotIndex。需在 app.js 之前加载。                                                                                                                                                                                                                                                                                                        |
| **interface/story.js**       | **文字区**。正文 DOM（#story-content）的字号/字体切换；对外 setStoryText / getStoryContent / initStoryPanel。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **interface/settings.js**    | **设置界面**。设置面板的显示/隐藏、关闭按钮、退出动画；对外 openSettings / closeSettings / initSettings。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

约定：**角色相关数据与逻辑（含特殊技能列表、白牙召唤）一律放在 character/character.js**；**特殊技能点计算与解锁在 interface/app.js**；**技能伤害公式与描述占位符解析在 backend/skill.js**；**战斗初始化与战斗 UI 放在 interface/battle.js**；**地图「普通战斗」遭遇组合与 AI 提示词在 backend/encounter.js**；**敌方数值与 `<enemy_design>` 解析在 backend/enemy.js**（`色色地牢_enemyStats` / `色色地牢_enemyDesign`）；**存档读写与槽位管理在 backend/save.js**；**战斗胜利金币规则在 backend/golddrop.js**；**资源 URL 放在 resource/**；**界面壳层、样式与视图切换在 interface/**（`app.js`、`begining.js`、`story.js`、`settings.js`）。

### AI 敌方设计格式（`<enemy_design>`，可选）

若模型在 `generate` 回复中输出如下结构，**backend/enemy.js**（`色色地牢_enemyDesign`）会解析并在控制台打印：

- 根标签 `<enemy_design>…</enemy_design>`。
- 子块：`elite` / `fodder` / `normal` / `strong` / `boss`（可多个同档块）。
- 每块内：`<名称|种族>`、`<名称|种族|性别>`，或 `<名称|种族|性别|体型>`（如 `<黑暗骑士|humanoid|male|large>`；体型 `tiny|small|medium|large|huge`），以及 `<intent>…</intent>`。
- 意图行：`<target|scope|action|effect|param1|param2>`，用 `|` 分隔，空位保留。**`scope`**：`single` 为单体，`aoe` 为全体（己方侧多目标）。示例：`<player|single|attack||14|>`；**单体多段** `<player|single|multi_attack||2|3>`（param1 每段伤害，param2 段数，**锁定同一己方**）；**全体多段** `<player|aoe|multi_attack||4|3>`（每段可随机不同目标）；**友方单体 buff** `<ally|single|buff|regeneration|1|>`（effect 如 `regeneration`→【再生】）；**友方全体 buff** `<ally|aoe|buff|strength_up|1|>`；`<self||taunt|||>`。
- **敌方行动池（有意图时）**：在 **battle.js** 中，**正常项**（合计 **75%**，组内均分）为 `<intent>` 内**可执行**的每条意图（单体攻、单体多段攻、AOE 多段攻、debuff、友方单体/AOE buff、治疗、嘲讽等）；**无意图时**的正常项为单体/AOE/连击/防御。**色情项**（合计 **25%**，组内均分）为程序侧 **服装破坏**（攻×30% 伤害 + 服装破损 +1 级）、**束缚**（1 层【眩晕】）、**猥亵**（体表精液 ml）、**强制侵犯**（1 层【眩晕】+ 下体/体内精液 ml；**仅当**场上存在可侵犯目标：【严重破损】或 `outfitTag`/`outfit` 含泳装、舞娘等）。**女性**敌方不参与 **猥亵**、**强制侵犯**（服装破坏与束缚仍进色情池）。若当前池无色情项，则全部为正常项（100%）。精液累计 **`party[].semenVolumeMl`**；不因回合或战斗结束清零。已移除 buff「精液附着」。
- **嘲讽**：解析时 **`action` 或 `effect` 为 `taunt`** 一律视为 **固定 2 层**，`param1` 规范为 `'2'`，并带字段 **`tauntLayers: 2`**（不采用 AI 可能填写的其它层数）。
- 同档可多个块（如三个 `<fodder>…</fodder>`），按出现顺序与单位一一对应；**`buildSpawnPlanFromDesign`** 在敌方 **1～6 号槽内随机不重复分配**（`slotsUsed`），不按 1→2→3 顺序填。

当前实现：**解析** → **`stats`**（`色色地牢_enemyStats`）→ **`commitSpawnPlanToBattle`** 写入聊天变量 **`enemyParty`** 并刷新战斗格子；**有意图**时敌方按上条行动池结算；**无意图**时回退为单体/AOE/连击/防御 + 程序侧四种（猥亵/强制侵犯仍受性别与强制侵犯条件约束）。

### 敌方数值（档位 × 区域基准）

| 档位        | 分值 | HP 倍率                 | 攻击倍率 | 防御倍率 |
| ----------- | ---- | ----------------------- | -------- | -------- |
| 杂兵 Fodder | 1    | 50%                     | 60%      | 30%      |
| 普通 Normal | 2    | 100%                    | 100%     | 100%     |
| 强力 Strong | 3    | 160%                    | 120%     | 120%     |
| 精英 Elite  | 5    | 250%                    | 135%     | 135%     |
| 首领 Boss   | —    | **800%～1000%**（随机） | 150%     | 150%     |

| 区域             | HP 基准  | 攻击基准 | 防御基准 |
| ---------------- | -------- | -------- | -------- |
| 区域1（大层 1）  | 40～50   | 10～18   | 5～10    |
| 区域2（大层 2）  | 100～175 | 15～25   | 10～20   |
| 区域3（大层 ≥3） | 200～300 | 20～35   | 20～30   |

例：大层 1、某格为第 1 层（`nodeId` 如 `1-1`），生成 1 只杂兵：在 **40～50** 内随机取 `baseHp`，再乘 **50%** 得到 `hp`/`maxHp`；攻击、防御同理各自在基准区间内随机取整后乘杂兵倍率。

## 存档系统（backend/save.js）

- **存储位置**：仅浏览器 **localStorage**（key：`色色地牢_saves`），与 map、battle 相关数据一致。
- **单槽位内容**：`party`、`enemyParty`、`buffDefinitions`、`map`（area/pos/nodes/inv）、`meta`（savedAt、areaName 等）、**history.recentBattleLog**（最近一次战斗的日志行，cap 100 条）、**nodeStates**（以地图节点 id 为 key，存该节点「刚进入时」的 party/enemyParty/map/buffDefinitions 快照，cap 50 个节点）。
- **API**（`window.色色地牢_save`）：**getSaveSlots()** 返回槽位摘要（用于读取存档/保存时选择）；**loadSlot(index)** 读取指定槽位；**saveSlot(index, payload)** 写入并设为「最后使用」；**getLastSlotIndex()** / **setLastSlotIndex(n)** 供「继续游戏」使用。
- **加载顺序**：`backend/save.js` 需在 `interface/app.js` 之前加载；app 提供 getCurrentGameState、applySavePayload、recordNodeState，并在「继续游戏」/「读取存档」时调用 save 的 loadSlot + applySavePayload；开局「读取存档」在 begining 中展示槽位列表，选中后调用 `window.beginingLoadSaveSlot(index)`；杂项面板中「保存」按钮将当前状态写入 lastIndex 对应槽位。
- **历史与节点状态**：battle 通过 **getRecentBattleLog** / **setBattleLog** 暴露最近战斗日志供存档与读档恢复；地图在 **renderMapContent** 时若检测到 `pos` 变化会调用 **recordNodeState(pos)** 将当前状态写入 `chat.nodeStates[pos]`，随存档一并持久化。

## 角色初始状态

**所有角色**的默认初始状态（见 `character/character.js`）统一定义为：

- **等级**：1
- **自由属性点**（若有）：无加点（如达芙妮的 bonusStr / bonusAgi 等均为 0）
- **技能 1～3**：均为 1 级，未选择分支进阶
- **技能 4**：未解锁（locked: true）
- **特殊技能**：全部未解锁（specialSkillsUnlocked 为空数组 `[]`）

### 测试状态

**测试状态**与初始状态唯一区别为 **等级为 5**，其余约定与上述初始状态相同（自由属性点 0、技能 1～3 为 1 级且未选进阶、技能 4 未解锁、特殊技能未解锁）。用于开发/调试时快速体验高等级数值。

## 技能编写（给 AI / 后续扩展用）

新增或修改技能时，请优先复用现有逻辑，避免重复实现。详见：

- **[技能编写说明.md](./技能编写说明.md)**：技能类型（被动 / 基础 / 可升级）、数据结构、属性占位符 `[Str × 0.2]`、【buff名】与 `BUFF_DEFINITIONS`、分支进阶、以及需复用的函数（`resolveSkillEffect`、`getSkillEffectForLevel`、`wrapBuffRefs` 等）。按该文档写技能即可与当前界面行为一致。
- **特殊技能**：在 `character/character.js` 对应角色的 `specialSkills` 数组中添加/修改项（id、name、ap、tags、effect）；无特殊技能的角色可设为 `specialSkills: []`。

## 路线图生成规范（第 1–14 层可分配格 + 第 15 层首领）

与界面地图网格一致：**总可分配格子 42 格**（第 1–14 层，每层 3 格：`列-行` 为 `1-1`…`14-3`）。**第 15 层**对应节点 `15-0`，**固定为「首领战斗」**；起点为 `0-0`。

### 格子类型与数量（仅指上述 42 格）

| 类型         | 数量范围 | 占比（约） | 说明                                                                   |
| ------------ | -------- | ---------- | ---------------------------------------------------------------------- |
| **普通战斗** | 14–18 格 | 33%–45%    | 遭遇普通敌人，战胜后获得金币与经验，中等概率获得普通～稀有遗物三选一。 |
| **随机事件** | 14–18 格 | 33%–45%    | 触发随机事件，结果不定。                                               |
| **休息点**   | 4–6 格   | 10%–14%    | 恢复 HP、修复衣物、触发角色间互动。                                    |
| **精英战斗** | 3–5 格   | 7%–12%     | 强力敌人，高风险高回报；必定获得普通～史诗遗物三选一。                 |
| **商店**     | 3–4 格   | 7%–10%     | 消耗金币购买资源。                                                     |
| **宝箱**     | 2–3 格   | 5%–7%      | 遗物三选一。                                                           |

### 层级限制（列号 = 层号）

- **第 1–3 层**：**禁止**「商店」；可出现：普通战斗、随机事件、休息点、精英战斗、宝箱。
- **第 4–13 层**：可出现：**全部**上述类型。
- **第 14 层**：**禁止**「普通战斗」「精英战斗」；可出现：商店、休息点、随机事件、宝箱。
- **第 15 层**：**固定**「首领战斗」（`15-0`）。

### 分布原则

- 每层至少 1 格为「普通战斗」或「随机事件」。
- **正交相邻**（同一列上下格、同一行左右格）**尽量不出现相同类型**，避免整列三连、整行三连同色；程序生成时优先满足，极难局面下可能短暂放宽。
- 「精英战斗」在同一层内**不相邻**（同一层三个格子中行号相邻则不能同时为精英）。
- 「休息点」**优先**分布在**第 5 层之后**（实现上为较低权重出现在第 1–5 层）。
- 「商店」**优先**分布在**第 4–12 层**（第 13、14 层权重较低；第 1–3 层禁止）。

### 实现说明

开局在 **begining** 中选完难度、区域、祝福并点击「开始冒险」后，由 **`interface/app.js`** 内 **`generateProceduralMapNodes`** 生成 `map.nodes`，并写入可选字段 **`map.revealOrder`**（与程序内生成落子顺序一致，便于存档与对照；**地图初次展开时的显现动画**则对格子 **乱序随机先后**，不跟随 `revealOrder`）。若多轮严格生成仍失败，会对**最后一次尝试**的半成品按列扫描并**强制补全**后写入地图（控制台警告），不再回退为整图替换的默认表。

**程序内的生成顺序**：

1. **先填第十四层**（3 格）：仅允许随机事件、休息点、商店、宝箱；每层至少「普通或随机」在此层等价于至少一格随机事件。
2. **再依次填第四～十三层**（每列 3 格，共 30 格）：六类均可（含商店），按加权随机落子。
3. **舍去多余**：将此时库存中**未分配的「商店」计数清零**（不在 1–3 层消耗）；若剩余总格数 **多于 9**，则随机削减各类计数直到**恰好 9**，多出的类型配额视为舍去。
4. **最后填第一～三层**（每列 3 格，共 9 格）：**不允许商店**，仅普通战斗、随机事件、休息点、精英战斗、宝箱。

起点 `0-0`、首领 `15-0` 仍固定；`revealOrder` 为 **`0-0` → 上述 42 格按生成顺序 → `15-0`**（含强制补全格接在半成品顺序之后）。读档沿用存档中的 `nodes` / `revealOrder`。

---

## 开发建议

- 改角色属性/技能/特殊技能/白牙召唤：改 **character/character.js**。
- 改立绘/图标/动画链接：改 **resource/** 下对应 js。
- 改样式：改 **interface/app.js** 内 CSS。
- 改侧边栏/视图切换/角色面板/特殊技能弹窗：改 **interface/app.js**。
- 改技能伤害公式或描述占位符解析（如 [Str×0.2]、【buff名】）：改 **backend/skill.js**。
- 改战斗初始化或战斗 UI/回合逻辑：改 **interface/battle.js**（详见 interface/README-battle.md）。
- 改普通战斗遭遇组合、区域四行文案或发给 AI 的 `generate` 提示：改 **backend/encounter.js**。
- 改 `<enemy_design>` 解析规则或意图字段：改 **backend/enemy.js**（文件后半，`色色地牢_enemyDesign` 段）。
- 改档位倍率、区域基准表或大层→区域映射：改 **backend/enemy.js**（文件前半，`色色地牢_enemyStats` 段）。
- 改战斗胜利金币区间：改 **backend/golddrop.js**。
- 改存档逻辑、槽位数或持久化内容：改 **backend/save.js**。
- 改文字区：改 **interface/story.js**。
- 改设置界面（打开/关闭、关闭按钮）：改 **interface/settings.js**。

写给编译

node scripts/inline-hentai-dungeon-html.js
整合文档

git add *
git commit -m "更新"
git push
