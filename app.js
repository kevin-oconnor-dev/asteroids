const FPS = 30;
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = max friction)
const GAME_LIVES = 3; // starting number of lives
const LASER_DIST = 0.5; // maximum distance of laser travel as a fraction of the screen width
const LASER_MAX = 10; // maximum number of lasers on screen
const LASER_SPEED = 600; // speed of lasers in pixels per second
const LASER_EXPLODE_DUR = 0.1; // duration of laser explosions in seconds
const ROIDS_NUM = 10; // starting number of asteroids
const ROIDS_POINTS_LARGE = 20; // point amount per large asteroid
const ROIDS_POINTS_MEDIUM = 50; // point amount per medium asteroid
const ROIDS_POINTS_SMALL = 100; // point amount per small asteroid
const ROIDS_SIZE = 120; // starting size of asteroids in pixels
const ROIDS_JAG = 0.3; // jaggedness of asteroids (0 = none, 1 = max)
const ROIDS_VERT = 10; // average number of verticies on asteroids
const ROIDS_SPEED = 50; // max starting speed of asteroids in pixels per second
const SHIP_BLINK_DUR = 0.1; // duration of ship's blink during invisibility in seconds
const SHIP_INVINCE_DUR = 3; // duration of the ship's invincibility in seconds
const SHIP_EXPLODE_DUR = 0.3; // duration of ship's explosion in seconds
const SHIP_SIZE = 30; // height in pixels
const SHIP_THRUST = 5; // acceleration of ship
const TURN_SPEED = 270; // turn speed in degrees per sec
const SHOOTING_TURN_SPEED = 100; // alternative turn speed for accurate aiming
const SHOW_BOUNDING = false; // show or hide collision bounding
const SHOW_CENTER_DOT = false; // show or hide ship's center dot

// shared state for event handlers
const inputState = {
    leftHeld: false,
    rightHeld: false
}
const gameMessage = document.querySelector('#game-msg');
const gameScoreDisplay = document.querySelector('#game-score');
const highScoreDisplay = document.querySelector('#high-score');

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// get canvas screen coordinates
function positionText() {
    const rect = canvas.getBoundingClientRect();
    gameMessage.style.top = `${rect.top + canvas.clientHeight / 2 - (SHIP_SIZE * 2)}px`;
    gameMessage.style.left = `${rect.left + canvas.clientWidth / 2}px`;

    gameScoreDisplay.style.top = `${rect.top + 15}px`;
    gameScoreDisplay.style.left = `${rect.left + canvas.clientWidth / 2}px`

    highScoreDisplay.style.top = `${rect.top + 15}px`
    highScoreDisplay.style.left = `${rect.right - highScoreDisplay.clientWidth}px`;
}
positionText();
window.addEventListener('resize', positionText);

// set up game parameters
let level = 1;
let score = 0;
let highScore = 0;
let lives = GAME_LIVES;
let roidsQuantity = 0;
let ship;
let roids = [];

newGame();

function newGame() {
    level = 1;
    score = 0;
    lives = GAME_LIVES;
    gameScoreDisplay.innerText = `Score: ${score}`;
    gameMessage.className = 'level';
    ship = newShip();
    ship.alive = true;
    nextLevel();
}

function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        rad: SHIP_SIZE / 2,
        ang: (90 / 180) * Math.PI, // convert degrees to radians
        blinkNum: Math.ceil(SHIP_INVINCE_DUR / SHIP_BLINK_DUR), // total amount of blinks
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS), // blink length in frames
        canShoot: true,
        lasers: [],
        rot: 0,
        turnSpeed: TURN_SPEED,
        explodeTime: 0,
        alive: true,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0,
        },
    }
}

function nextLevel() {
    roidsQuantity = level * 2;

    gameMessage.style.opacity = '1' // show level indicator
    gameMessage.innerText = `Level ${level}`;
    setTimeout( () => {
        gameMessage.style.opacity = '0';
    }, 3000)

    // create delay between levels
    if (level > 1) {
        setTimeout(() => createAsteroidBelt(roidsQuantity), 1000);
    } else {
        createAsteroidBelt(roidsQuantity);
    }
    level++;
}

