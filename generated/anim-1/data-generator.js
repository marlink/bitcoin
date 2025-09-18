// Data Generator for Trading Animation
class TradingDataGenerator {
    constructor() {
        this.basePrice = 150;
        this.volatility = 0.02;
        this.trend = 0.001;
        this.currentPrice = this.basePrice;
        this.volume = 1000000;
    }

    // Generate realistic historical candlestick data
    generateHistoricalData(days = 90) {
        if (this.historicalDataOverride) return this.historicalDataOverride;
        const data = [];
        let price = this.basePrice;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            // Skip weekends for realistic trading data
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue;
            }

            const open = price;
            
            // Add some trend and random walk
            const trendFactor = Math.sin(i / 20) * 0.005; // Cyclical trend
            const randomFactor = (Math.random() - 0.5) * this.volatility;
            
            // Calculate daily range
            const dailyRange = price * (0.01 + Math.random() * 0.03);
            const high = open + dailyRange * (0.3 + Math.random() * 0.7);
            const low = open - dailyRange * (0.3 + Math.random() * 0.7);
            
            // Close price with trend and volatility
            const close = open + (open * (trendFactor + randomFactor));
            
            // Ensure high/low constraints
            const actualHigh = Math.max(open, close, high);
            const actualLow = Math.min(open, close, low);
            
            // Generate volume with some correlation to price movement
            const priceChange = Math.abs(close - open) / open;
            const volumeMultiplier = 0.8 + (priceChange * 10) + (Math.random() * 0.4);
            const dayVolume = Math.floor(this.volume * volumeMultiplier);

            data.push({
                date: new Date(date),
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(actualHigh.toFixed(2)),
                low: parseFloat(actualLow.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: dayVolume,
                type: close > open ? 'bullish' : 'bearish'
            });

            price = close;
        }

