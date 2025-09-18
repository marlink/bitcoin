// Main JavaScript file for Trading Animation

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    initializeAnimation();
});

// Check if all required scripts are loaded
function checkRequiredScripts() {
    const requiredClasses = [
        { name: 'TradingDataGenerator', global: window.TradingDataGenerator },
        { name: 'ChartRenderer', global: window.ChartRenderer },
        { name: 'AnimationController', global: window.AnimationController }
    ];
    
    const missingClasses = requiredClasses.filter(cls => !cls.global);
    
    if (missingClasses.length > 0) {
        const errorMessage = `Missing required classes: ${missingClasses.map(c => c.name).join(', ')}. Check console for details.`;
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }
    
    // Check if D3.js is loaded
    if (typeof d3 === 'undefined') {
        const errorMessage = 'D3.js library is not loaded. Check your internet connection.';
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }
    
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        const errorMessage = 'GSAP library is not loaded. Check your internet connection.';
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }
    
    return { success: true };
}

// Initialize the trading animation
async function initializeAnimation() {
    try {
        // Create loading indicator
        showLoadingIndicator();
        
        // Check if all required scripts are loaded
        const scriptsCheck = checkRequiredScripts();
        if (!scriptsCheck.success) {
            throw new Error(scriptsCheck.message);
        }

        const dataGenerator = new TradingDataGenerator();
        // Try to fetch real Bitcoin data
        let historicalData = await dataGenerator.fetchBitcoinHistoricalData(90);
        let currentCandle = await dataGenerator.fetchCurrentBitcoinCandle();
        if (!historicalData) historicalData = dataGenerator.generateHistoricalData(90);
        if (!currentCandle) currentCandle = dataGenerator.generateCurrentCandle();
        // Set real data for generator
        dataGenerator.historicalDataOverride = historicalData;
        dataGenerator.currentCandleOverride = currentCandle;
        const chartRenderer = new ChartRenderer();
        const animationController = new AnimationController(dataGenerator, chartRenderer);
        animationController.historicalData = historicalData;
        animationController.currentData = currentCandle;
        // Initialize animation
        await animationController.initialize();
        
        // Store animation controller in window for debugging
        window.animationController = animationController;

        // Hide loading indicator
        hideLoadingIndicator();

        // Add event listeners for UI controls
        setupUIControls(animationController);

        // Log success message
        console.log('Trading animation initialized successfully');
        
        return animationController;
    } catch (error) {
        // Handle initialization errors
        console.error('Error initializing trading animation:', error);
        showErrorMessage('Failed to initialize animation: ' + error.message);
        if (typeof logErrorToStorage === 'function') {
            logErrorToStorage(error);
        }
        return null;
    }
}

// Show loading indicator
function showLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-indicator';
    loadingElement.innerHTML = `
        <div class="spinner"></div>
        <p>Initializing Trading Animation...</p>
    `;
    document.body.appendChild(loadingElement);
}

// Hide loading indicator
function hideLoadingIndicator() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement) {
        loadingElement.classList.add('fade-out');
        setTimeout(() => {
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
        }, 500);
    }
}

// Show error message
function showErrorMessage(message) {
    hideLoadingIndicator();
    
    const errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.innerHTML = `
        <div class="error-icon">⚠️</div>
        <p>${message}</p>
        <button id="retry-button">Retry</button>
    `;
    document.body.appendChild(errorElement);
    
    // Add retry button event listener
    document.getElementById('retry-button').addEventListener('click', () => {
        errorElement.parentNode.removeChild(errorElement);
        initializeAnimation();
    });
}

// Setup UI controls
function setupUIControls(animationController) {
    // Fullscreen toggle
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
                fullscreenToggle.textContent = 'Exit Fullscreen';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fullscreenToggle.textContent = 'Enter Fullscreen';
                }
            }
        });
    }
    
    // Manual trigger button
    const manualTriggerBtn = document.getElementById('manual-trigger');
    if (manualTriggerBtn) {
        manualTriggerBtn.addEventListener('click', async () => {
            try {
                // Disable button temporarily
                manualTriggerBtn.disabled = true;
                manualTriggerBtn.textContent = 'Processing...';
                
                // Clear any existing error messages
                const errorElements = document.querySelectorAll('.error-message, .error-display');
                errorElements.forEach(el => {
                    if (el.parentNode) {
                        el.textContent = '';
                    }
                });
                
                // Get the animation controller from window or re-initialize if needed
                let animationController = window.animationController;
                
                if (!animationController || !animationController.isInitialized) {
                    console.log('Animation controller not found or not initialized, reinitializing...');
                    animationController = await initializeAnimation();
                }
                
                if (animationController) {
                    // Force a prediction cycle
                    const predictionSuccess = animationController.forcePredictionCycle();
                    
                    // Update current candle
                    const updateSuccess = animationController.updateCurrentCandle();
                    
                    if (predictionSuccess && updateSuccess) {
                        // Show success message
                        const successMsg = document.createElement('div');
                        successMsg.className = 'success-message';
                        successMsg.textContent = 'Prediction cycle triggered successfully!';
                        document.body.appendChild(successMsg);
                        
                        // Remove success message after 3 seconds
                        setTimeout(() => {
                            if (successMsg.parentNode) {
                                successMsg.parentNode.removeChild(successMsg);
                            }
                        }, 3000);
                    } else {
                        throw new Error('Failed to complete prediction cycle');
                    }
                } else {
                    throw new Error('Failed to initialize animation controller');
                }
            } catch (error) {
                console.error('Error manually triggering animation:', error);
                
                // Show error message
                const errorDisplay = document.querySelector('.error-display') || document.createElement('div');
                if (!errorDisplay.parentNode) {
                    errorDisplay.className = 'error-display';
                    document.body.appendChild(errorDisplay);
                }
                errorDisplay.textContent = `Failed to trigger prediction: ${error.message}`;
                
                // Log error to storage
                if (typeof logErrorToStorage === 'function') {
                    logErrorToStorage(error);
                }
            } finally {
                // Re-enable button
                setTimeout(() => {
                    manualTriggerBtn.disabled = false;
                    manualTriggerBtn.textContent = 'Manually Trigger Animation';
                }, 1000); // Small delay to prevent rapid clicking
            }
        });
    }

    // Add responsive behavior
    window.addEventListener('resize', debounce(() => {
        // Re-render charts on window resize
        animationController.renderCharts();
    }, 250));
}

// Debounce function to limit frequent function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add visual effects
function addVisualEffects() {
    // Add subtle background animation
    const canvas = document.createElement('canvas');
    canvas.id = 'background-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            color: `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 155) + 100}, 0.5)`,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25
        });
    }

    // Animate particles
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();

            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        });

        requestAnimationFrame(animateParticles);
    }

    // Start animation
    animateParticles();

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Call visual effects function after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addVisualEffects();
});