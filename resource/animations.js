/**
 * 动画资源（APNG，Hugging Face 仓库 HentaiDungeonAnimations 目录）
 * 格式限定：本目录仅使用 .html / .css / .js
 * 使用注释按 Slash / Recovery / State / Hit 等分组。
 */
(function () {
  window.ANIMATIONS = {
    // ---------- Slash 组（斩击/挥砍）----------
    Slash: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Slash.png', //黄色单斩击
    SlashFire: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/SlashFire.png', //橙色火焰斩击
    SlashIce: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/SlashIce.png', //蓝色冰斩击
    SlashPhoton: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/SlashPhoton.png', //类似弹幕的黄色打击
    SlashSpecial1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/SlashSpecial1.png', //三次斩击然后圆弧斩黄色
    SlashSpecial2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/SlashSpecial2.png', //V型橙红色斩击
    SlashSpecial3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/SlashSpecial3.png', //紫色斩击加符文
    SlashThunder: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/SlashThunder.png', //雷电斩击
    Slash4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Slash4.png', //红色斩击衔接爆炸
    Slash5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Slash5.png', //蓝色弧形斩击
    Slash6: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Slash6.png', //绿色弧形斩击

    // ---------- Recovery 组（恢复）----------
    Recovery3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Recovery3.png', //白色护盾
    Recovery4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Recovery4.png', // 获得护盾/传送
    Recovery5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Recovery5.png', //淡绿色特效
    Recovery1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Recovery1.png', //绿色螺旋上升随后类似召唤
    Recovery2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Recovery2.png', //治愈
    Revival1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Revival1.png', //黄色上升随后类似召唤
    Revival2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Revival2.png', //橙黄色类似从上到下降临

    // ---------- State 组（状态）----------
    StateSilent: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateSilent.png', //沉默
    StateUp1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateUp1.png', //类似从下往上喷发/召唤
    StateUp2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateUp2.png', //蓝色令牌召唤
    StateDeath: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateDeath.png', //骷髅和画X
    StateDown1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateDown1.png', //从上往下淡蓝色类似封印
    StateDown2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateDown2.png', //从下往上类似紫色缠绕
    StateDown3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateDown3.png', //绘画封印然后破碎
    StateParalys: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateParalys.png', //类似黄色闪电？
    StatePoison: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StatePoison.png', //中毒
    StateSleep: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateSleep.png', //蓝色聚集涡流效果
    StateChaos: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateChaos.png', //困惑
    StateDark: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StateDark.png', //深蓝色漩涡
    'up-1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/up-1.png', //黄色向上喷发

    // ---------- Stick 组（棍棒/杖）----------
    Stick: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Stick.png', //黄色打击
    StickPhoton: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StickPhoton.png', //类似弹幕的黄色打击
    StickSpecial1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StickSpecial1.png', //两次打击
    StickSpecial2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StickSpecial2.png', //大打击
    StickSpecial3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StickSpecial3.png', //另一种大爆炸

    // ---------- PreSpecial 组（预备特技）----------
    PreSpecial1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/PreSpecial1.png', //黄色雷电符文+爆炸
    PreSpecial2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/PreSpecial2.png', //白色雷电符文+爆炸
    PreSpecial3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/PreSpecial3.png', //紫黑色雷电符文+爆炸

    // ---------- Claw 组（爪击）----------
    Claw: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Claw.png', //深褐色爪击
    ClawSpecial1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/ClawSpecial1.png', //深红色三次爪击
    ClawSpecial2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/ClawSpecial2.png', //深红色大爪击

    // ---------- Cure 组（治疗）----------
    Cure2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cure2.png', //淡蓝色圆形+特效
    Cure3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cure3.png', //淡蓝色螺旋上升
    Cure4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cure4.png', //淡蓝色环绕轨道/淡蓝色球形斩击
    Cure1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cure1.png', //蓝色星星上升
    Cure5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cure5.png', //淡蓝色旋转特效
    Cure6: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cure6.png', //淡蓝色旋转特效（慢）
    'E-cure1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-cure1.png', //淡蓝色椭圆

    // ---------- Hit 组（受击/命中）----------
    Hit1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Hit1.png', //黄色打击
    Hit2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Hit2.png', //橙色打击
    HitFire: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/HitFire.png', //橙色爆炸
    HitIce: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/HitIce.png', //蓝色冰爆炸
    HitPhoton: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/HitPhoton.png', //类似子弹打击
    HitSpecial2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/HitSpecial2.png', //橙色椭圆爆炸
    HitSpecial1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/HitSpecial1.png', //黄色打击
    HitThunder: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/HitThunder.png', //雷电打击
    Hit3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Hit3.png', //红色打击

    // ---------- Fire 组（火焰）----------
    Fire2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Fire2.png', //橙色火焰从下到上
    Fire3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Fire3.png', //大号橙色火焰从下到上
    Fire1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Fire1.png', //小号橙色火焰从下到上
    efecto_fuego: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/efecto_fuego.png', //橙色火焰从左到右
    'E-fire1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire1.png', //旋转多色火焰
    'E-fire2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire2.png', //快速橙色火焰爆炸
    'E-fire3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire3.png', //圆形火焰（宽）
    'E-fire4': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire4.png', //圆形火焰（窄）
    'E-fire5': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire5.png', //圆形火焰（转圈）
    'E-fire6': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire6.png', //五个多色火焰
    'E-fire7': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire7.png', //多重火焰下坠
    'E-fire8': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire8.png', //大字爆
    'E-fire9': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire9.png', //火焰倾倒
    'E-fire10': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire10.png', //火星打击后爆炸
    'E-fire11': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-fire11.png', //火焰子母弹
    Fire4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Fire4.png', //火焰召唤并爆炸
    Fire5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Fire5.png', //火焰召唤并爆炸（快速）

    // ---------- Ice 组（冰）----------
    Ice1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Ice1.png', //多重冰打击
    Ice2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Ice2.png', //冰冻
    Ice3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Ice3.png', //大冰冻
    Ice4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Ice4.png', //冰雨打击
    Ice5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Ice5.png', //冰砾下落
    Ice6: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Ice6.png', //冰冻爆炸

    // ---------- Thunder 组（雷）----------
    Thunder2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Thunder2.png', //黄色/蓝色电击
    Thunder1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Thunder1.png', //黄色雷击
    Thunder3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Thunder3.png', //大号黄色雷击
    Thunder4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Thunder4.png', //强力黄色雷击
    Thunder5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Thunder5.png', //紫色雷击
    'E-thunder1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-thunder1.png', //小紫色雷击
    'E-thunder2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-thunder2.png', //大量蓝色雷电打击
    'E-thunder3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-thunder3.png', //快速大紫色雷击

    // ---------- Holy 组（神圣/圣光）----------
    Holy1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Holy1.png', //圣光剑雨打击
    Holy2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Holy2.png', //双蛇圣杖
    Holy3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Holy3.png', //圆形圣光
    Holy4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Holy4.png', //圣十字
    Holy5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Holy5.png', //天降圣光

    // ---------- Water 组（水）----------
    Water5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Water5.png', //水龙
    Water1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Water1.png', //水泡
    Water2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Water2.png', //水流
    Water3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Water3.png', //大水泡

    // ---------- Wind 组（风）----------
    Wind3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Wind3.png', //三重绿色打击
    Wind2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Wind2.png', //墨绿回旋
    Wind4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Wind4.png', //龙卷风
    Wind5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Wind5.png', //多重风刃
    'E-wind1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-wind1.png', //中心风波
    'E-wind2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-wind2.png', //左右大风
    'E-wind3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-wind3.png', //右风波

    // ---------- Earth 组（地/土）----------
    Earth3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Earth3.png', //大石块
    Earth4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Earth4.png', //石头从下长出
    Earth5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Earth5.png', //石头脚踩
    Earth1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Earth1.png', //石头聚集
    Earth2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Earth2.png', //石头下砸爆炸

    // ---------- Darkness 组（暗/黑暗）----------
    Darkness1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Darkness1.png', //黑暗螺旋爆炸
    Darkness2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Darkness2.png', //黑暗火焰
    Darkness3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Darkness3.png', //黑暗涡流
    Darkness4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Darkness4.png', //黑暗圆盘爆炸
    Darkness5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Darkness5.png', //黑洞
    Dark1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Dark1.png', //黑暗爆炸
    'E-dark1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-dark1.png', //黑暗打击+爆炸

    // ---------- Light 组（光）----------
    Light2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Light2.png', //下坠光柱
    Light3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Light3.png', //光火
    Light4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Light4.png', //中心大发光
    Light1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Light1.png', //上升光柱
    'E-light1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-light1.png', //光子汇集
    'E-light2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-light2.png', //光火上升
    'r-light1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/r-light1.png', //光切割
    'r-light2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/r-light2.png', //蓝色光切割
    'r-light3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/r-light3.png', //蓝色光切割2

    // ---------- Mist 组（雾）----------
    Mist: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Mist.png', //白色雾气
    'Mist-Pink': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Mist-Pink.png', //紫色雾气

    // ---------- 其他单条（嚎叫/诅咒/激光/魔法/爆炸/闪光/枪/箭/变身/流星/花粉/歌/音速/特技等）----------
    Howl: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Howl.png',
    Curse: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Curse.png',
    Laser1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Laser1.png',
    Laser2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Laser2.png',
    Magic2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Magic2.png',
    Magic1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Magic1.png',
    Explosion1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Explosion1.png',
    Explosion2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Explosion2.png',
    Flash: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Flash.png',
    Gun1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Gun1.png',
    Gun2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Gun2.png',
    Gun3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Gun3.png',
    ArrowSpecial: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/ArrowSpecial.png',
    Monster_Change_Big: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Monster_Change_Big.png',
    Meteor: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Meteor.png',
    Pollen: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Pollen.png',
    Song: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Song.png',
    Sonic: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Sonic.png',
    Special1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Special1.png',
    Special2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Special2.png',
    Special3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Special3.png',

    // ---------- E-sword 组（剑系）----------
    'E-sword1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword1.png',
    'E-sword2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword2.png',
    'E-sword3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword3.png',
    'E-sword4': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword4.png',
    'E-sword5': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword5.png',
    'E-sword6': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword6.png',
    'E-sword7': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword7.png',
    'E-sword8': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword8.png',
    'E-sword9': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword9.png',
    'E-sword10': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-sword10.png',

    // ---------- E-spear 组（枪矛系）----------
    'E-spear1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-spear1.png',
    'E-spear2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-spear2.png',
    'E-spear3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-spear3.png',

    // ---------- E-blow 组（打击/吹飞系）----------
    'E-blow1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow1.png',
    'E-blow3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow3.png',
    'E-blow4': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow4.png',
    'E-blow5': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow5.png',
    'E-blow6': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow6.png',
    'E-blow7': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow7.png',
    'E-blow8': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow8.png',
    'E-blow9': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow9.png',
    'E-blow10': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blow10.png',

    // ---------- E-claw 组（爪系）----------
    'E-claw1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-claw1.png',
    'E-claw2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-claw2.png',
    'E-claw3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-claw3.png',

    // ---------- E-gun 组（枪械系）----------
    'E-gun1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-gun1.png',
    'E-gun2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-gun2.png',
    'E-gun3': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-gun3.png',

    // ---------- E-其他（护盾/怪物/先驱/陨石/治疗/羽毛/血等）----------
    'E-guard1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-guard1.png',
    'E-monster1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-monster1.png',
    'E-Herald1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-Herald1.png',
    'E-PhantasmMeteor': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-PhantasmMeteor.png',
    'E-PhantasmMeteor2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-PhantasmMeteor2.png',
    'E-re1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-re1.png',
    'E-FeatherBomb': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-FeatherBomb.png',
    'E-blood1': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blood1.png',
    'E-blood2': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/E-blood2.png',

    // ---------- pipo 效果图----------
    'pipo-mapeffect022_192': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/pipo-mapeffect022_192.png',
    'pipo-btleffect209_192': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/pipo-btleffect209_192.png',
    'pipo-btleffect210_192': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/pipo-btleffect210_192.png',
    'pipo-btleffect211_192': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/pipo-btleffect211_192.png',
    'pipo-btleffect212_192': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/pipo-btleffect212_192.png',
    'pipo-btleffect213_192': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/pipo-btleffect213_192.png',
    'pipo-btleffect214_192': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/pipo-btleffect214_192.png',

    // ---------- 单独分组（咬/黑洞/致盲/吹飞/破盾/施法/劈砍/蚀/以太/星闪/雷电/逻辑炸弹/新星/狂暴/封印/射击/暴风/突刺/病毒/屏障/祝福/吸收等）----------
    ACQ011_Bite: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/ACQ011_Bite.png',
    Blackhole: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Blackhole.png',
    Blind: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Blind.png',
    Blow1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Blow1.png',
    Blow: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Blow.png',
    Breath: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Breath.png',
    ClawPhoton: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/ClawPhoton.png',
    AC2Q018_Barrier_Break: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/AC2Q018_Barrier_Break.png',
    '-AC2Q017_Barrier': 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/-AC2Q017_Barrier.png',
    Cast1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cast1.png',
    Cast2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cast2.png',
    Cast3: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cast3.png',
    Cast4: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cast4.png',
    Cast5: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cast5.png',
    Cast6: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cast6.png',
    Cleave: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Cleave.png',
    Eclipse: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Eclipse.png',
    Ether: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Ether.png',
    StarFlare: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StarFlare.png',
    Lightning1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Lightning1.png',
    Lightning2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Lightning2.png',
    LogicBomb: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/LogicBomb.png',
    Nova: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Nova.png',
    Rage: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Rage.png',
    Seal: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Seal.png',
    Shot: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Shot.png',
    Tempest: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Tempest.png',
    ACQ003_Thrust1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/ACQ003_Thrust1.png',
    Virus1: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Virus1.png',
    Virus2: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Virus2.png',
    StarBurst: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/StarBurst.png',
    Confuse: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Confuse.png',
    Benediction: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Benediction.png',
    Absorb: 'https://huggingface.co/think-denim-frisk/HentaiDungeon/resolve/main/HentaiDungeonAnimations/Absorb.png',
  };

  /** 各 APNG 总播放时长（毫秒），用于只播放一遍时设置定时 */
  window.ANIMATION_DURATIONS = {
    Slash: 100,
    SlashFire: 280,
    SlashIce: 260,
    SlashPhoton: 80,
    SlashSpecial1: 360,
    SlashSpecial2: 320,
    SlashSpecial3: 560,
    SlashThunder: 280,
    'Slash4': 240,
    'Slash5': 260,
    'Slash6': 160,
    Recovery3: 440,
    Recovery4: 360,
    Recovery5: 600,
    Recovery1: 600,
    Recovery2: 380,
    Revival1: 500,
    Revival2: 600,
    StateSilent: 380,
    StateUp1: 380,
    StateUp2: 480,
    StateDeath: 400,
    StateDown1: 240,
    StateDown2: 500,
    StateDown3: 520,
    StateParalys: 440,
    StatePoison: 300,
    StateSleep: 440,
    StateChaos: 480,
    StateDark: 400,
    'up-1': 480,
    Stick: 140,
    StickPhoton: 180,
    StickSpecial1: 200,
    StickSpecial2: 180,
    StickSpecial3: 220,
    PreSpecial1: 540,
    PreSpecial2: 540,
    PreSpecial3: 540,
    Claw: 120,
    ClawSpecial1: 460,
    ClawSpecial2: 240,
    Cure2: 520,
    Cure3: 600,
    Cure4: 260,
    Cure1: 580,
    Cure5: 1160,
    Cure6: 580,
    'E-cure1': 240,
    Hit1: 80,
    Hit2: 60,
    HitFire: 160,
    HitIce: 200,
    HitPhoton: 100,
    HitSpecial2: 140,
    HitSpecial1: 180,
    HitThunder: 140,
    Hit3: 200,
    Fire2: 200,
    Fire3: 520,
    Fire1: 600,
    efecto_fuego: 1000,
    'E-fire1': 480,
    'E-fire2': 320,
    'E-fire3': 320,
    'E-fire4': 320,
    'E-fire5': 300,
    'E-fire6': 360,
    'E-fire7': 240,
    'E-fire8': 400,
    'E-fire9': 380,
    'E-fire10': 800,
    'E-fire11': 680,
    Fire4: 1980,
    Fire5: 980,
    Ice1: 300,
    Ice2: 420,
    Ice3: 180,
    Ice4: 80,
    Ice6: 1000,
    Ice5: 480,
    Thunder2: 120,
    Thunder1: 300,
    Thunder3: 100,
    Thunder4: 240,
    Thunder5: 420,
    'E-thunder1': 220,
    'E-thunder2': 1380,
    'E-thunder3': 300,
    Holy1: 540,
    Holy2: 600,
    Holy3: 300,
    Holy4: 500,
    Holy5: 540,
    'E-holy1': 540,
    'E-holy2': 600,
    'E-holy3': 300,
    Water5: 380,
    Water1: 460,
    Water2: 540,
    Water3: 300,
    Wind3: 280,
    Wind2: 300,
    Wind4: 200,
    Wind5: 560,
    'E-wind1': 380,
    'E-wind2': 620,
    'E-wind3': 360,
    Earth3: 140,
    Earth4: 160,
    Earth5: 600,
    Earth1: 500,
    Earth2: 360,
    Darkness1: 400,
    Darkness2: 420,
    Darkness3: 180,
    Darkness5: 500,
    Dark1: 1000,
    Darkness4: 520,
    'E-dark1': 300,
    Light2: 600,
    Light3: 600,
    Light4: 600,
    Light1: 600,
    'E-light1': 500,
    'E-light2': 580,
    'r-light1': 140,
    'r-light2': 160,
    'r-light3': 160,
    Mist: 100,
    'Mist-Pink': 100,
    Howl: 200,
    Curse: 320,
    Laser1: 420,
    Laser2: 420,
    Magic2: 380,
    Magic1: 280,
    Explosion1: 240,
    Explosion2: 600,
    Flash: 300,
    Gun1: 420,
    Gun2: 500,
    Gun3: 340,
    ArrowSpecial: 220,
    Monster_Change_Big: 840,
    Meteor: 440,
    Pollen: 280,
    Song: 220,
    Sonic: 120,
    Special1: 120,
    Special2: 580,
    Special3: 380,
    'E-sword1': 480,
    'E-sword2': 420,
    'E-sword3': 240,
    'E-sword4': 640,
    'E-sword5': 400,
    'E-sword6': 160,
    'E-sword7': 240,
    'E-sword8': 320,
    'E-sword9': 280,
    'E-sword10': 380,
    'E-spear1': 260,
    'E-spear2': 320,
    'E-spear3': 440,
    'E-blow1': 180,
    'E-blow3': 280,
    'E-blow4': 200,
    'E-blow5': 340,
    'E-blow6': 600,
    'E-blow7': 240,
    'E-blow8': 180,
    'E-blow9': 220,
    'E-blow10': 240,
    'E-claw1': 280,
    'E-claw2': 280,
    'E-claw3': 320,
    'E-gun1': 340,
    'E-gun2': 480,
    'E-gun3': 520,
    'E-guard1': 440,
    'E-monster1': 340,
    'E-Herald1': 360,
    'E-PhantasmMeteor': 860,
    'E-PhantasmMeteor2': 580,
    'E-re1': 520,
    'E-FeatherBomb': 440,
    'E-blood1': 940,
    'E-blood2': 320,
    'pipo-mapeffect022_192': 400,
    'pipo-btleffect209_192': 300,
    'pipo-btleffect210_192': 300,
    'pipo-btleffect211_192': 300,
    'pipo-btleffect212_192': 300,
    'pipo-btleffect213_192': 300,
    'pipo-btleffect214_192': 300,
    ACQ011_Bite: 580,
    Blackhole: 980,
    Blind: 840,
    Blow1: 560,
    Blow: 120,
    Breath: 300,
    ClawPhoton: 160,
    AC2Q018_Barrier_Break: 900,
    '-AC2Q017_Barrier': 860,
    Cast1: 1120,
    Cast2: 1120,
    Cast3: 280,
    Cast4: 560,
    Cast5: 300,
    Cast6: 600,
    Cleave: 280,
    Eclipse: 1000,
    Ether: 900,
    StarFlare: 960,
    Lightning1: 1000,
    Lightning2: 120,
    LogicBomb: 1000,
    Nova: 2000,
    Rage: 600,
    Seal: 600,
    Shot: 280,
    Tempest: 1800,
    ACQ003_Thrust1: 280,
    Virus1: 1180,
    Virus2: 580,
    StarBurst: 740,
    Confuse: 500,
    Benediction: 1000,
    Absorb: 500,
  };
})();
