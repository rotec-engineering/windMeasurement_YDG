const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res) {
    const deviceSearchQuery = `
        SELECT deviceName, 
            LEFT(registerDate, 10) AS registerDate, 
            LEFT(modifyDate, 10) AS modifyDate, 
            deviceId, 
            deviceType, 
            deviceImgSrc
        FROM finedust.device_manage
        ORDER BY deviceName
    `;

    connection.query(deviceSearchQuery, (err, rows) => {
        if(!err) {
            res.render('home/deviceManage', {
                dataOfTable: rows,                                                                          // [registerDate, modifyDate, deviceId, deviceType, deviceImgSrc]
                deviceImgSrc: rows[0].deviceImgSrc.substring(9, rows[0].deviceImgSrc.length)                // default path is 'public' So cut the front part
            })
        }
        else {
            console.log(err);
            res.render('home/deviceManage', err);
        }
    });
});

router.get('/api/init', (req, res) => {
    const otherDeviceSearchQuery = `
        SELECT deviceName, 
            LEFT(registerDate, 10) AS registerDate, 
            LEFT(modifyDate, 10) AS modifyDate, 
            deviceId,
            deviceType, 
            deviceImgSrc, 
            deviceLatitude, 
            deviceLongitude
        FROM finedust.device_manage
    `;

    connection.query(otherDeviceSearchQuery, (err, rows) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
            res.send(err);
        }
    });
});

router.get('/api/delete', (req, res) => {
    const param = req.query;
    const deviceDeleteQuery = `
        DELETE 
        FROM finedust.device_manage
        WHERE deviceId = ${param.deviceId}
    `;

    connection.query(deviceDeleteQuery, (err, rows) => {
        if (!err) {
            res.send("delete Success");
        }
        else {
            console.log(err);
            res.send(err);
        }
    });
});

module.exports = router;
