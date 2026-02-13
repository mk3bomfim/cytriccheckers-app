/**
 * Cytriccheckers Native JS System
 * Implements State Management, Components, Interactivity.
 */

// --- State Management ---
const Store = {
    state: {
        theme: localStorage.getItem('theme') || 'dark', // 'light' | 'dark'

        cart: JSON.parse(localStorage.getItem('cart')) || [],
        products: [
            { id: 'p1', name: 'NEON KEYBOARD X1', price: 129.99, image: '' },
            { id: 'p2', name: 'ROUTERS', price: 249.00, image: '' },
        ]
    },

    listeners: [],

    subscribe(callback) {
        this.listeners.push(callback);
    },

    notify() {
        this.listeners.forEach(cb => cb(this.state));
    },

    setTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem('theme', theme);
        document.documentElement.className = theme;
        this.notify();
    },



    addToCart(product) {
        this.state.cart.push(product);
        localStorage.setItem('cart', JSON.stringify(this.state.cart));
        this.notify();
        UI.showNotification(`ADDED TO CART: ${product.name}`);
    },

    getCartCount() {
        return this.state.cart.length;
    }
};

// --- Translations Removed (English Only) ---

// --- Advanced Systems Logic (RM-LOGS & Checkers) ---
const Systems = {
    // Reverse-engineered Regex from target site
    regex: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[:;|\\s]+(?:PASS:|LOGIN:|PASSWORD:|SENHA:)?\s*([^\s|;:]+)/i,

    cleaner: {
        rawLines: [],
        processedLines: [],

        loadFile(file, callback) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.rawLines = e.target.result.split(/\r?\n/).filter(line => line.trim().length > 0);
                callback(this.rawLines.length);
            };
            reader.readAsText(file);
        },

        process(keyword = "") {
            let lines = this.rawLines;

            // 1. Filter by keyword
            if (keyword.trim()) {
                const lowerKey = keyword.toLowerCase();
                lines = lines.filter(l => l.toLowerCase().includes(lowerKey));
            }

            // 2. Extract & Format
            const extracted = lines.map(line => {
                const match = line.match(Systems.regex);
                if (match && match[1] && match[2]) {
                    return `${match[1]}:${match[2]}`;
                }
                // If it doesn't match the strict regex but is just text, maybe keep it or ignore? 
                // Target site behavior suggests strict extraction for combos.
                // We will fall back to original line if no match, to allow "just filtering"
                return line.trim();
            }).filter(Boolean);

            this.processedLines = extracted;
            return extracted;
        },

        deduplicate() {
            const unique = [...new Set(this.processedLines)];
            const removedCount = this.processedLines.length - unique.length;
            this.processedLines = unique;
            return removedCount;
        }
    },

    checker: {
        active: false,
        stats: { total: 0, live: 0, dead: 0 },

        startSimulation(toolName, onUpdate) {
            this.active = true;
            this.stats = { total: 0, live: 0, dead: 0 };

            const interval = setInterval(() => {
                if (!this.active) return clearInterval(interval);

                this.stats.total++;
                const isLive = Math.random() > 0.8; // 20% hit rate simulation
                if (isLive) this.stats.live++;
                else this.stats.dead++;

                // Mock Result
                const mockMail = `user${Math.floor(Math.random() * 1000)}@email.com`;
                const result = {
                    status: isLive ? 'LIVE' : 'DEAD',
                    data: `${mockMail}:******`,
                    response: isLive ? 'Premium Plan | 4K' : 'Invalid Credentials'
                };

                onUpdate(this.stats, result);

                if (this.stats.total >= 100) { // Limit simulation
                    this.active = false;
                    clearInterval(interval);
                    UI.showNotification('CHECK COMPLETED');
                }
            }, 200); // Speed of check

            return () => { this.active = false; clearInterval(interval); };
        },


    }
};

