/**
 * 角色立绘资源（原 file.catbox 等外链已在此集中维护）
 * 键：角色名，值：图片 URL 或相对路径（如 立绘/达芙妮.png）
 * 前缀：若值不以 http:// 或 https:// 开头，会自动补前缀 https://pub-ef9579c191ec47599328a02c30d8e6f8.r2.dev/
 * 格式限定：本目录仅使用 .html / .css / .js
 */
(function () {
  const R2_PREFIX = 'https://pub-ef9579c191ec47599328a02c30d8e6f8.r2.dev/';
  window.R2_PREFIX = R2_PREFIX;
  // 差分服装（按下标循环）：每个角色对应一个可用头像列表（URL 或相对路径）
  window.CHARACTER_PORTRAIT_VARIANTS = {
    达芙妮: ['达芙妮/常服/完好-正常状态.png'],
  };
  /**
   * 角色换装可用性（hidden tag）。
   * 约定：某角色某服装的 hidden tag **为 false** 时，表示“没有该服装 / 不允许换装到该服装”。
   * （也就是：true=允许，false=禁止）
   */
  window.CHARACTER_OUTFIT_HIDDEN_TAGS = {
    达芙妮: {
      常服: true,
      泳装: true,
      浴衣: true,
      舞娘: true,
      兔女郎: true,
      旗袍: true,
      花嫁: true,
    },
  };
  window.CHARACTER_PORTRAITS = {
    // 约定：不以 http:// 或 https:// 开头的非空字符串会自动补前缀 R2_PREFIX
    // 示例：达芙妮/常服/完好-正常状态.png
    达芙妮: '达芙妮/常服/完好-正常状态.png',
    岚: '',
    普罗安妲: '',
    昼墨: '',
    黯: '',
    夜露: '',
    艾丽卡: '',
    清漓: '',
    '丝伊德·白': '',
    凌遥仙: '',
    月见遥: '',
  };
  // 资源前缀处理：不以 http 开头的非空字符串补上 R2_PREFIX
  (function () {
    const raw = window.CHARACTER_PORTRAITS;
    for (const name in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, name)) {
        const v = raw[name];
        if (v && typeof v === 'string' && v.length > 0 && v.indexOf('http') !== 0) {
          raw[name] = R2_PREFIX + v;
        }
      }
    }
    const vars = window.CHARACTER_PORTRAIT_VARIANTS;
    if (vars && typeof vars === 'object') {
      for (const n in vars) {
        if (!Object.prototype.hasOwnProperty.call(vars, n)) continue;
        const arr = vars[n];
        if (!Array.isArray(arr)) continue;
        for (let i = 0; i < arr.length; i++) {
          const v2 = arr[i];
          if (v2 && typeof v2 === 'string' && v2.length > 0 && v2.indexOf('http') !== 0) arr[i] = R2_PREFIX + v2;
        }
      }
    }
  })();
})();
