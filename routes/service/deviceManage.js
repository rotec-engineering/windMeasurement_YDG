const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res) {
    res.render('home/deviceManage')
});

module.exports = router;
