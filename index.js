/**
 * 💎 DIAMONDBOT - Minimal Dashboard
 * Server: Window-smp.aternos.me:54008
 */

const mineflayer = require('mineflayer');
const express = require('express');

// ========== AAPKA SERVER CONFIG ==========
const BOT_USERNAME = 'DiamondBot';
const SERVER_HOST = 'Window-smp.aternos.me';  // ← Aapka IP
const SERVER_PORT = 54008;                     // ← Aapka Port
const SERVER_VERSION = '1.21.1';               // ← Aapka Version

const CHAT_MESSAGES = [
    "subscribe to not diamond",
    "hey guys",
    "I M regular player",
    "nice server",
    "anyone here?",
    "lol",
    "gg",
    "diamonds are forever 💎"
];

const TRIGGER_WORDS = ['hay', 'hi', 'hello', 'hey', 'hii'];

// ========== VARIABLES ==========
let bot = null;
let botStatus = 'offline';
let botLogs = [];
let chatCount = 0;
let replyCount = 0;
let moveCount = 0;
let currentAction = 'idle';

let botConfig = {
    moveRadius: 10,        // Move radius
    moveSpeed: 5,          // Move speed
    jumpEnabled: true,     // Jump on/off
    chatIntervalMin: 60,
    chatIntervalMax: 180
};

// ========== WEB SERVER ==========
const app = express();
app.use(express.json());
app.use(express.static('public'));

// API: Status
app.get('/api/status', (req, res) => {
    res.json({
        status: botStatus,
        username: BOT_USERNAME,
        server: `${SERVER_HOST}:${SERVER_PORT}`,
        version: SERVER_VERSION,
        chatCount,
        replyCount,
        moveCount,
        action: currentAction,
        position: bot && bot.entity ? {
            x: bot.entity.position.x.toFixed(1),
            y: bot.entity.position.y.toFixed(1),
            z: bot.entity.position.z.toFixed(1)
        } : null,
        config: botConfig,
        logs: botLogs.slice(-15)
    });
});

// API: Start
app.post('/api/start', (req, res) => {
    if (botStatus === 'online' || botStatus === 'connecting') {
        return res.json({ success: false, message: 'Bot already running!' });
    }
    startBot();
    res.json({ success: true, message: 'Bot starting...' });
});

// API: Stop
app.post('/api/stop', (req, res) => {
    if (botStatus === 'offline') {
        return res.json({ success: false, message: 'Bot already stopped!' });
    }
    stopBot();
    res.json({ success: true, message: 'Bot stopping...' });
});

// API: Update Config
app.post('/api/config', (req, res) => {
    const { moveRadius, moveSpeed, jumpEnabled, chatIntervalMin, chatIntervalMax } = req.body;
    
    if (moveRadius !== undefined) botConfig.moveRadius = parseInt(moveRadius);
    if (moveSpeed !== undefined) botConfig.moveSpeed = parseInt(moveSpeed);
    if (jumpEnabled !== undefined) botConfig.jumpEnabled = jumpEnabled;
    if (chatIntervalMin !== undefined) botConfig.chatIntervalMin = parseInt(chatIntervalMin);
    if (chatIntervalMax !== undefined) botConfig.chatIntervalMax = parseInt(chatIntervalMax);
    
    addLog(`Config updated: Radius=${botConfig.moveRadius}, Speed=${botConfig.moveSpeed}`, '⚙️');
    res.json({ success: true, config: botConfig });
});

// Start server
const WEB_PORT = process.env.PORT || 3000;
app.listen(WEB_PORT, '0.0.0.0', () => {
    addLog(`Dashboard: http://0.0.0.0:${WEB_PORT}`, '🌐');
});

// ========== BOT FUNCTIONS ==========

