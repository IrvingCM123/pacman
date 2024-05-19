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
        range
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
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
        setInterval(() => {
            this.changeRandomDirection();
        }, 10000);
    }

    isInRange() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (
            Math.sqrt(xDistance * xDistance + yDistance * yDistance) <=
            this.range
        ) {
            return true;
        }
        return false;
    }

    changeRandomDirection() {
        let addition = 1;
        this.randomTargetIndex += addition;
        this.randomTargetIndex = this.randomTargetIndex % 4;
    }

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
            return;
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case 4: // Right
                this.x -= this.speed;
                break;
            case 3: // Up
                this.y += this.speed;
                break;
            case 2: // Left
                this.x += this.speed;
                break;
            case 1: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case 4: // Right
                this.x += this.speed;
                break;
            case 3: // Up
                this.y -= this.speed;
                break;
            case 2: // Left
                this.x -= this.speed;
                break;
            case 1: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
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
        if (typeof this.direction == "undefined") {
            this.direction = tempDirection;
            return;
        }
        if (
            this.getMapY() != this.getMapYRightSide() &&
            (this.direction == DIRECTION_LEFT ||
                this.direction == DIRECTION_RIGHT)
        ) {
            this.direction = DIRECTION_UP;
        }
        if (
            this.getMapX() != this.getMapXRightSide() &&
            this.direction == DIRECTION_UP
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
            h: this.heuristic({ x: this.getMapX(), y: this.getMapY() }, { x: destX, y: destY }),
            parent: null,
            direction: this.direction
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

            if (currentNode.x == destX && currentNode.y == destY) {
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
                if (closedSet.find((node) => node.x == neighbor.x && node.y == neighbor.y)) {
                    continue;
                }

                let tentativeGScore = currentNode.g + 1;
                let neighborInOpenSet = openSet.find((node) => node.x == neighbor.x && node.y == neighbor.y);

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

        if (x - 1 >= 0 && map[y][x - 1] != 1) {
            neighbors.push({ x: x - 1, y: y, direction: DIRECTION_LEFT });
        }
        if (x + 1 < map[0].length && map[y][x + 1] != 1) {
            neighbors.push({ x: x + 1, y: y, direction: DIRECTION_RIGHT });
        }
        if (y - 1 >= 0 && map[y - 1][x] != 1) {
            neighbors.push({ x: x, y: y - 1, direction: DIRECTION_UP });
        }
        if (y + 1 < map.length && map[y + 1][x] != 1) {
            neighbors.push({ x: x, y: y + 1, direction: DIRECTION_BOTTOM });
        }
        return neighbors;
    }

    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize);
        return mapX;
    }

    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize);
        return mapY;
    }

    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
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
