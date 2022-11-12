const dateUtils = require('../utils/dateUtils.js')
const logger = require('../logger')
const client = require('../utils/expressUtils.js')
const pgClient = client.ReturnPool()


function Calender(calendar_unixtime, calendar_description,  calendar_website,  calendar_image, timezone)
{
    return {
        calendar_unixtime,
        calendar_datetime : dateUtils.convertUnixToDateWithTimezone(Number.parseInt(calendar_unixtime, 10), timezone),
        datetime_timezone: timezone,
        calendar_description, 
        calendar_website, 
        calendar_image
    }
}

function CreateCalendarFromResultSet(result, timezone)
{
    var resultArray = []
    for(res in result)
    {
        console.log(result[res])
        resultArray.push(Calender(result[res].calendar_unixtime, result[res].calendar_description, result[res].calendar_website, result[res].calendar_image, timezone))
    }
    return resultArray;
}

async function GetCalendarForPeriod(period, limit, offset, timezone)
{

    let util = undefined
    switch (period.toLowerCase()) {
        case 'day':
            util = dateUtils.getTomorrowAsUnix()
            break
        case 'week':
            util = dateUtils.GetAWeekAheadAsUnix()
            break
        case 'month':
            util = dateUtils.GetAMonthAheadAsUnix()
            break
        case 'year':
            util = dateUtils.GetAYearAheadAsUnix()
            break
        default:
            util = undefined
            break
    }
    if (util === undefined) {
        const result = await DBGetAllCalendarData().catch((error) => {throw error})
        return CreateCalendarFromResultSet(result, timezone) 
    } else {
        const result = await DBGetAllCalendarDataBetweenPeriod(
            limit,
            offset,
            dateUtils.getTodayAsUnix(),
            util
        ).catch((error) => {throw error})

        return CreateCalendarFromResultSet(result, timezone)
    }
}

async function DBGetAllCalendarData() 
{
    logger.infoLog(`MODEL - Calendar - DBGetAllCalendarData - HIT`)
    
    var result = await pgClient.query("SELECT * FROM fn_getAllCalendarData()").catch((error) => {
        logger.errorLog(`Unable to get all calendar events: ${error}`)
        throw 'Unable to get all calendar events'
    })
    logger.debugLog(result.rows)
    return result.rows
}

async function DBGetAllCalendarDataBetweenPeriod(limit, offset,unix_from, unix_to) 
{
    logger.infoLog(`MODEL - Calendar - DBGetAllCalendarDataBetweenPeriod - HIT`)
    
    const sql = 'SELECT * FROM fn_getAllCalendarDataBetweenPeriod($1, $2, $3, $4)'
    const values = [
      limit,
      offset,
      unix_from,
      unix_to
    ]
    var result = await pgClient.query(sql, values).catch((error) => {
        logger.errorLog(`Unable to get calendar events for a given time period (from: ${unix_from} to ${unix_to}): ${error}`)
        throw 'Unable to get calendar events for a given time period'
    })
    logger.debugLog(result.rows)
    return result.rows
}


module.exports = {
    GetCalendarForPeriod
}