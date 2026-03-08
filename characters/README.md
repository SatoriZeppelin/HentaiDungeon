# 人物储存

本文件夹存放角色数据。

- **characters.js**：所有可出战角色的**属性 + 技能**集中定义（`window.CHARACTERS`、`window.DEFAULT_PARTY_ORDER`），由 ui/app.js 引用；立绘由 assets/character-portraits.js 提供。
- **每人一 JSON**（如 普罗安妲.json）：可选，用于静态配置或与 characters.js 对照；属性键名见下表。

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
