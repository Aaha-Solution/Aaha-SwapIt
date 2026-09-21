const express = require('express');
const router = express.Router();
const scrapController = require('../../controllers/ihlr/scrapController');

router.get('/', scrapController.list);
router.post('/', scrapController.create);

module.exports = router;
