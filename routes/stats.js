const router = require('express').Router()
const playerStatsController = require('../controllers/playerStatsController');

router.route('/')
        .put(playerStatsController.updateStats)

router.route('/:id')
        .get(playerStatsController.getStats)

module.exports = router