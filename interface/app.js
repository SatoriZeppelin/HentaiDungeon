/**
 * 色色地牢 - 界面入口（样式 + 侧边栏 + 战斗，合一文件）
 * 若未预先加载 skill.js，会尝试从与 app.js 同目录动态加载，再执行初始化。
 */
(function () {
  function runApp() {
    var CSS = [
      '*{box-sizing:border-box}',
      ':root{--ornate-dark:#3d2b1f;--ornate-gold:#c9a227;--ornate-gold-rgb:201,162,39;--ap-glow:#d2691e;--ap-orange:#e65100;--hp-red:#b32424;--gold-border:#8b7320}',
      'html,body{margin:0;padding:0;height:100%;overflow:hidden;font-family:sans-serif;font-size:14px;color:#3d3529;background:#2a1f15}',
      '.game-frame.ornate-frame{position:relative;display:flex;flex-direction:column;height:100vh;margin:0;background:linear-gradient(135deg,#4a3728 0%,#2d1f14 50%,#4a3728 100%);border:3px solid var(--ornate-dark);box-shadow:0 0 0 1px var(--ornate-gold),0 0 0 4px var(--ornate-dark),0 0 0 5px var(--ornate-gold),0 0 20px rgba(0,0,0,.7),inset 0 0 40px rgba(0,0,0,.4);padding:18px;overflow:hidden}',
      '.game-frame.ornate-frame::before{content:"";position:absolute;top:8px;left:8px;right:8px;bottom:8px;border:1px solid rgba(201,162,39,.25);pointer-events:none}',
      '.corner-ornament{position:absolute;width:50px;height:50px;pointer-events:none;z-index:10}.corner-ornament svg{width:100%;height:100%;fill:var(--ornate-gold);filter:drop-shadow(0 0 2px rgba(201,162,39,.4))}.corner-tl{top:-3px;left:-3px}.corner-tr{top:-3px;right:-3px;transform:scaleX(-1)}.corner-bl{bottom:-3px;left:-3px;transform:scaleY(-1)}.corner-br{bottom:-3px;right:-3px;transform:scale(-1,-1)}',
      '.game-frame.ornate-frame>.hentai-fs-btn{position:absolute;top:10px;right:10px;z-index:2100;width:44px;height:44px;padding:0;border-radius:50%;border:2px solid rgba(201,162,39,0.85);background:rgba(45,31,20,0.92);color:rgba(232,224,208,0.95);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.45);transition:background .2s,border-color .2s}.game-frame.ornate-frame>.hentai-fs-btn:hover{background:rgba(60,45,30,0.95);border-color:rgba(232,224,208,0.5)}.game-frame.ornate-frame>.hentai-fs-btn:focus-visible{outline:2px solid rgba(201,162,39,0.6);outline-offset:2px}.hentai-fs-btn-inner{display:flex;align-items:center;justify-content:center}',
      '.edge-decoration{position:absolute;background:linear-gradient(90deg,transparent,var(--ornate-gold),transparent);height:1px;pointer-events:none}.edge-top{top:15px;left:55px;right:55px}.edge-bottom{bottom:15px;left:55px;right:55px}.edge-decoration.vertical{width:1px;height:auto;background:linear-gradient(180deg,transparent,var(--ornate-gold),transparent)}.edge-left{left:15px;top:55px;bottom:55px}.edge-right{right:15px;top:55px;bottom:55px}',
      '.game-inner{display:flex;flex:1;min-height:0;min-width:0;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png")}',
      '.sidebar{position:relative;width:100px;min-width:100px;background:transparent;border:none;border-right:2px solid var(--ornate-dark);display:flex;flex-direction:column;justify-content:flex-start;align-items:center;padding:10px 6px 12px;min-height:0}',
      '.sidebar-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;flex:1;justify-content:center;gap:12px;align-items:center;min-height:0}',
      '.sidebar-btn{width:72px;height:72px;padding:0;border:2px solid #000;border-radius:12px;background:rgba(228,213,183,.9);color:#1a150e;font-size:13px;font-weight:bold;cursor:pointer;transition:transform .35s cubic-bezier(0.34,1.2,0.64,1),background .3s ease,box-shadow .35s cubic-bezier(0.34,1.2,0.64,1),border-color .25s ease,border-width .25s ease,color .25s ease;display:flex;flex-direction:column;align-items:center;justify-content:stretch;overflow:hidden;outline:none}.sidebar-btn[data-tab="character"],.sidebar-btn[data-tab="misc"]{position:relative;overflow:visible}.sidebar-btn[data-tab="character"] .badge-dot{position:absolute;top:2px;right:2px;width:10px;height:10px;border-radius:50%;background:#c83c3c;border:1px solid rgba(228,213,183,.9);display:none;z-index:1;pointer-events:none;transition:background .2s,border-color .2s}.sidebar-btn[data-tab="character"] .badge-dot.show{display:block}.sidebar-btn[data-tab="character"].active .badge-dot.show{background:var(--ornate-gold);border-color:rgba(10,8,6,.6)}',
      '.sidebar-btn-icon{flex:0 0 80%;width:100%;display:flex;align-items:center;justify-content:center;min-height:0}.sidebar-btn-icon svg{width:28px;height:28px;flex-shrink:0;stroke:currentColor}',
      '.sidebar-btn-label{flex:0 0 20%;display:flex;align-items:center;justify-content:center;font-size:11px;line-height:1.2;text-align:center;white-space:nowrap}',
      '.sidebar-btn:hover{border-color:#000;background:rgba(200,185,165,.95);box-shadow:0 2px 8px rgba(0,0,0,.25);transform:translateX(4px)}',
      '.sidebar-btn:active{transform:translateX(4px) scale(.96);box-shadow:0 1px 4px rgba(0,0,0,.3)}',
      '.sidebar-btn.active{border:4px solid var(--ornate-gold);background:#0a0806;color:#f0e6d0;box-shadow:0 0 12px rgba(var(--ornate-gold-rgb),.7),0 0 24px rgba(var(--ornate-gold-rgb),.4),inset 0 0 20px rgba(0,0,0,.6),inset 0 0 0 2px rgba(var(--ornate-gold-rgb),.25);transform:translateX(12px) scale(1.08)}',
      '.sidebar-btn.active:hover{border-color:var(--ornate-gold);background:#151210;box-shadow:0 0 16px rgba(var(--ornate-gold-rgb),.85),0 0 32px rgba(var(--ornate-gold-rgb),.5),inset 0 0 24px rgba(0,0,0,.65),inset 0 0 0 2px rgba(var(--ornate-gold-rgb),.35);transform:translateX(12px) scale(1.1)}',
      '.sidebar-btn.active:active{transform:translateX(12px) scale(1.04)}',
      '.battle-area{flex:1;display:flex;gap:32px;padding:24px;align-items:stretch;justify-content:center;min-width:0}',
      '.side{flex:1;min-width:0;max-width:42%;display:flex;flex-direction:column;background:#ddd5c8;border:3px solid #5c4a3a;border-radius:12px;padding:16px;box-shadow:inset 0 0 0 1px #8b7355;overflow:hidden}',
      '.battle-round-center{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-width:80px;color:#5c4a3a}',
      '.battle-round-swords{display:flex;align-items:center;justify-content:center;color:var(--ornate-gold);filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}.battle-round-swords svg{width:48px;height:48px}',
      '.battle-round-number{font-size:14px;font-weight:bold;color:#3d3529;line-height:1.2}',
      '.battle-round-phase{font-size:13px;font-weight:bold;color:#5c4a3a;line-height:1.2}',
      '.battle-end-turn-btn{margin-top:12px;padding:10px 28px;min-width:120px;font-size:15px;font-weight:bold;color:#e4d5b7;background:rgba(92,74,58,.6);border:2px solid rgba(139,115,32,.6);border-radius:8px;cursor:pointer;transition:background .2s,border-color .2s}.battle-end-turn-btn:hover{background:rgba(92,74,58,.9);border-color:var(--ornate-gold)}',
      '.slots-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:12px;flex:1;min-height:120px;min-width:0}',
      '.slot{border:2px solid #5c4a3a;border-radius:10px;background:#c4b8a8;display:flex;align-items:center;justify-content:center;font-size:13px;color:#3d3529;min-height:80px;min-width:0;cursor:default;transition:background .15s,border-color .15s;overflow:hidden}',
      '.slot-char:has(.slot-char-portrait){align-items:stretch;justify-content:flex-start;padding:10px 10px 10px 10px;text-align:left}',
      '.slot-char .slot-char-portrait{width:50%;flex:0 0 50%;min-width:0;aspect-ratio:1;overflow:hidden;border-radius:8px;border:2px solid #5c4a3a;background:#b8ab9a;display:flex;align-items:center;justify-content:center}',
      '.slot-char .slot-char-portrait img{width:100%;height:100%;object-fit:cover;display:block}',
      '.slot-char .slot-char-info{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 8px 0 8px;gap:6px;position:relative;overflow:hidden}',
      '.slot-char .slot-char-name{font-weight:bold;font-size:14px;color:#1a150e;line-height:1.2;text-align:center;width:100%;font-family:sans-serif}',
      '.slot-char .slot-char-level{font-size:11px;color:#5c4a3a;text-align:center;width:100%;line-height:1.2}',
      '.slot-char .slot-char-level-wrap{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;line-height:1.2}',
      '.slot-char .slot-char-shield{font-size:11px;color:#1976d2;font-weight:bold}',
      '.slot-char .slot-char-bar{position:relative;width:100%;height:18px;border-radius:999px;border:1.5px solid #3d2b1f;overflow:hidden;flex-shrink:0}',
      '.slot-char .slot-char-bar-fill{position:absolute;left:0;top:0;bottom:0;border-radius:999px;transition:width .2s ease}',
      '.slot-char .slot-char-bar-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#fff;text-shadow:0 0 1px #000;pointer-events:none;z-index:1}',
      '.slot-char .slot-char-hp .slot-char-bar-fill{background:#c83c3c}.slot-char .slot-char-hp{background:rgba(0,0,0,.12);position:relative}',
      '.slot-char .slot-char-bar-shield-edge{position:absolute;left:0;top:0;bottom:0;box-sizing:border-box;border-top:2px solid #1976d2;border-bottom:2px solid #1976d2;border-left:none;border-right:none;border-radius:0;pointer-events:none;z-index:1}.slot-char .slot-char-bar-shield-edge.slot-char-bar-shield-edge-full{border:2px solid #1976d2;border-radius:999px}',
      '.slot-char .slot-char-exp .slot-char-bar-fill{background:#2d8a4e}.slot-char .slot-char-exp{background:rgba(0,0,0,.08)}',
      '.slot-char .slot-char-exp .slot-char-bar-text{color:#1a150e;text-shadow:none}',
      '.slot-char .slot-char-buffs{display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start;min-height:26px;width:100%}',
      '.slot-char .slot-buff-pill{border-radius:6px;border:1.5px dashed;padding:2px 6px;font-size:10px;font-weight:bold;color:#1a150e;display:inline-flex;align-items:center;justify-content:space-between;gap:6px;min-width:52px;flex-shrink:0;cursor:help}.slot-char .slot-buff-layers{flex-shrink:0}.slot-char .slot-buff-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.slot-char .slot-char-ap{position:absolute;right:0;bottom:0;display:flex;align-items:center;gap:4px;font-size:10px;font-weight:bold;color:var(--ap-orange)}',
      '.slot-char .slot-char-ap-icon{display:flex;align-items:center;justify-content:center}.slot-char .slot-char-ap-icon svg{width:14px;height:14px;stroke:var(--ap-orange)}',
      '.slot-char .slot-char-ap-text{color:var(--ap-orange)}',
      '.slot-char .slot-char-ap-value{color:#1a150e}',
      '.slot-char,.slot-summon,.slot-enemy{background:#ddd5c8}',
      '.slot-enemy.slot-char .slot-char-portrait.slot-enemy-portrait-empty{background:#b8ab9a;cursor:default}',
      '.slot-enemy-atk-icon{display:inline-flex;align-items:center;flex-shrink:0}.slot-enemy-atk-icon svg{width:14px;height:14px;vertical-align:middle}',
      '.slot-enemy-def-wrap{display:inline-flex;align-items:center;gap:4px;min-width:0}.slot-enemy-def-icon{display:inline-flex;align-items:center;flex-shrink:0}.slot-enemy-def-icon svg{width:14px;height:14px;vertical-align:middle}',
      '.slot-enemy .slot-enemy-stats-row{min-width:0;overflow:hidden;flex-shrink:1}',
      '.slot-char{position:relative;transition:transform .28s ease-out,box-shadow .28s ease-out,border-color .2s ease-out}.slot-char .slot-swap-btn{position:absolute;top:5px;right:5px;width:26px;height:26px;padding:0;border:2px solid var(--gold-border);border-radius:50%;background:rgba(255,255,255,.92);color:#6b5a3d;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;transition:background .2s,box-shadow .2s,border-color .2s,transform .15s}.slot-char .slot-swap-btn:hover{background:#fff;border-color:var(--ornate-gold);box-shadow:0 2px 10px rgba(201,162,39,.4)}.slot-char .slot-swap-btn:active{transform:scale(0.92)}.slot-char .slot-swap-btn svg{width:14px;height:14px;stroke:currentColor}.side-ally.swap-mode-active .slot-char:not(.swap-floating) .slot-swap-btn{pointer-events:none;opacity:0.5;cursor:not-allowed}',
      '.slot-char.swap-floating{z-index:10;transform:scale(1.05);box-shadow:0 8px 24px rgba(0,0,0,.35),0 0 0 3px var(--ornate-gold);border-color:var(--ornate-gold);animation:swap-float-bob 1.8s ease-in-out .28s infinite}',
      '@keyframes swap-float-bob{0%,100%{transform:scale(1.05) translateY(0)}50%{transform:scale(1.05) translateY(-6px)}}',
      '.swap-overlay{position:fixed;inset:0;z-index:100;pointer-events:none}',
      '.swap-overlay .swap-clone{position:fixed;left:0;top:0;width:200px;min-height:80px;border-radius:10px;border:2px solid #5c4a3a;background:#ddd5c8;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:transform .35s cubic-bezier(0.34,1.2,0.64,1);display:flex;align-items:stretch;overflow:hidden}',
      '.swap-overlay .swap-clone.slot-char{background:#ddd5c8}',
      '.slot-char.swap-target{cursor:pointer;border-color:var(--ornate-gold);background:#e8dfd0;box-shadow:0 0 0 2px rgba(201,162,39,.4);transition:background .15s,box-shadow .15s}.slot-char.swap-target:hover{background:#f0e8dc;box-shadow:0 0 0 3px var(--ornate-gold)}',
      '.slot-char .slot-char-portrait{cursor:pointer}.slot-char .slot-char-portrait:hover{opacity:.92}',
      '.slot-hit-shake{animation:slot-hit-shake .4s ease-in-out}',
      '@keyframes slot-hit-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}30%{transform:translateX(6px)}45%{transform:translateX(-4px)}60%{transform:translateX(4px)}75%{transform:translateX(-2px)}90%{transform:translateX(2px)}}',
      '.slot-hit-damage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:20px;font-weight:bold;color:#c83c3c;text-shadow:0 0 4px #fff,0 0 8px rgba(200,60,60,.8),0 2px 4px rgba(0,0,0,.5);pointer-events:none;z-index:5;animation:slot-hit-damage-fly .9s ease-out forwards;white-space:nowrap}',
      '.slot-hit-damage-shadow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:20px;font-weight:bold;color:#7b1fa2;text-shadow:0 0 4px #fff,0 0 8px rgba(123,31,162,.8),0 2px 4px rgba(0,0,0,.5);pointer-events:none;z-index:4;animation:slot-hit-damage-fly .9s ease-out forwards;white-space:nowrap}',
      '@keyframes slot-hit-damage-fly{0%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}40%{opacity:1;transform:translate(-50%,-60%) scale(1.1)}100%{opacity:0;transform:translate(-50%,-100%) scale(1)}}',
      '.slot-hit-miss{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:20px;font-weight:bold;color:#fff;text-shadow:0 0 4px #333,0 0 8px rgba(0,0,0,.6),0 2px 4px rgba(0,0,0,.5);pointer-events:none;z-index:5;animation:slot-hit-damage-fly .9s ease-out forwards;white-space:nowrap}.slot-heal-number{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:20px;font-weight:bold;color:#2e7d32;text-shadow:0 0 4px #fff,0 0 8px rgba(46,125,50,.8),0 2px 4px rgba(0,0,0,.3);pointer-events:none;z-index:5;animation:slot-hit-damage-fly .9s ease-out forwards;white-space:nowrap}',
      '.slot-strike-shake{animation:slot-strike-shake .2s ease-out forwards}',
      '@keyframes slot-strike-shake{0%{transform:translateX(0)}25%{transform:translateX(var(--strike-dx,12px))}100%{transform:translateX(0)}}',
      /* 所有槽位动画叠层（Slash、Recovery4 等）：与角色卡同高、保持长宽比 */
      '.slot-slash-overlay,.slot-animation-overlay{position:absolute;inset:0;z-index:10;pointer-events:none;display:flex;align-items:center;justify-content:center;border-radius:inherit;overflow:hidden}.slot-slash-overlay img,.slot-animation-overlay img{height:100%;min-height:100%;width:auto;max-width:none;display:block;object-fit:contain;object-position:center;align-self:stretch}',
      '.slot-miss-shake{animation:slot-miss-shake .4s ease-in-out}',
      '@keyframes slot-miss-shake{0%,100%{transform:translateX(0)}12%{transform:translateX(-5px)}28%{transform:translateX(5px)}44%{transform:translateX(-4px)}60%{transform:translateX(4px)}76%{transform:translateX(-2px)}90%{transform:translateX(2px)}}',
      '.slot-defeated{position:relative;border:2px dashed #b91c1c!important;box-shadow:0 0 0 1px rgba(185,28,28,.4)}',
      '.slot-defeated-shake{animation:slot-defeated-shake .55s ease-in-out}',
      '@keyframes slot-defeated-shake{0%,100%{transform:translate(0,0)}10%{transform:translate(-8px,-4px)}20%{transform:translate(8px,4px)}30%{transform:translate(-8px,4px)}40%{transform:translate(8px,-4px)}50%{transform:translate(-6px,0)}60%{transform:translate(6px,0)}70%{transform:translate(-4px,-2px)}80%{transform:translate(4px,2px)}90%{transform:translate(-2px,0)}}',
      '.slot-defeated-overlay{position:absolute;inset:0;border-radius:inherit;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:15;background:rgba(180,0,0,.45);animation:slot-defeated-overlay-in .25s ease-out .5s forwards;opacity:0}',
      '.slot-defeated-overlay-text{font-size:20px;font-weight:bold;color:#b91c1c;text-shadow:0 1px 3px #000,0 0 8px rgba(185,28,28,.8);letter-spacing:2px}',
      '@keyframes slot-defeated-overlay-in{from{opacity:0}to{opacity:1}}',
      '.slot-void-overlay{position:absolute;inset:0;border-radius:inherit;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:14;background:rgba(10,10,45,.55);animation:slot-void-overlay-in .25s ease-out forwards;opacity:0}',
      '.slot-void-overlay-text{font-size:18px;font-weight:bold;color:#7b8ab8;text-shadow:0 1px 3px #000,0 0 8px rgba(60,80,140,.6);letter-spacing:2px}',
      '@keyframes slot-void-overlay-in{from{opacity:0}to{opacity:1}}',
      '.skill-popup{position:fixed;z-index:2000;background:#1a150e;color:#e4d5b7;border:2px solid var(--gold-border);border-radius:10px;padding:6px 0;min-width:200px;max-width:320px;max-height:calc(100vh - 16px);overflow-y:auto;overflow-x:hidden;box-shadow:0 6px 24px rgba(0,0,0,.45);display:none}.skill-popup.show{display:block}.skill-popup-title{padding:8px 14px 6px;font-size:12px;font-weight:bold;color:var(--ornate-gold);border-bottom:1px solid rgba(139,115,32,.4);margin-bottom:4px}.skill-popup-opt{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;cursor:pointer;font-size:14px;transition:background .15s}.skill-popup-opt:hover{background:rgba(201,162,39,.15)}.skill-popup-opt svg{width:18px;height:18px;flex-shrink:0;stroke:currentColor}.skill-popup-opt-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.skill-popup-opt-head{display:flex;align-items:center;min-width:0}.skill-popup-opt-ap{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:bold;color:var(--ap-orange);flex-shrink:0}.skill-popup-opt-ap svg{width:14px;height:14px;stroke:currentColor}.skill-popup-opt-desc{font-size:11px;color:#9a8b72;line-height:1.3;white-space:pre-line}.skill-popup-opt{position:relative}.skill-popup-opt-disabled{pointer-events:none;cursor:not-allowed}.skill-popup-opt-disabled::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.5);border-radius:4px}',
      '.view-container{display:flex;flex:1;flex-direction:column;min-height:0;min-width:0;overflow:hidden;position:relative}',
      '.view-battle{display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden;position:relative;z-index:0}',
      '.battle-floor-title-wrap{width:100%;flex-shrink:0;text-align:center;padding:12px 16px 6px;box-sizing:border-box}',
      '.battle-floor-title{margin:0;font-size:1.65rem;font-weight:900;font-family:"Microsoft YaHei","SimHei","Heiti SC","黑体",sans-serif;color:#fff;letter-spacing:.14em;line-height:1.25;text-shadow:0 0 6px rgba(201,162,39,.55),0 0 14px rgba(201,162,39,.35),0 0 22px rgba(201,162,39,.2)}',
      '.normal-battle-gen-error-overlay{position:absolute;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:rgba(0,0,0,.58);pointer-events:auto}',
      '.normal-battle-gen-error-overlay[hidden]{display:none!important}',
      '.normal-battle-gen-error-panel{max-width:min(520px,92vw);max-height:min(70vh,520px);width:100%;display:flex;flex-direction:column;gap:12px;padding:18px 20px;border:3px solid #b91c1c;border-radius:12px;background:linear-gradient(165deg,#2a1515 0%,#1a0f0e 100%);box-shadow:0 0 0 1px rgba(248,113,113,.35),0 12px 40px rgba(0,0,0,.65)}',
      '.normal-battle-gen-error-title{margin:0;font-size:1.15rem;font-weight:bold;color:#fecaca;text-align:center;letter-spacing:.08em}',
      '.normal-battle-gen-error-body{margin:0;padding:12px 14px;border-radius:8px;background:rgba(0,0,0,.45);color:#e7e5e4;font-size:12px;line-height:1.45;white-space:pre-wrap;overflow:auto;word-break:break-word;border:1px solid rgba(248,113,113,.25);flex:1;min-height:80px}',
      '.normal-battle-gen-error-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:4px}',
      '.normal-battle-gen-error-actions .story-side-btn{min-width:120px}',
      '.dungeon-floor-hud{position:relative;flex-shrink:0;z-index:12;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;width:100%;max-width:88px;padding:6px 4px 8px;margin:0 0 6px;background:rgba(26,21,14,.93);border:2px solid var(--gold-border);border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.4)}',
      '.dungeon-floor-hud-title{font-size:10px;font-weight:bold;color:#8b7355;letter-spacing:2px;line-height:1}',
      '.dungeon-floor-hud-major{font-size:26px;font-weight:bold;color:var(--ornate-gold);line-height:1.05;margin-top:4px;text-shadow:0 0 10px rgba(201,162,39,.4)}',
      '.dungeon-floor-hud-band{font-size:10px;color:#a89872;margin-top:4px;line-height:1.2;text-align:center;white-space:nowrap}',
      '.dungeon-floor-hud-floor{font-size:12px;font-weight:bold;color:#e4d5b7;margin-top:3px;line-height:1.2}',
      '.sidebar-gold-hud{flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;max-width:88px;padding:6px 4px 2px;margin-top:auto;pointer-events:none}',
      '.sidebar-gold-icon{display:flex;align-items:center;justify-content:center;width:34px;height:34px;margin-bottom:2px;color:var(--ornate-gold);filter:drop-shadow(0 2px 3px rgba(0,0,0,.2))}',
      '.sidebar-gold-icon svg{width:100%;height:100%;display:block}',
      '.sidebar-gold-value{font-size:15px;font-weight:bold;color:#3d3529;line-height:1.15;letter-spacing:.02em;font-variant-numeric:tabular-nums}',
      '@keyframes gold-gain-float-up{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-52px)}}.gold-gain-float{position:fixed;z-index:4200;pointer-events:none;font-size:22px;font-weight:bold;color:#fbbf24;text-shadow:0 0 10px rgba(251,191,36,.9),0 2px 4px rgba(0,0,0,.5);animation:gold-gain-float-up 1.15s ease-out forwards}',
      '.battle-action-log{position:absolute;left:0;bottom:0;z-index:100;pointer-events:none;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:0;padding:8px;overflow:visible}',
      '.battle-action-log-line{background:rgba(0,0,0,.75);color:#fff;padding:4px 10px;font-size:12px;line-height:1.4;white-space:normal;max-width:min(420px,90vw);overflow-wrap:break-word;transition:opacity .3s ease-out}',
      '.battle-action-log-line.battle-action-log-fade{opacity:0}',
      '.battle-header{flex-shrink:0;padding:8px 16px;background:rgba(92,74,58,.2);border-bottom:1px solid rgba(139,115,32,.35);display:flex;flex-direction:column;gap:6px}',
      '.battle-phase-display{font-size:13px;font-weight:bold;color:#3d3529}',
      '.battle-combat-log{font-size:12px;color:#5c4a3a;max-height:80px;overflow-y:auto;line-height:1.4}',
      '.view-story{position:absolute;inset:0;z-index:50;display:flex;flex-direction:column;min-height:0;align-items:stretch;justify-content:center;padding:24px}',
      '.view-story[hidden]{display:none}',
      '.game-inner.mode-story .slot-swap-btn{display:none}',
      '.story-box{flex:1;min-height:400px;min-width:0;border-radius:16px;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border:2px solid #5c4d10;box-shadow:0 4px 20px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;animation:storySlideIn .15s ease-out}',
      '@keyframes storySlideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}',
      '.story-box.story-box-exit{animation:storySlideOut .15s ease-in forwards}',
      '@keyframes storySlideOut{from{transform:translateX(0)}to{transform:translateX(-100%)}}',
      '.story-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid rgba(92,77,16,.3);background:rgba(0,0,0,.04);flex-shrink:0}',
      '.story-toolbar-label{font-size:11px;font-weight:bold;color:#5c4d10;margin-right:4px}',
      '.story-side-btn{height:32px;padding:0 12px;border:2px solid #8b7320;border-radius:8px;background:#1a150e;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#e4d5b7;font-size:11px;font-weight:bold;transition:transform .2s,box-shadow .2s}',
      '.story-side-btn:hover{transform:scale(1.05);box-shadow:0 0 10px #d2691e}',
      '.story-side-btn.active{border-color:var(--ornate-gold);box-shadow:0 0 8px rgba(var(--ornate-gold-rgb),.5)}',
      '.story-content{padding:20px 25px;line-height:1.25;text-align:justify;overflow-y:auto;flex:1;min-height:0}',
      '.story-content::-webkit-scrollbar{width:8px}.story-content::-webkit-scrollbar-track{background:rgba(0,0,0,.05);border-radius:4px}.story-content::-webkit-scrollbar-thumb{background:#8b7320;border-radius:4px}',
      '.story-content.font-small{font-size:14px}.story-content.font-medium{font-size:16px}.story-content.font-large{font-size:19px}',
      '.story-content.font-kaiti{font-family:"Kaiti","STKaiti","楷体",serif}.story-content.font-songti{font-family:"Songti","STSong","宋体",serif}.story-content.font-heiti{font-family:"Heiti","STHeiti","黑体",sans-serif}.story-content.font-fangsong{font-family:"FangSong","STFangsong","仿宋",serif}.story-content.font-yahei{font-family:"Microsoft YaHei","微软雅黑",sans-serif}',
      '.view-settings{position:absolute;inset:0;z-index:51;display:flex;flex-direction:column;min-height:0;align-items:stretch;justify-content:center;padding:24px}',
      '.view-settings[hidden]{display:none}',
      '.settings-box{flex:1;min-height:400px;min-width:0;border-radius:16px;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border:2px solid #5c4d10;box-shadow:0 4px 20px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;animation:storySlideIn .15s ease-out}',
      '.settings-box.settings-box-exit{animation:storySlideOut .15s ease-in forwards}',
      '.settings-inner{padding:24px;overflow-y:auto;flex:1;min-height:0}',
      '.settings-title{margin:0 0 20px;font-size:18px;color:#3d2b1f;text-align:center;border-bottom:1px solid rgba(92,77,16,.35);padding-bottom:12px}',
      '.settings-section{margin-bottom:18px}',
      '.settings-label{display:block;font-size:12px;font-weight:bold;color:#5c4d10;margin-bottom:8px}',
      '.settings-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
      '.settings-close{display:block;width:100%;margin-top:20px;padding:10px 16px;border:2px solid #8b7320;border-radius:8px;background:#1a150e;color:#e4d5b7;font-size:14px;font-weight:bold;cursor:pointer;transition:transform .2s,box-shadow .2s}',
      '.settings-close:hover{transform:scale(1.02);box-shadow:0 0 12px #d2691e}',
      '.character-panel{position:absolute;left:100%;top:50%;transform:translateY(-50%);margin-left:8px;z-index:20;animation:characterPanelIn .15s ease-out}',
      '.character-panel[hidden]{display:none}',
      '@keyframes characterPanelIn{from{opacity:0;transform:translateY(-50%) translateX(-8px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}',
      '.character-panel-inner{background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border:2px solid #5c4d10;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.25);padding:10px}',
      '.misc-panel{position:absolute;left:100%;top:50%;transform:translateY(-50%);margin-left:8px;z-index:20;animation:characterPanelIn .15s ease-out}',
      '.misc-panel[hidden]{display:none}',
      '.misc-panel-inner{background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border:2px solid #5c4d10;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.25);padding:10px;display:flex;flex-direction:column;gap:12px;min-width:72px}',
      '.misc-sub-btn{width:72px;padding:10px 0;border:2px solid #000;border-radius:12px;background:rgba(228,213,183,.9);color:#1a150e;font-size:13px;font-weight:bold;cursor:pointer;transition:transform .35s cubic-bezier(0.34,1.2,0.64,1),background .3s ease,box-shadow .35s cubic-bezier(0.34,1.2,0.64,1),border-color .25s ease,border-width .25s ease,color .25s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;outline:none}.misc-sub-btn:hover{border-color:#000;background:rgba(200,185,165,.95);box-shadow:0 2px 8px rgba(0,0,0,.25);transform:translateX(4px)}.misc-sub-btn:active{transform:translateX(4px) scale(.96);box-shadow:0 1px 4px rgba(0,0,0,.3)}',
      '.misc-sub-btn.active{border:4px solid var(--ornate-gold);background:#0a0806;color:#f0e6d0;box-shadow:0 0 12px rgba(var(--ornate-gold-rgb),.7),0 0 24px rgba(var(--ornate-gold-rgb),.4),inset 0 0 20px rgba(0,0,0,.6),inset 0 0 0 2px rgba(var(--ornate-gold-rgb),.25);transform:translateX(4px) scale(1.08)}.misc-sub-btn.active:hover{background:#151210;border-color:var(--ornate-gold);box-shadow:0 0 16px rgba(var(--ornate-gold-rgb),.85),0 0 32px rgba(var(--ornate-gold-rgb),.5),inset 0 0 24px rgba(0,0,0,.65),inset 0 0 0 2px rgba(var(--ornate-gold-rgb),.35);transform:translateX(4px) scale(1.1)}.misc-sub-btn.active:active{transform:translateX(4px) scale(1.04)}',
      '.misc-sub-btn-icon{display:flex;align-items:center;justify-content:center}.misc-sub-btn-icon svg{width:28px;height:28px;stroke:currentColor}.misc-sub-btn-label{font-size:11px;line-height:1.2;text-align:center;white-space:nowrap}',
      '.character-avatars{display:flex;flex-direction:column;gap:12px;width:72px}',
      '.character-avatar-slot{position:relative;width:72px;height:72px;flex:0 0 72px;border-radius:12px;background:#c4b8a8;border:2px solid #8b7355;overflow:hidden;display:flex;align-items:center;justify-content:center;background-size:cover;background-position:center top;cursor:pointer}.character-avatar-slot.empty{opacity:.5;cursor:default;pointer-events:none}.character-avatar-slot .badge-dot{position:absolute;top:4px;right:4px;width:10px;height:10px;border-radius:50%;background:#c83c3c;border:1px solid rgba(228,213,183,.95);display:none;z-index:2;pointer-events:none}.character-avatar-slot .badge-dot.show{display:block}',
      '.character-detail-drawer{position:absolute;left:0;top:0;bottom:0;right:0;width:100%;z-index:30;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border-right:2px solid var(--ornate-dark);box-shadow:4px 0 24px rgba(0,0,0,.25);transform:translateX(-100%);transition:transform .3s cubic-bezier(0.19,1,0.22,1);overflow:hidden;display:flex;flex-direction:column}',
      '.character-detail-drawer.open{transform:translateX(0)}',
      '.character-detail-backdrop{position:absolute;inset:0;z-index:25;pointer-events:none;background:transparent;transition:background .2s}',
      '.character-detail-backdrop.visible{pointer-events:auto;background:rgba(0,0,0,.12)}',
      '.map-drawer{position:absolute;left:0;top:0;bottom:0;right:0;width:100%;z-index:30;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border-right:2px solid var(--ornate-dark);box-shadow:4px 0 24px rgba(0,0,0,.25);transform:translateX(-100%);transition:transform .3s cubic-bezier(0.19,1,0.22,1);overflow:hidden;display:flex;flex-direction:column}',
      '.map-drawer.open{transform:translateX(0)}',
      '.map-drawer-backdrop{position:absolute;inset:0;z-index:25;pointer-events:none;background:transparent;transition:background .2s}',
      '.map-drawer.open ~ .map-drawer-backdrop{pointer-events:auto;background:rgba(0,0,0,.12)}',
      '.map-drawer-content{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;flex-direction:column}',
      '.bag-drawer{position:absolute;left:0;top:0;bottom:0;right:0;width:100%;z-index:30;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border-right:2px solid var(--ornate-dark);box-shadow:4px 0 24px rgba(0,0,0,.25);transform:translateX(-100%);transition:transform .3s cubic-bezier(0.19,1,0.22,1);overflow:hidden;display:flex;flex-direction:column}',
      '.bag-drawer.open{transform:translateX(0)}',
      '.bag-drawer-backdrop{position:absolute;inset:0;z-index:25;pointer-events:none;background:transparent;transition:background .2s}',
      '.bag-drawer.open ~ .bag-drawer-backdrop{pointer-events:auto;background:rgba(0,0,0,.12)}',
      '.bag-drawer-content{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}',
      '.save-drawer{position:absolute;left:0;top:0;bottom:0;right:0;width:100%;z-index:30;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png");border-right:2px solid var(--ornate-dark);box-shadow:4px 0 24px rgba(0,0,0,.25);transform:translateX(-100%);transition:transform .3s cubic-bezier(0.19,1,0.22,1);overflow:hidden;display:flex;flex-direction:column}',
      '.save-drawer.open{transform:translateX(0)}',
      '.save-drawer-backdrop{position:absolute;inset:0;z-index:25;pointer-events:none;background:transparent;transition:background .2s}',
      '.save-drawer.open ~ .save-drawer-backdrop{pointer-events:auto;background:rgba(0,0,0,.12)}',
      '.save-drawer-content{flex:1;min-height:0;overflow:auto;padding:18px 18px 22px;display:flex;flex-direction:column;color:#3d2b1f}',
      '.save-drawer-title{margin:0 0 14px;font-size:22px;font-weight:900;padding-bottom:12px;color:#2f2317;letter-spacing:.12em;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(61,43,31,.18)}',
      '.save-drawer-title-left{display:flex;align-items:center;gap:12px;min-width:0}',
      '.save-drawer-title-left>span{display:inline-flex;align-items:center}',
      '.save-drawer-title-right{display:flex;align-items:center;gap:10px;min-width:0}',
      '.save-slot-list{display:flex;flex-direction:column;gap:12px}',
      '.save-slot-list.two-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch}',
      '.save-slot-list.two-col .save-slot-card{height:100%}',
      '.save-slot-card{position:relative;background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.62));border:1px solid rgba(61,43,31,.22);border-radius:16px;padding:14px 14px 12px;box-shadow:0 10px 24px rgba(0,0,0,.10);overflow:hidden}',
      '.save-slot-card::before{content:\"\";position:absolute;inset:-40px -40px auto auto;width:120px;height:120px;background:radial-gradient(circle at 30% 30%,rgba(201,162,39,.25),rgba(201,162,39,0) 70%);transform:rotate(12deg)}',
      '.save-slot-card.is-empty{border-style:dashed;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.55))}',
      '.save-slot-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}',
      '.save-slot-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:160px;flex-shrink:0}',
      '.save-slot-main{display:flex;flex-direction:column;gap:4px;min-width:0}',
      '.save-slot-name{font-weight:950;letter-spacing:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.save-slot-meta{font-size:12px;opacity:.75;line-height:1.35;text-align:right;word-break:break-word;flex-shrink:0}',
      '.save-map-name{font-size:14px;font-weight:950;letter-spacing:.14em;color:#2f2317;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}',
      '.save-map-sub{font-size:12px;opacity:.72;font-weight:800;letter-spacing:.04em;margin-top:2px}',
      '.save-party-grid{display:flex;flex-wrap:nowrap;gap:10px;justify-content:flex-end;align-items:flex-start}',
      '.save-party-grid{overflow-x:auto;max-width:420px;padding-bottom:2px}',
      '.save-party-grid::-webkit-scrollbar{height:6px}',
      '.save-party-grid::-webkit-scrollbar-thumb{background:rgba(61,43,31,.18);border-radius:999px}',
      '.save-party-unit{width:72px;display:flex;flex-direction:column;align-items:center;gap:6px}',
      '.save-party-avatar{position:relative;width:72px;height:72px;border-radius:12px;background:#c4b8a8;border:2px solid #8b7355;overflow:hidden;background-size:cover;background-position:center top;box-shadow:0 4px 14px rgba(0,0,0,.12)}',
      '.save-party-avatar.empty{opacity:.35;filter:grayscale(.7)}',
      '.save-party-name{font-size:12px;font-weight:900;color:#2f2317;max-width:72px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.06em}',
      '.save-party-lv{position:absolute;right:6px;bottom:6px;background:rgba(26,21,14,.82);color:#f0e6d0;border:1px solid rgba(201,162,39,.55);border-radius:999px;padding:2px 6px;font-size:11px;font-weight:900;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,.25)}',
      '.save-slot-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:10px}',
      '.save-slot-foot .save-slot-actions{margin-top:0}',
      '.save-slot-actions{display:flex;flex-wrap:wrap;gap:10px;flex:1 1 auto;min-width:220px}',
      '.save-slot-foot .save-party-grid{flex:0 0 auto;align-self:flex-end;margin-top:0}',
      '.save-slot-btn{appearance:none;border:1px solid rgba(61,43,31,.22);background:rgba(255,255,255,.86);color:#2f2317;border-radius:12px;padding:8px 12px;font-size:12px;font-weight:900;cursor:pointer;transition:transform .06s ease,background .12s ease,box-shadow .12s ease,opacity .12s ease;box-shadow:0 1px 0 rgba(0,0,0,.04)}',
      '.save-slot-btn:hover{background:#fff;box-shadow:0 6px 14px rgba(0,0,0,.10)}',
      '.save-slot-btn:active{transform:translateY(1px)}',
      '.save-slot-btn[disabled]{opacity:.45;cursor:not-allowed;pointer-events:none}',
      '.save-slot-btn.primary{background:linear-gradient(180deg,rgba(255,236,168,.95),rgba(255,224,120,.85));border-color:rgba(201,162,39,.55)}',
      '.save-slot-btn.danger{background:linear-gradient(180deg,rgba(255,210,210,.90),rgba(255,185,185,.72));border-color:rgba(140,45,45,.40)}',
      '.save-slot-card.snapshot-auto-slot{border-color:rgba(46,106,165,.55);background:linear-gradient(180deg,rgba(230,242,255,.92),rgba(210,228,248,.75));box-shadow:0 8px 20px rgba(46,106,165,.15)}',
      '.save-slot-card.snapshot-auto-slot .save-map-name{color:#1a4a7a}',
      '.snapshot-timeline-block{margin:0 0 14px;padding:12px;border:1px solid rgba(61,43,31,.18);border-radius:12px;background:rgba(255,255,255,.5)}',
      '.snapshot-timeline-title{font-size:13px;font-weight:950;color:#2f2317;margin:0 0 8px;letter-spacing:.06em}',
      '.snapshot-timeline-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid rgba(61,43,31,.12);font-size:12px}',
      '.snapshot-timeline-row:first-of-type{border-top:none}',
      '.snapshot-timeline-meta{opacity:.85;flex:1;min-width:0;line-height:1.35}',
      '.bag-wrapper{height:100%;display:flex;flex-direction:column;overflow:hidden}',
      '.bag-header{font-size:26px;font-weight:bold;border-bottom:3px solid var(--gold-border);padding:25px 35px 15px;flex-shrink:0;color:#4a3c1a;display:flex;align-items:center;gap:10px}.bag-header-icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}.bag-header-icon svg{width:28px;height:28px;stroke:currentColor}',
      '.bag-list{flex:1;padding:15px 35px 35px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;-webkit-overflow-scrolling:touch}',
      '.bag-list::-webkit-scrollbar{width:8px}.bag-list::-webkit-scrollbar-track{background:rgba(0,0,0,.05);border-radius:4px}.bag-list::-webkit-scrollbar-thumb{background:var(--gold-border);border-radius:4px}.bag-list::-webkit-scrollbar-thumb:hover{background:#a68b2a}',
      '.bag-row{background:rgba(255,255,255,.6);border:1px solid var(--gold-border);padding:15px 25px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-size:16px;flex-shrink:0}.bag-row .bag-row-type{background:#8b7320;color:#fff;padding:4px 12px;border-radius:6px;font-size:13px}',
      '.map-wrapper{flex:1;min-height:0;display:flex;flex-direction:column;padding:12px 0 8px;min-width:0}',
      '.map-header{font-size:24px;font-weight:bold;margin-bottom:14px;text-align:center;color:#4a3c1a;letter-spacing:4px;flex-shrink:0}',
      '.map-grid-scroll{flex:1;min-height:0;min-width:0;max-width:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:12px 0 20px;box-sizing:border-box}',
      '.map-grid-inner{min-height:100%;width:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center}',
      '.map-grid-inner .map-grid-16{width:max-content;margin-left:auto;margin-right:auto;flex-shrink:0}',
      '.map-grid-scroll::-webkit-scrollbar{width:10px;height:10px}.map-grid-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,.06);border-radius:4px}.map-grid-scroll::-webkit-scrollbar-thumb{background:var(--gold-border);border-radius:4px}.map-grid-scroll::-webkit-scrollbar-thumb:hover{background:#a68b2a}',
      '.map-grid-16{display:grid;grid-template-columns:repeat(16,58px);grid-template-rows:repeat(3,120px);gap:12px;align-items:center;justify-items:center;width:max-content}',
      '.map-grid-16--anim .node-circle.map-gen-pending{opacity:0;transform:scale(0.5);filter:blur(2px);pointer-events:none;transition:opacity .38s cubic-bezier(0.22,1,0.36,1),transform .38s cubic-bezier(0.22,1,0.36,1),filter .25s ease}',
      '.map-grid-16--anim .node-circle.map-gen-pending.map-gen-revealed{opacity:1;transform:scale(1);filter:none;pointer-events:auto}',
      '.map-grid-16--anim .node-circle.map-gen-pending.map-gen-revealed.visited{background:#1a150e!important;border-color:#1a150e!important;color:#fff!important;opacity:1;filter:none;pointer-events:none}',
      '.map-grid-16--anim .node-circle.map-gen-pending.map-gen-revealed.skipped{opacity:.35;filter:grayscale(.85);pointer-events:none}',
      '.map-grid-16--anim .node-circle.map-gen-pending.map-gen-revealed.future{pointer-events:none}',
      '.map-grid-16--anim .node-circle.map-gen-pending.map-gen-revealed.map-node--muted{pointer-events:none}',
      '.map-grid-16--anim .node-circle.map-gen-pending.map-gen-revealed.current{transform:scale(1.2);filter:none;opacity:1}',
      '.node-circle{width:100%;max-width:58px;aspect-ratio:1;margin:0 auto;border:3px solid #1a150e;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.4);cursor:pointer;transition:transform .2s,background .2s;position:relative;font-size:20px}',
      '.node-circle:hover{transform:scale(1.12);background:#fff;z-index:5}.node-circle.visited:hover{transform:scale(1);background:#1a150e!important}.node-circle.skipped:hover{transform:scale(1)}.node-circle.current{background:#1a150e!important;color:#fff!important;transform:scale(1.2);box-shadow:0 0 20px var(--ap-glow)}.node-circle.visited{background:#1a150e!important;color:#fff!important;border-color:#1a150e!important;transform:scale(1);box-shadow:none;cursor:not-allowed;pointer-events:none;opacity:1;filter:none}.node-circle.skipped{opacity:.35;filter:grayscale(.85);cursor:not-allowed;pointer-events:none;background:rgba(255,255,255,.4)!important;border-color:#b0a898!important}.node-circle.visited .node-type-label{color:#b8b0a0}.node-circle.skipped .node-type-label{color:#8a8270}.node-circle.current .node-type-label{color:#e4d5b7}.node-circle.reachable.map-node--selected .node-type-label{color:#e4d5b7}.node-circle.reachable{border-color:var(--ap-glow);border-width:4px;animation:nodePulse 2s infinite}.node-circle.future{cursor:not-allowed;pointer-events:none}',
      '.node-circle-icon{display:flex;align-items:center;justify-content:center;width:28px;height:28px;flex-shrink:0}.node-circle-icon svg{width:100%;height:100%;stroke:currentColor}',
      '.node-type-label{position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-size:10px;white-space:nowrap;color:#5c4d10;font-weight:bold}',
      '.map-legend{display:flex;gap:16px;justify-content:center;padding:12px;background:rgba(0,0,0,.05);border-radius:10px;margin-top:16px;flex-shrink:0;flex-wrap:wrap}',
      '.legend-item{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:bold;color:#4a3c1a}.legend-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;flex-shrink:0}.legend-icon svg{width:100%;height:100%;stroke:currentColor}',
      '@keyframes nodePulse{0%{box-shadow:0 0 0 0 rgba(210,105,30,.5)}70%{box-shadow:0 0 0 10px rgba(210,105,30,0)}100%{box-shadow:0 0 0 0 rgba(210,105,30,0)}}',
      '@keyframes mapNodeSelectPop{0%{transform:scale(1)}40%{transform:scale(0.88)}100%{transform:scale(1)}}',
      '.node-circle.reachable.map-node--selected{background:#1a150e!important;color:#fff!important;border-color:#1a150e!important;box-shadow:none!important;animation:mapNodeSelectPop .45s cubic-bezier(0.34,1.2,0.64,1) both}',
      '.node-circle.reachable.map-node--selected:hover{transform:scale(1);background:#1a150e!important}',
      '.node-circle.reachable.map-node--selected .node-circle-icon{color:#fff}',
      '.node-circle.reachable.map-node--selected .node-circle-icon svg{stroke:currentColor;color:#fff}',
      '.node-circle.future.map-node--muted{animation:none!important;opacity:.55;filter:grayscale(1);border-color:#9e9e9e!important;background:rgba(190,190,190,.45)!important;color:#888!important;box-shadow:none!important;pointer-events:none;cursor:not-allowed}',
      '.node-circle.reachable.map-node--muted{animation:none!important;opacity:.55;filter:grayscale(1);border-color:#9e9e9e!important;background:rgba(190,190,190,.45)!important;color:#888!important;box-shadow:none!important;cursor:pointer;pointer-events:auto}',
      '.node-circle.reachable.map-node--muted:hover{transform:scale(1.06);opacity:.65}',
      '.node-circle.map-node--muted .node-type-label{color:#8a8270}',
      '.node-circle.map-node--muted .node-circle-icon{color:#888}',
      '.node-circle.map-node--muted .node-circle-icon svg{stroke:currentColor;color:#888}',
      '.character-detail-content{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;padding:20px}',
      '.character-detail-content .char-detail-grid{flex:1;min-height:0;overflow:hidden}',
      '.char-detail-grid{display:grid;grid-template-columns:280px minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr);gap:20px;min-height:0}',
      '.char-detail-grid .col-base{grid-row:1/-1}',
      '.char-detail-grid .col-base{display:flex;flex-direction:column;gap:10px}',
      '.char-detail-grid .portrait-xl{width:100%;height:380px;object-fit:cover;object-position:top center;border:4px solid var(--gold-border);border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.3);flex-shrink:0}',
      '.char-detail-grid .char-name-box{font-size:1.6em;font-weight:bold;text-align:center;border-bottom:3px double var(--gold-border);padding-bottom:8px;flex-shrink:0;color:#1a150e}',
      '.char-detail-grid .star-rating{display:flex;justify-content:center;align-items:flex-end;gap:4px;padding:6px 0;flex-shrink:0}',
      '.char-detail-grid .star{width:20px;height:20px;color:#4a4a4a}.char-detail-grid .star.filled{color:#ffd700}',
      '.char-detail-grid .status-bars{background:rgba(0,0,0,.06);padding:10px;border-radius:8px;border:1px solid rgba(0,0,0,.1);flex-shrink:0}',
      '.char-detail-grid .bar-row{display:flex;align-items:center;gap:6px;margin-bottom:10px}.char-detail-grid .bar-row:last-child{margin-bottom:0}',
      '.char-detail-grid .bar-label{font-size:12px;font-weight:bold;color:#4a3c1a;min-width:28px;text-align:center}',
      '.char-detail-grid .bar-wrap{flex:1;height:22px;background:#111;border-radius:11px;position:relative;overflow:hidden;border:1px solid #000}',
      '.char-detail-grid .bar-fill{height:100%;transition:width .25s ease}.char-detail-grid .bar-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:bold;text-shadow:0 0 1px #000;z-index:1}',
      '.char-detail-grid .detail-block{background:rgba(255,255,255,.35);border:1px solid rgba(139,115,32,.25);border-radius:8px;padding:12px 15px;flex-shrink:0}',
      '.char-detail-grid .detail-block-attr{grid-column:3;grid-row:1}.char-detail-grid .detail-block-relic{grid-column:3;grid-row:2}.char-detail-grid .detail-block-skill{grid-column:2;grid-row:1/-1;min-height:0;display:flex;flex-direction:column;overflow:hidden}.char-detail-grid .detail-block-buff{grid-column:3;grid-row:3;min-height:0}',
      '.char-detail-grid .block-title{font-size:14px;font-weight:bold;color:#5c4d10;border-bottom:2px solid rgba(139,115,32,.3);padding-bottom:8px;margin-bottom:12px;display:flex;align-items:center;gap:8px}',
      '.char-detail-grid .detail-block-attr .block-title,.char-detail-grid .detail-block-skill .block-title.skill-panel-title{justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:8px}',
      '.char-detail-grid .attr-panel-header-right{display:flex;align-items:center;gap:6px;flex-shrink:0}.char-detail-grid .attr-badge-dot{width:10px;height:10px;border-radius:50%;background:#c83c3c;border:1px solid #e4d5b7;display:none;flex-shrink:0}.char-detail-grid .attr-badge-dot.show{display:block}.char-detail-grid .attr-unspent-text{font-size:12px;font-weight:bold;color:#5c4d10;white-space:nowrap}',
      '.char-detail-grid .attr-row .attr-row-actions{display:inline-flex;align-items:center;gap:4px;margin-right:6px}.char-detail-grid .attr-btn-minus,.char-detail-grid .attr-btn-plus{width:22px;height:22px;padding:0;border:1px solid #5c4a3a;border-radius:5px;background:rgba(255,255,255,.9);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#3d3529;transition:background .2s}.char-detail-grid .attr-btn-minus:hover,.char-detail-grid .attr-btn-plus:hover{background:#e4d5b7}.char-detail-grid .attr-btn-minus:disabled,.char-detail-grid .attr-btn-plus:disabled{opacity:.5;cursor:not-allowed}.char-detail-grid .attr-btn-minus svg,.char-detail-grid .attr-btn-plus svg{width:14px;height:14px;stroke:currentColor}',
      '.char-detail-grid .attr-allocate-footer{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(139,115,32,.25)}.char-detail-grid .attr-reset-btn{padding:6px 14px;border:2px solid #5c4a3a;border-radius:8px;background:rgba(255,255,255,.7);color:#3d2b1f;font-size:12px;font-weight:bold;cursor:pointer;transition:box-shadow .2s}.char-detail-grid .attr-reset-btn:hover{box-shadow:0 0 8px rgba(92,74,58,.35)}.char-detail-grid .attr-confirm-btn{padding:6px 14px;border:2px solid var(--gold-border);border-radius:8px;background:#1a150e;color:#e4d5b7;font-size:12px;font-weight:bold;cursor:pointer;transition:box-shadow .2s}.char-detail-grid .attr-confirm-btn:hover{box-shadow:0 0 10px rgba(201,162,39,.4)}.char-detail-grid .skill-allocate-footer{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(139,115,32,.25)}.char-detail-grid .skill-confirm-btn{padding:6px 14px;border:2px solid var(--gold-border);border-radius:8px;background:#1a150e;color:#e4d5b7;font-size:12px;font-weight:bold;cursor:pointer;transition:box-shadow .2s}.char-detail-grid .skill-confirm-btn:hover{box-shadow:0 0 10px rgba(201,162,39,.4)}',
      '.char-detail-grid .attr-list{display:grid;grid-template-columns:1fr 1fr;gap:6px}',
      '.char-detail-grid .attr-row{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:rgba(255,255,255,.7);border:1px solid var(--gold-border);border-radius:6px;font-weight:bold;font-size:12px}.attr-val-breakdown{text-decoration:underline;cursor:help}',
      '.char-detail-grid .attr-label{display:flex;align-items:center;gap:6px}',
      '.char-detail-grid .attr-value-wrap{display:flex;align-items:center;justify-content:flex-end;min-width:6.5em}.char-detail-grid .attr-value-wrap .attr-val{min-width:2em;text-align:right}',
      '.char-detail-grid .attr-icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}',
      '.char-detail-grid .attr-icon-svg{width:16px;height:16px}',
      '.char-detail-grid .detail-block-skill .skill-slots{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:var(--gold-border) transparent}.char-detail-grid .detail-block-skill .skill-slots::-webkit-scrollbar{width:14px}.char-detail-grid .detail-block-skill .skill-slots::-webkit-scrollbar-track{background:transparent}.char-detail-grid .detail-block-skill .skill-slots::-webkit-scrollbar-button{display:none;width:0;height:0}.char-detail-grid .detail-block-skill .skill-slots::-webkit-scrollbar-thumb{background:var(--gold-border);border-radius:6px;min-height:40px}.char-detail-grid .detail-block-skill .skill-slots::-webkit-scrollbar-thumb:hover{background:#a68b2a}',
      '.char-detail-grid .skill-card{background:rgba(255,255,255,.5);border:1px solid var(--gold-border);padding:8px 10px;border-radius:6px}.char-detail-grid .skill-card-locked-wrap{position:relative}.char-detail-grid .skill-card-locked-overlay{position:absolute;inset:0;background:rgba(255,255,255,.7);border-radius:6px;display:flex;align-items:center;justify-content:center;padding:8px}.char-detail-grid .skill-unlock-btn{padding:8px 14px;border:2px solid var(--gold-border);border-radius:8px;background:#1a150e;color:#e4d5b7;font-size:12px;font-weight:bold;cursor:pointer;transition:transform .2s,box-shadow .2s}.char-detail-grid .skill-unlock-btn:hover:not(:disabled){transform:scale(1.05);box-shadow:0 0 10px rgba(201,162,39,.4)}.char-detail-grid .skill-unlock-btn:disabled{opacity:.6;cursor:not-allowed}',
      '.char-detail-grid .skill-name{font-weight:bold;font-size:12px;color:#5c3a21;border-bottom:1px solid rgba(139,115,32,.25);display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;padding-bottom:4px}.char-detail-grid .skill-name-left{display:inline-flex;align-items:center;gap:6px}.char-detail-grid .skill-name-right{display:inline-flex;align-items:center;gap:6px;flex-shrink:0}.char-detail-grid .skill-lv{font-size:11px;color:#5c4d10;font-weight:bold}.char-detail-grid .skill-level-actions{display:inline-flex;align-items:center;gap:2px}.char-detail-grid .skill-btn-minus,.char-detail-grid .skill-btn-plus{width:20px;height:20px;padding:0;border:1px solid #5c4a3a;border-radius:4px;background:rgba(255,255,255,.9);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#3d3529;transition:background .2s}.char-detail-grid .skill-btn-minus:hover,.char-detail-grid .skill-btn-plus:hover{background:#e4d5b7}.char-detail-grid .skill-btn-minus:disabled,.char-detail-grid .skill-btn-plus:disabled{opacity:.5;cursor:not-allowed}.char-detail-grid .skill-btn-minus svg,.char-detail-grid .skill-btn-plus svg{width:12px;height:12px;stroke:currentColor}.char-detail-grid .skill-advance-btn{width:22px;height:22px;padding:0;border:none;border-radius:6px;background:#c83c3c;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#d4af37;transition:background .2s,transform .15s}.char-detail-grid .skill-advance-btn:hover{background:#a82d2d;transform:scale(1.05)}.char-detail-grid .skill-advance-btn svg{width:14px;height:14px;stroke:currentColor}',
      '.advancement-popup{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;pointer-events:none}.advancement-popup.show{display:flex;pointer-events:auto}.advancement-popup-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4)}.advancement-popup-panel{position:relative;z-index:1;background:#1a150e;color:#e4d5b7;border:2px solid var(--gold-border);border-radius:12px;padding:0;min-width:280px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,.5);display:flex;flex-direction:column}.advancement-popup-title{font-size:16px;font-weight:bold;color:var(--ornate-gold);padding:14px 44px 12px 16px;border-bottom:1px solid rgba(139,115,32,.4)}.advancement-popup-close{position:absolute;top:10px;right:10px;width:28px;height:28px;padding:0;border:none;border-radius:6px;background:transparent;color:#8b7355;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s}.advancement-popup-close:hover{background:rgba(139,115,32,.25);color:#e4d5b7}.advancement-popup-close svg{width:18px;height:18px;stroke:currentColor}.advancement-popup-body{padding:16px;display:flex;flex-direction:column;gap:12px}.advancement-opt{background:rgba(255,255,255,.06);border:1px solid rgba(139,115,32,.35);border-radius:8px;padding:12px 14px;cursor:pointer;transition:background .15s,border-color .15s}.advancement-opt:hover{background:rgba(201,162,39,.12);border-color:var(--gold-border)}.advancement-opt.selected{background:rgba(201,162,39,.2);border-color:var(--ornate-gold)}.advancement-opt-name{font-weight:bold;color:var(--ornate-gold);margin-bottom:6px}.advancement-opt-effect{font-size:12px;color:#c4b8a8;line-height:1.4}.advancement-popup-footer{padding:12px 16px 16px;border-top:1px solid rgba(139,115,32,.3)}.advancement-confirm-btn{width:100%;padding:10px 20px;border:2px solid var(--gold-border);border-radius:8px;background:rgba(201,162,39,.15);color:var(--ornate-gold);font-weight:bold;cursor:pointer;transition:background .2s}.advancement-confirm-btn:hover{background:rgba(201,162,39,.3)}.advancement-confirm-btn:disabled{opacity:.5;cursor:not-allowed}',
      '.char-detail-grid .skill-desc{font-size:11px;color:#555;line-height:1.35;white-space:pre-line}.char-detail-grid .skill-desc-advancement{font-size:11px;color:#555;line-height:1.35;margin-top:4px;white-space:pre-line}.buff-ref{color:#1e88e5;cursor:pointer;text-decoration:none}.skill-calc{font-weight:bold;cursor:help;border-bottom:1px dotted currentColor}.skill-calc-str{color:var(--hp-red)}.skill-calc-agi{color:#2e7d32}.skill-calc-int{color:#1565c0}.skill-calc-sta{color:#e65100}.skill-calc-def{color:#5d4037}.skill-calc-level{color:#6a1b9a}.skill-calc-atk{color:#c62828}.skill-calc-cha{color:#c2185b}.skill-calc-纳刀伤害{color:#5d4037}.skill-calc-白夜即死{color:#9c27b0}.skill-calc-心眼闪避{color:#2e7d32}.skill-calc-心眼暴击{color:#c62828}#buff-tooltip-popup{position:fixed;z-index:2147483647;display:none;max-width:280px;padding:8px 12px;font-size:12px;line-height:1.4;color:#1a150e;background:#f5f0e1;border:1px solid var(--gold-border);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.2);pointer-events:none}#buff-tooltip-popup.show{display:block}#buff-tooltip-popup .report-attr-name{display:inline}#buff-tooltip-popup .report-attr-icon{display:inline-flex;align-items:center;vertical-align:middle;margin-left:2px}#buff-tooltip-popup .report-attr-icon .attr-icon-svg{width:14px;height:14px}.char-detail-grid .passive-skills-section,.char-detail-grid .basic-skills-section,.char-detail-grid .active-skills-section{display:flex;flex-direction:column;gap:10px}.char-detail-grid .passive-skills-section{margin-bottom:12px}.char-detail-grid .basic-skills-section{margin-bottom:12px}.char-detail-grid .active-skills-section{margin-bottom:8px}.char-detail-grid .skill-subtitle{font-size:11px;font-weight:bold;color:#5c4d10;margin-bottom:6px;padding-bottom:2px;border-bottom:1px solid rgba(139,115,32,.2)}.char-detail-grid .special-skill-open-btn{padding:4px 10px;border:2px solid var(--gold-border);border-radius:6px;background:#1a150e;color:var(--ornate-gold);font-size:12px;font-weight:bold;cursor:pointer;margin-right:8px}.char-detail-grid .special-skill-open-btn:hover{background:rgba(201,162,39,.2)}.char-detail-grid .special-skills-section{margin-top:14px;padding-top:10px;border-top:1px solid rgba(139,115,32,.25)}.special-skill-popup{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;pointer-events:none}.special-skill-popup.show{display:flex;pointer-events:auto}.special-skill-popup-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4)}.special-skill-popup-panel{position:relative;z-index:1;background:#1a150e;color:#e4d5b7;border:2px solid var(--gold-border);border-radius:12px;padding:0;min-width:300px;max-width:90vw;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.5)}.special-skill-popup-title{padding:14px 44px 12px 16px;font-size:16px;font-weight:bold;color:var(--ornate-gold);border-bottom:1px solid rgba(139,115,32,.4)}.special-skill-popup-close{position:absolute;top:10px;right:10px;width:28px;height:28px;padding:0;border:none;border-radius:6px;background:transparent;color:#8b7355;cursor:pointer;display:flex;align-items:center;justify-content:center}.special-skill-popup-close:hover{background:rgba(139,115,32,.25);color:#e4d5b7}.special-skill-popup-body{padding:16px;overflow-y:auto;flex:1;min-height:0}.special-skill-opt{background:rgba(255,255,255,.06);border:1px solid rgba(139,115,32,.35);border-radius:8px;padding:12px 14px;margin-bottom:10px;display:flex;flex-direction:column;gap:6px}.special-skill-opt-name{font-weight:bold;color:var(--ornate-gold)}.special-skill-opt-effect{font-size:12px;color:#c4b8a8;line-height:1.4}.special-skill-opt-unlock{align-self:flex-start;padding:6px 12px;border:2px solid var(--gold-border);border-radius:6px;background:rgba(201,162,39,.15);color:var(--ornate-gold);font-size:12px;cursor:pointer}.special-skill-opt-unlock:hover{background:rgba(201,162,39,.3)}.special-skill-opt-unlock:disabled{opacity:.5;cursor:not-allowed}.char-detail-grid .skill-card-passive .skill-name .skill-passive-tag{font-size:10px;color:#7a6b5c;font-weight:normal;margin-left:0}.char-detail-grid .skill-tags{font-size:10px;color:#7a6b5c;margin-bottom:4px;padding-bottom:2px}',
      '.char-detail-grid .relic-slots{display:flex;flex-direction:column;gap:8px}',
      '.char-detail-grid .relic-card{background:linear-gradient(135deg,#fff,#fdf5e6);border:2px solid var(--gold-border);padding:10px;border-radius:6px}',
      '.char-detail-grid .relic-name{font-weight:bold;font-size:13px;color:#8b4513;margin-bottom:4px}.char-detail-grid .relic-effect{font-size:11px;color:#555}',
      '.char-detail-grid .detail-block-buff{flex:1;display:flex;flex-direction:column;min-height:0}.char-detail-grid .detail-block-buff .block-title{position:relative;padding-right:36px}.char-detail-grid .detail-buff-swap-btn{position:absolute;top:0;right:0;width:26px;height:26px;padding:0;border:2px solid var(--gold-border);border-radius:50%;background:rgba(255,255,255,.92);color:#6b5a3d;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}.char-detail-grid .detail-buff-swap-btn:hover{background:#fff;border-color:var(--ornate-gold)}.char-detail-grid .detail-buff-swap-btn svg{width:14px;height:14px;fill:currentColor}.char-detail-grid .buff-panel-body{flex:1;min-height:0;display:flex;flex-direction:column}.char-detail-grid .detail-block-buff.show-data-report .buff-container{display:none}.char-detail-grid .data-report-container{display:none;flex:1;min-height:120px;background:rgba(0,0,0,.03);border:1px solid var(--gold-border);padding:10px;border-radius:8px;flex-direction:column;gap:4px;overflow-y:auto;font-size:12px}.char-detail-grid .detail-block-buff.show-data-report .data-report-container{display:flex}.char-detail-grid .data-report-row{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:rgba(255,255,255,.5);border-radius:4px}.char-detail-grid .data-report-label{color:#5c4a3a;font-weight:bold}.char-detail-grid .data-report-value{color:#1a150e}.char-detail-grid .data-report-value-breakdown{cursor:help;text-decoration:underline;color:#1a150e}.char-detail-grid .buff-container{flex:1;min-height:120px;background:rgba(0,0,0,.03);border:1px solid var(--gold-border);padding:10px;border-radius:8px;display:flex;flex-direction:column;gap:6px;overflow-y:auto}',
      '.char-detail-grid .buff-item{background:linear-gradient(to right,#fff,#fafaf5);border-left:4px solid #2d5a27;padding:6px 10px;border-radius:0 6px 6px 0;font-size:11px}.char-detail-grid .buff-container .slot-char-buffs{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start}.char-detail-grid .buff-container .slot-buff-pill{border-radius:6px;border:1.5px dashed;padding:4px 8px;font-size:11px;font-weight:bold;color:#1a150e;display:inline-flex;align-items:center;gap:6px;flex-shrink:0;cursor:help}.char-detail-grid .buff-container .slot-buff-layers{flex-shrink:0}.char-detail-grid .buff-container .slot-buff-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.char-detail-grid .buff-name{font-weight:bold;color:#2d5a27;margin-bottom:2px}',
      '@media (max-width:640px){.game-frame.ornate-frame{margin:6px;padding:8px}.game-inner{flex-direction:column}.sidebar{width:100%;min-width:unset;flex-direction:row;justify-content:center;border:none;border-right:none;border-bottom:2px solid var(--ornate-dark)}.sidebar-list{flex-direction:row;gap:10px}.sidebar-btn{width:56px;height:56px;border-radius:10px}.sidebar-btn-icon svg{width:22px;height:22px}.sidebar-btn-label{font-size:10px}.character-avatars{width:56px;gap:10px}.character-avatar-slot{width:56px;height:56px;flex:0 0 56px;border-radius:10px}.misc-panel-inner{min-width:56px}.misc-sub-btn{width:56px}.dungeon-floor-hud{margin:0 10px 0 0;padding:6px 8px 8px;max-width:72px;flex-shrink:0}.dungeon-floor-hud-major{font-size:22px}.dungeon-floor-hud-floor{font-size:11px}.sidebar-gold-hud{margin-top:0;padding:4px 6px;max-width:64px}.sidebar-gold-icon{width:28px;height:28px}.sidebar-gold-value{font-size:13px}.battle-area{flex-direction:column}.side{max-width:none}.slots-grid{min-height:100px}.slot{min-height:60px;font-size:12px}.corner-ornament{width:28px;height:28px}.edge-top,.edge-bottom{left:32px;right:32px}.edge-left,.edge-right{top:32px;bottom:32px}.view-story{padding:12px}.story-box{min-height:300px}.view-settings{padding:12px}.settings-box{min-height:300px}.story-side-btn{height:28px;padding:0 8px;font-size:10px}}',
      '@media (max-width:640px){.character-detail-drawer{width:min(95%,100%)}.char-detail-grid{grid-template-columns:1fr;grid-template-rows:auto;padding:12px;gap:12px}.char-detail-grid .col-base{grid-row:auto}.char-detail-grid .detail-block-attr,.char-detail-grid .detail-block-relic,.char-detail-grid .detail-block-skill,.char-detail-grid .detail-block-buff{grid-column:1;grid-row:auto}.char-detail-grid .portrait-xl{height:auto;aspect-ratio:2/3;max-height:60vh}.char-detail-grid .char-name-box{font-size:1.4em}}',
    ].join('');

    /** buff 定义已移至 界面/battle.js 的 BUFF_DEFINITIONS，由 BattleGrid.BUFF_DEFINITIONS 提供；若 battle 未加载则为空数组 */
    var BUFF_DEFINITIONS =
      typeof window !== 'undefined' && window.BattleGrid && Array.isArray(window.BattleGrid.BUFF_DEFINITIONS)
        ? window.BattleGrid.BUFF_DEFINITIONS
        : [];

    /** 新游戏/空档时的默认地图节点列表（与 getMapData 内 fallback 一致） */
    var DEFAULT_MAP_NODES = [
      { id: '0-0', type: '起点' },
      { id: '1-1', type: '普通战斗' },
      { id: '1-2', type: '随机事件' },
      { id: '1-3', type: '普通战斗' },
      { id: '2-1', type: '随机事件' },
      { id: '2-2', type: '普通战斗' },
      { id: '2-3', type: '普通战斗' },
      { id: '3-1', type: '普通战斗' },
      { id: '3-2', type: '宝箱' },
      { id: '3-3', type: '随机事件' },
      { id: '4-1', type: '随机事件' },
      { id: '4-2', type: '商店' },
      { id: '4-3', type: '普通战斗' },
      { id: '5-1', type: '普通战斗' },
      { id: '5-2', type: '随机事件' },
      { id: '5-3', type: '精英战斗' },
      { id: '6-1', type: '随机事件' },
      { id: '6-2', type: '普通战斗' },
      { id: '6-3', type: '休息点' },
      { id: '7-1', type: '普通战斗' },
      { id: '7-2', type: '商店' },
      { id: '7-3', type: '随机事件' },
      { id: '8-1', type: '休息点' },
      { id: '8-2', type: '普通战斗' },
      { id: '8-3', type: '随机事件' },
      { id: '9-1', type: '随机事件' },
      { id: '9-2', type: '精英战斗' },
      { id: '9-3', type: '普通战斗' },
      { id: '10-1', type: '商店' },
      { id: '10-2', type: '随机事件' },
      { id: '10-3', type: '普通战斗' },
      { id: '11-1', type: '精英战斗' },
      { id: '11-2', type: '普通战斗' },
      { id: '11-3', type: '随机事件' },
      { id: '12-1', type: '随机事件' },
      { id: '12-2', type: '休息点' },
      { id: '12-3', type: '普通战斗' },
      { id: '13-1', type: '宝箱' },
      { id: '13-2', type: '随机事件' },
      { id: '13-3', type: '精英战斗' },
      { id: '14-1', type: '休息点' },
      { id: '14-2', type: '随机事件' },
      { id: '14-3', type: '商店' },
      { id: '15-0', type: '首领战斗' },
    ];

    var MAP_GEN_TYPE_ORDER = ['普通战斗', '随机事件', '休息点', '精英战斗', '商店', '宝箱'];

    function mapGenHashSeed(s) {
      var h = 2166136261 >>> 0;
      var str = String(s || '');
      for (var i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h >>> 0;
    }

    function createMapGenRng(seed) {
      var s = seed >>> 0;
      return function () {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
      };
    }

    /** 开局用：区域名 + 选项哈希 + 时间低位，使每局地图不同 */
    function createNewGameMapRng(areaName, selections) {
      var parts = [
        String(areaName || ''),
        String((selections && selections.diffUid) || ''),
        String((selections && selections.difficulty) || ''),
        ((selections && selections.characters) || []).join(','),
        String((selections && selections.blessing) || ''),
      ];
      var seed = mapGenHashSeed(parts.join('|')) ^ (Date.now() & 0xffffffff);
      return createMapGenRng(seed);
    }

    function mapGenShuffle(arr, rng) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    function mapGenWeightedPick(candidates, weights, rng) {
      var sum = 0;
      for (var i = 0; i < weights.length; i++) sum += weights[i];
      if (sum <= 0) return null;
      var r = rng() * sum;
      for (var j = 0; j < weights.length; j++) {
        r -= weights[j];
        if (r <= 0) return candidates[j];
      }
      return candidates[candidates.length - 1];
    }

    function mapGenTypeAllowedForPhase(col, type, phase) {
      if (phase === '14') return type === '随机事件' || type === '休息点' || type === '商店' || type === '宝箱';
      if (phase === 'early') return type !== '商店' && MAP_GEN_TYPE_ORDER.indexOf(type) >= 0;
      return MAP_GEN_TYPE_ORDER.indexOf(type) >= 0;
    }

    function mapGenCanPlaceElite(grid, col, row) {
      for (var dr = -1; dr <= 1; dr += 2) {
        var r2 = row + dr;
        if (r2 < 1 || r2 > 3) continue;
        if (grid[col + '-' + r2] === '精英战斗') return false;
      }
      return true;
    }

    /** 已与已放置的正交邻居（上下左右）同类型则不可再放，避免整列/整行连成同色 */
    function mapGenHasNeighborSameType(grid, col, row, type) {
      if (!type) return false;
      var nid;
      if (row > 1) {
        nid = col + '-' + (row - 1);
        if (grid[nid] === type) return true;
      }
      if (row < 3) {
        nid = col + '-' + (row + 1);
        if (grid[nid] === type) return true;
      }
      if (col > 1) {
        nid = col - 1 + '-' + row;
        if (grid[nid] === type) return true;
      }
      if (col < 14) {
        nid = col + 1 + '-' + row;
        if (grid[nid] === type) return true;
      }
      if (col === 1 && row === 2 && grid['0-0'] === type) return true;
      if (col === 14 && row === 2 && grid['15-0'] === type) return true;
      return false;
    }

    function mapGenTypeWeight(col, row, type, rem, grid, phase) {
      if (!rem[type]) return 0;
      if (!mapGenTypeAllowedForPhase(col, type, phase)) return 0;
      if (type === '精英战斗' && !mapGenCanPlaceElite(grid, col, row)) return 0;
      if (mapGenHasNeighborSameType(grid, col, row, type)) return 0;
      var w = 1;
      if (type === '休息点' && col < 6) w *= 0.35;
      if (phase === 'mid' && type === '商店' && col > 12) w *= 0.2;
      if (phase === 'mid' && type === '商店' && col >= 4 && col <= 12) w *= 1.35;
      if (phase === '14' && type === '商店') w *= 1.25;
      if ((type === '普通战斗' || type === '精英战斗') && phase !== '14') {
        var battleLeft = rem['普通战斗'] + rem['精英战斗'];
        var cap = phase === 'mid' ? (14 - col) * 3 + 9 : (4 - col) * 3;
        var slack = cap - battleLeft;
        if (slack <= 2) w *= 10;
        else if (slack <= 5) w *= 4;
        else if (slack <= 9) w *= 2;
        if (phase === 'mid' && col >= 11 && battleLeft > 0) w *= 1.75;
        if (phase === 'early' && col >= 2 && battleLeft > 0) w *= 1.5;
      }
      return w;
    }

    function mapGenPickCounts(rng) {
      var a;
      for (a = 0; a < 400; a++) {
        var nb = 14 + Math.floor(rng() * 5);
        var ne = 14 + Math.floor(rng() * 5);
        var nr = 4 + Math.floor(rng() * 3);
        var nel = 3 + Math.floor(rng() * 3);
        var ns = 3 + Math.floor(rng() * 2);
        var nc = 2 + Math.floor(rng() * 2);
        if (nb + ne + nr + nel + ns + nc === 42) {
          return { 普通战斗: nb, 随机事件: ne, 休息点: nr, 精英战斗: nel, 商店: ns, 宝箱: nc };
        }
      }
      return { 普通战斗: 15, 随机事件: 15, 休息点: 5, 精英战斗: 3, 商店: 3, 宝箱: 1 };
    }

    function mapGenSumRem(rem) {
      var s = 0;
      for (var i = 0; i < MAP_GEN_TYPE_ORDER.length; i++) s += rem[MAP_GEN_TYPE_ORDER[i]] || 0;
      return s;
    }

    /** 第 14 层与 4–13 层填完后：舍去未消费的「商店」计数，并将剩余总量削减到 9（供 1–3 层） */
    function mapGenTrimRemToNine(rem, rng) {
      rem['商店'] = 0;
      if (mapGenSumRem(rem) < 9) return false;
      var guard = 0;
      while (mapGenSumRem(rem) > 9 && guard++ < 64) {
        var ks = MAP_GEN_TYPE_ORDER.filter(function (k) {
          return rem[k] > 0;
        });
        if (!ks.length) return false;
        rem[ks[Math.floor(rng() * ks.length)]]--;
      }
      return mapGenSumRem(rem) === 9;
    }

    /**
     * phase: '14' 先填第十四层 | 'mid' 填第 4–13 层 | 'early' 填第 1–3 层（无商店）
     * 每落子顺序推入 revealOrder（与动画顺序一致）
     */
    function fillMapColumn(col, rem, grid, rng, revealOrder, phase) {
      var battleRem = rem['普通战斗'] + rem['精英战斗'];
      if (phase === '14') {
        if (battleRem > 39) return false;
      } else if (phase === 'mid') {
        if (battleRem > (14 - col) * 3 + 9) return false;
      } else if (phase === 'early') {
        if (battleRem > (4 - col) * 3) return false;
      }
      var rowOrder = mapGenShuffle([1, 2, 3], rng);
      var mandRow = rowOrder[0];
      var mandOpts = [];
      var mandOptsRaw = [];
      if (phase === '14') {
        if (rem['随机事件'] > 0 && mapGenTypeAllowedForPhase(col, '随机事件', phase)) mandOptsRaw.push('随机事件');
      } else {
        if (rem['普通战斗'] > 0 && mapGenTypeAllowedForPhase(col, '普通战斗', phase)) mandOptsRaw.push('普通战斗');
        if (rem['随机事件'] > 0 && mapGenTypeAllowedForPhase(col, '随机事件', phase)) mandOptsRaw.push('随机事件');
      }
      if (mandOptsRaw.length === 0) return false;
      var mandOpts = mandOptsRaw.filter(function (t) {
        return !mapGenHasNeighborSameType(grid, col, mandRow, t);
      });
      if (mandOpts.length === 0) mandOpts = mandOptsRaw.slice();
      var mPick;
      if (mandOpts.length === 1) mPick = mandOpts[0];
      else if (mandOpts.indexOf('普通战斗') >= 0 && mandOpts.indexOf('随机事件') >= 0)
        mPick = rng() < 0.78 ? '普通战斗' : '随机事件';
      else mPick = mandOpts[Math.floor(rng() * mandOpts.length)];
      grid[col + '-' + mandRow] = mPick;
      revealOrder.push(col + '-' + mandRow);
      rem[mPick]--;
      var restRows = [];
      for (var r = 1; r <= 3; r++) {
        if (r !== mandRow) restRows.push(r);
      }
      mapGenShuffle(restRows, rng);
      for (var i = 0; i < restRows.length; i++) {
        var row = restRows[i];
        var candidates = [];
        var weights = [];
        for (var t = 0; t < MAP_GEN_TYPE_ORDER.length; t++) {
          var typ = MAP_GEN_TYPE_ORDER[t];
          var w = mapGenTypeWeight(col, row, typ, rem, grid, phase);
          if (w > 0) {
            candidates.push(typ);
            weights.push(w);
          }
        }
        if (candidates.length === 0) {
          var fb = [];
          for (var ft = 0; ft < MAP_GEN_TYPE_ORDER.length; ft++) {
            var ftyp = MAP_GEN_TYPE_ORDER[ft];
            if (!rem[ftyp]) continue;
            if (!mapGenTypeAllowedForPhase(col, ftyp, phase)) continue;
            if (ftyp === '精英战斗' && !mapGenCanPlaceElite(grid, col, row)) continue;
            fb.push(ftyp);
          }
          if (fb.length === 0) return false;
          var pickRel = fb[Math.floor(rng() * fb.length)];
          grid[col + '-' + row] = pickRel;
          revealOrder.push(col + '-' + row);
          rem[pickRel]--;
          continue;
        }
        var pick = mapGenWeightedPick(candidates, weights, rng);
        if (!pick) return false;
        grid[col + '-' + row] = pick;
        revealOrder.push(col + '-' + row);
        rem[pick]--;
      }
      return true;
    }

    function mapGenCloneRem(r) {
      var o = {};
      for (var i = 0; i < MAP_GEN_TYPE_ORDER.length; i++) {
        var k = MAP_GEN_TYPE_ORDER[i];
        o[k] = r[k] || 0;
      }
      return o;
    }

    function mapGenCloneGrid(g) {
      var o = {};
      for (var k in g) {
        if (g.hasOwnProperty(k)) o[k] = g[k];
      }
      return o;
    }

    function mapGenColPhase(col) {
      if (col === 14) return '14';
      if (col >= 4 && col <= 13) return 'mid';
      return 'early';
    }

    /** 末次尝试失败时：按 14 → 4–13 → 1–3 扫描空格，优先消耗 rem，否则用合规类型硬填 */
    function mapGenForceCompleteLastAttempt(grid, rem, revealOrder, rng) {
      var colsOrder = [14];
      for (var ci = 4; ci <= 13; ci++) colsOrder.push(ci);
      for (var cj = 1; cj <= 3; cj++) colsOrder.push(cj);
      for (var qi = 0; qi < colsOrder.length; qi++) {
        var col = colsOrder[qi];
        var phase = mapGenColPhase(col);
        for (var row = 1; row <= 3; row++) {
          var id = col + '-' + row;
          if (grid[id]) continue;
          var typ = mapGenPickForcedCell(col, row, rem, grid, phase, rng);
          grid[id] = typ;
          if (rem[typ] > 0) rem[typ]--;
          revealOrder.push(id);
        }
      }
    }

    function mapGenPickForcedCell(col, row, rem, grid, phase, rng) {
      var types = MAP_GEN_TYPE_ORDER.slice();
      mapGenShuffle(types, rng);
      var passes = [
        { needRem: true, checkNeighbor: true },
        { needRem: true, checkNeighbor: false },
        { needRem: false, checkNeighbor: true },
        { needRem: false, checkNeighbor: false },
      ];
      var pi, ti, t;
      for (pi = 0; pi < passes.length; pi++) {
        var needRem = passes[pi].needRem;
        var checkNeighbor = passes[pi].checkNeighbor;
        for (ti = 0; ti < types.length; ti++) {
          t = types[ti];
          if (!mapGenTypeAllowedForPhase(col, t, phase)) continue;
          if (t === '精英战斗' && !mapGenCanPlaceElite(grid, col, row)) continue;
          if (checkNeighbor && mapGenHasNeighborSameType(grid, col, row, t)) continue;
          if (needRem && rem[t] <= 0) continue;
          return t;
        }
      }
      return '随机事件';
    }

    function buildProceduralMapFromGrid(grid, revealOrder) {
      var nodes = [{ id: '0-0', type: '起点' }];
      for (var col = 1; col <= 14; col++) {
        for (var row = 1; row <= 3; row++) {
          var id = col + '-' + row;
          var typ = grid[id] || '随机事件';
          nodes.push({ id: id, type: typ });
        }
      }
      nodes.push({ id: '15-0', type: '首领战斗' });
      var fullReveal = ['0-0'].concat(revealOrder, ['15-0']);
      return { nodes: nodes, revealOrder: fullReveal };
    }

    function tryProceduralFillStrict(rem, grid, revealOrder, rng) {
      if (!fillMapColumn(14, rem, grid, rng, revealOrder, '14')) return false;
      var col;
      for (col = 4; col <= 13; col++) {
        if (!fillMapColumn(col, rem, grid, rng, revealOrder, 'mid')) return false;
      }
      if (!mapGenTrimRemToNine(rem, rng)) return false;
      for (col = 1; col <= 3; col++) {
        if (!fillMapColumn(col, rem, grid, rng, revealOrder, 'early')) return false;
      }
      return mapGenSumRem(rem) === 0;
    }

    /**
     * 生成顺序：第十四层 → 第四至十三层 → 舍去多余计数与未用商店 → 第一至三层（无商店）。
     * 返回 { nodes, revealOrder }；revealOrder 为动画顺序（含 0-0、15-0）。
     * 若多次严格尝试仍失败，对**最后一次尝试**的半成品强制补全后仍写入地图（不再使用 DEFAULT_MAP_NODES）。
     */
    function generateProceduralMapNodes(rng) {
      var tryMax = 1200;
      var lastGrid = null;
      var lastRem = null;
      var lastReveal = null;
      for (var attempt = 0; attempt < tryMax; attempt++) {
        var counts = mapGenPickCounts(rng);
        var rem = {
          普通战斗: counts['普通战斗'],
          随机事件: counts['随机事件'],
          休息点: counts['休息点'],
          精英战斗: counts['精英战斗'],
          商店: counts['商店'],
          宝箱: counts['宝箱'],
        };
        var grid = {};
        var revealOrder = [];
        var ok = tryProceduralFillStrict(rem, grid, revealOrder, rng);
        if (ok) return buildProceduralMapFromGrid(grid, revealOrder);
        lastGrid = mapGenCloneGrid(grid);
        lastRem = mapGenCloneRem(rem);
        lastReveal = revealOrder.slice();
      }
      mapGenForceCompleteLastAttempt(lastGrid, lastRem, lastReveal, rng);
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[色色地牢] 路线图严格生成未成功，已对最后一次尝试强制补全并写入地图（可能与理想配额略有偏差）');
      }
      return buildProceduralMapFromGrid(lastGrid, lastReveal);
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    /** 将描述中的【buff名】转为蓝色可悬停/点击的 span；将计算占位符转为加粗、按属性着色的 span（悬停/点击显示公式），并做 HTML 转义 */
    function wrapBuffRefs(text) {
      if (!text) return '';
      var escaped = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var withCalcs = escaped.replace(SKILL_CALC_PLACEHOLDER_RE, function (_, key, formula, value) {
        var formulaEsc = escapeHtml(formula);
        return (
          '<span class="skill-calc skill-calc-' +
          escapeHtml(key) +
          '" data-formula="' +
          formulaEsc +
          '" data-value="' +
          escapeHtml(value) +
          '">' +
          escapeHtml(value) +
          '</span>'
        );
      });
      // 特殊图标占位：在做完 HTML 转义后再替换为真实 SVG，避免被转义掉
      var luckIconHtml =
        '（<span class="attr-icon" style="color:#9c27b0;vertical-align:-2px">' +
        '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.17 7.83 2 22"/><path d="M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A1 1 0 1 1 4 12"/><path d="m7.83 7.83 8.34 8.34"/></svg>' +
        '</span>）';
      var withIcons = withCalcs.replace(/（幸运的svg）/g, luckIconHtml);
      return withIcons.replace(/【([^】]+)】/g, function (_, n) {
        var id = n.trim();
        return '<span class="buff-ref" data-buff-id="' + escapeHtml(id) + '">【' + escapeHtml(id) + '】</span>';
      });
    }
    /** 取 buff 的悬浮/点击说明：只显示 desc（简短描述） */
    function getBuffTooltipText(buffId) {
      var b = BUFF_DEFINITIONS.filter(function (x) {
        return x.id === buffId || x.name === buffId;
      })[0];
      return b && b.desc ? b.desc : '';
    }

    function injectStyles() {
      var el = document.createElement('style');
      el.textContent = CSS;
      (document.head || document.documentElement).appendChild(el);
    }

    /** 普通战斗 AI 生成失败：红框居中、展示原文/错误，回退地图选格或重试 */
    function initNormalBattleGenerateErrorUI() {
      var overlay = document.getElementById('normal-battle-gen-error-overlay');
      if (!overlay) return;
      var backBtn = document.getElementById('normal-battle-gen-error-back');
      var retryBtn = document.getElementById('normal-battle-gen-error-retry');
      function hideOverlay() {
        overlay.setAttribute('hidden', 'hidden');
      }
      window.色色地牢_showNormalBattleGenerateError = function (payload) {
        payload = payload || {};
        var titleEl = overlay.querySelector('.normal-battle-gen-error-title');
        var bodyEl = overlay.querySelector('.normal-battle-gen-error-body');
        if (titleEl) titleEl.textContent = payload.title || '生成出错';
        if (bodyEl) bodyEl.textContent = payload.body != null ? String(payload.body) : '';
        overlay.removeAttribute('hidden');
      };
      if (backBtn) {
        backBtn.addEventListener('click', function () {
          hideOverlay();
          if (typeof window.色色地牢_clearLastNormalBattleGenCtx === 'function')
            window.色色地牢_clearLastNormalBattleGenCtx();
          if (typeof window.色色地牢_clearMapNodeSelection === 'function')
            window.色色地牢_clearMapNodeSelection();
        });
      }
      if (retryBtn) {
        retryBtn.addEventListener('click', function () {
          hideOverlay();
          if (typeof window.色色地牢_retryLastNormalBattleGenerate === 'function')
            window.色色地牢_retryLastNormalBattleGenerate();
        });
      }
    }

    function initSidebar() {
      var gameFrame = document.querySelector('.game-frame.ornate-frame');
      if (
        gameFrame &&
        !document.getElementById('hentai-fs-btn-game') &&
        typeof window.色色地牢_createFullscreenButton === 'function'
      ) {
        var fsGame = window.色色地牢_createFullscreenButton();
        fsGame.id = 'hentai-fs-btn-game';
        gameFrame.appendChild(fsGame);
        if (typeof window.色色地牢_syncFullscreenButtons === 'function') window.色色地牢_syncFullscreenButtons();
      }
      var gameInner = document.querySelector('.game-inner');
      var viewStory = document.getElementById('view-story');
      var storyBox = viewStory ? viewStory.querySelector('.story-box') : null;
      var characterPanel = document.getElementById('character-panel');
      var STORY_EXIT_MS = 150;
      /** 角色面板 4 个槽依次映射为战斗区 1-6 中前 4 个有人的位（如 2、4 有人则面板 1→2 号位，面板 2→4 号位） */
      function syncCharacterPanel() {
        if (!characterPanel) return;
        var party = getParty();
        var filledSlots = [];
        for (var s = 1; s <= 6; s++) {
          if (party[s - 1]) filledSlots.push(s);
        }
        var panelSlots = characterPanel.querySelectorAll('.character-avatar-slot');
        for (var p = 0; p < 4; p++) {
          var panelSlot = panelSlots[p];
          if (!panelSlot) continue;
          var allySlot = filledSlots[p];
          panelSlot.setAttribute('data-avatar', allySlot ? String(allySlot) : '');
          if (allySlot) {
            var slot = document.querySelector('.slot[data-slot="ally-' + allySlot + '"]');
            var img = slot ? slot.querySelector('.slot-char-portrait img') : null;
            var nameEl = slot ? slot.querySelector('.slot-char-name') : null;
            var name = nameEl ? nameEl.textContent.trim() : '';
            panelSlot.style.backgroundImage = img && img.src ? 'url(' + img.src + ')' : '';
            panelSlot.title = name || '角色' + allySlot;
            panelSlot.classList.remove('empty');
            var dot = panelSlot.querySelector('.badge-dot');
            if (!dot) {
              dot = document.createElement('span');
              dot.className = 'badge-dot';
              dot.setAttribute('title', '未分配点数');
              panelSlot.appendChild(dot);
            }
            var ch = party[allySlot - 1];
            dot.classList.toggle('show', !!(ch && getUnspentPoints(ch) > 0));
          } else {
            panelSlot.style.backgroundImage = '';
            panelSlot.title = '空位';
            panelSlot.classList.add('empty');
            var dot = panelSlot.querySelector('.badge-dot');
            if (dot) dot.classList.remove('show');
          }
        }
        updateSidebarCharBadge();
      }
      function updateSidebarCharBadge() {
        var charBtn = document.querySelector('.sidebar-btn[data-tab="character"]');
        if (!charBtn) return;
        var dot = charBtn.querySelector('.badge-dot');
        if (!dot) {
          dot = document.createElement('span');
          dot.className = 'badge-dot';
          dot.setAttribute('title', '存在未分配点数');
          charBtn.appendChild(dot);
        }
        var party = getParty();
        var anyUnspent = party.some(function (ch) {
          return ch && getUnspentPoints(ch) > 0;
        });
        dot.classList.toggle('show', anyUnspent);
      }
      function closeCharacterPanelOnClickOutside(e) {
        if (characterPanel && characterPanel.contains(e.target)) return;
        var charBtn = document.querySelector('.sidebar-btn[data-tab="character"]');
        if (charBtn && charBtn.contains(e.target)) return;
        var drawer = document.getElementById('character-detail-drawer');
        if (drawer && drawer.classList.contains('open')) return;
        if (drawer && drawer.contains(e.target)) return;
        hideCharacterPanel();
        $('.sidebar-btn[data-tab="character"]').removeClass('active');
      }
      function showCharacterPanel() {
        syncCharacterPanel();
        if (characterPanel) characterPanel.removeAttribute('hidden');
        setTimeout(function () {
          document.addEventListener('click', closeCharacterPanelOnClickOutside);
        }, 0);
      }
      function hideCharacterPanel() {
        if (characterPanel) characterPanel.setAttribute('hidden', '');
        document.removeEventListener('click', closeCharacterPanelOnClickOutside);
      }
      var miscPanel = document.getElementById('misc-panel');
      function closeMiscPanelOnClickOutside(e) {
        if (miscPanel && miscPanel.contains(e.target)) return;
        var miscBtn = document.querySelector('.sidebar-btn[data-tab="misc"]');
        if (miscBtn && miscBtn.contains(e.target)) return;
        var mapDrawerEl = document.getElementById('map-drawer');
        if (mapDrawerEl && mapDrawerEl.classList.contains('open') && mapDrawerEl.contains(e.target)) return;
        var saveDrawerEl = document.getElementById('save-drawer');
        if (saveDrawerEl && saveDrawerEl.classList.contains('open') && saveDrawerEl.contains(e.target)) return;
        hideMiscPanel();
        hideMapDrawer();
        $('.sidebar-btn[data-tab="misc"]').removeClass('active');
      }
      function showMiscPanel() {
        hideCharacterPanel();
        if (miscPanel) miscPanel.removeAttribute('hidden');
        setTimeout(function () {
          document.addEventListener('click', closeMiscPanelOnClickOutside);
        }, 0);
      }
      function hideMiscPanel() {
        if (miscPanel) miscPanel.setAttribute('hidden', '');
        document.removeEventListener('click', closeMiscPanelOnClickOutside);
        hideMapDrawer();
        hideBagDrawer();
        hideSaveDrawer();
      }
      var mapDrawer = document.getElementById('map-drawer');
      var mapDrawerContent = document.getElementById('map-drawer-content');
      var mapContentRenderToken = 0;
      /** 点击「可前往」后暂存的节点 id（未改 map.pos）；玩家真正移动后随 pos 变化清空 */
      var _mapUIPendingNodeId = null;
      var _mapUIPendingAnchorPos = null;
      var MAP_ICONS =
        typeof window !== 'undefined' && window.色色地牢_SVG && window.色色地牢_SVG.MAP_ICONS
          ? window.色色地牢_SVG.MAP_ICONS
          : {};
      var MAP_CONFIG =
        typeof window !== 'undefined' && window.色色地牢_SVG && window.色色地牢_SVG.MAP_CONFIG
          ? window.色色地牢_SVG.MAP_CONFIG
          : {};
      var MAP_ICONS_FALLBACK =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>';
      function getMapData() {
        var v = null;
        try {
          if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
        } catch (e) {}
        var map = v && v.map && typeof v.map === 'object' ? v.map : null;
        var nodesLenOk = map && Array.isArray(map.nodes) && map.nodes.length >= 40;
        if (nodesLenOk) {
          try {
            _lastKnownMap = JSON.parse(JSON.stringify(map));
          } catch (e2) {
            _lastKnownMap = {
              area: map.area,
              pos: map.pos,
              nodes: map.nodes.slice(),
              inv: Array.isArray(map.inv) ? map.inv.slice() : [],
              revealOrder: Array.isArray(map.revealOrder) ? map.revealOrder.slice() : undefined,
            };
          }
          var inv0 = Array.isArray(map.inv) ? map.inv : [];
          var ro0 = Array.isArray(map.revealOrder) ? map.revealOrder : null;
          return {
            area: map.area || '未知区域',
            pos: (map.pos || '0-0').toString(),
            nodes: map.nodes,
            inv: inv0,
            revealOrder: ro0,
          };
        }
        if (_lastKnownMap && Array.isArray(_lastKnownMap.nodes) && _lastKnownMap.nodes.length >= 40) {
          return {
            area: _lastKnownMap.area || '未知区域',
            pos: (_lastKnownMap.pos || '0-0').toString(),
            nodes: _lastKnownMap.nodes,
            inv: Array.isArray(_lastKnownMap.inv) ? _lastKnownMap.inv : [],
            revealOrder: Array.isArray(_lastKnownMap.revealOrder) ? _lastKnownMap.revealOrder : null,
          };
        }
        if (!map || !Array.isArray(map.nodes)) {
          return {
            area: '地牢',
            pos: '0-0',
            nodes: [
              { id: '0-0', type: '起点' },
              { id: '1-1', type: '普通战斗' },
              { id: '1-2', type: '随机事件' },
              { id: '1-3', type: '普通战斗' },
              { id: '2-1', type: '随机事件' },
              { id: '2-2', type: '普通战斗' },
              { id: '2-3', type: '普通战斗' },
              { id: '3-1', type: '普通战斗' },
              { id: '3-2', type: '宝箱' },
              { id: '3-3', type: '随机事件' },
              { id: '4-1', type: '随机事件' },
              { id: '4-2', type: '商店' },
              { id: '4-3', type: '普通战斗' },
              { id: '5-1', type: '普通战斗' },
              { id: '5-2', type: '随机事件' },
              { id: '5-3', type: '精英战斗' },
              { id: '6-1', type: '随机事件' },
              { id: '6-2', type: '普通战斗' },
              { id: '6-3', type: '休息点' },
              { id: '7-1', type: '普通战斗' },
              { id: '7-2', type: '商店' },
              { id: '7-3', type: '随机事件' },
              { id: '8-1', type: '休息点' },
              { id: '8-2', type: '普通战斗' },
              { id: '8-3', type: '随机事件' },
              { id: '9-1', type: '随机事件' },
              { id: '9-2', type: '精英战斗' },
              { id: '9-3', type: '普通战斗' },
              { id: '10-1', type: '商店' },
              { id: '10-2', type: '随机事件' },
              { id: '10-3', type: '普通战斗' },
              { id: '11-1', type: '精英战斗' },
              { id: '11-2', type: '普通战斗' },
              { id: '11-3', type: '随机事件' },
              { id: '12-1', type: '随机事件' },
              { id: '12-2', type: '休息点' },
              { id: '12-3', type: '普通战斗' },
              { id: '13-1', type: '宝箱' },
              { id: '13-2', type: '随机事件' },
              { id: '13-3', type: '精英战斗' },
              { id: '14-1', type: '休息点' },
              { id: '14-2', type: '随机事件' },
              { id: '14-3', type: '商店' },
              { id: '15-0', type: '首领战斗' },
            ],
            inv: [],
            revealOrder: null,
          };
        }
        var inv = Array.isArray(map.inv) ? map.inv : [];
        var revealOrder = Array.isArray(map.revealOrder) ? map.revealOrder : null;
        return {
          area: map.area || '未知区域',
          pos: (map.pos || '0-0').toString(),
          nodes: map.nodes,
          inv: inv,
          revealOrder: revealOrder,
        };
      }
      /** 与 getMapData 同源解析节点类型（供左侧 HUD）；勿直接用 getVariables().map.nodes，可能与地图实际数据不一致（如 nodes 为空数组） */
      function lookupMapNodeTypeById(nodeId) {
        if (!nodeId) return '';
        var m = getMapData();
        if (!m || !Array.isArray(m.nodes)) return '';
        var nid = String(nodeId);
        var found = m.nodes.find(function (x) {
          return x && String(x.id) === nid;
        });
        return found && found.type != null && String(found.type) !== '' ? String(found.type) : '';
      }
      /**
       * @param nodeStates 若由 renderMapContent 传入则只 getVariables 一次；省略时内部读取（供 commitPendingMapPosAfterBattle）
       */
      function getNodeStatus(nodeId, currentPos, nodeStates) {
        var ns = nodeStates;
        if (ns === undefined) {
          ns = null;
          try {
            if (typeof getVariables === 'function') {
              var v0 = getVariables({ type: 'chat' });
              ns = v0 && v0.nodeStates && typeof v0.nodeStates === 'object' ? v0.nodeStates : null;
            }
          } catch (e0) {}
        }
        function hasEnteredNode(id) {
          return !!(ns && ns[id]);
        }
        function classifyPastOrSibling() {
          return hasEnteredNode(nodeId) ? 'visited' : 'skipped';
        }
        var parts = currentPos.split('-').map(Number);
        var currCol = parts[0],
          currRow = parts[1];
        var nParts = nodeId.split('-').map(Number);
        var nodeCol = nParts[0],
          nodeRow = nParts[1];
        if (nodeId === currentPos) return 'current';
        if (nodeCol < currCol) return classifyPastOrSibling();
        /* 同列未站过的分支：灰（skipped）；真正站过的为 visited（黑） */
        if (nodeCol === currCol && nodeId !== currentPos) return classifyPastOrSibling();
        if (nodeCol === currCol + 1) {
          if (currentPos === '0-0') return 'reachable';
          if (nodeId === '15-0' && currCol === 14) return 'reachable';
          if (Math.abs(nodeRow - currRow) <= 1) return 'reachable';
          return 'future';
        }
        return 'future';
      }
      /**
       * 战斗胜利后点击「继续前进」时调用：把地图「当前位置」写入为此前在地图上选的待走格（_mapUIPendingNodeId），
       * 否则 map.pos 一直为 0-0，下一列节点会始终为 future、无法点击。
       */
      function commitPendingMapPosAfterBattle() {
        var pending = _mapUIPendingNodeId;
        if (!pending) return;
        var m = getMapData();
        var cur = (m.pos || '0-0').toString();
        var st = getNodeStatus(pending, cur);
        if (st !== 'reachable') return;
        var v = null;
        try {
          if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
        } catch (e) {}
        if (!v) v = {};
        var mapObj;
        if (v.map && typeof v.map === 'object' && Array.isArray(v.map.nodes) && v.map.nodes.length >= 40) {
          try {
            mapObj = JSON.parse(JSON.stringify(v.map));
          } catch (e2) {
            mapObj = null;
          }
        }
        if (!mapObj) {
          mapObj = {
            area: m.area,
            pos: pending,
            nodes: m.nodes,
            inv: Array.isArray(m.inv) ? m.inv.slice() : [],
            revealOrder: m.revealOrder && Array.isArray(m.revealOrder) ? m.revealOrder.slice() : undefined,
          };
        } else {
          mapObj.pos = pending;
          mapObj.area = mapObj.area || m.area;
          if (!Array.isArray(mapObj.nodes) || mapObj.nodes.length < 40) mapObj.nodes = m.nodes;
        }
        v.map = mapObj;
        mergePreserveChatGold(v);
        if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
        try {
          _lastKnownMap = JSON.parse(JSON.stringify(mapObj));
        } catch (e3) {}
        setTimeout(function () {
          renderMapContent({});
        }, 0);
      }
      function renderMapContent(opts) {
        opts = opts || {};
        var m = getMapData();
        if (_mapUIPendingAnchorPos != null && _mapUIPendingAnchorPos !== m.pos) _mapUIPendingNodeId = null;
        _mapUIPendingAnchorPos = m.pos;
        if (_lastMapPos !== m.pos && typeof recordNodeState === 'function') {
          recordNodeState(m.pos);
          _lastMapPos = m.pos;
        }
        updateDungeonFloorHUD();
        if (!mapDrawerContent) return;
        var myTok = ++mapContentRenderToken;
        var reduceMotion =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var doGenAnim = !!(opts.animateGen && !reduceMotion);
        var nodeStatesForMap = null;
        try {
          if (typeof getVariables === 'function') {
            var vMap = getVariables({ type: 'chat' });
            nodeStatesForMap =
              vMap && vMap.nodeStates && typeof vMap.nodeStates === 'object' ? vMap.nodeStates : null;
          }
        } catch (eNs) {}
        var nodesHtml = '';
        for (var col = 0; col <= 15; col++) {
          for (var row = 1; row <= 3; row++) {
            var id = col + '-' + row;
            var finalId = col === 0 || col === 15 ? col + '-0' : id;
            if ((col === 0 && row !== 2) || (col === 15 && row !== 2)) continue;
            var realNode = m.nodes.find(function (x) {
              return x.id === finalId;
            });
            if (!realNode) continue;
            var conf = MAP_CONFIG[realNode.type] || { color: '#333' };
            var iconSvg = MAP_ICONS[realNode.type] != null ? MAP_ICONS[realNode.type] : MAP_ICONS_FALLBACK;
            var nodeStatus = getNodeStatus(finalId, m.pos, nodeStatesForMap);
            var cls = nodeStatus;
            var extraUiCls = '';
            /* 待选下一格：选中格黑底；同列其余格（含因行差标为 future 的格）一律灰显，避免一列里黑/灰/彩色混用 */
            if (_mapUIPendingNodeId) {
              var pColPending = parseInt(_mapUIPendingNodeId.split('-')[0], 10);
              var fColPending = parseInt(finalId.split('-')[0], 10);
              if (finalId === _mapUIPendingNodeId) {
                if (nodeStatus === 'reachable') extraUiCls = ' map-node--selected';
              } else if (pColPending === fColPending) {
                extraUiCls = ' map-node--muted';
              }
            }
            cls += extraUiCls;
            var iconColor = conf.color;
            var borderColor = conf.color;
            if (nodeStatus === 'visited') {
              iconColor = '#fff';
              borderColor = '#1a150e';
            }
            if (nodeStatus === 'skipped') {
              iconColor = conf.color;
              borderColor = conf.color;
            }
            if (nodeStatus === 'current') {
              iconColor = '#fff';
              borderColor = '#1a150e';
            }
            if (nodeStatus === 'reachable' && extraUiCls.indexOf('map-node--selected') !== -1) {
              iconColor = '#fff';
              borderColor = '#1a150e';
            }
            if (extraUiCls.indexOf('map-node--muted') !== -1) {
              iconColor = '#888';
              borderColor = '#9e9e9e';
            }
            var clickHandler = '';
            if (nodeStatus === 'reachable') {
              clickHandler = ' onclick="window.fillPath && window.fillPath(\'' + finalId + '\')"';
            }
            var genPending = doGenAnim ? ' map-gen-pending' : '';
            nodesHtml +=
              '<div class="node-circle ' +
              cls +
              genPending +
              '" data-node-id="' +
              finalId +
              '" style="grid-column:' +
              (col + 1) +
              ';grid-row:' +
              (4 - row) +
              ';border-color:' +
              borderColor +
              ';color:' +
              iconColor +
              '"' +
              clickHandler +
              '><span class="node-circle-icon">' +
              iconSvg +
              '</span><div class="node-type-label">' +
              (realNode.type || '') +
              '</div></div>';
          }
        }
        var legendHtml = '';
        for (var k in MAP_CONFIG) {
          var legSvg = MAP_ICONS[k] != null ? MAP_ICONS[k] : MAP_ICONS_FALLBACK;
          legendHtml +=
            '<div class="legend-item"><span class="legend-icon" style="color:' +
            MAP_CONFIG[k].color +
            '">' +
            legSvg +
            '</span> ' +
            k +
            '</div>';
        }
        var nextAreaBtn = '';
        if (m.pos === '15-0') {
          nextAreaBtn =
            '<div style="display:flex;justify-content:center;padding:16px 0 8px"><button type="button" class="story-side-btn" onclick="window.goNextArea && window.goNextArea()" style="padding:12px 40px;font-size:1.1em">前往下一区域</button></div>';
        }
        var gridAnimClass = doGenAnim ? ' map-grid-16--anim' : '';
        mapDrawerContent.innerHTML =
          '<div class="map-wrapper"><div class="map-header">探索路线图：' +
          (m.area || '') +
          '</div><div class="map-grid-scroll"><div class="map-grid-inner"><div class="map-grid-16' +
          gridAnimClass +
          '">' +
          nodesHtml +
          '</div></div></div>' +
          nextAreaBtn +
          '<div class="map-legend">' +
          legendHtml +
          '<div class="legend-item" style="margin-left:16px;border-left:2px solid var(--gold-border);padding-left:12px"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#1a150e;box-shadow:0 0 6px var(--ap-glow);margin-right:4px"></span>当前</div><div class="legend-item"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:3px solid var(--ap-glow);margin-right:4px"></span>可前往</div><div class="legend-item"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#1a150e;margin-right:4px"></span>已走过</div><div class="legend-item"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:rgba(0,0,0,.12);filter:grayscale(.85);opacity:.5;margin-right:4px"></span>同层未走</div></div></div>';
        if (doGenAnim) {
          var gridEl = mapDrawerContent.querySelector('.map-grid-16');
          if (!gridEl) return;
          var cells = gridEl.querySelectorAll('.node-circle.map-gen-pending');
          var arr = Array.prototype.slice.call(cells);
          /* 生成动画：乱序依次亮起，不沿用 revealOrder（存档仍保留 revealOrder 供其它逻辑） */
          mapGenShuffle(arr, Math.random);
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              for (var i = 0; i < arr.length; i++) {
                (function (el, idx) {
                  var delay = idx * 14 + Math.floor(Math.random() * 36);
                  setTimeout(function () {
                    if (myTok !== mapContentRenderToken) return;
                    el.classList.add('map-gen-revealed');
                  }, delay);
                })(arr[i], i);
              }
            });
          });
        }
      }
      /**
       * 点击可前往格：标记为待选节点 → 重绘地图（同列待选样式）。普通战斗由 encounter 经 generate 发送提示词（内含「前往节点 id」），不写输入框。
       * 真正移动位置需由 AI/楼层外逻辑改 chat 变量 map.pos 后再 refreshMap。
       * 重绘必须推迟到 setTimeout(0)：若在 click 同步里 replace innerHTML，节点会从 DOM 移除，冒泡到 document 时 e.target 已不在 #map-drawer 内，会误触 closeMiscPanelOnClickOutside 关掉地图。
       */
      function fillPath(id) {
        _mapUIPendingNodeId = id;
        setTimeout(function () {
          renderMapContent({});
          var m = getMapData();
          var realNode = m.nodes.find(function (x) {
            return x.id === id;
          });
          if (typeof window.色色地牢_onMapNodeIntent === 'function') {
            try {
              window.色色地牢_onMapNodeIntent({
                nodeId: id,
                area: m.area,
                mapPos: m.pos,
                nodeType: realNode && realNode.type,
                node: realNode,
              });
            } catch (e) {
              console.warn('[色色地牢] 色色地牢_onMapNodeIntent', e);
            }
          }
          if (
            realNode &&
            (realNode.type === '普通战斗' || realNode.type === '精英战斗' || realNode.type === '首领战斗')
          ) {
            window._色色地牢_lastBattleIntent = {
              area: m.area,
              nodeId: id,
              nodeType: realNode.type,
            };
          }
          if (realNode && (realNode.type === '普通战斗' || realNode.type === '精英战斗')) {
            if (typeof window.色色地牢_requestNormalBattleAiPrompt === 'function')
              window.色色地牢_requestNormalBattleAiPrompt(m.area, id, realNode.type);
          }
        }, 0);
      }
      function goNextArea() {
        var area =
          typeof window.parent !== 'undefined' && window.parent.document
            ? window.parent.document.querySelector('#send_textarea')
            : null;
        if (area) {
          area.value = '前往下一区域';
          area.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      if (typeof window !== 'undefined') {
        window.fillPath = fillPath;
        window.goNextArea = goNextArea;
        window.色色地牢_getMapPendingNodeId = function () {
          return _mapUIPendingNodeId;
        };
        window.色色地牢_clearMapNodeSelection = function () {
          _mapUIPendingNodeId = null;
          setTimeout(function () {
            renderMapContent({});
          }, 0);
        };
        window.色色地牢_commitPendingMapPosAfterBattle = commitPendingMapPosAfterBattle;
        window.色色地牢_lookupMapNodeType = lookupMapNodeTypeById;
      }
      function showMapDrawer(opts) {
        if (mapDrawer) mapDrawer.classList.add('open');
        renderMapContent(opts);
      }
      if (typeof window !== 'undefined') {
        window.色色地牢_showMapDrawer = showMapDrawer;
        window.色色地牢_refreshMap = renderMapContent;
        window.色色地牢_updateFloorHUD = updateDungeonFloorHUD;
        window.色色地牢_updateGoldHUD = updateSidebarGoldHUD;
        window.色色地牢_onBattleVictoryUi = onBattleVictoryGold;
      }
      function hideMapDrawer() {
        if (mapDrawer) mapDrawer.classList.remove('open');
        $('.misc-sub-btn[data-misc="map"]').removeClass('active');
      }
      var saveDrawer = document.getElementById('save-drawer');
      function hideSaveDrawer() {
        if (saveDrawer) saveDrawer.classList.remove('open');
        $('.misc-sub-btn[data-misc="save"]').removeClass('active');
      }
      function syncSaveDrawerCardLayout() {
        var box = document.getElementById('save-drawer-content');
        if (!box) return;
        var list = box.querySelector('.save-slot-list');
        if (!list) return;
        // 规则：若容器宽度二等分后仍能容纳卡片内容，则用两列；否则单列占满。
        // 经验下限：actions(min 220) + partyGrid(max 420) + gap/head 约 24 ≈ 664
        var minHalf = 664;
        var w = box.clientWidth || 0;
        if (w > 0 && w / 2 >= minHalf) list.classList.add('two-col');
        else list.classList.remove('two-col');
      }
      if (typeof window !== 'undefined' && !window.__色色地牢_saveDrawerResizeHooked) {
        window.__色色地牢_saveDrawerResizeHooked = true;
        window.addEventListener('resize', function () {
          var drawer = document.getElementById('save-drawer');
          if (drawer && drawer.classList.contains('open')) syncSaveDrawerCardLayout();
        });
      }
      function renderSaveContent() {
        var box = document.getElementById('save-drawer-content');
        if (!box) return;
        var api = typeof window !== 'undefined' ? window.色色地牢_save : null;
        if (!api || typeof api.getSaveSlots !== 'function') {
          box.innerHTML =
            '<h3 class="save-drawer-title">存档</h3><div style="opacity:.85">当前环境未提供存档模块（backend/save.js）。</div>';
          return;
        }
        var slots = api.getSaveSlots();
        var last = typeof api.getLastSlotIndex === 'function' ? api.getLastSlotIndex() : 0;
        var curMap = typeof getMapData === 'function' ? getMapData() : null;
        var curArea = curMap && curMap.area ? String(curMap.area) : '地牢';
        var newSaveIndex = slots && slots.length ? (slots[0].index | 0) : 0;
        var autoWrap = typeof api.readAutoSnapshotWrap === 'function' ? api.readAutoSnapshotWrap() : null;
        var autoTime =
          autoWrap && autoWrap.savedAt
            ? String(autoWrap.savedAt).replace('T', ' ').replace(/\.\d{3}Z?$/, '').replace('Z', '')
            : '尚无自动快照';
        var autoPos = autoWrap && autoWrap.mapPos ? String(autoWrap.mapPos) : '—';
        var autoArea =
          autoWrap && autoWrap.areaName
            ? String(autoWrap.areaName)
            : autoWrap && autoWrap.payload && autoWrap.payload.map && autoWrap.payload.map.area
              ? String(autoWrap.payload.map.area)
              : '';
        var autoDisabled = !autoWrap || !autoWrap.payload;
        var autoPartyHtml = '';
        if (!autoDisabled && autoWrap && autoWrap.payload && Array.isArray(autoWrap.payload.party)) {
          try {
            var psAuto = autoWrap.payload.party
              .map(function (ch) {
                if (!ch) return null;
                return {
                  name: ch.name || '',
                  level: ch.level != null ? ch.level : 1,
                  avatar: ch.avatar || '',
                };
              })
              .filter(Boolean)
              .slice(0, 4);
            autoPartyHtml =
              '<div class="save-party-grid" aria-label="队伍成员">' +
              psAuto
                .map(function (u) {
                  var nm = u && u.name ? String(u.name) : '';
                  var lv = u && u.level != null ? parseInt(u.level, 10) || 1 : 1;
                  var av = u && u.avatar ? String(u.avatar) : '';
                  var bg = '';
                  if (av) {
                    bg = "background-image:url('" + encodeURI(av).replace(/'/g, '%27') + "')";
                  }
                  return (
                    '<div class="save-party-unit">' +
                    '<div class="save-party-avatar" style="' +
                    bg +
                    '">' +
                    '<div class="save-party-lv">Lv' +
                    lv +
                    '</div>' +
                    '</div>' +
                    '<div class="save-party-name">' +
                    nm.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
                    '</div>' +
                    '</div>'
                  );
                })
                .join('') +
              '</div>';
          } catch (eAutoPs) {
            autoPartyHtml = '';
          }
        }
        var autoCard =
          '<div class="save-slot-card snapshot-auto-slot" data-snapshot-auto="1">' +
          '<div class="save-slot-head">' +
          '<div class="save-slot-main">' +
          '<div class="save-map-name">' +
          escapeHtml(autoArea || curArea || '地牢') +
          '</div>' +
          '<div class="save-map-sub"></div>' +
          '</div>' +
          '<div class="save-slot-right">' +
          '<div class="save-slot-meta">' +
          escapeHtml(autoTime) +
          '</div>' +
          '</div>' +
          '</div>' +
          '<div class="save-slot-foot">' +
          '<div class="save-slot-actions">' +
          '<button type="button" class="save-slot-btn primary" data-act="load-autosnapshot"' +
          (autoDisabled ? ' disabled' : '') +
          '>读取自动快照</button>' +
          '</div>' +
          autoPartyHtml +
          '</div></div>';
        var timelineRows = '';
        for (var tj = snapshotTimeline.length - 1; tj >= 0; tj--) {
          var te = snapshotTimeline[tj];
          if (!te) continue;
          var tTime = te.capturedAt
            ? String(te.capturedAt).replace('T', ' ').replace(/\.\d{3}Z?$/, '').replace('Z', '')
            : '';
          var tPos = te.mapPos ? String(te.mapPos) : '—';
          timelineRows +=
            '<div class="snapshot-timeline-row" data-timeline-index="' +
            tj +
            '">' +
            '<div class="snapshot-timeline-meta">' +
            escapeHtml(tTime) +
            ' · 格 <b>' +
            escapeHtml(tPos) +
            '</b> · ' +
            escapeHtml(te.areaName || '') +
            '</div>' +
            '<button type="button" class="save-slot-btn" data-act="load-timeline">读取</button>' +
            '</div>';
        }
        var timelineBlock =
          snapshotTimeline.length > 0
            ? '<div class="snapshot-timeline-block">' +
              '<div class="snapshot-timeline-title">本局快照时间线（内存，新档重置）</div>' +
              timelineRows +
              '</div>'
            : '';
        box.innerHTML =
          '<h3 class="save-drawer-title">' +
          '<span class="save-drawer-title-left">' +
          '<span>存档</span>' +
          '<button type="button" class="save-slot-btn primary" data-act="save-new" data-new-index="' +
          newSaveIndex +
          '">保存为新存档</button>' +
          '</span>' +
          '<span class="save-drawer-title-right"></span>' +
          '</h3>' +
          autoCard +
          timelineBlock +
          '<div class="save-slot-list">' +
          slots
            .filter(function (s) {
              return !!(s && s.hasData);
            })
            .map(function (s) {
              var idx = s.index | 0;
              var isLast = idx === (last | 0);
              var area = s.areaName ? String(s.areaName) : curArea;
              var ps = Array.isArray(s.partySummary) ? s.partySummary : [];
              var timeText = s.savedAt ? String(s.savedAt).replace('T', ' ').replace('Z', '') : '';
              var metaText = timeText || '';
              var partyHtml = '';
              partyHtml =
                '<div class="save-party-grid" aria-label="队伍成员">' +
                ps
                  .map(function (u) {
                    var nm = u && u.name ? String(u.name) : '';
                    var lv = u && u.level != null ? parseInt(u.level, 10) || 1 : 1;
                    var av = u && u.avatar ? String(u.avatar) : '';
                    var bg = '';
                    if (av) {
                      // 兼容 http(s)/data/blob 等；用 encodeURI 避免引号/空格破坏 style
                      bg = "background-image:url('" + encodeURI(av).replace(/'/g, '%27') + "')";
                    }
                    return (
                      '<div class="save-party-unit">' +
                      '<div class="save-party-avatar" style="' +
                      bg +
                      '">' +
                      '<div class="save-party-lv">Lv' +
                      lv +
                      '</div>' +
                      '</div>' +
                      '<div class="save-party-name">' +
                      nm.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
                      '</div>' +
                      '</div>'
                    );
                  })
                  .join('') +
                '</div>';
              var leftHeadHtml =
                '<div class="save-slot-main">' +
                '<div class="save-map-name">' +
                (area || '地牢').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
                '</div>' +
                '<div class="save-map-sub"></div>' +
                '</div>';
              return (
                '<div class="save-slot-card' +
                (isLast ? ' is-last-save' : '') +
                '" data-save-slot="' +
                idx +
                '">' +
                '<div class="save-slot-head">' +
                leftHeadHtml +
                '<div class="save-slot-right">' +
                '<div class="save-slot-meta">' +
                metaText.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="save-slot-foot">' +
                '<div class="save-slot-actions">' +
                '<button type="button" class="save-slot-btn primary" data-act="save">' +
                '覆盖保存' +
                '</button>' +
                '<button type="button" class="save-slot-btn" data-act="load">读取</button>' +
                '<button type="button" class="save-slot-btn danger" data-act="clear">删除</button>' +
                '</div>' +
                partyHtml +
                '</div>' +
                '</div>'
              );
            })
            .join('') +
          '</div>';
        requestAnimationFrame(syncSaveDrawerCardLayout);
      }
      function showSaveDrawer() {
        hideMapDrawer();
        hideBagDrawer();
        renderSaveContent();
        if (saveDrawer) saveDrawer.classList.add('open');
      }
      var bagDrawer = document.getElementById('bag-drawer');
      var bagDrawerContent = document.getElementById('bag-drawer-content');
      function renderBagContent() {
        if (!bagDrawerContent) return;
        var m = getMapData();
        var inv = m.inv || [];
        var invHtml = '';
        if (inv.length > 0 && inv[0]) {
          inv.forEach(function (item) {
            var itemName =
              (item && typeof item === 'string' ? item.split('（')[0] : item && item.name ? item.name : '') || '';
            var itemEffect =
              item && typeof item === 'string' && item.match(/（(.*?)）/)
                ? item.match(/（(.*?)）/)[1]
                : item && item.effect
                  ? item.effect
                  : '';
            var itemType =
              item && typeof item === 'string' && item.match(/\[(.*?)\]/)
                ? item.match(/\[(.*?)\]/)[1]
                : item && item.type
                  ? item.type
                  : '物品';
            invHtml +=
              '<div class="bag-row"><div><b>' +
              (itemName || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
              '</b>— ' +
              (itemEffect || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
              '</div><span class="bag-row-type">' +
              (itemType || '物品').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
              '</span></div>';
          });
        } else {
          invHtml = '<div style="color:#888;text-align:center;padding:50px;">背包空空如也</div>';
        }
        var bagIcon =
          typeof window !== 'undefined' && window.色色地牢_SVG && window.色色地牢_SVG.BAG_SVG
            ? window.色色地牢_SVG.BAG_SVG
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
        bagDrawerContent.innerHTML =
          '<div class="bag-wrapper"><div class="bag-header"><span class="bag-header-icon">' +
          bagIcon +
          '</span> 旅行行囊</div><div class="bag-list">' +
          invHtml +
          '</div></div>';
        updateSidebarGoldHUD();
      }
      function showBagDrawer() {
        if (bagDrawer) bagDrawer.classList.add('open');
        renderBagContent();
      }
      function hideBagDrawer() {
        if (bagDrawer) bagDrawer.classList.remove('open');
        $('.misc-sub-btn[data-misc="bag"]').removeClass('active');
      }
      var openDetailAvatar = 0;
      function hideCharacterDetail(deselectCharacterTab) {
        openDetailAvatar = 0;
        var drawer = document.getElementById('character-detail-drawer');
        var backdrop = document.getElementById('character-detail-backdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('visible');
        if (deselectCharacterTab) {
          $('.sidebar-btn[data-tab="character"]').removeClass('active');
          hideCharacterPanel();
        }
      }
      function getSlotData(avatarIndex) {
        var slot = document.querySelector('.slot[data-slot="ally-' + avatarIndex + '"]');
        if (!slot) return null;
        var portrait = slot.querySelector('.slot-char-portrait img');
        var nameEl = slot.querySelector('.slot-char-name');
        var levelEl = slot.querySelector('.slot-char-level');
        var hpBar = slot.querySelector('.slot-char-hp .slot-char-bar-text');
        var expBar = slot.querySelector('.slot-char-exp .slot-char-bar-text');
        var apValEl = slot.querySelector('.slot-char-ap .slot-char-ap-value');
        var apEl = apValEl || slot.querySelector('.slot-char-ap .slot-char-ap-text');
        var name = nameEl ? nameEl.textContent.trim() : '角色' + avatarIndex;
        var level = levelEl ? levelEl.textContent.trim() : 'Lv1';
        var hpText = hpBar ? hpBar.textContent.trim() : '0/100';
        var expText = expBar ? expBar.textContent.trim() : '0/100';
        var apText = apEl ? apEl.textContent.trim() : '0';
        var src = portrait && portrait.src ? portrait.src : '';
        var hpParts = hpText.split('/');
        var expParts = expText.split('/');
        var hp = parseInt(hpParts[0], 10) || 0;
        var maxHp = parseInt(hpParts[1], 10) || 100;
        var exp = parseInt(expParts[0], 10) || 0;
        var maxExp = parseInt(expParts[1], 10) || 100;
        var ap = parseInt(apText, 10) || 0;
        return { name: name, level: level, hp: hp, maxHp: maxHp, exp: exp, maxExp: maxExp, ap: ap, src: src };
      }
      var ATTR_KEYS = [
        { key: 'str', label: '力量', icon: 'dumbbell', color: '#d32f2f' },
        { key: 'agi', label: '敏捷', icon: 'zap', color: '#2e7d32' },
        { key: 'int', label: '智力', icon: 'brain', color: '#1976d2' },
        { key: 'sta', label: '耐力', icon: 'activity', color: '#f57c00' },
        { key: 'def', label: '防御', icon: 'shield', color: '#455a64' },
        { key: 'luk', label: '幸运', icon: 'clover', color: '#9c27b0' },
        { key: 'cha', label: '魅力', icon: 'heart', color: '#c2185b' },
        { key: 'ap', label: '行动', icon: 'flame', color: '#e65100' },
      ];
      var ATTR_ICONS = {
        dumbbell:
          '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/></svg>',
        zap: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        brain:
          '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
        activity:
          '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
        shield:
          '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        clover:
          '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.17 7.83 2 22"/><path d="M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A1 1 0 1 1 4 12"/><path d="m7.83 7.83 8.34 8.34"/></svg>',
        heart:
          '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        flame:
          '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
      };
      function renderStarRating(level) {
        var lv = parseInt(String(level).replace(/\D/g, ''), 10) || 1;
        var stars = [
          { s: 'small', f: false },
          { s: 'small', f: false },
          { s: 'large', f: false },
          { s: 'small', f: false },
          { s: 'small', f: false },
        ];
        if (lv >= 1) stars[0].f = true;
        if (lv >= 2) stars[1].f = true;
        if (lv >= 3) stars[2].f = true;
        if (lv >= 4) stars[3].f = true;
        if (lv >= 5) stars[4].f = true;
        return (
          '<div class="star-rating">' +
          stars
            .map(function (x) {
              return '<span class="star ' + x.s + ' ' + (x.f ? 'filled' : '') + '" aria-hidden="true">★</span>';
            })
            .join('') +
          '</div>'
        );
      }
      function buildDetailHtml(data, stats, ch, avatarIndex) {
        var hpPct = data.maxHp ? Math.min(100, (data.hp / data.maxHp) * 100) : 0;
        var expPct = data.maxExp ? Math.min(100, (data.exp / data.maxExp) * 100) : 0;
        var unspentPoints = ch ? getUnspentPoints(ch) : 0;
        var attrHtml = ATTR_KEYS.map(function (a) {
          var isFive = FIVE_DIM_KEYS.indexOf(a.key) !== -1;
          var delta = isFive ? detailEditState.deltas[a.key] || 0 : 0;
          var val =
            a.key === 'ap'
              ? data.ap
              : stats && stats[a.key] != null
                ? isFive
                  ? Number(stats[a.key]) + delta
                  : stats[a.key]
                : '—';
          var color = a.color || '#4a3c1a';
          var iconSvg = ATTR_ICONS[a.icon] || '';
          var rowContent =
            '<div class="attr-label" style="color:' +
            color +
            '">' +
            a.label +
            '<span class="attr-icon" style="color:' +
            color +
            '">' +
            iconSvg +
            '</span></div><div class="attr-value-wrap">';
          if (isFive && unspentPoints > 0) {
            var minusDisabled = delta <= 0 ? ' disabled' : '';
            var plusDisabled =
              getUnspentPoints(ch) -
                (detailEditState.deltas.str +
                  detailEditState.deltas.agi +
                  detailEditState.deltas.int +
                  detailEditState.deltas.sta +
                  detailEditState.deltas.def) <=
              0
                ? ' disabled'
                : '';
            rowContent +=
              '<span class="attr-row-actions"><button type="button" class="attr-btn-minus" data-attr="' +
              a.key +
              '" title="减少（Shift：清空该属性，Ctrl：-10）"' +
              minusDisabled +
              '>' +
              MINUS_SVG +
              '</button><button type="button" class="attr-btn-plus" data-attr="' +
              a.key +
              '" title="增加（Shift：加满，Ctrl：+10）"' +
              plusDisabled +
              '>' +
              PLUS_SVG +
              '</button></span>';
          }
          if (ch) {
            var bd = getDisplayStatBreakdown(ch, a.key);
            if (bd.passive) {
              var dataSource = bd.sourceText != null ? ' data-source="' + escapeHtml(bd.sourceText) + '"' : '';
              rowContent +=
                '<span class="attr-val attr-val-breakdown" data-base="' +
                bd.base +
                '" data-bonus="' +
                bd.passive.value +
                '" data-bonus-name="' +
                escapeHtml(bd.passive.name) +
                '"' +
                dataSource +
                '><span class="attr-val-number">' +
                (bd.total + delta) +
                '</span></span></div>';
            } else {
              rowContent += '<span class="attr-val">' + val + '</span></div>';
            }
          } else {
            rowContent += '<span class="attr-val">' + val + '</span></div>';
          }
          return '<div class="attr-row" data-attr-key="' + (isFive ? a.key : '') + '">' + rowContent + '</div>';
        }).join('');
        var headerRight =
          unspentPoints > 0
            ? '<div class="attr-panel-header-right"><span class="attr-badge-dot show" title="未分配点数"></span><span class="attr-unspent-text">未分配：<span class="attr-unspent-num">' +
              unspentPoints +
              '</span></span></div>'
            : '';
        var attrBlockTitle = '<div class="block-title attr-panel-title"><span>属性面板</span>' + headerRight + '</div>';
        var pendingSpecial =
          avatarIndex != null &&
          detailEditState.avatarIndex === avatarIndex &&
          detailEditState.pendingSpecialUnlocks &&
          Array.isArray(detailEditState.pendingSpecialUnlocks)
            ? detailEditState.pendingSpecialUnlocks
            : [];
        var unlockedSpecial =
          ch && ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked)
            ? ch.specialSkillsUnlocked.slice()
            : [];
        unlockedSpecial = unlockedSpecial.concat(pendingSpecial);
        var specialList = ch ? getSpecialSkillsForChar(ch) : [];
        var specialPassive = [];
        var specialActive = [];
        if (unlockedSpecial.length > 0 && specialList.length > 0) {
          specialList.forEach(function (sk) {
            if (unlockedSpecial.indexOf(sk.id) === -1) return;
            var isPassive = getSkillTagsString(sk).indexOf('被动') !== -1 || sk.ap === 0;
            if (isPassive) specialPassive.push(sk);
            else specialActive.push(sk);
          });
        }
        var deltasForSpecial =
          detailEditState &&
          avatarIndex != null &&
          detailEditState.avatarIndex === avatarIndex &&
          detailEditState.deltas
            ? detailEditState.deltas
            : { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
        var displayStatsForSpecial = ch ? getDisplayStatsForSkill(ch, deltasForSpecial) : null;
        var passiveHtml = '';
        var unspentSkillPoints = ch ? getUnspentSkillPoints(ch) : 0;
        if (ch && ch.passiveSkills && ch.passiveSkills.length) {
          passiveHtml =
            '<div class="passive-skills-section">' +
            ch.passiveSkills
              .map(function (p, idx) {
                var name = (p.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                var rawEffect = p.effect || '';
                var effect = resolveSkillEffect(rawEffect, ch);
                var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                var rightPart = '<span class="skill-name-right"><span class="skill-passive-tag">被动</span></span>';
                return (
                  '<div class="skill-card skill-card-passive" data-skill-type="passive" data-skill-index="' +
                  idx +
                  '" data-effect="' +
                  dataEffect +
                  '"><div class="skill-name"><span>' +
                  name +
                  '</span>' +
                  rightPart +
                  '</div><div class="skill-desc">' +
                  wrapBuffRefs(effect) +
                  '</div></div>'
                );
              })
              .join('');
          specialPassive.forEach(function (sk) {
            var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var rawEffect = sk.effect || '';
            var effect = displayStatsForSpecial
              ? wrapBuffRefs(resolveSkillEffectWithStats(rawEffect, displayStatsForSpecial))
              : wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
            var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            var rightPart = '<span class="skill-name-right"><span class="skill-passive-tag">被动</span></span>';
            passiveHtml +=
              '<div class="skill-card skill-card-passive skill-card-special" data-skill-type="passive" data-special-id="' +
              String(sk.id || '').replace(/"/g, '&quot;') +
              '" data-effect="' +
              dataEffect +
              '"><div class="skill-name"><span>' +
              name +
              '</span>' +
              rightPart +
              '</div><div class="skill-desc">' +
              effect +
              '</div></div>';
          });
          passiveHtml += '</div>';
        } else if (specialPassive.length > 0) {
          passiveHtml = '<div class="passive-skills-section">';
          specialPassive.forEach(function (sk) {
            var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var rawEffect = sk.effect || '';
            var effect = displayStatsForSpecial
              ? wrapBuffRefs(resolveSkillEffectWithStats(rawEffect, displayStatsForSpecial))
              : wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
            var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            var rightPart = '<span class="skill-name-right"><span class="skill-passive-tag">被动</span></span>';
            passiveHtml +=
              '<div class="skill-card skill-card-passive skill-card-special" data-skill-type="passive" data-special-id="' +
              String(sk.id || '').replace(/"/g, '&quot;') +
              '" data-effect="' +
              dataEffect +
              '"><div class="skill-name"><span>' +
              name +
              '</span>' +
              rightPart +
              '</div><div class="skill-desc">' +
              effect +
              '</div></div>';
          });
          passiveHtml += '</div>';
        }
        var basicSkillsHtml = '';
        var levelableSkillsHtml = '';
        var skillDeltas = detailEditState.skillLevelDeltas || {};
        var pendingSkillSpent = 0;
        if (ch && ch.skills)
          ch.skills.forEach(function (s, i) {
            if (!s.basic) pendingSkillSpent += Math.max(0, skillDeltas[i] || 0);
          });
        var effectiveUnspentSkillPoints = Math.max(0, unspentSkillPoints - pendingSkillSpent);
        if (ch && ch.skills && ch.skills.length) {
          var basicSkills = ch.skills.filter(function (s) {
            return s.basic;
          });
          var levelableSkills = ch.skills.filter(function (s) {
            return !s.basic;
          });
          basicSkillsHtml = ''; /* 角色细则界面不显示攻击、防御等基础技能 */
          levelableSkillsHtml =
            levelableSkills.length || specialActive.length
              ? '<div class="active-skills-section">' +
                (levelableSkills.length
                  ? ch.skills
                      .map(function (s, idx) {
                        if (s.basic) return '';
                        if (s.locked) {
                          var baseName = (s.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                          var tags = getSkillTagsString(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                          var ap = s.ap != null ? s.ap : '—';
                          var rightPart =
                            '<span class="skill-name-right"><span style="color:var(--ap-glow)">' +
                            ap +
                            ' AP</span></span>';
                          var cardInner =
                            '<div class="skill-name"><span class="skill-name-left"><span>' +
                            baseName +
                            '</span><span class="skill-lv">未解锁</span></span>' +
                            rightPart +
                            '</div>' +
                            (tags ? '<div class="skill-tags">' + tags + '</div>' : '') +
                            '<div class="skill-desc" style="color:#999">消耗1技能点解锁至Lv1</div>';
                          var canUnlock = effectiveUnspentSkillPoints >= 1;
                          var unlockBtn =
                            '<button type="button" class="skill-unlock-btn" data-skill-index="' +
                            idx +
                            '" ' +
                            (canUnlock ? '' : ' disabled') +
                            '>解锁</button>';
                          return (
                            '<div class="skill-card-locked-wrap"><div class="skill-card" data-skill-type="active" data-skill-index="' +
                            idx +
                            '" data-locked="1">' +
                            cardInner +
                            '</div><div class="skill-card-locked-overlay">' +
                            unlockBtn +
                            '</div></div>'
                          );
                        }
                        var baseName = s.name || '';
                        var advanceOpt =
                          s.advancement && s.advancementOptions
                            ? s.advancementOptions.filter(function (o) {
                                return o.id === s.advancement;
                              })[0]
                            : null;
                        var displayName = advanceOpt ? baseName + '-' + (advanceOpt.name || '') : baseName;
                        var name = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        var savedLv = Math.max(1, parseInt(s.level, 10) || 1);
                        var maxLv = s.effectByLevel && s.effectByLevel.length ? s.effectByLevel.length : 99;
                        var delta = skillDeltas[idx] || 0;
                        var displayLv = Math.max(1, Math.min(maxLv, savedLv + delta));
                        var lvText = advanceOpt ? 5 : displayLv;
                        var rawEffect = getSkillEffectForLevel(s, displayLv);
                        var effect = resolveSkillEffect(rawEffect, ch);
                        var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                        var advanceEffectRaw = advanceOpt && advanceOpt.effect ? advanceOpt.effect : '';
                        var advanceEffectResolved = advanceEffectRaw ? resolveSkillEffect(advanceEffectRaw, ch) : '';
                        var replacesBase = s.advancementReplacesEffect && advanceOpt;
                        var mainDesc = replacesBase ? advanceEffectResolved : effect;
                        var mainDataEffect = replacesBase ? advanceEffectRaw || rawEffect : rawEffect;
                        var mainDataEffectEscaped = mainDataEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                        var advanceEffectHtml = replacesBase
                          ? ''
                          : advanceEffectResolved
                            ? '<div class="skill-desc-advancement">' + wrapBuffRefs(advanceEffectResolved) + '</div>'
                            : '';
                        var tags = getSkillTagsString(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        var ap = s.ap != null ? s.ap : '—';
                        var minusDisabled = displayLv <= 1 ? ' disabled' : '';
                        var plusDisabled = displayLv >= maxLv || effectiveUnspentSkillPoints <= 0 ? ' disabled' : '';
                        var canAdvance =
                          savedLv === maxLv &&
                          effectiveUnspentSkillPoints > 0 &&
                          !s.advancement &&
                          s.advancementOptions &&
                          s.advancementOptions.length;
                        var showPlusMinus =
                          (effectiveUnspentSkillPoints > 0 || delta !== 0) && (savedLv < maxLv || delta > 0);
                        var actionsHtml = canAdvance
                          ? '<span class="skill-level-actions"><button type="button" class="skill-advance-btn" data-skill-type="active" data-skill-index="' +
                            idx +
                            '" title="分支进阶">' +
                            ADVANCE_UP_SVG +
                            '</button></span>'
                          : showPlusMinus
                            ? '<span class="skill-level-actions"><button type="button" class="skill-btn-minus" data-skill-type="active" data-skill-index="' +
                              idx +
                              '" title="降级"' +
                              minusDisabled +
                              '>' +
                              MINUS_SVG +
                              '</button><button type="button" class="skill-btn-plus" data-skill-type="active" data-skill-index="' +
                              idx +
                              '" title="升级"' +
                              plusDisabled +
                              '>' +
                              PLUS_SVG +
                              '</button></span>'
                            : '';
                        var rightPart =
                          '<span class="skill-name-right">' +
                          actionsHtml +
                          '<span style="color:var(--ap-glow)">' +
                          ap +
                          ' AP</span></span>';
                        return (
                          '<div class="skill-card" data-skill-type="active" data-skill-index="' +
                          idx +
                          '" data-effect="' +
                          mainDataEffectEscaped +
                          '"><div class="skill-name"><span class="skill-name-left"><span>' +
                          name +
                          '</span><span class="skill-lv">Lv' +
                          lvText +
                          '</span></span>' +
                          rightPart +
                          '</div>' +
                          (tags ? '<div class="skill-tags">' + tags + '</div>' : '') +
                          '<div class="skill-desc">' +
                          wrapBuffRefs(mainDesc) +
                          '</div>' +
                          advanceEffectHtml +
                          '</div>'
                        );
                      })
                      .filter(Boolean)
                      .join('')
                  : '') +
                specialActive
                  .map(function (sk) {
                    var sName = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    var sRawEffect = sk.effect || '';
                    var sEffect = displayStatsForSpecial
                      ? wrapBuffRefs(resolveSkillEffectWithStats(sRawEffect, displayStatsForSpecial))
                      : wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
                    var sDataEffect = sRawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
                    var sTags = getSkillTagsString(sk).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    var sAp = sk.ap != null ? sk.ap : '—';
                    var sRight =
                      '<span class="skill-name-right"><span style="color:var(--ap-glow)">' + sAp + ' AP</span></span>';
                    return (
                      '<div class="skill-card skill-card-special" data-skill-type="active" data-special-id="' +
                      String(sk.id || '').replace(/"/g, '&quot;') +
                      '" data-effect="' +
                      sDataEffect +
                      '"><div class="skill-name"><span>' +
                      sName +
                      '</span>' +
                      sRight +
                      '</div>' +
                      (sTags ? '<div class="skill-tags">' + sTags + '</div>' : '') +
                      '<div class="skill-desc">' +
                      sEffect +
                      '</div></div>'
                    );
                  })
                  .join('') +
                '</div>'
              : '';
        }
        var activeHtml = basicSkillsHtml + levelableSkillsHtml;
        if (!ch || !ch.skills || !ch.skills.length) {
          activeHtml =
            '<div class="skill-card"><div class="skill-name"><span>未习得</span><span style="color:var(--ap-glow)">— AP</span></div><div class="skill-desc">暂无技能数据</div></div>';
        }
        var specialSectionHtml = '';
        var skillsHtml = passiveHtml + activeHtml + specialSectionHtml;
        var hasSkillDeltas = Object.keys(skillDeltas).some(function (k) {
          return (skillDeltas[k] || 0) !== 0;
        });
        var unspentSpecial = ch ? Math.max(0, getUnspentSpecialSkillPoints(ch) - pendingSpecial.length) : 0;
        var specialBtnHtml =
          unspentSpecial > 0 && specialList.length > 0
            ? '<button type="button" class="special-skill-open-btn" title="使用特殊技能点解锁">特殊技能</button>'
            : '';
        var skillHeaderRight =
          specialBtnHtml +
          (effectiveUnspentSkillPoints > 0 || hasSkillDeltas
            ? '<div class="attr-panel-header-right"><span class="attr-badge-dot show" title="未分配技能点"></span><span class="attr-unspent-text">未分配：<span class="attr-unspent-num">' +
              effectiveUnspentSkillPoints +
              '</span></span></div>'
            : '');
        var skillBlockTitle =
          '<div class="block-title skill-panel-title"><span>战斗技能</span>' + skillHeaderRight + '</div>';
        var relicsHtml =
          '<div class="relic-card"><div class="relic-name">空</div><div class="relic-effect">暂无遗物</div></div><div class="relic-card"><div class="relic-name">空</div><div class="relic-effect">暂无遗物</div></div>';
        var renderBuffs =
          typeof window !== 'undefined' && window.BattleGrid && typeof window.BattleGrid.renderBuffsHtml === 'function'
            ? window.BattleGrid.renderBuffsHtml
            : function () {
                return '';
              };
        var buffList = ch && ch.buffs && Array.isArray(ch.buffs) ? ch.buffs : [];
        var buffsHtml = buffList.length
          ? '<div class="slot-char-buffs">' + renderBuffs(buffList) + '</div>'
          : '<div style="color:#888;font-size:12px;text-align:center;padding:15px">暂无状态效果</div>';
        var luk = stats && stats.luk != null ? Number(stats.luk) : ch ? getDisplayStat(ch, 'luk') || 0 : 0;
        // 数据报表在“属性分配预览”等场景会传入 stats，从而绕过 getDisplayStat 的被动加成；
        // 这里补上清漓·福泽对全体友方幸运 +3 的影响，确保命中/暴击等报表一致。
        if (ch && stats && stats.luk != null && typeof hasAliveQingliInParty === 'function' && hasAliveQingliInParty())
          luk += 3;
        var agi = stats && stats.agi != null ? Number(stats.agi) : ch ? getDisplayStat(ch, 'agi') || 0 : 0;
        var hitRate = ch ? Math.min(100, Math.max(0, 50 + luk * 5)) : 0;
        var dodgeRate = agi * 2;
        var baseCrit = 20 + agi * 1;
        var 攻势L = 0;
        if (ch && ch.buffs && ch.buffs.length) {
          ch.buffs.forEach(function (b) {
            if ((b.id || b.name) === '攻势') 攻势L = Math.max(0, parseInt(b.layers, 10) || 0);
          });
        }
        var has心眼 =
          ch && ch.name === '昼墨' && ch.specialSkillsUnlocked && ch.specialSkillsUnlocked.indexOf('心眼') !== -1;
        var qingliExtraCrit = ch && ch.name === '清漓' ? luk * 3 : 0;
        var critRate = ch
          ? Math.min(100, Math.max(0, baseCrit + (has心眼 ? 攻势L * 5 : 0) + qingliExtraCrit))
          : 0;
        function reportAttrHtml(attrKey) {
          if (attrKey === '攻势') {
            return '<span class="report-attr-name" style="color:#1a1a1a">攻势</span>';
          }
          var a = ATTR_KEYS.find(function (x) {
            return x.key === attrKey;
          });
          if (!a) return '';
          return (
            '<span class="report-attr-name" style="color:' +
            a.color +
            '">' +
            escapeHtml(a.label) +
            '</span><span class="report-attr-icon" style="color:' +
            a.color +
            '">' +
            (ATTR_ICONS[a.icon] || '') +
            '</span>'
          );
        }
        var sourceHit = ch
          ? '50 + ' +
            reportAttrHtml('luk') +
            '×5 = 50 + ' +
            luk +
            '×5 = ' +
            hitRate +
            '%。实际命中 = 此值 − 对方闪避率。'
          : null;
        var sourceDodge = ch
          ? reportAttrHtml('agi') + '×2 = ' + agi + '×2 = ' + dodgeRate + '%。对方命中率计算时会减去此值。'
          : null;
        var sourceCrit = ch
          ? (function () {
              var parts = [];
              parts.push('20 + ' + reportAttrHtml('agi') + '×1 = 20 + ' + agi + ' = ' + baseCrit + '%');
              if (has心眼 && 攻势L > 0)
                parts.push('+' + reportAttrHtml('攻势') + '×5 = +' + 攻势L + '×5 = +' + 攻势L * 5 + '%');
              if (ch && ch.name === '清漓')
                parts.push('+' + reportAttrHtml('luk') + '×3 = +' + luk + '×3 = +' + qingliExtraCrit + '%（福泽）');
              return parts.join(' ') + '，合计 ' + critRate + '%。' + (has心眼 ? '（心眼：攻势×5%）' : '');
            })()
          : null;
        var sourceCritDmg = ch ? '基础暴击伤害 200%（暴击时最终伤害为普通伤害的 200%）。' : null;
        var reportRows = [
          { label: '命中概率', value: (ch ? hitRate : '—') + (ch ? '%' : ''), source: sourceHit },
          { label: '闪避概率', value: (ch ? dodgeRate : '—') + (ch ? '%' : ''), source: sourceDodge },
          { label: '暴击概率', value: (ch ? critRate : '—') + (ch ? '%' : ''), source: sourceCrit },
          { label: '暴击伤害', value: ch ? '200%' : '—', source: sourceCritDmg },
        ];
        var dataReportHtml = reportRows
          .map(function (r) {
            var valueHtml = r.source
              ? '<span class="data-report-value-breakdown" data-source="' +
                escapeHtml(r.source) +
                '" title="悬停或点击查看数值来源">' +
                escapeHtml(String(r.value)) +
                '</span>'
              : '<span class="data-report-value">' + escapeHtml(String(r.value)) + '</span>';
            return (
              '<div class="data-report-row"><span class="data-report-label">' +
              escapeHtml(String(r.label)) +
              '</span>' +
              valueHtml +
              '</div>'
            );
          })
          .join('');
        var buffBlockTitle =
          '<div class="block-title detail-buff-panel-title"><span class="detail-buff-title-text">状态效果</span><button type="button" class="detail-buff-swap-btn" title="切换为数据报表" aria-label="切换为数据报表">' +
          SWAP_SVG +
          '</button></div>';
        return (
          '<div class="char-detail-grid">' +
          '<div class="col-base">' +
          (data.src
            ? '<img src="' + data.src + '" alt="" class="portrait-xl">'
            : '<div class="portrait-xl" style="background:#c4b8a8;display:flex;align-items:center;justify-content:center;color:#5c4a3a">无立绘</div>') +
          '<div class="char-name-box">' +
          (data.name || '角色') +
          '</div>' +
          renderStarRating(data.level) +
          '<div class="status-bars">' +
          '<div class="bar-row" id="detail-hp-bar"><span class="bar-label">HP</span><div class="bar-wrap"><div class="bar-text">' +
          data.hp +
          '/' +
          data.maxHp +
          '</div><div class="bar-fill" style="width:' +
          hpPct +
          '%;background:var(--hp-red)"></div></div></div>' +
          '<div class="bar-row"><span class="bar-label">EXP</span><div class="bar-wrap"><div class="bar-text">' +
          data.exp +
          '/' +
          data.maxExp +
          '</div><div class="bar-fill" style="width:' +
          expPct +
          '%;background:#2d8a4e"></div></div></div>' +
          '<div class="bar-row" title="战斗外仍保留，不因回合或战斗结束而清零"><span class="bar-label">精液</span><div class="bar-wrap" style="background:#3d2a24"><div class="bar-text">' +
          (ch && ch.semenVolumeMl != null ? Number(ch.semenVolumeMl) || 0 : 0) +
          ' ml</div></div></div>' +
          '</div>' +
          (unspentPoints > 0 || hasSkillDeltas || pendingSpecial.length > 0
            ? '<div class="attr-allocate-footer"><button type="button" class="attr-reset-btn">重置</button><button type="button" class="attr-confirm-btn">确定</button></div>'
            : '') +
          '</div>' +
          '<div class="detail-block detail-block-attr" id="detail-block-attr">' +
          attrBlockTitle +
          '<div class="attr-list">' +
          attrHtml +
          '</div></div>' +
          '<div class="detail-block detail-block-relic"><div class="block-title">装备遗物</div><div class="relic-slots">' +
          relicsHtml +
          '</div></div>' +
          '<div class="detail-block detail-block-skill">' +
          skillBlockTitle +
          '<div class="skill-slots">' +
          skillsHtml +
          '</div></div>' +
          '<div class="detail-block detail-block-buff" id="detail-block-buff">' +
          buffBlockTitle +
          '<div class="buff-panel-body"><div class="buff-container">' +
          buffsHtml +
          '</div><div class="data-report-container">' +
          dataReportHtml +
          '</div></div></div>' +
          '</div>'
        );
      }
      var detailEditState = {
        avatarIndex: 0,
        deltas: { str: 0, agi: 0, int: 0, sta: 0, def: 0 },
        skillLevelDeltas: {},
        pendingSpecialUnlocks: [],
      };
      function bindDetailActions(content, avatarIndex, ch, data) {
        if (!content || !ch) return;
        var blockBuff = content.querySelector('#detail-block-buff');
        var swapBtn = blockBuff && blockBuff.querySelector('.detail-buff-swap-btn');
        var titleText = blockBuff && blockBuff.querySelector('.detail-buff-title-text');
        if (swapBtn && blockBuff && titleText) {
          swapBtn.addEventListener('click', function () {
            blockBuff.classList.toggle('show-data-report');
            if (blockBuff.classList.contains('show-data-report')) {
              titleText.textContent = '数据报表';
              swapBtn.setAttribute('title', '切换为状态效果');
              swapBtn.setAttribute('aria-label', '切换为状态效果');
            } else {
              titleText.textContent = '状态效果';
              swapBtn.setAttribute('title', '切换为数据报表');
              swapBtn.setAttribute('aria-label', '切换为数据报表');
            }
          });
        }
        var blockAttr = content.querySelector('#detail-block-attr');
        var attrList = blockAttr && blockAttr.querySelector('.attr-list');
        function getUnspent() {
          return (
            getUnspentPoints(ch) -
            (detailEditState.deltas.str +
              detailEditState.deltas.agi +
              detailEditState.deltas.int +
              detailEditState.deltas.sta +
              detailEditState.deltas.def)
          );
        }
        function refreshDetailStatusBars() {
          var hpRow = content.querySelector('#detail-hp-bar');
          if (!hpRow) return;
          var baseSta = getDisplayStat(ch, 'sta');
          var deltaSta = detailEditState.deltas.sta || 0;
          var displaySta = baseSta + deltaSta;
          var displayMaxHp = getHpFromSta(displaySta);
          var displayHp = Math.min(data.hp, displayMaxHp);
          var hpPct = displayMaxHp ? Math.min(100, (displayHp / displayMaxHp) * 100) : 0;
          var textEl = hpRow.querySelector('.bar-text');
          var fillEl = hpRow.querySelector('.bar-fill');
          if (textEl) textEl.textContent = displayHp + '/' + displayMaxHp;
          if (fillEl) fillEl.style.width = hpPct + '%';
        }
        function refreshSkillDescriptions() {
          var displayStats = {
            str: getDisplayStat(ch, 'str') + (detailEditState.deltas.str || 0),
            agi: getDisplayStat(ch, 'agi') + (detailEditState.deltas.agi || 0),
            int: getDisplayStat(ch, 'int') + (detailEditState.deltas.int || 0),
            sta: getDisplayStat(ch, 'sta') + (detailEditState.deltas.sta || 0),
            def: getDisplayStat(ch, 'def') + (detailEditState.deltas.def || 0),
            level: ch.level != null ? ch.level : 1,
          };
          content.querySelectorAll('.skill-card[data-effect]').forEach(function (card) {
            var rawEffect = card.getAttribute('data-effect');
            if (rawEffect == null) return;
            var descEl = card.querySelector('.skill-desc');
            if (!descEl) return;
            var resolved = resolveSkillEffectWithStats(rawEffect, displayStats);
            descEl.innerHTML = wrapBuffRefs(resolved);
          });
          content.querySelectorAll('.skill-card[data-skill-type="active"]').forEach(function (card) {
            var idxAttr = card.getAttribute('data-skill-index');
            if (idxAttr == null) return;
            var skill = ch.skills && ch.skills[parseInt(idxAttr, 10)];
            if (!skill || !skill.advancement || !skill.advancementOptions) return;
            var opt = skill.advancementOptions.filter(function (o) {
              return o.id === skill.advancement;
            })[0];
            if (!opt || !opt.effect) return;
            var advanceEl = card.querySelector('.skill-desc-advancement');
            if (!advanceEl) return;
            var advanceResolved = resolveSkillEffectWithStats(opt.effect, displayStats);
            advanceEl.innerHTML = wrapBuffRefs(advanceResolved);
          });
          content.querySelectorAll('.skill-card-special[data-effect]').forEach(function (card) {
            var rawEffect = card.getAttribute('data-effect');
            if (rawEffect == null) return;
            var descEl = card.querySelector('.skill-desc');
            if (!descEl) return;
            var resolved = resolveSkillEffectWithStats(rawEffect, displayStats);
            descEl.innerHTML = wrapBuffRefs(resolved);
          });
        }
        function refreshAttrRows() {
          if (!attrList) return;
          var stats = {
            str: getDisplayStat(ch, 'str'),
            agi: getDisplayStat(ch, 'agi'),
            int: getDisplayStat(ch, 'int'),
            sta: getDisplayStat(ch, 'sta'),
            def: getDisplayStat(ch, 'def'),
          };
          var unspent = getUnspent();
          attrList.querySelectorAll('.attr-row[data-attr-key]').forEach(function (row) {
            var key = row.getAttribute('data-attr-key');
            if (!key) return;
            var valEl = row.querySelector('.attr-val');
            var minusBtn = row.querySelector('.attr-btn-minus');
            var plusBtn = row.querySelector('.attr-btn-plus');
            var delta = detailEditState.deltas[key] || 0;
            var displayVal = (Number(stats[key]) || 0) + delta;
            var numEl = valEl && valEl.querySelector('.attr-val-number');
            if (numEl) numEl.textContent = displayVal;
            else if (valEl) valEl.textContent = displayVal;
            if (minusBtn) minusBtn.disabled = delta <= 0;
            if (plusBtn) plusBtn.disabled = unspent <= 0;
          });
          var numEl = blockAttr && blockAttr.querySelector('.attr-unspent-num');
          if (numEl) numEl.textContent = unspent;
          refreshDetailStatusBars();
          refreshSkillDescriptions();
        }
        if (attrList) {
          attrList.querySelectorAll('.attr-btn-plus').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
              var key = btn.getAttribute('data-attr');
              if (!key || detailEditState.deltas[key] == null) return;
              var unspent = getUnspent();
              if (unspent <= 0) return;
              if (e.shiftKey) {
                detailEditState.deltas[key] += unspent;
              } else if (e.ctrlKey) {
                detailEditState.deltas[key] += Math.min(10, unspent);
              } else {
                detailEditState.deltas[key]++;
              }
              refreshAttrRows();
            });
          });
          attrList.querySelectorAll('.attr-btn-minus').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
              var key = btn.getAttribute('data-attr');
              if (!key) return;
              var cur = detailEditState.deltas[key] || 0;
              if (cur <= 0) return;
              if (e.shiftKey) {
                detailEditState.deltas[key] = 0;
              } else if (e.ctrlKey) {
                detailEditState.deltas[key] = Math.max(0, cur - 10);
              } else {
                detailEditState.deltas[key]--;
              }
              refreshAttrRows();
            });
          });
        }
        var resetBtn = content.querySelector('.attr-reset-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            detailEditState.deltas = { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
            detailEditState.skillLevelDeltas = {};
            detailEditState.pendingSpecialUnlocks = [];
            refreshAttrRows();
            showCharacterDetail(avatarIndex);
          });
        }
        var confirmBtn = content.querySelector('.attr-confirm-btn');
        if (confirmBtn) {
          confirmBtn.addEventListener('click', function () {
            var d = detailEditState.deltas;
            var attrTotal = d.str + d.agi + d.int + d.sta + d.def;
            var skillDeltas = detailEditState.skillLevelDeltas || {};
            var hasSkillDeltas = Object.keys(skillDeltas).some(function (k) {
              return (skillDeltas[k] || 0) !== 0;
            });
            var pendingSpecial = detailEditState.pendingSpecialUnlocks || [];
            if (attrTotal === 0 && !hasSkillDeltas && pendingSpecial.length === 0) return;
            try {
              var v = null;
              if (typeof getVariables === 'function')
                try {
                  v = getVariables({ type: 'chat' });
                } catch (e) {}
              var party = v && v.party && Array.isArray(v.party) ? v.party : defaultParty;
              var c = party[avatarIndex - 1];
              if (c) {
                if (attrTotal !== 0) {
                  c.bonusStr = (parseInt(c.bonusStr, 10) || 0) + d.str;
                  c.bonusAgi = (parseInt(c.bonusAgi, 10) || 0) + d.agi;
                  c.bonusInt = (parseInt(c.bonusInt, 10) || 0) + d.int;
                  c.bonusSta = (parseInt(c.bonusSta, 10) || 0) + d.sta;
                  c.bonusDef = (parseInt(c.bonusDef, 10) || 0) + d.def;
                }
                if (hasSkillDeltas && c.skills) {
                  var totalSpent = 0;
                  Object.keys(skillDeltas).forEach(function (k) {
                    var idx = parseInt(k, 10);
                    if (isNaN(idx) || !c.skills[idx] || c.skills[idx].basic) return;
                    var delta = skillDeltas[k] || 0;
                    if (delta === 0) return;
                    var skill = c.skills[idx];
                    var maxLv = skill.effectByLevel && skill.effectByLevel.length ? skill.effectByLevel.length : 99;
                    var cur = Math.max(1, parseInt(skill.level, 10) || 1);
                    skill.level = Math.max(1, Math.min(maxLv, cur + delta));
                    if (delta > 0) totalSpent += delta;
                  });
                  c.skillPointsSpent = (parseInt(c.skillPointsSpent, 10) || 0) + totalSpent;
                }
                if (pendingSpecial.length > 0) {
                  if (!c.specialSkillsUnlocked || !Array.isArray(c.specialSkillsUnlocked)) c.specialSkillsUnlocked = [];
                  pendingSpecial.forEach(function (id) {
                    if (c.specialSkillsUnlocked.indexOf(id) === -1) c.specialSkillsUnlocked.push(id);
                  });
                }
                if (v && typeof replaceVariables === 'function') {
                  v.party = party;
                  mergePreserveChatGold(v);
                  replaceVariables(v, { type: 'chat' });
                }
                _lastKnownParty = party;
              }
            } catch (e) {
              console.warn('[色色地牢] 保存分配失败', e);
            }
            detailEditState.deltas = { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
            detailEditState.skillLevelDeltas = {};
            detailEditState.pendingSpecialUnlocks = [];
            if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function')
              window.BattleGrid.refreshBattleView();
            showCharacterDetail(avatarIndex);
            if (typeof updateSidebarCharBadge === 'function') updateSidebarCharBadge();
          });
        }
        function applySkillLevelDelta(skillIndex, delta) {
          var s = ch.skills && ch.skills[skillIndex];
          if (!s || s.basic) return;
          var savedLv = Math.max(1, parseInt(s.level, 10) || 1);
          var maxLv = s.effectByLevel && s.effectByLevel.length ? s.effectByLevel.length : 99;
          var cur = detailEditState.skillLevelDeltas[skillIndex] || 0;
          var displayLv = savedLv + cur;
          if (delta > 0) {
            if (displayLv >= maxLv) return;
            var pendingSpent = 0;
            Object.keys(detailEditState.skillLevelDeltas).forEach(function (k) {
              pendingSpent += Math.max(0, detailEditState.skillLevelDeltas[k] || 0);
            });
            if (getUnspentSkillPoints(ch) - pendingSpent <= 0) return;
            detailEditState.skillLevelDeltas[skillIndex] = cur + 1;
          } else {
            if (displayLv <= 1) return;
            detailEditState.skillLevelDeltas[skillIndex] = cur - 1;
          }
          showCharacterDetail(avatarIndex);
        }
        content.querySelectorAll('.skill-btn-plus').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var index = parseInt(btn.getAttribute('data-skill-index'), 10);
            if (!isNaN(index)) applySkillLevelDelta(index, 1);
          });
        });
        content.querySelectorAll('.skill-btn-minus').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var index = parseInt(btn.getAttribute('data-skill-index'), 10);
            if (!isNaN(index)) applySkillLevelDelta(index, -1);
          });
        });
        content.querySelectorAll('.skill-advance-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var skillIndex = parseInt(btn.getAttribute('data-skill-index'), 10);
            if (isNaN(skillIndex)) return;
            var s = ch.skills && ch.skills[skillIndex];
            if (!s || !s.advancementOptions || !s.advancementOptions.length) return;
            openAdvancementPopup(avatarIndex, skillIndex, s.advancementOptions);
          });
        });
        content.querySelectorAll('.special-skill-open-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            openSpecialSkillPopup(avatarIndex);
          });
        });
        content.querySelectorAll('.skill-unlock-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (btn.disabled) return;
            var skillIndex = parseInt(btn.getAttribute('data-skill-index'), 10);
            if (isNaN(skillIndex)) return;
            var s = ch.skills && ch.skills[skillIndex];
            if (!s || !s.locked) return;
            if (getUnspentSkillPoints(ch) < 1) return;
            try {
              var v = null;
              if (typeof getVariables === 'function')
                try {
                  v = getVariables({ type: 'chat' });
                } catch (e) {}
              var party = v && v.party && Array.isArray(v.party) ? v.party : defaultParty;
              var c = party[avatarIndex - 1];
              if (c && c.skills && c.skills[skillIndex]) {
                c.skills[skillIndex].locked = false;
                c.skills[skillIndex].level = 1;
                c.skillPointsSpent = (parseInt(c.skillPointsSpent, 10) || 0) + 1;
                if (v && typeof replaceVariables === 'function') {
                  v.party = party;
                  mergePreserveChatGold(v);
                  replaceVariables(v, { type: 'chat' });
                }
              }
            } catch (e) {
              console.warn('[色色地牢] 解锁技能失败', e);
            }
            showCharacterDetail(avatarIndex);
            if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function')
              window.BattleGrid.refreshBattleView();
            if (typeof updateSidebarCharBadge === 'function') updateSidebarCharBadge();
          });
        });
      }
      function openAdvancementPopup(avatarIndex, skillIndex, options) {
        var popup = document.getElementById('advancement-popup');
        var panel = document.getElementById('advancement-popup-panel');
        if (!popup || !panel) return;
        panel.dataset.avatarIndex = String(avatarIndex);
        panel.dataset.skillIndex = String(skillIndex);
        var party = getParty();
        var ch = party && party[avatarIndex - 1];
        var optsHtml = options
          .map(function (opt) {
            var name = (opt.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var effectResolved = opt.effect && ch ? resolveSkillEffect(opt.effect, ch) : opt.effect || '';
            var effect = wrapBuffRefs(effectResolved);
            var nameAttr = (opt.name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            var effectAttr = (opt.effect || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            return (
              '<div class="advancement-opt" data-advance-id="' +
              (opt.id || '').replace(/"/g, '&quot;') +
              '" data-advance-name="' +
              nameAttr +
              '" data-advance-effect="' +
              effectAttr +
              '" role="button" tabindex="0"><div class="advancement-opt-name">[' +
              (opt.id || '') +
              '·' +
              name +
              ']</div><div class="advancement-opt-effect">' +
              effect +
              '</div></div>'
            );
          })
          .join('');
        panel.innerHTML =
          '<div class="advancement-popup-title">分支进阶<button type="button" class="advancement-popup-close" title="退出" aria-label="退出">' +
          CLOSE_X_SVG +
          '</button></div><div class="advancement-popup-body">' +
          optsHtml +
          '</div><div class="advancement-popup-footer"><button type="button" class="advancement-confirm-btn" disabled>确认</button></div>';
        panel.querySelectorAll('.advancement-opt').forEach(function (el) {
          el.addEventListener('click', function () {
            panel.querySelectorAll('.advancement-opt').forEach(function (o) {
              o.classList.remove('selected');
            });
            el.classList.add('selected');
            var btn = panel.querySelector('.advancement-confirm-btn');
            if (btn) btn.disabled = false;
          });
        });
        panel.querySelector('.advancement-popup-close').addEventListener('click', closeAdvancementPopup);
        panel.querySelector('.advancement-confirm-btn').addEventListener('click', function () {
          var selected = panel.querySelector('.advancement-opt.selected');
          if (!selected) return;
          var aid = selected.getAttribute('data-advance-id');
          var av = parseInt(panel.dataset.avatarIndex, 10);
          var sidx = parseInt(panel.dataset.skillIndex, 10);
          try {
            var v = null;
            if (typeof getVariables === 'function')
              try {
                v = getVariables({ type: 'chat' });
              } catch (e) {}
            var party = v && v.party && Array.isArray(v.party) ? v.party : defaultParty;
            var c = party[av - 1];
            if (c && c.skills && c.skills[sidx]) {
              c.skills[sidx].advancement = aid;
              c.skillPointsSpent = (parseInt(c.skillPointsSpent, 10) || 0) + 1;
              if (v && typeof replaceVariables === 'function') {
                v.party = party;
                mergePreserveChatGold(v);
                replaceVariables(v, { type: 'chat' });
              }
            }
          } catch (e) {
            console.warn('[色色地牢] 分支进阶保存失败', e);
          }
          closeAdvancementPopup();
          if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function')
            window.BattleGrid.refreshBattleView();
          showCharacterDetail(av);
          if (typeof updateSidebarCharBadge === 'function') updateSidebarCharBadge();
        });
        var back = document.querySelector('.advancement-popup-backdrop');
        if (back) back.addEventListener('click', closeAdvancementPopup, { once: true });
        popup.classList.add('show');
      }
      function closeAdvancementPopup() {
        var popup = document.getElementById('advancement-popup');
        if (popup) popup.classList.remove('show');
      }
      function openSpecialSkillPopup(avatarIndex) {
        var popup = document.getElementById('special-skill-popup');
        var panel = document.getElementById('special-skill-popup-panel');
        var body = document.getElementById('special-skill-popup-body');
        if (!popup || !panel || !body) return;
        var party = getParty();
        var ch = party && party[avatarIndex - 1];
        var list = ch ? getSpecialSkillsForChar(ch) : [];
        var pendingSpecial =
          detailEditState.avatarIndex === avatarIndex &&
          detailEditState.pendingSpecialUnlocks &&
          Array.isArray(detailEditState.pendingSpecialUnlocks)
            ? detailEditState.pendingSpecialUnlocks
            : [];
        var unlocked =
          ch && ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked)
            ? ch.specialSkillsUnlocked.concat(pendingSpecial)
            : pendingSpecial.slice();
        var unspent = ch ? Math.max(0, getUnspentSpecialSkillPoints(ch) - pendingSpecial.length) : 0;
        var locked = list.filter(function (s) {
          return unlocked.indexOf(s.id) === -1;
        });
        var closeBtn = panel.querySelector('.special-skill-popup-close');
        if (closeBtn) closeBtn.innerHTML = CLOSE_X_SVG;
        var popupDeltas =
          detailEditState && detailEditState.avatarIndex === avatarIndex && detailEditState.deltas
            ? detailEditState.deltas
            : { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
        var popupDisplayStats = ch ? getDisplayStatsForSkill(ch, popupDeltas) : null;
        body.innerHTML =
          locked.length === 0
            ? '<p style="color:#9a8b72;padding:12px">已全部解锁或暂无特殊技能</p>'
            : locked
                .map(function (sk) {
                  var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  var rawEffect = sk.effect || '';
                  var effect = wrapBuffRefs(
                    ch && rawEffect
                      ? popupDisplayStats
                        ? resolveSkillEffectWithStats(rawEffect, popupDisplayStats)
                        : resolveSkillEffect(rawEffect, ch)
                      : rawEffect,
                  );
                  var tags = getSkillTagsString(sk).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  var idAttr = (sk.id || '').replace(/"/g, '&quot;');
                  return (
                    '<div class="special-skill-opt" data-special-id="' +
                    idAttr +
                    '"><div class="special-skill-opt-name">' +
                    name +
                    ' <span style="color:#8b7355;font-size:11px">' +
                    getSkillTagsString(sk) +
                    ' · ' +
                    (sk.ap != null ? sk.ap : 0) +
                    ' AP</span></div><div class="special-skill-opt-effect">' +
                    effect +
                    '</div><button type="button" class="special-skill-opt-unlock" data-special-id="' +
                    idAttr +
                    '" ' +
                    (unspent < 1 ? ' disabled' : '') +
                    '>解锁</button></div>'
                  );
                })
                .join('');
        panel.dataset.avatarIndex = String(avatarIndex);
        function closeSpecialSkillPopup() {
          if (popup) popup.classList.remove('show');
        }
        if (closeBtn) closeBtn.onclick = closeSpecialSkillPopup;
        var back = popup.querySelector('.special-skill-popup-backdrop');
        if (back) back.onclick = closeSpecialSkillPopup;
        body.querySelectorAll('.special-skill-opt-unlock').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (btn.disabled) return;
            var id = btn.getAttribute('data-special-id');
            if (!id) return;
            if (detailEditState.avatarIndex !== avatarIndex) return;
            var pending = detailEditState.pendingSpecialUnlocks || [];
            if (pending.indexOf(id) !== -1) return;
            var party = getParty();
            var c = party && party[avatarIndex - 1];
            if (!c) return;
            var unspentNow = getUnspentSpecialSkillPoints(c) - pending.length;
            if (unspentNow < 1) return;
            detailEditState.pendingSpecialUnlocks = pending.concat([id]);
            closeSpecialSkillPopup();
            showCharacterDetail(avatarIndex);
            if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function')
              window.BattleGrid.refreshBattleView();
            if (typeof updateSidebarCharBadge === 'function') updateSidebarCharBadge();
          });
        });
        popup.classList.add('show');
      }
      function showCharacterDetail(avatarIndex) {
        var data = getSlotData(avatarIndex);
        if (!data) return;
        if (detailEditState.avatarIndex !== avatarIndex) {
          detailEditState.skillLevelDeltas = {};
          detailEditState.pendingSpecialUnlocks = [];
        }
        detailEditState.avatarIndex = avatarIndex;
        detailEditState.deltas = { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
        var party = getParty();
        var ch = party[avatarIndex - 1];
        var stats = null;
        if (ch) {
          stats = {
            str: getDisplayStat(ch, 'str'),
            agi: getDisplayStat(ch, 'agi'),
            int: getDisplayStat(ch, 'int'),
            sta: getDisplayStat(ch, 'sta'),
            def: getDisplayStat(ch, 'def'),
            luk: ch.luk != null ? ch.luk : '—',
            cha: ch.cha != null ? ch.cha : '—',
          };
        }
        var content = document.getElementById('character-detail-content');
        var drawer = document.getElementById('character-detail-drawer');
        if (content && drawer) {
          content.innerHTML = buildDetailHtml(data, stats, ch, avatarIndex);
          bindDetailActions(content, avatarIndex, ch, data);
          drawer.classList.add('open');
          var backdrop = document.getElementById('character-detail-backdrop');
          if (backdrop) backdrop.classList.add('visible');
          openDetailAvatar = avatarIndex;
        }
      }
      function onCharacterAvatarClick(avatarIndex) {
        if (openDetailAvatar === avatarIndex) {
          hideCharacterDetail();
          return;
        }
        showCharacterDetail(avatarIndex);
      }
      function openSettings() {
        if (typeof window.openSettings === 'function') window.openSettings();
      }
      function closeSettings() {
        if (typeof window.closeSettings === 'function') window.closeSettings();
      }
      function exitStoryView(onDone) {
        if (!storyBox || !gameInner || !viewStory) {
          onDone();
          return;
        }
        storyBox.classList.add('story-box-exit');
        function onEnd() {
          storyBox.removeEventListener('animationend', onEnd);
          storyBox.classList.remove('story-box-exit');
          gameInner.classList.remove('mode-story');
          viewStory.setAttribute('hidden', '');
          onDone();
        }
        storyBox.addEventListener('animationend', onEnd);
        setTimeout(onEnd, STORY_EXIT_MS + 50);
      }
      $('.sidebar-btn').on('click', function () {
        var tab = $(this).attr('data-tab');
        var btn = $('.sidebar-btn[data-tab="' + tab + '"]');
        var wasActive = tab !== 'switch' && btn.hasClass('active');
        $('.sidebar-btn').removeClass('active');
        if (tab !== 'switch' && !wasActive) btn.addClass('active');
        console.info('[色色地牢] 切换到:', tab);
        if (tab === 'switch') {
          closeSettings();
          hideCharacterPanel();
          hideMiscPanel();
          hideCharacterDetail();
          var inStory = gameInner && gameInner.classList.contains('mode-story');
          if (inStory) exitStoryView(function () {});
          else {
            if (storyBox) storyBox.classList.remove('story-box-exit');
            if (gameInner) gameInner.classList.add('mode-story');
            if (viewStory) viewStory.removeAttribute('hidden');
            if (typeof window.initStoryPanel === 'function') window.initStoryPanel();
          }
        } else if (tab === 'settings') {
          hideCharacterPanel();
          hideMiscPanel();
          hideCharacterDetail();
          if (wasActive) closeSettings();
          else {
            var inStory = gameInner && gameInner.classList.contains('mode-story');
            if (inStory) exitStoryView(openSettings);
            else openSettings();
          }
        } else {
          var inStory = gameInner && gameInner.classList.contains('mode-story');
          if (inStory) exitStoryView(function () {});
          else {
            if (gameInner) gameInner.classList.remove('mode-story');
            if (viewStory) viewStory.setAttribute('hidden', '');
          }
          closeSettings();
          if (tab === 'character' && !wasActive) {
            hideMiscPanel();
            hideMapDrawer();
            showCharacterPanel();
          } else if (tab === 'misc' && !wasActive) {
            showMiscPanel();
          } else {
            hideCharacterPanel();
            hideMiscPanel();
            hideMapDrawer();
            hideCharacterDetail();
          }
        }
      });
      $('.character-avatar-slot').on('click', function () {
        var idx = $(this).attr('data-avatar');
        if (idx) onCharacterAvatarClick(parseInt(idx, 10));
      });
      $(document).on('click', '.misc-sub-btn', function (e) {
        e.stopPropagation();
        var btn = $(this);
        var wasActive = btn.hasClass('active');
        var isMap = btn.attr('data-misc') === 'map';
        var isBag = btn.attr('data-misc') === 'bag';
        var isSave = btn.attr('data-misc') === 'save';
        btn.siblings('.misc-sub-btn').removeClass('active');
        if (!wasActive) btn.addClass('active');
        else btn.removeClass('active');
        if (isMap) {
          hideBagDrawer();
          hideSaveDrawer();
          if (!wasActive) showMapDrawer();
          else hideMapDrawer();
        } else if (isBag) {
          hideMapDrawer();
          hideSaveDrawer();
          if (!wasActive) showBagDrawer();
          else hideBagDrawer();
        } else if (isSave) {
          hideMapDrawer();
          hideBagDrawer();
          if (!wasActive) showSaveDrawer();
          else hideSaveDrawer();
        }
      });
      var miscInner = miscPanel ? miscPanel.querySelector('.misc-panel-inner') : null;
      if (miscInner && !document.getElementById('begining-save-btn') && typeof window.色色地牢_save !== 'undefined') {
        var saveBtn = document.createElement('button');
        saveBtn.id = 'begining-save-btn';
        saveBtn.className = 'misc-sub-btn';
        saveBtn.setAttribute('data-misc', 'save');
        saveBtn.innerHTML =
          '<div class="misc-sub-btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></div><div class="misc-sub-btn-label">保存</div>';
        miscInner.appendChild(saveBtn);
      }
      $('#map-drawer-backdrop').on('click', function () {
        hideMapDrawer();
      });
      $('#bag-drawer-backdrop').on('click', function () {
        hideBagDrawer();
      });
      $('#save-drawer-backdrop').on('click', function () {
        hideSaveDrawer();
      });
      $(document).on('click', '#save-drawer-content .save-slot-btn', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var act = this.getAttribute('data-act');
        var api = typeof window !== 'undefined' ? window.色色地牢_save : null;
        if (!api) return;
        if (act === 'save-new' && typeof api.saveSlot === 'function') {
          var nIdx = parseInt(this.getAttribute('data-new-index'), 10);
          if (isNaN(nIdx)) nIdx = 0;
          var payloadNew = getCurrentGameState();
          logGamePayloadDetail(
            '存档',
            '手动写入 localStorage 新槽位 index=' +
              nIdx +
              '（含 party / enemyParty / map·含pos与nodes与inv / gold / buff表 / 战斗日志 / nodeStates 等）',
            payloadNew,
          );
          api.saveSlot(nIdx, payloadNew);
          if (typeof toastr !== 'undefined') toastr.info('已保存为新存档');
          setTimeout(renderSaveContent, 0);
          return;
        }
        if (act === 'load-autosnapshot') {
          var pAuto = typeof api.readAutoSnapshotPayload === 'function' ? api.readAutoSnapshotPayload() : null;
          if (pAuto) {
            applySavePayload(pAuto);
            if (typeof toastr !== 'undefined') toastr.info('已读取自动快照');
          }
          setTimeout(renderSaveContent, 0);
          return;
        }
        if (act === 'load-timeline') {
          var row = this.closest('[data-timeline-index]');
          if (!row) return;
          var tix = parseInt(row.getAttribute('data-timeline-index'), 10);
          if (isNaN(tix)) return;
          var tEnt = snapshotTimeline[tix];
          if (tEnt && tEnt.payload) {
            applySavePayload(tEnt.payload);
            if (typeof toastr !== 'undefined') toastr.info('已读取本局时间线快照');
          }
          setTimeout(renderSaveContent, 0);
          return;
        }
        var card = this.closest('[data-save-slot]');
        if (!card) return;
        var idx = parseInt(card.getAttribute('data-save-slot'), 10);
        if (isNaN(idx)) return;
        if (act === 'save' && typeof api.saveSlot === 'function') {
          var payload = getCurrentGameState();
          logGamePayloadDetail('存档', '手动写入 localStorage 槽位 index=' + idx + '（含 party / enemyParty / map·含pos与nodes与inv / gold / buff表 / 战斗日志 / nodeStates 等）', payload);
          api.saveSlot(idx, payload);
          if (typeof toastr !== 'undefined') toastr.info('已保存');
          setTimeout(renderSaveContent, 0);
        } else if (act === 'load' && typeof api.loadSlot === 'function') {
          var payload2 = api.loadSlot(idx);
          if (payload2) {
            snapshotTimeline.length = 0;
            applySavePayload(payload2);
            if (typeof toastr !== 'undefined') toastr.info('已读取存档');
          }
          setTimeout(renderSaveContent, 0);
        } else if (act === 'clear' && typeof api.clearSlot === 'function') {
          api.clearSlot(idx);
          if (typeof toastr !== 'undefined') toastr.info('已删除存档');
          setTimeout(renderSaveContent, 0);
        }
      });
      $('#character-detail-backdrop').on('click', function () {
        if (openDetailAvatar) hideCharacterDetail(true);
      });
      updateSidebarCharBadge();
      updateDungeonFloorHUD();
    }

    /** 等级上限 Lv.5。Lv1–2 行动点=3，Lv3–4=4，Lv5=5 */
    function getApByLevel(level) {
      var lv = Math.min(5, Math.max(1, parseInt(level, 10) || 1));
      if (lv >= 5) return 5;
      if (lv >= 3) return 4;
      return 3;
    }
    /** 升级所需经验：Lv1→2 15，Lv2→3 20，Lv3→4 25，Lv4→5 30 */
    function getMaxExpForLevel(level) {
      var lv = parseInt(level, 10) || 1;
      if (lv <= 1) return 15;
      if (lv === 2) return 20;
      if (lv === 3) return 25;
      if (lv >= 4) return 30;
      return 30;
    }
    function getHpFromSta(sta) {
      return (parseInt(sta, 10) || 0) * 10;
    }
    var svg = typeof window !== 'undefined' && window.色色地牢_SVG ? window.色色地牢_SVG : {};
    var AP_FLAME_SVG = svg.AP_FLAME_SVG || '';
    var EXPAND_SVG = svg.EXPAND_SVG || '';
    var PLUS_SVG = svg.PLUS_SVG || '';
    var MINUS_SVG = svg.MINUS_SVG || '';
    var ADVANCE_UP_SVG = svg.ADVANCE_UP_SVG || '';
    var CLOSE_X_SVG = svg.CLOSE_X_SVG || '';
    var SWAP_SVG = svg.SWAP_SVG || '';
    var SKILL_ATTACK_SVG = svg.SKILL_ATTACK_SVG || '';
    var SKILL_DEFENSE_SVG = svg.SKILL_DEFENSE_SVG || '';
    var INTENT_CLOTHES_BREAK_SVG = svg.INTENT_CLOTHES_BREAK_SVG || '';
    var INTENT_BIND_CHAIN_SVG = svg.INTENT_BIND_CHAIN_SVG || '';
    var INTENT_LEWD_HEART_SVG = svg.INTENT_LEWD_HEART_SVG || '';
    var SKILL_BAIYA_SVG = svg.SKILL_BAIYA_SVG || '';
    var SKILL_WOLF_PACK_SVG = svg.SKILL_WOLF_PACK_SVG || '';
    var SKILL_ROAR_SVG = svg.SKILL_ROAR_SVG || '';
    var SKILL_EXECUTE_SVG = svg.SKILL_EXECUTE_SVG || '';
    var SKILL_BAIYA_SWEEP_SVG = svg.SKILL_BAIYA_SWEEP_SVG || '';
    var SKILL_WHIRLWIND_SVG = svg.SKILL_WHIRLWIND_SVG || '';
    var SKILL_BLADE_BITE_SVG = svg.SKILL_BLADE_BITE_SVG || '';
    var SKILL_SHIELD_SWORD_SVG = svg.SKILL_SHIELD_SWORD_SVG || '';
    var SKILL_ZANYUE_SVG = svg.SKILL_ZANYUE_SVG || '';
    var SKILL_JIANQIE_SVG = svg.SKILL_JIANQIE_SVG || '';
    var SKILL_JUHE_SVG = svg.SKILL_JUHE_SVG || '';
    var SKILL_NADAO_SVG = svg.SKILL_NADAO_SVG || '';
    var SKILL_CUOJIN_SVG = svg.SKILL_CUOJIN_SVG || '';
    var SKILL_BAIYE_SVG = svg.SKILL_BAIYE_SVG || '';
    var SKILL_ISHAN_SVG = svg.SKILL_ISHAN_SVG || '';
    var SKILL_XINYAN_SVG = svg.SKILL_XINYAN_SVG || '';
    var SKILL_MUPAIZI_SVG = svg.SKILL_MUPAIZI_SVG || '';
    var SKILL_CANYINGBU_SVG = svg.SKILL_CANYINGBU_SVG || '';
    var SKILL_YOULINGWUTA_SVG = svg.SKILL_YOULINGWUTA_SVG || '';
    var SKILL_XUEWUQIANGVEN_SVG = svg.SKILL_XUEWUQIANGVEN_SVG || '';
    var SKILL_ANYEWEIMU_SVG = svg.SKILL_ANYEWEIMU_SVG || '';
    var SKILL_MOLONGWU_SVG = svg.SKILL_MOLONGWU_SVG || '';
    var SKILL_SHENYUANZHONGJIE_SVG = svg.SKILL_SHENYUANZHONGJIE_SVG || '';
    var SKILL_ANSHIZHIREN_SVG = svg.SKILL_ANSHIZHIREN_SVG || '';
    var SKILL_YANMOCHUIXI_SVG = svg.SKILL_YANMOCHUIXI_SVG || '';
    var SKILL_XINLINGQINSHI_SVG = svg.SKILL_XINLINGQINSHI_SVG || '';
    var SKILL_XUWUFANGZHU_SVG = svg.SKILL_XUWUFANGZHU_SVG || '';
    var SKILL_YAOYANYEHUO_SVG = svg.SKILL_YAOYANYEHUO_SVG || '';
    var SKILL_MEIMOZHIWEN_SVG = svg.SKILL_MEIMOZHIWEN_SVG || '';
    var SKILL_LINGHUNSHENGYAN_SVG = svg.SKILL_LINGHUNSHENGYAN_SVG || '';
    var SKILL_JIEHUNZHIHUO_SVG = svg.SKILL_JIEHUNZHIHUO_SVG || '';
    var SKILL_SHENGUANGZHAN_SVG = svg.SKILL_SHENGUANGZHAN_SVG || '';
    var SKILL_QINGSUANZHISHOU_SVG = svg.SKILL_QINGSUANZHISHOU_SVG || '';
    var SKILL_SHENENJISHU_SVG = svg.SKILL_SHENENJISHU_SVG || '';
    var SKILL_ZUIFAXUANGAO_SVG = svg.SKILL_ZUIFAXUANGAO_SVG || '';
    var SKILL_MANGMOUZHIGUANG_SVG = svg.SKILL_MANGMOUZHIGUANG_SVG || '';
    var SKILL_JISHU_SVG = svg.SKILL_JISHU_SVG || '';
    var SKILL_SHENGHUOJINGSHI_SVG = svg.SKILL_SHENGHUOJINGSHI_SVG || '';
    /** 每升一级获得的自由点数（用于五维属性分配） */
    var FREE_POINTS_PER_LEVEL = 10;
    /** 每升一级获得的自由技能点（用于升级技能或解锁新技能，与属性点分开） */
    var SKILL_POINTS_PER_LEVEL = 3;
    var FIVE_DIM_KEYS = ['str', 'agi', 'int', 'sta', 'def'];
    var BONUS_KEYS = { str: 'bonusStr', agi: 'bonusAgi', int: 'bonusInt', sta: 'bonusSta', def: 'bonusDef' };
    function buildDefaultParty() {
      var order = (window.DEFAULT_PARTY_ORDER && window.DEFAULT_PARTY_ORDER.slice(0, 6)) || [];
      var chars = window.CHARACTERS;
      var portraits = window.CHARACTER_PORTRAITS;
      var party = [];
      for (var i = 0; i < 6; i++) {
        var key = order[i];
        if (!key || !chars || !chars[key]) {
          party.push(null);
          continue;
        }
        var ch = JSON.parse(JSON.stringify(chars[key]));
        ch.avatar = (portraits && portraits[ch.name]) || '';
        party.push(ch);
      }
      return party;
    }
    var defaultParty = buildDefaultParty();
    /** 敌方默认阵容（6 槽全空）；可从聊天变量 v.enemyParty 覆盖 */
    var defaultEnemyParty = [null, null, null, null, null, null];
    /** 内存中保留的最近一次己方/敌方阵容（含 currentAp、hp 等），避免 replaceVariables 后 getVariables 未及时更新导致第二次起攻击不显示 AP 扣减） */
    var _lastKnownParty = null;
    var _lastKnownEnemies = null;
    /** 同上：无酒馆变量或 getVariables 未同步时，地图仍用本次生成/读档的 map（避免总显示内联 DEFAULT） */
    var _lastKnownMap = null;
    /** AI 遭遇成功后追加的本局快照时间线（内存）；读档不恢复本数组 */
    var SNAPSHOT_TIMELINE_CAP = 40;
    var snapshotTimeline = [];
    /** replaceVariables 后 getVariables 可能尚未返回 gold，侧边栏金币用此缓存与 getVariables 对齐 */
    var _lastKnownChatGold = null;
    /** replaceVariables 为全量替换：部分写入时若 v 缺少 gold，用缓存补回，避免战斗保存等把金币清空 */
    function mergePreserveChatGold(v) {
      if (!v || typeof v !== 'object') return;
      if ((v.gold == null || v.gold === '') && _lastKnownChatGold != null) v.gold = _lastKnownChatGold;
    }
    function getParty() {
      if (_lastKnownParty && _lastKnownParty.length === 6) return _lastKnownParty;
      var raw;
      try {
        if (typeof getVariables === 'function') {
          var v = getVariables({ type: 'chat' });
          if (v) {
            if (!v.buffDefinitions || !Array.isArray(v.buffDefinitions) || v.buffDefinitions.length === 0) {
              v.buffDefinitions = BUFF_DEFINITIONS;
              mergePreserveChatGold(v);
              if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
            }
            if (v.party && Array.isArray(v.party)) raw = v.party;
          }
        }
      } catch (e) {}
      if (!raw) raw = defaultParty;
      var chars = window.CHARACTERS;
      var result = raw.map(function (ch) {
        if (!ch) return null;
        var base = chars && ch.name && chars[ch.name] ? Object.assign({}, chars[ch.name], ch) : Object.assign({}, ch);
        if (base.semenVolumeMl == null || base.semenVolumeMl === '') base.semenVolumeMl = 0;
        else base.semenVolumeMl = Number(base.semenVolumeMl) || 0;
        return base;
      });
      var portraits = window.CHARACTER_PORTRAITS;
      result.forEach(function (ch) {
        if (ch && !ch.avatar && portraits && portraits[ch.name]) ch.avatar = portraits[ch.name];
      });
      if (typeof window !== 'undefined' && window.BattleGrid && typeof window.BattleGrid.capUnitBuffs === 'function') {
        result.forEach(function (ch) {
          if (ch) window.BattleGrid.capUnitBuffs(ch);
        });
      }
      while (result.length < 6) result.push(null);
      return result;
    }
    function getEnemyParty() {
      if (_lastKnownEnemies && _lastKnownEnemies.length === 6) return _lastKnownEnemies;
      var raw;
      try {
        if (typeof getVariables === 'function') {
          var v = getVariables({ type: 'chat' });
          if (v && v.enemyParty && Array.isArray(v.enemyParty)) raw = v.enemyParty;
        }
      } catch (e) {}
      if (!raw) raw = defaultEnemyParty;
      var result = raw.slice();
      result.forEach(function (en) {
        if (en && (en.level == null || en.level === undefined)) en.level = 'Normal';
      });
      if (typeof window !== 'undefined' && window.BattleGrid && typeof window.BattleGrid.capUnitBuffs === 'function') {
        result.forEach(function (en) {
          if (en) window.BattleGrid.capUnitBuffs(en);
        });
      }
      while (result.length < 6) result.push(null);
      return result;
    }
    /** 战斗模块写回己方/敌方数据并更新缓存（由 battle.initBattleUI 调用） */
    /** @param {{ battleFloorTitle?: string }} [opts] 可选；传入 battleFloorTitle 时写入聊天变量（AI 敌方设计中的楼层名） */
    function saveBattleData(party, enemies, opts) {
      _lastKnownParty = party;
      _lastKnownEnemies = enemies;
      var v = null;
      try {
        if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
      } catch (e) {}
      if (!v) v = {};
      v.party = party;
      v.enemyParty = enemies;
      if (opts && Object.prototype.hasOwnProperty.call(opts, 'battleFloorTitle')) {
        v.battleFloorTitle = opts.battleFloorTitle;
      }
      if (!v.buffDefinitions || !Array.isArray(v.buffDefinitions) || v.buffDefinitions.length === 0)
        v.buffDefinitions = BUFF_DEFINITIONS;
      mergePreserveChatGold(v);
      if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
    }
    /**
     * 进入新一场战斗前：清空 buff/debuff、护盾；AP 回满；不修改 HP（保留上一场结束时的血量）。
     * 直接修改 getParty() 返回数组中的角色对象。
     */
    function preparePartyForNewBattle() {
      var party = getParty();
      if (!party || !party.length) return;
      for (var i = 0; i < party.length; i++) {
        var ch = party[i];
        if (!ch) continue;
        ch.buffs = [];
        ch.currentShield = 0;
        var lv = ch.level != null ? ch.level : 1;
        if (ch.name === '白牙') {
          ch.currentAp = 2;
        } else {
          ch.currentAp = getApByLevel(lv);
        }
        if (ch.见切弹返) ch.见切弹返 = false;
        if (ch.影舞反击) ch.影舞反击 = false;
      }
    }
    /**
     * 将 AI 遭遇生成的 spawn plan 写入聊天变量 enemyParty，并刷新战斗格子渲染。
     * 由 encounter.js 在 generate 回调中调用（需在 app 加载后）。
     */
    /** @returns {boolean} 是否已成功写入战斗 */
    function commitSpawnPlanToBattle(plan) {
      if (typeof window !== 'undefined') window._色色地牢_battleVictoryGoldGranted = false;
      if (
        !plan ||
        typeof window.色色地牢_enemyDesign === 'undefined' ||
        !window.色色地牢_enemyDesign ||
        typeof window.色色地牢_enemyDesign.buildEnemyPartyFromSpawnPlan !== 'function'
      )
        return false;
      var enemies = window.色色地牢_enemyDesign.buildEnemyPartyFromSpawnPlan(plan);
      if (!enemies) return false;
      preparePartyForNewBattle();
      if (typeof window !== 'undefined' && window.BattleGrid && typeof window.BattleGrid.capUnitBuffs === 'function') {
        enemies.forEach(function (en) {
          if (en) window.BattleGrid.capUnitBuffs(en);
        });
      }
      saveBattleData(getParty(), enemies, {
        battleFloorTitle: plan.floorName != null ? String(plan.floorName).trim() : '',
      });
      if (typeof window.BattleGrid !== 'undefined' && typeof window.BattleGrid.refreshBattleView === 'function')
        window.BattleGrid.refreshBattleView();
      console.info('[色色地牢][enemy_design] 已写入 enemyParty（聊天变量）并刷新战斗视图');
      if (typeof toastr !== 'undefined') toastr.info('敌方阵容已同步到战斗界面');
      setTimeout(function () {
        try {
          if (typeof window.色色地牢_capturePostEncounterSnapshot === 'function')
            window.色色地牢_capturePostEncounterSnapshot(plan);
        } catch (eSnap) {
          console.warn('[色色地牢][快照] 遭遇后快照失败', eSnap);
        }
      }, 0);
      return true;
    }
    if (typeof window !== 'undefined') {
      window.色色地牢_commitSpawnPlanToBattle = commitSpawnPlanToBattle;
      window.色色地牢_preparePartyForNewBattle = preparePartyForNewBattle;
    }
    /** 存档：获取当前游戏状态（供 save.js 写入 localStorage）。不调用 getMapData（其在 initSidebar 内），直接从 chat 变量组装 map。 */
    function getCurrentGameState() {
      var party = getParty();
      var enemyParty = getEnemyParty();
      var v = null;
      try {
        if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
      } catch (e) {}
      var map = v && v.map && typeof v.map === 'object' ? v.map : null;
      var m;
      if (map && Array.isArray(map.nodes) && map.nodes.length >= 40) {
        m = {
          area: map.area || '未知区域',
          pos: (map.pos || '0-0').toString(),
          nodes: map.nodes,
          inv: Array.isArray(map.inv) ? map.inv : [],
          revealOrder: Array.isArray(map.revealOrder) ? map.revealOrder : undefined,
        };
      } else if (_lastKnownMap && Array.isArray(_lastKnownMap.nodes) && _lastKnownMap.nodes.length >= 40) {
        m = {
          area: _lastKnownMap.area || '未知区域',
          pos: (_lastKnownMap.pos || '0-0').toString(),
          nodes: _lastKnownMap.nodes,
          inv: Array.isArray(_lastKnownMap.inv) ? _lastKnownMap.inv : [],
          revealOrder: Array.isArray(_lastKnownMap.revealOrder) ? _lastKnownMap.revealOrder : undefined,
        };
      } else {
        m = { area: '地牢', pos: '0-0', nodes: [], inv: [] };
      }
      var buffDefinitions =
        v && v.buffDefinitions && Array.isArray(v.buffDefinitions) ? v.buffDefinitions : BUFF_DEFINITIONS;
      var nodeStates = v && v.nodeStates && typeof v.nodeStates === 'object' ? v.nodeStates : {};
      var recentLog =
        typeof window.BattleGrid !== 'undefined' && typeof window.BattleGrid.getRecentBattleLog === 'function'
          ? window.BattleGrid.getRecentBattleLog(100)
          : [];
      var meta = { areaName: m.area };
      if (v && v.difficulty != null) meta.difficulty = v.difficulty;
      if (v && v.diffUid != null) meta.diffUid = v.diffUid;
      if (v && v.gold != null) meta.gold = v.gold;
      var battleFloorTitle = v && v.battleFloorTitle != null ? String(v.battleFloorTitle) : '';
      return {
        party: party,
        enemyParty: enemyParty,
        buffDefinitions: buffDefinitions,
        map: {
          area: m.area,
          pos: m.pos,
          nodes: m.nodes,
          inv: m.inv,
          revealOrder: m.revealOrder,
        },
        battleFloorTitle: battleFloorTitle,
        meta: meta,
        history: { recentBattleLog: recentLog },
        nodeStates: nodeStates,
      };
    }

    function summarizePartyForLog(party) {
      if (!Array.isArray(party)) return [];
      return party.map(function (ch, i) {
        if (!ch) return { slot: i + 1, empty: true };
        return {
          slot: i + 1,
          name: ch.name,
          level: ch.level,
          hp: ch.hp,
          maxHp: ch.maxHp,
          currentAp: ch.currentAp,
          buffCount: ch.buffs && ch.buffs.length ? ch.buffs.length : 0,
        };
      });
    }

    function summarizeEnemyForLog(enemies) {
      if (!Array.isArray(enemies)) return [];
      return enemies.map(function (en, i) {
        if (!en) return { slot: i + 1, empty: true };
        return { slot: i + 1, name: en.name, hp: en.hp, maxHp: en.maxHp };
      });
    }

    /** 控制台：可折叠摘要，下拉为结构化字段 + 完整 payload */
    function logGamePayloadDetail(kind, title, payload) {
      if (!payload) {
        console.warn('[色色地牢][' + kind + '] ' + title + ' — 无数据');
        return;
      }
      var map = payload.map || {};
      var meta = payload.meta || {};
      var inv = Array.isArray(map.inv) ? map.inv : [];
      var logLines = payload.history && Array.isArray(payload.history.recentBattleLog) ? payload.history.recentBattleLog : [];
      console.groupCollapsed('[色色地牢][' + kind + '] ' + title);
      console.log('摘要（关键字段）', {
        mapPos: map.pos,
        area: map.area,
        gold: meta.gold,
        invCount: inv.length,
        battleLogLines: logLines.length,
        nodeStateKeys: payload.nodeStates ? Object.keys(payload.nodeStates).length : 0,
        battleFloorTitle: payload.battleFloorTitle || '',
      });
      console.log('己方队伍', summarizePartyForLog(payload.party));
      console.log('敌方队伍', summarizeEnemyForLog(payload.enemyParty));
      if (inv.length) console.log('背包/遗物 map.rawInv', inv);
      if (logLines.length) console.log('战斗日志 recentBattleLog', logLines);
      if (payload.buffDefinitions && payload.buffDefinitions.length)
        console.log('buffDefinitions 条数', payload.buffDefinitions.length);
      console.log('完整存档 payload（原始对象）', payload);
      console.groupEnd();
    }

    /** 遭遇写入后：地图 pos 对齐当前战斗格，nodes/inv 仍为已探索完整的聊天地图 */
    function buildSnapshotPayloadForEncounter(plan) {
      var base = getCurrentGameState();
      var copy;
      try {
        copy = JSON.parse(JSON.stringify(base));
      } catch (e) {
        copy = base;
      }
      var nodeId = null;
      if (plan && plan.nodeId != null && String(plan.nodeId).trim() !== '')
        nodeId = String(plan.nodeId).trim();
      else if (window._色色地牢_lastBattleIntent && window._色色地牢_lastBattleIntent.nodeId)
        nodeId = String(window._色色地牢_lastBattleIntent.nodeId);
      if (nodeId && copy.map) copy.map.pos = nodeId;
      return copy;
    }

    function capturePostEncounterSnapshot(plan) {
      var payload = buildSnapshotPayloadForEncounter(plan);
      var mapPos = (payload.map && payload.map.pos) || '';
      var area = (payload.map && payload.map.area) || '';
      var entry = {
        capturedAt: new Date().toISOString(),
        mapPos: mapPos,
        areaName: area,
        trigger: 'post_ai_encounter',
        payload: payload,
      };
      snapshotTimeline.push(entry);
      if (snapshotTimeline.length > SNAPSHOT_TIMELINE_CAP) snapshotTimeline.shift();
      if (typeof window.色色地牢_save === 'undefined' || typeof window.色色地牢_save.writeAutoSnapshot !== 'function') {
        logGamePayloadDetail('快照', '已生成（未写入本地：存档模块不可用）', payload);
        return;
      }
      window.色色地牢_save.writeAutoSnapshot(payload, {
        mapPos: mapPos,
        areaName: area,
        trigger: 'post_ai_encounter',
      });
      logGamePayloadDetail(
        '快照',
        '遭遇后自动快照 → 已覆盖「蓝色快照」+ 本局时间线第 ' + snapshotTimeline.length + ' 条 · 格 ' + mapPos,
        payload,
      );
    }

    if (typeof window !== 'undefined') {
      window.色色地牢_capturePostEncounterSnapshot = capturePostEncounterSnapshot;
      window.色色地牢_getSnapshotTimeline = function () {
        return snapshotTimeline.slice();
      };
    }

    /** 地图节点 id（如 0-0、12-2）→ 累计层数 N：起点为 0，列号 1–15 为当前区域内第 N 层（与 README 列号=层号一致） */
    function getMapPosForFloorHUD() {
      var v = null;
      try {
        if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
      } catch (e) {}
      var map = v && v.map && typeof v.map === 'object' ? v.map : null;
      if (map && map.pos != null) return map.pos.toString();
      if (_lastKnownMap && _lastKnownMap.pos != null) return _lastKnownMap.pos.toString();
      return '0-0';
    }
    /** 每大层 15 个累计层：1–15、16–30…；起点 N=0 时大层显示为 1、层数为 0 */
    function computeFloorHUDFromPos(posStr) {
      var parts = (posStr || '0-0').toString().split('-');
      var col = parseInt(parts[0], 10);
      var globalN = !isNaN(col) && col > 0 ? col : 0;
      var major = globalN <= 0 ? 1 : Math.ceil(globalN / 15);
      var bandLo = (major - 1) * 15 + 1;
      var bandHi = major * 15;
      return { globalN: globalN, major: major, bandLo: bandLo, bandHi: bandHi };
    }
    /** 根据节点 id 取类型；优先与地图渲染同源的 getMapData（initSidebar 内注册 lookup） */
    function getNodeTypeForMapId(nodeId) {
      if (!nodeId) return '';
      if (typeof window.色色地牢_lookupMapNodeType === 'function') {
        var t0 = window.色色地牢_lookupMapNodeType(nodeId);
        if (t0) return t0;
      }
      var v = null;
      try {
        if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
      } catch (e) {}
      var map = v && v.map && typeof v.map === 'object' ? v.map : null;
      var nodes = map && Array.isArray(map.nodes) && map.nodes.length > 0 ? map.nodes : null;
      if (!nodes && _lastKnownMap && Array.isArray(_lastKnownMap.nodes) && _lastKnownMap.nodes.length > 0)
        nodes = _lastKnownMap.nodes;
      if (!nodes) return '';
      var nid = String(nodeId);
      var found = nodes.find(function (x) {
        return x && String(x.id) === nid;
      });
      return found && found.type != null ? String(found.type) : '';
    }
    function updateDungeonFloorHUD() {
      var hud = document.getElementById('dungeon-floor-hud');
      if (!hud) return;
      var pending =
        typeof window.色色地牢_getMapPendingNodeId === 'function' ? window.色色地牢_getMapPendingNodeId() : null;
      var posForHud = pending || getMapPosForFloorHUD();
      var d = computeFloorHUDFromPos(posForHud);
      var majorEl = document.getElementById('dungeon-floor-major');
      var bandEl = document.getElementById('dungeon-floor-band');
      var floorEl = document.getElementById('dungeon-floor-global');
      if (majorEl) majorEl.textContent = String(d.major);
      if (floorEl) floorEl.textContent = '第 ' + d.globalN + ' 层';
      if (bandEl) {
        if (pending) {
          var nt = getNodeTypeForMapId(pending);
          bandEl.textContent = nt || '—';
        } else if (d.globalN === 0) bandEl.textContent = '起点';
        else bandEl.textContent = d.bandLo + '–' + d.bandHi + ' 层';
      }
      hud.setAttribute(
        'title',
        pending
          ? '预览选中格：' + (getNodeTypeForMapId(pending) || '未知') + ' · 第 ' + d.globalN + ' 层（尚未移动）'
          : d.globalN === 0
            ? '当前位于起点（第 0 层）'
            : '大层 ' + d.major + ' · 累计第 ' + d.globalN + ' 层（本段 ' + d.bandLo + '–' + d.bandHi + '）',
      );
      updateSidebarGoldHUD();
    }
    /** 聊天变量中的金币（无则 0）；若 getVariables 尚未同步则用 _lastKnownChatGold） */
    function getChatGold() {
      var v = null;
      try {
        if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
      } catch (e) {}
      if (v && v.gold != null && v.gold !== '') {
        var n = parseInt(v.gold, 10);
        if (!isNaN(n)) {
          _lastKnownChatGold = Math.max(0, n);
          return _lastKnownChatGold;
        }
      }
      if (_lastKnownChatGold != null) return _lastKnownChatGold;
      return 0;
    }
    function updateSidebarGoldHUD(optGold) {
      var iconWrap = document.getElementById('sidebar-gold-icon');
      if (iconWrap && !iconWrap.getAttribute('data-gold-svg')) {
        var goldSvg =
          typeof window !== 'undefined' && window.色色地牢_SVG && window.色色地牢_SVG.SIDEBAR_GOLD_SVG
            ? window.色色地牢_SVG.SIDEBAR_GOLD_SVG
            : '';
        if (goldSvg) {
          iconWrap.innerHTML = goldSvg;
          iconWrap.setAttribute('data-gold-svg', '1');
        }
      }
      var el = document.getElementById('sidebar-gold-value');
      if (!el) return;
      if (optGold != null && optGold !== '') {
        var og = parseInt(optGold, 10);
        if (!isNaN(og)) {
          _lastKnownChatGold = Math.max(0, og);
          el.textContent = String(_lastKnownChatGold);
          return;
        }
      }
      el.textContent = String(getChatGold());
    }
    function animateGoldCountUp(fromVal, toVal, durationMs, onTick, onDone) {
      fromVal = Math.max(0, parseInt(fromVal, 10) || 0);
      toVal = Math.max(0, parseInt(toVal, 10) || 0);
      if (fromVal === toVal) {
        if (typeof onTick === 'function') onTick(toVal);
        if (typeof onDone === 'function') onDone();
        return;
      }
      var t0 = Date.now();
      var dur = Math.max(80, durationMs | 0);
      function tick() {
        var t = Math.min(1, (Date.now() - t0) / dur);
        var eased = 1 - Math.pow(1 - t, 2);
        var cur = Math.round(fromVal + (toVal - fromVal) * eased);
        if (typeof onTick === 'function') onTick(cur);
        if (t < 1) requestAnimationFrame(tick);
        else {
          if (typeof onTick === 'function') onTick(toVal);
          if (typeof onDone === 'function') onDone();
        }
      }
      requestAnimationFrame(tick);
    }
    function showGoldGainFloatNearHud(amount) {
      var el = document.createElement('div');
      el.className = 'gold-gain-float';
      el.textContent = '+' + amount;
      var hud = document.getElementById('sidebar-gold-hud');
      if (hud) {
        var r = hud.getBoundingClientRect();
        el.style.left = Math.max(8, r.left) + 'px';
        el.style.top = Math.max(8, r.top - 4) + 'px';
      } else {
        el.style.left = '16px';
        el.style.bottom = '96px';
      }
      document.body.appendChild(el);
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 1300);
    }
    function onBattleVictoryGold() {
      if (typeof window !== 'undefined' && window._色色地牢_battleVictoryGoldGranted) return;
      var gd = typeof window !== 'undefined' ? window.色色地牢_goldDrop : null;
      if (!gd || typeof gd.rollBattleGold !== 'function') return;
      var intent = typeof window !== 'undefined' ? window._色色地牢_lastBattleIntent : null;
      var m = typeof getMapData === 'function' ? getMapData() : null;
      var area = (intent && intent.area) || (m && m.area) || '';
      var nodeType = (intent && intent.nodeType) || '普通战斗';
      var n = gd.rollBattleGold(area, nodeType);
      if (n <= 0) return;
      if (typeof window !== 'undefined') window._色色地牢_battleVictoryGoldGranted = true;
      var startGold = getChatGold();
      var endGold = startGold + n;
      showGoldGainFloatNearHud(n);
      setTimeout(function () {
        animateGoldCountUp(
          startGold,
          endGold,
          480,
          function (cur) {
            var gel = document.getElementById('sidebar-gold-value');
            if (gel) gel.textContent = String(cur);
          },
          function () {
            var v = null;
            try {
              if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
            } catch (e) {}
            if (!v) v = {};
            v.gold = endGold;
            _lastKnownChatGold = endGold;
            mergePreserveChatGold(v);
            if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
            updateSidebarGoldHUD(endGold);
          },
        );
      }, 260);
    }
    /** 存档：将读取的 payload 写回 chat 并刷新战斗/地图视图 */
    function applySavePayload(payload) {
      if (!payload) return;
      logGamePayloadDetail(
        '读档',
        '即将应用数据 → replaceVariables(chat)：同步 party、enemyParty、map(含 pos/nodes/inv)、buffDefinitions、battleFloorTitle、nodeStates、meta·金币难度、战斗日志 等',
        payload,
      );
      // 重要：replaceVariables 后 getVariables 可能短时间仍返回旧值/空值，会导致 UI 回退 defaultParty（看起来像“读出来 4 人”）。
      // 因此这里先把内存缓存立即对齐到 payload，确保 refreshBattleView/render 即时使用读档数据。
      _lastKnownParty = null;
      _lastKnownEnemies = null;
      _lastKnownMap = null;
      var v = null;
      try {
        if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
      } catch (e) {}
      if (!v) v = {};
      if (Array.isArray(payload.party)) {
        // 读档时清理历史残留：清漓仅保留基础攻击/防御（避免旧版本/旧存档多技能）
        v.party = payload.party.map(function (ch) {
          if (!ch || ch.name !== '清漓') return ch;
          try {
            var c2 = JSON.parse(JSON.stringify(ch));
            if (Array.isArray(c2.skills)) c2.skills = c2.skills.slice(0, 2);
            return c2;
          } catch (e2) {
            if (ch && Array.isArray(ch.skills)) ch.skills = ch.skills.slice(0, 2);
            return ch;
          }
        });
        // 保持 6 槽长度，避免后续逻辑按槽位读取时意外越界/回退
        while (v.party.length < 6) v.party.push(null);
        _lastKnownParty = v.party;
      }
      if (Array.isArray(payload.enemyParty)) {
        v.enemyParty = payload.enemyParty;
        while (v.enemyParty.length < 6) v.enemyParty.push(null);
        _lastKnownEnemies = v.enemyParty;
      }
      if (Array.isArray(payload.buffDefinitions)) v.buffDefinitions = payload.buffDefinitions;
      if (payload.map && typeof payload.map === 'object') {
        v.map = payload.map;
        if (Array.isArray(payload.map.nodes) && payload.map.nodes.length >= 40) {
          try {
            _lastKnownMap = JSON.parse(JSON.stringify(payload.map));
          } catch (eM) {
            _lastKnownMap = {
              area: payload.map.area,
              pos: payload.map.pos,
              nodes: payload.map.nodes.slice(),
              inv: Array.isArray(payload.map.inv) ? payload.map.inv.slice() : [],
              revealOrder: Array.isArray(payload.map.revealOrder) ? payload.map.revealOrder.slice() : undefined,
            };
          }
        }
      }
      if (payload.nodeStates && typeof payload.nodeStates === 'object') v.nodeStates = payload.nodeStates;
      if (Object.prototype.hasOwnProperty.call(payload, 'battleFloorTitle')) {
        v.battleFloorTitle = payload.battleFloorTitle != null ? String(payload.battleFloorTitle) : '';
      } else {
        // 兼容旧存档：不带该字段时也要清空，避免沿用上一局残留
        v.battleFloorTitle = '';
      }
      var pm = payload.meta && typeof payload.meta === 'object' ? payload.meta : {};
      if (pm.difficulty != null) v.difficulty = pm.difficulty;
      if (pm.diffUid != null) v.diffUid = pm.diffUid;
      if (pm.gold != null) v.gold = pm.gold;
      if (v.gold != null && v.gold !== '') {
        var gLoad = parseInt(v.gold, 10);
        if (!isNaN(gLoad)) _lastKnownChatGold = Math.max(0, gLoad);
      }
      mergePreserveChatGold(v);
      if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
      if (
        payload.history &&
        Array.isArray(payload.history.recentBattleLog) &&
        typeof window.BattleGrid !== 'undefined' &&
        typeof window.BattleGrid.setBattleLog === 'function'
      ) {
        window.BattleGrid.setBattleLog(payload.history.recentBattleLog);
      }
      if (typeof window.BattleGrid !== 'undefined' && typeof window.BattleGrid.refreshBattleView === 'function')
        window.BattleGrid.refreshBattleView();
      if (typeof window.色色地牢_refreshMap === 'function') window.色色地牢_refreshMap();
      updateDungeonFloorHUD();
    }
    var _lastMapPos = null;
    /** 存档：记录刚进入某节点时的状态到 chat.nodeStates（在 getMapData 中 pos 变化时调用） */
    function recordNodeState(nodeId) {
      if (!nodeId) return;
      var snap = getCurrentGameState();
      var v = null;
      try {
        if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
      } catch (e) {}
      if (!v) v = {};
      if (!v.nodeStates || typeof v.nodeStates !== 'object') v.nodeStates = {};
      v.nodeStates[nodeId] = {
        party: snap.party,
        enemyParty: snap.enemyParty,
        map: snap.map,
        buffDefinitions: snap.buffDefinitions,
      };
      mergePreserveChatGold(v);
      if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
    }
    /** 未使用属性点 = (level-1)*10 - 已分配到五维的 bonus 总和 */
    function getUnspentPoints(ch) {
      if (!ch) return 0;
      var level = Math.max(1, parseInt(ch.level, 10) || 1);
      var total = (level - 1) * FREE_POINTS_PER_LEVEL;
      var spent = FIVE_DIM_KEYS.reduce(function (sum, k) {
        return sum + (parseInt(ch[BONUS_KEYS[k]], 10) || 0);
      }, 0);
      return Math.max(0, total - spent);
    }
    /** 未使用技能点 = (level-1)*3 - 已用于技能升级/解锁的 skillPointsSpent（1 级时为 0，与属性点一致为「升级获得」） */
    function getUnspentSkillPoints(ch) {
      if (!ch) return 0;
      var level = Math.max(1, parseInt(ch.level, 10) || 1);
      var total = (level - 1) * SKILL_POINTS_PER_LEVEL;
      var spent = parseInt(ch.skillPointsSpent, 10) || 0;
      return Math.max(0, total - spent);
    }
    /** 特殊技能点：3 级 1 点，5 级再 1 点（共 2 点），与普通技能点不共用 */
    function getSpecialSkillPointsTotal(level) {
      var lv = Math.max(1, parseInt(level, 10) || 1);
      return (lv >= 3 ? 1 : 0) + (lv >= 5 ? 1 : 0);
    }
    function getUnspentSpecialSkillPoints(ch) {
      if (!ch) return 0;
      var total = getSpecialSkillPointsTotal(ch.level);
      var unlocked =
        ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
      return Math.max(0, total - unlocked.length);
    }
    var getSpecialSkillsForChar =
      window.色色地牢_character && window.色色地牢_character.getSpecialSkillsForChar
        ? window.色色地牢_character.getSpecialSkillsForChar
        : function () {
            return [];
          };
    var getSkillTagsString =
      window.色色地牢_character && window.色色地牢_character.getSkillTagsString
        ? window.色色地牢_character.getSkillTagsString
        : function (s) {
            return s && s.tags != null ? String(s.tags) : '';
          };
    function hasAliveQingliInParty() {
      try {
        var p = getParty ? getParty() : null;
        if (!p || !Array.isArray(p)) return false;
        for (var i = 0; i < p.length; i++) {
          var u = p[i];
          if (!u || u.name !== '清漓') continue;
          var hpRaw = u.hp;
          var hp = hpRaw == null ? 1 : parseInt(hpRaw, 10) || 0;
          if (hp > 0) return true;
        }
      } catch (e) {}
      return false;
    }
    function getDisplayStat(ch, key) {
      if (!ch) return 0;
      var base = parseInt(ch[key], 10) || 0;
      if (BONUS_KEYS[key] != null) base += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
      // 清漓·福泽：清漓存活时，全体友方幸运 +3（用于属性面板渲染）
      if (key === 'luk' && hasAliveQingliInParty()) base += 3;
      if (ch.name === '达芙妮' && (key === 'str' || key === 'def'))
        base += Math.floor((ch.level != null ? ch.level : 1) * 2);
      if (ch.name === '达芙妮' && key === 'def') {
        var unlocked =
          ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
        if (unlocked.indexOf('全副武装') !== -1) base += Math.floor((getDisplayStat(ch, 'str') || 0) * 0.25);
      }
      if (ch.name === '黯') {
        var rawAgi = parseInt(ch.agi, 10) || 0;
        var rawInt = parseInt(ch.int, 10) || 0;
        var bonusAgi = parseInt(ch.bonusAgi, 10) || 0;
        var bonusInt = parseInt(ch.bonusInt, 10) || 0;
        if (key === 'int') base += Math.floor((rawAgi + bonusAgi) * 0.2);
        if (key === 'agi') base += Math.floor((rawInt + bonusInt) * 0.2);
      }
      if (ch.name === '艾丽卡' && (key === 'sta' || key === 'def')) {
        base += Math.floor((getDisplayStat(ch, 'int') || 0) * 0.25);
      }
      if ((key === 'str' || key === 'agi' || key === 'int' || key === 'def') && ch.buffs && ch.buffs.length) {
        for (var i = 0; i < ch.buffs.length; i++) {
          var b = ch.buffs[i];
          var id = (b.id || b.name || '').trim();
          var layers = Math.max(0, parseInt(b.layers, 10) || 0);
          if (id === '攻势' && key === 'str') base += layers * 2;
          if (id === '守势' && key === 'agi') base += layers * 2;
          if (id === '心满意足' && (key === 'str' || key === 'agi')) base += layers * 1;
          if (id === '力量强化' && key === 'str') base += layers * 3;
          if (id === '攻击强化' && key === 'str') base += layers * 3;
          if (id === '敏捷强化' && key === 'agi') base += layers * 3;
          if (id === '智力强化' && key === 'int') base += layers * 3;
          if (id === '防御强化' && key === 'def') base += layers * 3;
        }
      }
      return base;
    }
    /** 达芙妮力量/防御的被动加成（狼族血脉 Lv×2；防御另有全副武装 Str×0.25）；或任意角色力量/敏捷来自【攻势】/【守势】的加成，用于属性行展示 breakdown */
    function getDisplayStatBreakdown(ch, key) {
      var total = getDisplayStat(ch, key);
      if (!ch) return { total: total, base: total, passive: null };
      if (key === 'luk' && hasAliveQingliInParty()) {
        var baseOnly = parseInt(ch[key], 10) || 0;
        if (BONUS_KEYS[key] != null) baseOnly += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
        var passiveVal = 3;
        return {
          total: total,
          base: baseOnly,
          passive: { value: passiveVal, name: '福泽' },
          sourceText: baseOnly + '+' + passiveVal + '（福泽）',
        };
      }
      if (ch.name === '达芙妮' && (key === 'str' || key === 'def')) {
        var baseOnly = parseInt(ch[key], 10) || 0;
        if (BONUS_KEYS[key] != null) baseOnly += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
        var passiveVal = Math.floor((ch.level != null ? ch.level : 1) * 2);
        var passiveName = '狼族血脉';
        if (key === 'def') {
          var unlocked =
            ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
          if (unlocked.indexOf('全副武装') !== -1) {
            var strDisplay = getDisplayStat(ch, 'str') || 0;
            var quanfu = Math.floor(strDisplay * 0.25);
            passiveVal += quanfu;
            passiveName = '狼族血脉 + 全副武装';
          }
        }
        return { total: total, base: baseOnly, passive: { value: passiveVal, name: passiveName } };
      }
      if (ch.name === '黯' && (key === 'int' || key === 'agi')) {
        var baseOnly = parseInt(ch[key], 10) || 0;
        if (BONUS_KEYS[key] != null) baseOnly += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
        var passiveVal =
          key === 'int'
            ? Math.floor(((parseInt(ch.agi, 10) || 0) + (parseInt(ch.bonusAgi, 10) || 0)) * 0.2)
            : Math.floor(((parseInt(ch.int, 10) || 0) + (parseInt(ch.bonusInt, 10) || 0)) * 0.2);
        return { total: total, base: baseOnly, passive: { value: passiveVal, name: '暗黑魔枪术' } };
      }
      if (ch.name === '艾丽卡' && (key === 'sta' || key === 'def')) {
        var baseOnly = parseInt(ch[key], 10) || 0;
        if (BONUS_KEYS[key] != null) baseOnly += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
        var passiveVal = Math.floor((getDisplayStat(ch, 'int') || 0) * 0.25);
        return { total: total, base: baseOnly, passive: { value: passiveVal, name: '神恩之躯' } };
      }
      if ((key === 'str' || key === 'agi' || key === 'int' || key === 'def') && ch.buffs && ch.buffs.length) {
        var baseOnly = parseInt(ch[key], 10) || 0;
        if (BONUS_KEYS[key] != null) baseOnly += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
        var parts = [];
        for (var i = 0; i < ch.buffs.length; i++) {
          var b = ch.buffs[i];
          var id = (b.id || b.name || '').trim();
          var layers = Math.max(0, parseInt(b.layers, 10) || 0);
          if (id === '攻势' && key === 'str' && layers > 0) parts.push({ val: layers * 2, name: '攻势' });
          if (id === '守势' && key === 'agi' && layers > 0) parts.push({ val: layers * 2, name: '守势' });
          if (id === '心满意足' && (key === 'str' || key === 'agi') && layers > 0)
            parts.push({ val: layers * 1, name: '心满意足' });
          if (id === '力量强化' && key === 'str' && layers > 0) parts.push({ val: layers * 3, name: '力量强化' });
          if (id === '攻击强化' && key === 'str' && layers > 0) parts.push({ val: layers * 3, name: '攻击强化' });
          if (id === '敏捷强化' && key === 'agi' && layers > 0) parts.push({ val: layers * 3, name: '敏捷强化' });
          if (id === '智力强化' && key === 'int' && layers > 0) parts.push({ val: layers * 3, name: '智力强化' });
          if (id === '防御强化' && key === 'def' && layers > 0) parts.push({ val: layers * 3, name: '防御强化' });
        }
        if (parts.length > 0) {
          var bonusSum = 0;
          for (var j = 0; j < parts.length; j++) bonusSum += parts[j].val;
          var sourceText =
            baseOnly +
            parts
              .map(function (p) {
                return '+' + p.val + '（' + p.name + '）';
              })
              .join('');
          return {
            total: total,
            base: baseOnly,
            passive: {
              value: bonusSum,
              name: parts
                .map(function (p) {
                  return p.name;
                })
                .join('+'),
            },
            sourceText: sourceText,
          };
        }
      }
      return { total: total, base: total, passive: null };
    }
    var SUMMON_BAIYA =
      window.色色地牢_character && window.色色地牢_character.createSummonBaiya
        ? window.色色地牢_character.createSummonBaiya(getDisplayStat)
        : null;
    function getBaiyaStatsFromOwner(owner) {
      return window.色色地牢_character && window.色色地牢_character.getBaiyaStatsFromOwner
        ? window.色色地牢_character.getBaiyaStatsFromOwner(owner, getDisplayStat)
        : { maxHp: 0, atk: 0, def: 0 };
    }
    /** 技能公式与描述解析：优先使用 backend/skill.js 提供的 API（需在 app 前加载），否则使用占位实现 */
    var skillApi =
      typeof window !== 'undefined' && window.色色地牢_skill && window.色色地牢_skill.create
        ? window.色色地牢_skill.create(getDisplayStat)
        : null;
    if (!skillApi) {
      console.warn('[色色地牢] 未加载 skill.js，技能公式与描述解析将使用占位实现');
      skillApi = {
        getBaseDamageFromResolvedEffect: function () {
          return NaN;
        },
        getBaseDamageForSkill: function () {
          return 0;
        },
        getShieldFromResolvedEffect: function () {
          return NaN;
        },
        getShieldForSkill: function () {
          return NaN;
        },
        getSkillEffectForLevel: function (s, lv) {
          if (!s) return '';
          var l = Math.max(1, parseInt(lv, 10) || 1);
          if (s.effectByLevel && s.effectByLevel.length)
            return s.effectByLevel[Math.min(l, s.effectByLevel.length) - 1] || s.effectByLevel[0];
          return s.effect || '';
        },
        getDisplayStatsForSkill: function () {
          return null;
        },
        resolveSkillEffect: function (e) {
          return e || '';
        },
        resolveSkillEffectWithStats: function (e) {
          return e || '';
        },
        SKILL_CALC_PLACEHOLDER_RE: /(?!)/g,
      };
    }
    var getBaseDamageFromResolvedEffect = skillApi.getBaseDamageFromResolvedEffect;
    var getBaseDamageForSkill = skillApi.getBaseDamageForSkill;
    var getShieldFromResolvedEffect = skillApi.getShieldFromResolvedEffect;
    var getShieldForSkill = skillApi.getShieldForSkill;
    var getSkillEffectForLevel = skillApi.getSkillEffectForLevel;
    var getDisplayStatsForSkill = skillApi.getDisplayStatsForSkill;
    var resolveSkillEffect = skillApi.resolveSkillEffect;
    var resolveSkillEffectWithStats = skillApi.resolveSkillEffectWithStats;
    var SKILL_CALC_PLACEHOLDER_RE = skillApi.SKILL_CALC_PLACEHOLDER_RE;
    /** 初始化战斗界面：重置缓存后交由 battle.js 的 initBattle 完成渲染与绑定 */
    function initBattle() {
      _lastKnownParty = null;
      _lastKnownEnemies = null;
      if (typeof window.BattleGrid !== 'undefined' && window.BattleGrid.initBattle) {
        window.BattleGrid.initBattle({
          getParty: getParty,
          getEnemyParty: getEnemyParty,
          getBattleFloorTitle: function () {
            try {
              if (typeof getVariables === 'function') {
                var cv = getVariables({ type: 'chat' });
                if (cv && cv.battleFloorTitle != null && String(cv.battleFloorTitle).trim() !== '')
                  return String(cv.battleFloorTitle).trim();
              }
            } catch (e) {}
            return '';
          },
          saveBattleData: saveBattleData,
          getDisplayStat: getDisplayStat,
          getHpFromSta: getHpFromSta,
          getApByLevel: getApByLevel,
          getMaxExpForLevel: getMaxExpForLevel,
          getSkillEffectForLevel: getSkillEffectForLevel,
          resolveSkillEffect: resolveSkillEffect,
          getBaseDamageFromResolvedEffect: getBaseDamageFromResolvedEffect,
          getBaseDamageForSkill: getBaseDamageForSkill,
          getShieldFromResolvedEffect: getShieldFromResolvedEffect,
          getShieldForSkill: getShieldForSkill,
          getSpecialSkillsForChar: getSpecialSkillsForChar,
          wrapBuffRefs: wrapBuffRefs,
          SWAP_SVG: SWAP_SVG,
          AP_FLAME_SVG: AP_FLAME_SVG,
          SKILL_ATTACK_SVG: SKILL_ATTACK_SVG,
          SKILL_DEFENSE_SVG: SKILL_DEFENSE_SVG,
          INTENT_CLOTHES_BREAK_SVG: INTENT_CLOTHES_BREAK_SVG,
          INTENT_BIND_CHAIN_SVG: INTENT_BIND_CHAIN_SVG,
          INTENT_LEWD_HEART_SVG: INTENT_LEWD_HEART_SVG,
          SKILL_BAIYA_SVG: SKILL_BAIYA_SVG,
          SKILL_WOLF_PACK_SVG: SKILL_WOLF_PACK_SVG,
          SKILL_ROAR_SVG: SKILL_ROAR_SVG,
          SKILL_EXECUTE_SVG: SKILL_EXECUTE_SVG,
          SKILL_BAIYA_SWEEP_SVG: SKILL_BAIYA_SWEEP_SVG,
          SKILL_WHIRLWIND_SVG: SKILL_WHIRLWIND_SVG,
          SKILL_BLADE_BITE_SVG: SKILL_BLADE_BITE_SVG,
          SKILL_SHIELD_SWORD_SVG: SKILL_SHIELD_SWORD_SVG,
          SKILL_ZANYUE_SVG: SKILL_ZANYUE_SVG,
          SKILL_JIANQIE_SVG: SKILL_JIANQIE_SVG,
          SKILL_JUHE_SVG: SKILL_JUHE_SVG,
          SKILL_NADAO_SVG: SKILL_NADAO_SVG,
          SKILL_CUOJIN_SVG: SKILL_CUOJIN_SVG,
          SKILL_BAIYE_SVG: SKILL_BAIYE_SVG,
          SKILL_ISHAN_SVG: SKILL_ISHAN_SVG,
          SKILL_XINYAN_SVG: SKILL_XINYAN_SVG,
          SKILL_MUPAIZI_SVG: SKILL_MUPAIZI_SVG,
          SKILL_CANYINGBU_SVG: SKILL_CANYINGBU_SVG,
          SKILL_YOULINGWUTA_SVG: SKILL_YOULINGWUTA_SVG,
          SKILL_XUEWUQIANGVEN_SVG: SKILL_XUEWUQIANGVEN_SVG,
          SKILL_ANYEWEIMU_SVG: SKILL_ANYEWEIMU_SVG,
          SKILL_MOLONGWU_SVG: SKILL_MOLONGWU_SVG,
          SKILL_SHENYUANZHONGJIE_SVG: SKILL_SHENYUANZHONGJIE_SVG,
          SKILL_ANSHIZHIREN_SVG: SKILL_ANSHIZHIREN_SVG,
          SKILL_YANMOCHUIXI_SVG: SKILL_YANMOCHUIXI_SVG,
          SKILL_XINLINGQINSHI_SVG: SKILL_XINLINGQINSHI_SVG,
          SKILL_XUWUFANGZHU_SVG: SKILL_XUWUFANGZHU_SVG,
          SKILL_YAOYANYEHUO_SVG: SKILL_YAOYANYEHUO_SVG,
          SKILL_MEIMOZHIWEN_SVG: SKILL_MEIMOZHIWEN_SVG,
          SKILL_LINGHUNSHENGYAN_SVG: SKILL_LINGHUNSHENGYAN_SVG,
          SKILL_JIEHUNZHIHUO_SVG: SKILL_JIEHUNZHIHUO_SVG,
          SKILL_SHENGUANGZHAN_SVG: SKILL_SHENGUANGZHAN_SVG,
          SKILL_QINGSUANZHISHOU_SVG: SKILL_QINGSUANZHISHOU_SVG,
          SKILL_SHENENJISHU_SVG: SKILL_SHENENJISHU_SVG,
          SKILL_ZUIFAXUANGAO_SVG: SKILL_ZUIFAXUANGAO_SVG,
          SKILL_MANGMOUZHIGUANG_SVG: SKILL_MANGMOUZHIGUANG_SVG,
          SKILL_JISHU_SVG: SKILL_JISHU_SVG,
          SKILL_SHENGHUOJINGSHI_SVG: SKILL_SHENGHUOJINGSHI_SVG,
        });
      }
      console.info('[色色地牢] 战斗界面已加载');
    }

    var buffTooltipOpenByClick = false;
    function initBuffTooltip() {
      var popup = document.getElementById('buff-tooltip-popup');
      if (!popup) {
        popup = document.createElement('div');
        popup.id = 'buff-tooltip-popup';
        (document.body || document.documentElement).appendChild(popup);
      }
      function showAt(x, y, buffId) {
        var text = getBuffTooltipText(buffId);
        if (!text) return;
        popup.textContent = text;
        popup.classList.add('show');
        var pad = 12;
        requestAnimationFrame(function () {
          var w = popup.offsetWidth || 200;
          var h = popup.offsetHeight || 60;
          var left = x + pad;
          var top = y + pad;
          if (left + w > window.innerWidth) left = x - w - pad;
          if (top + h > window.innerHeight) top = y - h - pad;
          if (left < pad) left = pad;
          if (top < pad) top = pad;
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
        });
      }
      function showAtForSlotBuff(x, y, buffId, layers) {
        var text =
          typeof window !== 'undefined' &&
          window.BattleGrid &&
          typeof window.BattleGrid.getBuffEffectTooltip === 'function'
            ? window.BattleGrid.getBuffEffectTooltip(buffId, layers)
            : getBuffTooltipText(buffId) || '';
        if (!text) return;
        popup.textContent = text;
        popup.classList.add('show');
        var pad = 12;
        requestAnimationFrame(function () {
          var w = popup.offsetWidth || 200;
          var h = popup.offsetHeight || 60;
          var left = x + pad;
          var top = y + pad;
          if (left + w > window.innerWidth) left = x - w - pad;
          if (top + h > window.innerHeight) top = y - h - pad;
          if (left < pad) left = pad;
          if (top < pad) top = pad;
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
        });
      }
      function showCalcAt(x, y, formula) {
        if (!formula) return;
        popup.textContent = formula;
        popup.classList.add('show');
        var pad = 12;
        requestAnimationFrame(function () {
          var w = popup.offsetWidth || 200;
          var h = popup.offsetHeight || 60;
          var left = x + pad;
          var top = y + pad;
          if (left + w > window.innerWidth) left = x - w - pad;
          if (top + h > window.innerHeight) top = y - h - pad;
          if (left < pad) left = pad;
          if (top < pad) top = pad;
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
        });
      }
      function showDataReportBreakdownAt(x, y, sourceText) {
        if (!sourceText) return;
        popup.innerHTML = sourceText;
        popup.classList.add('show');
        var pad = 12;
        requestAnimationFrame(function () {
          var w = popup.offsetWidth || 200;
          var h = popup.offsetHeight || 60;
          var left = x + pad;
          var top = y + pad;
          if (left + w > window.innerWidth) left = x - w - pad;
          if (top + h > window.innerHeight) top = y - h - pad;
          if (left < pad) left = pad;
          if (top < pad) top = pad;
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
        });
      }
      function showAttrBreakdownAt(x, y, el) {
        if (!el) return;
        var sourceText = el.getAttribute('data-source');
        if (sourceText != null && sourceText !== '') {
          popup.textContent = sourceText;
          popup.classList.add('show');
          var pad = 12;
          requestAnimationFrame(function () {
            var w = popup.offsetWidth || 200;
            var h = popup.offsetHeight || 60;
            var left = x + pad;
            var top = y + pad;
            if (left + w > window.innerWidth) left = x - w - pad;
            if (top + h > window.innerHeight) top = y - h - pad;
            if (left < pad) left = pad;
            if (top < pad) top = pad;
            popup.style.left = left + 'px';
            popup.style.top = top + 'px';
          });
          return;
        }
        var base = el.getAttribute('data-base');
        var bonus = el.getAttribute('data-bonus');
        var name = el.getAttribute('data-bonus-name');
        if (base == null && bonus == null) return;
        var baseNum = parseInt(base, 10) || 0;
        var bonusNum = parseInt(bonus, 10) || 0;
        var numEl = el.querySelector('.attr-val-number');
        var displayed = numEl ? parseInt(numEl.textContent, 10) || 0 : baseNum + bonusNum;
        var delta = displayed - baseNum - bonusNum;
        var baseDisplay = baseNum + delta;
        var text = baseDisplay + (bonus != null && bonus !== '' ? '+' + bonus + (name ? '（' + name + '）' : '') : '');
        popup.textContent = text;
        popup.classList.add('show');
        var pad = 12;
        requestAnimationFrame(function () {
          var w = popup.offsetWidth || 200;
          var h = popup.offsetHeight || 60;
          var left = x + pad;
          var top = y + pad;
          if (left + w > window.innerWidth) left = x - w - pad;
          if (top + h > window.innerHeight) top = y - h - pad;
          if (left < pad) left = pad;
          if (top < pad) top = pad;
          popup.style.left = left + 'px';
          popup.style.top = top + 'px';
        });
      }
      function hide() {
        popup.classList.remove('show');
      }
      if (typeof $ !== 'undefined') {
        $(document).on('mouseenter', '.buff-ref', function (e) {
          if (!buffTooltipOpenByClick) {
            var id = e.target.getAttribute('data-buff-id');
            if (id) showAt(e.clientX, e.clientY, id);
          }
        });
        $(document).on('mouseleave', '.buff-ref', function () {
          if (!buffTooltipOpenByClick) hide();
        });
        $(document).on('click', '.buff-ref', function (e) {
          e.preventDefault();
          var id = e.target.getAttribute('data-buff-id');
          if (id) {
            buffTooltipOpenByClick = true;
            showAt(e.clientX, e.clientY, id);
          }
        });
        $(document).on('mouseenter', '.slot-buff-pill', function (e) {
          if (!buffTooltipOpenByClick) {
            var id = e.currentTarget.getAttribute('data-buff-id');
            var layers = e.currentTarget.getAttribute('data-buff-layers');
            if (id) showAtForSlotBuff(e.clientX, e.clientY, id, layers);
          }
        });
        $(document).on('mouseleave', '.slot-buff-pill', function () {
          if (!buffTooltipOpenByClick) hide();
        });
        $(document).on('click', '.slot-buff-pill', function (e) {
          e.preventDefault();
          var id = e.currentTarget.getAttribute('data-buff-id');
          var layers = e.currentTarget.getAttribute('data-buff-layers');
          if (id) {
            buffTooltipOpenByClick = true;
            showAtForSlotBuff(e.clientX, e.clientY, id, layers);
          }
        });
        $(document).on('mouseenter', '.skill-calc', function (e) {
          if (!buffTooltipOpenByClick) {
            var formula = e.target.getAttribute('data-formula');
            var value = e.target.getAttribute('data-value');
            if (formula != null) showCalcAt(e.clientX, e.clientY, formula);
          }
        });
        $(document).on('mouseleave', '.skill-calc', function () {
          if (!buffTooltipOpenByClick) hide();
        });
        $(document).on('click', '.skill-calc', function (e) {
          e.preventDefault();
          var formula = e.target.getAttribute('data-formula');
          var value = e.target.getAttribute('data-value');
          if (formula != null) {
            buffTooltipOpenByClick = true;
            showCalcAt(e.clientX, e.clientY, formula || '');
          }
        });
        $(document).on('mouseenter', '.attr-val-breakdown', function (e) {
          if (!buffTooltipOpenByClick) {
            var el = e.target.closest('.attr-val-breakdown');
            if (el) showAttrBreakdownAt(e.clientX, e.clientY, el);
          }
        });
        $(document).on('mouseleave', '.attr-val-breakdown', function () {
          if (!buffTooltipOpenByClick) hide();
        });
        $(document).on('click', '.attr-val-breakdown', function (e) {
          e.preventDefault();
          var el = e.target.closest('.attr-val-breakdown');
          if (el) {
            buffTooltipOpenByClick = true;
            showAttrBreakdownAt(e.clientX, e.clientY, el);
          }
        });
        $(document).on('mouseenter', '.data-report-value-breakdown', function (e) {
          if (!buffTooltipOpenByClick) {
            var el = e.target.closest('.data-report-value-breakdown');
            if (el) {
              var src = el.getAttribute('data-source');
              if (src) showDataReportBreakdownAt(e.clientX, e.clientY, src);
            }
          }
        });
        $(document).on('mouseleave', '.data-report-value-breakdown', function () {
          if (!buffTooltipOpenByClick) hide();
        });
        $(document).on('click', '.data-report-value-breakdown', function (e) {
          e.preventDefault();
          var el = e.target.closest('.data-report-value-breakdown');
          if (el) {
            var src = el.getAttribute('data-source');
            if (src) {
              buffTooltipOpenByClick = true;
              showDataReportBreakdownAt(e.clientX, e.clientY, src);
            }
          }
        });
        $(document).on('click', function (e) {
          if (
            buffTooltipOpenByClick &&
            !e.target.closest('.buff-ref') &&
            !e.target.closest('.slot-buff-pill') &&
            !e.target.closest('.skill-calc') &&
            !e.target.closest('.attr-val-breakdown') &&
            !e.target.closest('.data-report-value-breakdown') &&
            !e.target.closest('#buff-tooltip-popup')
          ) {
            buffTooltipOpenByClick = false;
            hide();
          }
        });
      }
    }

    injectStyles();
    if (typeof window !== 'undefined') {
      window.beginingOptionChosen = function (optionId) {
        if (optionId === 'continue-game' && window.色色地牢_save) {
          var api = window.色色地牢_save;
          var payload =
            typeof api.readAutoSnapshotPayload === 'function' ? api.readAutoSnapshotPayload() : null;
          if (payload) {
            snapshotTimeline.length = 0;
            applySavePayload(payload);
          } else {
            console.warn('[色色地牢][继续游戏] 未找到自动快照，已取消继续');
          }
        } else if (optionId === 'test-mode') {
          // 测试模式：加载默认队伍顺序 + 默认地图（不走新游戏四步）
          snapshotTimeline.length = 0;
          var portraits = window.CHARACTER_PORTRAITS || {};
          var party = buildDefaultParty();
          // 给默认队伍补 avatar（buildDefaultParty 里已经做，但这里防守）
          try {
            for (var pi = 0; pi < party.length; pi++) {
              if (party[pi] && !party[pi].avatar) party[pi].avatar = portraits[party[pi].name] || '';
            }
          } catch (eAv) {}
          var emptyEnemyParty = [null, null, null, null, null, null];
          var initialMap = {
            area: '地牢',
            pos: '0-0',
            nodes: DEFAULT_MAP_NODES.slice(),
            inv: [],
          };
          try {
            _lastKnownMap = JSON.parse(JSON.stringify(initialMap));
          } catch (eMapT) {
            _lastKnownMap = { area: initialMap.area, pos: initialMap.pos, nodes: initialMap.nodes.slice(), inv: [] };
          }
          var v = null;
          try {
            if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
          } catch (eV) {}
          if (!v) v = {};
          v.party = party;
          v.enemyParty = emptyEnemyParty;
          v.battleFloorTitle = '';
          v.map = initialMap;
          if (!v.buffDefinitions || !Array.isArray(v.buffDefinitions) || v.buffDefinitions.length === 0)
            v.buffDefinitions = BUFF_DEFINITIONS;
          if (!v.nodeStates || typeof v.nodeStates !== 'object') v.nodeStates = {};
          // 测试模式默认金币
          if (v.gold == null || v.gold === '') v.gold = 100;
          _lastKnownChatGold = parseInt(v.gold, 10) || 0;
          mergePreserveChatGold(v);
          if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
          _lastKnownParty = party;
          _lastKnownEnemies = emptyEnemyParty;
          if (typeof window.BattleGrid !== 'undefined' && typeof window.BattleGrid.setBattleLog === 'function')
            window.BattleGrid.setBattleLog([]);
          if (window.色色地牢_save && typeof window.色色地牢_save.writeAutoSnapshot === 'function') {
            var payload0 = getCurrentGameState();
            window.色色地牢_save.writeAutoSnapshot(payload0, {
              mapPos: '0-0',
              areaName: initialMap.area,
              trigger: 'test_mode',
            });
            logGamePayloadDetail('快照', '测试模式：已写入自动快照（0-0）', payload0);
          }
          if (typeof window.BattleGrid !== 'undefined' && typeof window.BattleGrid.refreshBattleView === 'function')
            window.BattleGrid.refreshBattleView();
          if (typeof window.色色地牢_refreshMap === 'function') window.色色地牢_refreshMap({});
          updateDungeonFloorHUD();
        }
      };
      window.beginingLoadSaveSlot = function (index) {
        if (window.色色地牢_save) {
          var payload = window.色色地牢_save.loadSlot(index);
          if (payload) {
            snapshotTimeline.length = 0;
            applySavePayload(payload);
          }
        }
      };
      /** 将角色重置为 README「角色初始状态」：Lv1、exp 0、自由点 0、无 buff/特殊技能解锁、可升级技能一级且无进阶、locked 与模板一致 */
      function applyNewGameDefaultCharacterState(ch, template) {
        if (!ch || !template) return;
        ch.level = 1;
        ch.exp = 0;
        ch.skillPointsSpent = 0;
        ['bonusStr', 'bonusAgi', 'bonusInt', 'bonusSta', 'bonusDef', 'bonusLuk', 'bonusCha'].forEach(function (k) {
          if (Object.prototype.hasOwnProperty.call(ch, k)) ch[k] = 0;
        });
        ch.buffs = [];
        ch.semenVolumeMl = 0;
        ch.specialSkillsUnlocked = [];
        var tsks = template.skills;
        var sks = ch.skills;
        if (!Array.isArray(tsks) || !Array.isArray(sks)) return;
        var n = Math.min(tsks.length, sks.length);
        for (var si = 0; si < n; si++) {
          var ts = tsks[si];
          var cs = sks[si];
          if (!cs || !ts) continue;
          if (Object.prototype.hasOwnProperty.call(ts, 'level')) cs.level = 1;
          delete cs.advancement;
          /* 与模板一致：仅当模板显式 locked:true 时为锁定；避免 hasOwnProperty/delete 在部分环境下与克隆对象不一致 */
          cs.locked = ts.locked === true;
        }
        // 关键：截断多余技能（旧存档/旧对象可能带多出来的技能，导致“莫名其妙的技能”残留）
        if (Array.isArray(ch.skills) && ch.skills.length > tsks.length) ch.skills = ch.skills.slice(0, tsks.length);
      }
      /** 新游戏 4 步选完后点击「开始冒险」：将所选两名角色写入 autosave 并替换当前角色槽，保存难度与初始祝福到 autosave，应用祝福效果 */
      window.beginingNewGameStart = function (selections) {
        if (!selections || !Array.isArray(selections.characters) || selections.characters.length < 2) return;
        snapshotTimeline.length = 0;
        var chars = window.CHARACTERS;
        var portraits = window.CHARACTER_PORTRAITS || {};
        var party = [null, null, null, null, null, null];
        for (var i = 0; i < 2 && i < selections.characters.length; i++) {
          var name_ = selections.characters[i];
          if (chars && chars[name_]) {
            var ch = JSON.parse(JSON.stringify(chars[name_]));
            ch.avatar = portraits[ch.name] || '';
            applyNewGameDefaultCharacterState(ch, chars[name_]);
            party[i] = ch;
          }
        }
        var blessing = selections.blessing;
        if (blessing === '随机一名角色提升2级' && (party[0] || party[1])) {
          var idx = party[0] && party[1] ? Math.floor(Math.random() * 2) : party[0] ? 0 : 1;
          var lv = Math.max(1, (parseInt(party[idx].level, 10) || 1) + 2);
          party[idx].level = lv;
        }
        if (blessing === '获得随机第三名队员' && chars) {
          var otherNames = Object.keys(chars).filter(function (n) {
            return selections.characters.indexOf(n) === -1;
          });
          if (otherNames.length > 0) {
            var thirdName = otherNames[Math.floor(Math.random() * otherNames.length)];
            var third = JSON.parse(JSON.stringify(chars[thirdName]));
            third.avatar = portraits[third.name] || '';
            applyNewGameDefaultCharacterState(third, chars[thirdName]);
            party[2] = third;
          }
        }
        var areaName =
          selections.customArea && selections.customArea.id ? selections.customArea.id : selections.area || '地牢';
        if (areaName === '随机') {
          var areas = ['艾尔瑟斯森林', '格里莫瓦王国旧都', '拉文斯庄园', '地狱边缘'];
          areaName = areas[Math.floor(Math.random() * areas.length)];
        }
        var inv = [];
        if (blessing === '获得一件随机遗物') {
          var relics = [
            { type: '遗物', name: '神秘馈赠', effect: '来自初始祝福的馈赠' },
            { type: '遗物', name: '幸运护符', effect: '携带者获得微量幸运' },
            { type: '遗物', name: '旅行者之证', effect: '记录冒险的起点' },
            { type: '遗物', name: '星辰碎片', effect: '蕴含未知力量' },
          ];
          inv.push(relics[Math.floor(Math.random() * relics.length)]);
        }
        var mapRng = createNewGameMapRng(areaName, selections);
        var genMap = generateProceduralMapNodes(mapRng);
        var initialMap = {
          area: areaName,
          pos: '0-0',
          nodes: genMap.nodes,
          inv: inv,
        };
        if (genMap.revealOrder) initialMap.revealOrder = genMap.revealOrder;
        try {
          _lastKnownMap = JSON.parse(JSON.stringify(initialMap));
        } catch (eMap) {
          _lastKnownMap = {
            area: initialMap.area,
            pos: initialMap.pos,
            nodes: initialMap.nodes.slice(),
            inv: inv.slice(),
            revealOrder: initialMap.revealOrder ? initialMap.revealOrder.slice() : undefined,
          };
        }
        var emptyEnemyParty = [null, null, null, null, null, null];
        /** 开局基础 100 金；若赐福选「获得200金币」则再 +200 */
        var gold = 100 + (blessing === '获得200金币' ? 200 : 0);
        var v = null;
        try {
          if (typeof getVariables === 'function') v = getVariables({ type: 'chat' });
        } catch (e) {}
        if (!v) v = {};
        v.party = party;
        v.enemyParty = emptyEnemyParty;
        v.battleFloorTitle = '';
        v.map = initialMap;
        v.buffDefinitions = BUFF_DEFINITIONS;
        v.nodeStates = {};
        v.difficulty = selections.difficulty != null ? selections.difficulty : null;
        v.diffUid = selections.diffUid != null ? selections.diffUid : null;
        v.gold = gold;
        _lastKnownChatGold = gold;
        if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
        if (typeof updateSidebarGoldHUD === 'function') updateSidebarGoldHUD(gold);
        /* 必须与 saveBattleData 类似地立即写入内存缓存：若此处清空缓存，getParty() 会马上 getVariables；
         * 酒馆侧有时在 replaceVariables 后尚未返回新 party，会回退 defaultParty（岚/暗/夜露/艾丽卡）。 */
        if (
          typeof window !== 'undefined' &&
          window.BattleGrid &&
          typeof window.BattleGrid.capUnitBuffs === 'function'
        ) {
          party.forEach(function (ch) {
            if (ch) window.BattleGrid.capUnitBuffs(ch);
          });
        }
        _lastKnownParty = party;
        _lastKnownEnemies = emptyEnemyParty;
        if (typeof window.BattleGrid !== 'undefined' && typeof window.BattleGrid.setBattleLog === 'function')
          window.BattleGrid.setBattleLog([]);
        // 开局 0-0：不写入“普通存档槽位”，而是写入自动快照（蓝色槽），供「继续游戏」直接读取。
        try {
          if (window.色色地牢_save && typeof window.色色地牢_save.writeAutoSnapshot === 'function') {
            var payload0 = getCurrentGameState();
            window.色色地牢_save.writeAutoSnapshot(payload0, {
              mapPos: '0-0',
              areaName: areaName,
              trigger: 'new_game_start',
            });
            logGamePayloadDetail('快照', '开局自动快照（0-0）→ 已覆盖「蓝色快照」', payload0);
          }
        } catch (eSnap0) {
          console.warn('[色色地牢][快照] 开局自动快照写入失败', eSnap0);
        }
        if (typeof window.BattleGrid !== 'undefined' && typeof window.BattleGrid.refreshBattleView === 'function')
          window.BattleGrid.refreshBattleView();
        if (typeof window.色色地牢_showMapDrawer === 'function') window.色色地牢_showMapDrawer({ animateGen: true });
      };
    }
    if (typeof $ !== 'undefined')
      $(function () {
        initBattle();
        initSidebar();
        initBuffTooltip();
        initNormalBattleGenerateErrorUI();
      });
    else
      document.addEventListener('DOMContentLoaded', function () {
        initBattle();
        initSidebar();
        initBuffTooltip();
        initNormalBattleGenerateErrorUI();
      });
  }
  if (typeof window !== 'undefined' && !window.色色地牢_skill) {
    var script = document.createElement('script');
    script.src =
      document.currentScript && document.currentScript.src
        ? new URL('skill.js', document.currentScript.src).href
        : 'skill.js';
    script.onload = runApp;
    script.onerror = function () {
      console.warn('[色色地牢] 无法加载 skill.js，将使用占位实现');
      runApp();
    };
    document.head.appendChild(script);
  } else {
    runApp();
  }
})();
