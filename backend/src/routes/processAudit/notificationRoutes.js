const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/processAudit/notificationController');

router.get('/', notificationController.list);

module.exports = router;
