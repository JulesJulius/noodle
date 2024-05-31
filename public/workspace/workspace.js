import {
    calculateMidpoint,
    calculateDistances,
    calculateAngles,
    fireGrabEvent,
    fireReleaseEvent,
    updateCircles,
    updateLinesAndCrosshair,
    updateCircle
} from './utils.js';

const workspace = {
    initialDistance: null,
    initialRadius: null,
    initialMidpoint: null,
    initialAngles: null,

    temporaryScale: 1,
    temporaryRotation: 0,
    temporaryOffset: [0, 0],
    crosshairRed: false,
    lastOffset: [0, 0]
};

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

    const lines = { line1, line2, crosshairHorizontal, crosshairVertical };

    touchArea.addEventListener('touchstart', (event) => {
        event.preventDefault();
        updateCircles(event.touches, fingers);
        updateLinesAndCrosshair(event.touches, fingers, lines, crosshairHorizontal, touchCircle, workspace, touchArea);
        updateCircle(event.touches, touchCircle, lines, workspace);
    });

    touchArea.addEventListener('touchmove', (event) => {
        event.preventDefault();
        updateCircles(event.touches, fingers);
        updateLinesAndCrosshair(event.touches, fingers, lines, crosshairHorizontal, touchCircle, workspace, touchArea);
        updateCircle(event.touches, touchCircle, lines, workspace);
    });

    touchArea.addEventListener('touchend', (event) => {
        event.preventDefault();
        updateCircles(event.touches, fingers);
        updateLinesAndCrosshair(event.touches, fingers, lines, crosshairHorizontal, touchCircle, workspace, touchArea);
        updateCircle(event.touches, touchCircle, lines, workspace);

        // Reset initial distances and angles when touch ends
        if (event.touches.length < 2) {
            workspace.initialDistance = null;
            workspace.initialMidpoint = null;
            workspace.initialAngles = null;
            workspace.crosshairRed = false;
            fireReleaseEvent(touchArea);
            workspace.lastOffset = [0, 0];
        }

        if (event.touches.length < 3) {
            workspace.initialRadius = null;
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
