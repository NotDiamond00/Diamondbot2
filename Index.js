/**
 * 💎 DIAMONDBOT - 24/7 AFK Bot
 * Auto Respawn + Auto Reconnect
 * Auto chat every 2 minutes
 * Server: Window-smp.aternos.me:54008
 */

const mineflayer = require('mineflayer');

// ========== CONFIG ==========
const BOT_USERNAME = 'DiamondBot';
const SERVER_HOST = 'Crimson-SMP-S1.aternos.me';
const SERVER_PORT = 24283;
const SERVER_VERSION = '1.21.1';

// ========== SETTINGS ==========
const MOVE_RADIUS = 10;
const MOVE_SPEED = 5;
const JUMP_ENABLED = true;
const MOVE_INTERVAL = 5000;
const CHAT_INTERVAL = 120000; // 2 minutes
const RECONNECT_DELAY = 10000; // 10 sec after disconnect

// ========== CHAT MESSAGES ==========
const CHAT_MESSAGES = [
    "subscribe to not diamond",
    "hey guys",
    "I M regular player",
    "nice server",
    "anyone here?",
    "lol",
    "gg",
    "diamonds are forever 💎",
    "brb",
    "afk for a bit"
];

// ========== BOT ==========
let bot = null;
let isConnected = false;
let deathCount = 0;

function log(msg) {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] ${msg}`);
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function createBot() {
    if (isConnected) return;
    
    log('💎 Connecting to server...');
    
    bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: BOT_USERNAME,
        version: SERVER_VERSION,
        auth: 'offline'
    });

    // ✅ CONNECTED / RESPAWN
    bot.on('spawn', () => {
        isConnected = true;
        log('✅ DiamondBot online!');
        log(`📍 Position: ${bot.entity.position}`);
        
        startMoving();
        startAutoChat();
    });

    // 💀 DEATH - AUTO RESPAWN
    bot.on('death', () => {
        deathCount++;
        log(`💀 Bot died! Death #${deathCount}`);
        log('🔄 Auto respawning...');
        
        // Automatically respawn after 3 seconds
        setTimeout(() => {
            if (bot && isConnected) {
                try {
                    bot.chat('💎 DiamondBot respawned!');
                    log('✅ Respawned successfully!');
                } catch (e) {
                    log('❌ Respawn failed, reconnecting...');
                    isConnected = false;
                    bot = null;
                    setTimeout(createBot, RECONNECT_DELAY);
                }
            }
        }, 3000);
    });

    // 💬 REPLY TO "hay/hi/hello"
    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        
        const msg = message.toLowerCase();
        if (['hay', 'hi', 'hello', 'hey', 'hii'].some(w => msg.includes(w))) {
            setTimeout(() => {
                if (bot && isConnected) {
                    bot.chat(`Hello ${username}! 💎`);
                    log(`💬 Replied to ${username}`);
                }
            }, 1000);
        }
    });

    // 👀 Look around
    setInterval(() => {
        if (bot && isConnected) {
            bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI, true);
        }
    }, 8000);

    // 🔌 DISCONNECTED
    bot.on('end', () => {
        log('❌ Disconnected from server!');
        isConnected = false;
        bot = null;
        
        log(`🔄 Reconnecting in ${RECONNECT_DELAY/1000} seconds...`);
        setTimeout(createBot, RECONNECT_DELAY);
    });

    // ❌ ERROR
    bot.on('error', (err) => {
        log(`❌ Error: ${err.message}`);
        
        // If connection refused, try reconnect
        if (err.message.includes('ECONNREFUSED') || err.message.includes('connection refused')) {
            log('🔄 Server offline? Retrying...');
            isConnected = false;
            bot = null;
            setTimeout(createBot, RECONNECT_DELAY);
        }
    });
}

// 🚶 MOVEMENT LOOP
function startMoving() {
    function move() {
        if (!bot || !isConnected) return;
        
        try {
            const keys = ['forward', 'back', 'left', 'right'];
            const key = keys[Math.floor(Math.random() * keys.length)];
            
            bot.setControlState(key, true);
            
            if (JUMP_ENABLED && Math.random() > 0.7) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
            
            setTimeout(() => {
                if (bot) bot.setControlState(key, false);
            }, Math.random() * MOVE_SPEED * 200 + 500);
            
        } catch (e) {}
        
        setTimeout(move, MOVE_INTERVAL + Math.random() * 3000);
    }
    
    setTimeout(move, 2000);
}

// 💬 AUTO CHAT (Every 2 Minutes)
function startAutoChat() {
    function sendChat() {
        if (!bot || !isConnected) return;
        
        try {
            const msg = randomChoice(CHAT_MESSAGES);
            bot.chat(msg);
            log(`💬 Auto chat: "${msg}"`);
        } catch (e) {}
        
        setTimeout(sendChat, CHAT_INTERVAL);
    }
    
    setTimeout(sendChat, 30000); // First chat after 30 sec
}

// ========== START ==========
log('🚀 DiamondBot starting...');
log(`🌐 Server: ${SERVER_HOST}:${SERVER_PORT}`);
log(`💬 Auto chat every ${CHAT_INTERVAL/1000} seconds`);
log(`💀 Auto respawn enabled`);
createBot();

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGINT', () => {
    log('🛑 Stopping bot...');
    if (bot) {
        try { bot.end(); } catch (e) {}
    }
    process.exit(0);
});
        
