const logger = require('../logger')
const axios = require("axios");
const Big = require('big.js');

function FungibleLookupModel(fungible_symbol, fungible_amount, decimals, output_amount_as_usd, one_token_as_zil, one_token_as_usd, fungible_change_24h_bps, fungible_change_7d_bps)
{
    return {
        fungible_symbol: fungible_symbol, 
        fungible_amount: fungible_amount, 
        decimals: decimals,
        output_amount_as_usd: output_amount_as_usd, 
        one_token_as_zil: one_token_as_zil, 
        one_token_as_usd: one_token_as_usd, 
        fungible_change_24h_bps: fungible_change_24h_bps, 
        fungible_change_7d_bps: fungible_change_7d_bps
    }
}


async function LookupFungiblePriceData(fungible_symbol, fungible_amount)
{
    if(fungible_amount == 0 || fungible_amount == undefined) return

    const final_symbol = fungible_symbol.toLowerCase() == "wzil" ? "zil" : fungible_symbol;

    const token_info =
    (
      await axios.get(`https://api.zilstream.com/tokens/${final_symbol}`).catch((error) => {
          logger.errorLog(`Unable to get price data for fungible: ${final_symbol}: ${error}`)
          throw 'Unable to get price data for fungible'
      })
    )

    const decimals = token_info.data.decimals; 
    const rate = token_info.data.rate.toFixed();
    const rate_usd = token_info.data.rate_usd.toFixed(2);
    const change_percentage_24h = token_info.data.market_data.change_percentage_24h.toFixed(2);
    const change_percentage_7d = token_info.data.market_data.change_percentage_7d.toFixed(2);

    const numberWithDecimal = new Big(fungible_amount).div(new Big(10).pow(decimals));
    //logger.infoLog(`${numberWithDecimal} blockchain amount`)
  

    const outputAmountUSD = new Big(rate_usd).mul(numberWithDecimal).round(2);
    const oneTokenAsUSD = new Big(rate_usd).round(2);
    //logger.infoLog(`trade value of ${fungible_symbol} is ${outputAmountUSD} // 1 token as USD 2DP ${oneTokenAsUSD}`)

    return FungibleLookupModel(fungible_symbol, fungible_amount, decimals, outputAmountUSD, rate, rate_usd, change_percentage_24h, change_percentage_7d)
}


module.exports = {
    LookupFungiblePriceData
}
