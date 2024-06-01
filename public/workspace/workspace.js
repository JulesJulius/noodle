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

window.globalVars = {
    initialDistance: null,
    initialRadius: null,
    initialMidpoint: null,
    initialAngles: null,

    temporaryScale: 1,
    temporaryRotation: 0,
    temporaryOffset: [0, 0],
    crosshairRed: false,
    lastOffset: [0, 0],
    selectedNode: null
};

document.addEventListener('DOMContentLoaded', (event) => {
    const touchArea = document.getElementById('touchArea');
    const demoSquare = document.getElementById('demoSquare');
    const nodes = document.querySelectorAll('.node');
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

    function updateNodePositions() {
        const grabbedElements = document.querySelectorAll('[state="grabbed"]');
        grabbedElements.forEach(grabbedNode => {
            const x = parseFloat(grabbedNode.getAttribute('cx')) || 0;
            const y = parseFloat(grabbedNode.getAttribute('cy')) || 0;
            const r = parseFloat(grabbedNode.getAttribute('r')) || 0;
            const newX = x + globalVars.temporaryOffset[0] - globalVars.lastOffset[0];
            const newY = y + globalVars.temporaryOffset[1] - globalVars.lastOffset[1];

            // Update the grabbed node position
            grabbedNode.setAttribute('cx', newX);
            grabbedNode.setAttribute('cy', newY);

            // Prevent overlap with other nodes
            nodes.forEach(node => {
                if (node !== grabbedNode) {
                    const nodeX = parseFloat(node.getAttribute('cx')) || 0;
                    const nodeY = parseFloat(node.getAttribute('cy')) || 0;
                    const nodeR = parseFloat(node.getAttribute('r')) || 0;

                    const dx = nodeX - newX;
                    const dy = nodeY - newY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < r + nodeR) {
                        const angle = Math.atan2(dy, dx);
                        const overlap = r + nodeR - distance;

                        const moveX = overlap * Math.cos(angle);
                        const moveY = overlap * Math.sin(angle);

                        node.setAttribute('cx', nodeX + moveX);
                        node.setAttribute('cy', nodeY + moveY);
                    }
                }
            });
        });
    }

    function selectNode(x, y) {
        nodes.forEach(node => {
            const cx = parseFloat(node.getAttribute('cx')) || 0;
            const cy = parseFloat(node.getAttribute('cy')) || 0;
            const r = parseFloat(node.getAttribute('r')) || 0;
            if (x >= cx - r && x <= cx + r && y >= cy - r && y <= cy + r) {
                if (globalVars.selectedNode) {
                    globalVars.selectedNode.setAttribute('stroke', 'none');
                }
                node.setAttribute('stroke', 'lightblue');
                globalVars.selectedNode = node;
            }
        });
    }

    touchArea.addEventListener('touchstart', (event) => {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            selectNode(touch.clientX, touch.clientY);
        }
        updateCircles(event.touches, fingers, nodes);
        updateLinesAndCrosshair(event.touches, fingers, lines, crosshairHorizontal, touchCircle, globalVars, touchArea, nodes);
        updateCircle(event.touches, touchCircle, lines, globalVars, nodes);
        updateNodePositions();
    });

    touchArea.addEventListener('touchmove', (event) => {
        event.preventDefault();
        updateCircles(event.touches, fingers, nodes);
        updateLinesAndCrosshair(event.touches, fingers, lines, crosshairHorizontal, touchCircle, globalVars, touchArea, nodes);
        updateCircle(event.touches, touchCircle, lines, globalVars, nodes);
        updateNodePositions();
    });

    touchArea.addEventListener('touchend', (event) => {
        event.preventDefault();
        updateCircles(event.touches, fingers, nodes);
        updateLinesAndCrosshair(event.touches, fingers, lines, crosshairHorizontal, touchCircle, globalVars, touchArea, nodes);
        updateCircle(event.touches, touchCircle, lines, globalVars, nodes);
        updateNodePositions();

        // Reset initial distances and angles when touch ends
        if (event.touches.length < 2) {
            globalVars.initialDistance = null;
            globalVars.initialMidpoint = null;
            globalVars.initialAngles = null;
            globalVars.crosshairRed = false;
            fireReleaseEvent(touchArea);
            globalVars.lastOffset = [0, 0];
        }

        if (event.touches.length < 3) {
            globalVars.initialRadius = null;
        }
    });

    // Event listeners for custom 'grab' and 'release' events
    touchArea.addEventListener('grab', (event) => {
        const { x, y } = event.detail;
        const rect = demoSquare.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            demoSquare.setAttribute('state', 'grabbed');
        }

        nodes.forEach(node => {
            const cx = parseFloat(node.getAttribute('cx')) || 0;
            const cy = parseFloat(node.getAttribute('cy')) || 0;
            const r = parseFloat(node.getAttribute('r')) || 0;
            if (x >= cx - r && x <= cx + r && y >= cy - r && y <= cy + r) {
                node.setAttribute('state', 'grabbed');
            }
        });
    });

    touchArea.addEventListener('release', () => {
        const grabbedElements = document.querySelectorAll('[state="grabbed"]');
        grabbedElements.forEach(element => {
            element.removeAttribute('state');
        });
    });
});
