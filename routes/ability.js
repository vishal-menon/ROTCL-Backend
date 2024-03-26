const router = require('express').Router();
const AbilityController = require('../controllers/abilitiesController');

router.route('/')
    .post(AbilityController.addAbility)

router.route('/pet')
    .post(AbilityController.addPetAbility)

router.route('/pet/:uid')
    .get(AbilityController.getPetAbilities)

router.route('/:name')
    .get(AbilityController.getAbility)


module.exports = router;