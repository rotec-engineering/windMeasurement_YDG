const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require("../connection");

const conditionQuery = (req_Obj) => {
    const param = req_Obj;
    const kind = param.kind;
    const year = param.year;
    const month = param.month;
    const quarter = param.quarter;
    const week = param.week;
    const start = `${param.startDate} ${param.startTime}:00:00`;
    const end = `${param.endDate} ${param.endTime}:00:00`;

    switch (kind) {
        case "custom":
            return `WHERE rgst_dt BETWEEN '${start}' AND '${end}'`;
            break;
        case "year":
            return `WHERE year(rgst_dt) = ${year}`;
            break;
        case "quarter":
            return `WHERE year(rgst_dt) = ${year} AND quarter(rgst_dt) = ${quarter}`;
            break;
        case "month":
            return `WHERE year(rgst_dt) = ${year} AND month(rgst_dt) = ${month}`;
            break;
        case "week":
            return `WHERE year(rgst_dt) = ${year} AND month(rgst_dt) = ${month} 
                    AND (WEEK(rgst_dt) - WEEK("${year}-${month}-01") + 1) = ${week}`
        default:
            console.log("conditionQueryErr");
    }
}
const tableQuery = (req_Obj, data) => {
    let query;
    if(data == 1) {
        query = ``;
    } else {
        query = conditionQuery(req_Obj);
    }

    return `
    SELECT MAX(pm10_0) AS dust,
           MAX(pm2_5) AS ultrafine,
           AVG(windDirection) AS windDirection,
           ROUND(AVG(substr(windSpeed, 1, 3)), 2) AS windSpeed,
           ROUND(AVG(temperature), 1) As temperature,
           ROUND(AVG(humidity), 1) AS humidity,
           rgst_dt
    FROM finedust_tb ${query}
    GROUP BY SUBSTR(rgst_dt, 1, 10)
    ORDER BY rgst_dt DESC
  `;
}

/* GET home page. */
router.get('/', function(req, res, next) {
    connection.query(tableQuery(req.query, 1), (err, rows, fields) => {
        if (!err) {
            res.render('home/windDetail', {'datas': rows.map(data => {
                    return {
                        windDirection: data.windDirection,
                        windSpeed: data.windSpeed,
                        temperature: data.temperature,
                        humidity: data.humidity,
                        rgst_dt: moment(data.rgst_dt).format('YYYY-MM-DD')
                    }
                })
            });
        }
        else {
            console.log(err);
            res.render('home/windDetail', err);
        }
    })
});
router.get('/api/search', (req, res, next) => {
    connection.query(tableQuery(req.query, 0), (err, rows, fields) => {
        if (!err) {
            let result;

            rows.forEach(data => {
                const html = `
                    <tr>
                        <td>${moment(data.rgst_dt).format('YYYY-MM-DD')}</td>
                        <td>
                        
                            <img class="wind-direction-icon" src="images/arrow-icon.png" alt="wind-direction" style="width: 40px; transform: rotate(${data.windDirection}deg);" />
                            
                        </td>
                        <td>${data.windSpeed} (m/s)</td>

                    </tr>
                `
                result += html;
            });
            res.send(result);
        }
        else {
            console.log(err);
            res.send(err);
        }
    })
})

module.exports = router;
