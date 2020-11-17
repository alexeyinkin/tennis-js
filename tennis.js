let body                = document.getElementById('body');
let redFieldElement     = document.getElementById('redField');
let blueFieldElement    = document.getElementById('blueField');

let fieldWidth      = 400;
let fieldHeight     = 600;
let ballWidth       = 20;
let ballHeight      = 20;
let playerWidth     = 100;
let playerHeight    = 10;
let maxPlayerDx     = 3;

let playerOffset    = 20;
let redPlayerY      = playerOffset;
let bluePlayerY     = fieldHeight - playerHeight - playerOffset;

let ball = {
    width:      ballWidth,
    height:     ballHeight,
    minX:       0,
    maxX:       fieldWidth,
    ddx:        0,
    ddy:        0,
    maxDx:      50,
    maxDy:      50,
    friction:   .03,
    element:    document.getElementById('ball')
};

let redPlayer = {
    x:          (fieldWidth - playerWidth) / 2,
    y:          redPlayerY,
    width:      playerWidth,
    height:     playerHeight,
    dx:         0,
    dy:         0,
    minX:       0,
    minY:       0,
    maxX:       fieldWidth,
    maxY:       fieldHeight / 3,
    ddx:        0,
    ddy:        0,
    maxDx:      20,
    maxDy:      20,
    friction:   3,
    score:      0,
    leftKey:    65, // A
    rightKey:   68, // D
    upKey:      87, // W
    downKey:    83, // S
    element:    document.getElementById('redPlayer')
};

let bluePlayer = {
    x:          (fieldWidth - playerWidth) / 2,
    y:          bluePlayerY,
    width:      playerWidth,
    height:     playerHeight,
    dx:         0,
    dy:         0,
    minX:       0,
    minY:       fieldHeight / 3 * 2,
    maxX:       fieldWidth,
    maxY:       fieldHeight,
    ddx:        0,
    ddy:        0,
    maxDx:      20,
    maxDy:      20,
    friction:   3,
    score:      0,
    leftKey:    37, // Left
    rightKey:   39, // Right
    upKey:      38, // Up
    downKey:    40, // Down
    element: document.getElementById('bluePlayer')
};

let objects = [ball, redPlayer, bluePlayer];
let players = [redPlayer, bluePlayer];
let balls = [ball];

for (let obj of objects) {
    obj.element.style.width = obj.width + 'px';
    obj.element.style.height = obj.height + 'px';
}

function tick() {
    savePreviousPositions();
    moveObjects();
    checkCollisions();
    updateObjectElements();
    updateScore();
    restartIfBallStopped();
}

function savePreviousPositions() {
    for (let obj of objects) {
        obj.lastX = obj.x;
        obj.lastY = obj.y;
    }
}

function moveObjects() {
    for (let obj of objects) {
        accelerateObjectWithControls(obj);
        slowDownWithFriction(obj);
        applySpeedToMove(obj);
    }
}

function accelerateObjectWithControls(obj) {
    obj.dx += obj.ddx;
    obj.dy += obj.ddy;

    if (obj.dx > obj.maxDx) {
        obj.dx = obj.maxDx;
    }
    if (obj.dx < -obj.maxDx) {
        obj.dx = -obj.maxDx;
    }
    if (obj.dy > obj.maxDy) {
        obj.dy = obj.maxDy;
    }
    if (obj.dy < -obj.maxDy) {
        obj.dy = -obj.maxDy;
    }
}

function slowDownWithFriction(obj) {
    if (obj.dx !== 0 || obj.dy !== 0) {
        let angle = Math.atan2(obj.dx, obj.dy);
        let ddx = -Math.sin(angle) * obj.friction;
        let ddy = -Math.cos(angle) * obj.friction;

        if (Math.abs(obj.dx) > Math.abs(ddx)) {
            obj.dx += ddx;
        } else {
            obj.dx = 0;
        }

        if (Math.abs(obj.dy) > Math.abs(ddy)) {
            obj.dy += ddy;
        } else {
            obj.dy = 0;
        }
    }
}