function createAsteroidBelt(num) {
    roids = [];
    let x, y;
    for (let i = 0; i < num; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (
            distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.rad
        );
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function newAsteroid(x, y, rad) {
    let roidSpeedMult = 1 + 0.1 * level;
    let roid = {
        x: x,
        y: y,
        xVelocity: Math.random() * ROIDS_SPEED * roidSpeedMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yVelocity: Math.random() * ROIDS_SPEED * roidSpeedMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        rad: rad,
        ang: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offsets: [],
    };

    // populate the offsets array for asteroid vertices
    for (let i = 0; i < roid.vert; i++) {
        roid.offsets.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
}

function destroyAsteroid(index) {
    let x = roids[index].x;
    let y = roids[index].y;
    let rad = roids[index].rad;

    // break asteroid into pieces in necessary
    if (rad === Math.ceil(ROIDS_SIZE / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 5) ));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 5) ));
        score += ROIDS_POINTS_LARGE;
    } else if (rad === Math.ceil(ROIDS_SIZE / 5)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        score += ROIDS_POINTS_MEDIUM;
    } else {
        score += ROIDS_POINTS_SMALL;
    }
    gameScoreDisplay.innerText = `Score: ${score}`;
    roids.splice(index, 1);

    // check if level is cleared
    if (roids.length === 0) {
        nextLevel();
    }
}

function shootLaser() {
    // create laser object
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({ // shoot from ship's nose
            x: ship.x + 6/4 * ship.rad * Math.cos(ship.ang),
            y: ship.y - 6/4 * ship.rad * Math.sin(ship.ang),
            xVelocity: LASER_SPEED * Math.cos(ship.ang) / FPS,
            yVelocity: LASER_SPEED * Math.sin(ship.ang) / FPS,
            dist: 0,
            explodeTime: 0,
            active: true
        })
    }
    // prevent shooting more than once per press
    ship.canShoot = false;
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
function drawShip(x, y, ang) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = SHIP_SIZE * 0.10;
    ctx.beginPath();
    ctx.moveTo( // nose of ship
        x + 6/4 * ship.rad * Math.cos(ang),
        y - 6/4 * ship.rad * Math.sin(ang)
    );
    ctx.lineTo( // rear left
        x - ship.rad * (2/3 * Math.cos(ang) + Math.sin(ang)),
        y + ship.rad * (2/3 * Math.sin(ang) - Math.cos(ang))
    );
    ctx.lineTo( // rear right
        x - ship.rad * (2/3 * Math.cos(ang) - Math.sin(ang)),
        y + ship.rad * (2/3 * Math.sin(ang) + Math.cos(ang))
    );
    ctx.closePath();
    ctx.stroke();
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function gameOver() {
    ship.alive = false;
    const subTitle = document.createElement('div');

    subTitle.innerText = 'Press enter to reset';
    gameMessage.className = 'game-over';
    gameMessage.innerText = 'GAME OVER';
    gameMessage.appendChild(subTitle);
    gameMessage.style.opacity = 1;

    // create subtitle blink effect
    let subTitleHidden = false;
    setInterval( () => {
        if (subTitleHidden) {
            subTitle.style.visibility = '';
            subTitleHidden = false;
        } else {
            subTitle.style.visibility = 'hidden';
            subTitleHidden = true;
        }}, 500)
}

function explodeRoid(roid) {
    roid.style.display = 'none';
}

