/************************************************/
/************** API CALLBACK METHODS **************/
/************************************************/

// These are consumed by the hooks so we dont need to keep defining them

// Postgres client setup and config
const { Pool } = require("pg");
const { off } = require('process');
const keys = require("../keys");
require("dotenv").config();

const crypto = require('crypto')

const pgClient = new Pool
({
  user: keys.PGHOST,
  host: keys.PGHOST,
  database: keys.PGDATABASE,
  password: keys.PGPASSWORD,
  port: keys.PGPORT
});

console.log(pgClient)

const { Zilliqa } = require('@zilliqa-js/zilliqa');

const zilliqa = new Zilliqa(process.env.current_network);

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