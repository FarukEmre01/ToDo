// script.js
document.addEventListener('DOMContentLoaded', () => {

    // --- Audio Engine (Synthesizer) ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playSound(type) {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if(type === 'complete') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'uncomplete') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.1); 
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
        } else if(type === 'party') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.05); 
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.1); 
            osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.15); 
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.4);
        } else if(type === 'alarm') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(0, audioCtx.currentTime + 0.1); 
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);
            osc.frequency.setValueAtTime(0, audioCtx.currentTime + 0.3);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.4);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.5);
        } else if(type === 'whoosh') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.15);
        } else if(type === 'beep') {
            // Klasik bip-bip: 1000Hz sine, kısa ve net
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 0.02);
            gainNode.gain.setValueAtTime(0.35, audioCtx.currentTime + 0.12);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.15);
        }
    }

    // 5 saniyelik klasik bip-bip alarm — tek oscillator, temiz zamanlama
    let pomoAlarmOsc = null;
    let pomoAlarmGain = null;

    function playPomoAlarm() {
        stopPomoAlarm();
        if(audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.value = 1000; // Klasik 1kHz bip

        // Başlangıçta sessiz
        gain.gain.setValueAtTime(0, audioCtx.currentTime);

        // 5 saniye boyunca bip-bip deseni: 
        // Her 700ms'de bir çift bip (100ms bip, 100ms sessiz, 100ms bip, 400ms sessiz)
        const t = audioCtx.currentTime;
        const duration = 5; // toplam 5 saniye
        const cycleLength = 0.7; // her döngü 700ms
        const cycles = Math.floor(duration / cycleLength);

        for(let i = 0; i < cycles; i++) {
            const start = t + (i * cycleLength);
            // İlk bip
            gain.gain.setValueAtTime(0.3, start);
            gain.gain.setValueAtTime(0, start + 0.1);
            // İkinci bip
            gain.gain.setValueAtTime(0.3, start + 0.2);
            gain.gain.setValueAtTime(0, start + 0.3);
        }

        osc.start(t);
        osc.stop(t + duration);

        pomoAlarmOsc = osc;
        pomoAlarmGain = gain;

        // Temizlik
        osc.onended = () => {
            pomoAlarmOsc = null;
            pomoAlarmGain = null;
        };
    }

    function stopPomoAlarm() {
        if(pomoAlarmOsc) {
            try { pomoAlarmOsc.stop(); } catch(e) {}
            pomoAlarmOsc = null;
            pomoAlarmGain = null;
        }
    }

    // --- Confetti Engine ---
    function fireConfetti() {
        const colors = ['#FF00FF', '#00FFFF', '#39FF14', '#0066FF', '#B200FF', '#FFEA00', '#FF003C'];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = 30 + (Math.random() * 40); 
            particle.style.backgroundColor = color;
            particle.style.left = left + 'vw';
            particle.style.bottom = '0px';
            
            particle.style.width = (5 + Math.random() * 8) + 'px';
            particle.style.height = (10 + Math.random() * 12) + 'px';
            if(Math.random() > 0.5) particle.style.borderRadius = '50%';
            
            document.body.appendChild(particle);

            const velocity = 25 + Math.random() * 20; 
            const spread = (Math.random() - 0.5) * 45; 

            let x = 0;
            let y = 0;
            let velX = spread;
            let velY = -velocity; 
            
            const gravity = 0.35; 
            const maxFallSpeed = 2 + Math.random() * 3; 
            const frictionX = 0.96; 

            let rotation = Math.random() * 360;
            const rotSpeed = (Math.random() - 0.5) * 15;
            let sway = Math.random() * Math.PI * 2; 
            const swaySpeed = 0.05 + Math.random() * 0.1;

            function animate() {
                velY += gravity;
                if (velY > maxFallSpeed) velY = maxFallSpeed;
                
                velX *= frictionX; 
                sway += swaySpeed;
                const currentVelX = velX + Math.sin(sway) * 2;

                x += currentVelX;
                y += velY;
                rotation += rotSpeed;

                particle.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

                if (y > window.innerHeight + 100) {
                    particle.remove();
                } else {
                    requestAnimationFrame(animate);
                }
            }
            requestAnimationFrame(animate);
        }
    }


    // --- Toast Notification System ---
    let toastContainer = null;
    function showToast(message, type = 'success') {
        if(!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icon based on type
        let iconHtml = '';
        if(type === 'success') {
            iconHtml = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="toast-icon" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        } else if (type === 'error') {
            iconHtml = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="toast-icon" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else {
            iconHtml = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="toast-icon" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }
        
        toast.innerHTML = `${iconHtml}<span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        // Animate In
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- State Management ---
    let workspaces = [];
    let currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
    
    // Legacy migration + Load
    const localData = JSON.parse(localStorage.getItem('todos')); // VERY OLD
    const oldBoards = JSON.parse(localStorage.getItem('boards')); // V1-V4
    const localWorkspaces = JSON.parse(localStorage.getItem('workspaces')); // V5
    
    // Auto-Migration System
    if (localWorkspaces && localWorkspaces.length > 0) {
        workspaces = localWorkspaces;
        if(!currentWorkspaceId || !workspaces.find(ws => ws.id === currentWorkspaceId)) {
            currentWorkspaceId = workspaces[0].id;
        }
    } else if (oldBoards) {
        // V4 -> V5 Migration
        const newWsId = 'ws_' + Date.now();
        workspaces = [{
            id: newWsId,
            title: 'Genel',
            boards: oldBoards
        }];
        currentWorkspaceId = newWsId;
        localStorage.removeItem('boards'); 
        saveWorkspaces();
    } else if (localData && Array.isArray(localData)) {
        // Very old version migration
        const newWsId = 'ws_' + Date.now();
        let migratedBoards = [{ id: 'b_migrated_' + Date.now(), title: 'Liste 1', filterMode: 'all', tasks: localData }];
        workspaces = [{ id: newWsId, title: 'Genel', boards: migratedBoards }];
        currentWorkspaceId = newWsId;
        localStorage.removeItem('todos');
        saveWorkspaces();
    } else {
        // Factory Default (New User)
        const newWsId = 'ws_' + Date.now();
        workspaces = [
            { id: newWsId, title: 'Genel', boards: [
                { id: `b_${Date.now()}`, title: 'Bugün', filterMode: 'all', tasks: [] },
                { id: `b_${Date.now()+1}`, title: 'Yarın', filterMode: 'all', tasks: [] }
            ]}
        ];
        currentWorkspaceId = newWsId;
        saveWorkspaces();
    }

    // Ensure V6 Settings existence in all Workspaces
    workspaces.forEach(ws => {
        if(!ws.settings) {
            ws.settings = { showTime: true, showCheckboxes: true, showProgressBar: true, alarmEnabled: false, alarmOffset: 5, snoozeDuration: 5 };
        } else {
            if (ws.settings.alarmEnabled === undefined) ws.settings.alarmEnabled = false;
            if (ws.settings.alarmOffset === undefined) ws.settings.alarmOffset = 5;
            if (ws.settings.snoozeDuration === undefined) ws.settings.snoozeDuration = 5;
        }
        ws.boards.forEach(b => {
            if(!b.filterMode) b.filterMode = 'all';
            b.tasks.forEach(task => {
                if(task.notes === undefined) task.notes = '';
                if(task.subtasks === undefined) task.subtasks = [];
                if(task.isExpanded === undefined) task.isExpanded = false;
                if(task.alarmTriggered === undefined) task.alarmTriggered = false;
            });
        });
    });

    function getActiveWorkspace() {
        return workspaces.find(ws => ws.id === currentWorkspaceId) || workspaces[0];
    }
    
    function saveWorkspaces() {
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        localStorage.setItem('currentWorkspaceId', currentWorkspaceId);
        updateTotalCount();
        renderSidebar();
    }

    // --- DOM Elements ---
    const pomodoroSidebar = document.getElementById('pomodoro-sidebar');
    const closePomodoroBtn = document.getElementById('close-pomodoro-btn');
    const pomoToggleBtn = document.getElementById('pomo-toggle-btn');
    const pomoTimerDisplay = document.getElementById('pomo-timer-display');
    const pomoRingProgress = document.getElementById('pomo-ring-progress');
    const pomoStartBtn = document.getElementById('pomo-start-btn');
    const pomoResetBtn = document.getElementById('pomo-reset-btn');
    const pomoSkipBtn = document.getElementById('pomo-skip-btn');
    const pomoModeBtns = document.querySelectorAll('.pomo-mode-btn');

    // Quick Settings Elements
    const pomoWorkDurSelect = document.getElementById('pomo-work-duration');
    const pomoBreakDurSelect = document.getElementById('pomo-break-duration');
    const pomoTargetInput = document.getElementById('pomo-target-rounds');
    const pomoSoundToggle = document.getElementById('pomo-sound-toggle');
    const pomoDotsContainer = document.getElementById('pomo-dots-container');
    const pomoRoundText = document.getElementById('pomo-round-text');
    const pomoStatusIcon = document.getElementById('pomo-status-icon');
    const pomoTimerLabel = document.getElementById('pomo-timer-label');

    const boardContainer = document.getElementById('board-container');
    const boardTemplate = document.getElementById('board-template');
    const addBoardBtn = document.getElementById('add-board-btn');
    const totalCountOutput = document.getElementById('total-task-count');
    const searchInput = document.getElementById('board-search');
    
    // Sidebar Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const addWorkspaceBtn = document.getElementById('add-workspace-btn');
    const workspaceListContainer = document.getElementById('workspace-list');
    const exportBackupBtn = document.getElementById('export-backup-btn');
    const importBackupFile = document.getElementById('import-backup-file');

    // Settings Modal Elements
    const wsSettingsBtn = document.getElementById('ws-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingTimeToggle = document.getElementById('setting-time-toggle');
    const settingCheckToggle = document.getElementById('setting-check-toggle');
    const settingProgressToggle = document.getElementById('setting-progress-toggle');
    const settingAlarmToggle = document.getElementById('setting-alarm-toggle');
    const settingAlarmOptions = document.getElementById('setting-alarm-options');
    const settingAlarmOffset = document.getElementById('setting-alarm-offset');
    const settingSnoozeDuration = document.getElementById('setting-snooze-duration');

    // Popup Elements
    const colorPopup = document.getElementById('color-popup');
    let currentDotTaskId = null; 
    let currentDotBoardId = null;

    // Drag Trackers
    let draggedItemId = null;
    let draggedSourceBoardId = null; 
    let draggedBoardId = null; 

    // --- Workspace Aktiflik Güncelleme ---
    function showView(view) {
        document.querySelectorAll('.sidebar-nav-item, .workspace-item').forEach(el => el.classList.remove('active'));
        const ws = getActiveWorkspace();
        const activeWsEl = document.querySelector(`.workspace-item[data-id="${ws.id}"]`);
        if(activeWsEl) activeWsEl.classList.add('active');
        updateTotalCount();
    }

    function togglePomodoroSidebar(show) {
        if(show === undefined) {
            pomodoroSidebar.classList.toggle('hidden');
        } else {
            if(show) pomodoroSidebar.classList.remove('hidden');
            else pomodoroSidebar.classList.add('hidden');
        }
        
        if(!pomodoroSidebar.classList.contains('hidden')) {
            toggleSidebar(false); // Close left sidebar if right opens
        }
    }

    if(pomoToggleBtn) {
        pomoToggleBtn.addEventListener('click', () => {
            playSound('whoosh');
            togglePomodoroSidebar();
        });
    }

    if(closePomodoroBtn) {
        closePomodoroBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playSound('whoosh');
            togglePomodoroSidebar(false);
        });
    }

    // BLOCK CLICK PROPAGATION to prevent background button triggers
    if(pomodoroSidebar) {
        pomodoroSidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        pomodoroSidebar.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    }

    // --- Pomodoro Timer Engine ---
    let pomoMode = 'work'; 
    let pomoTimeOut = null;
    let pomoIsRunning = false;
    let pomoTimeRemaining = 25 * 60; 
    let pomoCompletedRounds = 0;
    let pomoTargetRounds = 4;

    const POMO_CIRCUMFERENCE = 2 * Math.PI * 100;

    function getPomoDuration() {
        if(pomoMode === 'work') return (parseInt(pomoWorkDurSelect.value) || 25) * 60;
        return (parseInt(pomoBreakDurSelect.value) || 5) * 60;
    }

    function pomoStartTimer() {
        if(pomoIsRunning) return;
        pomoIsRunning = true;
        updateStartBtnIcon(true);
        pomoTimeOut = setInterval(() => {
            pomoTimeRemaining--;
            updatePomoDisplay();
            
            if(pomoTimeRemaining <= 0) {
                clearInterval(pomoTimeOut);
                pomoIsRunning = false;
                updateStartBtnIcon(false);
                
                // Klasik bip-bip alarm sesi 5 saniye boyunca
                if(pomoSoundToggle.checked) {
                    playPomoAlarm();
                }
                showToast(pomoMode === 'work' ? 'Odaklanma bitti! Mola zamanı ☕' : 'Mola bitti! Odaklanma zamanı 🎯', 'success');
                
                pomoNextMode(true); // true = autoStart
            }
        }, 1000);
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function renderPomoDots() {
        if(!pomoDotsContainer) return;
        pomoDotsContainer.innerHTML = '';
        pomoTargetRounds = parseInt(pomoTargetInput.value) || 4;
        
        for(let i = 0; i < pomoTargetRounds; i++) {
            const dot = document.createElement('div');
            dot.className = `pomo-dot ${i < pomoCompletedRounds ? 'completed' : ''}`;
            pomoDotsContainer.appendChild(dot);
        }
        if(pomoRoundText) {
            pomoRoundText.textContent = `${pomoCompletedRounds} / ${pomoTargetRounds}`;
        }
    }

    function updatePomoDisplay() {
        if(pomoTimerDisplay) {
            pomoTimerDisplay.textContent = formatTime(pomoTimeRemaining);
        }
        if(pomoRingProgress) {
            const total = getPomoDuration();
            const dashoffset = POMO_CIRCUMFERENCE * (1 - (pomoTimeRemaining / total));
            pomoRingProgress.style.strokeDashoffset = dashoffset;
        }
        if(pomoIsRunning) {
            document.title = `${pomoMode === 'work' ? '🎯' : '☕'} ${formatTime(pomoTimeRemaining)}`;
        } else {
            document.title = "Görev Listem";
        }
        
        // Update Labels
        if(pomoMode === 'work') {
            pomoStatusIcon.textContent = '🎯';
            pomoTimerLabel.textContent = 'Odaklanma zamanı';
        } else {
            pomoStatusIcon.textContent = '☕';
            pomoTimerLabel.textContent = 'Dinlenme zamanı';
        }
    }

    pomoModeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            playSound('whoosh');
            pomoModeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            pomoMode = e.target.dataset.mode;
            pomoIsRunning = false;
            clearInterval(pomoTimeOut);
            updateStartBtnIcon(false);
            pomoTimeRemaining = getPomoDuration();
            updatePomoDisplay();
        });
    });

    function updateStartBtnIcon(running) {
        if(!pomoStartBtn) return;
        if(running) {
            pomoStartBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            pomoStartBtn.classList.add('active');
        } else {
            pomoStartBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
            pomoStartBtn.classList.remove('active');
        }
    }

    if(pomoStartBtn) {
        pomoStartBtn.addEventListener('click', () => {
            if (pomoIsRunning) {
                pomoIsRunning = false;
                clearInterval(pomoTimeOut);
                updateStartBtnIcon(false);
            } else {
                playSound('complete');
                pomoStartTimer();
            }
        });
    }

    function pomoNextMode(autoStart) {
        if(pomoMode === 'work') {
            pomoCompletedRounds++;
            renderPomoDots();
            pomoMode = 'break';
            pomoModeBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('.pomo-mode-btn[data-mode="break"]').classList.add('active');
        } else {
            pomoMode = 'work';
            pomoModeBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('.pomo-mode-btn[data-mode="work"]').classList.add('active');
        }
        pomoTimeRemaining = getPomoDuration();
        updatePomoDisplay();
        
        // Auto-start the next timer after a brief delay for sound to finish
        if(autoStart) {
            setTimeout(() => pomoStartTimer(), 2500);
        }
    }

    if(pomoSkipBtn) {
        pomoSkipBtn.addEventListener('click', () => {
            playSound('whoosh');
            clearInterval(pomoTimeOut);
            pomoIsRunning = false;
            updateStartBtnIcon(false);
            pomoNextMode();
        });
    }

    if(pomoResetBtn) {
        pomoResetBtn.addEventListener('click', () => {
            playSound('uncomplete');
            pomoIsRunning = false;
            clearInterval(pomoTimeOut);
            updateStartBtnIcon(false);
            pomoTimeRemaining = getPomoDuration();
            updatePomoDisplay();
        });
    }

    // Full Reset Button (header) — resets everything: timer, rounds, and settings
    const pomoFullResetBtn = document.getElementById('pomo-full-reset-btn');
    if(pomoFullResetBtn) {
        pomoFullResetBtn.addEventListener('click', () => {
            showConfirm(
                'Pomodoro Sıfırla',
                'Sayaç, ilerleme ve ayarlar tamamen sıfırlansın mı?',
                () => {
                    playSound('uncomplete');
                    pomoIsRunning = false;
                    clearInterval(pomoTimeOut);
                    updateStartBtnIcon(false);
                    pomoCompletedRounds = 0;
                    pomoMode = 'work';
                    pomoModeBtns.forEach(b => b.classList.remove('active'));
                    document.querySelector('.pomo-mode-btn[data-mode="work"]').classList.add('active');

                    // Reset settings to defaults
                    pomoWorkDurSelect.value = 25;
                    pomoBreakDurSelect.value = 5;
                    pomoTargetInput.value = '4';
                    pomoSoundToggle.checked = true;

                    pomoTimeRemaining = getPomoDuration();
                    updatePomoDisplay();
                    renderPomoDots();
                    showToast('Pomodoro sıfırlandı!', 'success');
                }
            );
        });
    }

    // Quick Settings Listeners
    pomoTargetInput.addEventListener('change', renderPomoDots);
    pomoWorkDurSelect.addEventListener('input', () => {
        if(!pomoIsRunning && pomoMode === 'work') {
            pomoTimeRemaining = getPomoDuration();
            updatePomoDisplay();
        }
    });
    pomoBreakDurSelect.addEventListener('input', () => {
        if(!pomoIsRunning && pomoMode === 'break') {
            pomoTimeRemaining = getPomoDuration();
            updatePomoDisplay();
        }
    });

    // Initialize
    updatePomoDisplay();
    renderPomoDots();

    // --- Settings Modal Logic ---
    function syncSettingsUI() {
        if (!settingCheckToggle.checked) {
            settingProgressToggle.checked = false;
            settingProgressToggle.disabled = true;
            settingProgressToggle.closest('.setting-item').classList.add('disabled-item');
        } else {
            settingProgressToggle.disabled = false;
            settingProgressToggle.closest('.setting-item').classList.remove('disabled-item');
        }
        if (settingAlarmToggle.checked) {
            settingAlarmOptions.style.display = 'flex';
        } else {
            settingAlarmOptions.style.display = 'none';
        }
    }

    wsSettingsBtn.addEventListener('click', () => {
        const ws = getActiveWorkspace();
        settingTimeToggle.checked = ws.settings.showTime;
        settingCheckToggle.checked = ws.settings.showCheckboxes;
        settingProgressToggle.checked = ws.settings.showProgressBar;
        settingAlarmToggle.checked = ws.settings.alarmEnabled;
        settingAlarmOffset.value = ws.settings.alarmOffset;
        settingSnoozeDuration.value = ws.settings.snoozeDuration;
        syncSettingsUI();
        settingsModal.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    function handleSettingsChange(e) {
        if(e.target === settingCheckToggle || e.target === settingAlarmToggle) {
            syncSettingsUI();
            if(e.target === settingAlarmToggle && settingAlarmToggle.checked) {
                if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }
            }
        }
        
        const ws = getActiveWorkspace();
        ws.settings.showTime = settingTimeToggle.checked;
        ws.settings.showCheckboxes = settingCheckToggle.checked;
        ws.settings.showProgressBar = settingProgressToggle.checked;
        ws.settings.alarmEnabled = settingAlarmToggle.checked;
        ws.settings.alarmOffset = parseInt(settingAlarmOffset.value) || 0;
        ws.settings.snoozeDuration = parseInt(settingSnoozeDuration.value) || 5;
        saveWorkspaces();
        renderAllBoards();
    }

    settingTimeToggle.addEventListener('change', handleSettingsChange);
    settingCheckToggle.addEventListener('change', handleSettingsChange);
    settingProgressToggle.addEventListener('change', handleSettingsChange);
    settingAlarmToggle.addEventListener('change', handleSettingsChange);
    settingAlarmOffset.addEventListener('input', handleSettingsChange);
    settingSnoozeDuration.addEventListener('input', handleSettingsChange);

    // --- Sidebar System Interface ---
    function toggleSidebar(force) {
        const isActive = sidebar.classList.contains('active');
        if(force === true || (!isActive && force !== false)) {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            playSound('whoosh');
        } else {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    }

    menuBtn.addEventListener('click', () => toggleSidebar(true));
    closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && sidebar.classList.contains('active')) {
            toggleSidebar(false);
        }
    });

    function renderSidebar() {
        workspaceListContainer.innerHTML = '';
        
        workspaces.forEach(ws => {
            const el = document.createElement('div');
            el.className = `workspace-item ${ws.id === currentWorkspaceId ? 'active' : ''}`;
            el.dataset.id = ws.id;
            
            el.innerHTML = `
                <span class="ws-title-input">${escapeHTML(ws.title)}</span>
                <div class="workspace-actions">
                    <button class="ws-action-btn del-ws" aria-label="Sil" title="Alanı Sil">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            el.addEventListener('click', (e) => {
                if(e.target.closest('.del-ws')) return;
                
                showView('kanban');
                
                if(currentWorkspaceId !== ws.id) {
                    playSound('complete');
                    currentWorkspaceId = ws.id;
                    saveWorkspaces();
                    renderAllBoards();
                    toggleSidebar(false);
                }
            });

            // Removed blur and keydown contenteditable events from titleInput

            const delBtn = el.querySelector('.del-ws');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(workspaces.length === 1) {
                    alert('En az 1 proje bulunmalıdır!');
                    return;
                }

                showConfirm(
                    `${ws.title} Silinecek`,
                    'Bu projeyi ve içindeki tüm görevleri tamamen silmek istediğine emin misin?',
                    () => {
                        playSound('uncomplete');
                        workspaces = workspaces.filter(w => w.id !== ws.id);
                        if(currentWorkspaceId === ws.id) {
                            currentWorkspaceId = workspaces[0].id;
                            renderAllBoards();
                        }
                        saveWorkspaces();
                    }
                );
            });

            workspaceListContainer.appendChild(el);
        });
    }

    addWorkspaceBtn.addEventListener('click', () => {
        playSound('complete');
        const newWs = {
            id: `ws_${Date.now()}`,
            title: 'Yeni Proje',
            settings: { showTime: true, showCheckboxes: true, showProgressBar: true, alarmEnabled: false, alarmOffset: 5, snoozeDuration: 5 },
            boards: []
        };
        workspaces.push(newWs);
        currentWorkspaceId = newWs.id;
        saveWorkspaces();
        renderAllBoards();
        toggleSidebar(false);
    });

    // Workspace Edit Pencik Button
    const editWorkspaceBtn = document.getElementById('edit-workspace-btn');
    if (editWorkspaceBtn) {
        editWorkspaceBtn.addEventListener('click', () => {
            const ws = getActiveWorkspace();
            const newName = prompt('Projenin yeni ismini girin:', ws.title);
            if(newName && newName.trim() !== '') {
                ws.title = newName.trim();
                saveWorkspaces();
                updateHeaderTitle();
                renderSidebar();
                playSound('complete');
            }
        });
    }

    // --- Backup System ---
    exportBackupBtn.addEventListener('click', async () => {
        const dataStr = JSON.stringify(workspaces, null, 2);
        const exportFileDefaultName = `pano_yedek_${new Date().toISOString().slice(0, 10)}.json`;

        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: exportFileDefaultName,
                    types: [{
                        description: 'JSON Yedek Dosyası',
                        accept: {'application/json': ['.json']},
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(dataStr);
                await writable.close();
                showToast('Yedek başarıyla bilgisayarınıza kaydedildi!', 'success');
            } catch (err) {
                if(err.name !== 'AbortError') {
                    console.error('Save API Error:', err);
                    fallbackDownload(dataStr, exportFileDefaultName);
                }
            }
        } else {
            fallbackDownload(dataStr, exportFileDefaultName);
        }

        function fallbackDownload(data, filename) {
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', filename);
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
            showToast('Yedek dosyanız tarayıcınızın "İndirilenler" klasörüne indirildi.', 'info');
        }
    });

    importBackupFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const parsed = JSON.parse(ev.target.result);
                // Asgari format kontrolü (Array mi ve içi doğru mu?)
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && Array.isArray(parsed[0].boards)) {
                    workspaces = parsed;
                    currentWorkspaceId = workspaces[0].id;
                    saveWorkspaces();
                    renderAllBoards();
                    toggleSidebar(false);
                    showToast('Yedek (JSON) başarıyla yüklendi ve uygulandı!', 'success');
                } else {
                    showToast('Geçersiz yedekleme veya dosya formatı bozuk!', 'error');
                }
            } catch (err) {
                showToast('Dosya okunurken bir hata oluştu. Geçerli JSON seçin.', 'error');
            }
        };
        reader.readAsText(file);
        // Aynı dosyayı tekrar seçebilmesi için değeri temizle
        importBackupFile.value = '';
    });

    // --- Init ---
    renderSidebar();
    renderAllBoards();

    // --- Custom Confirm Box ---
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmOk = document.getElementById('confirm-ok');
    const confirmCancel = document.getElementById('confirm-cancel');

    function showConfirm(title, message, onConfirm) {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        
        confirmOk.onclick = () => {
            confirmModal.classList.add('hidden');
            onConfirm();
        };
        confirmCancel.onclick = () => {
            confirmModal.classList.add('hidden');
        };
    }

    // --- Core Functions ---
    function updateTotalCount() {
        const ws = getActiveWorkspace();
        const total = ws.boards.reduce((acc, board) => acc + board.tasks.length, 0);
        totalCountOutput.textContent = total;
    }

    function updateHeaderTitle() {
        const ws = getActiveWorkspace();
        document.getElementById('workspace-title-display').innerHTML = `
            ${escapeHTML(ws.title)} <span class="badge" id="total-task-count">0</span>
        `;
        updateTotalCount();
    }

    boardContainer.addEventListener('click', (e) => {
        const deleteBoardBtn = e.target.closest('.delete-board-btn');
        if (deleteBoardBtn) {
            const boardDOM = e.target.closest('.board');
            if(boardDOM) {
                const boardId = boardDOM.dataset.id;
                deleteBoard(boardId);
            }
        }
    });

    function deleteBoard(id) {
        showConfirm(
            'Listeyi Sil', 
            'Listeyi ve içindeki tüm görevleri silmek istediğine emin misin? Bu işlem geri alınamaz!',
            () => {
                playSound('uncomplete');
                const ws = getActiveWorkspace();
                ws.boards = ws.boards.filter(b => b.id !== id);
                saveWorkspaces();
                renderAllBoards(); 
            }
        );
    }

    addBoardBtn.addEventListener('click', () => {
        playSound('complete');
        const ws = getActiveWorkspace();
        const newBoard = {
            id: `b_${Date.now()}`,
            title: 'Yeni Liste',
            filterMode: 'all',
            tasks: []
        };
        ws.boards.push(newBoard);
        saveWorkspaces();
        renderAllBoards();
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const allBoardDOMs = document.querySelectorAll('.board');
        const ws = getActiveWorkspace();
        
        if (term === '') {
            allBoardDOMs.forEach(el => el.style.display = 'flex');
            return;
        }

        allBoardDOMs.forEach(bDOM => {
            const boardData = ws.boards.find(b => b.id === bDOM.dataset.id);
            if (boardData && boardData.title.toLowerCase().includes(term)) {
                bDOM.style.display = 'flex';
            } else {
                bDOM.style.display = 'none';
            }
        });
    });

    function updateBoardTitle(id, newTitle) {
        const ws = getActiveWorkspace();
        const board = ws.boards.find(b => b.id === id);
        if(board) {
            board.title = newTitle;
            saveWorkspaces();
        }
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.timeline-dot') && !e.target.closest('#color-popup')) {
            closeColorPopup();
        }
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(!currentDotTaskId || !currentDotBoardId) return;
            const ws = getActiveWorkspace();
            const selectedColor = e.target.dataset.color;
            const board = ws.boards.find(b => b.id === currentDotBoardId);
            if(board) {
                const task = board.tasks.find(t => t.id === currentDotTaskId);
                if(task) {
                    task.color = selectedColor;
                    saveWorkspaces();
                    reRenderBoardTasks(currentDotBoardId);
                }
            }
            closeColorPopup();
        });
    });

    function openColorPopup(boardId, taskId, referenceElementDOM) {
        currentDotBoardId = boardId;
        currentDotTaskId = taskId;
        const rect = referenceElementDOM.getBoundingClientRect();
        const top = rect.top + window.scrollY - 15; 
        const left = rect.right + window.scrollX + 15;

        colorPopup.style.top = top + 'px';
        colorPopup.style.left = left + 'px';
        colorPopup.classList.remove('hidden');
    }

    function closeColorPopup() {
        if(!colorPopup.classList.contains('hidden')) {
            colorPopup.classList.add('hidden');
            currentDotBoardId = null;
            currentDotTaskId = null;
        }
    }

    function handleTaskSubmit(e, boardId, inputElem, timeElem) {
        e.preventDefault();
        const text = inputElem.value.trim();
        const time = timeElem ? timeElem.value : null;
        if (!text) return;

        const ws = getActiveWorkspace();
        const board = ws.boards.find(b => b.id === boardId);
        if (!board) return;

        const newTask = {
            id: `t_${Date.now()}`,
            text: text,
            time: ws.settings.showTime ? time : '',
            completed: false,
            color: 'none',
            notes: '',
            subtasks: [],
            isExpanded: false
        };

        let insertIndex = board.tasks.length;
        if(ws.settings.showTime) {
            for (let i = 0; i < board.tasks.length; i++) {
                if (board.tasks[i].time > time) {
                    insertIndex = i;
                    break;
                }
            }
        }
        
        board.tasks.splice(insertIndex, 0, newTask);
        saveWorkspaces();
        playSound('complete');

        if(board.filterMode === 'completed') {
            board.filterMode = 'all'; 
            updateBoardFilterUI(boardId);
        }

        reRenderBoardTasks(boardId);
        inputElem.value = '';
        inputElem.focus();
    }

    function toggleComplete(boardId, taskId) {
        const ws = getActiveWorkspace();
        const board = ws.boards.find(b => b.id === boardId);
        const task = board.tasks.find(t => t.id === taskId);
        task.completed = !task.completed;
        
        if(task.completed) {
            playSound('party');
            fireConfetti();
        } else {
            playSound('uncomplete');
        }
        
        saveWorkspaces();
        reRenderBoardTasks(boardId);
    }

    function deleteTask(boardId, taskId, wrapperDOMElement) {
        showConfirm(
            'Görevi Sil',
            'Görevi tamamen silmek istediğine emin misin?',
            () => {
                playSound('uncomplete');
                wrapperDOMElement.classList.add('removing');
                setTimeout(() => {
                    const ws = getActiveWorkspace();
                    const board = ws.boards.find(b => b.id === boardId);
                    board.tasks = board.tasks.filter(t => t.id !== taskId);
                    saveWorkspaces();
                    reRenderBoardTasks(boardId);
                }, 200); 
            }
        );
    }

    function renderAllBoards() {
        boardContainer.innerHTML = '';
        const ws = getActiveWorkspace();
        updateHeaderTitle();
        
        ws.boards.forEach(board => {
            renderBoard(board);
        });
        
        if(searchInput.value) searchInput.dispatchEvent(new Event('input'));
    }

    function updateBoardFilterUI(boardId) {
        const boardDOM = document.querySelector(`.board[data-id="${boardId}"]`);
        if(!boardDOM) return;
        const ws = getActiveWorkspace();
        const boardData = ws.boards.find(b => b.id === boardId);
        const filterBtns = boardDOM.querySelectorAll('.board-filter-btn');
        filterBtns.forEach(btn => {
            if(btn.dataset.filter === boardData.filterMode) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    function updateProgressBar(boardId) {
        const boardDOM = document.querySelector(`.board[data-id="${boardId}"]`);
        if(!boardDOM) return;
        const ws = getActiveWorkspace();
        const board = ws.boards.find(b => b.id === boardId);
        if(!board) return;
        
        const fill = boardDOM.querySelector('.progress-fill');
        const textElem = boardDOM.querySelector('.progress-text');
        if(!fill) return;

        if(board.tasks.length === 0) {
            fill.style.width = '0%';
            if(textElem) textElem.textContent = '0%';
            return;
        }
        
        const completedCount = board.tasks.filter(t => t.completed).length;
        const pct = (completedCount / board.tasks.length) * 100;
        fill.style.width = `${pct}%`;
        if(textElem) textElem.textContent = `${Math.round(pct)}%`;
    }

    function renderBoard(boardData) {
        const ws = getActiveWorkspace();
        const clone = boardTemplate.content.cloneNode(true);
        const boardDOM = clone.querySelector('.board');
        boardDOM.dataset.id = boardData.id;

        const titleDOM = boardDOM.querySelector('.board-title');
        titleDOM.textContent = boardData.title;
        titleDOM.addEventListener('blur', (e) => {
            updateBoardTitle(boardData.id, e.target.textContent.trim() || 'İsimsiz Sütun');
        });
        titleDOM.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                titleDOM.blur();
            }
        });

        const editTitleBtn = boardDOM.querySelector('.edit-board-btn');
        if (editTitleBtn) {
            editTitleBtn.addEventListener('click', () => {
                titleDOM.setAttribute('contenteditable', 'true');
                titleDOM.focus();
                // Tüm metni otomatik seç
                const range = document.createRange();
                range.selectNodeContents(titleDOM);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            });
        }

        // Toggle UI based on Settings
        const filtersContainer = boardDOM.querySelector('.board-filters');
        if(!ws.settings.showCheckboxes) {
            filtersContainer.style.display = 'none';
        }

        const progContainer = boardDOM.querySelector('.progress-container');
        if(!ws.settings.showProgressBar || !ws.settings.showCheckboxes) {
            progContainer.style.display = 'none';
        }

        const timeInput = boardDOM.querySelector('.todo-time');
        if(!ws.settings.showTime) {
            timeInput.style.display = 'none';
            timeInput.removeAttribute('required');
        } else {
            const now = new Date();
            timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }

        const filterBtns = boardDOM.querySelectorAll('.board-filter-btn');
        filterBtns.forEach(btn => {
            if(btn.dataset.filter === boardData.filterMode) btn.classList.add('active');
            else btn.classList.remove('active');
            
            btn.addEventListener('click', (e) => {
                boardData.filterMode = e.target.dataset.filter;
                updateBoardFilterUI(boardData.id);
                saveWorkspaces(); 
                reRenderBoardTasks(boardData.id);
            });
        });

        const form = boardDOM.querySelector('.task-form');
        const inputElem = boardDOM.querySelector('.todo-input');
        
        form.addEventListener('submit', (e) => {
            handleTaskSubmit(e, boardData.id, inputElem, ws.settings.showTime ? timeInput : null);
        });

        const timelineContainer = boardDOM.querySelector('.timeline-container');
        
        timelineContainer.addEventListener('dragover', (e) => {
            if(draggedBoardId) return; 
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            timelineContainer.classList.add('drag-over');
        });
        timelineContainer.addEventListener('dragleave', () => {
            timelineContainer.classList.remove('drag-over');
        });
        timelineContainer.addEventListener('drop', (e) => {
            if(draggedBoardId) return; 
            e.preventDefault();
            timelineContainer.classList.remove('drag-over');
            
            const droppedOnItem = e.target.closest('.todo-item');
            if(!droppedOnItem && draggedItemId) {
                moveTaskBetweenBoards(draggedSourceBoardId, draggedItemId, boardData.id, null);
            }
        });

        const boardDragHandle = boardDOM.querySelector('.drag-handle');
        boardDragHandle.addEventListener('dragstart', (e) => {
            if(draggedItemId) {
                e.preventDefault(); 
                return;
            }
            draggedBoardId = boardData.id;
            e.stopPropagation();
            if (e.dataTransfer.setDragImage) {
                e.dataTransfer.setDragImage(boardDOM, 0, 0);
            }
            setTimeout(() => boardDOM.classList.add('dragging-board'), 0);
        });
        boardDragHandle.addEventListener('dragend', (e) => {
            e.stopPropagation();
            boardDOM.classList.remove('dragging-board');
            draggedBoardId = null;
        });
        boardDOM.addEventListener('dragover', (e) => {
            if(!draggedBoardId || draggedBoardId === boardData.id) return; 
            e.preventDefault();
        });
        boardDOM.addEventListener('drop', (e) => {
            if(!draggedBoardId) return; 
            e.preventDefault();
            const targetBoardDOM = e.target.closest('.board');
            if(targetBoardDOM && targetBoardDOM.dataset.id !== draggedBoardId) {
                moveBoard(draggedBoardId, targetBoardDOM.dataset.id);
            }
        });

        boardContainer.appendChild(clone);
        reRenderBoardTasks(boardData.id);
    }

    function moveBoard(sourceId, targetId) {
        const ws = getActiveWorkspace();
        const sIndex = ws.boards.findIndex(b => b.id === sourceId);
        const tIndex = ws.boards.findIndex(b => b.id === targetId);
        if (sIndex > -1 && tIndex > -1) {
            const [movedBoard] = ws.boards.splice(sIndex, 1);
            ws.boards.splice(tIndex, 0, movedBoard);
            saveWorkspaces();
            renderAllBoards(); 
        }
    }

    function reRenderBoardTasks(boardId) {
        const ws = getActiveWorkspace();
        const boardDOM = document.querySelector(`.board[data-id="${boardId}"]`);
        if (!boardDOM) return;
        
        const taskList = boardDOM.querySelector('.task-list');
        taskList.innerHTML = '';
        
        const boardData = ws.boards.find(b => b.id === boardId);
        if(!boardData) return;

        updateProgressBar(boardId);
        
        let filteredTasks = boardData.tasks;
        if(ws.settings.showCheckboxes) {
            if(boardData.filterMode === 'pending') {
                filteredTasks = boardData.tasks.filter(t => !t.completed);
            } else if (boardData.filterMode === 'completed') {
                filteredTasks = boardData.tasks.filter(t => t.completed);
            }
        }
        
        filteredTasks.forEach(task => {
            const wrapper = document.createElement('div');
            wrapper.className = 'todo-wrapper';
            
            const isCompletedStatus = ws.settings.showCheckboxes && task.completed ? 'completed' : '';
            const li = document.createElement('div');
            li.className = `todo-item ${isCompletedStatus} ${task.isExpanded ? 'expanded' : ''}`;
            li.dataset.taskId = task.id;
            li.dataset.boardId = boardId;
            li.draggable = false;

            if(task.color && task.color !== 'none') {
                li.setAttribute('data-color', task.color);
            } else {
                li.setAttribute('data-color', 'none');
            }

            const hasDetails = (task.notes && task.notes.trim() !== '') || (task.subtasks && task.subtasks.length > 0);

            let timeHtml = '';
            if(ws.settings.showTime) {
                timeHtml = `<div class="time-block">${escapeHTML(task.time)}</div>`;
            }

            let checkboxHtml = '';
            if(ws.settings.showCheckboxes) {
                checkboxHtml = `
                <label class="checkbox-wrapper">
                    <input type="checkbox" class="main-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>`;
            }

            li.innerHTML = `
                <div class="task-drag-handle" title="Görevi Sürükle" style="cursor: grab; color: var(--text-secondary); opacity: 0.6; display: flex; align-items: center; margin-right: 2px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                <div class="timeline-dot" title="Rengi Değiştir"></div>
                ${timeHtml}
                ${checkboxHtml}
                <div class="todo-text-container" style="flex: 1; min-width: 0; display:flex; word-break: break-word; overflow-wrap: anywhere;">
                    <span class="todo-text" contenteditable="true" spellcheck="false" style="flex: 1; outline: none; border-bottom: 1px dotted transparent; min-width:0;">${escapeHTML(task.text)}</span>
                </div>
                
                <button class="expand-btn ${hasDetails ? 'has-details' : ''}" aria-label="Genişlet" title="Detaylar & Alt Görevler">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                
                <button class="delete-btn" aria-label="Sil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;

            let subtasksHTML = task.subtasks.map(st => {
                if(ws.settings.showCheckboxes) {
                    return `
                        <div class="subtask-item ${st.completed ? 'completed' : ''}" data-subtask="${st.id}">
                            <input type="checkbox" class="subtask-checkbox" ${st.completed ? 'checked' : ''}>
                            <span>${escapeHTML(st.text)}</span>
                            <button class="delete-subtask-btn">✕</button>
                        </div>
                    `;
                } else {
                    return `
                        <div class="subtask-item" data-subtask="${st.id}">
                            <span style="padding-left:14px;">• ${escapeHTML(st.text)}</span>
                            <button class="delete-subtask-btn">✕</button>
                        </div>
                    `;
                }
            }).join('');

            const detailsHtml = document.createElement('div');
            detailsHtml.className = 'task-details';
            detailsHtml.innerHTML = `
                <textarea class="task-notes" placeholder="Notlar ve açıklamalar ekleyin...">${escapeHTML(task.notes || '')}</textarea>
                <div class="subtasks-container">
                    <div class="subtasks-list">
                        ${subtasksHTML}
                    </div>
                    <div class="subtask-input-wrapper">
                        <input type="text" class="subtask-input" placeholder="Alt görev / Madde...">
                        <button class="add-subtask-btn">Ekle</button>
                    </div>
                </div>
            `;

            wrapper.appendChild(li);
            wrapper.appendChild(detailsHtml);
            taskList.appendChild(wrapper);

            li.querySelector('.timeline-dot').addEventListener('click', (e) => {
                e.stopPropagation(); 
                openColorPopup(boardId, task.id, e.target);
            });

            const textDOM = li.querySelector('.todo-text');
            textDOM.addEventListener('blur', (e) => {
               const newText = e.target.textContent;
               if(newText !== task.text) {
                   task.text = newText;
                   saveWorkspaces();
               }
            });
            textDOM.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); 
                    textDOM.blur();
                }
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                deleteTask(boardId, task.id, wrapper);
            });

            if(ws.settings.showCheckboxes) {
                li.querySelector('.main-checkbox').addEventListener('change', () => {
                    toggleComplete(boardId, task.id);
                });
            }

            const expandBtn = li.querySelector('.expand-btn');
            const toggleDetails = (e) => {
                if(e) { e.preventDefault(); e.stopPropagation(); }
                task.isExpanded = !task.isExpanded;
                li.classList.toggle('expanded');
                saveWorkspaces();
            };
            expandBtn.addEventListener('click', toggleDetails);
            expandBtn.addEventListener('touchstart', toggleDetails, {passive: false});

            detailsHtml.querySelector('.task-notes').addEventListener('blur', (e) => {
                task.notes = e.target.value;
                saveWorkspaces();
                
                const btnDOM = li.querySelector('.expand-btn');
                const hasSub = task.subtasks && task.subtasks.length > 0;
                if((task.notes && task.notes.trim() !== '') || hasSub) {
                    btnDOM.classList.add('has-details');
                } else {
                    btnDOM.classList.remove('has-details');
                }
            });

            const subtaskInput = detailsHtml.querySelector('.subtask-input');
            const subtaskAddBtn = detailsHtml.querySelector('.add-subtask-btn');
            const subtasksListDOM = detailsHtml.querySelector('.subtasks-list');

            function handleSubtaskAdd() {
                const text = subtaskInput.value.trim();
                if(!text) return;
                const newSub = { id: `st_${Date.now()}`, text: text, completed: false };
                task.subtasks.push(newSub);
                saveWorkspaces();
                reRenderBoardTasks(boardId); 
            }

            subtaskAddBtn.addEventListener('click', handleSubtaskAdd);
            subtaskInput.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    e.preventDefault();
                    handleSubtaskAdd();
                }
            });

            subtasksListDOM.addEventListener('click', (e) => {
                const itemDOM = e.target.closest('.subtask-item');
                if(!itemDOM) return;
                const stId = itemDOM.dataset.subtask;
                
                if(e.target.classList.contains('delete-subtask-btn')) {
                    task.subtasks = task.subtasks.filter(s => s.id !== stId);
                    saveWorkspaces();
                    reRenderBoardTasks(boardId);
                } else if(e.target.classList.contains('subtask-checkbox') && ws.settings.showCheckboxes) {
                    const st = task.subtasks.find(s => s.id === stId);
                    if(st) {
                        st.completed = e.target.checked;
                        if(st.completed) {
                            playSound('party');
                            fireConfetti();
                        } else {
                            playSound('uncomplete');
                        }
                        saveWorkspaces();
                        reRenderBoardTasks(boardId);
                    }
                }
            });
            // Sürükleme İkonu (Drag Handle) İzolasyonu
            const dragHandle = li.querySelector('.task-drag-handle');
            if (dragHandle) {
                // Drag handle elementini sürüklenebilir yapıp tüm görev kartını kilitle
                dragHandle.draggable = true;
                
                dragHandle.addEventListener('dragstart', (e) => {
                    draggedItemId = task.id;
                    draggedSourceBoardId = boardId;
                    e.stopPropagation(); 
                    e.dataTransfer.effectAllowed = 'move';
                    // Sürüklenen şey olarak ikon yerine tüm Kartın hayaletini yarat (opsiyonel ancak UX artırır)
                    if (e.dataTransfer.setDragImage) {
                        e.dataTransfer.setDragImage(li, 0, 0);
                    }
                    setTimeout(() => wrapper.classList.add('dragging'), 0);
                });

                dragHandle.addEventListener('dragend', (e) => {
                    e.stopPropagation();
                    wrapper.classList.remove('dragging');
                    draggedItemId = null;
                    draggedSourceBoardId = null;
                    clearDropTargetStyles();
                });
            }

            // li.dragstart ve dragend silindi, çünkü sadece dragHandle kullanılıyor

            li.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if(draggedBoardId) return; 
                e.dataTransfer.dropEffect = 'move';
                
                const bounding = li.getBoundingClientRect();
                clearDropTargetStyles();
                if (e.clientY > bounding.y + (bounding.height / 2)) {
                    wrapper.classList.add('drop-target-bottom');
                } else {
                    wrapper.classList.add('drop-target-top');
                }
            });

            li.addEventListener('dragleave', () => {
                wrapper.classList.remove('drop-target-top', 'drop-target-bottom');
            });

            li.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation(); 
                clearDropTargetStyles();
                
                if (!draggedItemId) return;

                const bounding = li.getBoundingClientRect();
                const insertAfter = e.clientY > bounding.y + (bounding.height / 2);
                
                moveTaskBetweenBoards(draggedSourceBoardId, draggedItemId, boardId, task.id, insertAfter);
            });

        });
    }

    function clearDropTargetStyles() {
        document.querySelectorAll('.todo-wrapper').forEach(el => {
            el.classList.remove('drop-target-top', 'drop-target-bottom');
        });
    }

    function moveTaskBetweenBoards(sourceBoardId, taskId, targetBoardId, targetTaskId, insertAfter = false) {
        if (!sourceBoardId || !taskId || !targetBoardId) return;

        const ws = getActiveWorkspace();
        const sourceBoard = ws.boards.find(b => b.id === sourceBoardId);
        const targetBoard = ws.boards.find(b => b.id === targetBoardId);

        if (!sourceBoard || !targetBoard) return;

        const taskIndex = sourceBoard.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const [movedTask] = sourceBoard.tasks.splice(taskIndex, 1);

        if (targetTaskId === null) {
            targetBoard.tasks.push(movedTask);
        } else {
            const targetIndex = targetBoard.tasks.findIndex(t => t.id === targetTaskId);
            if (targetIndex !== -1) {
                targetBoard.tasks.splice(insertAfter ? targetIndex + 1 : targetIndex, 0, movedTask);
            } else {
                targetBoard.tasks.push(movedTask); 
            }
        }

        saveWorkspaces();

        if (sourceBoardId === targetBoardId) {
            reRenderBoardTasks(sourceBoardId);
        } else {
            reRenderBoardTasks(sourceBoardId);
            reRenderBoardTasks(targetBoardId);
        }
    }

    // --- Alarm Ticker & Modal Actions ---
    const alarmModal = document.getElementById('alarm-modal');
    const alarmTaskName = document.getElementById('alarm-task-name');
    const alarmTaskTime = document.getElementById('alarm-task-time');
    const alarmCompleteBtn = document.getElementById('alarm-complete-btn');
    const alarmSnoozeBtn = document.getElementById('alarm-snooze-btn');
    const alarmSnoozeMins = document.getElementById('alarm-snooze-mins');
    
    let activeAlarmTask = null;
    let activeAlarmBoardId = null;
    let alarmRepeatInterval = null;
    let alarmTimeout = null;

    function stopAlarmSound() {
        if (alarmRepeatInterval) clearInterval(alarmRepeatInterval);
        if (alarmTimeout) clearTimeout(alarmTimeout);
        alarmRepeatInterval = null;
        alarmTimeout = null;
    }

    function triggerAlarm(boardId, task) {
        stopAlarmSound();
        
        playSound('alarm');
        alarmRepeatInterval = setInterval(() => {
            playSound('alarm');
        }, 2000);

        alarmTimeout = setTimeout(() => {
            stopAlarmSound();
            if(alarmModal) alarmModal.classList.add('hidden');
            activeAlarmTask = null;
        }, 60000);
        
        if (window.Notification && Notification.permission === 'granted') {
            const notif = new Notification('Zamanı Geldi!', {
                body: `${task.text} (${task.time})`
            });
            notif.onclick = () => window.focus();
        }

        activeAlarmTask = task;
        activeAlarmBoardId = boardId;
        
        if(alarmTaskName) alarmTaskName.textContent = task.text;
        if(alarmTaskTime) alarmTaskTime.textContent = task.time;
        if(alarmSnoozeMins) alarmSnoozeMins.textContent = getActiveWorkspace().settings.snoozeDuration;
        
        if(alarmModal) alarmModal.classList.remove('hidden');
    }

    if (alarmCompleteBtn) {
        alarmCompleteBtn.addEventListener('click', () => {
             stopAlarmSound();
             alarmModal.classList.add('hidden');
             activeAlarmTask = null;
        });
    }

    if (alarmSnoozeBtn) {
        alarmSnoozeBtn.addEventListener('click', () => {
             stopAlarmSound();
             if (activeAlarmTask) {
                  if (activeAlarmTask.time) {
                      const [h, m] = activeAlarmTask.time.split(':').map(Number);
                      let newTime = new Date();
                      newTime.setHours(h);
                      newTime.setMinutes(m + getActiveWorkspace().settings.snoozeDuration);
                      const s_h = newTime.getHours().toString().padStart(2, '0');
                      const s_m = newTime.getMinutes().toString().padStart(2, '0');
                      activeAlarmTask.time = `${s_h}:${s_m}`;
                      activeAlarmTask.alarmTriggered = false;
                      saveWorkspaces();
                      reRenderBoardTasks(activeAlarmBoardId);
                  }
             }
             alarmModal.classList.add('hidden');
             activeAlarmTask = null;
        });
    }

    // Alarm Checker (runs every 10 seconds)
    setInterval(() => {
        const ws = getActiveWorkspace();
        if (!ws || !ws.settings || !ws.settings.alarmEnabled) return;

        const offset = ws.settings.alarmOffset || 0;
        const now = new Date();
        const currentTotalMins = now.getHours() * 60 + now.getMinutes();

        ws.boards.forEach(board => {
            board.tasks.forEach(task => {
                if (!task.completed && !task.alarmTriggered && task.time) {
                    const [th, tm] = task.time.split(':').map(Number);
                    if (!isNaN(th) && !isNaN(tm)) {
                        const taskTotalMins = th * 60 + tm;
                        // If the task time is within the offset constraint, OR it has just passed very recently (e.g., negative up to -2 min)
                        const diff = taskTotalMins - currentTotalMins;
                        if (diff <= offset && diff >= -1) {
                            task.alarmTriggered = true;
                            saveWorkspaces();
                            triggerAlarm(board.id, task);
                        }
                    }
                }
            });
        });
    }, 10000);

    function escapeHTML(str) {
        if(typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Onboarding Tutorial System ---
    const tutorialModal = document.getElementById('tutorial-modal');
    const tutorialSlides = document.getElementById('tutorial-slides');
    const tutorialDots = document.getElementById('tutorial-dots');
    const tutorialPrev = document.getElementById('tutorial-prev');
    const tutorialNext = document.getElementById('tutorial-next');
    const tutorialGotIt = document.getElementById('tutorial-got-it');
    const tutorialCloseX = document.getElementById('tutorial-close-x');
    const tutorialDontShowCheck = document.getElementById('tutorial-dont-show-check');
    const openTutorialBtn = document.getElementById('open-tutorial-btn');

    let tutorialCurrentSlide = 0;
    const tutorialSlideElements = tutorialSlides ? tutorialSlides.querySelectorAll('.tutorial-slide') : [];
    const tutorialTotalSlides = tutorialSlideElements.length;

    function tutorialInit() {
        if (!tutorialModal || tutorialTotalSlides === 0) return;

        // Build dot indicators
        if (tutorialDots) {
            tutorialDots.innerHTML = '';
            for (let i = 0; i < tutorialTotalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = `tutorial-dot ${i === 0 ? 'active' : ''}`;
                dot.dataset.index = i;
                dot.addEventListener('click', () => tutorialGoTo(i));
                tutorialDots.appendChild(dot);
            }
        }

        tutorialUpdateNav();
    }

    function tutorialGoTo(index) {
        if (index < 0 || index >= tutorialTotalSlides) return;
        tutorialCurrentSlide = index;
        
        if (tutorialSlides) {
            tutorialSlides.style.transform = `translateX(-${index * 100}%)`;
        }

        // Update dots
        if (tutorialDots) {
            tutorialDots.querySelectorAll('.tutorial-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        tutorialUpdateNav();
    }

    function tutorialUpdateNav() {
        if (tutorialPrev) tutorialPrev.disabled = tutorialCurrentSlide === 0;
        if (tutorialNext) tutorialNext.disabled = tutorialCurrentSlide === tutorialTotalSlides - 1;
    }

    function tutorialShow() {
        if (!tutorialModal) return;
        tutorialCurrentSlide = 0;
        tutorialGoTo(0);
        if (tutorialDontShowCheck) tutorialDontShowCheck.checked = false;
        tutorialModal.classList.remove('hidden');
    }

    function tutorialHide() {
        if (!tutorialModal) return;
        tutorialModal.classList.add('hidden');

        // Save preference if checkbox is checked
        if (tutorialDontShowCheck && tutorialDontShowCheck.checked) {
            localStorage.setItem('tutorialDismissed', 'true');
        }
    }

    // Event Listeners
    if (tutorialPrev) {
        tutorialPrev.addEventListener('click', () => {
            playSound('whoosh');
            tutorialGoTo(tutorialCurrentSlide - 1);
        });
    }

    if (tutorialNext) {
        tutorialNext.addEventListener('click', () => {
            playSound('whoosh');
            tutorialGoTo(tutorialCurrentSlide + 1);
        });
    }

    if (tutorialGotIt) {
        tutorialGotIt.addEventListener('click', () => {
            playSound('complete');
            tutorialHide();
        });
    }

    if (tutorialCloseX) {
        tutorialCloseX.addEventListener('click', () => {
            tutorialHide();
        });
    }

    // Sidebar shortcut
    if (openTutorialBtn) {
        openTutorialBtn.addEventListener('click', () => {
            toggleSidebar(false);
            playSound('whoosh');
            setTimeout(() => tutorialShow(), 200);
        });
    }

    // Backdrop click to close
    const tutorialBackdrop = tutorialModal ? tutorialModal.querySelector('.tutorial-backdrop') : null;
    if (tutorialBackdrop) {
        tutorialBackdrop.addEventListener('click', () => {
            tutorialHide();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (tutorialModal && !tutorialModal.classList.contains('hidden')) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                tutorialGoTo(tutorialCurrentSlide + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                tutorialGoTo(tutorialCurrentSlide - 1);
            } else if (e.key === 'Escape') {
                tutorialHide();
            }
        }
    });

    // Initialize & auto-show on first visit
    tutorialInit();
    if (!localStorage.getItem('tutorialDismissed')) {
        // Small delay for smooth entrance after page load
        setTimeout(() => tutorialShow(), 500);
    }
});
