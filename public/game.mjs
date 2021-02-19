import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

socket.emit('newPlayer');

const drawPlayer = (player) => {
    context.beginPath()
    context.rect(player.x, player.y, player.width, player.height)
    context.fillStyle = "#0095DD"
    context.fill()
    context.closePath()
}

socket.on("state", (gameState)=>{
    for (let player in gameState.players) {
        drawPlayer(gameState.players[player])
    }
})

const playerMovement = {
    up:false,
    down: false,
    left: false,
    right: false
}

const keyDownHandler = (e) => {
    if(e.keyCode == 39) {
        console.log("Right")
        playerMovement.right = true
    } else if (e.keyCode == 37) {
        playerMovement.left = true
    } else if (e.keyCode == 38) {
        playerMovement.up = true
    } else if(e.keyCode == 40) {
        playerMovement.down = true
    }
}

const keyUpHandler = (e) => {
    if(e.keyCode == 39) {
        playerMovement.right = false
    } else if (e.keyCode == 37) {
        playerMovement.left = false
    } else if (e.keyCode == 38) {
        playerMovement.up = false
    } else if(e.keyCode == 40) {
        playerMovement.down = false
    }
}

setInterval(()=> {
    socket.emit("playerMovement", playerMovement)}
    , 1000 /60)

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);