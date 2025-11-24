// Core tab management and navigation for T_U_B Web Proxy
let currentTabIndex = 0;
const tabs = [{
    url: 'tubproxy://start',
    content: '<div class="Xt7Lm9Kp3R8f"><p>𝙼𝚊𝚍𝚎 𝚋𝚢 𝚃_𝚄_𝙱</p></div><h23>T_U_B Web Proxy</h23><h21>𝚟𝟷.𝟶</h21>'
}];

const trustedSchemes = ['tubproxy://', 'https://', 'http://'];
const proxies = [
    url => `https://api.cors.lol/?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
];

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateLockIcon('tubproxy://start');
});

function setupEventListeners() {
    // Tab management
    document.getElementById('add-tabaa').addEventListener('click', createNewTab);
    document.querySelectorAll('.tabaa').forEach((tab, index) => {
        addCloseButtonFunctionality(tab);
        addTabClickListener(tab, document.querySelectorAll('.tab-contentaa')[index], index);
    });

    // Navigation buttons
    document.querySelector('.reload-buttonaa').addEventListener('click', reloadTab);
    document.querySelector('.backward-buttonaa').addEventListener('click', goBack);
    document.querySelector('.forward-buttonaa').addEventListener('click', goForward);
    document.querySelector('.home-buttonaa').addEventListener('click', () => changeTabContent('tubproxy://start'));
    document.querySelector('.settings-buttonaa').addEventListener('click', () => changeTabContent('tubproxy://settings'));

    // URL bar
    document.getElementById('url-baraa').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            let url = this.value.trim();
            if (!trustedSchemes.some(scheme => url.startsWith(scheme))) {
                url = 'https://' + url;
            }
            navigateToUrl(url);
        }
    });

    // Fullscreen
    document.querySelector('.fullscreen-button').addEventListener('click', toggleFullscreen);

    // Menu
    document.querySelector('.menu-buttonaa').addEventListener('click', toggleDropdownMenu);
    window.addEventListener('click', closeDropdownMenu);

    // Search
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.querySelector('.search-baraa input');
            if (searchInput) searchInput.focus();
        }
    });

    // Search submission
    const searchInput = document.querySelector('.search-baraa input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                let searchQuery = this.value.trim();
                if (searchQuery) {
                    let url = 'https://www.google.com/search?q=' + encodeURIComponent(searchQuery);
                    navigateToUrl(url);
                }
            }
        });

        const searchIcon = document.querySelector('.search-iconaa');
        if (searchIcon) {
            searchIcon.addEventListener('click', function() {
                let searchQuery = searchInput.value.trim();
                if (searchQuery) {
                    let url = 'https://www.google.com/search?q=' + encodeURIComponent(searchQuery);
                    navigateToUrl(url);
                }
            });
        }
    }
}

function createNewTab() {
    const newTabIndex = tabs.length;
    const newTab = document.createElement('div');
    newTab.className = 'tabaa';
    newTab.innerHTML = `<span class="tab-nameaa">New Tab</span><i class="fas fa-times close-btnaa"></i>`;
    document.querySelector('.uptop-baraa').insertBefore(newTab, document.getElementById('add-tabaa'));

    const newContent = document.createElement('div');
    newContent.className = 'contentaa tab-contentaa';
    newContent.innerHTML = tabs[0].content;
    document.body.appendChild(newContent);

    tabs.push({
        url: 'tubproxy://start',
        content: newContent.innerHTML
    });

    updateActiveTab(newTab, newContent, newTabIndex);
    addCloseButtonFunctionality(newTab);
    addTabClickListener(newTab, newContent, newTabIndex);
}

function addCloseButtonFunctionality(tab) {
    tab.querySelector('.close-btnaa').addEventListener('click', function(event) {
        event.stopPropagation();
        const index = Array.from(document.querySelectorAll('.tabaa')).indexOf(tab);
        tab.remove();
        document.querySelectorAll('.tab-contentaa')[index].remove();
        tabs.splice(index, 1);
        
        if (index === currentTabIndex && tabs.length > 0) {
            const newIndex = Math.min(index, tabs.length - 1);
            const newTab = document.querySelectorAll('.tabaa')[newIndex];
            const newContent = document.querySelectorAll('.tab-contentaa')[newIndex];
            updateActiveTab(newTab, newContent, newIndex);
        }
    });
}

function addTabClickListener(tab, content, index) {
    tab.addEventListener('click', function() {
        updateActiveTab(tab, content, index);
    });
}

function updateActiveTab(tab, content, index) {
    document.querySelectorAll('.tab-contentaa').forEach(c => c.classList.remove('activeaa'));
    document.querySelectorAll('.tabaa').forEach(t => t.classList.remove('activeaa'));

    tab.classList.add('activeaa');
    content.classList.add('activeaa');
    currentTabIndex = index;

    const url = tabs[index].url;
    document.getElementById('url-baraa').value = url;
    updateLockIcon(url);
}

function navigateToUrl(url) {
    const currentContent = document.querySelectorAll('.tab-contentaa')[currentTabIndex];
    const currentTab = document.querySelectorAll('.tabaa')[currentTabIndex];

    tabs[currentTabIndex].url = url;
    updateTabContent(url, currentContent, currentTab);
    updateLockIcon(url);
}

function updateTabContent(url, content, tab) {
    if (url === 'tubproxy://start') {
        content.innerHTML = tabs[0].content;
        tab.querySelector('.tab-nameaa').textContent = 'New Tab';
    } else if (url === 'tubproxy://settings') {
        content.innerHTML = '<h2 style="color: #fff;">Settings</h2><p>Settings page coming soon...</p>';
        tab.querySelector('.tab-nameaa').textContent = 'Settings';
    } else {
        fetchExternalContent(url, content, currentTabIndex);
    }
    
    tabs[currentTabIndex].content = content.innerHTML;
    tabs[currentTabIndex].url = url;
    document.getElementById('url-baraa').value = url;
}

async function fetchExternalContent(url, content, tabIndex) {
    const tab = document.querySelectorAll('.tabaa')[tabIndex];
    showSpinner(tab);

    let htmlText = null;
    for (const proxyFn of proxies) {
        try {
            const proxy = proxyFn(url);
            const response = await fetch(proxy, { timeout: 10000 });
            if (response.ok) {
                htmlText = await response.text();
                break;
            }
        } catch (error) {
            console.log('Proxy failed, trying next...');
        }
    }

    hideSpinner(tab);

    if (!htmlText) {
        content.innerHTML = `<div style="color: #ff6161; padding: 20px; text-align: center;">
            <h2>Error loading content</h2>
            <p>Unable to fetch the requested content.</p>
        </div>`;
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const title = doc.title || 'Untitled';
    tab.querySelector('.tab-nameaa').textContent = title;

    // Create a safe container
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'auto';
    container.innerHTML = htmlText.substring(0, 10000); // Limit for safety

    content.innerHTML = '';
    content.appendChild(container);
}

function reloadTab() {
    const currentContent = document.querySelectorAll('.tab-contentaa')[currentTabIndex];
    const currentTab = document.querySelectorAll('.tabaa')[currentTabIndex];
    const currentUrl = tabs[currentTabIndex].url;
    updateTabContent(currentUrl, currentContent, currentTab);
}

function goBack() {
    console.log('Back button clicked');
}

function goForward() {
    console.log('Forward button clicked');
}

function changeTabContent(url) {
    const currentTab = document.querySelectorAll('.tabaa')[currentTabIndex];
    const currentContent = document.querySelectorAll('.tab-contentaa')[currentTabIndex];
    document.getElementById('url-baraa').value = url;
    updateTabContent(url, currentContent, currentTab);
}

function updateLockIcon(url) {
    const lockIcon = document.querySelector('.lock-iconaa');
    const isLocked = trustedSchemes.some(scheme => url.startsWith(scheme));
    if (isLocked) {
        lockIcon.classList.remove('fa-unlock');
        lockIcon.classList.add('fa-lock');
        lockIcon.style.color = '#8ab4f8';
    } else {
        lockIcon.classList.remove('fa-lock');
        lockIcon.classList.add('fa-unlock');
        lockIcon.style.color = '#ffff80';
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

function toggleDropdownMenu() {
    document.getElementById("myDropdownccc").classList.toggle("showccc");
}

function closeDropdownMenu(event) {
    if (!event.target.matches('.menu-buttonaa')) {
        const dropdowns = document.getElementsByClassName("dropdown-menuccc");
        for (let dropdown of dropdowns) {
            if (dropdown.classList.contains('showccc')) {
                dropdown.classList.remove('showccc');
            }
        }
    }
}

function showSpinner(tabElement) {
    let tabName = tabElement.querySelector('.tab-nameaa');
    if (!tabName.querySelector('.spinner')) {
        let spinner = document.createElement('div');
        spinner.className = 'spinner';
        tabName.insertBefore(spinner, tabName.firstChild);
    }
}

function hideSpinner(tabElement) {
    let spinner = tabElement.querySelector('.spinner');
    if (spinner) {
        spinner.remove();
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('engineDropdownaa');
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function selectEngine(iconSrc, engineName) {
    document.getElementById('selected-engineaa').src = iconSrc;
    document.getElementById('selected-engineaa').alt = engineName;
    document.getElementById('statusMessageaa').textContent = "Searching with " + engineName;
    toggleDropdown();
}

// Initialize menu click handler
document.addEventListener('DOMContentLoaded', function() {
    const newTabMenuItem = document.querySelector('.dropdown-menuccc a');
    if (newTabMenuItem) {
        newTabMenuItem.addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('add-tabaa').click();
            toggleDropdownMenu();
        });
    }
});
