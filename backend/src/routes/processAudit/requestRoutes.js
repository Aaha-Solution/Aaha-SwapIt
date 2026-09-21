const express = require('express');
const router = express.Router();
const requestController = require('../../controllers/processAudit/requestController');

router.get('/', requestController.list);
router.get('/:id', requestController.getById);
router.post('/', requestController.create);

module.exports = router;