// --- UI Components "System" ---
const Components = {
    Header: () => {
        // Cart Removed
        const themeIcon = Store.state.theme === 'dark' ? 'light_mode' : 'dark_mode';

        const path = window.location.pathname;
        const isHome = path.includes('index.html') || path.endsWith('/');
        const isDashboard = path.includes('dashboard.html');
        const isSearch = path.includes('search.html');

        return `
            <div class="logo-container">
                <img src="logo.svg" alt="Logo" class="logo-img" style="height: 30px; margin-right: 15px;">
                <h1 class="logo"><a href="index.html">CYTRICCHECKERS</a></h1>
                <span class="status-badge">SYSTEM: ${Store.state.theme.toUpperCase()}</span>
            </div>
            <nav>
                <ul>
                    <li><a href="index.html" class="nav-item ${isHome ? 'active' : ''}">[ HOME ]</a></li>
                    <li><a href="dashboard.html" class="nav-item ${isDashboard ? 'active' : ''}">[ TOOLS ]</a></li>
                    <li><a href="search.html" class="nav-item ${isSearch ? 'active' : ''}">[ DATA REFINERY ]</a></li>
                </ul>
            </nav>
            <div class="header-actions" style="display:flex; gap:15px; align-items:center;">
                <button id="theme-toggle" class="icon-btn">
                    <span class="material-symbols-outlined">${themeIcon}</span>
                </button>
            </div>
        `;
    },

    Footer: () => {
        return `
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>CYTRICCHECKERS</h4>
                    <p>&copy; 2026</p>
                </div>
                <div class="footer-col">
                    <h4>CONNECT</h4>
                    <a href="https://guns.lol/datasus" target="_blank" style="display:flex; align-items:center; gap:5px;">
                        <span class="material-symbols-outlined" style="font-size:16px;">link</span> DATASUS
                    </a>
                </div>
            </div>
            <div class="ticker-tape" style="border-top: 1px solid var(--border-color); margin-top: 40px;">
                <div class="ticker-content">
                    <span>[ LEARN . ADAPT . MODIFY ]</span>
                    <span>[ LEARN . ADAPT . MODIFY ]</span>
                    <span>[ LEARN . ADAPT . MODIFY ]</span>
                    <span>[ LEARN . ADAPT . MODIFY ]</span>
                    <span>[ LEARN . ADAPT . MODIFY ]</span>
                </div>
            </div>
        `;
    }
};

