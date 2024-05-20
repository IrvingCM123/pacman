class Ghost {
    constructor(
        x,
        y,
        width,
        height,
        speed,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        range,
        personality
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.range = range;
        this.personality = personality;
        this.state = "patrol";
        this.target = null;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
        setInterval(() => {
            this.changeRandomDirection();
            this.changeStateRandomly();
        }, 10000);
    }

    isInRange() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        return (
            Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range
        );
    }

    changeRandomDirection() {
        this.randomTargetIndex = (this.randomTargetIndex + 1) % 4;
    }

    changeState(newState) {
        this.state = newState;
    }

    changeStateRandomly() {
        const states = ["patrol", "chase", "evade"];
        this.changeState(states[Math.floor(Math.random() * states.length)]);
    }

    moveProcess() {
        switch (this.state) {
            case "patrol":
                this.target = randomTargetsForGhosts[this.randomTargetIndex];
                if (this.isInRange() && this.personality !== "ambush") {
                    this.changeState("chase");
                }
                break;
            case "chase":
                this.target = pacman;
                if (!this.isInRange()) {
                    this.changeState("patrol");
                }
                break;
            case "evade":
                this.target = randomTargetsForGhosts[this.randomTargetIndex];
                break;
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
        }
    }

    moveForwards() {
        switch (this.direction) {
            case 4: this.x += this.speed; break; // Right
            case 3: this.y -= this.speed; break; // Up
            case 2: this.x -= this.speed; break; // Left
            case 1: this.y += this.speed; break; // Down
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case 4: this.x -= this.speed; break; // Right
            case 3: this.y += this.speed; break; // Up
            case 2: this.x += this.speed; break; // Left
            case 1: this.y -= this.speed; break; // Down
        }
    }

    alignToBlock() {
        this.x = Math.round(this.x / oneBlockSize) * oneBlockSize;
        this.y = Math.round(this.y / oneBlockSize) * oneBlockSize;
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] ==
            1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
            parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize)][
            parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
            parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        this.direction = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );
        if (typeof this.direction === "undefined") {
            this.direction = tempDirection;
            return;
        }
        if (
            this.getMapY() !== this.getMapYRightSide() &&
            (this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT)
        ) {
            this.direction = DIRECTION_UP;
        }
        if (
            this.getMapX() !== this.getMapXRightSide() &&
            this.direction === DIRECTION_UP
        ) {
            this.direction = DIRECTION_LEFT;
        }
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    calculateNewDirection(map, destX, destY) {
        let openSet = [];
        let closedSet = [];
        let startNode = {
            x: this.getMapX(),
            y: this.getMapY(),
            f: 0,
            g: 0,
            h: this.heuristic(
                { x: this.getMapX(), y: this.getMapY() },
                { x: destX, y: destY }
            ),
            parent: null,
            direction: this.direction,
        };
        openSet.push(startNode);

        while (openSet.length > 0) {
            let lowestFIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestFIndex].f) {
                    lowestFIndex = i;
                }
            }

            let currentNode = openSet[lowestFIndex];

            if (currentNode.x === destX && currentNode.y === destY) {
                let directions = [];
                while (currentNode.parent) {
                    directions.push(currentNode.direction);
                    currentNode = currentNode.parent;
                }
                return directions.pop();
            }

            openSet.splice(lowestFIndex, 1);
            closedSet.push(currentNode);

            let neighbors = this.getNeighbors(currentNode);

            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];
                if (
                    closedSet.find(
                        (node) => node.x === neighbor.x && node.y === neighbor.y
                    )
                ) {
                    continue;
                }

                let tentativeGScore = currentNode.g + 1;
                let neighborInOpenSet = openSet.find(
                    (node) => node.x === neighbor.x && node.y === neighbor.y
                );

                if (!neighborInOpenSet || tentativeGScore < neighbor.g) {
                    neighbor.g = tentativeGScore;
                    neighbor.h = this.heuristic(neighbor, { x: destX, y: destY });
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = currentNode;

                    if (!neighborInOpenSet) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        return 1;
    }

    getNeighbors(node) {
        let neighbors = [];
        let x = node.x;
        let y = node.y;

        if (x - 1 >= 0 && map[y][x - 1] !== 1) {
            neighbors.push({ x: x - 1, y: y, direction: DIRECTION_LEFT });
        }
        if (x + 1 < map[0].length && map[y][x + 1] !== 1) {
            neighbors.push({ x: x + 1, y: y, direction: DIRECTION_RIGHT });
        }
        if (y - 1 >= 0 && map[y - 1][x] !== 1) {
            neighbors.push({ x: x, y: y - 1, direction: DIRECTION_UP });
        }
        if (y + 1 < map.length && map[y + 1][x] !== 1) {
            neighbors.push({ x: x, y: y + 1, direction: DIRECTION_BOTTOM });
        }
        return neighbors;
    }

    getMapX() {
        return parseInt(this.x / oneBlockSize);
    }

    getMapY() {
        return parseInt(this.y / oneBlockSize);
    }

    getMapXRightSide() {
        return parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
    }

    getMapYRightSide() {
        return parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame === this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        canvasContext.save();
        canvasContext.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}

class AmbushGhost extends Ghost {
    moveProcess() {
        this.target = pacman;
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
        }
    }
}

class ProximityGhost extends Ghost {
    moveProcess() {
        if (this.isInRange()) {
            this.target = pacman;
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
        }
    }
}

