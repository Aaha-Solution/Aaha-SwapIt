const express = require('express');
const router = express.Router();
const rootCauseController = require('../../controllers/ihlr/rootCauseController');

router.get('/rejection/:rejectionId', rootCauseController.getByRejection);
router.post('/', rootCauseController.create);

module.exports = router;
