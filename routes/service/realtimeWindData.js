const express = require('express');
const router = express.Router();
const connection = require("../connection");

router.get('/api/search', function(req, res, next) {
    const todayWindSpeedSearchQuery = `
    SELECT SUBSTR(windSpeed, 1, 3) AS windSpeed
    FROM finedust_tb
    order by rgst_dt desc
  `;

    connection.query(todayWindSpeedSearchQuery, function (err, rows, fields) {
        if(!err) {
            const result = rows[0].windSpeed

            res.send(result);
        } else {
            console.log('(FAIL)');
            res.send(err);
        }
    })
})

module.exports = router;