class IgnoreGhost extends Ghost {
    moveProcess() {
        if (this.isInRange()) {
            const distance = this.getDistanceToPacman();
            if (distance <= 3) {
                this.moveAwayFromPacman();
            } else {
                this.target = randomTargetsForGhosts[this.randomTargetIndex];
            }
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
        }
    }

    getDistanceToPacman() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
    }

    moveAwayFromPacman() {
        const directions = [
            { x: -1, y: 0 }, 
            { x: 1, y: 0 }, 
            { x: 0, y: -1 }, 
            { x: 0, y: 1 } 
        ];

        let furthestDirection = null;
        let maxDistance = 0;

        for (const direction of directions) {
            const newX = this.getMapX() + direction.x;
            const newY = this.getMapY() + direction.y;

            if (newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length && map[newY][newX] !== 1) {
                const distance = Math.sqrt(Math.pow(newX - pacman.getMapX(), 2) + Math.pow(newY - pacman.getMapY(), 2));
                if (distance > maxDistance) {
                    maxDistance = distance;
                    furthestDirection = { x: newX, y: newY };
                }
            }
        }

        if (furthestDirection) {
            this.target = furthestDirection;
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
    }
}

class BlockGhost extends Ghost {
    moveProcess() {
        if (this.isInRange()) {
            const distance = this.getDistanceToPacman();
            if (distance > 2) {
                this.target = pacman;
            } else {
                this.target = { x: this.getMapX(), y: this.getMapY() }; 
            }
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
        }
    }

    getDistanceToPacman() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
    }
}

Ghost.prototype.changeDirectionIfPossible = function() {
    if (!this.target) return; 
    let tempDirection = this.direction;
    this.direction = this.calculateNewDirection(
        map,
        parseInt(this.target.x / oneBlockSize),
        parseInt(this.target.y / oneBlockSize)
    );
    if (typeof this.direction === "undefined") {
        this.direction = tempDirection;
        return;
    }
    if (
        this.getMapY() !== this.getMapYRightSide() &&
        (this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT)
    ) {
        this.direction = DIRECTION_UP;
    }
    if (
        this.getMapX() !== this.getMapXRightSide() &&
        this.direction === DIRECTION_UP
    ) {
        this.direction = DIRECTION_LEFT;
    }
    this.moveForwards();
    if (this.checkCollisions()) {
        this.moveBackwards();
        this.direction = tempDirection;
    } else {
        this.moveBackwards();
    }
};

let findValidGhostPosition = () => {
    let validPositionFound = false;
    let x, y;
    while (!validPositionFound) {
        x = Math.floor(Math.random() * (map[0].length - 2) + 1) * oneBlockSize;
        y = Math.floor(Math.random() * (map.length - 2) + 1) * oneBlockSize;
        if (
            map[parseInt(y / oneBlockSize)][parseInt(x / oneBlockSize)] != 1 &&
            map[parseInt((y - oneBlockSize) / oneBlockSize)][
            parseInt(x / oneBlockSize)
            ] != 1 &&
            map[parseInt((y + oneBlockSize) / oneBlockSize)][
            parseInt(x / oneBlockSize)
            ] != 1 &&
            map[parseInt(y / oneBlockSize)][
            parseInt((x - oneBlockSize) / oneBlockSize)
            ] != 1 &&
            map[parseInt(y / oneBlockSize)][
            parseInt((x + oneBlockSize) / oneBlockSize)
            ] != 1
        ) {
            validPositionFound = true;
        }
    }
    return { x, y };
};

let createGhosts = () => {
    ghosts = [];
    let pos = findValidGhostPosition();
    ghosts.push(new AmbushGhost(
        pos.x,
        pos.y,
        oneBlockSize,
        oneBlockSize,
        pacman.speed / 2,
        ghostImageLocations[0].x,
        ghostImageLocations[0].y,
        124,
        116,
        6
    ));

    ghosts.push(new ProximityGhost(
        pos.x,
        pos.y,
        oneBlockSize,
        oneBlockSize,
        pacman.speed / 2,
        ghostImageLocations[1].x,
        ghostImageLocations[1].y,
        124,
        116,
        6
    ));

    ghosts.push(new IgnoreGhost(
        pos.x,
        pos.y,
        oneBlockSize,
        oneBlockSize,
        pacman.speed/2,
        ghostImageLocations[2].x,
        ghostImageLocations[2].y,
        124,
        116,
        6
    ));
    ghosts.push(new BlockGhost(
        pos.x,
        pos.y,
        oneBlockSize,
        oneBlockSize,
        pacman.speed / 2,
        ghostImageLocations[3].x,
        ghostImageLocations[3].y,
        124,
        116,
        6
    ));
};

let updateGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].moveProcess();
    }
};

let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};

class LearningGhost extends Ghost {
    async moveProcess() {
        if (this.isInRange()) {
            const nextMove = await this.predictPacmanMove();
            this.target = { x: nextMove.x, y: nextMove.y };
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
        }
    }

    async predictPacmanMove() {
        try {
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    x: pacman.x,
                    y: pacman.y,
                    direction: pacman.direction
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Predicted Pacman move:', data);
            return data.next_move;
        } catch (error) {
            console.error('Error predicting Pacman move:', error);
            return { x: this.getMapX(), y: this.getMapY() }; // Default to current position
        }
    }
}

