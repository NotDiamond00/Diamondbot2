// Update display values
function updateValue(id, value) {
    document.getElementById(id).textContent = value;
}

// Fetch status every 2 seconds
setInterval(updateStatus, 2000);
updateStatus();

async function updateStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        // Status dot and text
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        const actionText = document.getElementById('actionText');
        const btnStart = document.getElementById('btnStart');
        const btnStop = document.getElementById('btnStop');
        const coordsCard = document.getElementById('coordsCard');
        
        // Update status
        dot.className = 'status-dot ' + data.status;
        text.textContent = data.status.toUpperCase();
        
        // Buttons
        btnStart.disabled = data.status === 'online' || data.status === 'connecting';
        btnStop.disabled = data.status === 'offline';
        
        // Action text
        const actions = {
            'idle': 'Idle',
            'moving': '🚶 Moving',
            'jumping': '⬆️ Jumping',
            'looking': '👀 Looking',
            'chatting': '💬 Chatting'
        };
        actionText.textContent = actions[data.action] || '-';
        
        // Coordinates
        if (data.position && data.status === 'online') {
            coordsCard.style.display = 'block';
            document.getElementById('coordsDisplay').textContent = 
                `X: ${data.position.x} | Y: ${data.position.y} | Z: ${data.position.z}`;
        } else {
            coordsCard.style.display = 'none';
        }
        
        // Stats
        document.getElementById('chatCount').textContent = data.chatCount;
        document.getElementById('replyCount').textContent = data.replyCount;
        document.getElementById('moveCount').textContent = data.moveCount;
        
        // Logs
        const logsDiv = document.getElementById('logs');
        logsDiv.innerHTML = data.logs.map(log => {
            let cls = '';
            if (log.includes('✅') || log.includes('connected')) cls = 'success';
            if (log.includes('❌') || log.includes('Error') || log.includes('Failed')) cls = 'error';
            if (log.includes('💬') || log.includes('Chat')) cls = 'chat';
            return `<div class="log-line ${cls}">${escapeHtml(log)}</div>`;
        }).join('');
        logsDiv.scrollTop = logsDiv.scrollHeight;
        
    } catch (err) {
        console.error('Error:', err);
    }
}

async function startBot() {
    try {
        const res = await fetch('/api/start', { method: 'POST' });
        const data = await res.json();
        console.log(data.message);
    } catch (err) {
        alert('Error starting bot!');
    }
}

async function stopBot() {
    try {
        const res = await fetch('/api/stop', { method: 'POST' });
        const data = await res.json();
        console.log(data.message);
    } catch (err) {
        alert('Error stopping bot!');
    }
}

async function saveSettings() {
    const config = {
        moveRadius: document.getElementById('moveRadius').value,
        moveSpeed: document.getElementById('moveSpeed').value,
        jumpEnabled: document.getElementById('jumpEnabled').checked
    };
    
    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const data = await res.json();
        if (data.success) {
            alert('Settings saved!');
        }
    } catch (err) {
        alert('Error saving settings!');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
    