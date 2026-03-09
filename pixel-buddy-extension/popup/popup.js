let timerInterval;
const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
let timeLeft = FOCUS_TIME;
let isRunning = false;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const hpBar = document.getElementById('hp-bar');
const xpBar = document.getElementById('xp-bar');
const levelSpan = document.getElementById('level');
const hpText = document.getElementById('hp-text');
const xpText = document.getElementById('xp-text');
const petSprite = document.getElementById('pet-sprite');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    startBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
});

function loadState() {
    chrome.storage.local.get(['level', 'xp', 'hp', 'maxHp', 'maxXp', 'isFocusing', 'startTime'], (data) => {
        // UI Updates
        updateUI(data);

        if (data.isFocusing && data.startTime) {
            // Calculate elapsed time
            const now = Date.now();
            const elapsed = Math.floor((now - data.startTime) / 1000);
            timeLeft = FOCUS_TIME - elapsed;

            if (timeLeft <= 0) {
                completeSession();
            } else {
                startTimerLoop();
                isRunning = true;
                updateButtons();
            }
        }
    });
}

function updateUI(data) {
    if (data.level) levelSpan.textContent = data.level;

    // HP Bar
    const hpPercent = (data.hp / data.maxHp) * 100;
    hpBar.style.width = `${hpPercent}%`;
    hpText.textContent = `${Math.round(hpPercent)}%`;

    // XP Bar
    const xpPercent = (data.xp / data.maxXp) * 100;
    xpBar.style.width = `${xpPercent}%`;
    xpText.textContent = `${Math.round(xpPercent)}%`;

    // Pet Logic (Simple state for now)
    if (hpPercent < 30) {
        petSprite.textContent = "🤕"; // Injured
    } else if (data.isFocusing) {
        petSprite.textContent = "🧐"; // Focusing
    } else {
        petSprite.textContent = "👾"; // Normal
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    if (isRunning) {
        // Stop (Give up?) - For MVP just stop
        clearInterval(timerInterval);
        isRunning = false;

        // TODO: Implement penalty
        chrome.storage.local.set({ isFocusing: false, startTime: null });

        startBtn.textContent = "Start Focus";
        startBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        startBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        resetBtn.classList.remove('hidden');
        petSprite.textContent = "👾";

    } else {
        // Start
        startTimerLoop();
        isRunning = true;
        const now = Date.now();

        chrome.storage.local.set({
            isFocusing: true,
            startTime: now
        });

        updateButtons();
        petSprite.textContent = "🧐";
    }
}

function updateButtons() {
    if (isRunning) {
        startBtn.textContent = "Give Up";
        startBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        startBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        resetBtn.classList.add('hidden');
    } else {
        startBtn.textContent = "Start Focus";
        startBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        startBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        resetBtn.classList.remove('hidden');
    }
}

function startTimerLoop() {
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            completeSession();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = FOCUS_TIME;
    updateTimerDisplay();
    isRunning = false;
    chrome.storage.local.set({ isFocusing: false, startTime: null });
    updateButtons();
}

function completeSession() {
    clearInterval(timerInterval);
    timeLeft = FOCUS_TIME;
    isRunning = false;

    // Reward Logic
    chrome.storage.local.get(['xp', 'level', 'maxXp'], (data) => {
        let newXp = (data.xp || 0) + 25; // 25 XP for 25 mins
        let newLevel = data.level || 1;
        let maxXp = data.maxXp || 100;

        if (newXp >= maxXp) {
            newLevel++;
            newXp = newXp - maxXp;
            maxXp = Math.floor(maxXp * 1.2); // Increase difficulty

            // Notify level up
            chrome.notifications?.create({
                type: 'basic',
                iconUrl: '../icons/icon48.png',
                title: 'Level Up!',
                message: `Congratulations! You reached Level ${newLevel}!`
            });
        }

        chrome.storage.local.set({
            xp: newXp,
            level: newLevel,
            maxXp: maxXp,
            isFocusing: false,
            startTime: null
        }, () => {
            loadState(); // Refresh UI
            // TODO: Sound effect
            alert("Focus Session Complete! +25 XP");
        });
    });

    updateButtons();
    updateTimerDisplay();
}
