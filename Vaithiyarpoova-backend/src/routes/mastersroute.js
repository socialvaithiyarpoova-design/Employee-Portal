const express = require('express');
const masters = require('../controller/masterscontroller');
const router = express.Router();

// table param: brands, categories, form_factors, product_types, units, usertype
router.get('/masters/:table', masters.listMaster);
router.post('/masters/:table', masters.upsertMaster);
router.post('/masters/:table/delete', masters.softDeleteMaster);
router.post('/masters/check-impact', masters.checkImpact);

module.exports = router;

