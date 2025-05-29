const FPS = 30;
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = max friction)
const ROIDS_NUM = 10; // starting number of asteroids
const ROIDS_SIZE = 50; // starting size of asteroids in pixels
const ROIDS_JAG = 0.3; // jaggedness of asteroids (0 = none, 1 = max)
const ROIDS_VERT = 10; // average number of verticies on asteroids
const ROIDS_SPEED = 50; // max starting speed of asteroids in pixels per second
const SHIP_EXPLODE_DIR = 0.3; // duration of ship's explosion
const SHIP_SIZE = 30; //height in pixels
const SHIP_THRUST = 5; // acceleration of ship
const TURN_SPEED = 360; // turn speed in degrees per sec
const SHOW_BOUNDING = false; // show or hide collision bounding
const SHOW_CENTER_DOT = false; // show or hide ship's center dot

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// create space ship
let ship = newShip();

// set up asteroids

let roids = [];
createAsteroidBelt();

function createAsteroidBelt() {
    roids = [];
    let x, y;
    for (let i = 0; i < ROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (
            distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.rad
        );
        roids.push(newAsteroid(x, y));
    }
}

function newAsteroid(x, y) {
    let roid = {
        x: x,
        y: y,
        xVelocity: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        yVelocity: Math.random() * ROIDS_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        rad: ROIDS_SIZE / 2,
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

// set up ship
function newShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        rad: SHIP_SIZE / 2,
        ang: (90 / 180) * Math.PI, // convert degrees to radians
        rot: 0,
        explodeTime: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0,
        },
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DIR * FPS);
}

// set up event handlers
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch (ev.key) {
        case 'ArrowLeft':
            ship.rot = ((TURN_SPEED / 180) * Math.PI) / FPS;
            break;
        case 'ArrowUp':
            ship.thrusting = true;
            break;
        case 'ArrowRight':
            ship.rot = ((-TURN_SPEED / 180) * Math.PI) / FPS;
            break;
        case 'ArrowDown':
            break;
    }
}
function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch (ev.key) {
        case 'ArrowLeft':
            ship.rot = 0;
            break;
        case 'ArrowUp':
            ship.thrusting = false;
            break;
        case 'ArrowRight':
            ship.rot = 0;
            break;
        case 'ArrowDown':
            break;
    }
}

// set up the game loop
setInterval(update, 1000 / FPS);

function update() {
    let exploding = ship.explodeTime > 0;

    // draw space
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw ship
    if (!exploding) {
        ctx.strokeStyle = 'white';
    ctx.lineWidth = SHIP_SIZE * 0.10;
    ctx.beginPath();
    ctx.moveTo( // nose of ship
        ship.x + 6/4 * ship.rad * Math.cos(ship.ang),
        ship.y - 6/4 * ship.rad * Math.sin(ship.ang)
    );
    ctx.lineTo( // rear left
        ship.x - ship.rad * (2/3 * Math.cos(ship.ang) + Math.sin(ship.ang)),
        ship.y + ship.rad * (2/3 * Math.sin(ship.ang) - Math.cos(ship.ang))
    );
    ctx.lineTo( // rear right
        ship.x - ship.rad * (2/3 * Math.cos(ship.ang) - Math.sin(ship.ang)),
        ship.y + ship.rad * (2/3 * Math.sin(ship.ang) + Math.cos(ship.ang))
    );
    ctx.closePath();
    ctx.stroke();
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

    if (!exploding) {
        for (let i = 0; i < roids.length; i++) {
            // handle asteroid collison
            if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.rad + roids[i].rad) {
                explodeShip();
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
            ship = newShip();
        }
    }

    // thrust the ship
    if (ship.thrusting) {
        ship.thrust.x += (SHIP_THRUST * Math.cos(ship.ang)) / FPS;
        ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.ang)) / FPS;

        // draw the thruster
            if (!exploding) {
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
                ship.x - ship.rad * 6/3 * Math.cos(ship.ang),
                ship.y + ship.rad * 6/3 * Math.sin(ship.ang)
            );
            ctx.lineTo(
                // rear right
                ship.x - ship.rad * (2/3 * Math.cos(ship.ang) - 0.65 * Math.sin(ship.ang)),
                ship.y + ship.rad * (2/3 * Math.sin(ship.ang) + 0.65 * Math.cos(ship.ang))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        ship.thrust.x -= (FRICTION * ship.thrust.x) / FPS;
        ship.thrust.y -= (FRICTION * ship.thrust.y) / FPS;
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
