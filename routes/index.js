const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require("../routes/connection");

const tableQuery = () => {
  return `
    SELECT AVG(windDirection) AS windDirection,
           ROUND(AVG(substr(windSpeed, 1, 3)), 2) AS windSpeed,
           rgst_dt
    FROM finedust_tb
    GROUP BY SUBSTR(rgst_dt, 1, 10)
    ORDER BY rgst_dt DESC
    LIMIT 15
  `;
}

/* GET home page. */
router.get('/', function(req, res) {
  const dayWindQuery = `
    SELECT ROUND(AVG(windSpeed), 2) AS windSpeed,  SUBSTR(rgst_dt, 6, 5) AS rgst_dt
    FROM finedust_tb
    WHERE now() >= rgst_dt
    GROUP BY LEFT(rgst_dt, 10)
    order by rgst_dt desc
  `;

  const timeWindQueryForLast6daysQuery = `
    SELECT ROUND(AVG(windSpeed), 2) AS windSpeed
    FROM finedust_tb
    WHERE SUBSTR(rgst_dt, 12, 2) % 2 = 0 AND now() > rgst_dt
    GROUP BY LEFT(rgst_dt, 13)
    order by rgst_dt desc
    LIMIT 72
  `;

  const timeWindDataForLastDayQuery = `
    SELECT ROUND(AVG(windSpeed), 2) AS windSpeed
    FROM finedust_tb
    WHERE SUBSTR(rgst_dt, 12, 2) % 2 = 0 and day(now()) = day(rgst_dt) AND month(now()) = month(rgst_dt)
    GROUP BY LEFT(rgst_dt, 13)
  `;

  let dayWindData, timeWindDataFor6days, timeWindDataForLastDay;

  connection.query(dayWindQuery, function (err, rows) {
    if(!err) {
      dayWindData = rows;
    } else {
      console.log('dayWindData send Err' + err);
      res.render('index', err);
    }
  })

  connection.query(timeWindQueryForLast6daysQuery, function (err, rows) {
    if(!err) {
      timeWindDataFor6days = rows;
    } else {
      console.log('timeWindDataFor6days send Err' + err);
      res.render('index', err);
    }
  })

  connection.query(timeWindDataForLastDayQuery, function (err, rows) {
    if(!err) {
      timeWindDataForLastDay = rows;
    } else {
      console.log('timeWindDataForLastDay send Err' + err);
      res.render('index', err);
    }
  })

  connection.query(tableQuery(req.query), (err, rows) => {
    if (!err) {
      res.render('index', {'datasOfTable': rows.map(data => {
          return {
            windDirection: data.windDirection,
            windSpeed: data.windSpeed,
            rgst_dt: moment(data.rgst_dt).format('YYYY-MM-DD')
          }
        }), 'dayWindData': dayWindData, 'timeWindDataFor6days': timeWindDataFor6days, 'timeWindDataForLastDay': timeWindDataForLastDay
      });
    }
    else {
      console.log(err);
      res.render('index', err);
    }
  })
});

module.exports = router;
