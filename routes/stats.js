const router = require('express').Router()
const playerStatsController = require('../controllers/playerStatsController');

router.route('/:uid')
        .put(playerStatsController.updateStats)

router.route('/:uid')
        .get(playerStatsController.getStats)

module.exports = router