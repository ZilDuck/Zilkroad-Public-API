var log4js = require("log4js");

const log_level = "debug"; // toggle logging level
var log_prefix = new Date().toISOString().slice(0, 10);

log4js.configure({
    appenders: {
        console: { type: 'console' },
        everything: {
            type: 'dateFile',
            filename: `logs/${log_prefix}-zr-public-api.log`,
            pattern: 'yyyy-MM-dd-hh',
            maxLogSize: 10485760,
            backups: 2
        } //compress: true
    },
    categories: {
        default: { appenders: ["console", "everything"], level: log_level },
    },
});

var logger = log4js.getLogger();
logger.level = log_level;


async function debugLog(text_to_log) {
    logger.debug(text_to_log)
}

async function infoLog(text_to_log) {
    logger.info(text_to_log)
}

async function warnLog(text_to_log) {
    logger.warn(text_to_log)
}

async function errorLog(text_to_log) {
    logger.error(text_to_log)
}



module.exports = {
    debugLog: function (text_to_log) {
        return debugLog(text_to_log)
    },
    infoLog: function (text_to_log) {
        return infoLog(text_to_log)
    },
    warnLog: function (text_to_log) {
        return warnLog(text_to_log)
    },
    errorLog: function (text_to_log) {
        return errorLog(text_to_log)
    },
};