const router = require('express').Router()
const playerStatsController = require('../controllers/playerStatsController');

router.route('')
        .get(playerStatsController.allPlayerStats)

router.route('/:uid')
        .put(playerStatsController.updatePlayerStats)

router.route('/:uid')
        .get(playerStatsController.getPlayerStats)

module.exports = router