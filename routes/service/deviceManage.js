const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res) {
    const deviceSearchQuery = `
    SELECT deviceName, LEFT(registerDate, 10) AS registerDate, LEFT(modifyDate, 10) AS modifyDate, deviceId, deviceType, deviceImgSrc
    FROM finedust.device_manage
    ORDER BY deviceName
    `;
    connection.query(deviceSearchQuery, (err, rows) => {
        if(!err) {
            res.render('home/deviceManage', {
                dataOfTable: rows,
                deviceImgSrc: rows[0].deviceImgSrc.substring(9, rows[0].deviceImgSrc.length)
            })
        }
        else {
            console.log(err);
            res.render('home/deviceManage', err);
        }
    })
});

router.get('/api/search', (req, res) => {
    const param = req.query;
    const otherDeviceSearchQuery = `
    SELECT deviceName, LEFT(registerDate, 10) AS registerDate, LEFT(modifyDate, 10) AS modifyDate, deviceType, deviceImgSrc
    FROM finedust.device_manage
    WHERE deviceId = ${param.deviceId}
    `
    connection.query(otherDeviceSearchQuery, (err, rows) => {
        if (!err) {
            let result = null;
            let modifyDate = rows[0].modifyDate === null ? '' : rows[0].modifyDate;
            let deviceImgSrc = rows[0].deviceImgSrc === null ? '' : rows[0].deviceImgSrc.substring(9, rows[0].deviceImgSrc.length);
            console.log(deviceImgSrc);

            const html = `
                <tr>
                    <td colspan="2" style="border: 2px solid; height: 300px">
                    <img src=${deviceImgSrc}>
                </td>
                <tr>
                    <th style="width: 30%; border: 1px solid"> 장치 타입 </th>
                    <td style="width: 70%; border: 1px solid"> ${rows[0].deviceType} </td>
                </tr>
                <tr>
                    <th style="width: 30%; border: 1px solid"> 등록 일 </th>
                    <td style="width: 70%; border: 1px solid"> ${rows[0].registerDate} </td>
                </tr>
                <tr> 
                    <th style="width: 30%; border: 1px solid"> 수정 일</th>
                    <td style="width: 70%; border: 1px solid"> ${modifyDate} </td>
                </tr>
            `
            result += html

            res.send(result);
        }
        else {
            console.log(err);
            res.send(err);
        }
    })
})

router.get('/api/delete', (req, res) => {
    const param = req.query;
    console.log(param.deviceId);
    const deviceDeleteQuery = `
    DELETE 
    FROM finedust.device_manage
    WHERE deviceId = ${param.deviceId}
    `
    connection.query(deviceDeleteQuery, (err, rows) => {
        if (!err) {
            res.send("delete Success");
        }
        else {
            console.log(err);
            res.send(err);
        }
    })
})

module.exports = router;