function applySpeedToMove(obj) {
    obj.x = obj.x + obj.dx;
    obj.y = obj.y + obj.dy;
}

function updateObjectElements() {
    for (let obj of objects) {
        obj.element.style.left = obj.x + 'px';
        obj.element.style.top = obj.y + 'px';
    }
}

function checkCollisions() {
    checkObjectsBounds();
    checkBallCollisions();
}

function checkObjectsBounds() {
    for (let obj of objects) {
        if ('minX' in obj && obj.x < obj.minX) {
            obj.x = obj.minX;
            obj.dx = -obj.dx;
        }

        if ('maxX' in obj && obj.x > obj.maxX - obj.width) {
            obj.x = obj.maxX - obj.width;
            obj.dx = -obj.dx;
        }

        if ('minY' in obj && obj.y < obj.minY) {
            obj.y = obj.minY;
            obj.dy = -obj.dy;
        }

        if ('maxY' in obj && obj.y > obj.maxY - obj.height) {
            obj.y = obj.maxY - obj.height;
            obj.dy = -obj.dy;
        }
    }
}

function checkBallCollisions() {
    for (let ball of balls) {
        let redThreshold = redPlayer.y + playerHeight;
        let lastRedThreshold = redPlayer.lastY + playerHeight;
        let blueThreshold = bluePlayer.y - ballHeight;
        let lastBlueThreshold = bluePlayer.lastY - ballHeight;
        let ballCenterX = ball.x + ball.width / 2;

        if (ball.y <= redThreshold && ball.lastY >= lastRedThreshold) {
            if (ballCenterX >= redPlayer.x) {
                if (ballCenterX <= redPlayer.x + redPlayer.width) {
                    ball.dy = -ball.dy + redPlayer.dy;
                    ball.dx += redPlayer.dx / 2;
                    ball.y = redPlayer.y + redPlayer.height;
                }
            }
        }

        if (ball.y >= blueThreshold && ball.lastY <= lastBlueThreshold) {
            if (ballCenterX >= bluePlayer.x) {
                if (ballCenterX <= bluePlayer.x + bluePlayer.width) {
                    ball.dy = -ball.dy + bluePlayer.dy;
                    ball.dx += bluePlayer.dx / 2;
                    ball.y = bluePlayer.y - ball.height;
                }
            }
        }

        if (ball.y < 0) {
            bluePlayer.score += 1;
            restart();
        }

        if (ball.y + ball.height > fieldHeight) {
            redPlayer.score += 1;
            restart();
        }
    }
}

function updateScore() {
    redFieldElement.innerHTML = redPlayer.score;
    blueFieldElement.innerHTML = bluePlayer.score;
}

function restartIfBallStopped() {
    for (ball of balls) {
        if (ball.dy !== 0) {
            return;
        }
    }

    restart();
}

function restart() {
    for (let ball of balls) {
        ball.x = (fieldWidth - ballWidth) / 2;
        ball.y = (fieldHeight - ballHeight) / 2;
        ball.dx = Math.random() * 10 - 5;
        ball.dy = (Math.random() + 2) * 5 * Math.sign(Math.random() - .5);
    }
}

function handleKeyDown(event) {
    for (let player of players) {
        switch (event.keyCode) {
            case player.leftKey:
                player.ddx = -5;
                break;
            case player.rightKey:
                player.ddx = 5;
                break;
            case player.upKey:
                player.ddy = -5;
                break;
            case player.downKey:
                player.ddy = 5;
                break;
        }
    }
}

function handleKeyUp(event) {
    for (let player of players) {
        switch (event.keyCode) {
            case player.leftKey:
            case player.rightKey:
                player.ddx = 0;
                break;
            case player.upKey:
            case player.downKey:
                player.ddy = 0;
                break;
        }
    }
}

restart();
setInterval(tick, 40);
body.addEventListener('keydown', handleKeyDown);
body.addEventListener('keyup', handleKeyUp);
