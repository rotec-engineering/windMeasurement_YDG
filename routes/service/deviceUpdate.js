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
    SET deviceName = '${param.deviceName}', deviceType = '${param.deviceType}', modifyDate = '${currentTime()}', imgLoadStatus = 'uploading'
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

router.post('/api/imgUpload', uploader.single('deviceImg'), (req, res, next) => {
    // console.log(req.file.filename);
    const deviceImgSrcChangeQuery = `
    SELECT deviceId
    FROM finedust.device_manage
    WHERE imgLoadStatus = 'uploading'
    `

    connection.query(deviceImgSrcChangeQuery, function (err, rows) {
        const fileSrc = './public/images/deviceImg/';
        const fileName = req.file === undefined ? '' : req.file.filename;                                               // if user didnt choose Img, the err would be happen
        let deviceImgSrc = fileName === '' ? fileSrc + "notImg.jpg" : fileSrc + rows[0].deviceId + '_' + fileName;      // if user didnt choose Img

        // kind of imgLoadStatus => 'uploading' & 'uploaded //
        const deviceImgSrcInsertQuery = `
        UPDATE finedust.device_manage
        SET deviceImgSrc = '${deviceImgSrc}', imgLoadStatus = 'uploaded'
        WHERE imgLoadStatus = 'uploading'
        `;

        if(!err) {
            if(fileName !== '') {                                                                                       // not registered deviceImg
                fs.rename(fileSrc + fileName, deviceImgSrc, function (err) {             // file rename (if I need, I could divide ImgFolder follow with users)
                    if (err) throw err;
                });
            }

            connection.query(deviceImgSrcInsertQuery, function(err, rows) {                                             // insert new imgSrc
                if (!err) {
                    const successMsg = "장치를 등록했습니다.";
                    res.send(successMsg);
                }
                else {
                    console.log(err);
                    res.send(err);
                }
            })
        }
        else {
            console.log("imageSrc Change Err");
            return 0;
        }
    })
});

module.exports = router;
