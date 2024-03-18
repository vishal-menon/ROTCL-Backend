const router = require('express').Router()
const loginController = require('../controllers/playerAuth')

router.route("/").post(loginController.handleLogin)

module.exports = router