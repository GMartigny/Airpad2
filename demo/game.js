const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
canvas.style.display = "block";
canvas.style.backgroundColor = "#020915";

const ctx = canvas.getContext("2d");

const keys = {};

const character = {
    speed: 2,
    sprite: new Image(),
    x: 0,
    y: 0,
};

/**
 */
function loop () {
    requestAnimationFrame(loop);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(character.sprite, character.x, character.y);

    if (keys.Up) character.y -= character.speed;
    if (keys.Right) character.x += character.speed;
    if (keys.Down) character.y += character.speed;
    if (keys.Left) character.x -= character.speed;

    character.x = Math.min(Math.max(character.x, 0), canvas.width - character.sprite.width);
    character.y = Math.min(Math.max(character.y, 0), canvas.height - character.sprite.height);
}

const gameReady = new Promise((resolve) => {
    character.sprite.src = "ship.png";
    character.sprite.addEventListener("load", () => {
        character.x = (canvas.width - character.sprite.width) / 2;
        character.y = (canvas.height - character.sprite.height) / 2;
        resolve();
    });
});

/**
 */
async function start () {
    await gameReady;
    loop();
}

/**
 * @param {string} key -
 * @param {Boolean} isPressed -
 */
function setKey (key, isPressed) {
    keys[key] = isPressed;
}

export {
    setKey,
    canvas,
    start,
};
