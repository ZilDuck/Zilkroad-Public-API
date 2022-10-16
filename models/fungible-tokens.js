const axios = require("axios");
const fungibleUtil = require('../utils/fungibleUtils')
const Big = require('big.js');
/*
 * SHAPE DEFINITION
 */

const fungibles = {
  'zil': '0',
  'wzil': '1',
  'gzil': '2',
  'xsgd': '3',
  'zwbtc': '4',
  'zeth': '5',
  'zusdt': '6',
  'duck': '7'
}
const decimals = {
  'zil': 12,
  'wzil': 12,
  'gzil': 15,
  'xsgd': 6,
  'zwbtc': 8,
  'zeth': 18,
  'zusdt': 6,
  'duck': 2
}

//improve by getting rates once an hour and using those instead of refetching
// TODO - Cache the usd rate , as that'll save a lot of time in the future 
async function GetFungibleDataForAddress(address)
{
  let data = {}
  let fungibleResponse = await fungibleUtil.GetFungibleAmountForAddress(address)
  let fungibleAllowance = await fungibleUtil.GetFungibleAllowancesForAddress(address)
  // Force zil to be 0'th index
  fungibleResponse["0"] = await fungibleUtil.GetNativeZilBalanceForAddress(address)
  fungibleAllowance["0"] = "0"


  let total_usd_value = 0
  for ( const [fungible, id] of Object.entries(fungibles) ) {
    let amount_key = fungible + "_amount"
    let usd_key = fungible + "_usd_amount"
    let allowance_key = fungible + "_allowance"

    let balance = new Big(fungibleResponse[id] ?? 0 ).div(new Big(10).pow(decimals[fungible]))
    let allowance = new Big(fungibleAllowance[id] ?? 0 ).div(new Big(10).pow(decimals[fungible]))
    let usd_value = await getUSDValuefromTokens(fungible, balance)
    total_usd_value += usd_value

    data[amount_key] = balance
    data[usd_key] = usd_value
    data[allowance_key] = allowance
  }
  data["total_usd_value"] = total_usd_value
  
  return data
}

async function getUSDValuefromTokens(fungible, numberOfTokens) 
{
  if(numberOfTokens == 0 || numberOfTokens == undefined) return 0.0
  // account for wzil
  const final_fungible = fungible.toLowerCase() == "wzil" ? "zil" : fungible;
  const token_info =
  (
    await axios.get(`https://api.zilstream.com/tokens/${final_fungible}`)
  )
  const usd_rate = token_info.data.rate_usd;

  const tradedValueUSD = new Big(usd_rate).mul(numberOfTokens).round(2);
  return parseFloat(tradedValueUSD)
}


module.exports = {
  GetFungibleDataForAddress
}