const express = require('express');
const router = express.Router()
const playerController = require('../controllers/players')

router.route("/")
    .get(playerController.getAllPlayers)
    .post(playerController.createPlayer)
    
module.exports = router;
