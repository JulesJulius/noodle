// utils.js

export function calculateMidpoint(touches) {
    const midX = Array.from(touches).reduce((sum, touch) => sum + touch.clientX, 0) / touches.length;
    const midY = Array.from(touches).reduce((sum, touch) => sum + touch.clientY, 0) / touches.length;
    return { midX, midY };
}

export function calculateDistances(touches, midpoint) {
    return Array.from(touches).map(touch => Math.hypot(touch.clientX - midpoint.midX, touch.clientY - midpoint.midY));
}

export function calculateAngles(touches, midpoint) {
    return Array.from(touches).map(touch => Math.atan2(touch.clientY - midpoint.midY, touch.clientX - midpoint.midX));
}

export function fireGrabEvent(midpoint, touchArea) {
    const event = new CustomEvent('grab', { detail: { x: midpoint.midX, y: midpoint.midY } });
    touchArea.dispatchEvent(event);
}

export function fireReleaseEvent(touchArea) {
    const event = new CustomEvent('release');
    touchArea.dispatchEvent(event);
}

export function updateCircles(touches, fingers, nodes) {
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const finger = fingers[i];
        if (finger) {
            finger.setAttribute('cx', touch.clientX);
            finger.setAttribute('cy', touch.clientY);
        }
    }

    nodes.forEach(node => {
        const state = node.getAttribute('state');
        if (state === 'grabbed') {
            const x = parseFloat(node.getAttribute('cx')) || 0;
            const y = parseFloat(node.getAttribute('cy')) || 0;
            node.setAttribute('cx', x + globalVars.temporaryOffset[0] - globalVars.lastOffset[0]);
            node.setAttribute('cy', y + globalVars.temporaryOffset[1] - globalVars.lastOffset[1]);
        }
    });
}

export function updateLinesAndCrosshair(touches, fingers, lines, crosshair, touchCircle, globalVars, touchArea, nodes) {
    const { line1, line2, crosshairHorizontal, crosshairVertical } = lines;
    if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];

        const midpoint = calculateMidpoint(touches);
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        if (globalVars.initialDistance === null || distance > globalVars.initialDistance) {
            globalVars.initialDistance = distance;
        }

        if (distance < (2 / 3) * globalVars.initialDistance) {
            if (!globalVars.crosshairRed) {
                globalVars.crosshairRed = true;
                crosshairHorizontal.setAttribute('stroke', 'red');
                crosshairVertical.setAttribute('stroke', 'red');
                fireGrabEvent(midpoint, touchArea);
            }
        } else {
            if (globalVars.crosshairRed) {
                globalVars.crosshairRed = false;
                crosshairHorizontal.setAttribute('stroke', 'darkgray');
                crosshairVertical.setAttribute('stroke', 'darkgray');
                fireReleaseEvent(touchArea);
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
        if (globalVars.initialMidpoint === null) {
            globalVars.initialMidpoint = midpoint;
        }
        if (globalVars.initialAngles === null) {
            globalVars.initialAngles = calculateAngles(touches, globalVars.initialMidpoint);
        }

        const currentAngles = calculateAngles(touches, midpoint);
        const angleDiff = currentAngles.map((angle, i) => angle - globalVars.initialAngles[i]);
        globalVars.temporaryRotation = angleDiff.reduce((sum, diff) => sum + diff, 0) / angleDiff.length;

        const currentDistances = calculateDistances(touches, midpoint);
        globalVars.temporaryScale = currentDistances.reduce((sum, dist) => sum + dist, 0) / currentDistances.length / globalVars.initialDistance;

        globalVars.temporaryOffset = [midpoint.midX - globalVars.initialMidpoint.midX, midpoint.midY - globalVars.initialMidpoint.midY];

        // Apply temporary offset to grabbed elements
        const grabbedElements = document.querySelectorAll('[state="grabbed"]');
        grabbedElements.forEach(element => {
            const x = parseFloat(element.getAttribute('cx') || element.getAttribute('x')) || 0;
            const y = parseFloat(element.getAttribute('cy') || element.getAttribute('y')) || 0;
            element.setAttribute('cx', x + globalVars.temporaryOffset[0] - globalVars.lastOffset[0]);
            element.setAttribute('cy', y + globalVars.temporaryOffset[1] - globalVars.lastOffset[1]);
            element.setAttribute('x', x + globalVars.temporaryOffset[0] - globalVars.lastOffset[0]);
            element.setAttribute('y', y + globalVars.temporaryOffset[1] - globalVars.lastOffset[1]);
        });

        globalVars.lastOffset = [...globalVars.temporaryOffset];
    } else {
        line1.style.visibility = 'hidden';
        line2.style.visibility = 'hidden';
        crosshairHorizontal.style.visibility = 'hidden';
        crosshairVertical.style.visibility = 'hidden';
    }
}

export function updateCircle(touches, touchCircle, lines, globalVars, nodes) {
    const { line1, line2, crosshairHorizontal, crosshairVertical } = lines;
    if (touches.length === 3) {
        const midpoint = calculateMidpoint(touches);
        const distances = calculateDistances(touches, midpoint);
        const radius = Math.max(...distances);

        if (globalVars.initialRadius === null || radius > globalVars.initialRadius) {
            globalVars.initialRadius = radius;
        }

        if (radius < (2 / 3) * globalVars.initialRadius) {
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
        if (globalVars.initialMidpoint === null) {
            globalVars.initialMidpoint = midpoint;
        }
        if (globalVars.initialRadius === null) {
            globalVars.initialRadius = radius;
        }

        const currentDistances = calculateDistances(touches, midpoint);
        globalVars.temporaryScale = currentDistances.reduce((sum, dist) => sum + dist, 0) / currentDistances.length / globalVars.initialRadius;

        globalVars.temporaryOffset = [midpoint.midX - globalVars.initialMidpoint.midX, midpoint.midY - globalVars.initialMidpoint.midY];

        // Apply temporary offset to grabbed nodes
        nodes.forEach(node => {
            const state = node.getAttribute('state');
            if (state === 'grabbed') {
                const x = parseFloat(node.getAttribute('cx')) || 0;
                const y = parseFloat(node.getAttribute('cy')) || 0;
                node.setAttribute('cx', x + globalVars.temporaryOffset[0] - globalVars.lastOffset[0]);
                node.setAttribute('cy', y + globalVars.temporaryOffset[1] - globalVars.lastOffset[1]);
            }
        });

    } else {
        touchCircle.style.visibility = 'hidden';
    }
}
