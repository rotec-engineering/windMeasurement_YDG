const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require("../connection");

// 현 시간을 나타내는 함수
function todayDate() {
    let today = new Date();

    let year = today.getFullYear();
    let month = today.getMonth();
    let date = today.getDate();

    let hours = today.getHours();
    let minutes = today.getMinutes();

    return year + '/' + month + '/' + date + ' ' + hours + ':' + minutes;
}

/* GET home page. */
router.get('/', function(req, res, next) {
    const query = `
    SELECT ROUND(AVG(windDirection), 2), left(rgst_dt, 10) 
    FROM (
        SELECT MAX(rgst_dt) as nearDate FROM finedust_tb) a, finedust_tb as b
    WHERE a.nearDate = b.rgst_dt
    `;

    connection.query(query, function (err, rows, fields) {
        if(!err) {
            console.log('rows[0].windDirection' + rows[0].windDirection);
            res.render('index', {
                'windData': rows[0].windDirection
            });
        } else {
            console.log('wind data send Err' + err);
            res.render('home/windInfo', err);
        }
    })

});

/* GET home page. */
router.get('/api/update', function(req, res, next) {
    const query = `
    SELECT ROUND(AVG(windDirection), 2) AS windDirection, ROUND(AVG(windSpeed), 2) AS windSpeed
    FROM finedust_tb
    GROUP BY left(rgst_dt, 10) AS date
    WHERE date = ${todayDate()}
    `;

    connection.query(query, function(err, rows, fields) {
        if(!err) {
            const html = `
                <img class="wind-direction-icon" src="images/arrow-icon.png" alt="wind-direction" style="width: 40px; transform: rotate(${rows[0].windDirection});" />
            `
            console.log('windData=>' + rows[0].windDirection);
            res.send(html);
        } else {
            console.log('wind data send Err' + err);
            res.send(err);
        }
    })
    res.render('index', { title: 'Express' });
});

module.exports = router;
