const axios = require("axios");

/*
 * SHAPE DEFINITION
 */
async function MakeFungibleObject(WZIL_amount, GZIL_amount, XSGD_amount, zWBTC_amount, zWETH_amount, zUSDT_amount, DUCK_amount)
{

    var wzil_amount = await getUSDValuefromTokens("wzil", WZIL_amount)
    var gzil_amount = await getUSDValuefromTokens("gzil", GZIL_amount)
    var xsgd_amount = await getUSDValuefromTokens("xsgd", XSGD_amount)
    var zwbtc_amount = await getUSDValuefromTokens("zwbtc", zWBTC_amount)
    var zeth_amount = await getUSDValuefromTokens("zeth", zWETH_amount)
    var zusdt_amount = await getUSDValuefromTokens("zusdt", zUSDT_amount)
    var duck_amount = await getUSDValuefromTokens("duck", DUCK_amount)

    return {
        WZIL_amount,
        WZIL_usd_amount : wzil_amount,
        GZIL_amount,
        WZIL_usd_amount : gzil_amount,
        XSGD_amount,
        XSGD_usd_amount : xsgd_amount,
        zWBTC_amount,
        zWBTC_usd_amount : zwbtc_amount,
        zWETH_amount,
        zWETH_usd_amount : zeth_amount,
        zUSDT_amount,
        zUSDT_usd_amount : zusdt_amount,
        DUCK_amount,
        DUCK_usd_amount : duck_amount
    }
}


// give it ticker and it'll figure out how  (mainnet only)
async function getUSDValuefromTokens(ticker, numberOfTokens) 
{
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
}
