const express = require('express');
const router = express.Router();
// const moment = require('moment');
const connection = require("../connection");

/* GET home page. */
function currentTime() {
    let date = new Date();
    let current = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    return current;
}
router.get('/', function(req, res) {
    const getDeviceTypeQuery = `
    SELECT distinct deviceType, deviceId
    FROM finedust.device_manage
    GROUP BY deviceType
    `

    connection.query(getDeviceTypeQuery, function (err, rows) {
        if(!err) {
            res.render('home/deviceRegister', {
                deviceData: rows,
                currentTime: currentTime()
            })
        }
        else {
            res.render('home/deviceRegister', err);
        }
    })
});

router.get('/api/register', (req, res) => {
    const param = req.query;
    const registerQuery = `
    INSERT INTO finedust.device_manage (deviceName, deviceType)
    VALUES ("${param.deviceName}", "${param.deviceType}")
    `

    connection.query(registerQuery, (err, rows) => {
        if (!err) {
            res.send("data registration success");
        }
        else {
            console.log(err);
            res.send(err);
        }
    })
})

module.exports = router;
