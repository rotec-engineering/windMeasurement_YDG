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
};

/* GET home page. */
router.get('/', function(req, res) {
    const getDeviceTypeQuery = `
    SELECT distinct deviceType, deviceId
    FROM finedust.device_manage
    GROUP BY deviceType
    `;

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
    });
});

router.post('/api/register', uploader.single('deviceImg'), (req, res) => {
    const param = req.body;
    //-- kind of imgLoadStatus => 'uploading' & 'uploaded --//
    const registerQuery = `
        INSERT INTO finedust.device_manage (deviceName, deviceType, imgLoadStatus, deviceLatitude, deviceLongitude)
        VALUES ("${param.deviceName}", "${param.deviceType}", "uploading", "${param.latitude}", "${param.longitude}")
    `;
    //-- get the latest deviceId in same trigger (@@IDENTITY)--//
    const currentDeviceIdSelectQuery = `
        SELECT @@IDENTITY AS deviceId                                                    
    `;

    if(param.deviceName === '' || param.deviceType === '') {                                                            // check the 'null' value from deviceName & deviceType
        const errMsg = 'register Err';
        res.send(errMsg)

        return 0;
    }

    connection.query(registerQuery, (err, rows) => {
        if (!err) {
            const successMsg = "device insert success";
            console.log(successMsg);
        }
        else {
            console.log(err);
            res.send(err);
        }
    });
    // TODO: should improve the performance by change the query statements [2020-10-21]
    connection.query(currentDeviceIdSelectQuery, function (err, rows) {
        const fileSrc = './public/images/deviceImg/';
        const fileName = req.file === undefined ? '' : req.file.filename;                                               // if user didnt choose Img, the err would be happen
        const deviceId = rows[0].deviceId;
        const deviceImgSrc = fileName === '' ? '' : fileSrc + deviceId + '_' + fileName;                                // if user didnt choose Img

        // kind of imgLoadStatus => 'uploading' & 'uploaded //
        const deviceImgSrcInsertQuery = `
            UPDATE finedust.device_manage
                SET deviceImgSrc = '${deviceImgSrc}', imgLoadStatus = 'uploaded'
                WHERE deviceId = '${deviceId}'
        `;

        if(!err) {
            if(fileName !== '') {                                                                                       // registered deviceImg
                fs.rename(fileSrc + fileName, deviceImgSrc, function (err) {             // file rename (if I need, I could divide ImgFolder follow with users)
                    if (err) {
                        throw err;
                    }
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
