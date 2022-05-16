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

    if(period.toLowerCase() === `day`)
    {
        const result = await DBGetAllCalendarDataBetweenPeriod(limit, offset, dateUtils.getTodayAsUnix(), dateUtils.getTomorrowAsUnix())  
        return CreateCalendarFromResultSet(result, timezone)
    }
    if(period.toLowerCase() === `week`)
    {
        const result = await DBGetAllCalendarDataBetweenPeriod(limit, offset, dateUtils.getTodayAsUnix(), dateUtils.GetAWeekAheadAsUnix())
        return CreateCalendarFromResultSet(result, timezone)
    }
    if(period.toLowerCase() === `month`)
    {
        const result = await DBGetAllCalendarDataBetweenPeriod(limit, offset, dateUtils.getTodayAsUnix(), dateUtils.GetAMonthAheadAsUnix())
        return CreateCalendarFromResultSet(result, timezone)
    }
    if(period.toLowerCase() === `year`) // if today if 16/04/22 then a year is 01/01/21
    {
        const result = await DBGetAllCalendarDataBetweenPeriod(limit, offset, dateUtils.getTodayAsUnix(), dateUtils.GetAYearAheadAsUnix())
        return CreateCalendarFromResultSet(result, timezone)
    }
    if(period.toLowerCase() === `all`) 
    {
        const result = await DBGetAllCalendarData()
        return CreateCalendarFromResultSet(result, timezone)
    }
}


async function DBGetAllCalendarData() 
{
    logger.infoLog(`MODEL - Calendar - DBGetAllCalendarData - HIT`)
    
    var result = await pgClient.query("SELECT * FROM fn_getAllCalendarData()")
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
    console.log(values)
    var result = await pgClient.query(sql, values)
    logger.debugLog(result.rows)
    return result.rows
}


module.exports = {
    GetCalendarForPeriod
}