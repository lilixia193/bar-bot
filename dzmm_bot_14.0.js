// ==UserScript==
// @name         bar Bot v14 -恼羞成怒不想修改版本
// @namespace    http://tampermonkey.net/
// @version      14.0.0
// @description  第一酒馆社群RPG
// @author       你栗姐
// @match        *://dzmm.ai/chat*
// @match        *://*.dzmm.ai/chat*
// @match        *://aifukk.com/chat*
// @match        *://*.aifukk.com/chat*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    if (!location.pathname.startsWith('/chat')) return;

    // ═══════════════════════════════════════════════════════════
    //  CFG 配置
    // ═══════════════════════════════════════════════════════════
    const CFG = {
        BOT_NAME: '1',
        ADMIN: ['栗子'],
        GUILD_COST: 300,                          // 创建公会费用
        PAYROLL_GAP_MS: 6 * 24 * 60 * 60 * 1000,  // 俸禄间隔6天
        AUTO_ADVENTURE_NOTICE: true,              // 自动冒险归来通知
        DUEL_TIMEOUT_MS: 180000,                  // 决斗等待3分钟
        SIGN_BONUS: [20, 25, 30, 35, 40, 50],     // 连续签到奖励（对应第1-6天+）
        COOLDOWN_MS: 2500,                        // Bot冷静期
        MAX_FP: 200,                              // 指纹集合最大容量
        MAX_LOG: 50                               // 日志最大行数
    };

    // ═══════════════════════════════════════════════════════════
    //  DATA 游戏数据
    // ═══════════════════════════════════════════════════════════
    const DATA = {
        careers: [
            { id: 'sword', name: '流浪剑士', desc: '攻击力出众', atk: 15, def: 8 },
            { id: 'mage', name: '秘法行者', desc: '法术强大', atk: 10, def: 6 },
            { id: 'rogue', name: '暗影游侠', desc: '敏捷猎手', atk: 12, def: 5 },
            { id: 'priest', name: '圣光牧师', desc: '擅长治愈', atk: 8, def: 12 },
            { id: 'bard', name: '吟游诗人', desc: '歌声魔法', atk: 9, def: 7 },
            { id: 'ranger', name: '森林游侠', desc: '百步穿杨', atk: 14, def: 6 },
            { id: 'paladin', name: '圣殿骑士', desc: '攻守兼备', atk: 11, def: 14 },
            { id: 'necro', name: '死灵法师', desc: '操纵亡灵', atk: 13, def: 4 },
            { id: 'monk', name: '武僧', desc: '以拳入道', atk: 16, def: 10 },
            { id: 'alchemist', name: '炼金术士', desc: '神奇药剂', atk: 7, def: 8 }
        ],
        levels: [
            { lv: 1, need: 0 }, { lv: 2, need: 100 }, { lv: 3, need: 300 }, { lv: 4, need: 600 },
            { lv: 5, need: 1000 }, { lv: 6, need: 1500 }, { lv: 7, need: 2200 }, { lv: 8, need: 3000 },
            { lv: 9, need: 4000 }, { lv: 10, need: 5500 }, { lv: 11, need: 7200 }, { lv: 12, need: 9000 },
            { lv: 13, need: 12000 }, { lv: 14, need: 16000 }, { lv: 15, need: 999999 }
        ],
        equipments: [
            // 武器（8件）
            { name: '生锈的铁剑', t: 'weapon', atk: 3, def: 0, luck: 0, hp: 0, p: 30 },
            { name: '铁剑', t: 'weapon', atk: 8, def: 0, luck: 0, hp: 0, p: 80 },
            { name: '钢剑', t: 'weapon', atk: 15, def: 0, luck: 0, hp: 0, p: 200 },
            { name: '魔法杖', t: 'weapon', atk: 12, def: 0, luck: 0, hp: 0, p: 150 },
            { name: '暗影匕首', t: 'weapon', atk: 18, def: 0, luck: 0, hp: 0, p: 350 },
            { name: '圣光之锤', t: 'weapon', atk: 20, def: 0, luck: 0, hp: 0, p: 500 },
            { name: '龙牙长枪', t: 'weapon', atk: 30, def: 0, luck: 0, hp: 0, p: 1200 },
            { name: '传说之剑', t: 'weapon', atk: 50, def: 0, luck: 0, hp: 0, p: 5000 },
            // 防具（5件）
            { name: '布衣', t: 'armor', atk: 0, def: 3, luck: 0, hp: 0, p: 30 },
            { name: '皮甲', t: 'armor', atk: 0, def: 8, luck: 0, hp: 0, p: 80 },
            { name: '铁甲', t: 'armor', atk: 0, def: 15, luck: 0, hp: 0, p: 250 },
            { name: '钢甲', t: 'armor', atk: 0, def: 25, luck: 0, hp: 0, p: 600 },
            { name: '龙鳞甲', t: 'armor', atk: 0, def: 40, luck: 0, hp: 0, p: 2000 },
            // 饰品（3件）
            { name: '铜戒指', t: 'accessory', atk: 0, def: 0, luck: 5, hp: 0, p: 100 },
            { name: '银戒指', t: 'accessory', atk: 0, def: 0, luck: 12, hp: 0, p: 400 },
            { name: '护身符', t: 'accessory', atk: 0, def: 0, luck: 0, hp: 30, p: 300 },
            // 特殊（5件）
            { name: '狂战士手套', t: 'accessory', atk: 8, def: 0, luck: 0, hp: 0, p: 800 },
            { name: '守护披风', t: 'armor', atk: 0, def: 18, luck: 0, hp: 10, p: 900 },
            { name: '幸运金币', t: 'accessory', atk: 0, def: 0, luck: 20, hp: 0, p: 1500 },
            { name: '生命之戒', t: 'accessory', atk: 0, def: 0, luck: 0, hp: 50, p: 1200 },
            { name: '刺客之刃', t: 'weapon', atk: 22, def: 0, luck: 5, hp: 0, p: 800 }
        ],
        drinks: [
            { name: '蜂蜜暖酒', price: 30, hp: 25, txt: '蜂蜜暖酒，三十金。入口甘甜，暖流涌遍全身。', eff: '❤️+25 HP' },
            { name: '巡夜者', price: 60, buff: '暴击+15%', txt: '巡夜者，六十金。杯底银光闪烁。', eff: '🌀暴击+15%' },
            { name: '忘忧酒', price: 100, clear: ['恐惧','中毒'], txt: '忘忧酒，一百金。烦恼如烟散去。', eff: '🌀清除负面' },
            { name: '血色黎明', price: 150, buff: '濒死反击+50%', txt: '血色黎明，给不怕死的人。', eff: '🌀低血攻击+50%' },
            { name: '初来者', price: 0, txt: '初来者，酒馆送的。', eff: '🌀首次保护' },
            { name: '幽灵之吻', price: 250, buff: '闪避+25%', txt: '幽灵之吻，二百五十金。杯口白雾缭绕。', eff: '🌀闪避+25%' }
        ],
        adventures: [
            { name: '迷雾森林', lv: 1, mins: 30, exp: '30-60', gold: '15-40', drops: ['哥布林匕首','草药'], monsters: ['哥布林','史莱姆'] },
            { name: '废弃矿坑', lv: 3, mins: 45, exp: '50-100', gold: '30-70', drops: ['水晶碎片','矿工镐'], monsters: ['骷髅兵','食人花'] },
            { name: '黑沼泽', lv: 5, mins: 60, exp: '80-150', gold: '50-120', drops: ['沼泽之眼','毒囊'], monsters: ['暗影狼','沼泽巨蟒'] },
            { name: '龙脊山脉', lv: 8, mins: 90, exp: '150-300', gold: '100-250', drops: ['龙鳞','火焰精华'], monsters: ['火元素','岩石巨人'] },
            { name: '暗影之城', lv: 10, mins: 120, exp: '250-500', gold: '200-500', drops: ['暗影水晶','亡灵之书'], monsters: ['暗影刺客','亡灵骑士'] },
            { name: '天空之岛', lv: 12, mins: 150, exp: '400-800', gold: '400-800', drops: ['天使之羽','风暴核心'], monsters: ['风暴鹰','天使守卫'] },
            { name: '深渊裂隙', lv: 15, mins: 180, exp: '800-1500', gold: '800-1500', drops: ['深渊之心','混沌之石'], monsters: ['深渊恶魔','混沌之眼'] }
        ],
        monsters: [
            { name: '哥布林', lv: 1, desc: '绿皮小怪物，成群出没。' },
            { name: '史莱姆', lv: 1, desc: '果冻状生物，物理攻击难以奏效。' },
            { name: '骷髅兵', lv: 3, desc: '被诅咒的亡者士兵。' },
            { name: '食人花', lv: 3, desc: '巨大的食肉植物。' },
            { name: '暗影狼', lv: 5, desc: '潜伏在黑暗中的猛兽。' },
            { name: '沼泽巨蟒', lv: 5, desc: '黑沼泽的霸主。' },
            { name: '火元素', lv: 8, desc: '纯粹的火焰化身。' },
            { name: '岩石巨人', lv: 8, desc: '由巨石构成的守护者。' },
            { name: '暗影刺客', lv: 10, desc: '来无影去无踪的杀手。' },
            { name: '亡灵骑士', lv: 10, desc: '曾经荣耀的骑士，如今只剩怨念。' },
            { name: '风暴鹰', lv: 12, desc: '天空之岛的猛禽。' },
            { name: '天使守卫', lv: 12, desc: '守护天空之岛的光之使者。' },
            { name: '深渊恶魔', lv: 15, desc: '来自深渊的恐怖存在。' },
            { name: '混沌之眼', lv: 15, desc: '凝视它的人会失去理智。' }
        ]
    };

    // ═══════════════════════════════════════════════════════════
    //  核心状态
    // ═══════════════════════════════════════════════════════════
    let cooldownUntil = 0;
    let observerRef = null;
    const seenFingerprints = new Set();
    const pendingDuels = new Map();  // uid -> { targetUid, targetNick, timeout }
    const activeDuels = new Map();   // uid -> { vsUid, round }

    // ═══════════════════════════════════════════════════════════
    //  U 工具函数
    // ═══════════════════════════════════════════════════════════
    const U = {
        sleep: ms => new Promise(r => setTimeout(r, ms)),
        uid(nick) { let h = 0; for (let c of nick) h = ((h << 5) - h) + c.charCodeAt(0); h |= 0; return 'u_' + Math.abs(h).toString(36); },
        rand(r) { const [a, b] = r.split('-').map(Number); return Math.floor(Math.random() * (b - a + 1)) + a; },
        time() { return new Date().toLocaleTimeString('zh-CN', { hour12: false }); },
        dateKey() { return new Date().toLocaleDateString('zh-CN'); },
        box(title, lines) { const w = 34; const p = s => (s.length > w ? s.slice(0, w) : s).padEnd(w); return '╔' + '═'.repeat(w) + '╗\n║' + p(' ' + title) + '║\n╠' + '═'.repeat(w) + '╣\n' + lines.map(l => '║' + p(' ' + l) + '║').join('\n') + '\n╚' + '═'.repeat(w) + '╝'; },
        gmGet(k, d) { try { return GM_getValue(k, d); } catch(e) { return d; } },
        gmSet(k, v) { try { GM_setValue(k, v); } catch(e) {} },
        gmList() { try { return GM_listValues(); } catch(e) { return []; } },
        gmDel(k) { try { GM_deleteValue(k); } catch(e) {} }
    };

    // ═══════════════════════════════════════════════════════════
    //  Store 存储系统
    // ═══════════════════════════════════════════════════════════
    const Store = {
        // 默认玩家数据模板（v14新增 equip/wins/losses/bestiary/signDay/lastSign）
        def: {
            id: '', nick: '', gold: 100, lv: 1, exp: 0, hp: 100, maxHp: 100, mp: 50, maxMp: 50,
            career: null, job: null, guild: null,
            equip: { weapon: null, armor: null, accessory: null },
            items: [], status: [], drink: [], adv: 0,
            wins: 0, losses: 0,
            bestiary: [],
            signDay: 0, lastSign: 0,
            earned: 0, spent: 0, created: Date.now()
        },

        // 读取玩家数据（含v12存档兼容迁移）
        p(uid) {
            const raw = U.gmGet('p_' + uid, null);
            if (!raw) return null;
            let player;
            try { player = JSON.parse(raw); } catch(e) { return null; }
            // 填充默认值（新字段）
            for (const k in this.def) {
                if (player[k] === undefined) player[k] = JSON.parse(JSON.stringify(this.def[k]));
            }
            // v12 存档兼容迁移
            if (!player.equip || typeof player.equip !== 'object') player.equip = { weapon: null, armor: null, accessory: null };
            // v12 中 equip.weapon/equip.armor/equip.accessory 可能已存在，保留即可
            if (player.wins === undefined) player.wins = player.adv || 0;  // v12没有wins，用adv数近似
            if (player.losses === undefined) player.losses = 0;
            if (!player.bestiary) player.bestiary = [];
            if (player.signDay === undefined) player.signDay = 0;
            if (player.lastSign === undefined) player.lastSign = 0;
            return player;
        },

        setP(uid, player) { U.gmSet('p_' + uid, JSON.stringify(player)); },
        getAdvs() { try { return JSON.parse(U.gmGet('adventures', '[]')); } catch(e) { return []; } },
        setAdvs(a) { U.gmSet('adventures', JSON.stringify(a)); },
        listP() { return U.gmList().filter(k => k.startsWith('p_')).map(k => this.p(k.slice(2))).filter(Boolean); },

        // 公会存储
        getGuilds() { try { return JSON.parse(U.gmGet('guilds', '{}')); } catch(e) { return {}; } },
        setGuilds(g) { U.gmSet('guilds', JSON.stringify(g)); },
        getGuild(name) { const g = this.getGuilds(); return g[name] || null; },
        saveGuild(name, data) { const g = this.getGuilds(); g[name] = data; this.setGuilds(g); },

        // 等待状态
        getWait(uid) { const d = U.gmGet('w_' + uid, null); return d ? JSON.parse(d) : null; },
        setWait(uid, d) { d ? U.gmSet('w_' + uid, JSON.stringify(d)) : U.gmDel('w_' + uid); },

        // 备份
        backup() {
            const data = {};
            U.gmList().forEach(k => { data[k] = U.gmGet(k); });
            U.gmSet('_backup_' + Date.now(), JSON.stringify(data));
            return Object.keys(data).length;
        },
        restore(ts) {
            const raw = U.gmGet('_backup_' + ts, null);
            if (!raw) return false;
            let data;
            try { data = JSON.parse(raw); } catch(e) { return false; }
            U.gmList().forEach(k => U.gmDel(k));
            for (const k in data) U.gmSet(k, data[k]);
            return true;
        },
        listBackups() {
            return U.gmList().filter(k => k.startsWith('_backup_')).map(k => ({
                key: k,
                time: parseInt(k.slice(8)) || 0
            })).sort((a, b) => b.time - a.time);
        }
    };

    // ═══════════════════════════════════════════════════════════
    //  Log 日志面板
    // ═══════════════════════════════════════════════════════════
    const Log = {
        lines: [],
        init() {
            const div = document.createElement('div');
            div.innerHTML = `<div id="bp" style="position:fixed;bottom:10px;left:10px;width:320px;background:rgba(0,0,0,0.93);color:#0f0;font-family:monospace;font-size:10px;padding:8px;border-radius:8px;z-index:999999;border:2px solid #0f0;max-height:480px;overflow-y:auto;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;border-bottom:1px solid #333;padding-bottom:3px;"><b style="color:#fff;font-size:12px;">🍺 Bot v14</b><span id="bst" style="color:#0f0;font-size:10px;">●启动</span></div><div id="bl" style="white-space:pre-wrap;line-height:1.4;max-height:140px;overflow-y:auto;font-size:10px;margin-bottom:6px;"></div><div id="gmt" style="border-top:2px solid #f0f;padding-top:4px;display:none;"><div style="color:#f0f;font-weight:bold;margin-bottom:3px;font-size:11px;">🔧 GM</div><div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:3px;"><input id="gu" placeholder="UID" style="width:70px;font-size:10px;padding:2px;"><input id="gf" placeholder="字段" style="width:80px;font-size:10px;padding:2px;"><input id="gv" placeholder="值" style="width:50px;font-size:10px;padding:2px;"><button id="gs" style="font-size:10px;padding:2px 5px;">改</button></div><div style="display:flex;gap:3px;margin-bottom:3px;"><button id="gl" style="font-size:10px;padding:2px 5px;">列</button><button id="gc" style="font-size:10px;padding:2px 5px;">清</button><button id="gb" style="font-size:10px;padding:2px 5px;">备</button><button id="gr" style="font-size:10px;padding:2px 5px;color:#f44;">重置</button></div><div id="go" style="color:#ff0;font-size:10px;max-height:80px;overflow-y:auto;"></div></div><div style="border-top:1px solid #333;padding-top:3px;text-align:center;"><button id="gt" style="font-size:9px;padding:2px 8px;background:#222;color:#f0f;border:1px solid #f0f;border-radius:3px;cursor:pointer;">GM</button></div></div>`;
            document.body.appendChild(div);
            document.getElementById('gt').onclick = () => { const e = document.getElementById('gmt'); e.style.display = e.style.display === 'none' ? 'block' : 'none'; };
            document.getElementById('gs').onclick = () => { const uid = document.getElementById('gu').value.trim(), f = document.getElementById('gf').value.trim(), v = document.getElementById('gv').value.trim(); if (!uid || !f) return; const p = Store.p(uid); if (!p) { this.gm('无玩家'); return; } let pv = v; if (!isNaN(v) && v !== '') pv = Number(v); else if (v === 'true') pv = true; else if (v === 'false') pv = false; else if (v === 'null') pv = null; if (f.includes('.')) { const ps = f.split('.'); let t = p; for (let i = 0; i < ps.length - 1; i++) t = t[ps[i]]; t[ps[ps.length - 1]] = pv; } else p[f] = pv; Store.setP(uid, p); this.gm(`${uid}.${f}=${JSON.stringify(pv)}`); };
            document.getElementById('gl').onclick = () => { const pl = Store.listP(); let o = `${pl.length}人\n`; pl.forEach(p => o += `${p.id.slice(0,8)}|${p.nick}|Lv${p.lv}|💰${p.gold}\n`); this.gm(o); };
            document.getElementById('gc').onclick = () => { const a = Store.getAdvs().filter(x => x.status === 'ongoing' && x.back > Date.now()); Store.setAdvs(a); this.gm(`剩${a.length}冒险`); };
            document.getElementById('gb').onclick = () => { const n = Store.backup(); this.gm(`已备份${n}项`); };
            document.getElementById('gr').onclick = () => { if (confirm('重置所有?')) { U.gmList().forEach(k => U.gmDel(k)); this.gm('已重置'); } };
        },
        i(m) { console.log('[Bot]', m); this.lines.push(`[${U.time()}] ${m}`); if (this.lines.length > CFG.MAX_LOG) this.lines = this.lines.slice(-CFG.MAX_LOG); const e = document.getElementById('bl'); if (e) { e.textContent = this.lines.join('\n'); e.scrollTop = e.scrollHeight; } },
        gm(m) { const e = document.getElementById('go'); if (e) e.textContent = m; },
        stat(s, c) { const e = document.getElementById('bst'); if (e) { e.textContent = '●' + s; e.style.color = c || '#0f0'; } }
    };

    // ═══════════════════════════════════════════════════════════
    //  P 玩家系统
    // ═══════════════════════════════════════════════════════════
    const P = {
        async ensure(uid, nick) {
            let player = Store.p(uid);
            if (!player) {
                player = JSON.parse(JSON.stringify(Store.def));
                player.id = uid;
                player.nick = nick;
                Store.setP(uid, player);
                Log.i('新:' + nick);
            }
            return player;
        },

        save(p) { Store.setP(p.id, p); },

        async addExp(p, n) {
            p.exp += n;
            let up = false;
            while (true) {
                const x = DATA.levels.find(l => l.lv === p.lv + 1);
                if (x && p.exp >= x.need) {
                    p.lv++;
                    p.maxHp += 20;
                    p.hp = p.maxHp;
                    p.maxMp += 10;
                    p.mp = p.maxMp;
                    up = true;
                } else break;
            }
            this.save(p);
            return up;
        },

        // 攻击力（含武器+饰品加成）
        atk(p) {
            const career = DATA.careers.find(c => c.id === p.career);
            let base = (career?.atk || 5) + p.lv * 2;
            // 武器加成
            if (p.equip?.weapon) {
                const eq = DATA.equipments.find(e => e.name === p.equip.weapon);
                if (eq) base += eq.atk;
            }
            // 饰品攻击加成
            if (p.equip?.accessory) {
                const eq = DATA.equipments.find(e => e.name === p.equip.accessory);
                if (eq) base += eq.atk;
            }
            return base;
        },

        // 防御力（含防具+饰品加成）
        def(p) {
            const career = DATA.careers.find(c => c.id === p.career);
            let base = (career?.def || 5) + Math.floor(p.lv * 1.5);
            // 防具加成
            if (p.equip?.armor) {
                const eq = DATA.equipments.find(e => e.name === p.equip.armor);
                if (eq) base += eq.def;
            }
            // 饰品防御加成
            if (p.equip?.accessory) {
                const eq = DATA.equipments.find(e => e.name === p.equip.accessory);
                if (eq) base += eq.def;
            }
            return base;
        },

        // 最大HP（含饰品hp加成）
        maxHp(p) {
            let bonus = 0;
            if (p.equip?.accessory) {
                const eq = DATA.equipments.find(e => e.name === p.equip.accessory);
                if (eq) bonus += eq.hp;
            }
            return p.maxHp + bonus;
        },

        // 幸运值（影响掉落率）
        luck(p) {
            let luck = 0;
            if (p.equip?.accessory) {
                const eq = DATA.equipments.find(e => e.name === p.equip.accessory);
                if (eq) luck += eq.luck;
            }
            return luck;
        },

        // 玩家信息面板
        info(p) {
            const nx = DATA.levels.find(l => l.lv === p.lv + 1);
            const c = p.career ? (DATA.careers.find(c => c.id === p.career)?.name || p.career) : '未选择';
            const actualMaxHp = this.maxHp(p);
            const lines = [
                `❤️${p.hp}/${actualMaxHp} 💧${p.mp}/${p.maxMp}`,
                `💰${p.gold} ⭐${p.exp}${nx ? '/' + nx.need : ''}`,
                `⚔️${this.atk(p)} 🛡️${this.def(p)} 🍀${this.luck(p)}`,
                `装备:${p.equip?.weapon || '无'}｜${p.equip?.armor || '无'}｜${p.equip?.accessory || '无'}`,
                `职业:${c} 💼${p.job || '无'}`,
                `🎒${p.items.length ? p.items.join(',') : '(空)'}`,
                `${p.status.length ? '🌀' + p.status.join(',') : ''}`,
                `📊${p.adv}次 🏆${p.wins}胜/${p.losses || 0}负`,
                `公会:${p.guild || '(无)'}`,
                `🔰签到:${p.signDay}天`
            ];
            return U.box(`${p.nick} Lv.${p.lv}`, lines);
        }
    };


    // ═══════════════════════════════════════════════════════════
    //  Status 系统
    // ═══════════════════════════════════════════════════════════
    const Status = {
        // 负面状态池
        DEBUFFS: ['中毒', '虚弱', '恐惧', '流血', '沉默'],

        // 给玩家添加随机负面状态，返回添加的状态名
        apply(p) {
            const debuff = U.pick(this.DEBUFFS);
            if (!p.status) p.status = [];
            if (!p.status.includes(debuff)) p.status.push(debuff);
            Store.save(p);
            return debuff;
        },

        // 清除所有负面状态，返回清除的数量
        clear(p) {
            if (!p.status || !p.status.length) return 0;
            const cleared = p.status.length;
            p.status = [];
            Store.save(p);
            return cleared;
        },

        // 检查是否有特定状态
        has(p, name) {
            return p.status?.includes(name) || false;
        },

        // 获取状态列表
        list(p) {
            return p.status || [];
        }
    };

    // ═══════════════════════════════════════════════════════════
    //  Store 补充方法
    // ═══════════════════════════════════════════════════════════
    Store.byNick = function(nick) {
        return this.listP().find(p => p.nick === nick) || null;
    };
    Store.all = function() {
        return this.listP();
    };
    Store.save = function(p) {
        this.setP(p.id, p);
    };

    // ═══════════════════════════════════════════════════════════
    //  Guild 系统
    // ═══════════════════════════════════════════════════════════
    const Guild = {
        // 创建公会
        create(name, founder) {
            const guilds = Store.getGuilds();
            if (guilds[name]) return '公会「' + name + '」已存在。';
            if (founder.guild) return '你已经是「' + founder.guild + '」的成员，请先退出当前公会。';
            founder.guild = name;
            guilds[name] = {
                name,
                founder: founder.id,
                leader: founder.id,
                leaderNick: founder.nick,
                members: [{ id: founder.id, nick: founder.nick, role: '会长' }],
                applicants: [],
                notice: '',
                created: Date.now()
            };
            Store.setGuilds(guilds);
            Store.save(founder);
            return '公会「' + name + '」创建成功！你是会长。';
        },

        // 解散公会
        disband(name, uid) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            if (g.founder !== uid) return '只有会长才能解散公会。';
            // 清除所有成员的公会归属
            g.members.forEach(m => {
                const p = Store.p(m.id);
                if (p) { p.guild = null; Store.save(p); }
            });
            delete guilds[name];
            Store.setGuilds(guilds);
            return '公会「' + name + '」已解散。';
        },

        // 转让会长
        transfer(name, fromUid, toNick) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            if (g.founder !== fromUid) return '只有会长才能转让。';
            const target = Store.byNick(toNick);
            if (!target) return '找不到该玩家。';
            if (target.guild !== name) return '该玩家不是本公会成员。';
            g.founder = target.id;
            g.leader = target.id;
            g.leaderNick = target.nick;
            // 更新角色
            g.members.forEach(m => {
                if (m.id === fromUid) m.role = '成员';
                if (m.id === target.id) m.role = '会长';
            });
            Store.setGuilds(guilds);
            return '会长已转让给「' + toNick + '」。';
        },

        // 申请加入
        apply(name, uid, nick) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            const p = Store.p(uid);
            if (p?.guild) return '你已经是「' + p.guild + '」的成员，请先退出。';
            if (g.members.find(m => m.id === uid)) return '你已经是该公会成员。';
            if (g.applicants.find(a => a.id === uid)) return '你已经申请过了，等待审批中。';
            g.applicants.push({ id: uid, nick, time: Date.now() });
            Store.setGuilds(guilds);
            return '已申请加入「' + name + '」，等待会长审批。';
        },

        // 批准加入
        approve(name, uid, applicantNick) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            if (g.founder !== uid) return '只有会长才能审批。';
            const applicant = Store.byNick(applicantNick);
            if (!applicant) return '找不到该玩家。';
            const idx = g.applicants.findIndex(a => a.id === applicant.id);
            if (idx < 0) return '该玩家没有申请加入。';
            g.applicants.splice(idx, 1);
            applicant.guild = name;
            g.members.push({ id: applicant.id, nick: applicant.nick, role: '成员' });
            Store.setGuilds(guilds);
            Store.save(applicant);
            return '已批准「' + applicantNick + '」加入「' + name + '」。';
        },

        // 拒绝加入
        reject(name, uid, applicantNick) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            if (g.founder !== uid) return '只有会长才能审批。';
            const applicant = Store.byNick(applicantNick);
            if (!applicant) return '找不到该玩家。';
            const idx = g.applicants.findIndex(a => a.id === applicant.id);
            if (idx < 0) return '该玩家没有申请加入。';
            g.applicants.splice(idx, 1);
            Store.setGuilds(guilds);
            return '已拒绝「' + applicantNick + '」的申请。';
        },

        // 任命成员角色
        appoint(name, uid, targetNick, role) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            if (g.founder !== uid) return '只有会长才能任命。';
            const target = Store.byNick(targetNick);
            if (!target || target.guild !== name) return '该玩家不是本公会成员。';
            const member = g.members.find(m => m.id === target.id);
            if (!member) return '该玩家不是本公会成员。';
            member.role = role;
            Store.setGuilds(guilds);
            return '已任命「' + targetNick + '」为「' + role + '」。';
        },

        // 移除成员
        kick(name, uid, targetNick) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            if (g.founder !== uid) return '只有会长才能移除成员。';
            const target = Store.byNick(targetNick);
            if (!target) return '找不到该玩家。';
            if (target.id === g.founder) return '不能移除会长。';
            const idx = g.members.findIndex(m => m.id === target.id);
            if (idx < 0) return '该玩家不是本公会成员。';
            g.members.splice(idx, 1);
            target.guild = null;
            Store.setGuilds(guilds);
            Store.save(target);
            return '已将「' + targetNick + '」移出公会。';
        },

        // 退出公会
        leave(p) {
            if (!p.guild) return '你没有加入任何公会。';
            const guilds = Store.getGuilds();
            const g = guilds[p.guild];
            if (g) {
                if (g.founder === p.id) return '会长不能退出公会，请转让或解散。';
                g.members = g.members.filter(m => m.id !== p.id);
                Store.setGuilds(guilds);
            }
            const old = p.guild;
            p.guild = null;
            Store.save(p);
            return '已退出「' + old + '」。';
        },

        // 设置公告
        setNotice(name, uid, text) {
            const guilds = Store.getGuilds();
            const g = guilds[name];
            if (!g) return '公会不存在。';
            if (g.founder !== uid) return '只有会长才能修改公告。';
            g.notice = text;
            Store.setGuilds(guilds);
            return '公告已更新。';
        },

        // 获取公会信息面板
        panel(name) {
            const g = Store.getGuild(name);
            if (!g) return '公会不存在。';
            const lines = [
                '会长：' + g.leaderNick,
                '成员：' + g.members.length + '人',
                ...g.members.map(m => '  ' + m.nick + ' [' + m.role + ']'),
                '申请：' + (g.applicants.length ? g.applicants.map(a => a.nick).join(', ') : '无'),
                '公告：' + (g.notice || '暂无')
            ];
            return U.box('「' + g.name + '」', lines);
        },

        // 获取成员列表
        memberList(name) {
            const g = Store.getGuild(name);
            if (!g) return '公会不存在。';
            return g.members.map(m => m.nick + ' [' + m.role + ']').join('\n');
        }
    };

    // ═══════════════════════════════════════════════════════════
    //  页面消息识别
    // ═══════════════════════════════════════════════════════════
    let msgContainer = null;

    function findContainer() {
        msgContainer = document.querySelector('.message-list, .messages, [class*="message"], .chat-messages');
        return msgContainer;
    }

    // 从消息元素中提取数据
    function msgEls() {
        const container = msgContainer || findContainer();
        if (!container) return [];
        return Array.from(container.querySelectorAll('.message-item, .message, [class*="message"]:not([class*="list"]):not([class*="container"])'));
    }

    function cmdText(el) {
        const textEl = el.querySelector('.content, .text, .message-content, [class*="content"]');
        return textEl ? textEl.textContent.trim() : '';
    }

    function validNick(el) {
        const nickEl = el.querySelector('.nickname, .name, .user-name, [class*="nick"], [class*="name"]');
        const nick = nickEl ? nickEl.textContent.trim() : '';
        return nick && nick !== CFG.BOT_NAME ? nick : '';
    }

    function nickOf(el) {
        const nickEl = el.querySelector('.nickname, .name, .user-name, [class*="nick"], [class*="name"]');
        return nickEl ? nickEl.textContent.trim() : '';
    }

    function uidOf(el) {
        const nick = validNick(el);
        return nick ? U.uid(nick) : '';
    }

    function midOf(el) {
        // 生成消息指纹用于去重
        const nick = nickOf(el);
        const text = cmdText(el);
        return nick + ':' + text.slice(0, 50);
    }

    function own(el) {
        const nick = nickOf(el);
        return nick === CFG.BOT_NAME;
    }

    // 从 @提及 中提取目标用户
    function keyOf(text, prefix) {
        const idx = text.indexOf(prefix);
        if (idx < 0) return '';
        const rest = text.slice(idx + prefix.length).trim();
        const m = rest.match(/^@?(\S+)/);
        return m ? m[1] : '';
    }

    // ═══════════════════════════════════════════════════════════
    //  串行队列系统
    // ═══════════════════════════════════════════════════════════
    const procQueue = [];
    let procRunning = false;

    async function enqueueProc(fn) {
        procQueue.push(fn);
        if (procRunning) return;
        procRunning = true;
        while (procQueue.length) {
            const f = procQueue.shift();
            try { await f(); } catch(e) { Log.i('队列err:' + e.message); }
        }
        procRunning = false;
    }

    const sendQueue = [];
    let sendRunning = false;

    async function enqueueSend(text) {
        sendQueue.push(text);
        if (sendRunning) return;
        sendRunning = true;
        while (sendQueue.length) {
            const t = sendQueue.shift();
            await sendMsg(t);
            await U.sleep(600);
        }
        sendRunning = false;
    }

    // ═══════════════════════════════════════════════════════════
    //  输入和发送系统
    // ═══════════════════════════════════════════════════════════
    function inputEl() {
        return document.querySelector('textarea, input[type="text"], [contenteditable="true"], .chat-input');
    }

    function sendBtn() {
        return document.querySelector('button[type="submit"], .send-btn, .send-button, button:has-text("发送")');
    }

    function setInput(text) {
        const el = inputEl();
        if (!el) return false;
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            el.value = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            el.textContent = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return true;
    }

    function inputVal() {
        const el = inputEl();
        if (!el) return '';
        return el.value || el.textContent || '';
    }

    async function sendMsg(text) {
        if (!text) return;
        setInput(text);
        await U.sleep(100);
        // 优先点击发送按钮
        const btn = sendBtn();
        if (btn) { btn.click(); return; }
        // 回车发送
        const el = inputEl();
        if (el) {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  指令解析系统
    // ═══════════════════════════════════════════════════════════
    function parseCmd(text) {
        if (!text) return null;
        const t = text.trim();
        // 支持 /cmd 和 .cmd 前缀
        const m = t.match(/^[\/.](\S+)(?:\s+(.*))?$/s);
        if (!m) return null;
        return { cmd: m[1].trim(), arg: (m[2] || '').trim() };
    }

    function admin(nick) {
        return CFG.ADMIN.includes(nick);
    }

    // 从参数中解析 @目标 + 剩余参数
    function target(arg) {
        if (!arg) return { nick: '', rest: '' };
        const m = arg.match(/^@?(\S+)(?:\s+(.*))?$/s);
        if (!m) return { nick: '', rest: arg };
        return { nick: m[1].trim(), rest: (m[2] || '').trim() };
    }

    // ═══════════════════════════════════════════════════════════
    //  注册职业选择
    // ═══════════════════════════════════════════════════════════
    function numberChoice(text) {
        const n = parseInt(text.trim());
        return isNaN(n) ? 0 : n;
    }

    // ═══════════════════════════════════════════════════════════
    //  指令主处理器（v14：新增装备/决斗/排行/签到/图鉴/强化/赠送）
    // ═══════════════════════════════════════════════════════════
    function needRegister() {
        return '请先注册：/注册 职业编号';
    }

    async function command(cmd, arg, player) {
        const nick = player.nick;

        // ── 帮助 ──
        if (cmd === '帮助' || cmd === 'help') {
            return U.box('📖 指令列表', [
                '━━ 基础 ━━',
                '/注册 编号 /面板 /我的ID /余额 /流水',
                '/排行 /签到 /状态 /状态 @昵称',
                '━━ 酒馆 ━━',
                '/酒单 /点酒 酒名 /请酒 @昵称 酒名',
                '━━ 冒险 ━━',
                '/冒险 场景名 /冒险列表 /归来 /背包',
                '━━ 装备 ━━',
                '/装备 /装备店 /买装备 装备名 /卸下 武器/防具/饰品',
                '/强化 装备名',
                '━━ 战斗 ━━',
                '/决斗 @昵称 /接受决斗 @昵称 /拒绝决斗 @昵称',
                '━━ 社交 ━━',
                '/转账 @昵称 金额 /赠送物品 @昵称 物品名',
                '━━ 公会 ━━',
                '/创建公会 名称 /公会 /公会成员',
                '/申请加入 公会名 /批准加入 @昵称 /拒绝加入 @昵称',
                '/公会任命 @昵称 角色 /公会公告 内容',
                '/退出公会 /转让会长 @昵称 /解散公会',
                '━━ 岗位 ━━',
                '/岗位列表 /岗位 /申请岗位 岗位名',
                '/任命岗位 @昵称 岗位名（管理）',
                '/发工资（管理） /奖励 @昵称 金额（管理）',
                '━━ 其他 ━━',
                '/治疗 /图鉴',
                '━━ 管理 ━━',
                '/备份列表 /恢复备份 时间戳 /手动备份'
            ]);
        }

        // ── 注册 ──
        if (cmd === '注册' || cmd === '注册职业') {
            if (player.registered) return nick + '已经注册过了，职业是「' + (DATA.careers.find(c => c.id === player.career)?.name || player.career) + '」。';
            const n = numberChoice(arg);
            if (!n || n < 1 || n > DATA.careers.length) {
                const lines = DATA.careers.map((c, i) => (i + 1) + '. ' + c.name + ' — ' + c.desc + ' (⚔️' + c.atk + ' 🛡️' + c.def + ')');
                return U.box('选择你的职业', ['请发送：/注册 编号', ...lines]);
            }
            const career = DATA.careers[n - 1];
            player.registered = true;
            player.career = career.id;
            player.maxHp = 100 + (career.def || 0);
            player.hp = player.maxHp;
            player.maxMp = 50;
            player.mp = player.maxMp;
            Store.save(player);
            return U.box('🎉 注册成功', [
                '欢迎「' + nick + '」成为' + career.name + '！',
                '⚔️' + career.atk + ' 🛡️' + career.def,
                '初始金币：100 💰',
                '发送 /面板 查看状态，/冒险列表 查看可冒险场景。'
            ]);
        }

        // ── 面板 ──
        if (cmd === '面板' || cmd === '面板信息' || cmd === '个人信息') {
            if (!player.registered) return needRegister();
            return P.info(player);
        }

        // ── 我的ID ──
        if (cmd === '我的ID' || cmd === 'id') {
            return nick + ' 的ID：`' + player.id + '`';
        }

        // ── 余额 ──
        if (cmd === '余额' || cmd === '金币') {
            if (!player.registered) return needRegister();
            return nick + ' 有 💰' + player.gold + ' 金币。';
        }

        // ── 流水 ──
        if (cmd === '流水' || cmd === '记录') {
            if (!player.registered) return needRegister();
            // 流水存储在 GM 中以 _log_ 前缀
            const logs = [];
            try {
                const allKeys = GM_listValues();
                const logKeys = allKeys.filter(k => k.startsWith('_log_' + player.id + '_')).sort().reverse().slice(0, 15);
                for (const k of logKeys) {
                    const v = GM_getValue(k, '');
                    if (v) logs.push(v);
                }
            } catch(e) {}
            if (!logs.length) return nick + ' 没有交易记录。';
            return U.box('📋 ' + nick + ' 的流水', logs);
        }

        // ── 酒单 ──
        if (cmd === '酒单' || cmd === '菜单') {
            const lines = DATA.drinks.map(d => d.name + ' — 💰' + d.price + ' — ' + d.eff);
            return U.box('🍺 酒馆酒单', [...lines, '点酒：/点酒 酒名']);
        }

        // ── 点酒 ──
        if (cmd === '点酒' || cmd === '喝酒') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/点酒 酒名';
            const drink = DATA.drinks.find(d => d.name === arg || d.name.includes(arg));
            if (!drink) return '没有「' + arg + '」。看看 /酒单';
            if (player.gold < drink.price) return '需要' + drink.price + '金，你只有' + player.gold + '金。';
            P.gold(player, -drink.price, '点酒:' + drink.name);
            // HP 恢复
            if (drink.hp) {
                player.hp = Math.min(player.hp + drink.hp, P.maxHp(player));
            }
            // Buff
            const effects = [];
            if (drink.hp) effects.push('❤️+' + drink.hp + ' HP');
            if (drink.buff) {
                player.drink = player.drink || [];
                player.drink.push(drink.buff);
                effects.push('🌀获得：' + drink.buff);
            }
            // Clear 负面状态
            if (drink.clear) {
                const cleared = Status.clear(player);
                if (cleared > 0) effects.push('负面状态已清除x' + cleared);
                else effects.push('没有可清除的负面状态');
            }
            Store.save(player);
            return drink.txt + '\n' + effects.join('  ') + '\n💰' + player.gold;
        }

        // ── 请酒 ──
        if (cmd === '请酒') {
            if (!player.registered) return needRegister();
            const t = target(arg);
            if (!t?.nick || !t.rest) return '格式：/请酒 @昵称 酒名';
            const targetPlayer = Store.byNick(t.nick);
            if (!targetPlayer?.registered) return '对方未注册。';
            const drink = DATA.drinks.find(d => d.name === t.rest || d.name.includes(t.rest));
            if (!drink) return '没有「' + t.rest + '」。';
            if (player.gold < drink.price) return '需要' + drink.price + '金，你只有' + player.gold + '金。';
            P.gold(player, -drink.price, '请酒:' + drink.name + '→' + t.nick);
            const effects = [];
            if (drink.hp) {
                targetPlayer.hp = Math.min(targetPlayer.hp + drink.hp, P.maxHp(targetPlayer));
                effects.push('❤️+' + drink.hp + ' HP');
            }
            if (drink.buff) {
                targetPlayer.drink = targetPlayer.drink || [];
                targetPlayer.drink.push(drink.buff);
                effects.push('🌀' + drink.buff);
            }
            // 修复 D：请酒 clear 效果反馈
            if (drink.clear) {
                const cleared = Status.clear(targetPlayer);
                if (cleared > 0) effects.push('负面状态已清除x' + cleared);
                else effects.push('没有可清除的负面状态');
            }
            Store.save(player);
            Store.save(targetPlayer);
            return nick + '请' + t.nick + '喝了「' + drink.name + '」\n' + effects.join('  ');
        }

        // ── 状态 ──
        if (cmd === '状态') {
            if (!player.registered) return needRegister();
            if (arg) {
                const t = target(arg);
                if (t.nick) {
                    const tp = Store.byNick(t.nick);
                    if (tp?.registered) return P.info(tp);
                    return '未找到「' + t.nick + '」。';
                }
            }
            return P.info(player);
        }

        // ── 治疗 ──
        if (cmd === '治疗' || cmd === '恢复') {
            if (!player.registered) return needRegister();
            if (player.hp >= P.maxHp(player)) return nick + ' 已经满血了。';
            const cost = Math.floor((P.maxHp(player) - player.hp) * 0.5);
            if (player.gold < cost) return '需要' + cost + '金进行治疗，你只有' + player.gold + '金。';
            P.gold(player, -cost, '治疗');
            player.hp = P.maxHp(player);
            Store.save(player);
            return nick + ' 已恢复满血！💰-' + cost;
        }

        // ── 冒险列表 ──
        if (cmd === '冒险列表' || cmd === '场景') {
            const lines = DATA.adventures.map(a => {
                return a.name + ' (Lv.' + a.lv + '+' + ') ⏱️' + a.mins + '分钟 💰' + a.gold + ' ⭐' + a.exp;
            });
            return U.box('🗺️ 冒险场景', [...lines, '开始冒险：/冒险 场景名']);
        }

        // ── 冒险 ──
        if (cmd === '冒险' || cmd === '出发') {
            if (!player.registered) return needRegister();
            if (player.adv) return nick + ' 已经在冒险中了，请等待 /归来 或使用 /治疗 恢复。';
            if (!arg) return '格式：/冒险 场景名\n查看 /冒险列表';
            const scene = DATA.adventures.find(a => a.name === arg || a.name.includes(arg));
            if (!scene) return '没有找到「' + arg + '」。查看 /冒险列表';
            if (player.lv < scene.lv) return '需要 Lv.' + scene.lv + '，你只有 Lv.' + player.lv;
            // 开始冒险
            player.adv = Date.now();
            player.advScene = scene.name;
            player.advDuration = scene.mins * 60000;
            // 扣除精力
            player.hp = Math.max(1, player.hp - 10);
            Store.save(player);
            return nick + ' 出发前往「' + scene.name + '」！\n预计 ' + scene.mins + ' 分钟后归来。\n⏱️冒险中...';
        }

        // ── 归来 ──
        if (cmd === '归来' || cmd === '返回') {
            if (!player.registered) return needRegister();
            if (!player.adv) return nick + ' 没有在冒险。';
            const elapsed = Date.now() - player.adv;
            if (elapsed < player.advDuration) {
                const remain = Math.ceil((player.advDuration - elapsed) / 60000);
                return '还有约 ' + remain + ' 分钟才归来。';
            }
            // 冒险结算
            const scene = DATA.adventures.find(a => a.name === player.advScene);
            if (!scene) { player.adv = 0; Store.save(player); return '冒险数据异常，已重置。'; }
            const expGain = U.rand(scene.exp);
            const goldGain = U.rand(scene.gold);
            // 幸运加成
            const luck = P.luck(player);
            const dropBonus = luck > 0 ? Math.random() < (luck * 0.02) : false;
            let drop = '';
            if (scene.drops?.length) {
                const d = U.pick(scene.drops);
                drop = d;
                if (dropBonus && scene.drops.length > 1) {
                    const extra = U.pick(scene.drops.filter(x => x !== d));
                    if (extra) drop += ',' + extra;
                }
            }
            // 怪物图鉴解锁
            if (scene.monsters?.length) {
                player.bestiary = player.bestiary || [];
                scene.monsters.forEach(m => {
                    if (!player.bestiary.includes(m)) player.bestiary.push(m);
                });
            }
            // 经验与金币
            const leveled = await P.addExp(player, expGain);
            P.gold(player, goldGain, '冒险:' + scene.name);
            player.adv = 0;
            player.advScene = '';
            player.advDuration = 0;
            // 可能获得负面状态
            const debuff = Math.random() < 0.3 ? Status.apply(player) : '';
            // 掉落物品
            if (drop) {
                player.items = player.items || [];
                drop.split(',').forEach(d => { if (d.trim()) player.items.push(d.trim()); });
            }
            Store.save(player);
            let result = '🎉 ' + nick + ' 从「' + scene.name + '」归来！';
            result += '\n⭐+' + expGain + ' 💰+' + goldGain;
            if (drop) result += '\n🎒获得：' + drop;
            if (dropBonus) result += ' (幸运额外掉落!)';
            if (debuff) result += '\n😵获得负面状态：' + debuff;
            if (leveled) result += '\n🆙 升级了！当前 Lv.' + player.lv;
            return result;
        }

        // ── 背包 ──
        if (cmd === '背包' || cmd === '物品') {
            if (!player.registered) return needRegister();
            const items = player.items || [];
            if (!items.length) return nick + ' 的背包是空的。';
            return U.box('🎒 ' + nick + ' 的背包', [
                '共 ' + items.length + ' 件物品',
                ...items
            ]);
        }

        // ── 转账 ──
        if (cmd === '转账' || cmd === '汇款') {
            if (!player.registered) return needRegister();
            const t = target(arg);
            if (!t?.nick || !t.rest) return '格式：/转账 @昵称 金额';
            const targetPlayer = Store.byNick(t.nick);
            if (!targetPlayer?.registered) return '对方未注册。';
            if (targetPlayer.id === player.id) return '不能转账给自己。';
            const amount = parseInt(t.rest);
            if (isNaN(amount) || amount <= 0) return '请输入有效的金额。';
            if (player.gold < amount) return '你只有' + player.gold + '金，不够转账' + amount + '金。';
            P.gold(player, -amount, '转账→' + t.nick);
            P.gold(targetPlayer, amount, '转账←' + nick);
            Store.save(targetPlayer);
            return nick + ' 向 ' + t.nick + ' 转账 ' + amount + ' 金。';
        }

        // ── 岗位列表 ──
        if (cmd === '岗位列表' || cmd === '职位列表') {
            return U.box('💼 酒馆岗位', [
                '调酒师 — 每日俸禄50金',
                '守卫 — 每日俸禄40金',
                '侍者 — 每日俸禄30金',
                '吟游诗人 — 每日俸禄35金',
                '申请：/申请岗位 岗位名'
            ]);
        }

        // ── 岗位 ──
        if (cmd === '岗位' || cmd === '职位') {
            if (!player.registered) return needRegister();
            return nick + ' 的岗位：' + (player.job || '无') + '\n使用 /岗位列表 查看可申请岗位。';
        }

        // ── 申请岗位 ──
        if (cmd === '申请岗位') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/申请岗位 岗位名\n查看 /岗位列表';
            const jobs = ['调酒师', '守卫', '侍者', '吟游诗人'];
            if (!jobs.includes(arg)) return '没有「' + arg + '」这个岗位。';
            player.job = arg;
            Store.save(player);
            return nick + ' 申请成为「' + arg + '」，等待管理审批后可用 /岗位 查看。';
        }

        // ── 任命岗位（管理） ──
        if (cmd === '任命岗位') {
            if (!admin(nick)) return '权限不足。';
            const t = target(arg);
            if (!t?.nick || !t.rest) return '格式：/任命岗位 @昵称 岗位名';
            const targetPlayer = Store.byNick(t.nick);
            if (!targetPlayer?.registered) return '对方未注册。';
            targetPlayer.job = t.rest;
            Store.save(targetPlayer);
            return '已任命「' + t.nick + '」为「' + t.rest + '」。';
        }

        // ── 解除岗位（管理） ──
        if (cmd === '解除岗位') {
            if (!admin(nick)) return '权限不足。';
            const t = target(arg);
            if (!t?.nick) return '格式：/解除岗位 @昵称';
            const targetPlayer = Store.byNick(t.nick);
            if (!targetPlayer?.registered) return '对方未注册。';
            const old = targetPlayer.job;
            targetPlayer.job = null;
            Store.save(targetPlayer);
            return '已解除「' + t.nick + '」的「' + (old || '岗位') + '」。';
        }

        // ── 发工资（管理） ──
        if (cmd === '发工资' || cmd === '发薪') {
            if (!admin(nick)) return '权限不足。';
            const all = Store.all();
            const jobPay = { '调酒师': 50, '守卫': 40, '侍者': 30, '吟游诗人': 35 };
            let total = 0;
            all.forEach(p => {
                if (p.registered && p.job && jobPay[p.job]) {
                    P.gold(p, jobPay[p.job], '工资:' + p.job);
                    Store.save(p);
                    total++;
                }
            });
            return '已发放工资，共 ' + total + ' 人。';
        }

        // ── 奖励（管理） ──
        if (cmd === '奖励' || cmd === '发奖') {
            if (!admin(nick)) return '权限不足。';
            const t = target(arg);
            if (!t?.nick || !t.rest) return '格式：/奖励 @昵称 金额';
            const targetPlayer = Store.byNick(t.nick);
            if (!targetPlayer?.registered) return '对方未注册。';
            const amount = parseInt(t.rest);
            if (isNaN(amount) || amount <= 0) return '请输入有效的金额。';
            P.gold(targetPlayer, amount, '奖励:' + nick);
            Store.save(targetPlayer);
            return '已奖励「' + t.nick + '」' + amount + '金。';
        }

        // ── 创建公会 ──
        if (cmd === '创建公会') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/创建公会 公会名';
            if (player.gold < CFG.GUILD_COST) return '创建公会需要' + CFG.GUILD_COST + '金，你只有' + player.gold + '金。';
            P.gold(player, -CFG.GUILD_COST, '创建公会:' + arg);
            Store.save(player);
            return Guild.create(arg, player);
        }

        // ── 公会 ──
        if (cmd === '公会') {
            if (!player.registered) return needRegister();
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.panel(player.guild);
        }

        // ── 公会成员 ──
        if (cmd === '公会成员') {
            if (!player.registered) return needRegister();
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.memberList(player.guild);
        }

        // ── 申请加入 ──
        if (cmd === '申请加入') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/申请加入 公会名';
            return Guild.apply(arg, player.id, nick);
        }

        // ── 批准加入 ──
        if (cmd === '批准加入') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/批准加入 @昵称';
            const t = target(arg);
            if (!t?.nick) return '格式：/批准加入 @昵称';
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.approve(player.guild, player.id, t.nick);
        }

        // ── 拒绝加入 ──
        if (cmd === '拒绝加入') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/拒绝加入 @昵称';
            const t = target(arg);
            if (!t?.nick) return '格式：/拒绝加入 @昵称';
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.reject(player.guild, player.id, t.nick);
        }

        // ── 公会任命 ──
        if (cmd === '公会任命') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/公会任命 @昵称 角色名';
            const t = target(arg);
            if (!t?.nick || !t.rest) return '格式：/公会任命 @昵称 角色名';
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.appoint(player.guild, player.id, t.nick, t.rest);
        }

        // ── 公会公告 ──
        if (cmd === '公会公告') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/公会公告 公告内容';
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.setNotice(player.guild, player.id, arg);
        }

        // ── 退出公会 ──
        if (cmd === '退出公会') {
            if (!player.registered) return needRegister();
            return Guild.leave(player);
        }

        // ── 转让会长 ──
        if (cmd === '转让会长') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/转让会长 @昵称';
            const t = target(arg);
            if (!t?.nick) return '格式：/转让会长 @昵称';
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.transfer(player.guild, player.id, t.nick);
        }

        // ── 解散公会 ──
        if (cmd === '解散公会') {
            if (!player.registered) return needRegister();
            if (!player.guild) return '你没有加入任何公会。';
            return Guild.disband(player.guild, player.id);
        }

        // ═══════════════════════════════════════════════════════════
        //  装备系统
        // ═══════════════════════════════════════════════════════════
        if (cmd === '装备') {
            if (!player.registered) return needRegister();
            const e = player.equip || {};
            return U.box(
                nick + '的装备',
                [
                    '武器：' + (e.weapon || '(无)'),
                    '防具：' + (e.armor || '(无)'),
                    '饰品：' + (e.accessory || '(无)'),
                    '⚔️' + P.atk(player) + '　🛡️' + P.def(player) + '　🍀' + P.luck(player),
                    '使用 /装备店 购买装备'
                ]
            );
        }

        if (cmd === '装备店') {
            const weapons = DATA.equipments.filter(e => e.t === 'weapon').map(e => e.name + ' +' + e.atk + '攻 ' + e.p + '金');
            const armors = DATA.equipments.filter(e => e.t === 'armor').map(e => e.name + ' +' + e.def + '防 ' + e.p + '金');
            const accessories = DATA.equipments.filter(e => e.t === 'accessory').map(e => {
                let s = e.name;
                if (e.luck) s += ' +' + e.luck + '运';
                if (e.atk) s += ' +' + e.atk + '攻';
                if (e.def) s += ' +' + e.def + '防';
                if (e.hp) s += ' +' + e.hp + '血';
                s += ' ' + e.p + '金';
                return s;
            });
            return U.box(
                '装备店',
                [
                    '━━ 武器 ━━',
                    ...weapons,
                    '━━ 防具 ━━',
                    ...armors,
                    '━━ 饰品 ━━',
                    ...accessories,
                    '购买：/买装备 铁剑',
                    '卸下：/卸下 武器'
                ]
            );
        }

        if (cmd === '买装备') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/买装备 铁剑';
            const eq = DATA.equipments.find(e => e.name === arg || e.name.includes(arg));
            if (!eq) return '没有这件装备。';
            if (player.gold < eq.p) return '需要' + eq.p + '金，你只有' + player.gold + '金。';
            P.gold(player, -eq.p, '购买:' + eq.name);
            player.equip = player.equip || {};
            player.equip[eq.t] = eq.name;
            Store.save(player);
            const typeMap = { weapon: '武器', armor: '防具', accessory: '饰品' };
            return '「' + eq.name + '」已装备为' + typeMap[eq.t] + '。\n⚔️' + P.atk(player) + '　🛡️' + P.def(player) + '　🍀' + P.luck(player);
        }

        if (cmd === '卸下') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/卸下 武器｜/卸下 防具｜/卸下 饰品';
            const typeMap = { '武器': 'weapon', '防具': 'armor', '饰品': 'accessory' };
            const type = typeMap[arg];
            if (!type) return '只能卸下 武器/防具/饰品。';
            player.equip = player.equip || {};
            const old = player.equip[type];
            if (!old) return '你没有装备' + arg + '。';
            player.equip[type] = null;
            Store.save(player);
            return '已卸下「' + old + '」。';
        }

        // ═══════════════════════════════════════════════════════════
        //  决斗系统
        // ═══════════════════════════════════════════════════════════
        if (cmd === '决斗') {
            if (!player.registered) return needRegister();
            const t = target(arg);
            if (!t?.nick) return '格式：/决斗 @昵称';
            const targetPlayer = Store.byNick(t.nick);
            if (!targetPlayer?.registered) return '对方未注册。';
            if (targetPlayer.id === player.id) return '不能挑战自己。';
            // 检查对方是否已有等待中的决斗
            const pending = pendingDuels.get(targetPlayer.id);
            if (pending && pending.from === player.id) return '已发起挑战，等待对方回应。';
            // 创建等待
            pendingDuels.set(targetPlayer.id, {
                from: player.id,
                fromNick: player.nick,
                to: targetPlayer.id,
                toNick: targetPlayer.nick,
                expire: Date.now() + CFG.DUEL_TIMEOUT_MS
            });
            return nick + '向' + targetPlayer.nick + '发起决斗挑战！\n对方可回复 /接受决斗 @' + player.nick + ' 或 /拒绝决斗 @' + player.nick;
        }

        if (cmd === '接受决斗') {
            if (!player.registered) return needRegister();
            const tNick = arg.replace(/^@/, '').trim();
            if (!tNick) return '格式：/接受决斗 @挑战者昵称';
            const challenger = Store.byNick(tNick);
            if (!challenger) return '没有找到挑战者。';
            const pending = pendingDuels.get(player.id);
            if (!pending || pending.from !== challenger.id) return '没有来自对方的挑战。';
            // 开始决斗
            pendingDuels.delete(player.id);
            return runDuel(challenger, player);
        }

        if (cmd === '拒绝决斗') {
            const tNick = arg.replace(/^@/, '').trim();
            if (!tNick) return '格式：/拒绝决斗 @挑战者昵称';
            const challenger = Store.byNick(tNick);
            if (!challenger) return '没有找到挑战者。';
            const pending = pendingDuels.get(player.id);
            if (!pending || pending.from !== challenger.id) return '没有来自对方的挑战。';
            pendingDuels.delete(player.id);
            return nick + '拒绝了' + challenger.nick + '的决斗挑战。';
        }

        // ═══════════════════════════════════════════════════════════
        //  排行
        // ═══════════════════════════════════════════════════════════
        if (cmd === '排行' || cmd === '排行榜') {
            const all = Store.all()
                .filter(p => p.registered)
                .sort((a, b) => b.lv - a.lv || b.gold - a.gold)
                .slice(0, 10);
            if (!all.length) return '暂无冒险者。';
            return U.box(
                '🏆冒险者排行',
                all.map((p, i) => (i + 1) + '. ' + p.nick + ' Lv.' + p.lv + ' 💰' + p.gold + ' 🏆' + p.wins + '胜')
            );
        }

        // ═══════════════════════════════════════════════════════════
        //  每日签到
        // ═══════════════════════════════════════════════════════════
        if (cmd === '签到') {
            const now = Date.now();
            const todayKey = U.dateKey(now);
            const lastKey = U.dateKey(player.lastSign);
            if (todayKey === lastKey) {
                return nick + '今天已经签到过了。连续' + player.signDay + '天。';
            }
            // 检查是否连续（昨天签过）
            const yesterdayKey = U.dateKey(now - 86400000);
            if (lastKey === yesterdayKey) {
                player.signDay++;
            } else {
                player.signDay = 1;
            }
            player.lastSign = now;
            const dayIndex = Math.min(player.signDay, CFG.SIGN_BONUS.length) - 1;
            const bonus = CFG.SIGN_BONUS[dayIndex];
            P.gold(player, bonus, '签到第' + player.signDay + '天');
            Store.save(player);
            return nick + '签到成功！第' + player.signDay + '天，+' + bonus + '金币。\n💰' + player.gold;
        }

        // ═══════════════════════════════════════════════════════════
        //  怪物图鉴
        // ═══════════════════════════════════════════════════════════
        if (cmd === '图鉴') {
            if (!player.bestiary?.length) return '还没有解锁任何怪物图鉴。去冒险吧！';
            const monsters = player.bestiary.map(name => {
                const mon = DATA.monsters.find(m => m.name === name);
                return mon ? '✓ ' + name + ' (Lv.' + mon.lv + ') ' + mon.desc : '✓ ' + name;
            });
            return U.box(nick + '的怪物图鉴', monsters);
        }

        // ═══════════════════════════════════════════════════════════
        //  装备强化
        // ═══════════════════════════════════════════════════════════
        if (cmd === '强化') {
            if (!player.registered) return needRegister();
            if (!arg) return '格式：/强化 铁剑\n强化装备需要消耗金币，有概率失败。';
            const eq = DATA.equipments.find(e => e.name === arg || e.name.includes(arg));
            if (!eq) return '没有找到这件装备。';
            // 检查是否已装备
            const equipped = Object.entries(player.equip || {}).find(([t, n]) => n === eq.name);
            if (!equipped) return '你只能强化已装备的装备。';
            const cost = Math.floor(eq.p * 0.4);
            if (player.gold < cost) return '强化需要' + cost + '金。';
            P.gold(player, -cost, '强化:' + eq.name);
            // 60%成功率
            if (Math.random() < 0.6) {
                // 成功：随机提升一个属性 +1
                const attrs = ['atk', 'def', 'luck', 'hp'].filter(a => eq[a] > 0);
                const attr = U.pick(attrs) || 'atk';
                eq[attr]++;
                Store.save(player);
                return '强化成功！「' + eq.name + '」' + (attr === 'atk' ? '攻击' : attr === 'def' ? '防御' : attr === 'luck' ? '幸运' : '生命') + '+1\n⚔️' + P.atk(player) + '　🛡️' + P.def(player);
            } else {
                Store.save(player);
                return '强化失败……「' + eq.name + '」没有变化。\n💰-' + cost;
            }
        }

        // ═══════════════════════════════════════════════════════════
        //  赠送物品
        // ═══════════════════════════════════════════════════════════
        if (cmd === '赠送物品') {
            if (!player.registered) return needRegister();
            const t = target(arg);
            if (!t?.nick || !t.rest) return '格式：/赠送物品 @昵称 物品名';
            const targetPlayer = Store.byNick(t.nick);
            if (!targetPlayer?.registered) return '对方未注册。';
            if (targetPlayer.id === player.id) return '不能赠送给自己。';
            const itemIndex = player.items.findIndex(i => i === t.rest || i.includes(t.rest));
            if (itemIndex < 0) return '你没有「' + t.rest + '」。';
            const item = player.items.splice(itemIndex, 1)[0];
            targetPlayer.items.push(item);
            Store.save(player);
            Store.save(targetPlayer);
            return nick + '将「' + item + '」赠送给' + targetPlayer.nick + '。';
        }

        // ── 未识别指令 ──
        return null;
    }

    // ═══════════════════════════════════════════════════════════
    //  决斗执行引擎
    // ═══════════════════════════════════════════════════════════
    function runDuel(a, b) {
        let log = '⚔️ ' + a.nick + ' VS ' + b.nick + ' 决斗开始！\n';
        log += a.nick + ': ❤️' + a.hp + '/' + P.maxHp(a) + ' ⚔️' + P.atk(a) + ' 🛡️' + P.def(a) + '\n';
        log += b.nick + ': ❤️' + b.hp + '/' + P.maxHp(b) + ' ⚔️' + P.atk(b) + ' 🛡️' + P.def(b) + '\n';
        log += '━━━━━━━━━━\n';

        let aHp = a.hp, bHp = b.hp;
        const aMax = P.maxHp(a), bMax = P.maxHp(b);
        const aAtk = P.atk(a), bAtk = P.atk(b);
        const aDef = P.def(a), bDef = P.def(b);

        for (let round = 1; round <= 10; round++) {
            if (aHp <= 0 || bHp <= 0) break;
            log += '第' + round + '回合\n';

            // A 攻击 B
            const aDmg = Math.max(1, aAtk - Math.floor(bDef * 0.5));
            const aCrit = Math.random() < 0.15 ? 1.5 : 1;
            const aFinal = Math.floor(aDmg * aCrit);
            bHp -= aFinal;
            log += a.nick + ' ⚔️' + aFinal + (aCrit > 1 ? '(暴击!)' : '') + ' → ' + b.nick;
            log += ' ❤️' + Math.max(0, bHp) + '\n';

            if (bHp <= 0) break;

            // B 攻击 A
            const bDmg = Math.max(1, bAtk - Math.floor(aDef * 0.5));
            const bCrit = Math.random() < 0.15 ? 1.5 : 1;
            const bFinal = Math.floor(bDmg * bCrit);
            aHp -= bFinal;
            log += b.nick + ' ⚔️' + bFinal + (bCrit > 1 ? '(暴击!)' : '') + ' → ' + a.nick;
            log += ' ❤️' + Math.max(0, aHp) + '\n';
        }

        log += '━━━━━━━━━━\n';

        // 结算
        let winner, loser;
        if (aHp > bHp) { winner = a; loser = b; }
        else if (bHp > aHp) { winner = b; loser = a; }
        else {
            // 平局
            log += '🤝 平局！双方势均力敌。';
            Store.save(a); Store.save(b);
            return log;
        }

        const winGold = Math.floor(10 + winner.lv * 2);
        P.gold(winner, winGold, '决斗胜利:' + loser.nick);
        winner.wins = (winner.wins || 0) + 1;
        loser.losses = (loser.losses || 0) + 1;

        // 恢复部分HP
        a.hp = Math.max(1, Math.floor(aHp));
        b.hp = Math.max(1, Math.floor(bHp));
        Store.save(a);
        Store.save(b);

        log += '🏆 ' + winner.nick + ' 胜利！+' + winGold + '金\n';
        log += '📊 ' + a.nick + ' ' + a.wins + '胜/' + a.losses + '负　' + b.nick + ' ' + b.wins + '胜/' + b.losses + '负';
        return log;
    }

    // ═══════════════════════════════════════════════════════════
    //  自动冒险归来通知
    // ═══════════════════════════════════════════════════════════
    async function checkAdventures() {
        const all = Store.all();
        for (const p of all) {
            if (!p.registered || !p.adv) continue;
            const elapsed = Date.now() - p.adv;
            if (elapsed >= p.advDuration) {
                if (CFG.AUTO_ADVENTURE_NOTICE) {
                    enqueueSend(p.nick + ' 冒险归来了！发送 /归来 查看收获。');
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  清理过期决斗邀请
    // ═══════════════════════════════════════════════════════════
    function cleanExpiredDuels() {
        const now = Date.now();
        for (const [uid, pending] of pendingDuels) {
            if (pending.expire < now) {
                pendingDuels.delete(uid);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    //  备份
    // ═══════════════════════════════════════════════════════════
    async function backupCommand(cmd, arg, player) {
        const nick = player.nick;
        if (cmd === '备份列表') {
            if (!admin(nick)) return '权限不足。';
            const list = Store.listBackups();
            if (!list.length) return '暂无备份。';
            const lines = list.slice(0, 10).map(b => {
                const d = new Date(b.time);
                return d.toLocaleString('zh-CN') + ' (' + b.time + ')';
            });
            return U.box('📦 备份列表', lines);
        }
        if (cmd === '恢复备份') {
            if (!admin(nick)) return '权限不足。';
            if (!arg) return '格式：/恢复备份 时间戳';
            const ts = parseInt(arg);
            if (isNaN(ts)) return '时间戳无效。';
            const ok = Store.restore(ts);
            return ok ? '备份已恢复。' : '恢复失败，备份不存在。';
        }
        if (cmd === '手动备份') {
            if (!admin(nick)) return '权限不足。';
            const n = Store.backup();
            return '已手动备份，共 ' + n + ' 项数据。';
        }
        return null;
    }

    // ═══════════════════════════════════════════════════════════
    //  消息处理主循环
    // ═══════════════════════════════════════════════════════════
    async function processMessage(el) {
        const mid = midOf(el);
        if (!mid || seenFingerprints.has(mid)) return;
        seenFingerprints.add(mid);
        if (seenFingerprints.size > CFG.MAX_FP) {
            const arr = Array.from(seenFingerprints);
            seenFingerprints.clear();
            arr.slice(-Math.floor(CFG.MAX_FP / 2)).forEach(k => seenFingerprints.add(k));
        }

        const nick = validNick(el);
        if (!nick) return;
        const text = cmdText(el);
        if (!text) return;

        // 检查是否是指令
        const parsed = parseCmd(text);
        if (!parsed) return;

        const { cmd, arg } = parsed;
        Log.i(nick + ': /' + cmd + ' ' + arg);

        // 冷却检查
        if (Date.now() < cooldownUntil) return;

        const uid = uidOf(el);
        if (!uid) return;

        enqueueProc(async () => {
            const player = await P.ensure(uid, nick);

            // 先尝试备份管理指令
            let result = await backupCommand(cmd, arg, player);
            if (result !== null) {
                enqueueSend(result);
                cooldownUntil = Date.now() + CFG.COOLDOWN_MS;
                return;
            }

            // 主指令处理
            result = await command(cmd, arg, player);
            if (result !== null) {
                enqueueSend(result);
                cooldownUntil = Date.now() + CFG.COOLDOWN_MS;
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    //  启动
    // ═══════════════════════════════════════════════════════════
    function start() {
        Log.init();
        Log.i('Bot v14 启动');

        // 查找消息容器
        const container = findContainer();
        if (!container) {
            Log.i('未找到消息容器，3秒后重试');
            setTimeout(start, 3000);
            return;
        }

        // 初始扫描已有消息
        const msgs = msgEls();
        msgs.forEach(el => {
            const mid = midOf(el);
            if (mid) seenFingerprints.add(mid);
        });
        Log.i('已标记 ' + seenFingerprints.size + ' 条历史消息');

        // 设置 MutationObserver
        observerRef = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1) {
                        // 检查新增节点本身是否是消息
                        const cls = node.className || '';
                        if (cls.includes('message') || cls.includes('msg')) {
                            processMessage(node);
                            continue;
                        }
                        // 检查子节点
                        const children = node.querySelectorAll?.('.message-item, .message, [class*="message"]');
                        if (children) {
                            children.forEach(child => processMessage(child));
                        }
                    }
                }
            }
        });

        observerRef.observe(container, { childList: true, subtree: true });
        Log.i('Observer 已启动');
        Log.stat('运行', '#0f0');

        // 定时任务：检查冒险归来
        setInterval(() => {
            checkAdventures();
            cleanExpiredDuels();
        }, 30000); // 每30秒检查一次
    }

    // ═══════════════════════════════════════════════════════════
    //  P.gold
    // ═══════════════════════════════════════════════════════════
    P.gold = function(p, amount, reason) {
        p.gold += amount;
        if (amount > 0) p.earned = (p.earned || 0) + amount;
        if (amount < 0) p.spent = (p.spent || 0) + Math.abs(amount);
        // 记录流水
        try {
            const key = '_log_' + p.id + '_' + Date.now();
            const sign = amount >= 0 ? '+' : '';
            GM_setValue(key, U.time() + ' ' + reason + ' ' + sign + amount + ' 💰' + p.gold);
        } catch(e) {}
        Store.save(p);
    };

    // ═══════════════════════════════════════════════════════════
    //  U.pick
    // ═══════════════════════════════════════════════════════════
    U.pick = function(arr) {
        if (!arr || !arr.length) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    };

    // ═══════════════════════════════════════════════════════════
    //  等加载完启动
    // ═══════════════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

})();
