const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");

let createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};

const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;
let lives = 3;
let ghostCount = 4;
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

let fps = 25;
let pacman;
let oneBlockSize = 20;
let score = 0;
let ghosts = [];
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor = "black";

let generateRandomMap = () => {
    let rows = 23;
    let cols = 21;
    let map = [];
    for (let i = 0; i < rows; i++) {
        map.push([]);
        for (let j = 0; j < cols; j++) {
            if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
                map[i].push(1); // Borders
            } else {
                map[i].push(Math.random() < 0.2 ? 1 : 2); // Random walls and food
            }
        }
    }
    return map;
};

let map = generateRandomMap();

let resetMap = () => {
    map = generateRandomMap();
};

let randomTargetsForGhosts = [
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    {
        x: (map[0].length - 2) * oneBlockSize,
        y: (map.length - 2) * oneBlockSize,
    },
];

let createNewPacman = () => {
    pacman = new Pacman(
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5
    );
};

let gameLoop = () => {
    update();
    draw();
};

let restartPacmanAndGhosts = () => {
    createNewPacman();
    createGhosts();
};

let onGhostCollision = () => {
    lives--;
    if (lives <= 0) {
        clearInterval(gameInterval);
        let continuePlaying = confirm("¡Has perdido todas tus vidas! ¿Quieres seguir jugando?");
        if (continuePlaying) {
            lives = 3;
            score = 0;
            resetMap();
            restartPacmanAndGhosts();
            gameInterval = setInterval(gameLoop, 1000 / fps);
        } else {
            alert("¡Juego Terminado!");
        }
    } else {
        restartPacmanAndGhosts();
    }
};

let checkWinCondition = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === 2) {
                return false;
            }
        }
    }
    return true;
};

let update = () => {
    pacman.moveProcess();
    pacman.eat();
    updateGhosts();
    if (pacman.checkGhostCollision(ghosts)) {
        onGhostCollision();
    }
    if (checkWinCondition()) {
        clearInterval(gameInterval);
        alert("¡Felicidades! Has ganado el juego.");
    }
};

let drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2) {
                createRect(
                    j * oneBlockSize + oneBlockSize / 3,
                    i * oneBlockSize + oneBlockSize / 3,
                    oneBlockSize / 3,
                    oneBlockSize / 3,
                    "#FEB897"
                );
            }
        }
    }
};

let drawRemainingLives = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Vidas: ", 220, oneBlockSize * (map.length + 1));

    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            350 + i * oneBlockSize,
            oneBlockSize * map.length + 2,
            oneBlockSize,
            oneBlockSize
        );
    }
};

let drawScore = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText(
        "Puntos: " + score,
        0,
        oneBlockSize * (map.length + 1)
    );
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, "black");
    drawWalls();
    drawFoods();
    drawGhosts();
    pacman.draw();
    drawScore();
    drawRemainingLives();
};

let drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 1) {
                createRect(
                    j * oneBlockSize,
                    i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize,
                    "#342DCA"
                );
                if (j > 0 && map[i][j - 1] == 1) {
                    createRect(
                        j * oneBlockSize,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

let createGhosts = () => {
    ghosts = [];
    for (let i = 0; i < ghostCount; i++) {
        let newGhost = new Ghost(
            9 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            10 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            oneBlockSize,
            oneBlockSize,
            pacman.speed / 2,
            ghostImageLocations[i % 4].x,
            ghostImageLocations[i % 4].y,
            124,
            116,
            6 + i
        );
        ghosts.push(newGhost);
    }
};

createNewPacman();
createGhosts();
let gameInterval = setInterval(gameLoop, 1000 / fps);

let gameStarted = false;
let gamePaused = false;

window.addEventListener("keydown", (event) => {
    let k = event.keyCode;

    if (k === 13) {
        if (!gameStarted) {
            gameInterval = setInterval(gameLoop, 1000 / fps);
            gameStarted = true;
        } else {
            if (gamePaused) {
                gameInterval = setInterval(gameLoop, 1000 / fps);
                gamePaused = false;
            } else {
                clearInterval(gameInterval);
                gamePaused = true;
            }
        }
    } else {
        setTimeout(() => {
            if (k == 37 || k == 65) {
                if (pacman.currentDirection !== DIRECTION_RIGHT) {
                    pacman.nextDirection = DIRECTION_LEFT;
                }
            } else if (k == 38 || k == 87) {
                if (pacman.currentDirection !== DIRECTION_BOTTOM) {
                    pacman.nextDirection = DIRECTION_UP;
                }
            } else if (k == 39 || k == 68) {
                if (pacman.currentDirection !== DIRECTION_LEFT) {
                    pacman.nextDirection = DIRECTION_RIGHT;
                }
            } else if (k == 40 || k == 83) {
                if (pacman.currentDirection !== DIRECTION_UP) {
                    pacman.nextDirection = DIRECTION_BOTTOM;
                }
            }
        }, 1);
    }
});

window.resetGame = () => {
    lives = 3;
    score = 0;
    resetMap();
    restartPacmanAndGhosts();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000 / fps);
};
