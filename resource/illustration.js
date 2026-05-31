/**
 * 角色立绘资源（Hugging Face 仓库 HentaiDungeonCharacterIllustration 目录）
 * 路径规则：{PORTRAIT_PREFIX}{角色名}/{服装}/{服装状态-精液状态}.png
 * 服装状态：完好 | 小破 | 中破 | 大破（对应 buff：轻微/中度/严重破损）
 * 精液状态：正常状态 | 轻度精浴 | 重度精浴（由 semenVolumeMl 分段）
 * 键：角色名，值：图片 URL、相对路径（如 达芙妮/常服/完好-正常状态.png），或仅服装目录名简写（如 常服，会展开为 角色名/常服/完好-正常状态.png）
 * 前缀：若值不以 http:// 或 https:// 开头，会自动补 PORTRAIT_PREFIX
 *
 * 立绘缓存：fetch(cache:'force-cache') + Blob URL + 可选 IndexedDB，减少重复下载。
 * 不限制页面来源，任意宿主（酒馆、本地预览等）均可请求立绘。
 */
(function () {
  /** 目录 HentaiDungeonCharacterIllustration；须含 resolve/main 方可被 fetch/img 当作原始文件拉取 */
  const PORTRAIT_PREFIX =
    'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonCharacterIllustration/';
  window.HENTAI_DUNGEON_PORTRAIT_PREFIX = PORTRAIT_PREFIX;
  /** @deprecated 兼容 app.js 等仍读取 R2_PREFIX 的代码 */
  window.R2_PREFIX = PORTRAIT_PREFIX;

  function isPortraitNetworkLoadAllowed() {
    return true;
  }
  window.isHentaiDungeonR2PortraitLoadAllowed = isPortraitNetworkLoadAllowed;
  window.HENTAI_DUNGEON_PORTRAIT_LOAD_ALLOWED_ORIGINS = [];

  /** 占位 1×1 透明图：立绘 img 在 blob 就绪前用，避免先请求 R2 再 fetch 造成双请求 */
  const TRANSPARENT_PIXEL_GIF = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
  window.HENTAI_DUNGEON_TRANSPARENT_PIXEL_GIF = TRANSPARENT_PIXEL_GIF;
  /** 设为 false 时仍使用直连 R2 URL（不调 fetch 缓存） */
  window.HENTAI_DUNGEON_USE_PORTRAIT_BLOB_CACHE = true;
  /**
   * 对托管立绘的 fetch 可追加固定版本参数以绕开旧 HTTP 缓存；持久缓存/内存缓存仍以 canonical（无参数）URL 为 key。
   */
  const PORTRAIT_FETCH_CACHE_BUST_VERSION = '20260516hf';
  window.HENTAI_DUNGEON_PORTRAIT_FETCH_CACHE_BUST_VERSION = PORTRAIT_FETCH_CACHE_BUST_VERSION;
  /** @deprecated */
  window.HENTAI_DUNGEON_R2_PORTRAIT_FETCH_CACHE_BUST_VERSION = PORTRAIT_FETCH_CACHE_BUST_VERSION;
  /** 设为 true 时把立绘像素写入 IndexedDB，刷新/重开仍可复用（用户清理站点数据会丢失） */
  window.HENTAI_DUNGEON_USE_PORTRAIT_PERSISTENT_CACHE = true;
  /** 持久缓存容量上限（字节），超出将按 LRU 淘汰 */
  window.HENTAI_DUNGEON_PORTRAIT_PERSISTENT_CACHE_MAX_BYTES = 200 * 1024 * 1024; // 200MB
  /** 持久缓存条目上限，超出将按 LRU 淘汰 */
  window.HENTAI_DUNGEON_PORTRAIT_PERSISTENT_CACHE_MAX_ITEMS = 500;

  var _portraitBlobByUrl = Object.create(null);
  var _portraitInflight = Object.create(null);
  var _portraitNotFoundByUrl = Object.create(null);
  var _idbOpenPromise = null;

  function canUseIndexedDb() {
    try {
      return (
        window.HENTAI_DUNGEON_USE_PORTRAIT_PERSISTENT_CACHE !== false &&
        typeof indexedDB !== 'undefined' &&
        indexedDB &&
        typeof indexedDB.open === 'function'
      );
    } catch (e) {
      return false;
    }
  }

  function idbOpen() {
    if (!canUseIndexedDb()) return Promise.resolve(null);
    if (_idbOpenPromise) return _idbOpenPromise;
    _idbOpenPromise = new Promise(function (resolve) {
      try {
        var req = indexedDB.open('hentai_dungeon_portrait_cache_v2', 1);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains('portraits')) {
            var store = db.createObjectStore('portraits', { keyPath: 'url' });
            store.createIndex('lastAccess', 'lastAccess', { unique: false });
          }
          if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta', { keyPath: 'key' });
          }
        };
        req.onsuccess = function () {
          resolve(req.result);
        };
        req.onerror = function () {
          console.warn('[HentaiDungeon] 打开 IndexedDB 失败，已禁用持久缓存', req.error);
          resolve(null);
        };
      } catch (e) {
        console.warn('[HentaiDungeon] 打开 IndexedDB 异常，已禁用持久缓存', e);
        resolve(null);
      }
    });
    return _idbOpenPromise;
  }

  function idbGetTotalBytes(db) {
    return new Promise(function (resolve) {
      try {
        var tx = db.transaction(['meta'], 'readonly');
        var st = tx.objectStore('meta');
        var req = st.get('totalBytes');
        req.onsuccess = function () {
          var v = req.result && typeof req.result.value === 'number' ? req.result.value : 0;
          resolve(v);
        };
        req.onerror = function () {
          resolve(0);
        };
      } catch (e) {
        resolve(0);
      }
    });
  }

  function idbSetTotalBytes(db, next) {
    return new Promise(function (resolve) {
      try {
        var tx = db.transaction(['meta'], 'readwrite');
        var st = tx.objectStore('meta');
        st.put({ key: 'totalBytes', value: next });
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          resolve();
        };
      } catch (e) {
        resolve();
      }
    });
  }

  function idbTouchLastAccess(db, url) {
    try {
      var tx = db.transaction(['portraits'], 'readwrite');
      var st = tx.objectStore('portraits');
      var req = st.get(url);
      req.onsuccess = function () {
        var row = req.result;
        if (!row) return;
        row.lastAccess = Date.now();
        st.put(row);
      };
    } catch (e) {}
  }

  function idbGetPortraitRow(db, url) {
    return new Promise(function (resolve) {
      try {
        var tx = db.transaction(['portraits'], 'readonly');
        var st = tx.objectStore('portraits');
        var req = st.get(url);
        req.onsuccess = function () {
          resolve(req.result || null);
        };
        req.onerror = function () {
          resolve(null);
        };
      } catch (e) {
        resolve(null);
      }
    });
  }

  function idbCount(db) {
    return new Promise(function (resolve) {
      try {
        var tx = db.transaction(['portraits'], 'readonly');
        var st = tx.objectStore('portraits');
        var req = st.count();
        req.onsuccess = function () {
          resolve(req.result || 0);
        };
        req.onerror = function () {
          resolve(0);
        };
      } catch (e) {
        resolve(0);
      }
    });
  }

  function idbEvictIfNeeded(db) {
    var maxBytes =
      typeof window.HENTAI_DUNGEON_PORTRAIT_PERSISTENT_CACHE_MAX_BYTES === 'number'
        ? window.HENTAI_DUNGEON_PORTRAIT_PERSISTENT_CACHE_MAX_BYTES
        : 0;
    var maxItems =
      typeof window.HENTAI_DUNGEON_PORTRAIT_PERSISTENT_CACHE_MAX_ITEMS === 'number'
        ? window.HENTAI_DUNGEON_PORTRAIT_PERSISTENT_CACHE_MAX_ITEMS
        : 0;
    if (!maxBytes && !maxItems) return Promise.resolve();

    return Promise.all([idbGetTotalBytes(db), idbCount(db)]).then(function (arr) {
      var totalBytes = arr[0] || 0;
      var count = arr[1] || 0;
      if ((maxBytes && totalBytes <= maxBytes) && (maxItems && count <= maxItems)) return;
      if (!maxBytes && maxItems && count <= maxItems) return;
      if (!maxItems && maxBytes && totalBytes <= maxBytes) return;

      return new Promise(function (resolve) {
        try {
          var tx = db.transaction(['portraits'], 'readwrite');
          var st = tx.objectStore('portraits');
          var idx = st.index('lastAccess');
          var removedBytes = 0;
          var removedCount = 0;
          var cursorReq = idx.openCursor();
          cursorReq.onsuccess = function () {
            var cursor = cursorReq.result;
            if (!cursor) return;
            if ((maxBytes && totalBytes - removedBytes <= maxBytes) && (maxItems && count - removedCount <= maxItems)) {
              return;
            }
            if (!maxBytes && maxItems && count - removedCount <= maxItems) return;
            if (!maxItems && maxBytes && totalBytes - removedBytes <= maxBytes) return;
            var row = cursor.value;
            removedBytes += row && row.sizeBytes ? row.sizeBytes : 0;
            removedCount += 1;
            cursor.delete();
            cursor.continue();
          };
          tx.oncomplete = function () {
            var nextTotal = Math.max(0, totalBytes - removedBytes);
            idbSetTotalBytes(db, nextTotal).then(resolve);
          };
          tx.onerror = function () {
            resolve();
          };
        } catch (e) {
          resolve();
        }
      });
    });
  }

  function idbPutBlob(db, url, blob) {
    return new Promise(function (resolve) {
      try {
        var size = blob && blob.size ? blob.size : 0;
        var now = Date.now();
        // 先读旧值，更新 totalBytes
        var tx = db.transaction(['portraits', 'meta'], 'readwrite');
        var st = tx.objectStore('portraits');
        var meta = tx.objectStore('meta');
        var oldReq = st.get(url);
        oldReq.onsuccess = function () {
          var old = oldReq.result;
          var oldSize = old && old.sizeBytes ? old.sizeBytes : 0;
          st.put({ url: url, blob: blob, sizeBytes: size, lastAccess: now });
          var tbReq = meta.get('totalBytes');
          tbReq.onsuccess = function () {
            var cur = tbReq.result && typeof tbReq.result.value === 'number' ? tbReq.result.value : 0;
            var next = Math.max(0, cur - oldSize + size);
            meta.put({ key: 'totalBytes', value: next });
          };
          tbReq.onerror = function () {
            meta.put({ key: 'totalBytes', value: size });
          };
        };
        oldReq.onerror = function () {
          st.put({ url: url, blob: blob, sizeBytes: size, lastAccess: now });
        };
        tx.oncomplete = function () {
          idbEvictIfNeeded(db).then(resolve);
        };
        tx.onerror = function () {
          resolve();
        };
      } catch (e) {
        resolve();
      }
    });
  }

  function idbPutNotFound(db, url) {
    return new Promise(function (resolve) {
      try {
        var now = Date.now();
        var tx = db.transaction(['portraits'], 'readwrite');
        var st = tx.objectStore('portraits');
        st.put({ url: url, notFound: true, sizeBytes: 0, lastAccess: now });
        tx.oncomplete = function () {
          resolve();
        };
        tx.onerror = function () {
          resolve();
        };
      } catch (e) {
        resolve();
      }
    });
  }

  function isManagedPortraitUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.indexOf(PORTRAIT_PREFIX) === 0) return true;
    // 兼容旧存档/缓存中的 R2 直链，仍走 blob 缓存管线
    return url.indexOf('https://pub-ef9579c191ec47599328a02c30d8e6f8.r2.dev/') === 0;
  }
  function isR2ManagedPortraitUrl(url) {
    return isManagedPortraitUrl(url);
  }

  function isTransparentPortraitPlaceholder(src) {
    if (!src) return true;
    return src === TRANSPARENT_PIXEL_GIF || src.indexOf('data:image/gif') === 0;
  }

  /** fetch/负缓存失败时仍用直连 URL 显示（与侧栏 background-image 一致，不依赖 CORS fetch） */
  function portraitDisplayUrlOrDirect(canonicalUrl, displayUrl) {
    if (
      isManagedPortraitUrl(canonicalUrl) &&
      isTransparentPortraitPlaceholder(displayUrl)
    ) {
      return canonicalUrl;
    }
    return displayUrl;
  }

  function toPortraitCanonicalUrl(url) {
    try {
      var s = String(url || '');
      if (!s) return '';
      // 仅做简单裁剪：去掉 ? 与 #；避免同图因参数不同而重复存储
      var q = s.indexOf('?');
      var h = s.indexOf('#');
      var cut = -1;
      if (q !== -1 && h !== -1) cut = Math.min(q, h);
      else if (q !== -1) cut = q;
      else if (h !== -1) cut = h;
      return cut === -1 ? s : s.slice(0, cut);
    } catch (e) {
      return String(url || '');
    }
  }

  function withFetchCacheBust(url) {
    try {
      var s = String(url || '');
      if (!s) return s;
      if (s.indexOf('hdv=') !== -1) return s;
      var joiner = s.indexOf('?') === -1 ? '?' : '&';
      return s + joiner + 'hdv=' + encodeURIComponent(PORTRAIT_FETCH_CACHE_BUST_VERSION);
    } catch (e) {
      return String(url || '');
    }
  }

  function getPortraitDisplayUrlPromise(httpUrl) {
    if (!isR2ManagedPortraitUrl(httpUrl)) return Promise.resolve(httpUrl);
    var canonicalUrl = toPortraitCanonicalUrl(httpUrl);
    if (!isPortraitNetworkLoadAllowed()) return Promise.resolve(TRANSPARENT_PIXEL_GIF);
    if (window.HENTAI_DUNGEON_USE_PORTRAIT_BLOB_CACHE === false) return Promise.resolve(httpUrl);
    if (_portraitNotFoundByUrl[canonicalUrl]) {
      return Promise.resolve(portraitDisplayUrlOrDirect(canonicalUrl, TRANSPARENT_PIXEL_GIF));
    }
    if (_portraitBlobByUrl[canonicalUrl]) return Promise.resolve(_portraitBlobByUrl[canonicalUrl]);
    if (_portraitInflight[canonicalUrl]) return _portraitInflight[canonicalUrl];
    var p = idbOpen()
      .then(function (db) {
        if (!db) return null;
        return idbGetPortraitRow(db, canonicalUrl).then(function (row) {
          if (!row) return null;
          if (row.notFound) {
            _portraitNotFoundByUrl[canonicalUrl] = 1;
            idbTouchLastAccess(db, canonicalUrl);
            return portraitDisplayUrlOrDirect(canonicalUrl, TRANSPARENT_PIXEL_GIF);
          }
          if (!row.blob) return null;
          // 命中持久缓存：更新访问时间、生成 blob URL
          idbTouchLastAccess(db, canonicalUrl);
          try {
            var bUrl = URL.createObjectURL(row.blob);
            _portraitBlobByUrl[canonicalUrl] = bUrl;
            return bUrl;
          } catch (e) {
            return null;
          }
        });
      })
      .then(function (maybe) {
        if (maybe) return maybe;
        // 未命中：走网络
        var fetchUrl = withFetchCacheBust(httpUrl);
        return fetch(fetchUrl, { mode: 'cors', credentials: 'omit', cache: 'force-cache' })
          .then(function (r) {
            if (r.status === 404) {
              var e404 = new Error('HTTP 404');
              e404.code = 'NOT_FOUND';
              throw e404;
            }
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.blob();
          })
          .then(function (blob) {
            var bUrl = URL.createObjectURL(blob);
            _portraitBlobByUrl[canonicalUrl] = bUrl;
            // 异步写入持久缓存，不阻塞渲染
            idbOpen().then(function (db) {
              if (!db) return;
              idbPutBlob(db, canonicalUrl, blob);
            });
            return bUrl;
          });
      })
      .then(function (displayUrl) {
        delete _portraitInflight[canonicalUrl];
        return displayUrl;
      })
      .catch(function (e) {
        delete _portraitInflight[canonicalUrl];
        if (e && e.code === 'NOT_FOUND') {
          _portraitNotFoundByUrl[canonicalUrl] = 1;
          idbOpen().then(function (db) {
            if (!db) return;
            idbPutNotFound(db, canonicalUrl);
          });
          console.warn('[HentaiDungeon] 立绘 fetch 404，已负缓存；img 将尝试直连', canonicalUrl);
          return portraitDisplayUrlOrDirect(canonicalUrl, TRANSPARENT_PIXEL_GIF);
        }
        console.warn('[HentaiDungeon] 立绘缓存失败，使用直连 URL', httpUrl, e);
        return portraitDisplayUrlOrDirect(canonicalUrl, httpUrl);
      });
    _portraitInflight[canonicalUrl] = p;
    return p;
  }

  /**
   * 将 img 绑定为「先占位、再 blob 显示」；canonical R2 URL 写入 data-hd-portrait（供存档/细则读取，勿用 blob: 写入 ch.avatar）。
   * @param {HTMLImageElement} imgEl
   * @param {string} httpUrl buildHentaiDungeonPortraitUrl / CHARACTER_PORTRAITS 等给出的完整 https 地址
   */
  window.bindHentaiDungeonCachedPortrait = function (imgEl, httpUrl) {
    if (!imgEl || !httpUrl) return;
    httpUrl = String(httpUrl);
    var canonicalUrl = isR2ManagedPortraitUrl(httpUrl) ? toPortraitCanonicalUrl(httpUrl) : httpUrl;
    imgEl.setAttribute('data-hd-portrait', canonicalUrl);
    if (isR2ManagedPortraitUrl(httpUrl) && !isPortraitNetworkLoadAllowed()) {
      imgEl.src = TRANSPARENT_PIXEL_GIF;
      return;
    }
    if (window.HENTAI_DUNGEON_USE_PORTRAIT_BLOB_CACHE === false || !isR2ManagedPortraitUrl(httpUrl)) {
      imgEl.src = canonicalUrl;
      return;
    }
    if (
      imgEl.getAttribute('data-hd-portrait') === canonicalUrl &&
      imgEl.src &&
      imgEl.src.indexOf('blob:') === 0 &&
      _portraitBlobByUrl[canonicalUrl] &&
      imgEl.src === _portraitBlobByUrl[canonicalUrl]
    ) {
      return;
    }
    imgEl.src = TRANSPARENT_PIXEL_GIF;
    getPortraitDisplayUrlPromise(canonicalUrl).then(function (displayUrl) {
      if (!imgEl.isConnected) return;
      if (imgEl.getAttribute('data-hd-portrait') !== canonicalUrl) return;
      imgEl.src = portraitDisplayUrlOrDirect(canonicalUrl, displayUrl);
    });
  };

  /** 容器内所有带 data-hd-portrait 的 img 应用缓存绑定 */
  window.bindHentaiDungeonCachedPortraitsInRoot = function (root) {
    if (!root || !root.querySelectorAll) return;
    var list = root.querySelectorAll('img[data-hd-portrait]');
    for (var i = 0; i < list.length; i++) {
      var img = list[i];
      var u = img.getAttribute('data-hd-portrait');
      if (u) window.bindHentaiDungeonCachedPortrait(img, u);
    }
  };

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
   * 根据角色与状态生成完整立绘 URL（Hugging Face）。
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
      return PORTRAIT_PREFIX + encodeURI(rel);
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
    return PORTRAIT_PREFIX + encodeURI(rel);
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
    // 约定：可写完整相对路径，或仅写七种服装目录名之一（如 常服）；非 http(s) 会补 PORTRAIT_PREFIX
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
  // 资源前缀处理：不以 http 开头的非空字符串补上 PORTRAIT_PREFIX；仅服装名简写展开为 角色/服装/完好-正常状态.png
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
          raw[name] = PORTRAIT_PREFIX + rel;
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
          if (v2 && typeof v2 === 'string' && v2.length > 0 && v2.indexOf('http') !== 0) arr[i] = PORTRAIT_PREFIX + v2;
        }
      }
    }
  })();
})();
