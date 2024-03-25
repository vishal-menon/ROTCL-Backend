const router = require('express').Router()
const playerStatsController = require('../controllers/playerStatsController');

router.route('/')
        .get(playerStatsController.getStats)
        .put(playerStatsController.updateStats)

module.exports = router