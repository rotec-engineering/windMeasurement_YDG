const express = require('express');
const router = express.Router();
const connection = require("../connection");
const fs =require('fs');

/* GET home page. */
router.get('/', function(req, res) {
    const deviceSearchQuery = `
        SELECT deviceName, 
            LEFT(registerDate, 10) AS registerDate, 
            LEFT(modifyDate, 10) AS modifyDate, 
            deviceId, 
            deviceType,
            deviceLatitude,
            deviceLongitude        
--             deviceImgSrc
        FROM finedust.device_manage
        ORDER BY deviceName
    `;

    connection.query(deviceSearchQuery, (err, rows) => {
        if(!err) {
            res.render('home/deviceManage', {'dataOfTable': rows.map(data => {
                    return {
                        deviceId: data.deviceId,
                        deviceName: data.deviceName,
                        deviceType: data.deviceType,
                        deviceLatitude: data.deviceLatitude,
                        deviceLongitude: data.deviceLongitude,
                        registerDate: data.registerDate,
                        modifyDate: data.modifyDate
                    }
                })
            });
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

    connection.query(otherDeviceSearchQuery, function (err, rows) {
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
    let deviceImgSrc;
    const param = req.query;
    const deviceDeleteQuery = `
        DELETE 
        FROM finedust.device_manage
        WHERE deviceId = ${param.deviceId}
    `;
    const existingImgSrc = `
        SELECT deviceImgSrc
        FROM finedust.device_manage
        WHERE deviceId = ${param.deviceId}
    `;

    connection.query(existingImgSrc, function (err, rows) {                                                 // get existing ImgSrc
        if(!err) {
            deviceImgSrc = rows[0].deviceImgSrc;
        }
        else {
            res.send("loadExistingImgSrc Err");
        }
    });

    connection.query(deviceDeleteQuery, function (err) {
        if (!err) {
            if(deviceImgSrc !== '' && deviceImgSrc !== undefined){                                                         // if Img wasnt exist, not delete Img
                fs.unlink(deviceImgSrc, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }

            res.send("device Delete Success");
        }
        else {
            res.send(err);
        }
    });
});

module.exports = router;
