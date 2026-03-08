/**
 * 色色地牢 - 界面入口（样式 + 侧边栏 + 战斗，合一文件）
 */
(function () {
  var CSS = [
    '*{box-sizing:border-box}',
    ':root{--ornate-dark:#3d2b1f;--ornate-gold:#c9a227;--ornate-gold-rgb:201,162,39;--ap-glow:#d2691e;--ap-orange:#e65100;--hp-red:#b32424;--gold-border:#8b7320}',
    'html,body{margin:0;padding:0;height:100%;overflow:hidden;font-family:sans-serif;font-size:14px;color:#3d3529;background:#2a1f15}',
    '.game-frame.ornate-frame{position:relative;display:flex;flex-direction:column;height:100vh;margin:0;background:linear-gradient(135deg,#4a3728 0%,#2d1f14 50%,#4a3728 100%);border:3px solid var(--ornate-dark);box-shadow:0 0 0 1px var(--ornate-gold),0 0 0 4px var(--ornate-dark),0 0 0 5px var(--ornate-gold),0 0 20px rgba(0,0,0,.7),inset 0 0 40px rgba(0,0,0,.4);padding:18px;overflow:hidden}',
    '.game-frame.ornate-frame::before{content:"";position:absolute;top:8px;left:8px;right:8px;bottom:8px;border:1px solid rgba(201,162,39,.25);pointer-events:none}',
    '.corner-ornament{position:absolute;width:50px;height:50px;pointer-events:none;z-index:10}.corner-ornament svg{width:100%;height:100%;fill:var(--ornate-gold);filter:drop-shadow(0 0 2px rgba(201,162,39,.4))}.corner-tl{top:-3px;left:-3px}.corner-tr{top:-3px;right:-3px;transform:scaleX(-1)}.corner-bl{bottom:-3px;left:-3px;transform:scaleY(-1)}.corner-br{bottom:-3px;right:-3px;transform:scale(-1,-1)}',
    '.edge-decoration{position:absolute;background:linear-gradient(90deg,transparent,var(--ornate-gold),transparent);height:1px;pointer-events:none}.edge-top{top:15px;left:55px;right:55px}.edge-bottom{bottom:15px;left:55px;right:55px}.edge-decoration.vertical{width:1px;height:auto;background:linear-gradient(180deg,transparent,var(--ornate-gold),transparent)}.edge-left{left:15px;top:55px;bottom:55px}.edge-right{right:15px;top:55px;bottom:55px}',
    '.game-inner{display:flex;flex:1;min-height:0;min-width:0;background:#e4d5b7;background-image:url("https://www.transparenttextures.com/patterns/paper-fibers.png")}',
    '.sidebar{position:relative;width:100px;min-width:100px;background:transparent;border:none;border-right:2px solid var(--ornate-dark);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:12px 0}',
    '.sidebar-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px;align-items:center}',
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
    '.skill-popup{position:fixed;z-index:2000;background:#1a150e;color:#e4d5b7;border:2px solid var(--gold-border);border-radius:10px;padding:6px 0;min-width:200px;max-width:320px;max-height:calc(100vh - 16px);overflow-y:auto;overflow-x:hidden;box-shadow:0 6px 24px rgba(0,0,0,.45);display:none}.skill-popup.show{display:block}.skill-popup-title{padding:8px 14px 6px;font-size:12px;font-weight:bold;color:var(--ornate-gold);border-bottom:1px solid rgba(139,115,32,.4);margin-bottom:4px}.skill-popup-opt{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;cursor:pointer;font-size:14px;transition:background .15s}.skill-popup-opt:hover{background:rgba(201,162,39,.15)}.skill-popup-opt svg{width:18px;height:18px;flex-shrink:0;stroke:currentColor}.skill-popup-opt-main{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.skill-popup-opt-head{display:flex;align-items:center;min-width:0}.skill-popup-opt-ap{margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:bold;color:var(--ap-orange);flex-shrink:0}.skill-popup-opt-ap svg{width:14px;height:14px;stroke:currentColor}.skill-popup-opt-desc{font-size:11px;color:#9a8b72;line-height:1.3;white-space:pre-line}.skill-popup-opt{position:relative}.skill-popup-opt-disabled{pointer-events:none;cursor:not-allowed}.skill-popup-opt-disabled::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.5);border-radius:4px}',
    '.view-container{display:flex;flex:1;flex-direction:column;min-height:0;min-width:0;overflow:hidden;position:relative}',
    '.view-battle{display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden;position:relative;z-index:0}',
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
    '.bag-wrapper{height:100%;display:flex;flex-direction:column;overflow:hidden}',
    '.bag-header{font-size:26px;font-weight:bold;border-bottom:3px solid var(--gold-border);padding:25px 35px 15px;flex-shrink:0;color:#4a3c1a;display:flex;align-items:center;gap:10px}.bag-header-icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}.bag-header-icon svg{width:28px;height:28px;stroke:currentColor}',
    '.bag-list{flex:1;padding:15px 35px 35px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;-webkit-overflow-scrolling:touch}',
    '.bag-list::-webkit-scrollbar{width:8px}.bag-list::-webkit-scrollbar-track{background:rgba(0,0,0,.05);border-radius:4px}.bag-list::-webkit-scrollbar-thumb{background:var(--gold-border);border-radius:4px}.bag-list::-webkit-scrollbar-thumb:hover{background:#a68b2a}',
    '.bag-row{background:rgba(255,255,255,.6);border:1px solid var(--gold-border);padding:15px 25px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-size:16px;flex-shrink:0}.bag-row .bag-row-type{background:#8b7320;color:#fff;padding:4px 12px;border-radius:6px;font-size:13px}',
    '.map-wrapper{flex:1;min-height:0;display:flex;flex-direction:column;padding:15px 0}',
    '.map-header{font-size:24px;font-weight:bold;margin-bottom:20px;text-align:center;color:#4a3c1a;letter-spacing:4px;flex-shrink:0}',
    '.map-grid-16{display:grid;grid-template-columns:repeat(16,1fr);grid-template-rows:repeat(3,120px);gap:12px;align-items:center;flex:1;min-height:0;overflow-y:auto}',
    '.map-grid-16::-webkit-scrollbar{width:8px}.map-grid-16::-webkit-scrollbar-track{background:rgba(0,0,0,.05);border-radius:4px}.map-grid-16::-webkit-scrollbar-thumb{background:var(--gold-border);border-radius:4px}.map-grid-16::-webkit-scrollbar-thumb:hover{background:#a68b2a}',
    '.node-circle{width:100%;max-width:58px;aspect-ratio:1;margin:0 auto;border:3px solid #1a150e;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.4);cursor:pointer;transition:transform .2s,background .2s;position:relative;font-size:20px}',
    '.node-circle:hover{transform:scale(1.12);background:#fff;z-index:5}.node-circle.current{background:#1a150e!important;color:#fff!important;transform:scale(1.2);box-shadow:0 0 20px var(--ap-glow)}.node-circle.reachable{border-color:var(--ap-glow);border-width:4px;animation:nodePulse 2s infinite}.node-circle.passed{opacity:.35;filter:grayscale(.8);cursor:not-allowed;pointer-events:none}.node-circle.future{cursor:not-allowed;pointer-events:none}',
    '.node-circle-icon{display:flex;align-items:center;justify-content:center;width:28px;height:28px;flex-shrink:0}.node-circle-icon svg{width:100%;height:100%;stroke:currentColor}',
    '.node-type-label{position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-size:10px;white-space:nowrap;color:#5c4d10;font-weight:bold}',
    '.map-legend{display:flex;gap:16px;justify-content:center;padding:12px;background:rgba(0,0,0,.05);border-radius:10px;margin-top:28px;flex-shrink:0;flex-wrap:wrap}',
    '.legend-item{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:bold;color:#4a3c1a}.legend-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;flex-shrink:0}.legend-icon svg{width:100%;height:100%;stroke:currentColor}',
    '@keyframes nodePulse{0%{box-shadow:0 0 0 0 rgba(210,105,30,.5)}70%{box-shadow:0 0 0 10px rgba(210,105,30,0)}100%{box-shadow:0 0 0 0 rgba(210,105,30,0)}}',
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
    '.char-detail-grid .skill-desc{font-size:11px;color:#555;line-height:1.35;white-space:pre-line}.char-detail-grid .skill-desc-advancement{font-size:11px;color:#555;line-height:1.35;margin-top:4px;white-space:pre-line}.buff-ref{color:#1e88e5;cursor:pointer;text-decoration:none}.skill-calc{font-weight:bold;cursor:help;border-bottom:1px dotted currentColor}.skill-calc-str{color:var(--hp-red)}.skill-calc-agi{color:#2e7d32}.skill-calc-int{color:#1565c0}.skill-calc-sta{color:#e65100}.skill-calc-def{color:#5d4037}.skill-calc-level{color:#6a1b9a}.skill-calc-atk{color:#c62828}.skill-calc-纳刀伤害{color:#5d4037}.skill-calc-白夜即死{color:#9c27b0}.skill-calc-心眼闪避{color:#2e7d32}.skill-calc-心眼暴击{color:#c62828}#buff-tooltip-popup{position:fixed;z-index:2147483647;display:none;max-width:280px;padding:8px 12px;font-size:12px;line-height:1.4;color:#1a150e;background:#f5f0e1;border:1px solid var(--gold-border);border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.2);pointer-events:none}#buff-tooltip-popup.show{display:block}#buff-tooltip-popup .report-attr-name{display:inline}#buff-tooltip-popup .report-attr-icon{display:inline-flex;align-items:center;vertical-align:middle;margin-left:2px}#buff-tooltip-popup .report-attr-icon .attr-icon-svg{width:14px;height:14px}.char-detail-grid .passive-skills-section,.char-detail-grid .basic-skills-section,.char-detail-grid .active-skills-section{display:flex;flex-direction:column;gap:10px}.char-detail-grid .passive-skills-section{margin-bottom:12px}.char-detail-grid .basic-skills-section{margin-bottom:12px}.char-detail-grid .active-skills-section{margin-bottom:8px}.char-detail-grid .skill-subtitle{font-size:11px;font-weight:bold;color:#5c4d10;margin-bottom:6px;padding-bottom:2px;border-bottom:1px solid rgba(139,115,32,.2)}.char-detail-grid .special-skill-open-btn{padding:4px 10px;border:2px solid var(--gold-border);border-radius:6px;background:#1a150e;color:var(--ornate-gold);font-size:12px;font-weight:bold;cursor:pointer;margin-right:8px}.char-detail-grid .special-skill-open-btn:hover{background:rgba(201,162,39,.2)}.char-detail-grid .special-skills-section{margin-top:14px;padding-top:10px;border-top:1px solid rgba(139,115,32,.25)}.special-skill-popup{position:fixed;inset:0;z-index:40;display:none;align-items:center;justify-content:center;pointer-events:none}.special-skill-popup.show{display:flex;pointer-events:auto}.special-skill-popup-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4)}.special-skill-popup-panel{position:relative;z-index:1;background:#1a150e;color:#e4d5b7;border:2px solid var(--gold-border);border-radius:12px;padding:0;min-width:300px;max-width:90vw;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.5)}.special-skill-popup-title{padding:14px 44px 12px 16px;font-size:16px;font-weight:bold;color:var(--ornate-gold);border-bottom:1px solid rgba(139,115,32,.4)}.special-skill-popup-close{position:absolute;top:10px;right:10px;width:28px;height:28px;padding:0;border:none;border-radius:6px;background:transparent;color:#8b7355;cursor:pointer;display:flex;align-items:center;justify-content:center}.special-skill-popup-close:hover{background:rgba(139,115,32,.25);color:#e4d5b7}.special-skill-popup-body{padding:16px;overflow-y:auto;flex:1;min-height:0}.special-skill-opt{background:rgba(255,255,255,.06);border:1px solid rgba(139,115,32,.35);border-radius:8px;padding:12px 14px;margin-bottom:10px;display:flex;flex-direction:column;gap:6px}.special-skill-opt-name{font-weight:bold;color:var(--ornate-gold)}.special-skill-opt-effect{font-size:12px;color:#c4b8a8;line-height:1.4}.special-skill-opt-unlock{align-self:flex-start;padding:6px 12px;border:2px solid var(--gold-border);border-radius:6px;background:rgba(201,162,39,.15);color:var(--ornate-gold);font-size:12px;cursor:pointer}.special-skill-opt-unlock:hover{background:rgba(201,162,39,.3)}.special-skill-opt-unlock:disabled{opacity:.5;cursor:not-allowed}.char-detail-grid .skill-card-passive .skill-name .skill-passive-tag{font-size:10px;color:#7a6b5c;font-weight:normal;margin-left:0}.char-detail-grid .skill-tags{font-size:10px;color:#7a6b5c;margin-bottom:4px;padding-bottom:2px}',
    '.char-detail-grid .relic-slots{display:flex;flex-direction:column;gap:8px}',
    '.char-detail-grid .relic-card{background:linear-gradient(135deg,#fff,#fdf5e6);border:2px solid var(--gold-border);padding:10px;border-radius:6px}',
    '.char-detail-grid .relic-name{font-weight:bold;font-size:13px;color:#8b4513;margin-bottom:4px}.char-detail-grid .relic-effect{font-size:11px;color:#555}',
    '.char-detail-grid .detail-block-buff{flex:1;display:flex;flex-direction:column;min-height:0}.char-detail-grid .detail-block-buff .block-title{position:relative;padding-right:36px}.char-detail-grid .detail-buff-swap-btn{position:absolute;top:0;right:0;width:26px;height:26px;padding:0;border:2px solid var(--gold-border);border-radius:50%;background:rgba(255,255,255,.92);color:#6b5a3d;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}.char-detail-grid .detail-buff-swap-btn:hover{background:#fff;border-color:var(--ornate-gold)}.char-detail-grid .detail-buff-swap-btn svg{width:14px;height:14px;fill:currentColor}.char-detail-grid .buff-panel-body{flex:1;min-height:0;display:flex;flex-direction:column}.char-detail-grid .detail-block-buff.show-data-report .buff-container{display:none}.char-detail-grid .data-report-container{display:none;flex:1;min-height:120px;background:rgba(0,0,0,.03);border:1px solid var(--gold-border);padding:10px;border-radius:8px;flex-direction:column;gap:4px;overflow-y:auto;font-size:12px}.char-detail-grid .detail-block-buff.show-data-report .data-report-container{display:flex}.char-detail-grid .data-report-row{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:rgba(255,255,255,.5);border-radius:4px}.char-detail-grid .data-report-label{color:#5c4a3a;font-weight:bold}.char-detail-grid .data-report-value{color:#1a150e}.char-detail-grid .data-report-value-breakdown{cursor:help;text-decoration:underline;color:#1a150e}.char-detail-grid .buff-container{flex:1;min-height:120px;background:rgba(0,0,0,.03);border:1px solid var(--gold-border);padding:10px;border-radius:8px;display:flex;flex-direction:column;gap:6px;overflow-y:auto}',
    '.char-detail-grid .buff-item{background:linear-gradient(to right,#fff,#fafaf5);border-left:4px solid #2d5a27;padding:6px 10px;border-radius:0 6px 6px 0;font-size:11px}.char-detail-grid .buff-container .slot-char-buffs{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start}.char-detail-grid .buff-container .slot-buff-pill{border-radius:6px;border:1.5px dashed;padding:4px 8px;font-size:11px;font-weight:bold;color:#1a150e;display:inline-flex;align-items:center;gap:6px;flex-shrink:0;cursor:help}.char-detail-grid .buff-container .slot-buff-layers{flex-shrink:0}.char-detail-grid .buff-container .slot-buff-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.char-detail-grid .buff-name{font-weight:bold;color:#2d5a27;margin-bottom:2px}',
    '@media (max-width:640px){.game-frame.ornate-frame{margin:6px;padding:8px}.game-inner{flex-direction:column}.sidebar{width:100%;min-width:unset;flex-direction:row;justify-content:center;border:none;border-right:none;border-bottom:2px solid var(--ornate-dark)}.sidebar-list{flex-direction:row;gap:10px}.sidebar-btn{width:56px;height:56px;border-radius:10px}.sidebar-btn-icon svg{width:22px;height:22px}.sidebar-btn-label{font-size:10px}.character-avatars{width:56px;gap:10px}.character-avatar-slot{width:56px;height:56px;flex:0 0 56px;border-radius:10px}.misc-panel-inner{min-width:56px}.misc-sub-btn{width:56px}.battle-area{flex-direction:column}.side{max-width:none}.slots-grid{min-height:100px}.slot{min-height:60px;font-size:12px}.corner-ornament{width:28px;height:28px}.edge-top,.edge-bottom{left:32px;right:32px}.edge-left,.edge-right{top:32px;bottom:32px}.view-story{padding:12px}.story-box{min-height:300px}.view-settings{padding:12px}.settings-box{min-height:300px}.story-side-btn{height:28px;padding:0 8px;font-size:10px}}',
    '@media (max-width:640px){.character-detail-drawer{width:min(95%,100%)}.char-detail-grid{grid-template-columns:1fr;grid-template-rows:auto;padding:12px;gap:12px}.char-detail-grid .col-base{grid-row:auto}.char-detail-grid .detail-block-attr,.char-detail-grid .detail-block-relic,.char-detail-grid .detail-block-skill,.char-detail-grid .detail-block-buff{grid-column:1;grid-row:auto}.char-detail-grid .portrait-xl{height:auto;aspect-ratio:2/3;max-height:60vh}.char-detail-grid .char-name-box{font-size:1.4em}}'
  ].join('');

  /** buff 定义已移至 界面/battle.js 的 BUFF_DEFINITIONS，由 BattleGrid.BUFF_DEFINITIONS 提供；若 battle 未加载则为空数组 */
  var BUFF_DEFINITIONS = (typeof window !== 'undefined' && window.BattleGrid && Array.isArray(window.BattleGrid.BUFF_DEFINITIONS)) ? window.BattleGrid.BUFF_DEFINITIONS : [];

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /** 将描述中的【buff名】转为蓝色可悬停/点击的 span；将计算占位符转为加粗、按属性着色的 span（悬停/点击显示公式），并做 HTML 转义 */
  function wrapBuffRefs(text) {
    if (!text) return '';
    var escaped = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var withCalcs = escaped.replace(SKILL_CALC_PLACEHOLDER_RE, function (_, key, formula, value) {
      var formulaEsc = escapeHtml(formula);
      return '<span class="skill-calc skill-calc-' + escapeHtml(key) + '" data-formula="' + formulaEsc + '" data-value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</span>';
    });
    return withCalcs.replace(/【([^】]+)】/g, function (_, n) {
      var id = n.trim();
      return '<span class="buff-ref" data-buff-id="' + escapeHtml(id) + '">【' + escapeHtml(id) + '】</span>';
    });
  }
  /** 取 buff 的悬浮/点击说明：只显示 desc（简短描述） */
  function getBuffTooltipText(buffId) {
    var b = BUFF_DEFINITIONS.filter(function (x) { return x.id === buffId || x.name === buffId; })[0];
    return b && b.desc ? b.desc : '';
  }

  function injectStyles() {
    var el = document.createElement('style');
    el.textContent = CSS;
    (document.head || document.documentElement).appendChild(el);
  }

  function initSidebar() {
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
          panelSlot.title = name || ('角色' + allySlot);
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
      var anyUnspent = party.some(function (ch) { return ch && getUnspentPoints(ch) > 0; });
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
    }
    var mapDrawer = document.getElementById('map-drawer');
    var mapDrawerContent = document.getElementById('map-drawer-content');
    var MAP_ICONS = (typeof window !== 'undefined' && window.色色地牢_SVG && window.色色地牢_SVG.MAP_ICONS) ? window.色色地牢_SVG.MAP_ICONS : {};
    var MAP_CONFIG = (typeof window !== 'undefined' && window.色色地牢_SVG && window.色色地牢_SVG.MAP_CONFIG) ? window.色色地牢_SVG.MAP_CONFIG : {};
    var MAP_ICONS_FALLBACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/></svg>';
    function getMapData() {
      var v = null;
      try { if (typeof getVariables === 'function') v = getVariables({ type: 'chat' }); } catch (e) {}
      var map = (v && v.map && typeof v.map === 'object') ? v.map : null;
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
            { id: '15-0', type: '首领战斗' }
          ],
          inv: []
        };
      }
      var inv = Array.isArray(map.inv) ? map.inv : [];
      return { area: map.area || '未知区域', pos: (map.pos || '0-0').toString(), nodes: map.nodes, inv: inv };
    }
    function getNodeStatus(nodeId, currentPos) {
      var parts = currentPos.split('-').map(Number);
      var currCol = parts[0], currRow = parts[1];
      var nParts = nodeId.split('-').map(Number);
      var nodeCol = nParts[0], nodeRow = nParts[1];
      if (nodeId === currentPos) return 'current';
      if (nodeCol < currCol) return 'passed';
      if (nodeCol === currCol + 1) {
        if (currentPos === '0-0') return 'reachable';
        if (nodeId === '15-0' && currCol === 14) return 'reachable';
        if (Math.abs(nodeRow - currRow) <= 1) return 'reachable';
        return 'future';
      }
      return 'future';
    }
    function renderMapContent() {
      if (!mapDrawerContent) return;
      var m = getMapData();
      var nodesHtml = '';
      for (var col = 0; col <= 15; col++) {
        for (var row = 1; row <= 3; row++) {
          var id = col + '-' + row;
          var finalId = (col === 0 || col === 15) ? col + '-0' : id;
          if ((col === 0 && row !== 2) || (col === 15 && row !== 2)) continue;
          var realNode = m.nodes.find(function (x) { return x.id === finalId; });
          if (!realNode) continue;
          var conf = MAP_CONFIG[realNode.type] || { color: '#333' };
          var iconSvg = (MAP_ICONS[realNode.type] != null ? MAP_ICONS[realNode.type] : MAP_ICONS_FALLBACK);
          var nodeStatus = getNodeStatus(finalId, m.pos);
          var cls = nodeStatus;
          var iconColor = conf.color;
          if (nodeStatus === 'current') iconColor = '#fff';
          var clickHandler = nodeStatus === 'reachable' ? ' onclick="window.fillPath && window.fillPath(\'' + finalId + '\')"' : '';
          nodesHtml += '<div class="node-circle ' + cls + '" style="grid-column:' + (col + 1) + ';grid-row:' + (4 - row) + ';border-color:' + conf.color + ';color:' + iconColor + '"' + clickHandler + '><span class="node-circle-icon">' + iconSvg + '</span><div class="node-type-label">' + (realNode.type || '') + '</div></div>';
        }
      }
      var legendHtml = '';
      for (var k in MAP_CONFIG) {
        var legSvg = (MAP_ICONS[k] != null ? MAP_ICONS[k] : MAP_ICONS_FALLBACK);
        legendHtml += '<div class="legend-item"><span class="legend-icon" style="color:' + MAP_CONFIG[k].color + '">' + legSvg + '</span> ' + k + '</div>';
      }
      var nextAreaBtn = '';
      if (m.pos === '15-0') {
        nextAreaBtn = '<div style="display:flex;justify-content:center;padding:16px 0 8px"><button type="button" class="story-side-btn" onclick="window.goNextArea && window.goNextArea()" style="padding:12px 40px;font-size:1.1em">前往下一区域</button></div>';
      }
      mapDrawerContent.innerHTML = '<div class="map-wrapper"><div class="map-header">探索路线图：' + (m.area || '') + '</div><div class="map-grid-16">' + nodesHtml + '</div>' + nextAreaBtn + '<div class="map-legend">' + legendHtml + '<div class="legend-item" style="margin-left:16px;border-left:2px solid var(--gold-border);padding-left:12px"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#1a150e;margin-right:4px"></span>当前</div><div class="legend-item"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:3px solid var(--ap-glow);margin-right:4px"></span>可前往</div><div class="legend-item"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:rgba(0,0,0,.3);filter:grayscale(.8);margin-right:4px"></span>已通过</div></div></div>';
    }
    function fillPath(id) {
      var area = (typeof window.parent !== 'undefined' && window.parent.document) ? window.parent.document.querySelector('#send_textarea') : null;
      if (area) {
        area.value = '前往' + id;
        area.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    function goNextArea() {
      var area = (typeof window.parent !== 'undefined' && window.parent.document) ? window.parent.document.querySelector('#send_textarea') : null;
      if (area) {
        area.value = '前往下一区域';
        area.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    if (typeof window !== 'undefined') {
      window.fillPath = fillPath;
      window.goNextArea = goNextArea;
    }
    function showMapDrawer() {
      if (mapDrawer) mapDrawer.classList.add('open');
      renderMapContent();
    }
    function hideMapDrawer() {
      if (mapDrawer) mapDrawer.classList.remove('open');
      $('.misc-sub-btn[data-misc="map"]').removeClass('active');
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
          var itemName = (item && typeof item === 'string' ? item.split('（')[0] : (item && item.name) ? item.name : '') || '';
          var itemEffect = (item && typeof item === 'string' && item.match(/（(.*?)）/)) ? item.match(/（(.*?)）/)[1] : (item && item.effect) ? item.effect : '';
          var itemType = (item && typeof item === 'string' && item.match(/\[(.*?)\]/)) ? item.match(/\[(.*?)\]/)[1] : (item && item.type) ? item.type : '物品';
          invHtml += '<div class="bag-row"><div><b>' + (itemName || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</b>— ' + (itemEffect || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div><span class="bag-row-type">' + (itemType || '物品').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span></div>';
        });
      } else {
        invHtml = '<div style="color:#888;text-align:center;padding:50px;">背包空空如也</div>';
      }
      var bagIcon = (typeof window !== 'undefined' && window.色色地牢_SVG && window.色色地牢_SVG.BAG_SVG) ? window.色色地牢_SVG.BAG_SVG : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
      bagDrawerContent.innerHTML = '<div class="bag-wrapper"><div class="bag-header"><span class="bag-header-icon">' + bagIcon + '</span> 旅行行囊</div><div class="bag-list">' + invHtml + '</div></div>';
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
      { key: 'ap', label: '行动', icon: 'flame', color: '#e65100' }
    ];
    var ATTR_ICONS = {
      dumbbell: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/></svg>',
      zap: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      brain: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
      activity: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      shield: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      clover: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.17 7.83 2 22"/><path d="M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A1 1 0 1 1 4 12"/><path d="m7.83 7.83 8.34 8.34"/></svg>',
      heart: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      flame: '<svg class="attr-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
    };
    function renderStarRating(level) {
      var lv = parseInt(String(level).replace(/\D/g, ''), 10) || 1;
      var stars = [ { s: 'small', f: false }, { s: 'small', f: false }, { s: 'large', f: false }, { s: 'small', f: false }, { s: 'small', f: false } ];
      if (lv >= 1) stars[0].f = true;
      if (lv >= 2) stars[1].f = true;
      if (lv >= 3) stars[2].f = true;
      if (lv >= 4) stars[3].f = true;
      if (lv >= 5) stars[4].f = true;
      return '<div class="star-rating">' + stars.map(function (x) {
        return '<span class="star ' + x.s + ' ' + (x.f ? 'filled' : '') + '" aria-hidden="true">★</span>';
      }).join('') + '</div>';
    }
    function buildDetailHtml(data, stats, ch, avatarIndex) {
      var hpPct = data.maxHp ? Math.min(100, (data.hp / data.maxHp) * 100) : 0;
      var expPct = data.maxExp ? Math.min(100, (data.exp / data.maxExp) * 100) : 0;
      var unspentPoints = ch ? getUnspentPoints(ch) : 0;
      var attrHtml = ATTR_KEYS.map(function (a) {
        var isFive = FIVE_DIM_KEYS.indexOf(a.key) !== -1;
        var delta = isFive ? (detailEditState.deltas[a.key] || 0) : 0;
        var val = a.key === 'ap' ? data.ap : (stats && stats[a.key] != null ? (isFive ? (Number(stats[a.key]) + delta) : stats[a.key]) : '—');
        var color = a.color || '#4a3c1a';
        var iconSvg = ATTR_ICONS[a.icon] || '';
        var rowContent = '<div class="attr-label" style="color:' + color + '">' + a.label + '<span class="attr-icon" style="color:' + color + '">' + iconSvg + '</span></div><div class="attr-value-wrap">';
        if (isFive && unspentPoints > 0) {
          var minusDisabled = delta <= 0 ? ' disabled' : '';
          var plusDisabled = (getUnspentPoints(ch) - (detailEditState.deltas.str + detailEditState.deltas.agi + detailEditState.deltas.int + detailEditState.deltas.sta + detailEditState.deltas.def)) <= 0 ? ' disabled' : '';
          rowContent += '<span class="attr-row-actions"><button type="button" class="attr-btn-minus" data-attr="' + a.key + '" title="减少（Shift：清空该属性，Ctrl：-10）"' + minusDisabled + '>' + MINUS_SVG + '</button><button type="button" class="attr-btn-plus" data-attr="' + a.key + '" title="增加（Shift：加满，Ctrl：+10）"' + plusDisabled + '>' + PLUS_SVG + '</button></span>';
        }
        if (ch) {
          var bd = getDisplayStatBreakdown(ch, a.key);
          if (bd.passive) {
            var dataSource = bd.sourceText != null ? ' data-source="' + escapeHtml(bd.sourceText) + '"' : '';
            rowContent += '<span class="attr-val attr-val-breakdown" data-base="' + bd.base + '" data-bonus="' + bd.passive.value + '" data-bonus-name="' + escapeHtml(bd.passive.name) + '"' + dataSource + '><span class="attr-val-number">' + (bd.total + delta) + '</span></span></div>';
          } else {
            rowContent += '<span class="attr-val">' + val + '</span></div>';
          }
        } else {
          rowContent += '<span class="attr-val">' + val + '</span></div>';
        }
        return '<div class="attr-row" data-attr-key="' + (isFive ? a.key : '') + '">' + rowContent + '</div>';
      }).join('');
      var headerRight = unspentPoints > 0 ? '<div class="attr-panel-header-right"><span class="attr-badge-dot show" title="未分配点数"></span><span class="attr-unspent-text">未分配：<span class="attr-unspent-num">' + unspentPoints + '</span></span></div>' : '';
      var attrBlockTitle = '<div class="block-title attr-panel-title"><span>属性面板</span>' + headerRight + '</div>';
      var pendingSpecial = (avatarIndex != null && detailEditState.avatarIndex === avatarIndex && detailEditState.pendingSpecialUnlocks && Array.isArray(detailEditState.pendingSpecialUnlocks)) ? detailEditState.pendingSpecialUnlocks : [];
      var unlockedSpecial = (ch && ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked)) ? ch.specialSkillsUnlocked.slice() : [];
      unlockedSpecial = unlockedSpecial.concat(pendingSpecial);
      var specialList = ch ? getSpecialSkillsForChar(ch) : [];
      var specialPassive = [];
      var specialActive = [];
      if (unlockedSpecial.length > 0 && specialList.length > 0) {
        specialList.forEach(function (sk) {
          if (unlockedSpecial.indexOf(sk.id) === -1) return;
          var isPassive = getSkillTagsString(sk).indexOf('被动') !== -1 || sk.ap === 0;
          if (isPassive) specialPassive.push(sk); else specialActive.push(sk);
        });
      }
      var deltasForSpecial = (detailEditState && avatarIndex != null && detailEditState.avatarIndex === avatarIndex && detailEditState.deltas) ? detailEditState.deltas : { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
      var displayStatsForSpecial = ch ? getDisplayStatsForSkill(ch, deltasForSpecial) : null;
      var passiveHtml = '';
      var unspentSkillPoints = ch ? getUnspentSkillPoints(ch) : 0;
      if (ch && ch.passiveSkills && ch.passiveSkills.length) {
        passiveHtml = '<div class="passive-skills-section">' + ch.passiveSkills.map(function (p, idx) {
          var name = (p.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          var rawEffect = p.effect || '';
          var effect = resolveSkillEffect(rawEffect, ch);
          var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          var rightPart = '<span class="skill-name-right"><span class="skill-passive-tag">被动</span></span>';
          return '<div class="skill-card skill-card-passive" data-skill-type="passive" data-skill-index="' + idx + '" data-effect="' + dataEffect + '"><div class="skill-name"><span>' + name + '</span>' + rightPart + '</div><div class="skill-desc">' + wrapBuffRefs(effect) + '</div></div>';
        }).join('');
        specialPassive.forEach(function (sk) {
          var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          var rawEffect = sk.effect || '';
          var effect = displayStatsForSpecial ? wrapBuffRefs(resolveSkillEffectWithStats(rawEffect, displayStatsForSpecial)) : wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
          var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          var rightPart = '<span class="skill-name-right"><span class="skill-passive-tag">被动</span></span>';
          passiveHtml += '<div class="skill-card skill-card-passive skill-card-special" data-skill-type="passive" data-special-id="' + String(sk.id || '').replace(/"/g, '&quot;') + '" data-effect="' + dataEffect + '"><div class="skill-name"><span>' + name + '</span>' + rightPart + '</div><div class="skill-desc">' + effect + '</div></div>';
        });
        passiveHtml += '</div>';
      } else if (specialPassive.length > 0) {
        passiveHtml = '<div class="passive-skills-section">';
        specialPassive.forEach(function (sk) {
          var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          var rawEffect = sk.effect || '';
          var effect = displayStatsForSpecial ? wrapBuffRefs(resolveSkillEffectWithStats(rawEffect, displayStatsForSpecial)) : wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
          var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          var rightPart = '<span class="skill-name-right"><span class="skill-passive-tag">被动</span></span>';
          passiveHtml += '<div class="skill-card skill-card-passive skill-card-special" data-skill-type="passive" data-special-id="' + String(sk.id || '').replace(/"/g, '&quot;') + '" data-effect="' + dataEffect + '"><div class="skill-name"><span>' + name + '</span>' + rightPart + '</div><div class="skill-desc">' + effect + '</div></div>';
        });
        passiveHtml += '</div>';
      }
      var basicSkillsHtml = '';
      var levelableSkillsHtml = '';
      var skillDeltas = detailEditState.skillLevelDeltas || {};
      var pendingSkillSpent = 0;
      if (ch && ch.skills) ch.skills.forEach(function (s, i) { if (!s.basic) pendingSkillSpent += Math.max(0, skillDeltas[i] || 0); });
      var effectiveUnspentSkillPoints = Math.max(0, unspentSkillPoints - pendingSkillSpent);
      if (ch && ch.skills && ch.skills.length) {
        var basicSkills = ch.skills.filter(function (s) { return s.basic; });
        var levelableSkills = ch.skills.filter(function (s) { return !s.basic; });
        basicSkillsHtml = ''; /* 角色细则界面不显示攻击、防御等基础技能 */
        levelableSkillsHtml = levelableSkills.length || specialActive.length ? '<div class="active-skills-section">' + (levelableSkills.length ? ch.skills.map(function (s, idx) {
          if (s.basic) return '';
          if (s.locked) {
            var baseName = (s.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var tags = getSkillTagsString(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var ap = s.ap != null ? s.ap : '—';
            var rightPart = '<span class="skill-name-right"><span style="color:var(--ap-glow)">' + ap + ' AP</span></span>';
            var cardInner = '<div class="skill-name"><span class="skill-name-left"><span>' + baseName + '</span><span class="skill-lv">未解锁</span></span>' + rightPart + '</div>' + (tags ? '<div class="skill-tags">' + tags + '</div>' : '') + '<div class="skill-desc" style="color:#999">消耗1技能点解锁至Lv1</div>';
            var canUnlock = effectiveUnspentSkillPoints >= 1;
            var unlockBtn = '<button type="button" class="skill-unlock-btn" data-skill-index="' + idx + '" ' + (canUnlock ? '' : ' disabled') + '>解锁</button>';
            return '<div class="skill-card-locked-wrap"><div class="skill-card" data-skill-type="active" data-skill-index="' + idx + '" data-locked="1">' + cardInner + '</div><div class="skill-card-locked-overlay">' + unlockBtn + '</div></div>';
          }
          var baseName = s.name || '';
          var advanceOpt = s.advancement && s.advancementOptions ? s.advancementOptions.filter(function (o) { return o.id === s.advancement; })[0] : null;
          var displayName = advanceOpt ? baseName + '-' + (advanceOpt.name || '') : baseName;
          var name = displayName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          var savedLv = Math.max(1, parseInt(s.level, 10) || 1);
          var maxLv = (s.effectByLevel && s.effectByLevel.length) ? s.effectByLevel.length : 99;
          var delta = skillDeltas[idx] || 0;
          var displayLv = Math.max(1, Math.min(maxLv, savedLv + delta));
          var lvText = advanceOpt ? 5 : displayLv;
          var rawEffect = getSkillEffectForLevel(s, displayLv);
          if (ch.name === '黯' && (s.name || '') === '攻击') {
            var un = ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
            if (un.indexOf('错锋') !== -1) rawEffect = '进行3次攻击判定，每次造成 [Str × 0.3] 的物理伤害。';
          }
          var effect = resolveSkillEffect(rawEffect, ch);
          var dataEffect = rawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          var advanceEffectRaw = advanceOpt && advanceOpt.effect ? advanceOpt.effect : '';
          var advanceEffectResolved = advanceEffectRaw ? resolveSkillEffect(advanceEffectRaw, ch) : '';
          var replacesBase = s.advancementReplacesEffect && advanceOpt;
          var mainDesc = replacesBase ? advanceEffectResolved : effect;
          var mainDataEffect = replacesBase ? (advanceEffectRaw || rawEffect) : rawEffect;
          var mainDataEffectEscaped = mainDataEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          var advanceEffectHtml = replacesBase ? '' : (advanceEffectResolved ? '<div class="skill-desc-advancement">' + wrapBuffRefs(advanceEffectResolved) + '</div>' : '');
          var tags = getSkillTagsString(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
          var ap = s.ap != null ? s.ap : '—';
          var minusDisabled = displayLv <= 1 ? ' disabled' : '';
          var plusDisabled = displayLv >= maxLv || effectiveUnspentSkillPoints <= 0 ? ' disabled' : '';
          var canAdvance = savedLv === maxLv && effectiveUnspentSkillPoints > 0 && !s.advancement && s.advancementOptions && s.advancementOptions.length;
          var showPlusMinus = (effectiveUnspentSkillPoints > 0 || delta !== 0) && (savedLv < maxLv || delta > 0);
          var actionsHtml = canAdvance ? '<span class="skill-level-actions"><button type="button" class="skill-advance-btn" data-skill-type="active" data-skill-index="' + idx + '" title="分支进阶">' + ADVANCE_UP_SVG + '</button></span>' : (showPlusMinus ? '<span class="skill-level-actions"><button type="button" class="skill-btn-minus" data-skill-type="active" data-skill-index="' + idx + '" title="降级"' + minusDisabled + '>' + MINUS_SVG + '</button><button type="button" class="skill-btn-plus" data-skill-type="active" data-skill-index="' + idx + '" title="升级"' + plusDisabled + '>' + PLUS_SVG + '</button></span>' : '');
          var rightPart = '<span class="skill-name-right">' + actionsHtml + '<span style="color:var(--ap-glow)">' + ap + ' AP</span></span>';
          return '<div class="skill-card" data-skill-type="active" data-skill-index="' + idx + '" data-effect="' + mainDataEffectEscaped + '"><div class="skill-name"><span class="skill-name-left"><span>' + name + '</span><span class="skill-lv">Lv' + lvText + '</span></span>' + rightPart + '</div>' + (tags ? '<div class="skill-tags">' + tags + '</div>' : '') + '<div class="skill-desc">' + wrapBuffRefs(mainDesc) + '</div>' + advanceEffectHtml + '</div>';
        }).filter(Boolean).join('') : '') + specialActive.map(function (sk) {
          var sName = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          var sRawEffect = sk.effect || '';
          var sEffect = displayStatsForSpecial ? wrapBuffRefs(resolveSkillEffectWithStats(sRawEffect, displayStatsForSpecial)) : wrapBuffRefs(resolveSkillEffect(sk.effect || '', ch));
          var sDataEffect = sRawEffect.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          var sTags = getSkillTagsString(sk).replace(/</g, '&lt;').replace(/>/g, '&gt;');
          var sAp = sk.ap != null ? sk.ap : '—';
          var sRight = '<span class="skill-name-right"><span style="color:var(--ap-glow)">' + sAp + ' AP</span></span>';
          return '<div class="skill-card skill-card-special" data-skill-type="active" data-special-id="' + String(sk.id || '').replace(/"/g, '&quot;') + '" data-effect="' + sDataEffect + '"><div class="skill-name"><span>' + sName + '</span>' + sRight + '</div>' + (sTags ? '<div class="skill-tags">' + sTags + '</div>' : '') + '<div class="skill-desc">' + sEffect + '</div></div>';
        }).join('') + '</div>' : '';
      }
      var activeHtml = basicSkillsHtml + levelableSkillsHtml;
      if (!ch || !ch.skills || !ch.skills.length) {
        activeHtml = '<div class="skill-card"><div class="skill-name"><span>未习得</span><span style="color:var(--ap-glow)">— AP</span></div><div class="skill-desc">暂无技能数据</div></div>';
      }
      var specialSectionHtml = '';
      var skillsHtml = passiveHtml + activeHtml + specialSectionHtml;
      var hasSkillDeltas = Object.keys(skillDeltas).some(function (k) { return (skillDeltas[k] || 0) !== 0; });
      var unspentSpecial = ch ? Math.max(0, getUnspentSpecialSkillPoints(ch) - pendingSpecial.length) : 0;
      var specialBtnHtml = (unspentSpecial > 0 && specialList.length > 0) ? '<button type="button" class="special-skill-open-btn" title="使用特殊技能点解锁">特殊技能</button>' : '';
      var skillHeaderRight = specialBtnHtml + ((effectiveUnspentSkillPoints > 0 || hasSkillDeltas) ? '<div class="attr-panel-header-right"><span class="attr-badge-dot show" title="未分配技能点"></span><span class="attr-unspent-text">未分配：<span class="attr-unspent-num">' + effectiveUnspentSkillPoints + '</span></span></div>' : '');
      var skillBlockTitle = '<div class="block-title skill-panel-title"><span>战斗技能</span>' + skillHeaderRight + '</div>';
      var relicsHtml = '<div class="relic-card"><div class="relic-name">空</div><div class="relic-effect">暂无遗物</div></div><div class="relic-card"><div class="relic-name">空</div><div class="relic-effect">暂无遗物</div></div>';
      var renderBuffs = (typeof window !== 'undefined' && window.BattleGrid && typeof window.BattleGrid.renderBuffsHtml === 'function') ? window.BattleGrid.renderBuffsHtml : function () { return ''; };
      var buffList = (ch && ch.buffs && Array.isArray(ch.buffs)) ? ch.buffs : [];
      var buffsHtml = buffList.length
        ? '<div class="slot-char-buffs">' + renderBuffs(buffList) + '</div>'
        : '<div style="color:#888;font-size:12px;text-align:center;padding:15px">暂无状态效果</div>';
      var luk = (stats && stats.luk != null ? Number(stats.luk) : (ch ? (getDisplayStat(ch, 'luk') || 0) : 0));
      var agi = (stats && stats.agi != null ? Number(stats.agi) : (ch ? (getDisplayStat(ch, 'agi') || 0) : 0));
      var hitRate = ch ? Math.min(100, Math.max(0, 50 + luk * 5)) : 0;
      var dodgeRate = agi * 2;
      var baseCrit = 20 + agi * 1;
      var 攻势L = 0;
      if (ch && ch.buffs && ch.buffs.length) {
        ch.buffs.forEach(function (b) { if ((b.id || b.name) === '攻势') 攻势L = Math.max(0, parseInt(b.layers, 10) || 0); });
      }
      var has心眼 = ch && ch.name === '昼墨' && ch.specialSkillsUnlocked && ch.specialSkillsUnlocked.indexOf('心眼') !== -1;
      var critRate = ch ? Math.min(100, Math.max(0, baseCrit + (has心眼 ? 攻势L * 5 : 0))) : 0;
      function reportAttrHtml(attrKey) {
        if (attrKey === '攻势') {
          return '<span class="report-attr-name" style="color:#1a1a1a">攻势</span>';
        }
        var a = ATTR_KEYS.find(function (x) { return x.key === attrKey; });
        if (!a) return '';
        return '<span class="report-attr-name" style="color:' + a.color + '">' + escapeHtml(a.label) + '</span><span class="report-attr-icon" style="color:' + a.color + '">' + (ATTR_ICONS[a.icon] || '') + '</span>';
      }
      var sourceHit = ch ? ('50 + ' + reportAttrHtml('luk') + '×5 = 50 + ' + luk + '×5 = ' + hitRate + '%。实际命中 = 此值 − 对方闪避率。') : null;
      var sourceDodge = ch ? (reportAttrHtml('agi') + '×2 = ' + agi + '×2 = ' + dodgeRate + '%。对方命中率计算时会减去此值。') : null;
      var sourceCrit = ch ? (has心眼 && 攻势L > 0 ? ('20 + ' + reportAttrHtml('agi') + '×1 + ' + reportAttrHtml('攻势') + '×5 = 20 + ' + agi + ' + ' + 攻势L + '×5 = ' + critRate + '%。') : ('20 + ' + reportAttrHtml('agi') + '×1 = 20 + ' + agi + ' = ' + critRate + '%。' + (has心眼 ? ' 若拥有【攻势】层数，心眼被动会额外增加暴击率（攻势×5%）。' : ''))) : null;
      var sourceCritDmg = ch ? '基础暴击伤害 200%（暴击时最终伤害为普通伤害的 200%）。' : null;
      var reportRows = [
        { label: '命中概率', value: (ch ? hitRate : '—') + (ch ? '%' : ''), source: sourceHit },
        { label: '闪避概率', value: (ch ? dodgeRate : '—') + (ch ? '%' : ''), source: sourceDodge },
        { label: '暴击概率', value: (ch ? critRate : '—') + (ch ? '%' : ''), source: sourceCrit },
        { label: '暴击伤害', value: ch ? '200%' : '—', source: sourceCritDmg }
      ];
      var dataReportHtml = reportRows.map(function (r) {
        var valueHtml = r.source
          ? '<span class="data-report-value-breakdown" data-source="' + escapeHtml(r.source) + '" title="悬停或点击查看数值来源">' + escapeHtml(String(r.value)) + '</span>'
          : '<span class="data-report-value">' + escapeHtml(String(r.value)) + '</span>';
        return '<div class="data-report-row"><span class="data-report-label">' + escapeHtml(String(r.label)) + '</span>' + valueHtml + '</div>';
      }).join('');
      var buffBlockTitle = '<div class="block-title detail-buff-panel-title"><span class="detail-buff-title-text">状态效果</span><button type="button" class="detail-buff-swap-btn" title="切换为数据报表" aria-label="切换为数据报表">' + SWAP_SVG + '</button></div>';
      return '<div class="char-detail-grid">' +
        '<div class="col-base">' +
          (data.src ? '<img src="' + data.src + '" alt="" class="portrait-xl">' : '<div class="portrait-xl" style="background:#c4b8a8;display:flex;align-items:center;justify-content:center;color:#5c4a3a">无立绘</div>') +
          '<div class="char-name-box">' + (data.name || '角色') + '</div>' +
          renderStarRating(data.level) +
          '<div class="status-bars">' +
            '<div class="bar-row" id="detail-hp-bar"><span class="bar-label">HP</span><div class="bar-wrap"><div class="bar-text">' + data.hp + '/' + data.maxHp + '</div><div class="bar-fill" style="width:' + hpPct + '%;background:var(--hp-red)"></div></div></div>' +
            '<div class="bar-row"><span class="bar-label">EXP</span><div class="bar-wrap"><div class="bar-text">' + data.exp + '/' + data.maxExp + '</div><div class="bar-fill" style="width:' + expPct + '%;background:#2d8a4e"></div></div></div>' +
          '</div>' +
          (unspentPoints > 0 || hasSkillDeltas || pendingSpecial.length > 0 ? '<div class="attr-allocate-footer"><button type="button" class="attr-reset-btn">重置</button><button type="button" class="attr-confirm-btn">确定</button></div>' : '') +
        '</div>' +
        '<div class="detail-block detail-block-attr" id="detail-block-attr">' + attrBlockTitle + '<div class="attr-list">' + attrHtml + '</div></div>' +
        '<div class="detail-block detail-block-relic"><div class="block-title">装备遗物</div><div class="relic-slots">' + relicsHtml + '</div></div>' +
        '<div class="detail-block detail-block-skill">' + skillBlockTitle + '<div class="skill-slots">' + skillsHtml + '</div></div>' +
        '<div class="detail-block detail-block-buff" id="detail-block-buff">' + buffBlockTitle + '<div class="buff-panel-body"><div class="buff-container">' + buffsHtml + '</div><div class="data-report-container">' + dataReportHtml + '</div></div></div>' +
      '</div>';
    }
    var detailEditState = { avatarIndex: 0, deltas: { str: 0, agi: 0, int: 0, sta: 0, def: 0 }, skillLevelDeltas: {}, pendingSpecialUnlocks: [] };
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
        return getUnspentPoints(ch) - (detailEditState.deltas.str + detailEditState.deltas.agi + detailEditState.deltas.int + detailEditState.deltas.sta + detailEditState.deltas.def);
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
          level: ch.level != null ? ch.level : 1
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
          var opt = skill.advancementOptions.filter(function (o) { return o.id === skill.advancement; })[0];
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
        var stats = { str: getDisplayStat(ch, 'str'), agi: getDisplayStat(ch, 'agi'), int: getDisplayStat(ch, 'int'), sta: getDisplayStat(ch, 'sta'), def: getDisplayStat(ch, 'def') };
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
          var hasSkillDeltas = Object.keys(skillDeltas).some(function (k) { return (skillDeltas[k] || 0) !== 0; });
          var pendingSpecial = detailEditState.pendingSpecialUnlocks || [];
          if (attrTotal === 0 && !hasSkillDeltas && pendingSpecial.length === 0) return;
          try {
            var v = null;
            if (typeof getVariables === 'function') try { v = getVariables({ type: 'chat' }); } catch (e) {}
            var party = (v && v.party && Array.isArray(v.party)) ? v.party : defaultParty;
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
                  var maxLv = (skill.effectByLevel && skill.effectByLevel.length) ? skill.effectByLevel.length : 99;
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
                replaceVariables(v, { type: 'chat' });
              }
              _lastKnownParty = party;
            }
          } catch (e) { console.warn('[色色地牢] 保存分配失败', e); }
          detailEditState.deltas = { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
          detailEditState.skillLevelDeltas = {};
          detailEditState.pendingSpecialUnlocks = [];
          if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function') window.BattleGrid.refreshBattleView();
          showCharacterDetail(avatarIndex);
          if (typeof updateSidebarCharBadge === 'function') updateSidebarCharBadge();
        });
      }
      function applySkillLevelDelta(skillIndex, delta) {
        var s = ch.skills && ch.skills[skillIndex];
        if (!s || s.basic) return;
        var savedLv = Math.max(1, parseInt(s.level, 10) || 1);
        var maxLv = (s.effectByLevel && s.effectByLevel.length) ? s.effectByLevel.length : 99;
        var cur = detailEditState.skillLevelDeltas[skillIndex] || 0;
        var displayLv = savedLv + cur;
        if (delta > 0) {
          if (displayLv >= maxLv) return;
          var pendingSpent = 0;
          Object.keys(detailEditState.skillLevelDeltas).forEach(function (k) { pendingSpent += Math.max(0, detailEditState.skillLevelDeltas[k] || 0); });
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
        btn.addEventListener('click', function () { openSpecialSkillPopup(avatarIndex); });
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
            if (typeof getVariables === 'function') try { v = getVariables({ type: 'chat' }); } catch (e) {}
            var party = (v && v.party && Array.isArray(v.party)) ? v.party : defaultParty;
            var c = party[avatarIndex - 1];
            if (c && c.skills && c.skills[skillIndex]) {
              c.skills[skillIndex].locked = false;
              c.skills[skillIndex].level = 1;
              c.skillPointsSpent = (parseInt(c.skillPointsSpent, 10) || 0) + 1;
              if (v && typeof replaceVariables === 'function') { v.party = party; replaceVariables(v, { type: 'chat' }); }
            }
          } catch (e) { console.warn('[色色地牢] 解锁技能失败', e); }
          showCharacterDetail(avatarIndex);
          if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function') window.BattleGrid.refreshBattleView();
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
      var optsHtml = options.map(function (opt) {
        var name = (opt.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var effectResolved = (opt.effect && ch) ? resolveSkillEffect(opt.effect, ch) : (opt.effect || '');
        var effect = wrapBuffRefs(effectResolved);
        var nameAttr = (opt.name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        var effectAttr = (opt.effect || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        return '<div class="advancement-opt" data-advance-id="' + (opt.id || '').replace(/"/g, '&quot;') + '" data-advance-name="' + nameAttr + '" data-advance-effect="' + effectAttr + '" role="button" tabindex="0"><div class="advancement-opt-name">[' + (opt.id || '') + '·' + name + ']</div><div class="advancement-opt-effect">' + effect + '</div></div>';
      }).join('');
      panel.innerHTML = '<div class="advancement-popup-title">分支进阶<button type="button" class="advancement-popup-close" title="退出" aria-label="退出">' + CLOSE_X_SVG + '</button></div><div class="advancement-popup-body">' + optsHtml + '</div><div class="advancement-popup-footer"><button type="button" class="advancement-confirm-btn" disabled>确认</button></div>';
      panel.querySelectorAll('.advancement-opt').forEach(function (el) {
        el.addEventListener('click', function () {
          panel.querySelectorAll('.advancement-opt').forEach(function (o) { o.classList.remove('selected'); });
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
          if (typeof getVariables === 'function') try { v = getVariables({ type: 'chat' }); } catch (e) {}
          var party = (v && v.party && Array.isArray(v.party)) ? v.party : defaultParty;
          var c = party[av - 1];
          if (c && c.skills && c.skills[sidx]) {
            c.skills[sidx].advancement = aid;
            c.skillPointsSpent = (parseInt(c.skillPointsSpent, 10) || 0) + 1;
            if (v && typeof replaceVariables === 'function') { v.party = party; replaceVariables(v, { type: 'chat' }); }
          }
        } catch (e) { console.warn('[色色地牢] 分支进阶保存失败', e); }
        closeAdvancementPopup();
        if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function') window.BattleGrid.refreshBattleView();
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
      var pendingSpecial = (detailEditState.avatarIndex === avatarIndex && detailEditState.pendingSpecialUnlocks && Array.isArray(detailEditState.pendingSpecialUnlocks)) ? detailEditState.pendingSpecialUnlocks : [];
      var unlocked = (ch && ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked)) ? ch.specialSkillsUnlocked.concat(pendingSpecial) : pendingSpecial.slice();
      var unspent = ch ? Math.max(0, getUnspentSpecialSkillPoints(ch) - pendingSpecial.length) : 0;
      var locked = list.filter(function (s) { return unlocked.indexOf(s.id) === -1; });
      var closeBtn = panel.querySelector('.special-skill-popup-close');
      if (closeBtn) closeBtn.innerHTML = CLOSE_X_SVG;
      var popupDeltas = (detailEditState && detailEditState.avatarIndex === avatarIndex && detailEditState.deltas) ? detailEditState.deltas : { str: 0, agi: 0, int: 0, sta: 0, def: 0 };
      var popupDisplayStats = ch ? getDisplayStatsForSkill(ch, popupDeltas) : null;
      body.innerHTML = locked.length === 0 ? '<p style="color:#9a8b72;padding:12px">已全部解锁或暂无特殊技能</p>' : locked.map(function (sk) {
        var name = (sk.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var rawEffect = sk.effect || '';
        var effect = wrapBuffRefs((ch && rawEffect) ? (popupDisplayStats ? resolveSkillEffectWithStats(rawEffect, popupDisplayStats) : resolveSkillEffect(rawEffect, ch)) : rawEffect);
        var tags = getSkillTagsString(sk).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var idAttr = (sk.id || '').replace(/"/g, '&quot;');
        return '<div class="special-skill-opt" data-special-id="' + idAttr + '"><div class="special-skill-opt-name">' + name + ' <span style="color:#8b7355;font-size:11px">' + getSkillTagsString(sk) + ' · ' + (sk.ap != null ? sk.ap : 0) + ' AP</span></div><div class="special-skill-opt-effect">' + effect + '</div><button type="button" class="special-skill-opt-unlock" data-special-id="' + idAttr + '" ' + (unspent < 1 ? ' disabled' : '') + '>解锁</button></div>';
      }).join('');
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
          if (window.BattleGrid && typeof window.BattleGrid.refreshBattleView === 'function') window.BattleGrid.refreshBattleView();
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
        stats = { str: getDisplayStat(ch, 'str'), agi: getDisplayStat(ch, 'agi'), int: getDisplayStat(ch, 'int'), sta: getDisplayStat(ch, 'sta'), def: getDisplayStat(ch, 'def'), luk: ch.luk != null ? ch.luk : '—', cha: ch.cha != null ? ch.cha : '—' };
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
      if (!storyBox || !gameInner || !viewStory) { onDone(); return; }
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
    $('.misc-sub-btn').on('click', function (e) {
      e.stopPropagation();
      var btn = $(this);
      var wasActive = btn.hasClass('active');
      var isMap = btn.attr('data-misc') === 'map';
      var isBag = btn.attr('data-misc') === 'bag';
      btn.siblings('.misc-sub-btn').removeClass('active');
      if (!wasActive) btn.addClass('active');
      else btn.removeClass('active');
      if (isMap) {
        hideBagDrawer();
        if (!wasActive) showMapDrawer();
        else hideMapDrawer();
      } else if (isBag) {
        hideMapDrawer();
        if (!wasActive) showBagDrawer();
        else hideBagDrawer();
      }
    });
    $('#map-drawer-backdrop').on('click', function () {
      hideMapDrawer();
    });
    $('#bag-drawer-backdrop').on('click', function () {
      hideBagDrawer();
    });
    $('#character-detail-backdrop').on('click', function () {
      if (openDetailAvatar) hideCharacterDetail(true);
    });
    updateSidebarCharBadge();
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
  var svg = (typeof window !== 'undefined' && window.色色地牢_SVG) ? window.色色地牢_SVG : {};
  var AP_FLAME_SVG = svg.AP_FLAME_SVG || '';
  var EXPAND_SVG = svg.EXPAND_SVG || '';
  var PLUS_SVG = svg.PLUS_SVG || '';
  var MINUS_SVG = svg.MINUS_SVG || '';
  var ADVANCE_UP_SVG = svg.ADVANCE_UP_SVG || '';
  var CLOSE_X_SVG = svg.CLOSE_X_SVG || '';
  var SWAP_SVG = svg.SWAP_SVG || '';
  var SKILL_ATTACK_SVG = svg.SKILL_ATTACK_SVG || '';
  var SKILL_DEFENSE_SVG = svg.SKILL_DEFENSE_SVG || '';
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
  /** 敌方默认阵容（与 party 同结构：6 槽，空位 null）；可从聊天变量 v.enemyParty 覆盖。怪物均有等级（level），场上默认均为 Normal。每个史莱姆拥有独立的 buff 副本，避免共享引用。 */
  var slimeTemplateBase = { name: '史莱姆', hp: 100, maxHp: 100, atk: 15, def: 18, level: 'Normal' };
  function createSlime(overrides) {
    var slime = Object.assign({}, slimeTemplateBase, overrides || {});
    slime.buffs = [];
    return slime;
  }
  var defaultEnemyParty = [
    createSlime({ maxHp: 10000, hp: 100 }),
    createSlime(),
    createSlime(),
    createSlime(),
    createSlime(),
    createSlime()
  ];
  defaultEnemyParty[0].buffs = [{ id: '流血', name: '流血', layers: 60 }];
  /** 内存中保留的最近一次己方/敌方阵容（含 currentAp、hp 等），避免 replaceVariables 后 getVariables 未及时更新导致第二次起攻击不显示 AP 扣减） */
  var _lastKnownParty = null;
  var _lastKnownEnemies = null;
  function getParty() {
    if (_lastKnownParty && _lastKnownParty.length === 6) return _lastKnownParty;
    var raw;
    try {
      if (typeof getVariables === 'function') {
        var v = getVariables({ type: 'chat' });
        if (v) {
          if (!v.buffDefinitions || !Array.isArray(v.buffDefinitions) || v.buffDefinitions.length === 0) {
            v.buffDefinitions = BUFF_DEFINITIONS;
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
      return base;
    });
    var portraits = window.CHARACTER_PORTRAITS;
    result.forEach(function (ch) {
      if (ch && !ch.avatar && portraits && portraits[ch.name]) ch.avatar = portraits[ch.name];
    });
    if (typeof window !== 'undefined' && window.BattleGrid && typeof window.BattleGrid.capUnitBuffs === 'function') {
      result.forEach(function (ch) { if (ch) window.BattleGrid.capUnitBuffs(ch); });
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
      result.forEach(function (en) { if (en) window.BattleGrid.capUnitBuffs(en); });
    }
    while (result.length < 6) result.push(null);
    return result;
  }
  /** 战斗模块写回己方/敌方数据并更新缓存（由 battle.initBattleUI 调用） */
  function saveBattleData(party, enemies) {
    _lastKnownParty = party;
    _lastKnownEnemies = enemies;
    var v = null;
    try { if (typeof getVariables === 'function') v = getVariables({ type: 'chat' }); } catch (e) {}
    if (!v) v = {};
    v.party = party;
    v.enemyParty = enemies;
    if (!v.buffDefinitions || !Array.isArray(v.buffDefinitions) || v.buffDefinitions.length === 0) v.buffDefinitions = BUFF_DEFINITIONS;
    if (typeof replaceVariables === 'function') replaceVariables(v, { type: 'chat' });
  }
  /** 从已解析的技能描述中提取伤害数字（与界面显示的“造成 12 点伤害”等一致），用于结算。会先把 CALC 占位符替换为数值再匹配；所有伤害向下取整。 */
  function getBaseDamageFromResolvedEffect(resolvedEffect) {
    if (!resolvedEffect || typeof resolvedEffect !== 'string') return NaN;
    var str = resolvedEffect.replace(SKILL_CALC_PLACEHOLDER_RE, function (_, _key, _formula, val) { return val; });
    var m = str.match(/造成\s*([\d\s.+]+)\s*(?:点伤害|的物理伤害)/);
    if (!m) return NaN;
    var part = m[1].split(/\s*\+\s*/);
    var sum = 0;
    for (var i = 0; i < part.length; i++) {
      var n = parseFloat(part[i].trim());
      if (!isNaN(n)) sum += n;
    }
    return Math.floor(sum);
  }
  /** 根据技能计算本次攻击的原始伤害（用于 resolveAttack 的 baseDamage）。仅支持部分技能，否则返回 0 */
  function getBaseDamageForSkill(attacker, skill) {
    if (!attacker || !skill) return 0;
    var name = skill.name || '';
    if (name === '攻击') return Math.max(0, Math.floor(getDisplayStat(attacker, 'str') || 0));
    if (name === '狼牙碎击') return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 3));
    if (name === '狼式旋风') {
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '遒劲猛击') {
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 1.05 : lv === 2 ? 1.1 : lv === 3 ? 1.15 : 1.2;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '斩杀') {
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 1.3 : lv === 2 ? 1.4 : lv === 3 ? 1.5 : 1.6;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '斩月') {
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
      return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * mult));
    }
    if (name === '居合') {
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multStr = lv === 1 ? 0.6 : lv === 2 ? 0.7 : lv === 3 ? 0.7 : 0.8;
      var multAgi = lv === 1 ? 0.3 : lv === 2 ? 0.3 : lv === 3 ? 0.4 : 0.4;
      if (skill.advancement === 'A') { multStr = 1.0; multAgi = 0.5; }
      if (skill.advancement === 'B') { multStr = 0.8; multAgi = 0.4; }
      return Math.max(0, Math.floor(str * multStr + agi * multAgi));
    }
    if (name === '错金' || (skill.id === '错金')) return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 1.6));
    if (name === '一闪' || (skill.id === '一闪')) return Math.max(0, Math.floor((getDisplayStat(attacker, 'str') || 0) * 3));
    if (name === '无拍子' || (skill.id === '无拍子')) return Math.max(0, Math.floor((getDisplayStat(attacker, 'agi') || 0) * 1.2));
    var atkVal = attacker.atk != null ? parseInt(attacker.atk, 10) : getDisplayStat(attacker, 'str');
    if (name === '横扫') return Math.max(0, Math.floor((atkVal || 0) * 0.6));
    if (name === '撕咬') return Math.max(0, Math.floor((atkVal || 0) * 1.0));
    if (name === '幽灵舞踏') {
      var str = getDisplayStat(attacker, 'str') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.35 : lv === 2 ? 0.4 : lv === 3 ? 0.45 : 0.5;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 0.5;
      return Math.max(0, Math.floor(str * mult));
    }
    if (name === '血舞枪刃') {
      var str = getDisplayStat(attacker, 'str') || 0;
      var agi = getDisplayStat(attacker, 'agi') || 0;
      var int = getDisplayStat(attacker, 'int') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var multStr = 0.5;
      var multAgi = 0.3;
      if (skill.advancement === 'A') { multStr = 0.8; multAgi = 0.4; return Math.max(0, Math.floor(str * multStr) + Math.floor(agi * multAgi)); }
      if (skill.advancement === 'B') return Math.max(0, Math.floor(str * 0.8) + Math.floor(int * 0.4));
      if (lv === 2) { multStr = 0.6; multAgi = 0.3; }
      else if (lv === 3) { multStr = 0.7; multAgi = 0.4; }
      else if (lv >= 4) { multStr = 0.8; multAgi = 0.4; }
      return Math.max(0, Math.floor(str * multStr) + Math.floor(agi * multAgi));
    }
    if (name === '暗夜帷幕') {
      var int = getDisplayStat(attacker, 'int') || 0;
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var mult = lv === 1 ? 0.45 : lv === 2 ? 0.5 : lv === 3 ? 0.55 : 0.6;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 0.6;
      return Math.max(0, Math.floor(int * mult));
    }
    if (name === '魔龙舞' || (skill && skill.id === '魔龙舞')) {
      var agi = getDisplayStat(attacker, 'agi') || 0;
      return Math.max(0, Math.floor(agi * 0.4));
    }
    if (name === '深渊终结' || (skill && skill.id === '深渊终结')) {
      var int = getDisplayStat(attacker, 'int') || 0;
      return Math.max(0, Math.floor(int * 2));
    }
    if (name === '暗蚀之刃' || (skill && skill.id === '暗蚀之刃')) {
      var int = getDisplayStat(attacker, 'int') || 0;
      return Math.max(0, Math.floor(int * 0.8));
    }
    return 0;
  }
  /** 从已解析的技能描述中提取护盾数值（支持「获得 7 点护盾」「获得 6 + 5 的护盾」等，CALC 占位符会先被替换为数值） */
  function getShieldFromResolvedEffect(resolvedEffect) {
    if (!resolvedEffect || typeof resolvedEffect !== 'string') return NaN;
    var str = resolvedEffect.replace(SKILL_CALC_PLACEHOLDER_RE, function (_, _key, _formula, val) { return val; });
    var m = str.match(/(?:给予|获得)\s*([\d\s+]+)\s*(?:点护盾|的护盾)/);
    if (!m) return NaN;
    var part = m[1].split(/\s*\+\s*/);
    var sum = 0;
    for (var i = 0; i < part.length; i++) {
      var n = parseInt(part[i].trim(), 10);
      if (!isNaN(n)) sum += n;
    }
    return sum;
  }
  /** 根据技能计算护盾值（当 getShieldFromResolvedEffect 无法解析时使用） */
  function getShieldForSkill(attacker, skill) {
    if (!attacker || !skill) return NaN;
    var name = skill.name || '';
    if (name === '防御') return Math.max(0, getDisplayStat(attacker, 'def') || 0);
    if (name === '剑脊格挡') {
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var def = getDisplayStat(attacker, 'def') || 0;
      var str = getDisplayStat(attacker, 'str') || 0;
      var mult = lv === 1 ? { def: 0.5, str: 0.3 } : lv === 2 ? { def: 0.6, str: 0.3 } : lv === 3 ? { def: 0.7, str: 0.4 } : { def: 0.8, str: 0.4 };
      return Math.max(0, Math.floor(def * mult.def + str * mult.str));
    }
    if (name === '见切') {
      var lv = Math.max(1, parseInt(skill.level, 10) || 1);
      var def = getDisplayStat(attacker, 'def') || 0;
      var mult = lv === 1 ? 0.9 : lv === 2 ? 1.0 : lv === 3 ? 1.1 : 1.2;
      if (skill.advancement === 'A' || skill.advancement === 'B') mult = 1.2;
      return Math.max(0, Math.floor(def * mult));
    }
    return NaN;
  }
  /** 未使用属性点 = (level-1)*10 - 已分配到五维的 bonus 总和 */
  function getUnspentPoints(ch) {
    if (!ch) return 0;
    var level = Math.max(1, parseInt(ch.level, 10) || 1);
    var total = (level - 1) * FREE_POINTS_PER_LEVEL;
    var spent = FIVE_DIM_KEYS.reduce(function (sum, k) { return sum + (parseInt(ch[BONUS_KEYS[k]], 10) || 0); }, 0);
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
    var unlocked = ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
    return Math.max(0, total - unlocked.length);
  }
  var getSpecialSkillsForChar = window.色色地牢_character && window.色色地牢_character.getSpecialSkillsForChar ? window.色色地牢_character.getSpecialSkillsForChar : function () { return []; };
  var getSkillTagsString = window.色色地牢_character && window.色色地牢_character.getSkillTagsString ? window.色色地牢_character.getSkillTagsString : function (s) { return s && s.tags != null ? String(s.tags) : ''; };
  function getDisplayStat(ch, key) {
    if (!ch) return 0;
    var base = parseInt(ch[key], 10) || 0;
    if (BONUS_KEYS[key] != null) base += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
    if (ch.name === '达芙妮' && (key === 'str' || key === 'def')) base += Math.floor((ch.level != null ? ch.level : 1) * 2);
    if (ch.name === '达芙妮' && key === 'def') {
      var unlocked = ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
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
    if ((key === 'str' || key === 'agi' || key === 'int' || key === 'def') && ch.buffs && ch.buffs.length) {
      for (var i = 0; i < ch.buffs.length; i++) {
        var b = ch.buffs[i];
        var id = (b.id || b.name || '').trim();
        var layers = Math.max(0, parseInt(b.layers, 10) || 0);
        if (id === '攻势' && key === 'str') base += layers * 2;
        if (id === '守势' && key === 'agi') base += layers * 2;
        if (id === '力量强化' && key === 'str') base += 5;
        if (id === '攻击强化' && key === 'str') base += 5;
        if (id === '敏捷强化' && key === 'agi') base += 5;
        if (id === '智力强化' && key === 'int') base += 5;
        if (id === '防御强化' && key === 'def') base += 5;
      }
    }
    return base;
  }
  /** 达芙妮力量/防御的被动加成（狼族血脉 Lv×2；防御另有全副武装 Str×0.25）；或任意角色力量/敏捷来自【攻势】/【守势】的加成，用于属性行展示 breakdown */
  function getDisplayStatBreakdown(ch, key) {
    var total = getDisplayStat(ch, key);
    if (!ch) return { total: total, base: total, passive: null };
    if (ch.name === '达芙妮' && (key === 'str' || key === 'def')) {
      var baseOnly = parseInt(ch[key], 10) || 0;
      if (BONUS_KEYS[key] != null) baseOnly += parseInt(ch[BONUS_KEYS[key]], 10) || 0;
      var passiveVal = Math.floor((ch.level != null ? ch.level : 1) * 2);
      var passiveName = '狼族血脉';
      if (key === 'def') {
        var unlocked = ch.specialSkillsUnlocked && Array.isArray(ch.specialSkillsUnlocked) ? ch.specialSkillsUnlocked : [];
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
        if (id === '力量强化' && key === 'str' && layers > 0) parts.push({ val: 5, name: '力量强化' });
        if (id === '攻击强化' && key === 'str' && layers > 0) parts.push({ val: 5, name: '攻击强化' });
        if (id === '敏捷强化' && key === 'agi' && layers > 0) parts.push({ val: 5, name: '敏捷强化' });
        if (id === '智力强化' && key === 'int' && layers > 0) parts.push({ val: 5, name: '智力强化' });
        if (id === '防御强化' && key === 'def' && layers > 0) parts.push({ val: 5, name: '防御强化' });
      }
      if (parts.length > 0) {
        var bonusSum = 0;
        for (var j = 0; j < parts.length; j++) bonusSum += parts[j].val;
        var sourceText = baseOnly + parts.map(function (p) { return '+' + p.val + '（' + p.name + '）'; }).join('');
        return { total: total, base: baseOnly, passive: { value: bonusSum, name: parts.map(function (p) { return p.name; }).join('+') }, sourceText: sourceText };
      }
    }
    return { total: total, base: total, passive: null };
  }
  var SUMMON_BAIYA = window.色色地牢_character && window.色色地牢_character.createSummonBaiya ? window.色色地牢_character.createSummonBaiya(getDisplayStat) : null;
  function getBaiyaStatsFromOwner(owner) {
    return window.色色地牢_character && window.色色地牢_character.getBaiyaStatsFromOwner ? window.色色地牢_character.getBaiyaStatsFromOwner(owner, getDisplayStat) : { maxHp: 0, atk: 0, def: 0 };
  }
  /** 按技能等级取描述（支持 effectByLevel 数组，如狼式旋风 Lv1–Lv4） */
  function getSkillEffectForLevel(skill, lv) {
    var level = Math.max(1, parseInt(lv, 10) || 1);
    if (skill.effectByLevel && skill.effectByLevel.length) {
      level = Math.min(level, skill.effectByLevel.length);
      return skill.effectByLevel[level - 1] || skill.effectByLevel[0];
    }
    return skill.effect || '';
  }
  /** 构建用于技能描述解析的显示属性（可含未固化加点 deltas），供 resolveSkillEffectWithStats 使用 */
  function getDisplayStatsForSkill(ch, deltas) {
    if (!ch) return null;
    var d = deltas || {};
    var str = getDisplayStat(ch, 'str') + (d.str || 0);
    var agi = getDisplayStat(ch, 'agi') + (d.agi || 0);
    var int = getDisplayStat(ch, 'int') + (d.int || 0);
    var sta = getDisplayStat(ch, 'sta') + (d.sta || 0);
    var def = getDisplayStat(ch, 'def') + (d.def || 0);
    var displayStats = { str: str, agi: agi, int: int, sta: sta, def: def, luk: getDisplayStat(ch, 'luk') || 0, level: ch.level != null ? ch.level : 1 };
    if (ch.atk != null && ch.atk !== undefined) displayStats.atk = parseInt(ch.atk, 10) || 0;
    else displayStats.atk = str;
    var 守势L = 0;
    var 攻势L = 0;
    if (ch.buffs && ch.buffs.length) {
      for (var i = 0; i < ch.buffs.length; i++) {
        var b = ch.buffs[i];
        if ((b.id || b.name) === '守势') 守势L = Math.max(0, parseInt(b.layers, 10) || 0);
        if ((b.id || b.name) === '攻势') 攻势L = Math.max(0, parseInt(b.layers, 10) || 0);
      }
    }
    displayStats.转化层数 = 守势L;
    displayStats.守势层数 = 守势L;
    displayStats.攻势层数 = 攻势L;
    return displayStats;
  }
  /** 将技能描述中的 [Str × 0.2]、[等级 × 2]、[转化层数×5%] 等占位符替换为角色属性计算值（向下取整）；纳刀用当前守势层数作为转化层数 */
  function resolveSkillEffect(effect, ch) {
    if (!effect || !ch) return effect || '';
    var displayStats = getDisplayStatsForSkill(ch, null);
    return resolveSkillEffectWithStats(effect, displayStats);
  }
  /** 用给定的显示属性对象解析技能描述中的占位符（支持 [Str × 0.2]、[等级 × 2]、[Def × 0.8 + Str × 0.4] 等）；计算结果以占位符输出，由 wrapBuffRefs 转为带颜色、加粗、悬停显示公式的 span */
  function resolveSkillEffectWithStats(effect, displayStats) {
    if (!effect || !displayStats) return effect || '';
    var statMap = { Str: 'str', Agi: 'agi', Int: 'int', Sta: 'sta', Def: 'def', Atk: 'atk' };
    var termRe = /(Str|Agi|Int|Sta|Def|Atk)\s*×\s*([\d.]+)/g;
    var levelRe = /等级\s*×\s*([\d.]+)/g;
    var CALC_MARK = '\x01CALC\x02';
    var CALC_END = '\x02\x01';
    function makePlaceholder(key, formula, value) {
      return CALC_MARK + key + '\x02' + formula + '\x02' + value + CALC_END;
    }
    return effect.replace(/\[([^\]]+)\]/g, function (_, inner) {
      var convertMatch = inner.match(/^转化层数×([\d.]+)%$/);
      if (convertMatch) {
        var pct = parseFloat(convertMatch[1], 10);
        var layers = displayStats.转化层数 != null ? displayStats.转化层数 : 0;
        var valueNum = layers * pct;
        var valueStr = valueNum % 1 === 0 ? String(valueNum) : valueNum.toFixed(1);
        var formula = '转化层数×' + convertMatch[1] + '% = 守势' + layers + '层×' + convertMatch[1] + '% = ' + valueStr + '%';
        return makePlaceholder('纳刀伤害', formula, valueStr + '%');
      }
      var lukPctMatch = inner.match(/^幸运×5%$/);
      if (lukPctMatch) {
        var lukVal = displayStats.luk != null ? displayStats.luk : 0;
        var pctVal = Math.min(100, Math.max(0, lukVal * 5));
        var pctStr = pctVal % 1 === 0 ? String(pctVal) : pctVal.toFixed(1);
        var formulaLuk = '幸运×5% = ' + lukVal + '×5% = ' + pctStr + '%';
        return makePlaceholder('白夜即死', formulaLuk, pctStr + '%');
      }
      var shouMatch = inner.match(/^守势层数×([\d.]+)%$/);
      if (shouMatch) {
        var shouPct = parseFloat(shouMatch[1], 10);
        var shouLayers = displayStats.守势层数 != null ? displayStats.守势层数 : 0;
        var shouVal = shouLayers * shouPct;
        var shouStr = shouVal % 1 === 0 ? String(shouVal) : shouVal.toFixed(1);
        var formulaShou = '守势层数×' + shouMatch[1] + '% = ' + shouLayers + '层×' + shouMatch[1] + '% = ' + shouStr + '%';
        return makePlaceholder('心眼闪避', formulaShou, shouStr + '%');
      }
      var gongMatch = inner.match(/^攻势层数×([\d.]+)%$/);
      if (gongMatch) {
        var gongPct = parseFloat(gongMatch[1], 10);
        var gongLayers = displayStats.攻势层数 != null ? displayStats.攻势层数 : 0;
        var gongVal = gongLayers * gongPct;
        var gongStr = gongVal % 1 === 0 ? String(gongVal) : gongVal.toFixed(1);
        var formulaGong = '攻势层数×' + gongMatch[1] + '% = ' + gongLayers + '层×' + gongMatch[1] + '% = ' + gongStr + '%';
        return makePlaceholder('心眼暴击', formulaGong, gongStr + '%');
      }
      var terms = [];
      inner.replace(levelRe, function (_, coef) {
        var val = Math.floor((Number(displayStats.level) || 1) * parseFloat(coef));
        terms.push({ key: 'level', formula: 'Lv × ' + coef, value: val });
        return '';
      });
      var innerForStat = inner.replace(levelRe, function () { return ''; });
      var m;
      termRe.lastIndex = 0;
      while ((m = termRe.exec(innerForStat)) !== null) {
        var key = statMap[m[1]];
        if (key) {
          var mult = parseFloat(m[2], 10);
          var val = Math.floor((Number(displayStats[key]) || 0) * mult);
          terms.push({ key: key, formula: m[1] + ' × ' + m[2], value: val });
        }
      }
      if (terms.length === 0) return '[' + inner + ']';
      return terms.map(function (t) { return makePlaceholder(t.key, t.formula, String(t.value)); }).join(' + ');
    });
  }
  var SKILL_CALC_PLACEHOLDER_RE = /\x01CALC\x02([^\x02]+)\x02([^\x02]+)\x02([^\x02]+)\x02\x01/g;
  /** 初始化战斗界面：重置缓存后交由 battle.js 的 initBattle 完成渲染与绑定 */
  function initBattle() {
    _lastKnownParty = null;
    _lastKnownEnemies = null;
    if (typeof window.BattleGrid !== 'undefined' && window.BattleGrid.initBattle) {
      window.BattleGrid.initBattle({
        getParty: getParty,
        getEnemyParty: getEnemyParty,
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
        SKILL_MUPAIZI_SVG: SKILL_MUPAIZI_SVG
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
      var text = (typeof window !== 'undefined' && window.BattleGrid && typeof window.BattleGrid.getBuffEffectTooltip === 'function')
        ? window.BattleGrid.getBuffEffectTooltip(buffId, layers) : (getBuffTooltipText(buffId) || '');
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
      var displayed = numEl ? (parseInt(numEl.textContent, 10) || 0) : (baseNum + bonusNum);
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
        if (buffTooltipOpenByClick && !e.target.closest('.buff-ref') && !e.target.closest('.slot-buff-pill') && !e.target.closest('.skill-calc') && !e.target.closest('.attr-val-breakdown') && !e.target.closest('.data-report-value-breakdown') && !e.target.closest('#buff-tooltip-popup')) {
          buffTooltipOpenByClick = false;
          hide();
        }
      });
    }
  }

  injectStyles();
  if (typeof $ !== 'undefined') $(function () { initBattle(); initSidebar(); initBuffTooltip(); });
  else document.addEventListener('DOMContentLoaded', function () { initBattle(); initSidebar(); initBuffTooltip(); });
})();
