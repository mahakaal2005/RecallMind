const express = require('express');
const { getHealth, getSystemInfo } = require('../controllers/systemController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/system/info', getSystemInfo);

module.exports = router;
