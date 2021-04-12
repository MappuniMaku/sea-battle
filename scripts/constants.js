export const EVENT_TYPES = {
    LOBBY_ENTER: 'lobbyEnter',
    REQUEST_LOBBY_PLAYERS: 'requestLobbyPlayers',
    UPDATE_LOBBY_PLAYERS: 'updateLobbyPlayers',
    START_MATCH_REQUEST: 'startMatchRequest',
    GAME_STARTED: 'gameStarted',
    SUBMIT_SHIP_POSITIONS: 'submitShipPositions',
    HIT_CELL: 'hitCell',
    QUIT_GAME: 'quitGame',
};

export const CELL_STATES = {
    EMPTY: 'empty',
    MISSED_SHOT: 'missedShot',
    SHIP: 'ship',
    HIT: 'hit',
    TEMPORARY_SHIP: 'temporaryShip',
};

export const SHIP_TYPES = () => ({
    ONE: {
        label: 'Однопалубник',
        value: 'one',
    },
    TWO_HORIZONTAL: {
        label: 'Двухпалубник (горизонтальный)',
        value: 'twoHorizontal',
    },
    TWO_VERTICAL: {
        label: 'Двухпалубник (вертикальный)',
        value: 'twoVertical',
    },
    THREE_HORIZONTAL: {
        label: 'Трехпалубник (горизонтальный)',
        value: 'threeHorizontal',
    },
    THREE_VERTICAL: {
        label: 'Трехпалубник (вертикальный)',
        value: 'threeVertical',
    },
    FOUR_HORIZONTAL: {
        label: 'Четырехпалубник (горизонтальный)',
        value: 'fourHorizontal',
    },
    FOUR_VERTICAL: {
        label: 'Четырехпалубник (вертикальный)',
        value: 'fourVertical',
    },
});

export const GENERAL_SHIP_TYPES = {
    ONE: 'one',
    TWO: 'two',
    THREE: 'three',
    FOUR: 'four',
};

export const STATUSES = {
    SHIP_PLACEMENT: 'Расставьте ваши корабли',
    WAITING: 'Ожидаем пока противник расставит корабли...',
    OUR_TURN: 'Ваш ход',
    OPPONENTS_TURN: 'Ход противника',
};

export const VUE_ELEMENTS = {
    SEA_BATTLE: '#sea-battle',
};
