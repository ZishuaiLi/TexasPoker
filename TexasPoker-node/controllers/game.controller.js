const gameService = require('../services/game.service')

module.exports = {
    createRoom,
    startGame,
    action,
    joinRoom,
    leaveRoom,
    getGameStatus
};


function getGameStatus(req, res, next) {
    gameService.getGameStatus(req.user.sub)
        .then(value => res.json(value))
        .catch(err => next(err));
}

function createRoom(req, res, next) {
    gameService.createRoom(req.user.sub)
        .then(value => res.json(value))
        .catch(err => next(err));
}



function startGame(req, res, next) {
    gameService.startGame(req.body, req.user.sub)
        .then(value => res.json({message: value}), reason => res.status(400).json({message: reason}))
        .catch(err => next(err));
}

function action(req, res, next) {
    gameService.action(req.body, req.user.sub)
        .then(value => res.json({message: value}), reason => res.status(400).json({message: reason}))
        .catch(err => next(err));
}

function joinRoom(req, res, next) {
    gameService.joinRoom(req.body, req.user.sub)
        .then(value => res.json({message: value}), reason => res.status(400).json({message: reason}))
        .catch(err => next(err));
}

function leaveRoom(req, res, next) {
    gameService.leaveRoom(req.body, req.user.sub)
        .then(value => res.json({message: value}), reason => res.status(400).json({message: reason}))
        .catch(err => next(err));
}
