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
    var fusd_zeth_amount = Object.values(fungibleResponse.find(x => x.id == 5).result?.balances ?? 0)[0] ?? 0
   
    console.log(`fuck ${fungibleResponse.find(x => x.id == 5).result?.balances}`)
    // used once to get penny units
    var zil_amount = await fungibleUtil.GetNativeZilBalanceForAddress(address)
    var wzil_amount = Object.values(fungibleResponse.find(x => x.id == 1).result?.balances ?? 0)[0] ?? 0
    var gzil_amount = Object.values(fungibleResponse.find(x => x.id == 2).result?.balances ?? 0)[0] ?? 0
    var xsgd_amount = Object.values(fungibleResponse.find(x => x.id == 3).result?.balances ?? 0)[0] ?? 0
    var zwbtc_amount = Object.values(fungibleResponse.find(x => x.id == 4).result?.balances ?? 0)[0] ?? 0
    var zeth_amount = Object.values(fungibleResponse.find(x => x.id == 5).result?.balances ?? 0)[0] ?? 0
    var zusdt_amount = Object.values(fungibleResponse.find(x => x.id == 6).result?.balances ?? 0)[0] ?? 0
    var duck_amount = Object.values(fungibleResponse.find(x => x.id == 7).result?.balances ?? 0)[0] ?? 0


    // penny units -> USD
    const usd_zil_amount = parseFloat(await getUSDValuefromTokens("zil", zil_amount) ?? 0 )
    const usd_wzil_amount = parseFloat(await getUSDValuefromTokens("wzil", wzil_amount) ?? 0 )
    const usd_gzil_amount = parseFloat(await getUSDValuefromTokens("gzil", gzil_amount) ?? 0 )
    const usd_xsgd_amount = parseFloat(await getUSDValuefromTokens("xsgd", xsgd_amount) ?? 0 )
    const usd_zwbtc_amount = parseFloat(await getUSDValuefromTokens("zwbtc", zwbtc_amount) ?? 0 )
    const usd_zeth_amount = parseFloat(await getUSDValuefromTokens("zeth", zeth_amount) ?? 0 )
    const usd_zusdt_amount = parseFloat(await getUSDValuefromTokens("zusdt", zusdt_amount) ?? 0 )
    const usd_duck_amount = parseFloat(await getUSDValuefromTokens("duck", duck_amount) ?? 0 )

    // penny units -> full decimal units
    zil_amount = new Big(await fungibleUtil.GetNativeZilBalanceForAddress(address)).div(new Big(10).pow(12));
    wzil_amount = new Big(Object.values(fungibleResponse.find(x => x.id == 1).result?.balances ?? 0)[0] ?? 0).div(new Big(10).pow(12));
    gzil_amount = new Big(Object.values(fungibleResponse.find(x => x.id == 2).result?.balances ?? 0)[0] ?? 0).div(new Big(10).pow(15));
    xsgd_amount = new Big(Object.values(fungibleResponse.find(x => x.id == 3).result?.balances ?? 0)[0] ?? 0).div(new Big(10).pow(6));
    zwbtc_amount = new Big(Object.values(fungibleResponse.find(x => x.id == 4).result?.balances ?? 0)[0] ?? 0).div(new Big(10).pow(8));
    zeth_amount = new Big(Object.values(fungibleResponse.find(x => x.id == 5).result?.balances ?? 0)[0] ?? 0).div(new Big(10).pow(18));
    zusdt_amount = new Big(Object.values(fungibleResponse.find(x => x.id == 6).result?.balances ?? 0)[0] ?? 0).div(new Big(10).pow(6));
    duck_amount = new Big(Object.values(fungibleResponse.find(x => x.id == 7).result?.balances ?? 0)[0] ?? 0).div(new Big(10).pow(2));

    const total_usd_value = (usd_zil_amount + usd_wzil_amount + usd_gzil_amount + usd_xsgd_amount + usd_zwbtc_amount + usd_zeth_amount + usd_zusdt_amount + usd_duck_amount).toFixed(2)
    return {
        zil_amount: zil_amount,
        zil_usd_amount : usd_zil_amount,
        wzil_amount: wzil_amount,
        wzil_usd_amount : usd_wzil_amount,
        gzil_amount: gzil_amount,
        gzil_usd_amount : usd_gzil_amount,
        xsgd_amount: xsgd_amount,
        xsgd_usd_amount : usd_xsgd_amount,
        zwbtc_amount: zwbtc_amount,
        zwbtc_usd_amount : usd_zwbtc_amount,
        zeth_amount: zeth_amount,
        zeth_usd_amount : usd_zeth_amount,
        zusdt_amount: zusdt_amount,
        zusdt_usd_amount : usd_zusdt_amount,
        duck_amount: duck_amount,
        duck_usd_amount : usd_duck_amount,
        total_usd_value : total_usd_value
    }
}

function PennyUnitsToFullDecimal()
{

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