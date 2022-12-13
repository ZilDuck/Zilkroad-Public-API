/************************************************/
/************** API CALLBACK METHODS **************/
/************************************************/

// These are consumed by the hooks so we dont need to keep defining them

// Postgres client setup and config
const { Pool } = require("pg");
const { off } = require('process');
const keys = require("../keys");
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const logger = require("../logger");

const zilliqa = new Zilliqa(process.env.current_network);
require("dotenv").config();

const crypto = require('crypto')

logger.infoLog(`network is_testnet: ${process.env.is_testnet}`)

const pgClient = new Pool
({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.connect((err, client, release) => {
  if (err) {
    logger.errorLog('Error acquiring client', err.stack)
    throw 'Error acquiring client: ' + err.stack
  }
  client.query('SELECT NOW()', (err, result) => {
    release()
    if (err) {
      logger.errorLog('Error executing query', err.stack)
      throw 'Error executing query: ' + err.stack
    }
    logger.infoLog(result.rows)
  })
})

module.exports = 
{
  indexApiKey:'cd66db4a-cfc8-4db3-951c-b9c633566196',
  zilliqa: zilliqa,

  returnNetworkedZilliqaObject: function (network_uri) {
    return new Zilliqa(network_uri); 
  },
  
  Return200DataCallback: async function (data_to_emit, res) {
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json(data_to_emit)
  },

  Return400ErrorCallback: async function (error_to_emit, res) {
    res.setHeader("Content-Type", "application/json");
    res.status(418);
    res.json(error_to_emit)
  },

  ReturnPool: function() {
    return pgClient;
  },

  getCircularReplacer: function(){
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  },

  hash: async function(source)
  {
    return crypto.createHash('md5').update(source).digest('hex')

  }
};
