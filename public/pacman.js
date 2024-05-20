class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.nextDirection = DIRECTION_RIGHT;
        this.frameCount = 7;
        this.currentFrame = 1;
        this.movements = [];
        setInterval(() => {
            this.changeAnimation();
        }, 100);
    }

    moveProcess() {
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            return;
        }
        if (this.x + this.width > canvas.width) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = canvas.width - this.width;
        }

        //this.logMovement();
        //this.sendMovementsToAPI();
    }

    //logMovement() {
    //    this.movements.push({
    //        x: this.x,
    //        y: this.y,
    //        direction: this.direction
    //    });
    //}
//
    //async sendMovementsToAPI() {
    //    if (this.movements.length >= 10) {
    //        console.log('Sending movements to API:', this.movements);
    //        try {
    //            await fetch('http://localhost:5000/train', {
    //                method: 'POST',
    //                headers: {
    //                    'Content-Type': 'application/json'
    //                },
    //                body: JSON.stringify(this.movements)
    //            });
    //            this.movements = []; // Clear the array after sending
    //        } catch (error) {
    //            console.error('');
    //        }
    //    }
    //}

    eat() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (map[i][j] == 2 && this.getMapX() == j && this.getMapY() == i) {
                    map[i][j] = 3;
                    score++;
                }
            }
        }
    }

    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: this.x += this.speed; break;
            case DIRECTION_UP: this.y -= this.speed; break;
            case DIRECTION_LEFT: this.x -= this.speed; break;
            case DIRECTION_BOTTOM: this.y += this.speed; break;
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: this.x -= this.speed; break;
            case DIRECTION_UP: this.y += this.speed; break;
            case DIRECTION_LEFT: this.x += this.speed; break;
            case DIRECTION_BOTTOM: this.y -= this.speed; break;
        }
    }

    alignToBlock() {
        this.x = Math.round(this.x / oneBlockSize) * oneBlockSize;
        this.y = Math.round(this.y / oneBlockSize) * oneBlockSize;
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize)] == 1 ||
            map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize + 0.9999)] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][parseInt(this.x / oneBlockSize + 0.9999)] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    checkGhostCollision(ghosts) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (ghost.getMapX() == this.getMapX() && ghost.getMapY() == this.getMapY()) {
                return true;
            }
        }
        return false;
    }

    changeDirectionIfPossible() {
        if (this.direction == this.nextDirection) return;
        let tempDirection = this.direction;
        this.direction = this.nextDirection;
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
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
        this.currentFrame = this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        canvasContext.save();
        canvasContext.translate(this.x + oneBlockSize / 2, this.y + oneBlockSize / 2);
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180);
        canvasContext.translate(-this.x - oneBlockSize / 2, -this.y - oneBlockSize / 2);
        canvasContext.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}

Pacman.prototype.getNextPosition = function() {
    switch (this.direction) {
        case DIRECTION_LEFT: return { x: this.getMapX() - 1, y: this.getMapY() };
        case DIRECTION_RIGHT: return { x: this.getMapX() + 1, y: this.getMapY() };
        case DIRECTION_UP: return { x: this.getMapX(), y: this.getMapY() - 1 };
        case DIRECTION_BOTTOM: return { x: this.getMapX(), y: this.getMapY() + 1 };
        default: return { x: this.getMapX(), y: this.getMapY() };
    }
};
