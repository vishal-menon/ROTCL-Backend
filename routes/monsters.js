const router = require('express').Router();
const MonstersController = require('../controllers/monstersIndexController');

router.route('/starters')
    .get(MonstersController.getStarters)

router.route('/:name')
    .get(MonstersController.getMonsterByName)

module.exports = router