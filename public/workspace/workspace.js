let initialX = 0;
let initialY = 0;
let initialScale = 1;
let initialRotate = 0;
let scale = 1;
let rotate = 0;
let startX = 0;
let startY = 0;
let initialDistance = 0;
let initialAngle = 0;
let lastCenterX = 0;
let lastCenterY = 0;

const panZoomRotate = document.getElementById('pan-zoom-rotate');

function getCenter(touches) {
    return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
    };
}

function handleGestureStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        startX = event.touches[0].clientX - initialX;
        startY = event.touches[0].clientY - initialY;
    } else if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        initialScale = scale;
        initialRotate = rotate;

        const center = getCenter(event.touches);
        lastCenterX = center.x;
        lastCenterY = center.y;

        // Set transform origin to the midpoint
        panZoomRotate.style.transformOrigin = `${center.x - panZoomRotate.offsetLeft}px ${center.y - panZoomRotate.offsetTop}px`;
    }
}

function handleGestureMove(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        initialX = event.touches[0].clientX - startX;
        initialY = event.touches[0].clientY - startY;
    } else if (event.touches.length === 2) {
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        scale = initialScale * (distance / initialDistance);
        rotate = initialRotate + (angle - initialAngle);

        const center = getCenter(event.touches);
        initialX += (center.x - lastCenterX);
        initialY += (center.y - lastCenterY);
        lastCenterX = center.x;
        lastCenterY = center.y;

        // Update transform origin to the new midpoint
        panZoomRotate.style.transformOrigin = `${center.x - panZoomRotate.offsetLeft}px ${center.y - panZoomRotate.offsetTop}px`;
    }
    updateTransform();
}

function handleGestureEnd(event) {
    if (event.touches.length === 0) {
        startX = initialX;
        startY = initialY;
    } else if (event.touches.length === 1) {
        // When one finger is lifted off, reset the transform origin to the center
        const center = getCenter(event.touches);
        panZoomRotate.style.transformOrigin = `${center.x - panZoomRotate.offsetLeft}px ${center.y - panZoomRotate.offsetTop}px`;
    }
}

function updateTransform() {
    panZoomRotate.style.transform = `translate(${initialX}px, ${initialY}px) scale(${scale}) rotate(${rotate}deg)`;
}

document.addEventListener('touchstart', handleGestureStart, { passive: false });
document.addEventListener('touchmove', handleGestureMove, { passive: false });
document.addEventListener('touchend', handleGestureEnd, { passive: false });
