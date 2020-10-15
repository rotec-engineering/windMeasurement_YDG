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
    let deviceImgSrc
    const param = req.query;
    const getDeviceTypeQuery = `
    SELECT distinct deviceType
    FROM finedust.device_manage
    GROUP BY deviceType
    `;
    const getDeviceInfoQuery = `
    SELECT deviceName, LEFT(registerDate, 10) AS registerDate, deviceId, deviceType, deviceImgSrc
    FROM finedust.device_manage
    WHERE ${param.deviceId} = deviceId
    `;

    connection.query(getDeviceInfoQuery, function (err, rows) {
       deviceInfo = rows;
       deviceImgSrc = rows[0].deviceImgSrc.substring(9, rows[0].deviceImgSrc.length);
    })
    connection.query(getDeviceTypeQuery, function (err, rows) {
        if(!err) {
            res.render('home/deviceUpdate', {
                deviceData: rows,
                deviceInfo: deviceInfo,
                deviceImgSrc: deviceImgSrc
            })
        }
        else {
            res.render('home/deviceUpdate', err);
        }
    })
});

// TODO: should make multer function
router.get('/api/update', (req, res) => {
    const param = req.query;
    const registerQuery = `
    UPDATE finedust.device_manage 
    SET deviceName = '${param.deviceName}', deviceType = '${param.deviceType}', modifyDate = '${currentTime()}'
    WHERE deviceId = ${param.deviceId}
    `;

    connection.query(registerQuery, (err, rows) => {
        if (!err) {
            res.send("data update success");
        }
        else {
            console.log(err);
            res.send(err);
        }
    })
})

module.exports = router;
