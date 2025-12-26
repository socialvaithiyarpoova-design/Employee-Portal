const express = require('express');
const todocontroller = require('../controller/todocontroller');

const router = express.Router();

router.post('/getTodoList', todocontroller.todolist);
router.post('/updateLeads', todocontroller.updateLeads);
router.post('/getCommentsHistory', todocontroller.getCommentsHistory);
module.exports = router;