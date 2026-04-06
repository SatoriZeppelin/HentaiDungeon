/**
 * 色色地牢 - 文字区逻辑（独立一份 JS，不依赖构建）
 * 负责正文区字号、字体切换；可选 setStoryText / getStoryContent 供外部调用
 */
(function () {
  const SIZE_IDS = ['font-small', 'font-medium', 'font-large'];
  const SIZE_CLASS = { small: 'font-small', medium: 'font-medium', large: 'font-large' };
  const FAMILY_IDS = ['font-kaiti', 'font-songti', 'font-heiti', 'font-fangsong', 'font-yahei'];
  const FAMILY_CLASS = {
    kaiti: 'font-kaiti',
    songti: 'font-songti',
    heiti: 'font-heiti',
    fangsong: 'font-fangsong',
yahei: 'font-yahei',
  };

  function el(id) {
    return document.getElementById(id);
  }

  function setFontSize(size) {
    var content = el('story-content');
    if (!content) return;
    content.classList.remove('font-small', 'font-medium', 'font-large');
    content.classList.add(SIZE_CLASS[size] || 'font-medium');
    SIZE_IDS.forEach(function (id) {
      var btn = el(id);
      if (btn) btn.classList.toggle('active', id === 'font-' + size);
    });
  }

  function setFontFamily(family) {
    var content = el('story-content');
    if (!content) return;
    content.classList.remove('font-kaiti', 'font-songti', 'font-heiti', 'font-fangsong', 'font-yahei');
    content.classList.add(FAMILY_CLASS[family] || 'font-kaiti');
    FAMILY_IDS.forEach(function (id) {
      var btn = el(id);
      if (btn) btn.classList.toggle('active', id === 'font-' + family);
    });
  }

  function setStoryText(html) {
    var content = el('story-content');
    if (content) content.innerHTML = html != null ? html : '';
  }

  function getStoryContent() {
    var content = el('story-content');
    return content ? content.innerHTML : '';
  }

  function initStoryPanel() {
    var content = el('story-content');
    if (!content) return;
    SIZE_IDS.forEach(function (id) {
      var btn = el(id);
      if (btn)
        btn.addEventListener('click', function () {
          setFontSize(id.replace('font-', ''));
        });
    });
    FAMILY_IDS.forEach(function (id) {
      var btn = el(id);
      if (btn)
        btn.addEventListener('click', function () {
          setFontFamily(id.replace('font-', ''));
        });
    });
  }

  if (typeof window !== 'undefined') {
    window.setFontSize = setFontSize;
    window.setFontFamily = setFontFamily;
    window.setStoryText = setStoryText;
    window.getStoryContent = getStoryContent;
    window.initStoryPanel = initStoryPanel;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(initStoryPanel);
})();
