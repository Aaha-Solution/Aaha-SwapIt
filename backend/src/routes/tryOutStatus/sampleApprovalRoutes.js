const express = require('express');
const router = express.Router();
const sampleApprovalController = require('../../controllers/tryOutStatus/sampleApprovalController');

router.get('/', sampleApprovalController.list);
router.post('/', sampleApprovalController.create);

module.exports = router;
