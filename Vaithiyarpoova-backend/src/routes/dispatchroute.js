const express = require('express');
const directorycontroller = require('../controller/dispatchcontroller');

const router = express.Router();

router.get('/getDirectoryDetails', directorycontroller.getalldirectory);
router.post('/saveDirectoryDetails', directorycontroller.savealldirectory);
router.post('/delDirectoryData', directorycontroller.deldirectorydata);
router.post('/getinventoryBrand', directorycontroller.getinventoryBrand);
router.post('/get-products-by-brand', directorycontroller.getProductsByinventoryBrand);
router.get('/getinventorylist', directorycontroller.getinventorylist);
router.post('/Addinventory', directorycontroller.Addinventory);
router.put('/productinventry/:inventory_recid', directorycontroller.EditeProductinventry);
router.post('/getUserBranch', directorycontroller.getUserBranch);
module.exports = router;