// --- View / Controller ---
const UI = {
    init() {
        document.documentElement.className = Store.state.theme;
        this.renderGlobalComponents();
        this.setupEventListeners();
        Store.subscribe(() => this.updateUI());

        // Initial cursor setup
        this.setupCustomCursor();

        // Router Logic init
        if (window.location.pathname.includes('search.html')) this.initCleanerPage();
        if (window.location.pathname.includes('dashboard.html')) this.initDashboardPage();
    },

    renderGlobalComponents() {
        const headerEl = document.querySelector('header');
        if (headerEl) headerEl.innerHTML = Components.Header();
        const footerEl = document.querySelector('footer');
        if (footerEl) footerEl.innerHTML = Components.Footer();
    },

    updateUI() {
        this.renderGlobalComponents();
        // Re-bind global listeners
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.onclick = () => Store.setTheme(Store.state.theme === 'dark' ? 'light' : 'dark');

        // Re-bind (not needed for global flashlight as it's document level, but if we cleared listeners...)
        // Actually, document listener persists. No action needed here.
    },

    setupCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-dot';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;

            if (!cursor.classList.contains('active')) {
                cursor.classList.add('active');
            }
        });
    },

    setupEventListeners() {
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.onclick = () => Store.setTheme(Store.state.theme === 'dark' ? 'light' : 'dark');

        const addToCartBtn = document.querySelector('.add-btn');
        if (addToCartBtn) {
            addToCartBtn.onclick = () => {
                const productName = document.querySelector('.product-title').innerText;
                Store.addToCart({ id: Date.now(), name: productName, price: '0.00' });
            };
        }
    },

    // --- Search / Cleaner Page Logic ---
    initCleanerPage() {
        const fileInput = document.getElementById('file-upload');
        const uploadBox = document.querySelector('.upload-box');

        if (uploadBox && fileInput) {
            uploadBox.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                if (fileInput.files.length) {
                    document.getElementById('upload-text').innerText = fileInput.files[0].name;
                    Systems.cleaner.loadFile(fileInput.files[0], (count) => {
                        this.showNotification(`LOADED ${count} LINES`);
                        document.querySelector('.results-area').classList.remove('hidden');
                        this.runCleaner(); // Auto run process on load
                    });
                }
            };
        }

        // Toolbar Buttons
        const btnExtract = document.getElementById('btn-extract');
        if (btnExtract) {
            btnExtract.onclick = () => this.runCleaner();
            document.getElementById('btn-dedupe').onclick = () => {
                const removed = Systems.cleaner.deduplicate();
                this.showNotification(`REMOVED ${removed} DUPLICATES`);
                this.renderLogList(Systems.cleaner.processedLines);
            };
            document.getElementById('btn-copy').onclick = () => {
                navigator.clipboard.writeText(Systems.cleaner.processedLines.join('\n'));
                this.showNotification('COPIED ALL RESULTS');
            };

            // Export to .txt
            const btnExport = document.getElementById('btn-export');
            if (btnExport) {
                btnExport.onclick = () => {
                    if (Systems.cleaner.processedLines.length === 0) return this.showNotification('NO DATA TO EXPORT');

                    const blob = new Blob([Systems.cleaner.processedLines.join('\n')], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'RM-LOGS_EXPORT.txt';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    this.showNotification('DATABASE EXPORTED TO .TXT');
                };
            }

            document.getElementById('btn-clear').onclick = () => {
                Systems.cleaner.processedLines = [];
                this.renderLogList([]);
                document.querySelector('.results-area').classList.add('hidden');
                document.getElementById('upload-text').innerText = "LOAD DATABASE";
            };
        }
    },

    runCleaner() {
        const keyword = document.getElementById('filter-input').value;
        const results = Systems.cleaner.process(keyword);
        this.renderLogList(results);
        this.showNotification(`PROCESSED ${results.length} LINES`);
    },

    renderLogList(lines) {
        const list = document.getElementById('log-list');
        if (!list) return;

        document.getElementById('count-total').innerText = lines.length;
        document.getElementById('count-unique').innerText = new Set(lines).size;

        // Render virtual-like simple list (limit for DOM perf)
        const displayLines = lines.slice(0, 100);
        list.innerHTML = displayLines.map((line, i) => `
            <div class="log-item">
                <span class="line-num">${i + 1}</span>
                <span class="line-data">${line}</span>
                <button onclick="navigator.clipboard.writeText('${line}')" class="icon-btn-small">content_copy</button>
            </div>
        `).join('');

        if (lines.length > 100) {
            list.innerHTML += `<div style="text-align:center; padding:10px; opacity:0.5; font-family:var(--font-mono); font-size:0.7rem;">+ ${lines.length - 100} MORE LINES HIDDEN (COPY TO VIEW ALL)</div>`;
        }
    },

    // --- Dashboard Checker Logic ---
    initDashboardPage() {
        const btns = document.querySelectorAll('.access-btn');
        btns.forEach(btn => {
            // Existing click logic
            btn.onclick = (e) => {
                if (e.target.closest('.access-btn').getAttribute('href') !== '#') return; // Allow normal links if any
                e.preventDefault();
                const toolName = e.target.closest('.grid-item').querySelector('h3').innerText;
                this.openCheckerConsole(toolName);
            }
        });

        // Global flashlight handles this now.
        this.initTermsModal();
    },

    openCheckerConsole(toolName) {
        // Create Modal Overlay
        const modal = document.createElement('div');
        modal.className = 'console-modal';
        modal.innerHTML = `
            <div class="console-box">
                <div class="console-header">
                    <span>${toolName} [ SYSTEM ONLINE ]</span>
                    <button id="close-console" style="background:none; border:none; color:white; cursor:pointer;">X</button>
                </div>
                <div class="console-stats">
                    <div class="stat-box"><span>TOTAL</span><b id="c-total">0</b></div>
                    <div class="stat-box green"><span>LIVE</span><b id="c-live">0</b></div>
                    <div class="stat-box red"><span>DEAD</span><b id="c-dead">0</b></div>
                </div>
                <div class="console-output custom-scrollbar" id="c-output">
                    <div class="log-line system">> INITIALIZING PROXY CHAIN...</div>
                    <div class="log-line system">> CONNECTING TO ${toolName}...</div>
                </div>
                <div class="console-actions">
                    <button id="btn-stop-check" class="action-btn" style="width:100%">STOP PROCESS</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close Logic
        const close = () => {
            if (stopSim) stopSim();
            modal.remove();
        };
        modal.querySelector('#close-console').onclick = close;
        modal.querySelector('#btn-stop-check').onclick = close;

        // Run Simulation
        const stopSim = Systems.checker.startSimulation(toolName, (stats, result) => {
            const t = document.getElementById('c-total');
            if (t) {
                t.innerText = stats.total;
                document.getElementById('c-live').innerText = stats.live;
                document.getElementById('c-dead').innerText = stats.dead;

                const output = document.getElementById('c-output');
                const div = document.createElement('div');
                div.className = `log-line ${result.status.toLowerCase()}`;
                div.innerHTML = `[${result.status}] ${result.data} - ${result.response}`;
                output.prepend(div);
            }
        });
    },

    showNotification(message) {
        let toast = document.querySelector('.notification-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'notification-toast';
            document.body.appendChild(toast);
        }

        toast.innerText = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    initTermsModal() {
        console.log('Initializing Terms Modal...');
        const modal = document.getElementById('terms-modal');
        const btnOpen = document.getElementById('btn-terms');
        const btnAgree = document.getElementById('btn-agree');

        console.log('Elements found:', { modal, btnOpen, btnAgree });

        if (modal && btnOpen && btnAgree) {
            btnOpen.onclick = (e) => {
                console.log('Terms button clicked');
                e.preventDefault();
                modal.classList.remove('hidden');
                modal.style.display = 'flex'; // Force display just in case
                document.body.style.overflow = 'hidden';
            };

            btnAgree.onclick = () => {
                modal.classList.add('hidden');
                modal.style.display = ''; // Clear inline style
                document.body.style.overflow = '';
            };

            // Close on outside click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                    modal.style.display = ''; // Clear inline style
                    document.body.style.overflow = '';
                }
            };
        }
    }
};

// --- Boot ---
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});
