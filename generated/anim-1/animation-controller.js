// Animation Controller for Trading Animation
class AnimationController {
    constructor(dataGenerator, chartRenderer) {
        this.dataGenerator = dataGenerator;
        this.chartRenderer = chartRenderer;
        this.currentScenario = 'bullish'; // Only use bullish scenario
        this.predictionCycleTime = 3000; // 3 seconds per prediction cycle
        this.transitionTime = 1000; // 1 second transition
        this.isAnimating = false;
        this.predictionData = {};
        this.currentData = null;
        this.historicalData = null;
        this.predictionProbability = 0.6; // Initial prediction probability
        this.charts = {};
        this.tooltipElement = null;
        this.isInitialized = false;
    }

    // Check for common errors
    checkForErrors() {
        // Check if DOM elements exist
        const requiredElements = [
            { id: 'historical-chart', name: 'Historical Chart Panel' },
            { id: 'current-chart', name: 'Current Chart Panel' },
            { id: 'prediction-chart', name: 'Prediction Chart Panel' },
            { id: 'prediction-result', name: 'Prediction Result Container' },
            { id: 'toggle-animation', name: 'Animation Toggle Button' }
        ];
        
        const missingElements = requiredElements.filter(el => !document.getElementById(el.id));
        
        if (missingElements.length > 0) {
            const errorMessage = `Missing required DOM elements: ${missingElements.map(el => el.name).join(', ')}`;
            console.error(errorMessage);
            return { success: false, message: errorMessage };
        }
        
        // Check if data is valid
        if (!this.historicalData || !Array.isArray(this.historicalData) || this.historicalData.length === 0) {
            const errorMessage = 'Historical data is invalid or empty';
            console.error(errorMessage);
            return { success: false, message: errorMessage };
        }
        
        if (!this.currentData) {
            const errorMessage = 'Current candle data is missing';
            console.error(errorMessage);
            return { success: false, message: errorMessage };
        }
        
        return { success: true };
    }
    
    // Initialize the animation
    async initialize() {
        try {
            console.log('Initializing animation controller...');
            
            // Create tooltip element
            this.createTooltip();

            // Generate data
            this.historicalData = this.dataGenerator.generateHistoricalData(180); // 6 months of data
            this.currentData = this.dataGenerator.generateCurrentCandle();
            
            // Generate predictions for all scenarios
            this.predictionData = this.dataGenerator.generatePredictions(this.currentData, this.historicalData);
            
            // Check for errors
            const errorCheck = this.checkForErrors();
            if (!errorCheck.success) {
                throw new Error(errorCheck.message);
            }
            
            // Render initial charts
            this.renderCharts();

            // Start animation cycles
            this.startAnimationCycle();

            // Add event listeners for interactive features
            this.addEventListeners();

            // Predict next candlestick movement
            this.predictNextCandlestick();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Animation controller initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing animation controller:', error);
            // Add error to display
            const errorDisplay = document.createElement('div');
            errorDisplay.id = 'error-display';
            errorDisplay.className = 'error-message';
            errorDisplay.innerHTML = `<strong>Animation Error:</strong> ${error.message}`;
            document.body.appendChild(errorDisplay);
            this.isInitialized = false;
            return false;
        }
    }

