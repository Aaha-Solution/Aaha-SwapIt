const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/ihlr/notificationController');

router.get('/', notificationController.list);

module.exports = router;
