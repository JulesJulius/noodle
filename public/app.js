if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

// Ensure full screen and prevent scrolling
function resizeHandler() {
    document.documentElement.style.height = window.innerHeight + 'px';
    document.body.style.height = window.innerHeight + 'px';
}

window.addEventListener('resize', resizeHandler);
window.addEventListener('orientationchange', resizeHandler);

// Initial resize to lock body
resizeHandler();

// Prevent pinch zoom
document.addEventListener('touchmove', function(event) {
    if (event.scale !== 1) {
        event.preventDefault();
    }
}, { passive: false });
