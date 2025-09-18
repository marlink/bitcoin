// Debug script to help identify errors
console.log('Debug script loaded');

// Store errors for debugging
let errors = JSON.parse(localStorage.getItem('tradingAnimationErrors') || '[]');

// Function to log errors to localStorage
function logErrorToStorage(error) {
    // Create a serializable error object
    const errorObj = {
        message: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace available',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
    };
    
    // Add to errors array
    errors.push(errorObj);
    console.warn('Error logged:', errorObj);
    
    // Store in localStorage (limit to last 20 errors)
    if (errors.length > 20) errors = errors.slice(-20);
    localStorage.setItem('tradingAnimationErrors', JSON.stringify(errors));
}

// Make function available globally
window.logErrorToStorage = logErrorToStorage;

// Check for required libraries
function checkDependencies() {
    const requiredLibraries = [
        { name: 'D3.js', obj: window.d3 },
        { name: 'GSAP', obj: window.gsap },
        { name: 'TradingDataGenerator', obj: window.TradingDataGenerator },
        { name: 'ChartRenderer', obj: window.ChartRenderer },
        { name: 'AnimationController', obj: window.AnimationController }
    ];
    
    const missingLibraries = [];
    
    requiredLibraries.forEach(lib => {
        if (!lib.obj) {
            console.error(`Missing required library: ${lib.name}`);
            missingLibraries.push(lib.name);
            const errorDisplay = document.getElementById('error-display') || document.createElement('div');
            if (!errorDisplay.id) {
                errorDisplay.id = 'error-display';
                errorDisplay.className = 'error-display';
                document.body.appendChild(errorDisplay);
            }
            errorDisplay.innerHTML += `<div>Missing required library: ${lib.name}</div>`;
        } else {
            console.log(`Library loaded: ${lib.name}`);
        }
    });
    
    if (missingLibraries.length > 0) {
        const error = new Error(`Missing required libraries: ${missingLibraries.join(', ')}`);
        logErrorToStorage(error);
        return false;
    }
    
    return true;
}

// Check DOM elements
function checkDOMElements() {
    const requiredElements = [
        'historical-chart',
        'current-chart',
        'prediction-chart',
        'prediction-result',
        'toggle-animation'
    ];
    const missingElements = [];
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`Missing required DOM element: #${id}`);
            missingElements.push(id);
        }
    });
    if (missingElements.length > 0) {
        const error = new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
        logErrorToStorage(error);
        
        const errorDisplay = document.getElementById('error-display') || document.createElement('div');
        if (!errorDisplay.id) {
            errorDisplay.id = 'error-display';
            errorDisplay.className = 'error-display';
            document.body.appendChild(errorDisplay);
        }
        errorDisplay.innerHTML += `<div>Missing required DOM elements: ${missingElements.join(', ')}</div>`;
        
        return false;
    }
    
    return true;
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error || event.message);
    
    const errorObj = {
        message: event.message || 'Unknown error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
    };
    
    logErrorToStorage(errorObj);
    
    const errorDisplay = document.getElementById('error-display') || document.createElement('div');
    if (!errorDisplay.id) {
        errorDisplay.id = 'error-display';
        errorDisplay.className = 'error-display';
        document.body.appendChild(errorDisplay);
    }
    errorDisplay.innerHTML += `<div><strong>Error:</strong> ${event.message} at ${event.filename}:${event.lineno}:${event.colno}</div>`;
    
    return false; // Prevent default error handling
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    const errorObj = {
        message: event.reason ? (event.reason.message || 'Unhandled Promise Rejection') : 'Unhandled Promise Rejection',
        stack: event.reason ? event.reason.stack : 'No stack trace',
        timestamp: new Date().toISOString()
    };
    
    logErrorToStorage(errorObj);
    
    const errorDisplay = document.getElementById('error-display') || document.createElement('div');
    if (!errorDisplay.id) {
        errorDisplay.id = 'error-display';
        errorDisplay.className = 'error-display';
        document.body.appendChild(errorDisplay);
    }
    errorDisplay.innerHTML += `<div><strong>Promise Error:</strong> ${errorObj.message}</div>`;
    
    return false; // Prevent default error handling
});

// Run checks when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, running dependency checks...');
    checkDependencies();
    checkDOMElements();
});

// Add a function to test animation
window.testAnimation = function() {
    try {
        console.log('Testing animation...');
        
        // Check dependencies
        if (!checkDependencies()) {
            throw new Error('Missing required dependencies');
        }
        
        // Check DOM elements
        if (!checkDOMElements()) {
            throw new Error('Missing required DOM elements');
        }
        
        // Create test instances
        const dataGenerator = new TradingDataGenerator();
        const chartRenderer = new ChartRenderer();
        const animationController = new AnimationController(dataGenerator, chartRenderer);
        
        console.log('Test instances created successfully');
        
        // Initialize animation
        const result = animationController.initialize();
        
        console.log('Animation initialization result:', result);
        
        return 'Animation test completed';
    } catch (error) {
        console.error('Animation test failed:', error);
        logErrorToStorage(error);
        return `Animation test failed: ${error.message}`;
    }
};

console.log('Debug script fully loaded');