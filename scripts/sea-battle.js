import Vue from 'vue/dist/vue.min';
// import Vue from 'vue/dist/vue';
import {EVENT_TYPES, CELL_STATES, SHIP_TYPES, GENERAL_SHIP_TYPES, STATUSES, VUE_ELEMENTS} from './constants';

const wsAddress = 'wss://slider-constructor.herokuapp.com/sea-battle';
// const wsAddress = 'ws://localhost:3000/sea-battle';

const initialAvailableShipNumbers = () => ({
    [GENERAL_SHIP_TYPES.ONE]: 4,
    [GENERAL_SHIP_TYPES.TWO]: 3,
    [GENERAL_SHIP_TYPES.THREE]: 2,
    [GENERAL_SHIP_TYPES.FOUR]: 1,
});

if (document.querySelector(VUE_ELEMENTS.SEA_BATTLE) !== null) {
    new Vue({
        el: VUE_ELEMENTS.SEA_BATTLE,
        data: {
            nickname: '',
            user: {
                name: null,
                id: null,
            },
            isLoggedIn: false,
            ws: null,
            connectedPlayers: [],
            isGameInProgress: false,
            opponent: {
                name: null,
                id: null,
                hasLeftGame: false,
            },
            fields: {
                us: [],
                opponents: [],
            },
            currentGameId: null,
            isOurTurn: false,
            CELL_STATES,
            chosenShipType: null,
            AVAILABLE_SHIP_TYPES: SHIP_TYPES(),
            SHIP_TYPES: SHIP_TYPES(),
            isShipPlacementInProgress: false,
            temporaryShipCells: [],
            availableShipNumbers: initialAvailableShipNumbers(),
            isAllShipsSet: false,
            isGameOver: false,
            status: STATUSES.WAITING,
        },
        mounted() {
            const gameData = JSON.parse(localStorage.getItem('seaBattle'));
            if (gameData === null) return;

            this.user = gameData.user;
            this.currentGameId = gameData.currentGameId;
            this.enterLobby();
        },
        methods: {
            checkAliveState(cellNumber) {
                const hitCells = [cellNumber];

                this.getShipPositionCells(cellNumber, hitCells);

                let isShipAlive = false;

                hitCells.forEach(cell => {
                    if (this.fields.opponents[cell] === CELL_STATES.SHIP) {
                        isShipAlive = true;
                    }
                });

                if (isShipAlive) return;

                hitCells.forEach(item => {
                    const cellsAroundKilledShip = this.getNearbyCells(item);
                    cellsAroundKilledShip.forEach(cell => {
                        if (this.fields.opponents[cell] === CELL_STATES.EMPTY) {
                            this.fields.opponents[cell] = CELL_STATES.MISSED_SHOT;
                        }
                    });
                });
            },

            clearField() {
                if (!confirm('Вы действительно хотите очистить поле?')) return;

                this.clearTemporaryShipCells();
                this.chosenShipType = null;
                this.AVAILABLE_SHIP_TYPES = SHIP_TYPES();
                this.availableShipNumbers = initialAvailableShipNumbers();
                this.fields.us.forEach((_, index) => {
                    this.setCellsState(true, index, CELL_STATES.EMPTY, CELL_STATES.SHIP, true);
                });
            },

            clearTemporaryShipCells() {
                this.temporaryShipCells.forEach(cell => {
                    this.setCellsState(true, cell, CELL_STATES.EMPTY, CELL_STATES.TEMPORARY_SHIP)
                });
                this.temporaryShipCells = [];
            },

            displayPossibleShipPosition(event) {
                if (this.chosenShipType === null || this.chosenShipType === undefined) return;

                let targetCellNumber = event.target.dataset.ourCell;

                if (targetCellNumber === undefined) return;

                targetCellNumber = Number(targetCellNumber);

                this.clearTemporaryShipCells();
                const cellsToShow = [targetCellNumber];
                const rightFreeSpace = this.freeSpaceOnTheRight(targetCellNumber);
                const bottomFreeSpace = this.freeSpaceBottom(targetCellNumber);

                switch (this.chosenShipType) {
                    case this.SHIP_TYPES.ONE.value:
                        break;
                    case this.SHIP_TYPES.TWO_HORIZONTAL.value:
                        if (rightFreeSpace > 1) {
                            cellsToShow.push(targetCellNumber + 1)
                        } else {
                            cellsToShow.push(targetCellNumber - 1)
                        }
                        break;
                    case this.SHIP_TYPES.TWO_VERTICAL.value:
                        if (bottomFreeSpace > 1) {
                            cellsToShow.push(targetCellNumber + 10);
                        } else {
                            cellsToShow.push(targetCellNumber - 10);
                        }
                        break;
                    case this.SHIP_TYPES.THREE_HORIZONTAL.value: {
                        if (rightFreeSpace > 2) {
                            cellsToShow.push(targetCellNumber + 1, targetCellNumber + 2);
                        } else if (rightFreeSpace === 2) {
                            cellsToShow.push(targetCellNumber - 1, targetCellNumber + 1);
                        } else if (rightFreeSpace === 1) {
                            cellsToShow.push(targetCellNumber - 2, targetCellNumber - 1);
                        }
                        break;
                    }
                    case this.SHIP_TYPES.THREE_VERTICAL.value: {
                        if (bottomFreeSpace > 2) {
                            cellsToShow.push(targetCellNumber + 10, targetCellNumber + 20);
                        } else if (bottomFreeSpace === 2) {
                            cellsToShow.push(targetCellNumber - 10, targetCellNumber + 10);
                        } else if (bottomFreeSpace === 1) {
                            cellsToShow.push(targetCellNumber - 20, targetCellNumber - 10);
                        }
                        break;
                    }
                    case this.SHIP_TYPES.FOUR_HORIZONTAL.value: {
                        if (rightFreeSpace > 3) {
                            cellsToShow.push(targetCellNumber + 1, targetCellNumber + 2, targetCellNumber + 3);
                        } else if (rightFreeSpace === 3) {
                            cellsToShow.push(targetCellNumber - 1, targetCellNumber + 1, targetCellNumber + 2);
                        } else if (rightFreeSpace === 2) {
                            cellsToShow.push(targetCellNumber - 2, targetCellNumber - 1, targetCellNumber + 1);
                        } else if (rightFreeSpace === 1) {
                            cellsToShow.push(targetCellNumber - 3, targetCellNumber - 2, targetCellNumber - 1);
                        }
                        break;
                    }
                    case this.SHIP_TYPES.FOUR_VERTICAL.value: {
                        if (bottomFreeSpace > 3) {
                            cellsToShow.push(targetCellNumber + 10, targetCellNumber + 20, targetCellNumber + 30);
                        } else if (bottomFreeSpace === 3) {
                            cellsToShow.push(targetCellNumber - 10, targetCellNumber + 10, targetCellNumber + 20);
                        } else if (bottomFreeSpace === 2) {
                            cellsToShow.push(targetCellNumber - 20, targetCellNumber - 10, targetCellNumber + 10);
                        } else if (bottomFreeSpace === 1) {
                            cellsToShow.push(targetCellNumber - 30, targetCellNumber - 20, targetCellNumber - 10);
                        }
                        break;
                    }
                }

                this.setCellsState(true, cellsToShow, CELL_STATES.TEMPORARY_SHIP);
            },

            enterLobby() {
                this.ws = new WebSocket(wsAddress);
                this.ws.onopen = () => {
                    this.setWsEventsHandlers();
                    this.isLoggedIn = true;

                    this.sendUserData();
                };

                this.ws.onclose = () => {
                    this.enterLobby();
                };
            },

            freeSpaceBottom(cellNumber) {
                return 10 - Math.floor(cellNumber / 10);
            },

            freeSpaceOnTheRight(cellNumber) {
                return 10 - (cellNumber % 10);
            },

            getNearbyCells(cellNumber) {
                const cellsToCheck = [];

                if (cellNumber > 9) {
                    cellsToCheck.push(cellNumber - 10);
                }

                if (cellNumber < 90) {
                    cellsToCheck.push(cellNumber + 10);
                }

                if (this.freeSpaceOnTheRight(cellNumber) === 10) {
                    cellsToCheck.push(cellNumber + 1, cellNumber - 9, cellNumber + 11);
                } else if (this.freeSpaceOnTheRight(cellNumber) === 1) {
                    cellsToCheck.push(cellNumber - 1, cellNumber + 9, cellNumber - 11);
                } else {
                    cellsToCheck.push(cellNumber - 1, cellNumber + 1, cellNumber - 9, cellNumber + 9, cellNumber - 11, cellNumber + 11);
                }

                return cellsToCheck;
            },

            getShipPositionCells(cell, array) {
                const nearbyCells = this.getNearbyCells(cell);
                nearbyCells.forEach(item => {
                    if (!array.some(cell => cell === item)) {
                        const cellState = this.fields.opponents[item];
                        if (cellState === CELL_STATES.HIT || cellState === CELL_STATES.SHIP) {
                            array.push(item);
                            this.getShipPositionCells(item, array);
                        }
                    }
                });
            },

            hitCell(targetCell) {
                if (!this.isOurTurn) return;

                const targetCellState = this.fields.opponents[targetCell];
                if (
                    targetCellState === CELL_STATES.MISSED_SHOT
                    || targetCellState === CELL_STATES.HIT
                ) return;

                this.isOurTurn = false;

                if (targetCellState === CELL_STATES.SHIP) {
                    this.fields.opponents[targetCell] = CELL_STATES.HIT;
                    this.checkAliveState(targetCell);
                } else {
                    this.fields.opponents[targetCell] = CELL_STATES.MISSED_SHOT;
                }

                const payload = {
                    eventType: EVENT_TYPES.HIT_CELL,
                    gameId: this.currentGameId,
                    shootingPlayer: this.user.id,
                    targetPlayer: this.opponent.id,
                    targetField: this.fields.opponents,
                    targetCell,
                }

                this.sendMessage(payload);
            },

            isPlaceAvailable() {
                let isAvailable = true;
                this.temporaryShipCells.forEach((item) => {
                    const cellsToCheck = this.getNearbyCells(item);

                    cellsToCheck.forEach((cell) => {
                        if (this.fields.us[cell] === CELL_STATES.SHIP) {
                            isAvailable = false;
                        }
                    });
                });

                return isAvailable;
            },

            notifyAboutOpponentLeave() {
                if (confirm(`${this.opponent.name} покинул игру! Выйти?`)) {
                    this.quitGame(false);
                }
            },

            placeShip(event) {
                if (this.chosenShipType === null) return;
                if (event.target.dataset.ourCell === undefined) return;

                if (!this.isPlaceAvailable()) {
                    alert('Корабли нельзя ставить рядом друг с другом!');
                    return;
                }

                switch (this.chosenShipType) {
                    case this.SHIP_TYPES.ONE.value:
                        this.availableShipNumbers[GENERAL_SHIP_TYPES.ONE]--;
                        break;
                    case this.SHIP_TYPES.TWO_HORIZONTAL.value:
                    case this.SHIP_TYPES.TWO_VERTICAL.value:
                        this.availableShipNumbers[GENERAL_SHIP_TYPES.TWO]--;
                        break;
                    case this.SHIP_TYPES.THREE_HORIZONTAL.value:
                    case this.SHIP_TYPES.THREE_VERTICAL.value:
                        this.availableShipNumbers[GENERAL_SHIP_TYPES.THREE]--;
                        break;
                    case this.SHIP_TYPES.FOUR_HORIZONTAL.value:
                    case this.SHIP_TYPES.FOUR_VERTICAL.value:
                        this.availableShipNumbers[GENERAL_SHIP_TYPES.FOUR]--;
                        break;
                }

                this.setCellsState(true, this.temporaryShipCells, CELL_STATES.SHIP, CELL_STATES.TEMPORARY_SHIP);
                this.temporaryShipCells = [];
                this.chosenShipType = null;
            },

            async sendMessage(payload) {
                if (this.ws.readyState === 1) {
                    await this.ws.send(JSON.stringify(payload));
                } else {
                    setTimeout(() => {
                        this.sendMessage(payload);
                    }, 1000);
                }
            },

            sendUserData() {
                const payload = {
                    eventType: EVENT_TYPES.LOBBY_ENTER,
                    user: this.user,
                };

                if (this.currentGameId !== null) {
                    payload.gameId = this.currentGameId;
                }

                this.sendMessage(payload);
            },

            setCells(game) {
                const ourCells = game[this.user.id];
                const opponentCells = game[this.opponent.id];

                if (ourCells !== undefined) {
                    this.fields.us = ourCells;
                } else {
                    this.fields.us = new Array(100).fill(CELL_STATES.EMPTY);
                }

                if (opponentCells !== undefined) {
                    this.fields.opponents = opponentCells;
                } else {
                    this.fields.opponents = new Array(100).fill(CELL_STATES.EMPTY);
                }
            },

            setCellsState(isCellOurs, indexes, state, stateToRemove = CELL_STATES.EMPTY, isClearingAllCells = false) {
                if (typeof indexes !== 'object') indexes = [indexes];

                indexes.forEach(index => {
                    let cellElement;

                    if (state === CELL_STATES.TEMPORARY_SHIP) {
                        this.temporaryShipCells.push(index);
                    }

                    if (isCellOurs) {
                        if (!isClearingAllCells && this.fields.us[index] === CELL_STATES.SHIP) return;
                        this.fields.us[index] = state;
                        cellElement = document.querySelector(`[data-our-cell="${index}"]`);
                    } else {
                        this.fields.opponents[index] = state;
                        cellElement = document.querySelector(`[data-opponent-cell="${index}"]`);
                    }

                    cellElement.classList.remove(`SeaBattle__cell--${stateToRemove}`);
                    cellElement.classList.add(`SeaBattle__cell--${state}`);
                });
            },

            setTurn(turn) {
                if (turn === this.user.id) {
                    this.status = STATUSES.OUR_TURN;
                    this.isOurTurn = true;
                } else {
                    this.status = STATUSES.OPPONENTS_TURN;
                    this.isOurTurn = false;
                }
            },

            setWinner(winnerId) {
                const winner = winnerId === this.user.id ? this.user.name : this.opponent.name;
                this.isOurTurn = false;
                this.isGameOver = true;
                this.status = `Игра окончена, победил ${winner}`;
            },

            setWsEventsHandlers() {
                this.ws.onmessage = (message) => {
                    const parsedResponse = JSON.parse(message.data);

                    if (parsedResponse.eventType === EVENT_TYPES.REQUEST_LOBBY_PLAYERS && !this.isGameInProgress) {
                        this.sendUserData();
                    }

                    if (parsedResponse.eventType === EVENT_TYPES.UPDATE_LOBBY_PLAYERS) {
                        this.connectedPlayers = parsedResponse.players.filter(player => player.id !== this.user.id);
                    }

                    if (parsedResponse.eventType === EVENT_TYPES.GAME_STARTED) {
                        if (parsedResponse.game.players.some(player => (player.id === this.user.id && !player.hasLeftGame))) {
                            this.isGameInProgress = true;
                            this.opponent = parsedResponse.game.players.find(player => player.id !== this.user.id);
                            this.setCells(parsedResponse.game);
                            this.currentGameId = parsedResponse.game.id;
                            localStorage.setItem('seaBattle', JSON.stringify({user: this.user, currentGameId: this.currentGameId}));
                            if (parsedResponse.game[this.user.id] === undefined) {
                                this.startShipPlacement();
                            }

                            if (parsedResponse.game.winner !== undefined) {
                                this.setWinner(parsedResponse.game.winner);
                                this.isAllShipsSet = true;
                            } else if (parsedResponse.game.turn !== undefined) {
                                this.setTurn(parsedResponse.game.turn);
                                this.isAllShipsSet = true;
                            }

                            if (this.opponent.hasLeftGame) {
                                this.notifyAboutOpponentLeave();
                            }
                        }
                    }

                    if (parsedResponse.eventType === EVENT_TYPES.SUBMIT_SHIP_POSITIONS) {
                        if (parsedResponse.game.id !== this.currentGameId) return;

                        if (parsedResponse.game[this.opponent.id] !== undefined) {
                            this.fields.opponents = parsedResponse.game[this.opponent.id];
                        }

                        if (parsedResponse.game.turn !== undefined) {
                            this.setTurn(parsedResponse.game.turn);
                            this.isAllShipsSet = true;
                        }
                    }

                    if (parsedResponse.eventType === EVENT_TYPES.HIT_CELL) {
                        this.setCells(parsedResponse.game);

                        if (parsedResponse.game.winner !== undefined) {
                            this.setWinner(parsedResponse.game.winner);
                        } else {
                            this.setTurn(parsedResponse.game.turn);
                        }
                    }

                    if (parsedResponse.eventType === EVENT_TYPES.QUIT_GAME) {
                        if (parsedResponse.game.players.some(player => (player.id === this.user.id && !player.hasLeftGame))) {
                            this.notifyAboutOpponentLeave();
                        }
                    }
                };
            },

            signUp(event) {
                event.preventDefault();
                this.user.name = this.nickname;
                this.user.id = Date.now().toString();
                localStorage.setItem('seaBattle', JSON.stringify({user: this.user}));
                this.enterLobby();
            },

            startMatch(opponent) {
                const payload = {
                    eventType: EVENT_TYPES.START_MATCH_REQUEST,
                    players: [opponent, this.user],
                };

                this.sendMessage(payload);
            },

            startShipPlacement() {
                this.isShipPlacementInProgress = true;
                this.status = STATUSES.SHIP_PLACEMENT;
                document.addEventListener('mouseover', this.displayPossibleShipPosition);
                document.addEventListener('click', this.placeShip);
            },

            submitShipPositions() {
                this.isShipPlacementInProgress = false;
                this.status = STATUSES.WAITING;
                document.removeEventListener('mouseover', this.displayPossibleShipPosition);
                document.removeEventListener('click', this.placeShip);

                const payload = {
                    eventType: EVENT_TYPES.SUBMIT_SHIP_POSITIONS,
                    gameId: this.currentGameId,
                    userId: this.user.id,
                    field: this.fields.us,
                };

                this.sendMessage(payload);
            },

            quitGame(isConfirmationRequired = true) {
                if (isConfirmationRequired && !confirm('Вы действительно хотите покинуть игру?')) return;

                const payload = {
                    eventType: EVENT_TYPES.QUIT_GAME,
                    gameId: this.currentGameId,
                    userId: this.user.id,
                };

                this.sendMessage(payload)
                    .then(() => {
                        localStorage.setItem('seaBattle', JSON.stringify({user: this.user}));
                        this.isGameInProgress = false;
                        this.opponent.name = null;
                        this.opponent.id = null;
                        this.fields.us = [];
                        this.fields.opponents = [];
                        this.currentGameId = null;
                        this.isOurTurn = false;
                        this.chosenShipType = null;
                        this.AVAILABLE_SHIP_TYPES = SHIP_TYPES();
                        this.isShipPlacementInProgress = false;
                        this.availableShipNumbers = initialAvailableShipNumbers();
                        this.isAllShipsSet = false;
                        this.isGameOver = false;
                        this.status = STATUSES.WAITING;
                        this.sendUserData();
                    });
            },
        },
        watch: {
            chosenShipType(value) {
                if (value !== null) {
                    this.clearTemporaryShipCells();
                }
            },

            availableShipNumbers: {
                deep: true,
                handler: function(value) {
                    if (value[GENERAL_SHIP_TYPES.ONE] === 0) {
                        delete this.AVAILABLE_SHIP_TYPES.ONE;
                    }
                    if (value[GENERAL_SHIP_TYPES.TWO] === 0) {
                        delete this.AVAILABLE_SHIP_TYPES.TWO_HORIZONTAL;
                        delete this.AVAILABLE_SHIP_TYPES.TWO_VERTICAL;
                    }
                    if (value[GENERAL_SHIP_TYPES.THREE] === 0) {
                        delete this.AVAILABLE_SHIP_TYPES.THREE_HORIZONTAL;
                        delete this.AVAILABLE_SHIP_TYPES.THREE_VERTICAL;
                    }
                    if (value[GENERAL_SHIP_TYPES.FOUR] === 0) {
                        delete this.AVAILABLE_SHIP_TYPES.FOUR_HORIZONTAL;
                        delete this.AVAILABLE_SHIP_TYPES.FOUR_VERTICAL;
                    }

                    if (
                        value[GENERAL_SHIP_TYPES.ONE] === 0
                        && value[GENERAL_SHIP_TYPES.TWO] === 0
                        && value[GENERAL_SHIP_TYPES.THREE] === 0
                        && value[GENERAL_SHIP_TYPES.FOUR] === 0
                    ) {
                        this.submitShipPositions();
                    }
                },
            },
        },
    });
}
