// OZNEH IA - Binance Integration
// Real-time cryptocurrency data from Binance API

class BinanceService {
    constructor() {
        this.baseUrl = 'https://api.binance.com/api/v3';
        this.wsUrl = 'wss://stream.binance.com:9443/ws';
        this.connections = new Map();
        this.priceData = new Map();
        this.listeners = new Map();
    }

    // Fetch current price for a symbol
    async getPrice(symbol) {
        try {
            const response = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}`);
            const data = await response.json();
            return parseFloat(data.price);
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            return null;
        }
    }

    // Fetch 24h ticker data
    async get24hTicker(symbol) {
        try {
            const response = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${symbol}`);
            const data = await response.json();
            return {
                symbol: data.symbol,
                price: parseFloat(data.lastPrice),
                change: parseFloat(data.priceChange),
                changePercent: parseFloat(data.priceChangePercent),
                high: parseFloat(data.highPrice),
                low: parseFloat(data.lowPrice),
                volume: parseFloat(data.volume),
                quoteVolume: parseFloat(data.quoteVolume)
            };
        } catch (error) {
            console.error(`Error fetching 24h ticker for ${symbol}:`, error);
            return null;
        }
    }

    // Fetch historical klines/candlestick data
    async getKlines(symbol, interval = '1h', limit = 100) {
        try {
            const response = await fetch(
                `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
            );
            const data = await response.json();

            return data.map(candle => ({
                time: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5])
            }));
        } catch (error) {
            console.error(`Error fetching klines for ${symbol}:`, error);
            return [];
        }
    }

    // Subscribe to real-time price updates via WebSocket
    subscribeToPriceUpdates(symbols, callback) {
        const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
        const ws = new WebSocket(`${this.wsUrl}/${streams}`);

        ws.onopen = () => {
            console.log('WebSocket connected to Binance');
            if (this.listeners.has('connection')) {
                this.listeners.get('connection')(true);
            }
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Handle combined stream
            const ticker = data.data || data;

            const priceUpdate = {
                symbol: ticker.s,
                price: parseFloat(ticker.c),
                change: parseFloat(ticker.p),
                changePercent: parseFloat(ticker.P),
                high: parseFloat(ticker.h),
                low: parseFloat(ticker.l),
                volume: parseFloat(ticker.v)
            };

            this.priceData.set(ticker.s, priceUpdate);
            callback(priceUpdate);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (this.listeners.has('connection')) {
                this.listeners.get('connection')(false);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            if (this.listeners.has('connection')) {
                this.listeners.get('connection')(false);
            }

            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                this.subscribeToPriceUpdates(symbols, callback);
            }, 5000);
        };

        this.connections.set('main', ws);
        return ws;
    }

    // Get multiple symbols data at once
    async getMultiplePrices(symbols) {
        try {
            const symbolsParam = symbols.map(s => `"${s}"`).join(',');
            const response = await fetch(`${this.baseUrl}/ticker/24hr?symbols=[${symbolsParam}]`);
            const data = await response.json();

            return data.map(ticker => ({
                symbol: ticker.symbol,
                price: parseFloat(ticker.lastPrice),
                change: parseFloat(ticker.priceChange),
                changePercent: parseFloat(ticker.priceChangePercent),
                high: parseFloat(ticker.highPrice),
                low: parseFloat(ticker.lowPrice),
                volume: parseFloat(ticker.volume)
            }));
        } catch (error) {
            console.error('Error fetching multiple prices:', error);
            return [];
        }
    }

    // Add event listener
    on(event, callback) {
        this.listeners.set(event, callback);
    }

    // Get cached price data
    getCachedPrice(symbol) {
        return this.priceData.get(symbol);
    }

    // Close all connections
    closeAll() {
        this.connections.forEach(ws => ws.close());
        this.connections.clear();
    }
}

// Export singleton instance
const binanceService = new BinanceService();
