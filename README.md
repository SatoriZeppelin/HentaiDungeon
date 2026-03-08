# 色色地牢 - 说明文档

所有文件均属于 **色色地牢** 项目。

## 项目概述

色色地牢（HentaiDungeon）是一个基于网页的战斗部署界面，支持在 SillyTavern 等 AI 对话环境中以前端界面形式运行。左侧为功能列表（切换、角色、杂项、设置），主区域可在战斗区（己方 6 槽、敌方 6 槽）与文字区（字号/字体可调正文）之间切换。点击「切换」后保留选中效果，鼠标离开不会回退。

## 文件结构

```
色色地牢/
├── index.html              # 主 HTML，按顺序引用 character/、resource/、interface/ 下脚本
├── character/
│   └── character.js        # 角色数据：属性、被动/基础/可升级技能、特殊技能列表、已解锁特殊技能（见下方职责表）
├── resource/
│   ├── illustration.js     # 角色立绘 URL（CHARACTER_PORTRAITS）
│   ├── svg.js              # 界面用 SVG 图标（技能攻击/防御、AP、换位等）
│   └── animations.js       # 战斗动画资源 URL（斩击、恢复、状态等 APNG）
├── interface/
│   ├── app.js              # 入口：内联样式、侧边栏、调用 battle 的 initBattle；角色/地图/背包抽屉、技能解析等
│   ├── battle.js           # 战斗初始化与 UI：initBattle/initBattleUI、网格、技能弹窗、攻击结算、回合推进（详见 README-battle.md）
│   ├── story.js            # 文字区：字号/字体、正文内容与 setStoryText / getStoryContent
│   ├── settings.js         # 设置面板：打开/关闭、关闭按钮与退出动画
│   └── README-battle.md    # 战斗逻辑说明
├── App.vue                 # 预留 Vue 组件
├── 技能编写说明.md
├── .gitignore
└── README.md
```

## 各 JS 职责规范

| 文件 | 职责 |
|------|------|
| **character/character.js** | **角色数据与角色相关逻辑唯一来源**。定义 `window.CHARACTERS`（每人：name、level、六维、passiveSkills、skills、**specialSkills**、specialSkillsUnlocked）、`window.DEFAULT_PARTY_ORDER`；**特殊技能列表**（getSpecialSkillsForChar）；**白牙召唤**（createSummonBaiya(getDisplayStat)、getBaiyaStatsFromOwner(owner, getDisplayStat)）。通过 `window.色色地牢_character` 暴露给 app/battle。不包含立绘 URL。 |
| **resource/illustration.js** | **立绘资源**。`window.CHARACTER_PORTRAITS`：角色名 → 图片 URL 或相对路径。 |
| **resource/svg.js** | **界面 SVG 图标**。`window.色色地牢_SVG`：攻击/防御/AP/换位/关闭等图标字符串，供技能卡、弹窗、按钮使用。 |
| **resource/animations.js** | **战斗动画资源**。`window.ANIMATIONS`：斩击、恢复、状态等 APNG 的 URL，按 Slash / Recovery / State 等分组。 |
| **interface/app.js** | **界面入口与全局逻辑**。内联注入全部 CSS；侧边栏点击与视图切换（initSidebar）；**调用** battle 的 `initBattle(options)` 完成战斗初始化；**特殊技能点**（getSpecialSkillPointsTotal、getUnspentSpecialSkillPoints）计算与解锁、特殊技能弹窗；角色细则抽屉、地图/背包抽屉；从 `window.色色地牢_character` 取得特殊技能列表/白牙工厂并封装 SUMMON_BAIYA、getBaiyaStatsFromOwner；特殊技能弹窗；getDisplayStat、技能描述占位符解析（resolveSkillEffect 等）。 |
| **interface/battle.js** | **战斗初始化与战斗 UI/回合逻辑**。提供 `initBattle(options)` 与 `initBattleUI(options)`，完成己方/敌方槽位渲染、技能选择弹窗、换位、攻击结算与受击表现；依赖 app 传入的 getParty、getEnemyParty、saveBattleData、getSpecialSkillsForChar 等。详见 **interface/README-battle.md**。 |
| **interface/story.js** | **文字区**。正文 DOM（#story-content）的字号/字体切换；对外 setStoryText / getStoryContent / initStoryPanel。 |
| **interface/settings.js** | **设置界面**。设置面板的显示/隐藏、关闭按钮、退出动画；对外 openSettings / closeSettings / initSettings。 |

约定：**角色相关数据与逻辑（含特殊技能列表、白牙召唤）一律放在 character/character.js**；**特殊技能点计算与解锁在 interface/app.js**；**战斗初始化与战斗 UI 放在 interface/battle.js**；**资源 URL 放在 resource/**；**界面入口与技能解析等放在 interface/app.js**。

## 角色初始状态

**所有角色**的默认初始状态（见 `character/character.js`）统一定义为：

- **等级**：1
- **自由属性点**（若有）：无加点（如达芙妮的 bonusStr / bonusAgi 等均为 0）
- **技能 1～3**：均为 1 级，未选择分支进阶
- **技能 4**：未解锁（locked: true）
- **特殊技能**：全部未解锁（specialSkillsUnlocked 为空数组 `[]`）

## 技能编写（给 AI / 后续扩展用）

新增或修改技能时，请优先复用现有逻辑，避免重复实现。详见：

- **[技能编写说明.md](./技能编写说明.md)**：技能类型（被动 / 基础 / 可升级）、数据结构、属性占位符 `[Str × 0.2]`、【buff名】与 `BUFF_DEFINITIONS`、分支进阶、以及需复用的函数（`resolveSkillEffect`、`getSkillEffectForLevel`、`wrapBuffRefs` 等）。按该文档写技能即可与当前界面行为一致。
- **特殊技能**：在 `character/character.js` 对应角色的 `specialSkills` 数组中添加/修改项（id、name、ap、tags、effect）；无特殊技能的角色可设为 `specialSkills: []`。

## 开发建议

- 改角色属性/技能/特殊技能/白牙召唤：改 **character/character.js**。
- 改立绘/图标/动画链接：改 **resource/** 下对应 js。
- 改样式：改 **interface/app.js** 内 CSS。
- 改侧边栏/视图切换/角色面板/特殊技能弹窗：改 **interface/app.js**。
- 改战斗初始化或战斗 UI/回合逻辑：改 **interface/battle.js**（详见 interface/README-battle.md）。
- 改文字区：改 **interface/story.js**。
- 改设置界面（打开/关闭、关闭按钮）：改 **interface/settings.js**。
- 改文字区：改 **interface/story.js**。
- 改设置界面（打开/关闭、关闭按钮）：改 **interface/settings.js**。