// set up event handlers
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    if (!ship.alive) {
        if (ev.key === 'Enter') newGame();
        return;
    }

    switch (ev.key) {
        case 'ArrowLeft':
            inputState.leftHeld = true;
            ship.rot = ((ship.turnSpeed / 180) * Math.PI) / FPS; // degrees to radians, divided by frame rate
            break;
        case 'ArrowUp':
            ship.thrusting = true;
            break;
        case 'ArrowRight':
            inputState.rightHeld = true;
            ship.rot = ((-ship.turnSpeed / 180) * Math.PI) / FPS; // degrees to radians, divided by frame rate
            break;
        case 'ArrowDown':
            break;
        case ' ': // Spacebar: shoot laser
            shootLaser();
            break;
        case 'Shift':
            ship.turnSpeed = SHOOTING_TURN_SPEED;
            // update turn speed
            if (inputState.leftHeld) ship.rot = ((ship.turnSpeed / 180) * Math.PI) / FPS;
            if (inputState.rightHeld) ship.rot = ((-ship.turnSpeed / 180) * Math.PI) / FPS;
            break;
    }
}
function keyUp(/** @type {KeyboardEvent} */ ev) {
    if (!ship.alive) return;

    switch (ev.key) {
        case 'ArrowLeft':
            inputState.leftHeld = false;
            if (!inputState.rightHeld) ship.rot = 0;
            break;
        case 'ArrowUp':
            ship.thrusting = false;
            break;
        case 'ArrowRight':
            inputState.rightHeld = false;
            if(!inputState.leftHeld) ship.rot = 0;
            break;
        case 'ArrowDown':
            break;
        case ' ': // re-allow shooting
            ship.canShoot = true;
            break;
        case 'Shift':
            ship.turnSpeed = TURN_SPEED;
            // update turn speed
            if (inputState.leftHeld) ship.rot = ((ship.turnSpeed / 180) * Math.PI) / FPS;
            if (inputState.rightHeld) ship.rot = ((-ship.turnSpeed / 180) * Math.PI) / FPS;
            break;
    }
}

// set up the game loop
setInterval(update, 1000 / FPS);

