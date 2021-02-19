require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const io = socket(server)
const gameState = {
  players: {}
}

io.on('connection', (socket) => {
  console.log("a user connected:", socket.id);
  socket.on("disconnect", ()=>{
    console.log("user disconnected")
    delete gameState.players[socket.id]
  })

  socket.on('newPlayer', ()=>{
    gameState.players[socket.id] = {
      x: 20,
      y: 20,
      width: 25,
      height: 25
    }
    })

    socket.on("playerMovement", (playerMovement) => {
      const player = gameState.players[socket.id]
      
      if(playerMovement.left && player.x > 0) {
        player.x -= 4
      }

      if(playerMovement.right && player.x < 640 - player.width) {
        player.x += 4
      }

      if(playerMovement.up && player.y > 0) {
        player.y -= 4
      }

      if (playerMovement.down && player.y < 480- player.height) {
        player.y += 4
      }
    })
})

setInterval(() => {
  io.sockets.emit('state', gameState);
}, 1000 / 60);

module.exports = app; // For testing
