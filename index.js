const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const routes = require('./server/routes/routes');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

const app = express();

const expressWs = require('express-ws')(app);

async function sendWsMessageToAllClients(ws, payload = {}) {
    await expressWs.getWss().clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(payload));
        }
    });
}

const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};
let usersCount = 0;
let connectedUsers = [];

app.ws('/chat', (ws, req) => {
    ws.on('message', msg => {
        const parsedMessage = JSON.parse(msg);

        let payload = {
            userName: parsedMessage.userName,
            message: parsedMessage.message,
            time: new Date().toLocaleString('ru', timeOptions),
        };

        if (parsedMessage.isUpdating) {
            connectedUsers.push(parsedMessage.userName);
            payload = {
                ...payload,
                connectedUsers,
            };
        }

        if (parsedMessage.isNewUser) {
            usersCount++;
            connectedUsers.push(parsedMessage.userName);
            payload = {
                ...payload,
                usersCount,
                connectedUsers,
            };
        }

        sendWsMessageToAllClients(ws, payload);
    });

    ws.on('close', () => {
        console.log('user disconnected');
        usersCount--;
        connectedUsers = [];

        const payload = {
            usersCount,
            requireUpdate: true,
        };

        sendWsMessageToAllClients(ws, payload);
    });
});

const EVENT_TYPES = {
    LOBBY_ENTER: 'lobbyEnter',
    REQUEST_LOBBY_PLAYERS: 'requestLobbyPlayers',
    UPDATE_LOBBY_PLAYERS: 'updateLobbyPlayers',
    START_MATCH_REQUEST: 'startMatchRequest',
    GAME_STARTED: 'gameStarted',
    SUBMIT_SHIP_POSITIONS: 'submitShipPositions',
    HIT_CELL: 'hitCell',
    QUIT_GAME: 'quitGame',
};

const CELL_STATES = {
    EMPTY: 'empty',
    MISSED_SHOT: 'missedShot',
    SHIP: 'ship',
    HIT: 'hit',
    TEMPORARY_SHIP: 'temporaryShip',
};

let connectedPlayers = [];
const games = {};

function updatePlayersList(ws) {
    connectedPlayers = [];

    sendWsMessageToAllClients(ws, {
        eventType: EVENT_TYPES.REQUEST_LOBBY_PLAYERS,
    });
}

app.ws('/sea-battle', (ws, req) => {
    ws.on('message', msg => {
        const parsedMessage = JSON.parse(msg);

        if (parsedMessage.eventType === EVENT_TYPES.LOBBY_ENTER) {
            if (!connectedPlayers.some(player => player.id === parsedMessage.user.id)) {
                connectedPlayers.push(parsedMessage.user);
            }

            let payload = {
                eventType: EVENT_TYPES.UPDATE_LOBBY_PLAYERS,
                players: connectedPlayers,
            };

            sendWsMessageToAllClients(ws, payload);

            const currentGame = games[parsedMessage.gameId];

            if (currentGame !== undefined) {
                const payload = {
                    eventType: EVENT_TYPES.GAME_STARTED,
                    game: currentGame,
                };

                sendWsMessageToAllClients(ws, payload)
                    .then(() => {
                        updatePlayersList(ws);
                    });
            }
        }

        if (parsedMessage.eventType === EVENT_TYPES.START_MATCH_REQUEST) {
            const players = parsedMessage.players;
            players.forEach(player => player.hasLeftGame = false);

            const game = {
                id: Date.now().toString(),
                players,
            };

            games[game.id] = game;

            const payload = {
                eventType: EVENT_TYPES.GAME_STARTED,
                game,
            };

            sendWsMessageToAllClients(ws, payload)
                .then(() => {
                    updatePlayersList(ws);
                });
        }

        if (parsedMessage.eventType === EVENT_TYPES.SUBMIT_SHIP_POSITIONS) {
            const game = games[parsedMessage.gameId];
            game[parsedMessage.userId] = parsedMessage.field;

            if (game[game.players[0].id] !== undefined && game[game.players[1].id] !== undefined) {
                game.turn = game.players[Math.floor(Math.random() * 2)].id;
            }

            const payload = {
                eventType: EVENT_TYPES.SUBMIT_SHIP_POSITIONS,
                game,
            };

            sendWsMessageToAllClients(ws, payload);
        }

        if (parsedMessage.eventType === EVENT_TYPES.HIT_CELL) {
            const game = games[parsedMessage.gameId];
            game[parsedMessage.targetPlayer] = parsedMessage.targetField;
            const status = parsedMessage.targetField[parsedMessage.targetCell];

            if (status === CELL_STATES.MISSED_SHOT) {
                game.turn = parsedMessage.targetPlayer;
            } else if (status === CELL_STATES.HIT) {
                const destroyedShips = parsedMessage.targetField.filter(cell => cell === CELL_STATES.HIT);
                if (destroyedShips.length === 20) {
                    game.winner = parsedMessage.shootingPlayer;
                }
            }

            const payload = {
                eventType: EVENT_TYPES.HIT_CELL,
                game,
            };

            sendWsMessageToAllClients(ws, payload);
        }

        if (parsedMessage.eventType === EVENT_TYPES.QUIT_GAME) {
            const user = games[parsedMessage.gameId].players.find(player => player.id === parsedMessage.userId);
            user.hasLeftGame = true;

            const payload = {
                eventType: EVENT_TYPES.QUIT_GAME,
                game: games[parsedMessage.gameId],
            };

            sendWsMessageToAllClients(ws, payload);
        }
    });

    ws.on('close', () => {
        updatePlayersList(ws);
    });
});

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    next();
});

app.listen(PORT, () => {
    console.log('Server start');
});
