/**
 * 色色地牢 - 设置界面逻辑（独立脚本，不参与构建）
 * 负责设置面板的打开/关闭、关闭按钮与退出动画；对外暴露 openSettings / closeSettings / initSettings
 */
(function () {
  var SETTINGS_EXIT_MS = 150;

  function el(id) { return document.getElementById(id); }

  function openSettings() {
    var overlay = el('settings-overlay');
    var box = overlay ? overlay.querySelector('.settings-box') : null;
    if (box) box.classList.remove('settings-box-exit');
    if (overlay) overlay.removeAttribute('hidden');
  }

  function closeSettings() {
    var overlay = el('settings-overlay');
    var box = overlay ? overlay.querySelector('.settings-box') : null;
    if (!box || !overlay) {
      if (typeof $ !== 'undefined') $('.sidebar-btn[data-tab="settings"]').removeClass('active');
      return;
    }
    box.classList.add('settings-box-exit');
    function onEnd() {
      box.removeEventListener('animationend', onEnd);
      box.classList.remove('settings-box-exit');
      overlay.setAttribute('hidden', '');
      if (typeof $ !== 'undefined') $('.sidebar-btn[data-tab="settings"]').removeClass('active');
    }
    box.addEventListener('animationend', onEnd);
    setTimeout(onEnd, SETTINGS_EXIT_MS + 50);
  }

  function initSettings() {
    var btn = el('settings-close');
    if (btn) btn.addEventListener('click', closeSettings);
  }

  if (typeof window !== 'undefined') {
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.initSettings = initSettings;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(initSettings);
})();
