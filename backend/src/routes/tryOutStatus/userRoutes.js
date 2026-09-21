const express = require('express');
const router = express.Router();
const userController = require('../../controllers/tryOutStatus/userController');

router.get('/tooling-engineers', userController.getToolingEngineers);

module.exports = router;
