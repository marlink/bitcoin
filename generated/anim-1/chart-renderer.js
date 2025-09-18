// Chart Renderer for Trading Animation
class ChartRenderer {
    constructor() {
        this.margins = { top: 20, right: 30, bottom: 40, left: 60 };
        this.colors = {
            bullish: '#00ff88',
            bearish: '#ff4444',
            historical: '#666666',
            grid: 'rgba(255, 255, 255, 0.1)',
            text: '#e0e0e0'
        };
    }

    // Render historical candlestick chart
    renderHistoricalChart(data, containerId) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        const width = containerNode.clientWidth - this.margins.left - this.margins.right;
        const height = containerNode.clientHeight - this.margins.top - this.margins.bottom;

        // Clear previous chart
        container.selectAll('*').remove();

        const svg = container
            .append('svg')
            .attr('width', width + this.margins.left + this.margins.right)
            .attr('height', height + this.margins.top + this.margins.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => Math.max(d.high, d.low)))
            .nice()
            .range([height, 0]);

        // Grid lines
        this.addGridLines(g, xScale, yScale, width, height);

        // Candlesticks
        this.renderCandlesticks(g, data, xScale, yScale, 'historical');

        // Axes
        this.addAxes(g, xScale, yScale, width, height);

        // Technical indicators
        this.addTechnicalIndicators(g, data, xScale, yScale);

        return { svg, xScale, yScale, width, height };
    }

    // Render current candlestick with live effects
    renderCurrentChart(candle, containerId) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        const width = containerNode.clientWidth - this.margins.left - this.margins.right;
        const height = containerNode.clientHeight - this.margins.top - this.margins.bottom;

        // Clear previous chart
        container.selectAll('*').remove();

        const svg = container
            .append('svg')
            .attr('width', width + this.margins.left + this.margins.right)
            .attr('height', height + this.margins.top + this.margins.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

        // Scale for single large candlestick
        const yScale = d3.scaleLinear()
            .domain([candle.low * 0.995, candle.high * 1.005])
            .range([height, 0]);

        // Center the candlestick
        const candleWidth = Math.min(width * 0.3, 80);
        const candleX = (width - candleWidth) / 2;

        // Render large candlestick with glow effect
        this.renderLargeCandlestick(g, candle, candleX, candleWidth, yScale, height);

        // Add price level lines
        this.addPriceLevels(g, candle, yScale, width);

        // Add live price indicator
        this.addLivePriceIndicator(g, candle, yScale, width);

        return { svg, yScale, width, height };
    }

    // Render prediction chart with transparency effects
    renderPredictionChart(predictions, containerId, scenario) {
        const container = d3.select(`#${containerId}`);
        const containerNode = container.node();
        const width = containerNode.clientWidth - this.margins.left - this.margins.right;
        const height = containerNode.clientHeight - this.margins.top - this.margins.bottom;

        // Clear previous chart
        container.selectAll('*').remove();

        const svg = container
            .append('svg')
            .attr('width', width + this.margins.left + this.margins.right)
            .attr('height', height + this.margins.top + this.margins.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

        if (!predictions || predictions.length === 0) return;

        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(predictions, d => d.date))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(predictions, d => Math.max(d.high, d.low)))
            .nice()
            .range([height, 0]);

        // Confidence bands
        this.addConfidenceBands(g, predictions, xScale, yScale, scenario);

        // Prediction candlesticks
        this.renderCandlesticks(g, predictions, xScale, yScale, 'prediction');

        // Trend line
        this.addTrendLine(g, predictions, xScale, yScale, scenario);

        return { svg, xScale, yScale, width, height };
    }

    // Render candlesticks with different styles
    renderCandlesticks(g, data, xScale, yScale, type) {
        const candleWidth = type === 'historical' ? 
            Math.max(2, (xScale.range()[1] - xScale.range()[0]) / data.length * 0.8) : 
            Math.min(30, (xScale.range()[1] - xScale.range()[0]) / data.length * 0.6);

        const candles = g.selectAll(`.candlestick-${type}`)
            .data(data)
            .enter()
            .append('g')
            .attr('class', `candlestick candlestick-${type} ${d => d.type}`)
            .attr('transform', d => `translate(${type === 'historical' ? xScale(d.date) : xScale(d.date)}, 0)`);

        // Wicks
        candles.append('line')
            .attr('class', 'wick')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', d => yScale(d.high))
            .attr('y2', d => yScale(d.low))
            .attr('stroke', d => d.type === 'bullish' ? this.colors.bullish : this.colors.bearish)
            .attr('stroke-width', type === 'prediction' ? 1 : 2)
            .attr('opacity', type === 'prediction' ? 0.15 : type === 'historical' ? 0.7 : 1);

        // Bodies
        candles.append('rect')
            .attr('class', 'body')
            .attr('x', -candleWidth / 2)
            .attr('y', d => yScale(Math.max(d.open, d.close)))
            .attr('width', candleWidth)
            .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)) || 1)
            .attr('fill', d => d.type === 'bullish' ? this.colors.bullish : this.colors.bearish)
            .attr('stroke', d => d.type === 'bullish' ? this.colors.bullish : this.colors.bearish)
            .attr('stroke-width', 1)
            .attr('opacity', type === 'prediction' ? 0.15 : type === 'historical' ? 0.7 : 1);

        // Add hover effects for predictions
        if (type === 'prediction') {
            candles
                .on('mouseover', (event, d) => this.showTooltip(event, d))
                .on('mouseout', () => this.hideTooltip());
        }

        return candles;
    }

    // Render large current candlestick with special effects
    renderLargeCandlestick(g, candle, x, width, yScale, height) {
        const candleGroup = g.append('g')
            .attr('class', `candlestick current ${candle.type}`)
            .attr('transform', `translate(${x + width/2}, 0)`);

        // Glow effect
        const defs = g.append('defs');
        const filter = defs.append('filter')
            .attr('id', 'glow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        filter.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');

        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Wick with animation
        candleGroup.append('line')
            .attr('class', 'wick')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', yScale(candle.high))
            .attr('y2', yScale(candle.low))
            .attr('stroke', candle.type === 'bullish' ? this.colors.bullish : this.colors.bearish)
            .attr('stroke-width', 4)
            .attr('filter', 'url(#glow)');

        // Body with pulsing animation
        candleGroup.append('rect')
            .attr('class', 'body')
            .attr('x', -width / 2)
            .attr('y', yScale(Math.max(candle.open, candle.close)))
            .attr('width', width)
            .attr('height', Math.abs(yScale(candle.open) - yScale(candle.close)) || 2)
            .attr('fill', candle.type === 'bullish' ? this.colors.bullish : this.colors.bearish)
            .attr('stroke', candle.type === 'bullish' ? this.colors.bullish : this.colors.bearish)
            .attr('stroke-width', 2)
            .attr('filter', 'url(#glow)');

        // Flickering top wick for live effect
        if (candle.isLive) {
            this.addFlickeringWick(candleGroup, candle, yScale);
        }
    }

    // Add flickering effect to simulate live trading
    addFlickeringWick(group, candle, yScale) {
        const flickerWick = group.append('line')
            .attr('class', 'flicker-wick')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', yScale(candle.high))
            .attr('y2', yScale(candle.high))
            .attr('stroke', '#ffff00')
            .attr('stroke-width', 2)
            .attr('opacity', 0);

        // Animate flickering
        setInterval(() => {
            const newHigh = candle.high + (Math.random() - 0.5) * candle.high * 0.002;
            flickerWick
                .transition()
                .duration(200)
                .attr('y1', yScale(newHigh))
                .attr('opacity', 0.8)
                .transition()
                .duration(200)
                .attr('opacity', 0);
        }, 1000);
    }

    // Add grid lines
    addGridLines(g, xScale, yScale, width, height) {
        // Horizontal grid lines
        g.selectAll('.grid-line-horizontal')
            .data(yScale.ticks(8))
            .enter()
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke', this.colors.grid)
            .attr('stroke-dasharray', '2,2');

        // Vertical grid lines
        g.selectAll('.grid-line-vertical')
            .data(xScale.ticks(6))
            .enter()
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', this.colors.grid)
            .attr('stroke-dasharray', '2,2');
    }

    // Add axes
    addAxes(g, xScale, yScale, width, height) {
        // X-axis
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')))
            .selectAll('text')
            .style('fill', this.colors.text);

        // Y-axis
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale).tickFormat(d => `$${d.toFixed(2)}`))
            .selectAll('text')
            .style('fill', this.colors.text);
    }

    // Add technical indicators
    addTechnicalIndicators(g, data, xScale, yScale) {
        // Simple moving average
        const sma = this.calculateSMA(data, 20);
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.sma))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(sma.filter(d => d.sma))
            .attr('class', 'trend-line')
            .attr('d', line)
            .attr('stroke', '#00ccff')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('opacity', 0.6);
    }

    // Add price levels
    addPriceLevels(g, candle, yScale, width) {
        const levels = [
            { price: candle.high, label: 'Resistance', color: '#ff6666' },
            { price: candle.low, label: 'Support', color: '#66ff66' }
        ];

        levels.forEach(level => {
            g.append('line')
                .attr('class', 'price-level')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', yScale(level.price))
                .attr('y2', yScale(level.price))
                .attr('stroke', level.color)
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '5,5')
                .attr('opacity', 0.5);

            g.append('text')
                .attr('class', 'price-level-label')
                .attr('x', width - 5)
                .attr('y', yScale(level.price) - 5)
                .attr('text-anchor', 'end')
                .attr('fill', level.color)
                .attr('font-size', '12px')
                .text(`${level.label}: $${level.price.toFixed(2)}`);
        });
    }

    // Add live price indicator
    addLivePriceIndicator(g, candle, yScale, width) {
        const indicator = g.append('circle')
            .attr('class', 'live-indicator')
            .attr('cx', width - 20)
            .attr('cy', yScale(candle.close))
            .attr('r', 4)
            .attr('fill', '#ffff00')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2);

        // Pulsing animation
        indicator
            .transition()
            .duration(1000)
            .attr('r', 6)
            .attr('opacity', 0.7)
            .transition()
            .duration(1000)
            .attr('r', 4)
            .attr('opacity', 1)
            .on('end', function repeat() {
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr('r', 6)
                    .attr('opacity', 0.7)
                    .transition()
                    .duration(1000)
                    .attr('r', 4)
                    .attr('opacity', 1)
                    .on('end', repeat);
            });
    }

    // Add confidence bands for predictions
    addConfidenceBands(g, predictions, xScale, yScale, scenario) {
        const area = d3.area()
            .x(d => xScale(d.date))
            .y0(d => yScale(d.low * (1 - d.confidence * 0.1)))
            .y1(d => yScale(d.high * (1 + d.confidence * 0.1)))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(predictions)
            .attr('class', 'confidence-band')
            .attr('d', area)
            .attr('fill', scenario === 'bullish' ? this.colors.bullish : 
                         scenario === 'bearish' ? this.colors.bearish : '#00ccff')
            .attr('opacity', 0.1);
    }

    // Add trend line
    addTrendLine(g, predictions, xScale, yScale, scenario) {
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.close))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(predictions)
            .attr('class', 'trend-line')
            .attr('d', line)
            .attr('stroke', scenario === 'bullish' ? this.colors.bullish : 
                           scenario === 'bearish' ? this.colors.bearish : '#00ccff')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('opacity', 0.3)
            .attr('stroke-dasharray', '5,5');
    }

    // Tooltip functions
    showTooltip(event, data) {
        const tooltip = d3.select('#tooltip');
        tooltip.select('.tooltip-content')
            .html(`
                <strong>Date:</strong> ${data.date.toLocaleDateString()}<br>
                <strong>Open:</strong> $${data.open.toFixed(2)}<br>
                <strong>High:</strong> $${data.high.toFixed(2)}<br>
                <strong>Low:</strong> $${data.low.toFixed(2)}<br>
                <strong>Close:</strong> $${data.close.toFixed(2)}<br>
                ${data.confidence ? `<strong>Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%` : ''}
                ${data.probability ? `<br><strong>Probability:</strong> ${(data.probability * 100).toFixed(1)}%` : ''}
            `);

        tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .classed('visible', true);
    }

    hideTooltip() {
        d3.select('#tooltip').classed('visible', false);
    }

    // Helper function to calculate Simple Moving Average
    calculateSMA(data, period) {
        return data.map((item, index) => {
            if (index < period - 1) {
                return { ...item, sma: null };
            }
            
            const sum = data.slice(index - period + 1, index + 1)
                .reduce((acc, d) => acc + d.close, 0);
            
            return { ...item, sma: sum / period };
        });
    }
}

// Export for use in other modules
window.ChartRenderer = ChartRenderer;