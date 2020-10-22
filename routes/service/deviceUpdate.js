const express = require('express');
const router = express.Router();
const connection = require("../connection");
const fs =require('fs');
const multer = require('multer');
const storage = multer.diskStorage({                                                // set storage of multer
    destination: (req, file, callback) => {                                             // file storage address
        callback(null, "public/images/deviceImg/");
    },
    filename: (req, file, callback) => {                                                // file rename to originalName
        callback(null, file.originalname);
    }
});
const uploader = multer({storage: storage});                                      // upload img file on server

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
        SELECT deviceName, 
            LEFT(registerDate, 10) AS registerDate, 
            deviceId, 
            deviceType, 
            deviceImgSrc, 
            deviceLatitude, 
            deviceLongitude
        FROM finedust.device_manage
        WHERE ${param.deviceId} = deviceId
    `;

    connection.query(getDeviceInfoQuery, function (err, rows) {
       deviceInfo = rows;
       deviceImgSrc = rows[0].deviceImgSrc.substring(9, rows[0].deviceImgSrc.length);
    });
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
    });
});

router.get('/api/init', (req, res) => {
    const param = req.query;
    const getLatLng = `
        SELECT deviceLatitude, 
            deviceLongitude,
            deviceImgSrc
        FROM finedust.device_manage 
        WHERE deviceId = ${param.deviceId}
    `;

    connection.query(getLatLng, (err, rows) => {
        if (!err) {
            res.send(rows[0]);
        }
        else {
            console.log(err);
            res.send(err);
        }
    });
});

// TODO: user's Img of before should be delete
router.post('/api/update', uploader.single('deviceImg'), (req, res) => {
    const param = req.body;
    const fileSrc = './public/images/deviceImg/';
    const fileName = req.file === undefined ? '' : req.file.filename;                                                   // if user didnt choose Img, the err would be happen
    const deviceImgSrc = fileName === '' ? param.deviceImgSrc : fileSrc + param.deviceId + '_' + fileName;              // if user didnt choose Img
    const registerQuery = `
        UPDATE finedust.device_manage 
        SET deviceName = '${param.deviceName}', 
            deviceType = '${param.deviceType}', 
            modifyDate = '${currentTime()}', 
            deviceImgSrc = '${deviceImgSrc}', 
            imgLoadStatus = 'uploaded',
            deviceLatitude = '${param.deviceLatitude}', 
            deviceLongitude = '${param.deviceLongitude}'
        WHERE deviceId = ${param.deviceId}
    `;

    if(param.deviceName === '' || param.deviceType === '') {                                                            // check the 'null' value from deviceName & deviceType
        const errMsg = 'register Err';
        res.send(errMsg)

        return 0;
    }

    connection.query(registerQuery, (err, rows) => {
        if (!err) {
            if(fileName !== '') {                                                                                       // not registered deviceImg
                fs.rename(fileSrc + fileName, deviceImgSrc, function (err) {             // file rename (if I need, I could divide ImgFolder follow with users)
                    if (err) {
                        throw err;
                    }
                });
            }
            const successMsg = "수정을 완료했습니다.";
            res.send(successMsg);
        }
        else {
            console.log(err);
            res.send(err);
        }
    });

    if(fileName !== '') {                                                                                               // if Img was changed, existing Img would be deleted
        fs.unlink(param.deviceImgSrc, function (err) {
            if (err) {
                throw err;
            }
        });
        console.log("ImgFile del");
    }
});

module.exports = router;
