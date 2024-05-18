const router = require('express').Router();
const AbilityController = require('../controllers/abilitiesController');
const AssignAbilityController = require('../controllers/assignAbilityController')

router.route('/')
    .post(AbilityController.addAbility)

router.route('/pet')
    .post(AbilityController.addPetAbility)

router.route('/pet/:mid')
    .get(AbilityController.getPetAbilities)

router.route('/pet/assignAbility')
    .post(AssignAbilityController.assignRandomAbility)

router.route('/listofsub/:name')
    .get(AbilityController.getSubAbilitiesBasedOnAbility)

router.route('/:name')
    .get(AbilityController.getAbility)



module.exports = router;