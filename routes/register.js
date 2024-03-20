const router = require('express').Router();
const registerController = require('../controllers/playerRegister')

router.route("/")
    .post(registerController.createPlayer)
    .get(registerController.getPlayer)

module.exports = router;
