const express = require('express');
const router = express.Router();
const trialRunController = require('../../controllers/tryOutStatus/trialRunController');

router.get('/', trialRunController.list);
router.post('/', trialRunController.create);

module.exports = router;