function update() {
    let blinkOn = ship.blinkNum % 2 === 0;
    let exploding = ship.explodeTime > 0;

    // draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // thrust the ship
    if (ship.thrusting && ship.alive) {
        ship.thrust.x += (SHIP_THRUST * Math.cos(ship.ang)) / FPS;
        ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.ang)) / FPS;

        // draw the thruster
            if (!exploding && blinkOn) {
            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = SHIP_SIZE * 0.1;
            ctx.beginPath();
            ctx.moveTo(
                // rear left
                ship.x - ship.rad * (2/3 * Math.cos(ship.ang) + 0.65 * Math.sin(ship.ang)),
                ship.y + ship.rad * (2/3 * Math.sin(ship.ang) - 0.65 * Math.cos(ship.ang))
            );
            ctx.lineTo(
                // rear center
                ship.x - ship.rad * 2 * Math.cos(ship.ang),
                ship.y + ship.rad * 2 * Math.sin(ship.ang)
            );
            ctx.lineTo(
                // rear right
                ship.x - ship.rad * (2/3 * Math.cos(ship.ang) - .65 * Math.sin(ship.ang)),
                ship.y + ship.rad * (2/3 * Math.sin(ship.ang) + .65 * Math.cos(ship.ang))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS;
        ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS;
    }

    // draw ship
    if (!exploding) {
        if (blinkOn && ship.alive) {
            drawShip(ship.x, ship.y, ship.ang);

            // draw shooting sightline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(
                ship.x + 6 / 4 * ship.rad * Math.cos(ship.ang),
                ship.y - 6 / 4 * ship.rad * Math.sin(ship.ang)
            );
            ctx.lineTo(
                ship.x + 100 * ship.rad * Math.cos(ship.ang),
                ship.y - 100 * ship.rad * Math.sin(ship.ang)
            );
            ctx.stroke();
        }
        // handle ship blinking
        if (ship.blinkNum > 0) {

            // reduce the blink time
            ship.blinkTime--;

            // reduce the blink number
            if (ship.blinkTime === 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }

            // cancel blink on ship thrust
            if (ship.thrusting) {
                setTimeout( () => {
                    ship.blinkNum = 0;
                    ship.blinkTime = 0;
                }, 500)
            }
        }

    } else {
        // draw the explosion
        ctx.fillStyle = 'darkred';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.rad * 1.7, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.rad * 1.4, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.rad * 1.1, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.rad * 0.9, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.rad * 0.6, 0, Math.PI * 2, false);
        ctx.fill();
    }

    // draw shooting lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime === 0) {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2);
            ctx.fill();
        } else { // draw the laser explosion
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.rad * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'salmon';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.rad * 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.rad * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // detect laser hits on asteroids
    for (let i = roids.length - 1; i >= 0; i--) {

        // loop over lasers
       for (let j = ship.lasers.length - 1; j >= 0; j--) {
            let distBetween = distBetweenPoints(roids[i].x, roids[i].y, ship.lasers[j].x, ship.lasers[j].y);
            if (distBetween < roids[i].rad && ship.lasers[j].active) {
                // destroy asteroid and activate laser explosion
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                ship.lasers[j].active = false;

                break;
            }
        }
    }

    // draw the player's lives
    for (let i = 0; i < lives; i++) {
        const margin = SHIP_SIZE;
        const x = margin + i * margin * 1.25;
        const y = SHIP_SIZE + 5;
        const ang = 0.5 * Math.PI;
        drawShip(x, y, ang);
    }

    // show ship bounding if enabled
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.rad, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // draw the asteroids
    let x;
    let y;
    let rad;
    let ang;
    let vert;
    let offsets;

    for (let i = 0; i < roids.length; i++) {
        // set asteroid color, line-width
        ctx.strokeStyle = 'slategrey';
        ctx.lineWidth = SHIP_SIZE / 20;

        // get the asteroid properties
        x = roids[i].x;
        y = roids[i].y;
        rad = roids[i].rad;
        ang = roids[i].ang;
        vert = roids[i].vert;
        offsets = roids[i].offsets;

        // draw a path
        ctx.beginPath();
        ctx.moveTo(
            x + rad * offsets[0] * Math.cos(ang),
            y + rad * offsets[0] * Math.sin(ang)
        );
        // draw the polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + rad * offsets[j] * Math.cos(ang + (j * Math.PI * 2) / vert),
                y + rad * offsets[j] * Math.sin(ang + (j * Math.PI * 2) / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        // show asteroid bounding if enabled
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = 'lime';
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, Math.PI * 2, false);
            ctx.stroke();
        }
        // move the asteroid
        roids[i].x += roids[i].xVelocity;
        roids[i].y += roids[i].yVelocity;

        // handle edge of screen
        if (x > canvas.width + rad) {  // use shorthand x variable for comparison
            roids[i].x = 0 - rad;
        } else if (x < 0 - rad) {
            roids[i].x = canvas.width + rad;
        }

        if (y > canvas.height + rad) {  // use shorthand y variable for comparison
            roids[i].y = 0 - rad;
        } else if (y < 0 - rad) {
            roids[i].y = canvas.height + rad;
        }
    }

    // check for asteroid collison (when not exploding)
    if (!exploding) {

        // only check when ship isn't blinking
        if (ship.blinkNum === 0 && ship.alive) {
            for (let i = 0; i < roids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.rad + roids[i].rad) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
        
        // move ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        // rotate ship
        ship.ang += ship.rot;
    } else {
        ship.explodeTime--;

        if (ship.explodeTime === 0) {
            lives--;
            if (lives <= 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }

    // move lasers 
    for (let i = ship.lasers.length - 1; i >= 0; i--) {

        // check distance traveled
        if (ship.lasers[i].dist > LASER_DIST * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        // handle laser explosions
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            // destroy laser after explosion time is up
            if (ship.lasers[i].explodeTime === 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
             
        } else {
            // move laser
            ship.lasers[i].x += ship.lasers[i].xVelocity;
            ship.lasers[i].y -= ship.lasers[i].yVelocity;

            // calculate distance traveled
            ship.lasers[i].dist += Math.sqrt(ship.lasers[i].xVelocity ** 2 + ship.lasers[i].yVelocity ** 2);
            }

        // handle edge of screen
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        } else if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.height;
        } else if (ship.lasers[i].y > canvas.height) {
            ship.lasers[i].y = 0;
        }
    }

    // handle edge of screen
    if (ship.x < 0 - ship.rad) {
        ship.x = canvas.width + ship.rad;
    } else if (ship.x > canvas.width + ship.rad) {
        ship.x = 0 - ship.rad;
    }

    if (ship.y < 0 - ship.rad) {
        ship.y = canvas.height + ship.rad;
    } else if (ship.y > canvas.height + ship.rad) {
        ship.y = 0 - ship.rad;
    }
    // center dot
    if (SHOW_CENTER_DOT) {
        ctx.fillStyle = 'red';
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }
}
