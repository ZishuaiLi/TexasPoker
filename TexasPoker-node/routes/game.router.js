const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');


router.get('/gamestatus', gameController.getGameStatus);
router.get('/createroom', gameController.createRoom);
router.post('/joinroom', gameController.joinRoom);
router.post('/leaveroom', gameController.leaveRoom);
router.post('/action', gameController.action);
router.post('/startgame', gameController.startGame);

module.exports = router;