        this.currentPrice = price;
        return data;
    }

    // Generate current day's live candlestick
    generateCurrentCandle() {
        if (this.currentCandleOverride) return this.currentCandleOverride;
        const now = new Date();
        const open = this.currentPrice;
        
        // Simulate intraday movement
        const timeProgress = (now.getHours() * 60 + now.getMinutes()) / (16 * 60); // 9:30 AM to 4:00 PM
        const intradayVolatility = 0.015;
        
        // Current price with some realistic movement
        const currentMovement = (Math.random() - 0.5) * intradayVolatility;
        const current = open + (open * currentMovement);
        
        // High and low for the day so far
        const dayRange = open * (0.005 + Math.random() * 0.02);
        const high = Math.max(open, current) + dayRange * Math.random();
        const low = Math.min(open, current) - dayRange * Math.random();
        
        // Volume builds throughout the day
        const currentVolume = Math.floor(this.volume * (0.3 + timeProgress * 0.7) * (0.8 + Math.random() * 0.4));

        return {
            date: now,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(current.toFixed(2)),
            volume: currentVolume,
            type: current > open ? 'bullish' : 'bearish',
            isLive: true
        };
    }

    // Advanced prediction algorithm with multiple scenarios
    generatePredictions(currentCandle, historicalData) {
        const scenarios = this.calculatePredictionScenarios(currentCandle, historicalData);
        
        return {
            bullish: this.generateScenarioData(currentCandle, scenarios.bullish),
            bearish: this.generateScenarioData(currentCandle, scenarios.bearish),
            sideways: this.generateScenarioData(currentCandle, scenarios.sideways)
        };
    }

    calculatePredictionScenarios(currentCandle, historicalData) {
        // Analyze recent trend
        const recentData = historicalData.slice(-20);
        const trendStrength = this.calculateTrendStrength(recentData);
        const volatility = this.calculateVolatility(recentData);
        const momentum = this.calculateMomentum(recentData);
        
        // RSI-like momentum indicator
        const rsi = this.calculateRSI(recentData);
        
        // Support and resistance levels
        const levels = this.calculateSupportResistance(historicalData);
        
        return {
            bullish: {
                probability: this.calculateBullishProbability(trendStrength, momentum, rsi, levels),
                strength: Math.max(0.3, trendStrength + momentum * 0.5),
                targetPrice: currentCandle.close * (1.02 + Math.random() * 0.03),
                confidence: 0.65 + Math.random() * 0.25
            },
            bearish: {
                probability: this.calculateBearishProbability(trendStrength, momentum, rsi, levels),
                strength: Math.max(0.3, Math.abs(trendStrength) + momentum * 0.5),
                targetPrice: currentCandle.close * (0.97 - Math.random() * 0.03),
                confidence: 0.60 + Math.random() * 0.25
            },
            sideways: {
                probability: 1 - Math.abs(trendStrength) - momentum,
                strength: 0.2 + Math.random() * 0.3,
                targetPrice: currentCandle.close * (0.995 + Math.random() * 0.01),
                confidence: 0.55 + Math.random() * 0.20
            }
        };
    }

    generateScenarioData(currentCandle, scenario) {
        const predictions = [];
        let price = currentCandle.close;
        const baseDate = new Date(currentCandle.date);
        
        for (let i = 1; i <= 5; i++) {
            const futureDate = new Date(baseDate);
            futureDate.setDate(futureDate.getDate() + i);
            
            // Skip weekends
            while (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
                futureDate.setDate(futureDate.getDate() + 1);
            }
            
            // Calculate price movement towards target
            const progressToTarget = i / 5;
            const targetMovement = (scenario.targetPrice - currentCandle.close) * progressToTarget;
            const randomNoise = (Math.random() - 0.5) * price * 0.01 * scenario.strength;
            
            const open = price;
            const close = currentCandle.close + targetMovement + randomNoise;
            
            // Generate realistic OHLC
            const dailyRange = price * (0.005 + Math.random() * 0.015) * scenario.strength;
            const high = Math.max(open, close) + dailyRange * Math.random();
            const low = Math.min(open, close) - dailyRange * Math.random();
            
            predictions.push({
                date: new Date(futureDate),
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: Math.floor(this.volume * (0.7 + Math.random() * 0.6)),
                type: close > open ? 'bullish' : 'bearish',
                confidence: scenario.confidence * (1 - progressToTarget * 0.3), // Decreasing confidence over time
                probability: scenario.probability
            });
            
            price = close;
        }
        
        return {
            data: predictions,
            scenario: scenario,
            metadata: {
                algorithm: 'AI-Enhanced Technical Analysis',
                factors: ['Trend Analysis', 'Momentum', 'Support/Resistance', 'Volume Profile'],
                confidence: scenario.confidence,
                timeframe: '5-day outlook'
            }
        };
    }

    // Technical analysis helper functions
    calculateTrendStrength(data) {
        if (data.length < 10) return 0;
        
        const prices = data.map(d => d.close);
        const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
        const secondHalf = prices.slice(Math.floor(prices.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
        
        return (secondAvg - firstAvg) / firstAvg;
    }

    calculateVolatility(data) {
        const returns = [];
        for (let i = 1; i < data.length; i++) {
            returns.push((data[i].close - data[i-1].close) / data[i-1].close);
        }
        
        const mean = returns.reduce((a, b) => a + b) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    calculateMomentum(data) {
        if (data.length < 5) return 0;
        
        const recent = data.slice(-5);
        const older = data.slice(-10, -5);
        
        const recentAvg = recent.reduce((a, b) => a + b.close, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b.close, 0) / older.length;
        
        return (recentAvg - olderAvg) / olderAvg;
    }

    calculateRSI(data, period = 14) {
        if (data.length < period + 1) return 50;
        
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i-1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const avgGain = gains.slice(-period).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b) / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateSupportResistance(data) {
        const highs = data.map(d => d.high).sort((a, b) => b - a);
        const lows = data.map(d => d.low).sort((a, b) => a - b);
        
        return {
            resistance: highs.slice(0, 3),
            support: lows.slice(0, 3)
        };
    }

    calculateBullishProbability(trend, momentum, rsi, levels) {
        let probability = 0.5; // Base probability
        
        // Trend factor
        if (trend > 0) probability += trend * 2;
        
        // Momentum factor
        if (momentum > 0) probability += momentum * 1.5;
        
        // RSI factor (oversold conditions favor bullish)
        if (rsi < 30) probability += 0.2;
        else if (rsi > 70) probability -= 0.2;
        
        return Math.max(0.1, Math.min(0.9, probability));
    }

    calculateBearishProbability(trend, momentum, rsi, levels) {
        let probability = 0.5; // Base probability
        
        // Trend factor
        if (trend < 0) probability += Math.abs(trend) * 2;
        
        // Momentum factor
        if (momentum < 0) probability += Math.abs(momentum) * 1.5;
        
        // RSI factor (overbought conditions favor bearish)
        if (rsi > 70) probability += 0.2;
        else if (rsi < 30) probability -= 0.2;
        
        return Math.max(0.1, Math.min(0.9, probability));
    }

    // Update current price for live simulation
    updateCurrentPrice() {
        const change = (Math.random() - 0.5) * 0.001; // Small random changes
        this.currentPrice *= (1 + change);
        return this.currentPrice;
    }

    // Fetch real Bitcoin historical data from CoinGecko
    async fetchBitcoinHistoricalData(days = 90) {
        const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data.prices || !data.total_volumes) throw new Error('Invalid API response');
            return data.prices.map((priceArr, i) => {
                const [timestamp, close] = priceArr;
                const volume = data.total_volumes[i][1];
                // Approximate open/high/low from close (for demo)
                const open = close * (0.99 + Math.random() * 0.02);
                const high = Math.max(open, close) * (1 + Math.random() * 0.01);
                const low = Math.min(open, close) * (0.99 - Math.random() * 0.01);
                return {
                    date: new Date(timestamp),
                    open: parseFloat(open.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    close: parseFloat(close.toFixed(2)),
                    volume: Math.floor(volume),
                    type: close > open ? 'bullish' : 'bearish'
                };
            });
        } catch (e) {
            console.error('Failed to fetch Bitcoin data:', e);
            return null;
        }
    }

    // Fetch real current Bitcoin price
    async fetchCurrentBitcoinCandle() {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
        try {
            const response = await fetch(url);
            const data = await response.json();
            const now = new Date();
            const close = data.bitcoin.usd;
            const open = close * (0.99 + Math.random() * 0.02);
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (0.99 - Math.random() * 0.01);
            return {
                date: now,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: 0,
                type: close > open ? 'bullish' : 'bearish',
                isLive: true
            };
        } catch (e) {
            console.error('Failed to fetch current Bitcoin price:', e);
            return null;
        }
    }
}

// Export for use in other modules
window.TradingDataGenerator = TradingDataGenerator;