require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js');
const logger = require('../logger');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
client.login(process.env.discord_token);

const siteReportsChannel = "1009161755584364644"

module.exports = 
{
    SendReportMessage: async function(contract, user)
    {
        console.log(`REPORT - ${contract}/${user}`)
        const channel = await client.channels.fetch(siteReportsChannel).catch((error) => {
            logger.errorLog(`User: ${user} unable to report contract: ${contract}: ${error}`)
            throw 'Unable to report collection'
        })
        channel.send(`User ${user} reported contract ${contract}`);
    }
}