import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const mainPlayer = new Player({x: Math.floor(Math.random() * (canvas.width-10)),y: Math.floor(Math.random() * (canvas.height-10)),score: 0,id: getRandomId()})
var collectible
var players = []
var emittedCollectible = false

const height = 10
const speed = 20
var canCatch = true
var direction = ""

socket.emit('newPlayer', mainPlayer);

//Loading images at initializationg for quicker operation later
var collectibleDrawingGold = new Image();
    collectibleDrawingGold.src = '../public/Images/gold-coin.png'; // can also be a remote URL e.g. http://
var collectibleDrawingSilver = new Image();
    collectibleDrawingSilver.src = '../public/Images/silver-coin.png'; // can also be a remote URL e.g. http://
var collectibleDrawingBronze = new Image();
    collectibleDrawingBronze.src = '../public/Images/bronze-coin.png'; // can also be a remote URL e.g. http://
var mainPlayerDrawing = new Image();
    mainPlayerDrawing.src = '../public/Images/main-player.png'
var otherPlayerDrawing = new Image();
    otherPlayerDrawing.src = '../public/Images/other-player.png'


//Rendering Method acccording to gameState
const render = (gameState) => {

    context.clearRect(0, 0, 640, 480);

    //Drawing Collectible
    if(gameState.collectible){
        switch(gameState.collectible.value){
            case 1:
                context.drawImage(collectibleDrawingBronze, gameState.collectible.x, gameState.collectible.y)
            break;
            case 2:
                context.drawImage(collectibleDrawingSilver, gameState.collectible.x, gameState.collectible.y)
            break
            case 3:
                context.drawImage(collectibleDrawingGold, gameState.collectible.x, gameState.collectible.y)
            break;
            default:
                console.log("Collectible Exception")
            break
        }
    }

    //Drawing players
    for (let player in gameState.players)
        if(gameState.players[player].id == mainPlayer.id)
            context.drawImage(mainPlayerDrawing, gameState.players[player].x, gameState.players[player].y)
        else
            context.drawImage(otherPlayerDrawing, gameState.players[player].x, gameState.players[player].y)
    
    //Rank indication
    context.font = "40pt Calibri";
    if(players.length)
        context.fillText(mainPlayer.calculateRank(players), 400, 50);
}

socket.on("state", (gameState)=>{
    if(!gameState)
        return
    
    if(!gameState.collectible && gameState.lobbyLeader == mainPlayer.id && !emittedCollectible){//if no collectible{
        socket.emit("newCollectible", new Collectible({x:getRandomInt(canvas.width-40),y: getRandomInt(canvas.height-40), value: getRandomInt(3)+1, id: getRandomId()}))
        emittedCollectible = true
        setInterval(()=> { //Added a delay of a second here before re enabling to summon a new collectible to fix bug where multiple ones would be created
            emittedCollectible = false}
            , 1000)
    }
    else
        collectible = gameState.collectible

    if(collectible)
        if(mainPlayer.collision(collectible) && canCatch){
            socket.emit("collectibleCaught", {id: mainPlayer.id, value: collectible.value})
            canCatch = false
            setInterval(()=> { //Added a delay of a second to prevent multiple catch on same event
                canCatch = true}
                , 1000)
        }

    render(gameState)
})

const keyDownHandler = (e) => {

    if(e.keyCode == 39 && mainPlayer.x < 640)
        direction = "right"
    else if (e.keyCode == 37 && mainPlayer.x > 0)
        direction = "left"
    else if (e.keyCode == 38 && mainPlayer.y > 0)
        direction = "up"
    else if(e.keyCode == 40 && mainPlayer.y < 480- height)
    direction = "down"
    
    mainPlayer.movePlayer(direction,speed)
}


//Utilities Functions
function getRandomId() {
    var letters = '0123456789ABCDEF';
    var str = '';
    for (var i = 0; i < 6; i++) {
      str += letters[Math.floor(Math.random() * 16)];
    }
    return str;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

setInterval(()=> {
    socket.emit("playerMoved", mainPlayer)}
    , 1000 /60)

document.addEventListener('keydown', keyDownHandler, false);
// document.addEventListener('keyup', keyUpHandler, false);