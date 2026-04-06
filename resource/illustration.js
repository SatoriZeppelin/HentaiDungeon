/**
 * 角色立绘资源（原 file.catbox 等外链已在此集中维护）
 * 键：角色名，值：图片 URL 或相对路径（如 立绘/达芙妮.png）
 * 短链：若值不以 http:// 或 https:// 开头，会自动补前缀 https://files.catbox.moe/
 * 格式限定：本目录仅使用 .html / .css / .js
 */
(function () {
  const CATBOX_PREFIX = 'https://files.catbox.moe/';
  window.CHARACTER_PORTRAITS = {
    达芙妮: 'https://files.catbox.moe/jqe8hk.png',
    岚: 'https://files.catbox.moe/l5zuez.png',
    普罗安妲: '', // 可填 catbox 链接或相对路径，如 立绘/普罗安妲.png
    昼墨: 'https://files.catbox.moe/jqs61f.png',
    黯: 'https://files.catbox.moe/sjtzl5.png',
    夜露: 'https://files.catbox.moe/kxlnsd.png',
    艾丽卡: 'https://files.catbox.moe/a0jzae.png',
  };
  // 短链处理：不以 http 开头的非空字符串补上 catbox 前缀
  (function () {
    const raw = window.CHARACTER_PORTRAITS;
    for (const name in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, name)) {
        const v = raw[name];
        if (v && typeof v === 'string' && v.length > 0 && v.indexOf('http') !== 0) {
          raw[name] = CATBOX_PREFIX + v;
        }
      }
    }
  })();
})();
