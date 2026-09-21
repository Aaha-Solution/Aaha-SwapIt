const express = require('express');
const router = express.Router();
const lineRejectionController = require('../../controllers/ihlr/lineRejectionController');

router.get('/', lineRejectionController.list);
router.post('/', lineRejectionController.create);

module.exports = router;
