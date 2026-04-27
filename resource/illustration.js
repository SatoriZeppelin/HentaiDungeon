/**
 * 角色立绘资源（R2 集中维护）
 * 路径规则：https://pub-ef9579c191ec47599328a02c30d8e6f8.r2.dev/{角色名}/{服装}/{服装状态-精液状态}.png
 * 服装状态：完好 | 小破 | 中破 | 大破（对应 buff：轻微/中度/严重破损）
 * 精液状态：正常状态 | 轻度精浴 | 重度精浴（由 semenVolumeMl 分段）
 * 键：角色名，值：图片 URL、相对路径（如 达芙妮/常服/完好-正常状态.png），或仅服装目录名简写（如 常服，会展开为 角色名/常服/完好-正常状态.png）
 * 前缀：若值不以 http:// 或 https:// 开头，会自动补 R2_PREFIX
 */
(function () {
  const R2_PREFIX = 'https://pub-ef9579c191ec47599328a02c30d8e6f8.r2.dev/';
  window.R2_PREFIX = R2_PREFIX;

  /** 精液量上限（与战斗逻辑一致，供 clamp） */
  const MAX_SEMEN_ML = 100;
  window.HENTAI_DUNGEON_MAX_SEMEN_ML = MAX_SEMEN_ML;

  /** 每个角色 R2 上具备的七种服装目录名 */
  const HENTAI_DUNGEON_OUTFITS = ['常服', '泳装', '浴衣', '舞娘', '兔女郎', '旗袍', '花嫁'];
  window.HENTAI_DUNGEON_OUTFITS = HENTAI_DUNGEON_OUTFITS;

  function hasBuffName(unit, buffId) {
    if (!unit || !unit.buffs || !unit.buffs.length) return false;
    for (var i = 0; i < unit.buffs.length; i++) {
      var b = unit.buffs[i];
      if ((b.id || b.name) !== buffId) continue;
      if ((parseInt(b.layers, 10) || 0) > 0) return true;
    }
    return false;
  }

  /** 服装破损 → 文件名前缀 */
  function getClothingDamagePart(unit) {
    if (hasBuffName(unit, '严重破损')) return '大破';
    if (hasBuffName(unit, '中度破损')) return '中破';
    if (hasBuffName(unit, '轻微破损')) return '小破';
    return '完好';
  }

  function clampSemenMl(unit) {
    var semen = unit && unit.semenVolumeMl != null ? parseFloat(unit.semenVolumeMl) : 0;
    if (isNaN(semen)) semen = 0;
    return Math.max(0, Math.min(MAX_SEMEN_ML, semen));
  }

  /** 精液量 → 文件名中的精液段（无则与「正常状态」拼接） */
  function getSemenStateSuffix(unit) {
    var semen = clampSemenMl(unit);
    if (semen >= 66) return '-重度精浴';
    if (semen >= 33) return '-轻度精浴';
    return '';
  }

  /** 最终文件名：{完好|小破|中破|大破}[-正常状态|-轻度精浴|-重度精浴].png */
  function portraitFilenameFromUnit(unit) {
    var damagePart = getClothingDamagePart(unit);
    var semenSuffix = getSemenStateSuffix(unit);
    var tail = semenSuffix ? semenSuffix : '-正常状态';
    return damagePart + tail + '.png';
  }

  function getCurrentOutfitName(unit) {
    if (!unit) return '常服';
    var o = unit._portraitOutfit || unit.outfitTag || unit.outfit || '常服';
    return String(o);
  }

  /**
   * 根据角色与状态生成完整立绘 URL（R2）。
   * 有 unit.name 时始终按「角色名/当前服装/文件名」拼接，不依赖 ch.avatar 路径是否正确。
   * @param {object} unit
   * @param {string} [baseUrl] 无 name 时兜底：在 baseUrl 上替换文件名段
   */
  window.buildHentaiDungeonPortraitUrl = function (unit, baseUrl) {
    var base = baseUrl != null ? String(baseUrl) : '';
    var name = unit && unit.name != null ? String(unit.name).trim() : '';
    if (name) {
      var outfit = getCurrentOutfitName(unit);
      var file = portraitFilenameFromUnit(unit);
      var rel = name + '/' + outfit + '/' + file;
      return R2_PREFIX + encodeURI(rel);
    }
    if (!base) return '';
    var filename = portraitFilenameFromUnit(unit || {});
    if (/(完好|小破|中破|大破)(?:-(?:正常状态|轻度精浴|重度精浴))?\.png$/i.test(base)) {
      return base.replace(/(完好|小破|中破|大破)(?:-(?:正常状态|轻度精浴|重度精浴))?\.png$/i, filename);
    }
    var idx = base.lastIndexOf('/');
    if (idx === -1) return filename;
    return base.slice(0, idx + 1) + filename;
  };

  /**
   * 换装界面缩略图：完好 + 正常状态（不含破损/精液差分）
   */
  window.buildHentaiDungeonOutfitThumbnailUrl = function (characterName, outfit) {
    var n = characterName != null ? String(characterName).trim() : '';
    var o = outfit != null ? String(outfit) : '常服';
    if (!n) return '';
    var rel = n + '/' + o + '/完好-正常状态.png';
    return R2_PREFIX + encodeURI(rel);
  };

  /**
   * 从立绘路径/URL 解析「默认服装」目录名。
   * 支持：仅服装名（如 常服）、或 角色名/服装/xxx.png 完整相对路径、或已带域名的 URL。
   * 无法解析时视为 常服。
   */
  function parseDefaultOutfitFromPortraitRef(pathOrUrl, characterName) {
    var name = (characterName || '').trim();
    var s = pathOrUrl != null ? String(pathOrUrl).trim() : '';
    if (!s) return '常服';
    if (s.indexOf('/') === -1 && HENTAI_DUNGEON_OUTFITS.indexOf(s) !== -1) return s;
    var path = s.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '');
    var parts = path.split('/').filter(function (x) {
      return x.length > 0;
    });
    if (parts.length < 3) return '常服';
    var p0 = parts[0];
    var p1 = parts[1];
    try {
      p0 = decodeURIComponent(p0);
    } catch (e0) {}
    try {
      p1 = decodeURIComponent(p1);
    } catch (e1) {}
    if (p0 !== name) return '常服';
    if (HENTAI_DUNGEON_OUTFITS.indexOf(p1) === -1) return '常服';
    return p1;
  }

  window.CHARACTER_PORTRAITS = {
    // 约定：可写完整相对路径，或仅写七种服装目录名之一（如 常服）；非 http(s) 会补 R2_PREFIX
    达芙妮: '常服',
    岚: '常服',
    普罗安妲: '常服',
    昼墨: '常服',
    黯: '常服',
    夜露: '常服',
    艾丽卡: '常服',
    清漓: '常服',
    '丝伊德·白': '常服',
    凌遥仙: '常服',
    月见遥: '常服',
  };

  /**
   * 在「仅初始服装可用」默认之上叠加。
   * 例如解锁更多套装：`{ 泳装: true, 浴衣: true }`；若要强制关掉某项则写 `false`。
   */
  window.CHARACTER_OUTFIT_HIDDEN_TAGS_EXCEPTIONS = {
    // 示例：达芙妮: { 泳装: true, 花嫁: true },
  };

  // 差分服装（按下标循环）：每个在 PORTRAITS 中的角色对应七种常服基准路径（相对路径，后文会补前缀）
  window.CHARACTER_PORTRAIT_VARIANTS = {};
  for (var _vn in window.CHARACTER_PORTRAITS) {
    if (!Object.prototype.hasOwnProperty.call(window.CHARACTER_PORTRAITS, _vn)) continue;
    window.CHARACTER_PORTRAIT_VARIANTS[_vn] = HENTAI_DUNGEON_OUTFITS.map(function (o) {
      return _vn + '/' + o + '/完好-正常状态.png';
    });
  }

  /**
   * 角色换装可用性（与 wardrobe 一致）。
   * 默认：仅 `CHARACTER_PORTRAITS` 路径中的**初始服装**为 true，其余六种为 false；再叠 `CHARACTER_OUTFIT_HIDDEN_TAGS_EXCEPTIONS`。
   * **true** = 可换装；**false** = 不可用。
   */
  window.CHARACTER_OUTFIT_HIDDEN_TAGS = {};
  (function () {
    var exc = window.CHARACTER_OUTFIT_HIDDEN_TAGS_EXCEPTIONS || {};
    for (var cn in window.CHARACTER_PORTRAITS) {
      if (!Object.prototype.hasOwnProperty.call(window.CHARACTER_PORTRAITS, cn)) continue;
      var portraitRef = window.CHARACTER_PORTRAITS[cn];
      var initialOutfit = parseDefaultOutfitFromPortraitRef(portraitRef, cn);
      var row = {};
      for (var di = 0; di < HENTAI_DUNGEON_OUTFITS.length; di++) {
        var ok = HENTAI_DUNGEON_OUTFITS[di];
        row[ok] = ok === initialOutfit;
      }
      var ex = exc[cn];
      if (ex && typeof ex === 'object') {
        for (var ek in ex) {
          if (Object.prototype.hasOwnProperty.call(ex, ek)) row[ek] = ex[ek];
        }
      }
      window.CHARACTER_OUTFIT_HIDDEN_TAGS[cn] = row;
    }
  })();

  /** 从当前 CHARACTER_PORTRAITS 解析该角色的默认（初始）服装名，供入队时同步 _portraitOutfit */
  window.getDefaultOutfitForCharacterName = function (characterName) {
    var ref =
      window.CHARACTER_PORTRAITS && characterName
        ? window.CHARACTER_PORTRAITS[characterName]
        : null;
    return parseDefaultOutfitFromPortraitRef(ref, characterName);
  };
  // 资源前缀处理：不以 http 开头的非空字符串补上 R2_PREFIX；仅服装名简写展开为 角色/服装/完好-正常状态.png
  (function () {
    const raw = window.CHARACTER_PORTRAITS;
    for (const name in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, name)) {
        const v = raw[name];
        if (v && typeof v === 'string' && v.length > 0 && v.indexOf('http') !== 0) {
          var rel =
            v.indexOf('/') === -1 && HENTAI_DUNGEON_OUTFITS.indexOf(v) !== -1
              ? name + '/' + v + '/完好-正常状态.png'
              : v;
          raw[name] = R2_PREFIX + rel;
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
