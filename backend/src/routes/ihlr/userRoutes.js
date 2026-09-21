const express = require('express');
const router = express.Router();
const userController = require('../../controllers/ihlr/userController');

router.get('/engineers', userController.getEngineers);

module.exports = router;
