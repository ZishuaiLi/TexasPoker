const userService = require('../services/user.service')
const Hand = require('pokersolver').Hand;

let gameRoomId = 1;
let gameRooms = [];

const TIME_FOR_TURN = 1000;

module.exports = {
    createRoom,
    joinRoom,
    leaveRoom,
    action,
    startGame,
    getGameStatus,
};

async function getGameStatus(username)
{
    username = await userService.getUsernameById(username);
    let room = getRoomByUser(username);
    if (!room) {
        return {
            id: -1, started: false, host: null, currentPlayer: null,
            player: null, otherPlayers: null, cards: null, maxBets:-1
        };
    }
    let gameStatus = {
        id: room.id,
        started: room.started, //Game is not started at the beginning
        host: room.host,
        currentPlayer: room.started ? room.currentPlayer : "",
        player: null,
        otherPlayers: [],
        cards: [],
        maxBets: room.maxBets,
        winner: room.winner === "" ? "No winner" : room.winner,
    };
    room.players.forEach(value => {
        let player = {
            name: value.name,
            order: value.order,
            money: value.money,
            bet: value.bet,
            remainTime: Math.ceil(value.remainTime),
            firstHand: value.firstHand === "" ? "unknown" : value.firstHand,
            secondHand: value.secondHand === "" ? "unknown" : value.secondHand,
            actionTimes: 0
        }
        if (gameStatus.started)
        {
            if (value.status !== "")
                player.status = value.status;
            else if (gameStatus.currentPlayer === value.name)
                player.status = "Operating";
            else
                player.status = "Waiting";
        }
        else
        {
            player.status = "Waiting";
        }
        if (value.name === username)
        {
           gameStatus.player = player;
        }
        else
        {
           //Players cannot see others' cards
           if (gameStatus.started)
           {
               player.firstHand = "unknown";
               player.secondHand = "unknown";
           }
           gameStatus.otherPlayers.push(player);
        }
    });
    for (let i = 0; i < room.showingCard; i++)
        gameStatus.cards.push(room.cards[i]);
    for (let i = 0; i < 5 - room.showingCard; i++)
        gameStatus.cards.push("unknown");
    return gameStatus;
}

async function createRoom(username)
{
    username = await userService.getUsernameById(username);
    //If the user has joined a game room,
    //then they are not allowed to create room
    if (getRoomByUser(username))
        return -1;

    let player = {
        name:username,
        status: "",
        order: -1,
        money: await userService.getMoney(username),
        bet: -1,
        remainTime: -1,
        firstHand: "",
        secondHand: "",
        action: "",
    }

    let newRoom = {
        id: gameRoomId++,
        started: false,
        host: username,
        currentPlayer: null,
        players: [],
        tickId: -1,
        showingCard: -1,
        cards: [],
        allBets: 0,
        maxBets: 0,
        actionRound: 0,
        maxActionTimes: 0,
        winner: "",
    }

    newRoom.players.push(player);
    newRoom.tickId = setInterval(()=>tick(newRoom), 200);
    gameRooms.push(newRoom);
    return newRoom.id;
}

async function joinRoom(req, username)
{
    username = await userService.getUsernameById(username);
    let roomId = req.hasOwnProperty("roomId") ? req.roomId : -1;

    let money = await userService.getMoney(username);
    if (money < 20)
        return "Your do not have enough money to play games";

    //If the user has joined a game room,
    //then they are not allowed to create room
    if (getRoomByUser(username))
        return "You have joined a game room!";

    let player = {
        name:username,
        status: "",
        order: -1,
        money: await userService.getMoney(username),
        bet: -1,
        remainTime: -1,
        firstHand: "",
        secondHand: "",
        action: "",
        actionTimes: 0,
    }
    let room = getRoomById(roomId);
    if (!room)
        return "Game room " + roomId + " does not exist";

    room.players.push(player);
    return "You have joined game room " + roomId;
}

async function leaveRoom(req, username)
{
    username = await userService.getUsernameById(username);
    let roomId = req.hasOwnProperty("roomId") ? req.roomId : -1;
    let room = getRoomById(roomId);
    if (!room)
        return "Game room " + roomId + " does not exist";

    let player = room.players.find(value => value.name === username);
    if (player)
        room.players.splice(room.players.indexOf(player), 1);

    return "You have leaved game room " + roomId;
}

