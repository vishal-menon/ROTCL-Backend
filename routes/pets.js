const router = require('express').Router();
const PetsController = require('../controllers/petsController');

router.route('/:mid')
    .get(PetsController.getPet)
    .put(PetsController.updatePet)

router.route('/player/:uid')
    .get(PetsController.getPetsbyPlayer)
    .post(PetsController.addPet)

module.exports = router;