const router = require('express').Router();
const PetsController = require('../controllers/petsController');

router.route('/')
    .get(PetsController.getPetsbyPlayer)
    .put(PetsController.updatePet)
    .post(PetsController.addPet)

module.exports = router