    // Create tooltip element
    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'tooltip';
        tooltip.innerHTML = '<div class="tooltip-content"></div>';
        document.body.appendChild(tooltip);
        this.tooltipElement = tooltip;
    }

    // Render all charts
    renderCharts() {
        // Render historical chart
        this.charts.historical = this.chartRenderer.renderHistoricalChart(
            this.historicalData, 
            'historical-chart'
        );

        // Render current day chart
        this.charts.current = this.chartRenderer.renderCurrentChart(
            this.currentData, 
            'current-chart'
        );

        // Render prediction chart with bullish scenario only
        this.charts.prediction = this.chartRenderer.renderPredictionChart(
            this.predictionData['bullish'], 
            'prediction-chart',
            'bullish'
        );
    }

    // Start the animation cycle for predictions
    startAnimationCycle() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const cycleAnimation = () => {
            // Fade out current prediction
            const predictionPanel = document.getElementById('prediction-chart');
            gsap.to(predictionPanel, {
                opacity: 0,
                duration: this.transitionTime / 1000,
                onComplete: () => {
                    // No scenario rotation, just update prediction
                    this.charts.prediction = this.chartRenderer.renderPredictionChart(
                        this.predictionData['bullish'], 
                        'prediction-chart',
                        'bullish'
                    );

                    // Add sparkle effect
                    this.addSparkleEffect();

                    // Fade in new prediction
                    gsap.to(predictionPanel, {
                        opacity: 1,
                        duration: this.transitionTime / 1000
                    });
                }
            });
        };

        // Set interval for cycling through predictions
        this.animationInterval = setInterval(cycleAnimation, this.predictionCycleTime);

        // Start live data simulation for current candle
        this.startLiveDataSimulation();
    }

    // Add sparkle effect during prediction transitions
    addSparkleEffect() {
        const predictionPanel = document.getElementById('prediction-panel');
        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'sparkle-container';
        predictionPanel.appendChild(sparkleContainer);

        // Create sparkles
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animationDuration = `${0.5 + Math.random() * 1}s`;
            sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
            sparkleContainer.appendChild(sparkle);
        }

        // Remove sparkles after animation
        setTimeout(() => {
            if (sparkleContainer && sparkleContainer.parentNode) {
                sparkleContainer.parentNode.removeChild(sparkleContainer);
            }
        }, 1500);
    }

    // Simulate live data updates for current candle
    startLiveDataSimulation() {
        const updateLiveData = () => {
            // Update current candle with small random changes
            this.currentData = this.dataGenerator.updateCurrentCandle(this.currentData);
            
            // Re-render current chart
            this.charts.current = this.chartRenderer.renderCurrentChart(
                this.currentData, 
                'current-chart'
            );

            // Only update bullish prediction
            this.predictionData['bullish'] = this.dataGenerator.updatePrediction(
                this.predictionData['bullish'],
                this.currentData,
                'bullish'
            );

            // Re-render prediction if not in transition
            if (document.getElementById('prediction-panel').style.opacity !== '0') {
                this.charts.prediction = this.chartRenderer.renderPredictionChart(
                    this.predictionData['bullish'], 
                    'prediction-panel',
                    'bullish'
                );
            }
        };

        // Update live data every 2 seconds
        this.liveDataInterval = setInterval(updateLiveData, 2000);
    }

    // Add event listeners for interactive features
    addEventListeners() {
        // Toggle animation pause/play
        document.getElementById('toggle-animation').addEventListener('click', () => {
            if (this.isAnimating) {
                this.pauseAnimation();
                document.getElementById('toggle-animation').textContent = 'Resume Animation';
            } else {
                this.resumeAnimation();
                document.getElementById('toggle-animation').textContent = 'Pause Animation';
            }
        });
    }

    // Pause animation
    pauseAnimation() {
        if (!this.isAnimating) return;
        this.isAnimating = false;
        clearInterval(this.animationInterval);
        clearInterval(this.liveDataInterval);
    }

    // Resume animation
    resumeAnimation() {
        if (this.isAnimating) return;
        this.startAnimationCycle();
    }

    // Predict next candlestick movement
    predictNextCandlestick() {
        // Analyze historical data for patterns
        const trendStrength = this.dataGenerator.calculateTrendStrength(this.historicalData, 20);
        const volatility = this.dataGenerator.calculateVolatility(this.historicalData, 10);
        const momentum = this.dataGenerator.calculateMomentum(this.historicalData, 5);
        const rsi = this.dataGenerator.calculateRSI(this.historicalData, 14);
        
        // Calculate probabilities for different scenarios
        const bullishProbability = this.calculateBullishProbability(trendStrength, volatility, momentum, rsi);
        const bearishProbability = this.calculateBearishProbability(trendStrength, volatility, momentum, rsi);
        const sidewaysProbability = 1 - (bullishProbability + bearishProbability);
        
        // Update prediction display
        const predictionElement = document.getElementById('prediction-result');
        predictionElement.innerHTML = `
            <h3>AI Prediction</h3>
            <p class="prediction-text ${this.currentScenario}">
                Next Candlestick: <strong>${this.currentScenario.toUpperCase()}</strong>
            </p>
            <p>Confidence: ${(bullishProbability * 100).toFixed(1)}%</p>
            <div class="probability-bars">
                <div class="prob-bar">
                    <span>Bullish</span>
                    <div class="bar-container">
                        <div class="bar bullish" style="width: ${(bullishProbability * 100).toFixed(1)}%"></div>
                    </div>
                    <span>${(bullishProbability * 100).toFixed(1)}%</span>
                </div>
                <div class="prob-bar">
                    <span>Bearish</span>
                    <div class="bar-container">
                        <div class="bar bearish" style="width: ${(bearishProbability * 100).toFixed(1)}%"></div>
                    </div>
                    <span>${(bearishProbability * 100).toFixed(1)}%</span>
                </div>
                <div class="prob-bar">
                    <span>Sideways</span>
                    <div class="bar-container">
                        <div class="bar sideways" style="width: ${(sidewaysProbability * 100).toFixed(1)}%"></div>
                    </div>
                    <span>${(sidewaysProbability * 100).toFixed(1)}%</span>
                </div>
            </div>
        `;
        
        return {
            prediction: this.currentScenario,
            confidence: bullishProbability,
            probabilities: {
                bullish: bullishProbability,
                bearish: bearishProbability,
                sideways: sidewaysProbability
            }
        };
    }
    
    // Force a prediction cycle manually
    forcePredictionCycle() {
        try {
            console.log('Forcing prediction cycle...');
            
            // Fade out prediction panel
            const predictionPanel = document.getElementById('prediction-chart');
            if (predictionPanel) {
                gsap.to(predictionPanel, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        // Only update bullish prediction
                        this.predictionData['bullish'] = this.dataGenerator.generatePredictions(this.currentData, this.historicalData)['bullish'];
                        
                        // Make prediction
                        const prediction = this.predictNextCandlestick();
                        console.log('Prediction result:', prediction);
                        
                        // Render prediction chart
                        this.charts.prediction = this.chartRenderer.renderPredictionChart(
                            this.predictionData['bullish'],
                            'prediction-chart',
                            'bullish'
                        );
                        
                        // Add sparkle effect
                        this.addSparkleEffect();
                        
                        // Fade in prediction panel
                        gsap.to(predictionPanel, {
                            opacity: 1,
                            duration: 0.5
                        });
                    }
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error forcing prediction cycle:', error);
            return false;
        }
    }
    
    // Update current candle with new data
    updateCurrentCandle() {
        try {
            // Update current candle with small random changes
            this.currentData = this.dataGenerator.updateCurrentCandle(this.currentData);
            
            // Re-render current chart
            this.charts.current = this.chartRenderer.renderCurrentChart(
                this.currentData, 
                'current-panel'
            );
            
            console.log('Current candle updated');
            return true;
        } catch (error) {
            console.error('Error updating current candle:', error);
            return false;
        }
    }

    // Calculate bullish probability
    calculateBullishProbability(trendStrength, volatility, momentum, rsi) {
        let probability = 0.33; // Base probability
        
        // Adjust based on trend strength (positive trend strength increases bullish probability)
        probability += trendStrength * 0.2;
        
        // Adjust based on momentum (positive momentum increases bullish probability)
        probability += momentum * 0.15;
        
        // Adjust based on RSI (oversold conditions increase bullish probability)
        if (rsi < 30) {
            probability += 0.15; // Oversold condition
        } else if (rsi > 70) {
            probability -= 0.15; // Overbought condition
        }
        
        // Adjust based on volatility (high volatility slightly reduces certainty)
        probability -= volatility * 0.05;
        
        // Ensure probability is between 0 and 1
        return Math.max(0, Math.min(0.8, probability));
    }

    // Calculate bearish probability
    calculateBearishProbability(trendStrength, volatility, momentum, rsi) {
        let probability = 0.33; // Base probability
        
        // Adjust based on trend strength (negative trend strength increases bearish probability)
        probability -= trendStrength * 0.2;
        
        // Adjust based on momentum (negative momentum increases bearish probability)
        probability -= momentum * 0.15;
        
        // Adjust based on RSI (overbought conditions increase bearish probability)
        if (rsi > 70) {
            probability += 0.15; // Overbought condition
        } else if (rsi < 30) {
            probability -= 0.15; // Oversold condition
        }
        
        // Adjust based on volatility (high volatility slightly increases bearish probability)
        probability += volatility * 0.05;
        
        // Ensure probability is between 0 and 1
        return Math.max(0, Math.min(0.8, probability));
    }
}

// Export for use in other modules
window.AnimationController = AnimationController;