const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res) {
    const deviceSearchQuery = `
    SELECT deviceName, LEFT(registerDate, 10) AS registerDate, LEFT(modifyDate, 10) AS modifyDate, deviceId, deviceType
    FROM finedust.device_manage
    ORDER BY deviceName
    `;
    connection.query(deviceSearchQuery, (err, rows) => {
        if(!err) {
            res.render('home/deviceManage', {
                dataOfTable: rows
            })
        }
        else {
            console.log(err);
            res.render('home/deviceManage', err);
        }
    })
});

module.exports = router;
