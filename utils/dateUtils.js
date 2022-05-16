


module.exports = 
{
    dayInUnix:86400,
    weekInUnix: 604800,
    monthInUnix: 2678400, //31 day months
    yearInUnix: 31556926,

    unixToLocalDateTime: function (unix, timezone)
    {
        console.log(unix,locale)
        locale = validateDateLocale(locale)
        const date = new Date(unix * 1000).setZone(timezone)
        const time = new Date(unix * 1000).setZone(timezone)
        return date + ' ' + time
    },

    getTodayAsUnix: function()
    {
        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        console.log(`today is ${Math.round(startOfDay / 1000)}`)
        return Math.round(startOfDay / 1000);
    },
    getTomorrowAsUnix: function()
    {
        var today = new Date();
        var tomorrow = today.setUTCDate(today.getUTCDate() + 1);
        console.log(`tomorrow is ${Math.round(tomorrow / 1000)}`)
        return Math.round(tomorrow / 1000)
    },
    GetAWeekAheadAsUnix: function()
    {
        var today = new Date();
        var week = today.setUTCDate(today.getUTCDate() + 7);
        console.log(`week is ${Math.round(week / 1000)}`)
        return Math.round(week / 1000)
    },
    GetAMonthAheadAsUnix: function()
    {
        var today = new Date();
        var month = today.setUTCDate(today.getUTCDate() + 31);
        console.log(`month is ${Math.round(month / 1000)}`)
        return Math.round(month / 1000)
    },
    GetAYearAheadAsUnix: function()
    {
        var today = new Date();
        var year = today.setUTCDate(today.getUTCDate() + 365);
        console.log(`year is ${Math.round(year / 1000)}`)
        return Math.round(year / 1000)
    },
    //https://stackoverflow.com/questions/439630/create-a-date-with-a-set-timezone-without-using-a-string-representation
    convertUnixToDateWithTimezone: function(unix, timezone) 
    {
        return new Date(unix * 1000).toLocaleString("en-GB", {timeZone: validateTimezone(timezone)}) 
    }
    
}

function validateTimezone(timezone)
{
    try {
        Intl.DateTimeFormat(undefined, {timeZone: timezone});
        return timezone;
    }
    catch (ex) {
        return 'Europe/London'
    }
}
