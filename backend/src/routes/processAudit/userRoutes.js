const express = require('express');
const router = express.Router();
const userController = require('../../controllers/processAudit/userController');

router.get('/auditors', userController.getAuditors);

module.exports = router;