function addLog(msg, icon = 'ℹ️') {
    const time = new Date().toLocaleTimeString();
    const log = `[${time}] ${icon} ${msg}`;
    botLogs.push(log);
    if (botLogs.length > 50) botLogs.shift();
    console.log(log);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function containsTrigger(msg) {
    return TRIGGER_WORDS.some(w => msg.toLowerCase().includes(w));
}

function startBot() {
    addLog('Connecting to Window-smp.aternos.me:54008...', '💎');
    botStatus = 'connecting';
    
    try {
        bot = mineflayer.createBot({
            host: SERVER_HOST,
            port: SERVER_PORT,
            username: BOT_USERNAME,
            version: SERVER_VERSION,
            auth: 'offline'
        });

        bot.on('spawn', () => {
            botStatus = 'online';
            currentAction = 'idle';
            addLog('✅ DiamondBot connected!', '✅');
            
            setTimeout(() => {
                if (bot && bot.entity) bot.chat('💎 DiamondBot is here!');
            }, 3000);
            
            startChatLoop();
            startMovementLoop();
        });

        bot.on('chat', (username, message) => {
            if (username === bot.username) return;
            
            if (containsTrigger(message)) {
                setTimeout(() => {
                    bot.chat(`Hello ${username}! 💎`);
                    replyCount++;
                }, 1000);
            }
        });

        bot.on('playerJoined', (player) => {
            addLog(`Player joined: ${player.username}`, '👤');
        });

        bot.on('playerLeft', (player) => {
            addLog(`Player left: ${player.username}`, '👤');
        });

        bot.on('death', () => {
            addLog('Bot died! Respawning...', '💀');
        });

        bot.on('end', () => {
            addLog('❌ Disconnected from server', '❌');
            botStatus = 'offline';
            currentAction = 'idle';
            bot = null;
        });

        bot.on('error', (err) => {
            addLog(`Error: ${err.message}`, '❌');
        });

    } catch (err) {
        addLog(`Failed: ${err.message}`, '❌');
        botStatus = 'offline';
    }
}

function stopBot() {
    if (bot) {
        try { bot.chat('💎 Bye!'); } catch (e) {}
        setTimeout(() => {
            try { bot.end(); } catch (e) {}
            bot = null;
            botStatus = 'offline';
            currentAction = 'idle';
            addLog('Bot stopped', '🛑');
        }, 1000);
    }
}

function startChatLoop() {
    function sendChat() {
        if (!bot || !bot.entity || botStatus !== 'online') return;
        
        currentAction = 'chatting';
        const msg = randomChoice(CHAT_MESSAGES);
        bot.chat(msg);
        chatCount++;
        addLog(`Chat: ${msg}`, '💬');
        
        setTimeout(() => currentAction = 'idle', 2000);
        
        const nextDelay = randomInt(botConfig.chatIntervalMin * 1000, botConfig.chatIntervalMax * 1000);
        setTimeout(sendChat, nextDelay);
    }
    
    setTimeout(sendChat, 10000);
}

function startMovementLoop() {
    function move() {
        if (!bot || !bot.entity || botStatus !== 'online') return;
        
        currentAction = 'moving';
        moveCount++;
        
        try {
            const keys = ['forward', 'back', 'left', 'right'];
            const key = randomChoice(keys);
            
            bot.setControlState(key, true);
            
            // Look around
            if (Math.random() > 0.3) {
                currentAction = 'looking';
                bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI, true);
            }
            
            setTimeout(() => {
                bot.setControlState(key, false);
                
                // Jump
                if (botConfig.jumpEnabled && Math.random() > 0.7) {
                    currentAction = 'jumping';
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 500);
                }
                
                setTimeout(() => currentAction = 'idle', 1000);
                
            }, randomInt(500, botConfig.moveSpeed * 200));
            
        } catch (e) {}
        
        setTimeout(move, randomInt(3000, 8000));
    }
    
    setTimeout(move, 3000);
}

// Graceful shutdown
process.on('SIGINT', () => {
    if (bot) {
        try { bot.end(); } catch (e) {}
    }
    process.exit(0);
});

addLog('DiamondBot ready! Click START to connect', '👉');
