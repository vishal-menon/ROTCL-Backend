const router = require('express').Router();
const AbilityController = require('../controllers/abilitiesController');
const AssignAbilityController = require('../controllers/assignAbilityController')

router.route('/')
    .post(AbilityController.addAbility)

router.route('/pet')
    .post(AbilityController.addPetAbility)

router.route('/pet/:mid')
    .get(AbilityController.getPetAbilities)

router.route('/petAll/:mid')
    .get(AbilityController.getAllAbilityDetailsPet)

router.route('/pet/assignAbility/:rarity/:mid')
    .post(AssignAbilityController.assignRandomAbility)

router.route('/listofsub/:name')
    .get(AbilityController.getSubAbilitiesBasedOnAbility)

router.route('/:name')
    .get(AbilityController.getAbility)



module.exports = router;