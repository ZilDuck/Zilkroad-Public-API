const axios = require("axios");
const fungibleUtil = require('../utils/fungibleUtils')
const Big = require('big.js');
/*
 * SHAPE DEFINITION
 */

//improve by getting rates once an hour and using those instead of refetching
async function GetFungibleDataForAddress(address)
{
    const fungibleResponse = await fungibleUtil.GetFungibleAmountForAddress(address)

    const wzil_amount = Object.values(fungibleResponse.find(x => x.id == 1).result?.balances ?? 0)[0]
    const gzil_amount = Object.values(fungibleResponse.find(x => x.id == 2).result?.balances ?? 0)[0]
    const xsgd_amount = Object.values(fungibleResponse.find(x => x.id == 3).result?.balances ?? 0)[0]
    const zwbtc_amount = Object.values(fungibleResponse.find(x => x.id == 4).result?.balances ?? 0)[0]
    const zeth_amount = Object.values(fungibleResponse.find(x => x.id == 5).result?.balances ?? 0)[0]
    const zusdt_amount = Object.values(fungibleResponse.find(x => x.id == 6).result?.balances ?? 0)[0]
    const duck_amount = Object.values(fungibleResponse.find(x => x.id == 7).result?.balances ?? 0)[0]

    const usd_wzil_amount = await getUSDValuefromTokens("wzil", wzil_amount) ?? 0
    const usd_gzil_amount = await getUSDValuefromTokens("gzil", gzil_amount) ?? 0
    const usd_xsgd_amount = await getUSDValuefromTokens("xsgd", xsgd_amount) ?? 0
    const usd_zwbtc_amount = await getUSDValuefromTokens("zwbtc", zwbtc_amount) ?? 0
    const usd_zeth_amount = await getUSDValuefromTokens("zeth", zeth_amount) ?? 0
    const usd_zusdt_amount = await getUSDValuefromTokens("zusdt", zusdt_amount) ?? 0
    const usd_duck_amount = await getUSDValuefromTokens("duck", duck_amount) ?? 0

    return {
        wzil_amount,
        wzil_usd_amount : usd_wzil_amount,
        gzil_amount,
        gzil_usd_amount : usd_gzil_amount,
        xsgd_amount,
        xsgd_usd_amount : usd_xsgd_amount,
        zwbtc_amount,
        zwbtc_usd_amount : usd_zwbtc_amount,
        zeth_amount,
        zeth_usd_amount : usd_zeth_amount,
        zusdt_amount,
        zusdt_usd_amount : usd_zusdt_amount,
        duck_amount,
        duck_usd_amount : usd_duck_amount
    }
}


// give it ticker and it'll figure out how  (mainnet only)
async function getUSDValuefromTokens(ticker, numberOfTokens) 
{
  if(numberOfTokens == 0 || numberOfTokens == undefined) return
  console.log('hello', ticker, numberOfTokens)
  // account for wzil
  const final_ticker = ticker.toLowerCase() == "wzil" ? "zil" : ticker;
  const token_info =
  (
    await axios.get(`https://api.zilstream.com/tokens/${final_ticker}`)
  )
  const usd_rate = token_info.data.rate_usd;
  const decimals = token_info.data.decimals;

  const numberWithDecimal = new Big(numberOfTokens).div(new Big(10).pow(decimals));
  console.log(`${numberWithDecimal} blockchain amount`)

  // TODO break each one into new method
  const tradedValueUSD = new Big(usd_rate).mul(numberWithDecimal).round(2);
  const oneTokenAsUSD = new Big(usd_rate).round(2);
  console.log(`trade value of ${ticker} is ${tradedValueUSD} // 1 token as USD 2DP ${oneTokenAsUSD}`)
  return tradedValueUSD
}


module.exports = {
  GetFungibleDataForAddress
}