const express = require('express');
const router = express.Router();
const pilotBatchController = require('../../controllers/tryOutStatus/pilotBatchController');

router.get('/', pilotBatchController.list);
router.post('/', pilotBatchController.create);

module.exports = router;
