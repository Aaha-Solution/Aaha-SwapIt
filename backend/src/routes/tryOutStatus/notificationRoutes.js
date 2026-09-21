const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/tryOutStatus/notificationController');

router.get('/', notificationController.list);

module.exports = router;