async function action(req, username)
{
    username = await userService.getUsernameById(username);
    let roomId = req.hasOwnProperty("roomId") ? req.roomId : -1;
    let action = req.hasOwnProperty("action") ? req.action : "";
    let room = getRoomById(roomId);
    if (!room)
        return "Game room " + roomId + " does not exist anymore, please leave this room";

    let player = room.players.find(value => value.name === username);
    if (!player)
        return "You are not in game room " + roomId + " , please leave and re-join this room";

    if (room.currentPlayer !== player.name)
        return "It is not your turn"

    player.action = action;
    return "OK";
}

async function startGame(req, username)
{
    username = await userService.getUsernameById(username);
    let roomId = req.hasOwnProperty("roomId") ? req.roomId : -1;

    let room = getRoomById(roomId);
    if (!room)
        return "Game room " + roomId + " does not exist";

    if (room.host !== username)
        return "You are not the host of game room" + roomId;

    if (room.started === true)
        return "The game has already started";

    if (room.players.length <= 1)
        return "Not enough players (Need at least two)"

    let orders = [];
    for (let i = 1; i <= room.players.length; i++)
        orders.push(i);


    let cards = [
        "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "TH", "JH", "QH", "KH",
        "AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "TS", "JS", "QS", "KS",
        "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "TC", "JC", "QC", "KC",
        "AI", "2I", "3I", "4I", "5I", "6I", "7I", "8I", "9I", "TI", "JI", "QI", "KI",];

    shuffle(orders);
    shuffle(cards);

    room.cards = [];

    for (let i = 0; i < 5; i ++)
        room.cards.push(cards[i]);

    for (let i = 0; i < room.players.length; i++)
    {
        room.players[i].bet = 0;
        room.players[i].order = orders[i];
        room.players[i].remainTime = -1;
        room.players[i].firstHand = cards[5 + i * 2];
        room.players[i].secondHand = cards[6 + i * 2];
        room.players[i].action = "";
        room.players[i].status = "";
        room.players[i].actionTimes = 0;
        if (room.players[i].order === 1)
        {
            await userService.changeMoney(room.players[i].name, -5);
            room.players[i].money = await userService.getMoney(room.players[i].name);
            room.players[i].bet = 5;
        }
    }


    arrangeOrder(room, true);

    room.allBets = 5;
    room.maxBets = 5;

    room.showingCard = 0;
    room.started = true;
    room.actionRound = 1;
    room.maxActionTimes = 0;
    room.winner = "";

    return "The game is started";
}


async function tick(gameRoom)
{
    if (gameRoom.players.length <= 0)
    {
        deleteRoom(gameRoom);
        return;
    }
    if (gameRoom.started === false)
        return;

    let activeNumber = 0;
    gameRoom.players.forEach(value => {
        if (value.order > 0)
            activeNumber++;
    })

    if (activeNumber <= 1 || gameRoom.actionRound > 4)
    {
        await calculateResult(gameRoom);
        gameRoom.started = false;
    }

    let player = gameRoom.players.find(value => value.name === gameRoom.currentPlayer);
    if (!player)
    {
        return;
    }


    player.remainTime -= 0.2;
    if (player.remainTime < -0.2)
    {
        player.action = "fold";
    }

    if (player.action !== "")
    {
        arrangeOrder(gameRoom, true);

        if (player.bet > gameRoom.maxBets)
            gameRoom.maxBets = player.bet;

        if (player.action === "fold")
        {
            player.order = -1;
            player.status = "fold";
        }
        else
        {
            let playerMoney = await userService.getMoney(player.name);
            if (playerMoney <= (gameRoom.maxBets - player.bet))
                player.action = "allin";
        }

        if (player.action === "call")
        {
            if (player.bet < gameRoom.maxBets)
            {
                await userService.changeMoney(player.name, -(gameRoom.maxBets - player.bet));
                gameRoom.allBets += (gameRoom.maxBets - player.bet);
                player.bet = gameRoom.maxBets;
            }
        }
        else if (player.action === "raise")
        {
            await userService.changeMoney(player.name, -(gameRoom.maxBets + 5 - player.bet));
            gameRoom.allBets += (gameRoom.maxBets + 5 - player.bet);
            player.bet = gameRoom.maxBets + 5;
        }
        else if (player.action === "allin")
        {
            player.order = 0;
            player.status = "all-in";
            let playerMoney = await userService.getMoney(player.name);
            gameRoom.allBets += playerMoney;
            player.bet += playerMoney;
            await userService.changeMoney(player.name, -playerMoney);
        }

        if (player.bet > gameRoom.maxBets)
            gameRoom.maxBets = player.bet;

        player.money = await userService.getMoney(player.name);

        player.action = "";
        player.actionTimes++;
        if (player.actionTimes > gameRoom.maxActionTimes)
            gameRoom.maxActionTimes = player.actionTimes;

        //check if it is next round
        let nextRoundFlag = true;
        gameRoom.players.forEach(value => {
            if (value.order > 0 &&
                (value.bet !== gameRoom.maxBets || value.actionTimes !== gameRoom.maxActionTimes))
                nextRoundFlag = false;
        })
        if (nextRoundFlag)
        {
            gameRoom.actionRound++;
            switch (gameRoom.showingCard) {
                case 0:
                    gameRoom.showingCard = 3;
                    break;
                case 3:
                    gameRoom.showingCard = 4;
                    break;
                case 4:
                    gameRoom.showingCard = 5;
                    break;
            }
        }
    }
}

