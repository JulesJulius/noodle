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

export function updateCircles(touches, fingers) {
    for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const finger = fingers[i];
        if (finger) {
            finger.setAttribute('cx', touch.clientX);
            finger.setAttribute('cy', touch.clientY);
        }
    }
}

export function updateLinesAndCrosshair(touches, fingers, lines, crosshair, touchCircle, workspace, touchArea) {
    const { line1, line2, crosshairHorizontal, crosshairVertical } = lines;
    if (touches.length === 2) {
        const touch1 = touches[0];
        const touch2 = touches[1];

        const midpoint = calculateMidpoint(touches);
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        if (workspace.initialDistance === null || distance > workspace.initialDistance) {
            workspace.initialDistance = distance;
        }

        if (distance < (2 / 3) * workspace.initialDistance) {
            if (!workspace.crosshairRed) {
                workspace.crosshairRed = true;
                crosshairHorizontal.setAttribute('stroke', 'red');
                crosshairVertical.setAttribute('stroke', 'red');
                fireGrabEvent(midpoint, touchArea);
            }
        } else {
            if (workspace.crosshairRed) {
                workspace.crosshairRed = false;
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
        if (workspace.initialMidpoint === null) {
            workspace.initialMidpoint = midpoint;
        }
        if (workspace.initialAngles === null) {
            workspace.initialAngles = calculateAngles(touches, workspace.initialMidpoint);
        }

        const currentAngles = calculateAngles(touches, midpoint);
        const angleDiff = currentAngles.map((angle, i) => angle - workspace.initialAngles[i]);
        workspace.temporaryRotation = angleDiff.reduce((sum, diff) => sum + diff, 0) / angleDiff.length;

        const currentDistances = calculateDistances(touches, midpoint);
        workspace.temporaryScale = currentDistances.reduce((sum, dist) => sum + dist, 0) / currentDistances.length / workspace.initialDistance;

        workspace.temporaryOffset = [midpoint.midX - workspace.initialMidpoint.midX, midpoint.midY - workspace.initialMidpoint.midY];

        // Apply temporary offset to grabbed elements
        const grabbedElements = document.querySelectorAll('[state="grabbed"]');
        grabbedElements.forEach(element => {
            const x = parseFloat(element.getAttribute('x')) || 0;
            const y = parseFloat(element.getAttribute('y')) || 0;
            element.setAttribute('x', x + workspace.temporaryOffset[0] - workspace.lastOffset[0]);
            element.setAttribute('y', y + workspace.temporaryOffset[1] - workspace.lastOffset[1]);
        });

        workspace.lastOffset = [...workspace.temporaryOffset];
    } else {
        line1.style.visibility = 'hidden';
        line2.style.visibility = 'hidden';
        crosshairHorizontal.style.visibility = 'hidden';
        crosshairVertical.style.visibility = 'hidden';
    }
}

export function updateCircle(touches, touchCircle, lines, workspace) {
    const { line1, line2, crosshairHorizontal, crosshairVertical } = lines;
    if (touches.length === 3) {
        const midpoint = calculateMidpoint(touches);
        const distances = calculateDistances(touches, midpoint);
        const radius = Math.max(...distances);

        if (workspace.initialRadius === null || radius > workspace.initialRadius) {
            workspace.initialRadius = radius;
        }

        if (radius < (2 / 3) * workspace.initialRadius) {
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
        if (workspace.initialMidpoint === null) {
            workspace.initialMidpoint = midpoint;
        }
        if (workspace.initialRadius === null) {
            workspace.initialRadius = radius;
        }

        const currentDistances = calculateDistances(touches, midpoint);
        workspace.temporaryScale = currentDistances.reduce((sum, dist) => sum + dist, 0) / currentDistances.length / workspace.initialRadius;

        workspace.temporaryOffset = [midpoint.midX - workspace.initialMidpoint.midX, midpoint.midY - workspace.initialMidpoint.midY];
    } else {
        touchCircle.style.visibility = 'hidden';
    }
}
