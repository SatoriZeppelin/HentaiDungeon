/**
 * 开局界面：先显示封面（标题 HentaiDungeon / 色色地牢），点击后进入开始界面（新游戏 / 继续游戏 / 读取存档），选择后进入主内容。
 * 封面别名为「封面」；开始界面从上到下竖直排列选项，格式为哥特体英文 + 对应中文小字。
 * 背景与参考 index.html（阿斯林顿的妹神官）的 body 底色一致。
 */
(function () {
  'use strict';

  /** 全屏切换（documentElement），供开局与主界面共用 */
  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    );
  }
  function isFullscreen() {
    return !!getFullscreenElement();
  }
  function toggleFullscreen() {
    var root = document.documentElement;
    if (isFullscreen()) {
      var d = document;
      var exitFn = d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen;
      if (exitFn) return exitFn.call(d).catch(function () {});
    } else {
      var req = root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullScreen || root.msRequestFullscreen;
      if (req) return req.call(root).catch(function () {});
    }
  }
  var FS_SVG_ENTER =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
  var FS_SVG_EXIT =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';
  function syncFullscreenButtonIcons() {
    var active = isFullscreen();
    var html = active ? FS_SVG_EXIT : FS_SVG_ENTER;
    document.querySelectorAll('.hentai-fs-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.title = active ? '退出全屏' : '全屏';
      btn.setAttribute('aria-label', active ? '退出全屏' : '全屏');
      var inner = btn.querySelector('.hentai-fs-btn-inner');
      if (inner) inner.innerHTML = html;
    });
  }
  function createFullscreenButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hentai-fs-btn';
    btn.innerHTML = '<span class="hentai-fs-btn-inner"></span>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFullscreen();
    });
    syncFullscreenButtonIcons();
    return btn;
  }
  if (typeof window !== 'undefined') {
    window.色色地牢_toggleFullscreen = toggleFullscreen;
    window.色色地牢_syncFullscreenButtons = syncFullscreenButtonIcons;
    window.色色地牢_createFullscreenButton = createFullscreenButton;
  }
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(function (ev) {
    document.addEventListener(ev, syncFullscreenButtonIcons);
  });

  const OVERLAY_ID = 'begining-overlay';
  /** 封面：标题界面别称 */
  const COVER_ID = 'begining-cover';
  /** 开始界面：选项菜单 */
  const START_MENU_ID = 'begining-start';
  /** 与参考 html 的 body 背景一致 */
  const BACKGROUND_STYLE = 'radial-gradient(1200px 800px at 50% 0%, #14120d, #0b0a08 60%, #060605)';

  /** 开始界面选项：英文（哥特体）+ 中文（小字） */
  const START_OPTIONS = [
    { en: 'New Game', zh: '新游戏', id: 'new-game' },
    { en: 'Continue Game', zh: '继续游戏', id: 'continue-game' },
    { en: 'Load Save', zh: '读取存档', id: 'load-save' },
    { en: 'Test Mode', zh: '测试模式', id: 'test-mode' },
  ];

  /** 新开局选项界面（参考 色色地牢参考-开局.html） */
  var NEW_GAME_SETUP_ID = 'begining-new-game';

  /** 新开局：根据 CHARACTERS 的 from 自动填入各分区。保留幻界/OC/更多角色三层；无 from 的不显示。 */
  var NEW_GAME_SECTION_ORDER = ['幻界', 'OC', '更多角色'];
  function getNewGameCharacterData() {
    var sections = { 幻界: [], OC: [], 更多角色: [] };
    var chars = typeof window.CHARACTERS === 'object' && window.CHARACTERS ? window.CHARACTERS : {};
    var portraits =
      typeof window.CHARACTER_PORTRAITS === 'object' && window.CHARACTER_PORTRAITS ? window.CHARACTER_PORTRAITS : {};
    Object.keys(chars).forEach(function (key) {
      var ch = chars[key];
      if (!ch || !ch.name) return;
      var fromRaw = ch.from && String(ch.from).trim();
      if (!fromRaw) return; /* 没有 from 则不显示在选择初始角色界面 */
      var from = sections.hasOwnProperty(fromRaw) ? fromRaw : '更多角色';
      var avatar = (ch.avatar && String(ch.avatar)) || (portraits[ch.name] && String(portraits[ch.name])) || '';
      sections[from].push({
        name: ch.name,
        type: (ch.introduce && String(ch.introduce).trim()) || ch.name,
        avatar: avatar,
      });
    });
    return sections;
  }
  var NEW_GAME_DIFFICULTIES = [
    { id: '休闲', uid: 17, title: '休闲模式', desc: '怪物生命100%，伤害60%\n更高的色情行动概率\n享受剧情与画面' },
    { id: '普通', uid: 14, title: '普通模式', desc: '均衡战斗体验\n中等色情行动概率\n推荐首次游玩' },
    { id: '困难', uid: 18, title: '困难模式', desc: '怪物+20%生命与伤害\n更低色情行动概率\n追求极限挑战' },
  ];
  /** 难度图标：休闲(简单) 笑脸、普通 盾牌、困难 骷髅 (svgrepo) */
  var DIFF_ICON_SVG_STYLE = 'width:28px;height:28px;display:block;margin:0 auto;';
  var HAPPY_FACE_SVG =
    '<svg viewBox="0 0 24 24" style="' +
    DIFF_ICON_SVG_STYLE +
    '"><circle cx="12" cy="12" r="10" fill="none" stroke="#3d3529" stroke-width="2"/><path d="M7.3 14C8.07 15.76 9.99 17 12 17s3.91-1.25 4.69-3" fill="none" stroke="#3d3529" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="9" r="1.2" fill="#3d3529"/><circle cx="15" cy="9" r="1.2" fill="#3d3529"/></svg>';
  var SHIELD_SVG_PATH =
    'M11.302 21.6149C11.5234 21.744 11.6341 21.8086 11.7903 21.8421C11.9116 21.8681 12.0884 21.8681 12.2097 21.8421C12.3659 21.8086 12.4766 21.744 12.698 21.6149C14.646 20.4784 20 16.9084 20 12V6.6C20 6.04207 20 5.7631 19.8926 5.55048C19.7974 5.36198 19.6487 5.21152 19.4613 5.11409C19.25 5.00419 18.9663 5.00084 18.3988 4.99413C15.4272 4.95899 13.7136 4.71361 12 3C10.2864 4.71361 8.57279 4.95899 5.6012 4.99413C5.03373 5.00084 4.74999 5.00419 4.53865 5.11409C4.35129 5.21152 4.20259 5.36198 4.10739 5.55048C4 5.7631 4 6.04207 4 6.6V12C4 16.9084 9.35396 20.4784 11.302 21.6149Z';
  var SKULL_BONES_SVG_PATH =
    'M12 0.034668C7.58171 0.0346494 3.99997 3.61637 3.99997 8.03467V11.1676C3.4725 11.2483 2.80957 11.4137 2.17083 11.7568C1.08501 12.3401 0.50669 13.3461 0.233669 14.274C-0.0362926 15.1914 -0.0467 16.1531 0.113639 16.8458C0.118576 16.8671 0.124212 16.8883 0.130538 16.9092C0.218209 17.1997 0.354168 17.4516 0.529981 17.6665C0.403319 17.8344 0.330281 18.004 0.289019 18.1107C0.193097 18.3589 0.134008 18.6372 0.0963214 18.9034C0.019985 19.4427 0.0101057 20.0899 0.0599281 20.7115C0.109221 21.3265 0.222428 21.9868 0.429691 22.5314C0.532653 22.802 0.678474 23.097 0.892953 23.346C1.11234 23.6006 1.45661 23.8639 1.93303 23.9095C4.23932 24.1307 5.4901 23.767 6.37946 23.0827C6.65738 22.8689 6.92378 22.5927 7.099 22.4111C7.15333 22.3548 7.19889 22.3075 7.23331 22.2741C7.41386 22.0985 7.5401 22.0118 7.71766 21.9583L7.71848 21.958L11.9945 20.6636L15.7347 21.8385L15.7347 21.8386L15.7461 21.842C15.8997 21.8883 16.1091 21.9976 16.4573 22.214C16.5334 22.2613 16.6161 22.3137 16.7045 22.3697L16.705 22.37L16.705 22.37C16.9809 22.5448 17.3112 22.7541 17.6633 22.9496C18.634 23.4884 19.8954 23.9999 21.5872 23.9999C22.5574 23.9999 23.1504 23.3076 23.4545 22.7074C23.7665 22.0916 23.9174 21.3329 23.9575 20.6153C23.9982 19.8892 23.9306 19.1154 23.7354 18.4403C23.6616 18.1849 23.5589 17.9075 23.4155 17.6421C24.0268 16.8215 24.0539 15.7398 23.8913 14.8992C23.6653 13.7309 23.0074 12.5018 22.2171 11.861C21.5427 11.3142 20.6057 11.1603 20 11.1074V8.03467C20 3.6164 16.4183 0.0346866 12 0.034668ZM5.07993 13.0901L5.09652 13.0906C5.11981 13.092 5.1432 13.0927 5.16663 13.0927C5.67074 13.0927 5.99996 13.4718 5.99996 13.8436V14.6496C5.99996 15.0944 6.29378 15.4857 6.72093 15.6099L8.52353 16.1336L6.48292 16.7515C5.2744 16.5242 4.05304 16.5428 3.03394 16.6916C2.58867 16.6355 2.33176 16.5563 2.188 16.4802C2.09581 16.4315 2.06934 16.3975 2.05409 16.358C1.98354 16.0142 1.97995 15.4244 2.15233 14.8385C2.32797 14.2416 2.64696 13.7713 3.11731 13.5187C3.55209 13.2851 4.04812 13.1722 4.46185 13.1229C4.66381 13.0988 4.83426 13.0912 4.95099 13.0895C5.00906 13.0887 5.053 13.0894 5.07993 13.0901ZM14.9059 16.3199L12.2848 17.0844L6.82116 18.7388C6.65783 18.7882 6.48455 18.7951 6.31783 18.7586C5.25172 18.5256 4.12357 18.5411 3.21081 18.6878C2.75081 18.7618 2.37932 18.8636 2.11626 18.9644C2.10306 19.0216 2.08923 19.0943 2.07658 19.1837C2.02497 19.5484 2.01289 20.0445 2.05353 20.5517C2.09471 21.0654 2.1844 21.5192 2.29891 21.8201C2.31664 21.8667 2.33361 21.906 2.34924 21.9385C4.20552 22.0865 4.83662 21.7463 5.15988 21.4976C5.31575 21.3777 5.41118 21.278 5.54345 21.1399L5.54346 21.1399C5.62213 21.0577 5.71384 20.9619 5.83905 20.8402C6.13969 20.5479 6.53666 20.2256 7.13986 20.0435L11.7102 18.6601C11.7259 18.6553 11.7416 18.651 11.7574 18.647L18.4002 16.986C18.5496 16.9487 18.7056 16.9463 18.856 16.9792C19.642 17.1507 20.753 17.0449 21.5612 16.6422C21.8688 16.4889 22.0891 16.1131 21.9277 15.279C21.7684 14.4556 21.2995 13.6918 20.9574 13.4145C20.7755 13.267 20.3573 13.1439 19.8017 13.0977C19.5548 13.0772 19.3277 13.0752 19.1621 13.0786C19.0799 13.0803 19.0147 13.0833 18.9718 13.0857L18.9435 13.0874C18.907 13.0909 18.8702 13.0927 18.8333 13.0927C18.3292 13.0927 18 13.4718 18 13.8436V14.6017V14.6496C18 15.0915 17.7099 15.481 17.2866 15.6076L14.9126 16.3179L14.9059 16.3199L14.9059 16.3199ZM15 13V14.2042L16 13.905V13.8436C16 12.577 16.8628 11.5559 18 11.2148V8.03467C18 4.72097 15.3137 2.03468 12 2.03467C8.68627 2.03465 5.99997 4.72095 5.99997 8.03467V11.2148C7.13715 11.5559 7.99996 12.577 7.99996 13.8436V13.8988L8.99997 14.1894V13C8.99997 12.4477 9.44768 12 9.99997 12C10.5523 12 11 12.4477 11 13V14.3599H12H13V13C13 12.4477 13.4477 12 14 12C14.5523 12 15 12.4477 15 13ZM2.16762 18.8031C2.16787 18.8038 2.16467 18.8118 2.15723 18.8249C2.16364 18.809 2.16736 18.8024 2.16762 18.8031ZM16.3289 19.9288L15.685 19.7265L18.6718 18.9797C19.607 19.1359 20.7222 19.0609 21.7221 18.7313C21.7524 18.8034 21.7837 18.8906 21.8141 18.9956C21.936 19.4175 21.991 19.9608 21.9607 20.5035C21.9298 21.0547 21.816 21.5162 21.6704 21.8035C21.6121 21.9186 21.5677 21.9746 21.542 21.9998C20.3123 21.991 19.3997 21.626 18.634 21.201C18.3372 21.0362 18.0787 20.8725 17.8143 20.705C17.7155 20.6424 17.6159 20.5793 17.5132 20.5155C17.1714 20.303 16.7623 20.0604 16.3289 19.9288ZM21.517 22.0178C21.5168 22.0167 21.5218 22.0125 21.5325 22.0084C21.5226 22.0168 21.5172 22.0189 21.517 22.0178ZM11 9.00003C11 10.1046 9.10583 11 8.00199 11C6.98775 11 6.99365 10.2441 7.00129 9.26451V9.26443C7.00196 9.17792 7.00265 9.08966 7.00265 9.00003C7.00265 7.89546 7.89749 7.00003 9.00133 7.00003C10.1052 7.00003 11 7.89546 11 9.00003ZM16.9974 9.00003C16.9974 9.08969 16.998 9.17797 16.9987 9.26451C17.0064 10.2441 17.0123 11 15.998 11C14.8942 11 13 10.1046 13 9.00003C13 7.89546 13.8948 7.00003 14.9987 7.00003C16.1025 7.00003 16.9974 7.89546 16.9974 9.00003Z';
  var NEW_GAME_AREAS = [
    {
      id: '艾尔瑟斯森林',
      title: '艾尔瑟斯森林',
      desc: '古老密林深处的腐化蔓延\n妖异的花香与黏稠的藤蔓',
      hint: '精灵(友方) · 腐化植物 · 腐化动物 · 触手',
    },
    {
      id: '格里莫瓦王国旧都',
      title: '格里莫瓦旧都',
      desc: '覆灭王国的残骸与白骨\n徘徊的亡魂与觊觎的盗墓者',
      hint: '亡灵 · 野兽 · 寻宝者',
    },
    {
      id: '拉文斯庄园',
      title: '拉文斯庄园',
      desc: '永夜笼罩的贵族宅邸\n优雅的猎食者与忠诚的仆从',
      hint: '吸血鬼贵族 · 仆从 · 活化物品',
    },
    {
      id: '地狱边缘',
      title: '地狱边缘',
      desc: '炼狱与现世的交界裂隙\n恶魔与堕落者的欲望乐园',
      hint: '恶魔 · 堕落天使 · 魔化生物',
    },
    {
      id: '随机',
      title: '✦ 命运抉择 ✦',
      desc: '将目的地交由星辰裁决\n命运的丝线将引导你的脚步',
      hint: '',
      isFate: true,
    },
  ];
  var NEW_GAME_BLESSINGS = [
    { id: '获得200金币', title: '财富之赐', desc: '获得200金币' },
    { id: '随机一名角色提升2级', title: '成长之光', desc: '随机一名角色提升2级' },
    { id: '获得一件随机遗物', title: '神秘馈赠', desc: '获得一件随机遗物' },
    { id: '获得随机第三名队员', title: '命运邂逅', desc: '获得随机第三名队员' },
  ];

  var GOTHIC_FONT = '"UnifrakturMaguntia", serif';
  var OPTION_EN_SIZE = 'clamp(20px, 3.2vw, 32px)';
  var OPTION_ZH_SIZE = 'clamp(12px, 1.8vw, 16px)';

  function createOptionRow(opt) {
    var block = document.createElement('div');
    block.className = 'begining-option';
    block.dataset.optionId = opt.id;
    block.style.cssText =
      'text-align:left;cursor:pointer;margin:0.6em 0;color:#e8e0d0;' + 'transition:opacity 0.2s, transform 0.2s;';
    block.setAttribute('role', 'button');
    block.setAttribute('aria-label', opt.zh);

    var enEl = document.createElement('div');
    enEl.textContent = opt.en;
    enEl.style.cssText =
      'font-family:' +
      GOTHIC_FONT +
      ';font-size:' +
      OPTION_EN_SIZE +
      ';font-weight:700;letter-spacing:0.04em;margin:0;';
    block.appendChild(enEl);

    var zhEl = document.createElement('div');
    zhEl.textContent = opt.zh;
    zhEl.style.cssText =
      'font-size:' + OPTION_ZH_SIZE + ';color:rgba(232,224,208,0.85);margin:0.25em 0 0;font-family:serif;';
    block.appendChild(zhEl);

    block.addEventListener('mouseenter', function () {
      block.style.opacity = '1';
      block.style.transform = 'scale(1.05)';
    });
    block.addEventListener('mouseleave', function () {
      block.style.opacity = '';
      block.style.transform = '';
    });
    return block;
  }

  /** 构建新开局选项界面（参考 色色地牢参考-开局.html：进度条 + 4 步 角色/难度/区域/祝福） */
  function buildNewGameSetupPanel(overlayRef, startMenuRef, goBackToStartMenu) {
    var panel = document.createElement('div');
    panel.id = NEW_GAME_SETUP_ID;
    var flipStyleEl = document.createElement('style');
    flipStyleEl.textContent =
      '.char-card-flip.selected .char-card-flip-inner{transform:rotateY(180deg);}' +
      '.new-game-page{will-change:opacity;}' +
      '.new-game-area-cards-row{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;align-items:stretch;' +
      'gap:clamp(10px,2vw,18px);width:100%;max-width:100%;box-sizing:border-box;}' +
      '.new-game-area-cards-row .new-game-area-pick-card{flex:1 1 0;min-width:140px;max-width:220px;}' +
      '@media (min-width:1000px){' +
      '.new-game-area-cards-row .new-game-area-pick-card[data-area="艾尔瑟斯森林"]{order:1}' +
      '.new-game-area-cards-row .new-game-area-pick-card[data-area="格里莫瓦王国旧都"]{order:2}' +
      '.new-game-area-cards-row .new-game-area-pick-card[data-area="随机"]{order:3}' +
      '.new-game-area-cards-row .new-game-area-pick-card[data-area="拉文斯庄园"]{order:4}' +
      '.new-game-area-cards-row .new-game-area-pick-card[data-area="地狱边缘"]{order:5}' +
      '}' +
      '@media (max-width:900px){.new-game-area-cards-row .new-game-area-pick-card{flex:1 1 calc(50% - 12px);max-width:none;}}' +
      '@media (max-width:400px){.new-game-area-cards-row .new-game-area-pick-card{flex:1 1 100%;max-width:min(100%,340px);}}' +
      '.new-game-bless-cards-row{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;align-items:stretch;' +
      'gap:clamp(10px,2vw,18px);width:100%;max-width:100%;box-sizing:border-box;}' +
      '.new-game-bless-cards-row .new-game-bless-pick-card{flex:1 1 0;min-width:150px;max-width:240px;}' +
      '@media (max-width:900px){.new-game-bless-cards-row .new-game-bless-pick-card{flex:1 1 calc(50% - 12px);max-width:none;}}' +
      '@media (max-width:400px){.new-game-bless-cards-row .new-game-bless-pick-card{flex:1 1 100%;max-width:min(100%,340px);}}';
    panel.appendChild(flipStyleEl);
    panel.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:flex;flex-direction:column;' +
      'opacity:0;pointer-events:none;transition:opacity 0.4s ease;overflow:auto;cursor:default;box-sizing:border-box;';

    /* 亮堂风格：浅色背景 + 深色文字，金/棕强调 */
    var frameStyle =
      'width:100%;height:100%;min-height:100%;display:flex;flex-direction:column;' +
      'background:linear-gradient(180deg, #f8f4ec 0%, #ebe4d8 40%, #e2d9c8 100%);' +
      'border:1px solid rgba(139,115,32,0.25);border-radius:0;padding:16px 20px;box-sizing:border-box;';
    var innerStyle =
      'background:rgba(255,252,245,0.85);border:1px solid rgba(139,115,32,0.3);border-radius:8px;padding:12px;' +
      'flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);';
    var paperStyle =
      'background:transparent;border-radius:8px;padding:0;display:flex;flex-direction:column;flex:1;min-height:0;';
    var progressStepStyle =
      'flex:1;height:8px;background:rgba(0,0,0,0.08);border-radius:4px;margin:0 4px;border:1px solid rgba(139,115,32,0.2);transition:all 0.4s;';
    var progressActiveStyle =
      'background:linear-gradient(180deg,#c9a227,#a6851e);box-shadow:0 0 8px rgba(201,162,39,0.4);border-color:rgba(139,115,32,0.5);';
    var progressDoneStyle = 'background:linear-gradient(180deg,#5a9e5a,#4a8b40);border-color:rgba(46,125,50,0.5);';
    /** 固定字号与标题栏高度，避免 clamp/副标题有无 导致切换步骤时标题跳动 */
    var pageTitleStyle =
      'font-size:18px;font-weight:bold;text-align:center;margin:0 0 8px 0;color:#4a4035;border-bottom:2px solid rgba(139,115,32,0.35);' +
      'padding:8px 4px 10px;box-sizing:border-box;min-height:48px;display:flex;align-items:center;justify-content:center;line-height:1.25;flex-shrink:0;';
    var pageHeadStyle =
      'flex-shrink:0;display:flex;flex-direction:column;align-items:stretch;width:100%;box-sizing:border-box;min-height:92px;';
    var pageHeadSpacerStyle =
      'min-height:22px;margin-bottom:10px;visibility:hidden;pointer-events:none;flex-shrink:0;font-size:12px;line-height:1.4;';
    var hintStyle = 'text-align:center;color:#6b5d52;font-size:12px;margin-bottom:10px;min-height:22px;line-height:1.4;flex-shrink:0;';
    var progressStepWithPos = progressStepStyle + 'position:relative;';
    var cardStyle =
      'background:#fff;border:2px solid rgba(139,115,32,0.4);border-radius:8px;padding:12px;cursor:pointer;transition:all 0.25s;text-align:center;color:#3d3529;box-shadow:0 1px 4px rgba(0,0,0,0.06);';
    var cardSelectedStyle =
      'border-color:#c9a227;box-shadow:0 0 0 3px rgba(201,162,39,0.4),0 2px 12px rgba(201,162,39,0.2);background:rgba(255,248,220,0.6);';
    /** 难度页三张卡牌：与 cardStyle 同色，仅尺寸与 flex 布局为竖长卡牌 */
    var diffCardStyle =
      'background:#fff;border:2px solid rgba(139,115,32,0.4);border-radius:8px;padding:18px 14px;cursor:pointer;transition:all 0.25s;text-align:center;color:#3d3529;box-shadow:0 1px 4px rgba(0,0,0,0.06);' +
      'width:min(220px,31vw);min-width:148px;max-width:260px;min-height:260px;flex:0 0 auto;box-sizing:border-box;' +
      'display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;';
    function applyDiffCardBaseStyle(el) {
      el.style.cssText = diffCardStyle;
    }
    var charCardFlipStyle =
      'position:relative;width:100px;height:138px;flex-shrink:0;cursor:pointer;perspective:420px;';
    var charCardInnerStyle =
      'position:relative;width:100%;height:100%;transition:transform 0.5s ease;transform-style:preserve-3d;';
    var charCardFaceStyle =
      'position:absolute;inset:0;border-radius:8px;padding:12px;text-align:center;backface-visibility:hidden;' +
      'background:#fff;border:2px solid rgba(139,115,32,0.4);box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;box-sizing:border-box;';
    /* 卡牌背面：四周黑色边框，中间赭红色，最中间黑色圣杯 SVG */
    var charCardBackStyle =
      'position:absolute;inset:0;border-radius:8px;backface-visibility:hidden;transform:rotateY(180deg);' +
      'background:#0d0d0d;padding:6px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;';
    var charCardBackInnerStyle =
      'width:100%;height:100%;background:#8B0000;border-radius:4px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;';
    var holyGrailSvgPath =
      'M54.125 102.188c-15.624 74.885 20.42 123.6 64.125 150.562-33.063-7.81-65.052-19.482-98.25-36.844 25.5 77.488 81.164 95.816 129.906 90.75-26.933 14.252-55.392 25.3-83.937 32.78 70.04 43.512 120.987 16.005 149-22.28-30.186-17.833-52.692-53.794-63.032-98.344-38-34.814-71.414-75.012-97.813-116.625zm402.938 0c-26.397 41.608-59.816 81.786-97.813 116.593-10.338 44.564-32.84 80.54-63.03 98.376 28.01 38.285 78.957 65.792 149 22.28-28.542-7.48-56.978-18.53-83.908-32.78 48.736 5.055 104.38-13.28 129.875-90.75-33.197 17.362-65.187 29.035-98.25 36.844 43.705-26.963 79.75-75.677 64.125-150.563zm-201.47 26.187c-23.56 0-44.93 3.576-61.218 9.844-8.145 3.133-15.045 6.906-20.438 11.81-5.392 4.907-9.5 11.53-9.5 19.157 0 .89.05 1.765.157 2.625 2.62 64.952 32.08 117.553 67.28 133.188l6.94 3.094-1.595 7.406c-8.645 40.282-20.575 63.61-40.94 77.03-11.193 7.378-14.184 13.215-14.374 15.126-.19 1.91.765 4.2 6.844 7.906 12.158 7.41 39.925 13.157 66.844 13.157 26.872 0 53.258-5.944 64.687-13.408 5.716-3.73 6.812-6.22 6.626-8.53-.186-2.312-2.937-7.934-13.094-15.22-19.326-13.862-31.327-36.107-39.843-76.062l-1.595-7.406 6.938-3.094c35.2-15.635 64.662-68.236 67.28-133.188h-.03c.106-.86.156-1.735.156-2.625 0-7.626-4.077-14.25-9.47-19.156-5.393-4.905-12.324-8.677-20.47-11.81-16.288-6.27-37.627-9.845-61.186-9.845zm0 18.688c21.617 0 41.154 3.47 54.47 8.593 6.657 2.562 11.708 5.563 14.593 8.188 2.886 2.625 3.375 4.28 3.375 5.344 0 1.063-.488 2.718-3.374 5.343-2.885 2.626-7.936 5.627-14.594 8.19-13.315 5.122-32.852 8.593-54.468 8.593-21.616 0-41.184-3.47-54.5-8.594-6.658-2.563-11.708-5.564-14.594-8.19-2.886-2.624-3.375-4.28-3.375-5.343 0-1.063.49-2.718 3.375-5.343 2.886-2.625 7.936-5.626 14.594-8.188 13.316-5.123 32.884-8.594 54.5-8.594z';
    var navBtnStyle =
      'padding:8px 18px;font-size:14px;font-weight:bold;border:2px solid rgba(139,115,32,0.5);border-radius:6px;cursor:pointer;transition:all 0.25s;color:#4a4035;';
    var navPrevStyle = navBtnStyle + 'background:#fff;';
    /** 下一步未达成条件：灰色、不可点击 */
    var navNextDisabledStyle =
      navBtnStyle + 'background:#9a9590;border-color:#7a7570;color:#5c5854;cursor:not-allowed;pointer-events:none;';
    /** 下一步已达成条件：黑底白字、可点击 */
    var navNextEnabledStyle = navBtnStyle + 'background:#1a1a1a;border-color:#333;color:#fff;';
    var navStartStyle =
      navBtnStyle +
      'background:linear-gradient(180deg,#b85450,#9a3a36);border-color:#8b2e2a;color:#fff;padding:10px 32px;font-size:15px;letter-spacing:2px;';

    var currentPage = 1;
    var displayedWizardPage = 1;
    var wizardPageAnimToken = 0;
    var wizardPageAnimTimer = null;
    var selections = { characters: [], difficulty: null, diffUid: null, area: null, customArea: null, blessing: null };

    var frame = document.createElement('div');
    frame.style.cssText = frameStyle;

    var progressBar = document.createElement('div');
    progressBar.style.cssText =
      'display:flex;gap:8px;padding:12px 0 10px;border-bottom:2px solid rgba(139,115,32,0.25);flex-shrink:0;';
    var stepLabels = ['角色', '难度', '区域', '祝福'];
    var stepEls = [];
    for (var s = 0; s < 4; s++) {
      var step = document.createElement('div');
      step.className = 'new-game-step';
      step.dataset.step = String(s + 1);
      step.style.cssText = progressStepWithPos;
      var label = document.createElement('span');
      label.textContent = stepLabels[s];
      label.style.cssText =
        'position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:bold;color:#5c4d35;white-space:nowrap;';
      step.appendChild(label);
      progressBar.appendChild(step);
      stepEls.push(step);
    }
    stepEls[0].style.cssText = progressStepWithPos + progressActiveStyle;
    frame.appendChild(progressBar);

    var inner = document.createElement('div');
    inner.style.cssText = innerStyle;
    var paper = document.createElement('div');
    paper.style.cssText = paperStyle;

    var contentArea = document.createElement('div');
    contentArea.style.cssText =
      'display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;padding:16px 0;box-sizing:border-box;';

    function showPage(n, opts) {
      opts = opts || {};
      var instant =
        !!opts.instant ||
        (typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches);

      function updateStepBar(stepNum) {
        stepEls.forEach(function (el, i) {
          el.style.cssText = progressStepWithPos;
          if (i + 1 < stepNum) el.style.cssText = progressStepWithPos + progressDoneStyle;
          else if (i + 1 === stepNum) el.style.cssText = progressStepWithPos + progressActiveStyle;
        });
      }

      function applyPageLayout(p, show) {
        p.style.display = show ? 'flex' : 'none';
        if (show) {
          p.style.flexDirection = 'column';
          p.style.flex = '1';
          p.style.minHeight = '0';
          p.style.overflow =
            p.classList.contains('new-game-page-diff') ||
            p.classList.contains('new-game-page-area') ||
            p.classList.contains('new-game-page-bless')
              ? 'hidden'
              : 'auto';
        } else {
          p.style.flex = '';
          p.style.minHeight = '';
          p.style.overflow = '';
          p.style.flexDirection = '';
        }
        p.style.opacity = '';
        p.style.transition = '';
        p.style.pointerEvents = '';
        p.style.willChange = '';
      }

      updateStepBar(n);

      if (instant) {
        wizardPageAnimToken++;
        if (wizardPageAnimTimer) {
          clearTimeout(wizardPageAnimTimer);
          wizardPageAnimTimer = null;
        }
        contentArea.querySelectorAll('.new-game-page').forEach(function (p) {
          applyPageLayout(p, p.dataset.page === String(n));
        });
        displayedWizardPage = n;
        return;
      }

      if (n === displayedWizardPage) return;

      if (wizardPageAnimTimer) {
        clearTimeout(wizardPageAnimTimer);
        wizardPageAnimTimer = null;
      }

      wizardPageAnimToken++;
      var myToken = wizardPageAnimToken;

      var fadeFrom = displayedWizardPage;
      contentArea.querySelectorAll('.new-game-page').forEach(function (p) {
        applyPageLayout(p, p.dataset.page === String(fadeFrom));
      });

      var outgoing = contentArea.querySelector('.new-game-page[data-page="' + fadeFrom + '"]');
      var incoming = contentArea.querySelector('.new-game-page[data-page="' + n + '"]');
      if (!incoming || !outgoing) {
        contentArea.querySelectorAll('.new-game-page').forEach(function (p) {
          applyPageLayout(p, p.dataset.page === String(n));
        });
        displayedWizardPage = n;
        return;
      }

      outgoing.style.transition = 'opacity 0.2s ease';
      outgoing.style.opacity = '0';
      outgoing.style.pointerEvents = 'none';
      outgoing.style.willChange = 'opacity';

      wizardPageAnimTimer = setTimeout(function () {
        wizardPageAnimTimer = null;
        if (myToken !== wizardPageAnimToken) return;

        applyPageLayout(outgoing, false);
        applyPageLayout(incoming, true);
        incoming.style.opacity = '0';
        incoming.style.transition = 'none';
        incoming.style.pointerEvents = 'none';
        incoming.style.willChange = 'opacity';
        incoming.offsetHeight;

        requestAnimationFrame(function () {
          if (myToken !== wizardPageAnimToken) return;
          incoming.style.transition = 'opacity 0.28s ease';
          incoming.style.opacity = '1';
          incoming.style.pointerEvents = '';
        });

        displayedWizardPage = n;

        wizardPageAnimTimer = setTimeout(function () {
          wizardPageAnimTimer = null;
          if (myToken !== wizardPageAnimToken) return;
          incoming.style.transition = '';
          incoming.style.opacity = '';
          incoming.style.pointerEvents = '';
          incoming.style.willChange = '';
          outgoing.style.willChange = '';
        }, 320);
      }, 200);
    }

    // Page 1: 角色
    var page1 = document.createElement('div');
    page1.className = 'new-game-page';
    page1.dataset.page = '1';
    var head1 = document.createElement('div');
    head1.className = 'new-game-page-head';
    head1.style.cssText = pageHeadStyle;
    var t1 = document.createElement('div');
    t1.style.cssText = pageTitleStyle;
    t1.textContent = '✦ 选择初始角色 ✦';
    head1.appendChild(t1);
    var h1 = document.createElement('div');
    h1.style.cssText = hintStyle;
    h1.textContent = '选择2名角色组成初始队伍';
    head1.appendChild(h1);
    page1.appendChild(head1);
    var sectionsWrap = document.createElement('div');
    sectionsWrap.style.cssText = 'display:flex;flex-direction:column;gap:14px;';
    var newGameCharData = getNewGameCharacterData();
    NEW_GAME_SECTION_ORDER.forEach(function (secName) {
      var chars = newGameCharData[secName];
      var sec = document.createElement('div');
      sec.style.cssText =
        'background:rgba(255,255,255,0.6);border:1px solid rgba(139,115,32,0.3);border-radius:8px;padding:12px;';
      var st = document.createElement('div');
      st.style.cssText =
        'font-size:14px;font-weight:bold;color:#6b5a3d;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed rgba(139,115,32,0.4);';
      st.textContent = '◆ ' + secName;
      sec.appendChild(st);
      if (!chars || chars.length === 0) {
        var ph = document.createElement('div');
        ph.style.cssText = 'text-align:center;color:#8a7d6d;padding:20px;';
        ph.textContent = '敬请期待...';
        sec.appendChild(ph);
      } else {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';
        chars.forEach(function (c) {
          var card = document.createElement('div');
          card.className = 'char-card-flip new-game-char-card';
          card.dataset.name = c.name;
          card.style.cssText = charCardFlipStyle;
          var inner = document.createElement('div');
          inner.className = 'char-card-flip-inner';
          inner.style.cssText = charCardInnerStyle;
          var front = document.createElement('div');
          front.className = 'char-card-front';
          front.style.cssText = charCardFaceStyle;
          front.innerHTML =
            '<img src="' +
            c.avatar +
            '" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:6px;border:2px solid rgba(139,115,32,0.35);display:block;margin:0 auto 6px;flex-shrink:0;" onerror="this.style.background=\'#e8e4dc\'">' +
            '<div style="font-weight:bold;font-size:11px;color:#3d3529;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px;">' +
            c.name +
            '</div>' +
            '<div style="font-size:9px;color:#5c5248;line-height:1.3;min-height:2.6em;overflow:visible;word-break:keep-all;">' +
            c.type +
            '</div>';
          var back = document.createElement('div');
          back.className = 'char-card-back';
          back.style.cssText = charCardBackStyle;
          var backInner = document.createElement('div');
          backInner.style.cssText = charCardBackInnerStyle;
          backInner.innerHTML =
            '<svg viewBox="0 0 512 512" style="width:52px;height:52px;display:block;"><path fill="#ffffff" d="' +
            holyGrailSvgPath +
            '"/></svg>';
          back.appendChild(backInner);
          inner.appendChild(front);
          inner.appendChild(back);
          card.appendChild(inner);
          card.addEventListener('click', function () {
            var name = card.dataset.name;
            if (card.classList.contains('selected')) {
              card.classList.remove('selected');
              selections.characters = selections.characters.filter(function (n) {
                return n !== name;
              });
            } else if (selections.characters.length < 2) {
              card.classList.add('selected');
              selections.characters.push(name);
            }
            sectionsWrap.querySelectorAll('.new-game-char-card').forEach(function (el) {
              el.classList.toggle('disabled', selections.characters.length >= 2 && !el.classList.contains('selected'));
              if (el.classList.contains('disabled')) el.style.pointerEvents = 'none';
              else el.style.pointerEvents = '';
              if (el.classList.contains('disabled')) el.style.opacity = '0.4';
              else el.style.opacity = '';
            });
            updateNewGameUI();
          });
          row.appendChild(card);
        });
        sec.appendChild(row);
      }
      sectionsWrap.appendChild(sec);
    });
    page1.appendChild(sectionsWrap);
    contentArea.appendChild(page1);

    // Page 2: 难度
    var page2 = document.createElement('div');
    page2.className = 'new-game-page new-game-page-diff';
    page2.dataset.page = '2';
    var head2 = document.createElement('div');
    head2.className = 'new-game-page-head';
    head2.style.cssText = pageHeadStyle;
    var t2 = document.createElement('div');
    t2.style.cssText = pageTitleStyle;
    t2.textContent = '✦ 选择冒险难度 ✦';
    head2.appendChild(t2);
    var headSpacer2 = document.createElement('div');
    headSpacer2.setAttribute('aria-hidden', 'true');
    headSpacer2.style.cssText = pageHeadSpacerStyle;
    headSpacer2.innerHTML = '&nbsp;';
    head2.appendChild(headSpacer2);
    page2.appendChild(head2);
    var diffPageCenter = document.createElement('div');
    diffPageCenter.className = 'new-game-diff-center';
    diffPageCenter.style.cssText =
      'flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;min-height:0;padding:8px 12px;box-sizing:border-box;';
    var diffGrid = document.createElement('div');
    diffGrid.className = 'new-game-diff-cards-row';
    diffGrid.style.cssText =
      'display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:clamp(14px,3vw,28px);' +
      'flex-wrap:wrap;width:100%;max-width:820px;';
    NEW_GAME_DIFFICULTIES.forEach(function (d) {
      var card = document.createElement('div');
      card.className = 'new-game-option-card new-game-diff-card';
      card.dataset.difficulty = d.id;
      card.dataset.uid = String(d.uid);
      applyDiffCardBaseStyle(card);
      var diffIcon =
        d.id === '休闲'
          ? HAPPY_FACE_SVG
          : d.id === '普通'
            ? '<svg viewBox="0 0 24 24" style="' +
              DIFF_ICON_SVG_STYLE +
              '"><path fill="none" stroke="#3d3529" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="' +
              SHIELD_SVG_PATH +
              '"/></svg>'
            : '<svg viewBox="0 0 24 24" style="' +
              DIFF_ICON_SVG_STYLE +
              '"><path fill-rule="evenodd" clip-rule="evenodd" fill="#3d3529" d="' +
              SKULL_BONES_SVG_PATH +
              '"/></svg>';
      card.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;min-height:40px;flex-shrink:0;width:100%;">' +
        diffIcon +
        '</div>' +
        '<div style="font-size:16px;font-weight:bold;color:#3d3529;letter-spacing:0.02em;width:100%;">' +
        d.title +
        '</div>' +
        '<div style="font-size:11px;color:#5c5248;line-height:1.45;white-space:pre-line;width:100%;">' +
        d.desc +
        '</div>';
      card.addEventListener('click', function () {
        diffGrid.querySelectorAll('.new-game-option-card').forEach(function (c) {
          applyDiffCardBaseStyle(c);
          c.classList.remove('selected');
        });
        card.style.cssText = diffCardStyle + cardSelectedStyle;
        card.classList.add('selected');
        selections.difficulty = card.dataset.difficulty;
        selections.diffUid = parseInt(card.dataset.uid, 10);
        updateNewGameUI();
      });
      diffGrid.appendChild(card);
    });
    diffPageCenter.appendChild(diffGrid);
    page2.appendChild(diffPageCenter);
    contentArea.appendChild(page2);

    // Page 3: 区域 — 五张卡牌横排居中，与难度页同款竖卡样式；✦ 命运抉择 ✦ 在正中间；无自定义
    var page3 = document.createElement('div');
    page3.className = 'new-game-page new-game-page-area';
    page3.dataset.page = '3';
    page3.style.display = 'none';
    var head3 = document.createElement('div');
    head3.className = 'new-game-page-head';
    head3.style.cssText = pageHeadStyle;
    var t3 = document.createElement('div');
    t3.style.cssText = pageTitleStyle;
    t3.textContent = '✦ 选择起始区域 ✦';
    head3.appendChild(t3);
    var headSpacer3 = document.createElement('div');
    headSpacer3.setAttribute('aria-hidden', 'true');
    headSpacer3.style.cssText = pageHeadSpacerStyle;
    headSpacer3.innerHTML = '&nbsp;';
    head3.appendChild(headSpacer3);
    page3.appendChild(head3);

    /** 区域五卡：宽高由 .new-game-area-pick-card 的 CSS flex 控制，避免内联 width 与 max-width:1100 导致 4+1 换行 */
    var areaPickCardStyleVisual =
      'background:#fff;border:2px solid rgba(139,115,32,0.4);border-radius:8px;padding:16px 10px;cursor:pointer;transition:all 0.25s;text-align:center;color:#3d3529;box-shadow:0 1px 4px rgba(0,0,0,0.06);' +
      'box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;min-height:248px;';
    var areaPickCardStyleVisualFate = areaPickCardStyleVisual.replace(
      'border:2px solid rgba(139,115,32,0.4)',
      'border:2px solid rgba(147,112,219,0.65)'
    );
    function applyAreaPickBaseStyle(el) {
      if (!el || !el.dataset) return;
      el.style.cssText = el.dataset.area === '随机' ? areaPickCardStyleVisualFate : areaPickCardStyleVisual;
    }
    function applyBlessPickBaseStyle(el) {
      if (!el) return;
      el.style.cssText = areaPickCardStyleVisual;
    }
    function areaEmojiForPick(id) {
      if (id === '艾尔瑟斯森林') return '🌲';
      if (id === '格里莫瓦王国旧都') return '🏛';
      if (id === '拉文斯庄园') return '🏰';
      if (id === '地狱边缘') return '🔥';
      return '✦';
    }
    var normalAreasList = NEW_GAME_AREAS.filter(function (a) {
      return !a.isFate;
    });
    var fateAreaPick = NEW_GAME_AREAS.find(function (a) {
      return a.isFate;
    });
    /** DOM 顺序：四区域 + 随机；窄屏换行时随机自然在最末。宽屏由 CSS order 恢复为「随机在中间」 */
    var orderedAreaPick = [
      normalAreasList[0],
      normalAreasList[1],
      normalAreasList[2],
      normalAreasList[3],
      fateAreaPick,
    ];

    var areaPageCenter = document.createElement('div');
    areaPageCenter.className = 'new-game-area-center';
    areaPageCenter.style.cssText =
      'flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;min-height:0;padding:8px 12px;box-sizing:border-box;';
    var areaRow = document.createElement('div');
    areaRow.className = 'new-game-area-cards-row';

    orderedAreaPick.forEach(function (a) {
      if (!a) return;
      var card = document.createElement('div');
      card.className = 'new-game-option-card new-game-area-pick-card';
      card.dataset.area = a.id;
      applyAreaPickBaseStyle(card);
      card.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;min-height:40px;flex-shrink:0;width:100%;font-size:26px;line-height:1;">' +
        areaEmojiForPick(a.id) +
        '</div>' +
        '<div style="font-size:15px;font-weight:bold;color:#3d3529;letter-spacing:0.02em;width:100%;">' +
        a.title +
        '</div>' +
        '<div style="font-size:11px;color:#5c5248;line-height:1.45;white-space:pre-line;width:100%;">' +
        a.desc +
        '</div>' +
        (a.hint
          ? '<div style="font-size:9px;color:#6b5d52;margin-top:4px;padding-top:6px;border-top:1px dotted rgba(139,115,32,0.3);width:100%;">' +
            a.hint +
            '</div>'
          : '');
      card.addEventListener('click', function () {
        page3.querySelectorAll('.new-game-area-pick-card').forEach(function (c) {
          applyAreaPickBaseStyle(c);
          c.classList.remove('selected');
        });
        card.style.cssText =
          (card.dataset.area === '随机' ? areaPickCardStyleVisualFate : areaPickCardStyleVisual) + cardSelectedStyle;
        card.classList.add('selected');
        selections.area = card.dataset.area;
        selections.customArea = null;
        updateNewGameUI();
      });
      areaRow.appendChild(card);
    });
    areaPageCenter.appendChild(areaRow);
    page3.appendChild(areaPageCenter);

    contentArea.appendChild(page3);

    // Page 4: 祝福 — 与区域页同款 flex 横排、自动换行、竖卡样式
    var page4 = document.createElement('div');
    page4.className = 'new-game-page new-game-page-bless';
    page4.dataset.page = '4';
    page4.style.display = 'none';
    var head4 = document.createElement('div');
    head4.className = 'new-game-page-head';
    head4.style.cssText = pageHeadStyle;
    var t4 = document.createElement('div');
    t4.style.cssText = pageTitleStyle;
    t4.textContent = '✦ 选择初始祝福 ✦';
    head4.appendChild(t4);
    var headSpacer4 = document.createElement('div');
    headSpacer4.setAttribute('aria-hidden', 'true');
    headSpacer4.style.cssText = pageHeadSpacerStyle;
    headSpacer4.innerHTML = '&nbsp;';
    head4.appendChild(headSpacer4);
    page4.appendChild(head4);
    var blessPageCenter = document.createElement('div');
    blessPageCenter.className = 'new-game-bless-center';
    blessPageCenter.style.cssText =
      'flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;min-height:0;padding:8px 12px;box-sizing:border-box;';
    var blessGrid = document.createElement('div');
    blessGrid.className = 'new-game-bless-cards-row';
    NEW_GAME_BLESSINGS.forEach(function (b) {
      var card = document.createElement('div');
      card.className = 'new-game-option-card new-game-bless-pick-card';
      card.dataset.blessing = b.id;
      applyBlessPickBaseStyle(card);
      var blessIcon =
        b.id.indexOf('金币') !== -1
          ? '🪙'
          : b.id.indexOf('级') !== -1
            ? '⬆'
            : b.id.indexOf('遗物') !== -1
              ? '✨'
              : '👥';
      card.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;min-height:40px;flex-shrink:0;width:100%;font-size:26px;line-height:1;">' +
        blessIcon +
        '</div>' +
        '<div style="font-size:15px;font-weight:bold;color:#3d3529;letter-spacing:0.02em;width:100%;">' +
        b.title +
        '</div>' +
        '<div style="font-size:11px;color:#5c5248;line-height:1.45;white-space:pre-line;width:100%;">' +
        b.desc +
        '</div>';
      card.addEventListener('click', function () {
        blessGrid.querySelectorAll('.new-game-bless-pick-card').forEach(function (c) {
          applyBlessPickBaseStyle(c);
          c.classList.remove('selected');
        });
        card.style.cssText = areaPickCardStyleVisual + cardSelectedStyle;
        card.classList.add('selected');
        selections.blessing = card.dataset.blessing;
        updateNewGameUI();
      });
      blessGrid.appendChild(card);
    });
    blessPageCenter.appendChild(blessGrid);
    page4.appendChild(blessPageCenter);
    contentArea.appendChild(page4);

    showPage(1, { instant: true });

    paper.appendChild(contentArea);

    var bottomBar = document.createElement('div');
    bottomBar.style.cssText =
      'display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:2px solid rgba(139,115,32,0.25);background:rgba(255,255,255,0.4);gap:12px;flex-wrap:wrap;flex-shrink:0;';
    var summaryEl = document.createElement('div');
    summaryEl.id = 'begining-new-game-summary';
    summaryEl.style.cssText = 'flex:1;display:flex;flex-wrap:wrap;gap:6px;min-width:0;';
    var navWrap = document.createElement('div');
    navWrap.style.cssText = 'display:flex;gap:10px;flex-shrink:0;';
    var prevBtn = document.createElement('button');
    prevBtn.textContent = '← 上一步';
    prevBtn.id = 'begining-new-game-prev';
    prevBtn.style.cssText = navPrevStyle;
    prevBtn.addEventListener('click', function () {
      if (currentPage === 1) {
        goBackToStartMenu();
      } else {
        prevPage();
      }
    });
    var nextBtn = document.createElement('button');
    nextBtn.textContent = '下一步 →';
    nextBtn.id = 'begining-new-game-next';
    nextBtn.style.cssText = navNextDisabledStyle;
    nextBtn.disabled = true;
    nextBtn.addEventListener('click', function () {
      if (currentPage === 4) startNewGame();
      else nextPage();
    });

    function nextPage() {
      if (currentPage < 4) {
        currentPage++;
        showPage(currentPage);
        updateNewGameUI();
      }
    }
    function prevPage() {
      if (currentPage > 1) {
        currentPage--;
        showPage(currentPage);
        updateNewGameUI();
      }
    }
    function updateNewGameUI() {
      var sum = [];
      if (selections.characters.length)
        sum.push('<span style="color:#6b5a3d;font-weight:bold;">角色:</span> ' + selections.characters.join('、'));
      if (selections.difficulty)
        sum.push('<span style="color:#6b5a3d;font-weight:bold;">难度:</span> ' + selections.difficulty);
      if (selections.area) sum.push('<span style="color:#6b5a3d;font-weight:bold;">区域:</span> ' + selections.area);
      if (selections.blessing)
        sum.push('<span style="color:#6b5a3d;font-weight:bold;">祝福:</span> ' + selections.blessing);
      summaryEl.innerHTML = sum
        .map(function (s) {
          return (
            '<span style="background:rgba(255,255,255,0.9);padding:4px 10px;border-radius:5px;font-size:11px;border:1px solid rgba(139,115,32,0.3);color:#4a4035;">' +
            s +
            '</span>'
          );
        })
        .join('');

      var ok = false;
      if (currentPage === 1) ok = selections.characters.length === 2;
      else if (currentPage === 2) ok = !!selections.difficulty;
      else if (currentPage === 3) ok = !!selections.area;
      else if (currentPage === 4) ok = !!selections.blessing;

      if (currentPage === 4 && ok) {
        nextBtn.textContent = '开始冒险 ✦';
        nextBtn.style.cssText = navStartStyle;
      } else {
        nextBtn.textContent = '下一步 →';
        nextBtn.style.cssText = ok ? navNextEnabledStyle : navNextDisabledStyle;
      }
      nextBtn.disabled = !ok;
    }
    function startNewGame() {
      if (typeof window.beginingNewGameStart === 'function') {
        window.beginingNewGameStart(selections);
      }
      overlayRef.style.display = 'none';
    }

    navWrap.appendChild(prevBtn);
    navWrap.appendChild(nextBtn);
    bottomBar.appendChild(summaryEl);
    bottomBar.appendChild(navWrap);
    paper.appendChild(bottomBar);

    inner.appendChild(paper);
    frame.appendChild(inner);
    panel.appendChild(frame);

    function resetNewGame() {
      currentPage = 1;
      selections.characters = [];
      selections.difficulty = null;
      selections.diffUid = null;
      selections.area = null;
      selections.customArea = null;
      selections.blessing = null;
      sectionsWrap.querySelectorAll('.new-game-char-card').forEach(function (el) {
        el.classList.remove('selected', 'disabled');
        el.style.cssText = charCardFlipStyle;
        el.style.pointerEvents = '';
        el.style.opacity = '';
      });
      diffGrid.querySelectorAll('.new-game-option-card').forEach(function (c) {
        c.classList.remove('selected');
        applyDiffCardBaseStyle(c);
      });
      page3.querySelectorAll('.new-game-area-pick-card').forEach(function (c) {
        c.classList.remove('selected');
        applyAreaPickBaseStyle(c);
      });
      blessGrid.querySelectorAll('.new-game-bless-pick-card').forEach(function (c) {
        c.classList.remove('selected');
        applyBlessPickBaseStyle(c);
      });
      showPage(1, { instant: true });
      updateNewGameUI();
    }

    panel.updateNewGameUI = updateNewGameUI;
    panel.showPage = showPage;
    panel.resetNewGame = resetNewGame;
    return panel;
  }

  function showBeginingOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;

    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:' +
      BACKGROUND_STYLE +
      ';display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;';
    overlay.setAttribute('aria-label', '开局界面');

    var styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes begining-glow{0%,100%{text-shadow:0 0 8px rgba(232,224,208,0.4),0 0 16px rgba(232,224,208,0.2);}' +
      '50%{text-shadow:0 0 14px rgba(232,224,208,0.7),0 0 28px rgba(232,224,208,0.35);}}' +
      '.hentai-fs-btn{position:absolute;top:12px;right:12px;z-index:100001;width:44px;height:44px;padding:0;border-radius:50%;' +
      'border:2px solid rgba(255,255,255,0.88);background:rgba(45,31,20,0.92);color:rgba(232,224,208,0.95);cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.45);transition:background .2s,border-color .2s}' +
      '.hentai-fs-btn:hover{background:rgba(60,45,30,0.95);border-color:rgba(255,255,255,0.65)}' +
      '.hentai-fs-btn:focus-visible{outline:2px solid rgba(255,255,255,0.75);outline-offset:2px}' +
      '.hentai-fs-btn-inner{display:flex;align-items:center;justify-content:center}';
    overlay.appendChild(styleEl);

    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap';
    document.head.appendChild(fontLink);

    // ——— 封面（标题界面，别名为「封面」） ———
    var cover = document.createElement('div');
    cover.id = COVER_ID;
    cover.style.cssText =
      'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;' +
      'opacity:1;transition:opacity 0.4s ease;';
    cover.setAttribute('aria-label', '封面');

    var titleBlock = document.createElement('div');
    titleBlock.style.cssText = 'width:50vw;max-width:100%;text-align:center;';

    var title = document.createElement('h1');
    title.textContent = 'HentaiDungeon';
    title.style.cssText =
      'margin:0;font-family:' +
      GOTHIC_FONT +
      ';font-size:clamp(28px, 5vw, 48px);color:#e8e0d0;letter-spacing:0.05em;font-weight:700;' +
      'animation:begining-glow 10s ease-in-out infinite;';
    titleBlock.appendChild(title);

    var titleSub = document.createElement('p');
    titleSub.textContent = '色色地牢';
    titleSub.style.cssText =
      'margin:0.4em 0 0;font-family:' +
      GOTHIC_FONT +
      ';font-size:clamp(14px, 2.2vw, 22px);color:rgba(232,224,208,0.9);font-weight:700;' +
      'animation:begining-glow 10s ease-in-out infinite;';
    titleBlock.appendChild(titleSub);

    cover.appendChild(titleBlock);
    // 封面左下角：CC 协议标注
    var coverLicense = document.createElement('div');
    coverLicense.className = 'begining-intro-license';
    coverLicense.style.cssText =
      'position:absolute;left:12px;bottom:12px;font-size:clamp(10px,1.4vw,12px);color:rgba(232,224,208,0.75);' +
      'pointer-events:auto;';
    coverLicense.innerHTML =
      'This work by <span property="cc:attributionName">SovietZeppelin and 醉里论道</span> is licensed under ' +
      '<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" ' +
      'style="color:rgba(232,224,208,0.9);text-decoration:underline;">CC BY-NC-SA 4.0</a>';
    coverLicense.setAttribute('xmlns:cc', 'http://creativecommons.org/ns#');
    cover.appendChild(coverLicense);
    overlay.appendChild(cover);

    // ——— 开始界面（选项菜单，初始透明） ———
    var startMenu = document.createElement('div');
    startMenu.id = START_MENU_ID;
    startMenu.style.cssText =
      'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;cursor:default;' +
      'opacity:0;pointer-events:none;transition:opacity 0.4s ease;';
    startMenu.setAttribute('aria-label', '开始界面');

    var optionsWrap = document.createElement('div');
    optionsWrap.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;';
    for (var i = 0; i < START_OPTIONS.length; i++) {
      optionsWrap.appendChild(createOptionRow(START_OPTIONS[i]));
    }
    function hasAutoSnapshot() {
      try {
        var api0 = typeof window !== 'undefined' ? window.色色地牢_save : null;
        return !!(api0 && typeof api0.readAutoSnapshotPayload === 'function' && api0.readAutoSnapshotPayload());
      } catch (e) {
        return false;
      }
    }
    function syncContinueGameVisibility() {
      var contEl = optionsWrap.querySelector('.begining-option[data-option-id="continue-game"]');
      if (!contEl) return;
      contEl.style.display = hasAutoSnapshot() ? '' : 'none';
    }
    startMenu.appendChild(optionsWrap);
    var loadSavePanel = document.createElement('div');
    loadSavePanel.id = 'begining-load-save-panel';
    loadSavePanel.style.cssText =
      'display:none;flex-direction:column;align-items:flex-start;width:max-content;max-width:calc(100vw - 80px);';
    var loadSaveTitle = document.createElement('div');
    loadSaveTitle.style.cssText = 'font-size:18px;font-weight:bold;color:#e8e0d0;margin-bottom:16px;';
    loadSaveTitle.textContent = '选择存档';
    var loadSaveList = document.createElement('div');
    loadSaveList.style.cssText = 'display:flex;flex-direction:column;gap:10px;width:max-content;max-width:100%;';
    var loadSaveBack = document.createElement('button');
    loadSaveBack.textContent = '← 返回';
    loadSaveBack.style.cssText =
      'margin-top:16px;padding:8px 18px;font-size:14px;font-weight:bold;border:2px solid rgba(139,115,32,0.5);border-radius:6px;background:#fff;color:#4a4035;cursor:pointer;';
    loadSaveBack.addEventListener('click', function () {
      loadSavePanel.style.display = 'none';
      optionsWrap.style.display = 'flex';
    });
    loadSavePanel.appendChild(loadSaveTitle);
    loadSavePanel.appendChild(loadSaveList);
    loadSavePanel.appendChild(loadSaveBack);
    startMenu.appendChild(loadSavePanel);
    overlay.appendChild(startMenu);

    // ——— 新开局选项界面（点击「新游戏」后显示） ———
    var newGamePanel = buildNewGameSetupPanel(overlay, startMenu, function goBackToStartMenu() {
      newGamePanel.style.opacity = '0';
      newGamePanel.style.pointerEvents = 'none';
      startMenu.style.display = 'flex';
      startMenu.style.opacity = '1';
      startMenu.style.pointerEvents = 'auto';
      setTimeout(function () {
        startMenu.style.display = 'flex';
      }, 0);
    });
    overlay.appendChild(newGamePanel);

    var fsBtnOverlay = createFullscreenButton();
    fsBtnOverlay.id = 'hentai-fs-btn-overlay';
    overlay.appendChild(fsBtnOverlay);

    function goToStartMenu() {
      overlay.style.cursor = 'default';
      cover.style.opacity = '0';
      startMenu.style.opacity = '1';
      startMenu.style.pointerEvents = 'auto';
      // 此时通常 backend/save.js 已加载；动态决定是否显示「继续游戏」
      syncContinueGameVisibility();
      setTimeout(function () {
        cover.style.display = 'none';
      }, 400);
    }

    function goToNewGameSetup() {
      if (newGamePanel.resetNewGame) newGamePanel.resetNewGame();
      startMenu.style.opacity = '0';
      startMenu.style.pointerEvents = 'none';
      setTimeout(function () {
        startMenu.style.display = 'none';
        newGamePanel.style.opacity = '1';
        newGamePanel.style.pointerEvents = 'auto';
      }, 400);
    }

    function closeOverlay(optionId) {
      overlay.style.display = 'none';
      // app.js 可能尚未加载完成：重试调用 beginingOptionChosen，避免“点击无反应”
      var tries = 0;
      (function tryCall() {
        tries++;
        if (typeof window.beginingOptionChosen === 'function') {
          window.beginingOptionChosen(optionId);
          return;
        }
        if (tries < 30) setTimeout(tryCall, 100);
      })();
    }

    overlay.addEventListener('click', function (e) {
      if (e.target.closest('.hentai-fs-btn')) return;
      if (e.target.closest('#' + START_MENU_ID)) return;
      goToStartMenu();
    });

    startMenu.addEventListener('click', function (e) {
      var opt = e.target.closest('.begining-option');
      if (!opt) return;
      var id = opt.dataset.optionId;
      if (id === 'new-game') {
        goToNewGameSetup();
      } else if (id === 'load-save') {
        if (typeof window.色色地牢_save !== 'undefined' && window.色色地牢_save.getSaveSlots) {
          function esc(s) {
            return String(s == null ? '' : s)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          }
          function safeTime(t) {
            var s = t ? String(t) : '';
            if (!s) return '';
            return s.replace('T', ' ').replace(/\.\d{3}Z?$/, '').replace('Z', '');
          }
          // 复用主界面存档卡片风格（在开局面板内注入一份精简 CSS）
          if (!document.getElementById('begining-load-save-style')) {
            var st = document.createElement('style');
            st.id = 'begining-load-save-style';
            st.textContent =
              '.begining-save-card{position:relative;background:transparent;border:2px solid rgba(139,115,32,.42);border-radius:14px;padding:14px 14px 12px;box-shadow:none;overflow:hidden;cursor:pointer;color:#e8e0d0;transition:transform .12s ease}' +
              '.begining-save-card:hover{transform:none;box-shadow:none}' +
              '.begining-save-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}' +
              '.begining-save-main{display:flex;flex-direction:column;gap:4px;min-width:0}' +
              '.begining-save-name{font-size:16px;font-weight:900;letter-spacing:.12em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}' +
              '.begining-save-meta{font-size:12px;opacity:.78;line-height:1.3;text-align:right;white-space:nowrap;flex-shrink:0}' +
              '.begining-save-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}' +
              '.begining-save-actions{display:flex;gap:10px;flex:1 1 auto}' +
              '.begining-save-btn{appearance:none;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.14);color:#fff;border-radius:12px;padding:8px 12px;font-size:12px;font-weight:900;cursor:pointer;transition:transform .06s ease,background .12s ease,box-shadow .12s ease;box-shadow:0 1px 0 rgba(0,0,0,.10)}' +
              '.begining-save-btn:hover{background:rgba(255,255,255,.20);box-shadow:0 8px 18px rgba(0,0,0,.18)}' +
              '.begining-save-btn:active{transform:translateY(1px)}' +
              '.begining-party-grid{display:flex;flex-wrap:nowrap;gap:10px;justify-content:flex-end;align-items:flex-start;overflow-x:auto;max-width:520px;padding-bottom:2px}' +
              '.begining-party-grid::-webkit-scrollbar{height:6px}' +
              '.begining-party-grid::-webkit-scrollbar-thumb{background:rgba(255,255,255,.22);border-radius:999px}' +
              '.begining-party-unit{width:66px;display:flex;flex-direction:column;align-items:center;gap:6px;flex:0 0 auto}' +
              '.begining-party-avatar{position:relative;width:66px;height:66px;border-radius:12px;background:rgba(0,0,0,.18);border:2px solid rgba(139,115,32,.55);overflow:hidden;background-size:cover;background-position:center top;box-shadow:0 4px 14px rgba(0,0,0,.20)}' +
              '.begining-party-lv{position:absolute;right:6px;bottom:6px;background:rgba(0,0,0,.62);color:#fff;border:1px solid rgba(201,162,39,.55);border-radius:999px;padding:2px 6px;font-size:11px;font-weight:900;line-height:1}' +
              '.begining-party-name{font-size:12px;font-weight:900;max-width:66px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.92}';
            overlay.appendChild(st);
          }
          optionsWrap.style.display = 'none';
          loadSavePanel.style.display = 'flex';
          var slots = window.色色地牢_save.getSaveSlots();
          loadSaveList.innerHTML = '';
          // 仅展示有数据的槽位；save.getSaveSlots() 会额外附带 1 个空槽位供保存（此处不需要）
          slots
            .filter(function (s) {
              return s && s.hasData;
            })
            .forEach(function (s) {
              var ps = Array.isArray(s.partySummary) ? s.partySummary : [];
              var partyHtml =
                '<div class="begining-party-grid" aria-label="队伍成员">' +
                ps
                  .map(function (u) {
                    var nm = u && u.name ? String(u.name) : '';
                    var lv = u && u.level != null ? parseInt(u.level, 10) || 1 : 1;
                    var av = u && u.avatar ? String(u.avatar) : '';
                    var bg = av ? "background-image:url('" + encodeURI(av).replace(/'/g, '%27') + "')" : '';
                    return (
                      '<div class="begining-party-unit">' +
                      '<div class="begining-party-avatar" style="' +
                      bg +
                      '">' +
                      '<div class="begining-party-lv">Lv' +
                      lv +
                      '</div>' +
                      '</div>' +
                      '<div class="begining-party-name">' +
                      esc(nm) +
                      '</div>' +
                      '</div>'
                    );
                  })
                  .join('') +
                '</div>';

              var timeText = safeTime(s.savedAt);
              var card = document.createElement('div');
              card.className = 'begining-save-card';
              card.innerHTML =
                '<div class="begining-save-head">' +
                '<div class="begining-save-main">' +
                '<div class="begining-save-name">' +
                esc(s.areaName || '') +
                '</div>' +
                '</div>' +
                '<div class="begining-save-meta">' +
                esc(timeText) +
                '</div>' +
                '</div>' +
                '<div class="begining-save-foot">' +
                '<div class="begining-save-actions">' +
                '<button type="button" class="begining-save-btn">读取</button>' +
                '</div>' +
                partyHtml +
                '</div>';
              card.addEventListener('click', function (ev2) {
                ev2.preventDefault();
                ev2.stopPropagation();
                if (typeof window.beginingLoadSaveSlot === 'function') window.beginingLoadSaveSlot(s.index);
                closeOverlay('load-save');
              });
              loadSaveList.appendChild(card);
            });
        } else {
          closeOverlay(id);
        }
      } else if (id === 'test-mode') {
        closeOverlay(id);
      } else {
        closeOverlay(id);
      }
    });

    document.body.appendChild(overlay);
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBeginingOverlay);
    } else {
      showBeginingOverlay();
    }
  }

  init();
})();
