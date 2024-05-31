document.addEventListener('DOMContentLoaded', (event) => {
    const touchArea = document.getElementById('touchArea');
    const demoSquare = document.getElementById('demoSquare');
    const fingers = {
        0: document.getElementById('finger1'),
        1: document.getElementById('finger2'),
        2: document.getElementById('finger3'),
        3: document.getElementById('finger4'),
        4: document.getElementById('finger5')
    };
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    const crosshairHorizontal = document.getElementById('crosshairHorizontal');
    const crosshairVertical = document.getElementById('crosshairVertical');
    const touchCircle = document.getElementById('touchCircle');

    let initialDistance = null;
    let initialRadius = null;
    let initialMidpoint = null;
    let initialAngles = null;

    let temporaryScale = 1;
    let temporaryRotation = 0;
    let temporaryOffset = [0, 0];
    let crosshairRed = false;
    let lastOffset = [0, 0];

    function calculateMidpoint(touches) {
        const midX = Array.from(touches).reduce((sum, touch) => sum + touch.clientX, 0) / touches.length;
        const midY = Array.from(touches).reduce((sum, touch) => sum + touch.clientY, 0) / touches.length;
        return { midX, midY };
    }

    function calculateDistances(touches, midpoint) {
        return Array.from(touches).map(touch => Math.hypot(touch.clientX - midpoint.midX, touch.clientY - midpoint.midY));
    }

    function calculateAngles(touches, midpoint) {
        return Array.from(touches).map(touch => Math.atan2(touch.clientY - midpoint.midY, touch.clientX - midpoint.midX));
    }

    function updateCircles(touches) {
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const finger = fingers[i];
            if (finger) {
                finger.setAttribute('cx', touch.clientX);
                finger.setAttribute('cy', touch.clientY);
            }
        }
    }

    function fireGrabEvent(midpoint) {
        const event = new CustomEvent('grab', { detail: { x: midpoint.midX, y: midpoint.midY } });
        touchArea.dispatchEvent(event);
    }

    function fireReleaseEvent() {
        const event = new CustomEvent('release');
        touchArea.dispatchEvent(event);
    }

    function updateLinesAndCrosshair(touches) {
        if (touches.length === 2) {
            const touch1 = touches[0];
            const touch2 = touches[1];

            const midpoint = calculateMidpoint(touches);
            const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

            if (initialDistance === null || distance > initialDistance) {
                initialDistance = distance;
            }

            if (distance < (2 / 3) * initialDistance) {
                if (!crosshairRed) {
                    crosshairRed = true;
                    crosshairHorizontal.setAttribute('stroke', 'red');
                    crosshairVertical.setAttribute('stroke', 'red');
                    fireGrabEvent(midpoint);
                }
            } else {
                if (crosshairRed) {
                    crosshairRed = false;
                    crosshairHorizontal.setAttribute('stroke', 'darkgray');
                    crosshairVertical.setAttribute('stroke', 'darkgray');
                    fireReleaseEvent();
                }
            }

            const gap = 10; // Small gap between the lines

            const line1EndX = midpoint.midX - (midpoint.midX - touch1.clientX) * gap / distance;
            const line1EndY = midpoint.midY - (midpoint.midY - touch1.clientY) * gap / distance;

            const line2EndX = midpoint.midX - (midpoint.midX - touch2.clientX) * gap / distance;
            const line2EndY = midpoint.midY - (midpoint.midY - touch2.clientY) * gap / distance;

            line1.setAttribute('x1', touch1.clientX);
            line1.setAttribute('y1', touch1.clientY);
            line1.setAttribute('x2', line1EndX);
            line1.setAttribute('y2', line1EndY);
            line1.style.visibility = 'visible';

            line2.setAttribute('x1', touch2.clientX);
            line2.setAttribute('y1', touch2.clientY);
            line2.setAttribute('x2', line2EndX);
            line2.setAttribute('y2', line2EndY);
            line2.style.visibility = 'visible';

            crosshairHorizontal.setAttribute('x1', midpoint.midX - 5);
            crosshairHorizontal.setAttribute('y1', midpoint.midY);
            crosshairHorizontal.setAttribute('x2', midpoint.midX + 5);
            crosshairHorizontal.setAttribute('y2', midpoint.midY);
            crosshairHorizontal.style.visibility = 'visible';

            crosshairVertical.setAttribute('x1', midpoint.midX);
            crosshairVertical.setAttribute('y1', midpoint.midY - 5);
            crosshairVertical.setAttribute('x2', midpoint.midX);
            crosshairVertical.setAttribute('y2', midpoint.midY + 5);
            crosshairVertical.style.visibility = 'visible';

            touchCircle.style.visibility = 'hidden';

            // Update temporary variables
            if (initialMidpoint === null) {
                initialMidpoint = midpoint;
            }
            if (initialAngles === null) {
                initialAngles = calculateAngles(touches, initialMidpoint);
            }

            const currentAngles = calculateAngles(touches, midpoint);
            const angleDiff = currentAngles.map((angle, i) => angle - initialAngles[i]);
            temporaryRotation = angleDiff.reduce((sum, diff) => sum + diff, 0) / angleDiff.length;

            const currentDistances = calculateDistances(touches, midpoint);
            temporaryScale = currentDistances.reduce((sum, dist) => sum + dist, 0) / currentDistances.length / initialDistance;

            temporaryOffset = [midpoint.midX - initialMidpoint.midX, midpoint.midY - initialMidpoint.midY];

            // Apply temporary offset to grabbed elements
            const grabbedElements = document.querySelectorAll('[state="grabbed"]');
            grabbedElements.forEach(element => {
                const x = parseFloat(element.getAttribute('x')) || 0;
                const y = parseFloat(element.getAttribute('y')) || 0;
                element.setAttribute('x', x + temporaryOffset[0] - lastOffset[0]);
                element.setAttribute('y', y + temporaryOffset[1] - lastOffset[1]);
            });

            lastOffset = [...temporaryOffset];
        } else {
            line1.style.visibility = 'hidden';
            line2.style.visibility = 'hidden';
            crosshairHorizontal.style.visibility = 'hidden';
            crosshairVertical.style.visibility = 'hidden';
        }
    }

    function updateCircle(touches) {
        if (touches.length === 3) {
            const midpoint = calculateMidpoint(touches);
            const distances = calculateDistances(touches, midpoint);
            const radius = Math.max(...distances);

            if (initialRadius === null || radius > initialRadius) {
                initialRadius = radius;
            }

            if (radius < (2 / 3) * initialRadius) {
                touchCircle.setAttribute('stroke', 'red');
            } else {
                touchCircle.setAttribute('stroke', 'darkgray');
            }

            touchCircle.setAttribute('cx', midpoint.midX);
            touchCircle.setAttribute('cy', midpoint.midY);
            touchCircle.setAttribute('r', radius);
            touchCircle.style.visibility = 'visible';

            line1.style.visibility = 'hidden';
            line2.style.visibility = 'hidden';
            crosshairHorizontal.style.visibility = 'hidden';
            crosshairVertical.style.visibility = 'hidden';

            // Update temporary variables
            if (initialMidpoint === null) {
                initialMidpoint = midpoint;
            }
            if (initialRadius === null) {
                initialRadius = radius;
            }

            const currentDistances = calculateDistances(touches, midpoint);
            temporaryScale = currentDistances.reduce((sum, dist) => sum + dist, 0) / currentDistances.length / initialRadius;

            temporaryOffset = [midpoint.midX - initialMidpoint.midX, midpoint.midY - initialMidpoint.midY];
        } else {
            touchCircle.style.visibility = 'hidden';
        }
    }

    touchArea.addEventListener('touchstart', (event) => {
        event.preventDefault();
        updateCircles(event.touches);
        updateLinesAndCrosshair(event.touches);
        updateCircle(event.touches);
    });

    touchArea.addEventListener('touchmove', (event) => {
        event.preventDefault();
        updateCircles(event.touches);
        updateLinesAndCrosshair(event.touches);
        updateCircle(event.touches);
    });

    touchArea.addEventListener('touchend', (event) => {
        event.preventDefault();
        updateCircles(event.touches);
        updateLinesAndCrosshair(event.touches);
        updateCircle(event.touches);

        // Reset initial distances and angles when touch ends
        if (event.touches.length < 2) {
            initialDistance = null;
            initialMidpoint = null;
            initialAngles = null;
            crosshairRed = false;
            fireReleaseEvent();
            lastOffset = [0, 0];
        }

        if (event.touches.length < 3) {
            initialRadius = null;
        }
    });

    // Event listeners for custom 'grab' and 'release' events
    touchArea.addEventListener('grab', (event) => {
        const { x, y } = event.detail;
        const rect = demoSquare.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            demoSquare.setAttribute('state', 'grabbed');
        }
    });

    touchArea.addEventListener('release', () => {
        const grabbedElements = document.querySelectorAll('[state="grabbed"]');
        grabbedElements.forEach(element => {
            element.removeAttribute('state');
        });
    });
});