function arrangeOrder(gameRoom, next) {
    let order = 1;
    for (let i = 1; i < gameRoom.players.length + 1; i++)
    {
        let player = gameRoom.players.find(value => value.order === i);
        if (player)
        {
            player.order = order;
            order++;
        }
    }

    if (next)
    {
        for (let i = 0; i < gameRoom.players.length; i++)
        {
            if (gameRoom.players[i].order > 0)
            {
                gameRoom.players[i].order--;
                if (gameRoom.players[i].order === 0)
                {
                    gameRoom.players[i].remainTime = -1;
                    gameRoom.players[i].order = order - 1;
                }
                if (gameRoom.players[i].order === 1)
                {
                    gameRoom.currentPlayer = gameRoom.players[i].name;
                    gameRoom.players[i].remainTime = TIME_FOR_TURN;
                }
            }
        }
    }
}

function deleteRoom(gameRoom)
{
    let roomIndex = gameRooms.indexOf(gameRoom);
    if (roomIndex >= 0)
        gameRooms.splice(roomIndex, 1);
    clearInterval(gameRoom.tickId);
}

function getCardForCompare(card) {
    let new_card = '' + card.charAt(0);
    if (card.charAt(1) === 'C')
        new_card += 'c';
    else if (card.charAt(1) === 'S')
        new_card += 's';
    else if (card.charAt(1) === 'I')
        new_card += 'd';
    else if (card.charAt(1) === 'H')
        new_card += 'h';
    return new_card;
}

async function calculateResult(gameRoom)
{
    let player = null;
    let playerHand = null;
    gameRoom.players.forEach(value => {
        if (value.order >= 0)
        {
            if (!player)
            {
                player = value;
                let valueCard = [];
                gameRoom.cards.forEach(value => valueCard.push(getCardForCompare(value)));
                valueCard.push(getCardForCompare(value.firstHand));
                valueCard.push(getCardForCompare(value.secondHand));
                playerHand = Hand.solve(valueCard);
            }
            else
            {
                let valueCard = [];
                gameRoom.cards.forEach(value => valueCard.push(getCardForCompare(value)));
                valueCard.push(getCardForCompare(value.firstHand));
                valueCard.push(getCardForCompare(value.secondHand));
                let valueHand = Hand.solve(valueCard);
                console.log(playerHand);
                console.log(valueHand);
                if (Hand.winners([playerHand, valueHand])[0] === valueHand)
                {
                    player = value;
                    playerHand = valueHand;
                }
                console.log("Winner is " + player.name);
            }
        }
    });

    if (player)
    {
        gameRoom.winner = player.name;
        await userService.changeMoney(player.name, gameRoom.allBets);
    }
}

function getRoomByUser(username)
{
    return gameRooms.find(value => value.players.find(value => value.name === username));
}

function getRoomById(roomId)
{
    return gameRooms.find(value => value.id === roomId);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let t = array[i];
        array[i] = array[j];
        array[j] = t;
    }
}
