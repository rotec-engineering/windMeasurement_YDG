const express = require('express');
const router = express.Router();
const connection = require("../connection");

function currentTime() {
    let date = new Date();
    let current = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    return current;
}

/* GET home page. */
router.get('/', function(req, res) {
    let deviceInfo;
    const param = req.query;
    const getDeviceTypeQuery = `
    SELECT distinct deviceType, deviceId
    FROM finedust.device_manage
    GROUP BY deviceType
    `;
    const getDeviceInfoQuery = `
    SELECT deviceName, LEFT(registerDate, 10) AS registerDate
    FROM finedust.device_manage
    WHERE ${param.deviceId*1} = deviceId
    `

    connection.query(getDeviceInfoQuery, function (err, rows) {
       deviceInfo = rows;
    })
    connection.query(getDeviceTypeQuery, function (err, rows) {
        if(!err) {
            res.render('home/deviceUpdate', {
                deviceData: rows,
                deviceInfo: deviceInfo
            })
        }
        else {
            res.render('home/deviceUpdate', err);
        }
    })
});

module.exports = router;
