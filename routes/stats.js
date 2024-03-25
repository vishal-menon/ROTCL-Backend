const router = require('express').Router()
const playerStatsController = require('../controllers/playerStatsController');

router.router('/')
        .get(playerStatsController.getStats)
        .put(playerStatsController.updateStats)