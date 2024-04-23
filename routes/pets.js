const router = require('express').Router();
const PetsController = require('../controllers/petsController');

router.route('/')
    .put(PetsController.updatePet)
    .post(PetsController.addPet)

router.route('/:id')
    .get(PetsController.getPetsbyPlayer)


module.exports = router