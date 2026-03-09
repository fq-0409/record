// background.js - Service Worker

// Initialize default state
const DEFAULT_STATE = {
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    maxXp: 100,
    isFocusing: false,
    startTime: null,
    blacklist: ["youtube.com", "bilibili.com", "weibo.com", "twitter.com", "facebook.com", "reddit.com"]
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(null, (items) => {
        if (Object.keys(items).length === 0) {
            chrome.storage.local.set(DEFAULT_STATE, () => {
                console.log("PixelBuddy initialized with default state.");
            });
        }
    });
});

// Monitor Tab Updates (Navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        checkBlacklist(tab.url);
    }
});

// Monitor Tab Activation (Switching Tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab && tab.url) {
            checkBlacklist(tab.url);
        }
    });
});

// Storage Change Listener for Timer/Alarm Management
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.isFocusing) {
        if (changes.isFocusing.newValue === true) {
            // Start Timer Alarm
            const durationInMinutes = 25; // Default 25m, load from settings in future
            chrome.alarms.create("focusTimer", { delayInMinutes: durationInMinutes });
        } else {
            // Stop Timer Alarm
            chrome.alarms.clear("focusTimer");
        }
    }
});

// Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "focusTimer") {
        completeSessionInBg();
    }
});

function completeSessionInBg() {
    chrome.storage.local.get(['xp', 'level', 'maxXp'], (data) => {
        let newXp = (data.xp || 0) + 25;
        let newLevel = data.level || 1;
        let maxXp = data.maxXp || 100;

        if (newXp >= maxXp) {
            newLevel++;
            newXp = newXp - maxXp;
            maxXp = Math.floor(maxXp * 1.2);

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Level Up!',
                message: `Congratulations! You reached Level ${newLevel}!`,
                priority: 2
            });
        } else {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Focus Session Complete!',
                message: 'You earned +25 XP.',
                priority: 2
            });
        }

        chrome.storage.local.set({
            xp: newXp,
            level: newLevel,
            maxXp: maxXp,
            isFocusing: false,
            startTime: null
        });
    });
}

function checkBlacklist(url) {
    chrome.storage.local.get(['isFocusing', 'blacklist', 'hp'], (data) => {
        if (!data.isFocusing) return;

        const isBlacklisted = data.blacklist.some(domain => url.includes(domain));

        if (isBlacklisted) {
            applyPenalty(data.hp);
        }
    });
}

function applyPenalty(currentHp) {
    const DAMAGE = 10; // Simple flat damage
    let newHp = Math.max(0, currentHp - DAMAGE);

    chrome.storage.local.set({ hp: newHp }, () => {
        // Notify User
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png', // Ensure this exists or use a default
            title: 'Distraction Detected!',
            message: `You visited a blacklisted site! -${DAMAGE} HP. Current HP: ${newHp}`,
            priority: 2
        });

        // Check for Game Over
        if (newHp <= 0) {
            handleGameOver();
        }
    });
}

function handleGameOver() {
    chrome.storage.local.set({
        isFocusing: false,
        startTime: null,
        hp: 0
    }, () => {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Game Over',
            message: 'Your Pixel Buddy missed you too much! Session Failed.',
            priority: 2
        });
    });
}
