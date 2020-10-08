const express = require('express');
const router = express.Router();
const connection = require("../connection");

router.get('/api/update', function(req, res) {
    const dayWindQuery = `
    SELECT ROUND(AVG(windSpeed), 2) AS windSpeed,  SUBSTR(rgst_dt, 6, 5) AS rgst_dt
    FROM finedust_tb
    WHERE now() > rgst_dt
    GROUP BY LEFT(rgst_dt, 10)
    ORDER BY rgst_dt DESC
  `;

    connection.query(dayWindQuery, function (err, rows) {
        if(!err) {
            const dayWindData = rows;
            res.send(dayWindData);
        } else {
            console.log('dayWindData send Err' + err);
            res.send(err);
        }
    })
})

module.exports = router;