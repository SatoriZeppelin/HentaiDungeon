# 人物储存

本文件夹存放角色数据。

- **character.js**：所有可出战角色的**属性 + 被动/基础/可升级技能 + 特殊技能列表（specialSkills）+ 已解锁特殊技能（specialSkillsUnlocked）**集中定义（`window.CHARACTERS`、`window.DEFAULT_PARTY_ORDER`）。并负责**特殊技能列表获取**（getSpecialSkillsForChar）、**白牙召唤**（createSummonBaiya、getBaiyaStatsFromOwner），通过 `window.色色地牢_character` 暴露给 interface。**技能伤害公式与描述解析**（getBaseDamageForSkill、resolveSkillEffect 等）在 **backend/skill.js**，由 app.js 在 getDisplayStat 就绪后通过 `window.色色地牢_skill.create(getDisplayStat)` 取得 API 并传给 battle.js。**特殊技能点**（getSpecialSkillPointsTotal、getUnspentSpecialSkillPoints）在 interface/app.js。立绘由 resource/illustration.js 提供。
- **每人一 JSON**（如 普罗安妲.json）：可选，用于静态配置或与 character.js 对照；属性键名见下表。

## 属性键名与中文对照

| 键名 | 中文 |
| ---- | ---- |
| Str  | 力量 |
| Agi  | 敏捷 |
| Int  | 智力 |
| Sta  | 耐力 |
| Def  | 防御 |
| Luk  | 幸运 |
| Cha  | 魅力 |

各角色 JSON 中的 `stats` 使用上述键名，界面显示时可用此表转为中文。
