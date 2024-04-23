const starterPetsController = require('../controllers/starterPets');
const router = require('express').Router();

router.route('/').post(starterPetsController.addStarterPets);

module.exports = router;