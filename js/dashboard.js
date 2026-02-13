// OZNEH IA - Dashboard Controller
// Manages dashboard UI and data updates

class Dashboard {
    constructor() {
        this.chart = null;
        this.currentSymbol = 'BTCUSDT';
        this.watchlist = [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT',
            'ADAUSDT', 'DOTUSDT', 'AVAXUSDT', 'LINKUSDT', 'POLUSDT',
            'TRXUSDT', 'LTCUSDT', 'USDCUSDT', 'ARBUSDT', 'APTUSDT',
            'NEARUSDT', 'ICPUSDT', 'RENDERUSDT', 'SHIBUSDT', 'PEPEUSDT',
            'TAOUSDT', 'FTMUSDT', 'ATOMUSDT', 'ALGOUSDT', 'XTZUSDT',
            'EOSUSDT', 'HNTUSDT', 'TONUSDT', 'ZECUSDT', 'DOGEUSDT'
        ];
        this.updateInterval = null;
    }

    async initialize() {
        console.log('Initializing dashboard...');

        // Set up mobile menu - Initialize FIRST so it works immediately
        this.initializeMobileMenu();

        // Set up connection status listener
        binanceService.on('connection', (connected) => {
            this.updateConnectionStatus(connected);
        });

        // Initialize chart
        this.initializeChart();

        // Check subscription status
        this.checkSubscriptionStatus();

        // Check for welcome message/banner
        this.updateTrialBanner();

        // Update banner every minute
        this.bannerInterval = setInterval(() => this.updateTrialBanner(), 60000);

        // Load initial data (don't await to avoid blocking UI)
        this.loadInitialData();

        // Subscribe to real-time updates
        this.subscribeToUpdates();

        // Set up chart controls
        this.setupChartControls();

        // Lock settings for admin user
        this.lockSettingsForAdmin();

        // Set up logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('ozneh_auth');
                localStorage.removeItem('ozneh_user');
                window.location.href = 'index.html';
            });
        }


        // Update stats periodically
        this.updateInterval = setInterval(() => {
            this.updateStats();
        }, 10000); // Update every 10 seconds
    }

    async loadInitialData() {
        // Render cards immediately with watchlist to ensure UI exists even if fetch fails
        this.renderCryptoCards(this.watchlist.map(symbol => ({
            symbol: symbol,
            price: 0,
            changePercent: 0
        })));

        try {
            // Fetch initial data for all watchlist symbols
            const tickerData = await binanceService.getMultiplePrices(this.watchlist);

            if (tickerData && tickerData.length > 0) {
                this.renderCryptoCards(tickerData);
                await this.updateSignals(tickerData);
            }

            // Load chart data for current symbol
            await this.updateChart(this.currentSymbol);

        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    subscribeToUpdates() {
        binanceService.subscribeToPriceUpdates(this.watchlist, (priceUpdate) => {
            this.handlePriceUpdate(priceUpdate);
        });
    }

    handlePriceUpdate(data) {
        // Update crypto card
        const card = document.querySelector(`[data-symbol="${data.symbol}"]`);
        if (card) {
            const priceEl = card.querySelector('.crypto-price');
            const changeEl = card.querySelector('.crypto-change');

            if (priceEl) {
                priceEl.textContent = `$${data.price.toFixed(2)}`;
            }

            if (changeEl) {
                const isPositive = data.changePercent >= 0;
                changeEl.className = `crypto-change ${isPositive ? 'positive' : 'negative'}`;
                changeEl.textContent = `${isPositive ? '↑' : '↓'} ${Math.abs(data.changePercent).toFixed(2)}%`;
            }
        }

        // Update stats
        this.updateStats();
    }

    async updateSignals(tickerData) {
        for (const ticker of tickerData) {
            try {
                const klines = await binanceService.getKlines(ticker.symbol, '1h', 50);
                const signalResult = signalsEngine.generateSignal(ticker.symbol, klines);

                // Update Dashboard signal badge
                const dashBadge = document.getElementById(`signal-${ticker.symbol}`);
                if (dashBadge) {
                    dashBadge.className = `signal-badge ${signalResult.signal.toLowerCase()}`;
                    dashBadge.textContent = `${signalResult.signal} (${signalResult.strength}%)`;
                }

                // Update Signals Page elements
                const pageBadge = document.getElementById(`signal-page-${ticker.symbol}`);
                const pageReason = document.getElementById(`reason-page-${ticker.symbol}`);

                if (pageBadge) {
                    pageBadge.className = `signal-badge ${signalResult.signal.toLowerCase()}`;
                    pageBadge.textContent = `${signalResult.signal} (${signalResult.strength}%)`;
                }

                if (pageReason) {
                    pageReason.textContent = signalResult.reason;
                }
            } catch (error) {
                console.error(`Error updating signal for ${ticker.symbol}:`, error);
            }
        }
    }

    renderCryptoCards(tickerData) {
        const grid = document.getElementById('cryptoGrid');
        const signalsGrid = document.getElementById('signalsGrid');
        const portfolioGrid = document.getElementById('portfolioGrid');

        if (grid) grid.innerHTML = '';
        if (signalsGrid) signalsGrid.innerHTML = '';
        if (portfolioGrid) portfolioGrid.innerHTML = '';

        tickerData.forEach(ticker => {
            const isPositive = ticker.changePercent >= 0;
            const symbol = ticker.symbol.replace('USDT', '');

            // Main Dashboard Card
            if (grid) {
                const card = document.createElement('div');
                card.className = 'crypto-card';
                card.setAttribute('data-symbol', ticker.symbol);
                card.innerHTML = `
                    <div class="crypto-header">
                        <div class="crypto-name">
                            <div class="crypto-icon">${this.getCryptoIcon(symbol)}</div>
                            <div>
                                <div class="crypto-symbol">${symbol}</div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-muted);">${ticker.symbol}</div>
                            </div>
                        </div>
                    </div>
                    <div class="crypto-price">$${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div class="crypto-change ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '↑' : '↓'} ${Math.abs(ticker.changePercent).toFixed(2)}%
                    </div>
                    <div class="signal-badge hold" id="signal-${ticker.symbol}">Analisando...</div>
                `;
                grid.appendChild(card);
            }

            // Signals Page Card (More detailed)
            if (signalsGrid) {
                const signalCard = document.createElement('div');
                signalCard.className = 'crypto-card';
                signalCard.innerHTML = `
                    <div class="crypto-header">
                        <div class="crypto-name">
                            <div class="crypto-icon">${this.getCryptoIcon(symbol)}</div>
                            <span class="crypto-symbol">${symbol}</span>
                        </div>
                        <div class="signal-badge hold" id="signal-page-${ticker.symbol}">Processando</div>
                    </div>
                    <div class="crypto-price">$${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div id="reason-page-${ticker.symbol}" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 10px;">Aguardando análise técnica...</div>
                `;
                signalsGrid.appendChild(signalCard);
            }

            // Portfolio Page Card
            if (portfolioGrid) {
                const amount = symbol === 'BTC' ? 0.15 : symbol === 'ETH' ? 2.5 : 100;
                const value = ticker.price * amount;
                const portCard = document.createElement('div');
                portCard.className = 'crypto-card';
                portCard.innerHTML = `
                    <div class="crypto-header">
                        <div class="crypto-name">
                            <div class="crypto-icon">${this.getCryptoIcon(symbol)}</div>
                            <span class="crypto-symbol">${symbol}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 700;">${amount} ${symbol}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                    <div class="stat-change positive">Em lucro (+$${(value * 0.05).toFixed(2)})</div>
                `;
                portfolioGrid.appendChild(portCard);
            }
        });

        // Trigger signal updates
        setTimeout(() => this.updateSignals(tickerData), 1000);
    }

    getCryptoIcon(symbol) {
        const icons = {
            'BTC': '₿',
            'ETH': 'Ξ',
            'BNB': 'B',
            'XRP': 'X',
            'SOL': 'S',
            'ADA': 'A',
            'DOT': 'D',
            'AVAX': 'V',
            'LINK': 'L',
            'POL': 'P',
            'TRX': 'T',
            'LTC': 'Ł',
            'USDC': 'U',
            'ARB': 'A',
            'APT': 'A',
            'NEAR': 'N',
            'ICP': 'I',
            'RENDER': 'R',
            'SHIB': 'S',
            'PEPE': 'P',
            'TAO': 'τ',
            'FTM': 'F',
            'ATOM': 'A',
            'ALGO': 'A',
            'XTZ': 'X',
            'EOS': 'E',
            'HNT': 'H',
            'TON': 'T',
            'ZEC': 'Z',
            'DOGE': 'Ð'
        };
        return icons[symbol] || symbol.charAt(0);
    }

    initializeChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Preço',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(10, 22, 40, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        borderColor: '#2563eb',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(37, 99, 235, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(37, 99, 235, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: function (value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    async updateChart(symbol) {
        try {
            const klines = await binanceService.getKlines(symbol, '1h', 24);

            const labels = klines.map(k => {
                const date = new Date(k.time);
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            });

            const prices = klines.map(k => k.close);

            // Update Dashboard Chart
            if (this.chart) {
                this.chart.data.labels = labels;
                this.chart.data.datasets[0].data = prices;
                this.chart.data.datasets[0].label = `${symbol.replace('USDT', '')} Preço`;
                this.chart.update();
            }

            // Update Advanced Chart (if it exists and is different)
            const advCtx = document.getElementById('advancedChart');
            if (advCtx) {
                if (!this.advancedChart) {
                    this.initializeAdvancedChart(advCtx);
                }
                this.advancedChart.data.labels = labels;
                this.advancedChart.data.datasets[0].data = prices;
                this.advancedChart.data.datasets[0].label = `${symbol.replace('USDT', '')} Análise Técnica`;
                this.advancedChart.update();
            }

            // Update Indicators on Charts Page
            const signal = signalsEngine.getSignal(symbol);
            if (signal) {
                this.updateIndicatorsUI(signal);
            }

        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    initializeAdvancedChart(ctx) {
        this.advancedChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Preço',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: this.getChartOptions()
        });
    }

    getChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(10, 22, 40, 0.9)',
                }
            },
            scales: {
                x: { grid: { color: 'rgba(37, 99, 235, 0.1)' }, ticks: { color: '#94a3b8' } },
                y: {
                    grid: { color: 'rgba(37, 99, 235, 0.1)' },
                    ticks: {
                        color: '#94a3b8',
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        };
    }

    updateIndicatorsUI(signal) {
        const rsiEl = document.getElementById('rsiValue');
        const rsiStatus = document.getElementById('rsiStatus');
        const smaEl = document.getElementById('sma20Value');
        const volEl = document.getElementById('volumeValue');

        if (rsiEl) rsiEl.textContent = signal.indicators.rsi;
        if (rsiStatus) {
            const rsi = parseFloat(signal.indicators.rsi);
            rsiStatus.textContent = rsi > 70 ? 'Sobrecomprado' : rsi < 30 ? 'Sobrependido' : 'Neutro';
            rsiStatus.style.color = rsi > 70 ? '#ef4444' : rsi < 30 ? '#10b981' : '#94a3b8';
        }
        if (smaEl) smaEl.textContent = '$' + parseFloat(signal.indicators.sma20).toLocaleString();
        if (volEl) volEl.textContent = signal.signal + ' Confirmed';
    }

    initializeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const navLinks = document.querySelectorAll('.sidebar-nav a');

        const toggleMenu = () => {
            if (!sidebar || !overlay) return;
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        };

        // Use event delegation for all menu-related clicks
        document.addEventListener('click', (e) => {
            // Check for mobile menu buttons (any button with the class)
            if (e.target.closest('.mobile-menu-btn')) {
                toggleMenu();
            }
            // Check for close button or overlay
            else if (e.target.closest('#close-sidebar-btn') || e.target.closest('#sidebar-overlay')) {
                if (sidebar && sidebar.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });

        // Close menu when clicking a link on all screen sizes
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar && sidebar.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    setupChartControls() {
        const buttons = document.querySelectorAll('.chart-controls button');
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const parent = e.target.closest('.chart-controls');
                parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const symbol = e.target.getAttribute('data-crypto');
                this.currentSymbol = symbol;
                await this.updateChart(symbol);
            });
        });
    }

    async updateStats() {
        try {
            // Calculate total portfolio value (simulated)
            const btcPrice = binanceService.getCachedPrice('BTCUSDT');
            if (btcPrice) {
                const portfolioValue = btcPrice.price * 0.5; // Simulated: 0.5 BTC
                document.getElementById('totalPortfolio').textContent = `$${portfolioValue.toFixed(2)}`;

                const change = btcPrice.changePercent;
                const changeEl = document.getElementById('portfolioChange');
                changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                changeEl.parentElement.className = `stat-change ${change >= 0 ? 'positive' : 'negative'}`;
            }

            // Update active signals
            const signals = signalsEngine.getAllSignals();
            const buySignals = signals.filter(s => s.signal === 'BUY').length;
            const sellSignals = signals.filter(s => s.signal === 'SELL').length;

            document.getElementById('activeSignals').textContent = signals.length;
            document.getElementById('signalsText').textContent =
                `${buySignals} Compra, ${sellSignals} Venda`;

            // Update accuracy
            const accuracy = signalsEngine.calculateAccuracy();
            document.getElementById('accuracy').textContent = `${accuracy.toFixed(0)}%`;

            // Update market status
            const marketTrend = buySignals > sellSignals ? 'Bullish' : sellSignals > buySignals ? 'Bearish' : 'Neutro';
            document.getElementById('marketStatus').textContent = marketTrend;
            document.getElementById('marketTrend').textContent =
                `${buySignals + sellSignals} sinais ativos`;

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (connected) {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Conectado à Binance';
        } else {
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = 'Desconectado';
        }
    }

    checkSubscriptionStatus() {
        const user = localStorage.getItem('ozneh_user');
        // Bypass for admin premium user
        if (user === 'admin123@premium.com') return;

        // Try to get per-user trial data first
        const trialData = JSON.parse(localStorage.getItem('ozneh_user_trials') || '{}');
        let createdAt = trialData[user] || localStorage.getItem('ozneh_created_at');

        if (!createdAt) return;

        const now = Date.now();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

        if (now - parseInt(createdAt) > threeDaysMs) {
            // Trial expired
            const overlay = document.getElementById('pricing-overlay');
            if (overlay) {
                overlay.classList.add('active');
                // Prevent scrolling
                document.body.style.overflow = 'hidden';

                // Hide back button
                const backBtn = document.getElementById('btn-back-dashboard');
                if (backBtn) {
                    backBtn.style.display = 'none';
                }
            }
        }
    }

    updateTrialBanner() {
        const banner = document.getElementById('trial-banner');
        if (!banner) return;

        const user = localStorage.getItem('ozneh_user');
        // Hide banner for admin premium user
        if (user === 'admin123@premium.com') {
            banner.style.display = 'none';
            return;
        }

        const trialData = JSON.parse(localStorage.getItem('ozneh_user_trials') || '{}');
        let createdAt = trialData[user] || localStorage.getItem('ozneh_created_at');

        if (!createdAt) {
            banner.style.display = 'none';
            return;
        }

        const now = Date.now();
        const startTime = parseInt(createdAt);
        const trialDuration = 3 * 24 * 60 * 60 * 1000;
        const timeLeft = trialDuration - (now - startTime);

        if (timeLeft > 0) {
            banner.style.display = 'flex';

            // Calculate time parts
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            if (hours > 0) timeString += `${hours}h `;
            timeString += `${minutes}min`;

            const countdownEl = document.getElementById('trial-countdown');
            if (countdownEl) {
                countdownEl.textContent = `Restam: ${timeString}`;
            }
        } else {
            banner.style.display = 'none';
        }
    }

    lockSettingsForAdmin() {
        const user = localStorage.getItem('ozneh_user');
        if (user === 'admin123@premium.com') {
            const settingsInputs = document.querySelectorAll('#page-settings input');
            const settingsButtons = document.querySelectorAll('#page-settings button');

            settingsInputs.forEach(input => {
                input.disabled = true;
                input.title = "Edição bloqueada para conta demonstrativa";
            });

            settingsButtons.forEach(btn => {
                btn.disabled = true;
                btn.textContent = "Bloqueado (Conta Demo)";
                btn.style.opacity = "0.7";
                btn.style.cursor = "not-allowed";
            });
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.bannerInterval) {
            clearInterval(this.bannerInterval);
        }
        binanceService.closeAll();
    }
}

// Initialize dashboard when DOM is ready
const dashboard = new Dashboard();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => dashboard.initialize());
} else {
    dashboard.initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    dashboard.destroy();
});
