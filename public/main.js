let grid = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];
const size = 500;
const third = size / 3;
const diameterX = 0.80 * third;
const diameterO = 0.70 * third;

let current_turn = false;
let player_symbol = 'o';

function setup() {
    createCanvas(size,size);
}

function getCellX(x) {
    return Math.floor(x / third);
}

function getCellY(y) {
    return Math.floor(y / third);
}

function draw() {
    background(255);
    stroke(200);
    strokeWeight(1);
    line(third, 0, third, size);
    line(2*third, 0, 2*third, size);
    line(0, third, size, third);
    line(0, 2*third, size, 2*third);
    strokeWeight(20);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i][j] == ' ') {
                continue;
            }
            if (grid[i][j] == 'x') {
                stroke(199, 207, 252);
                const currentX = j * third;
                const currentY = i * third;
                const gap = third - diameterX;
                line(currentX + gap, currentY + gap, currentX + diameterX, currentY + diameterX);
                line(currentX + diameterX, currentY + gap, currentX + gap, currentY + diameterX);
            } else {
                stroke(242, 171, 165);
                ellipse(j * third + third / 2, i * third + third / 2, diameterO, diameterO);
            }
        }
    }
    if (current_turn) {
        noStroke();
        const cellX = getCellX(mouseX);
        const cellY = getCellY(mouseY);
        fill(0, 0, 0, 2);
        rect(cellX * third, cellY * third, third, third);
    }
}

function mousePressed() {
    if (current_turn) {
        const cellX = getCellX(mouseX);
        const cellY = getCellY(mouseY);
        if (grid[cellY][cellX] == ' ') {
            io.on('turn', (cellX, cellY));
            // broadcast finished move
        }
    }
}

let game_in_progress = false;

const socket = io();

document.getElementById("create-room-button").addEventListener('click', () => {
    socket.emit('create-room');
});

document.getElementById("join-room-button").addEventListener('click', () => {
    socket.emit('join-room', document.getElementById('join-room-field').value);
});

socket.on('error', (msg) => {
    // display error message
});

socket.on('game-update', ({x, o, spectators, grid, current_turn, code}) => {
    
});

socket.on('grid', (new_grid) => {
    grid = new_grid;
});