document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('add-btn').addEventListener('click', addSite);
document.getElementById('new-site-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSite();
});
document.getElementById('save-btn').addEventListener('click', saveSettings);

let currentBlacklist = [];

function loadSettings() {
    chrome.storage.local.get(['blacklist'], (result) => {
        currentBlacklist = result.blacklist || [];
        renderBlacklist();
    });
}

function renderBlacklist() {
    const container = document.getElementById('blacklist-container');
    container.innerHTML = '';

    currentBlacklist.forEach((site, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>${site}</span>
            <span class="delete-btn" data-index="${index}">✕</span>
        `;

        item.querySelector('.delete-btn').addEventListener('click', () => removeSite(index));
        container.appendChild(item);
    });
}

function addSite() {
    const input = document.getElementById('new-site-input');
    const site = input.value.trim().toLowerCase();

    if (site && !currentBlacklist.includes(site)) {
        currentBlacklist.push(site);
        input.value = '';
        renderBlacklist();
    }
}

function removeSite(index) {
    currentBlacklist.splice(index, 1);
    renderBlacklist();
}

function saveSettings() {
    chrome.storage.local.set({ blacklist: currentBlacklist }, () => {
        // Show saved feedback
        const btn = document.getElementById('save-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.classList.add('bg-green-800');

        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('bg-green-800');
        }, 1500);
    });
}
