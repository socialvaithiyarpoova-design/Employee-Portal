const express = require('express');
const clientcontroller = require('../controller/clientcontroller');

const router = express.Router();

router.post('/getClientsData', clientcontroller.getclientdata);
router.post('/getViewWalletHis', clientcontroller.getViewWalletHis);

module.exports = router;
