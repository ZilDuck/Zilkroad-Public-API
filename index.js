require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require('./logger.js')
var helmet = require('helmet')

// Express client setup
const app = express();
app.use(cors());
// Allows unsafe ascii characters https://www.w3schools.com/tags/ref_urlencode.ASP
app.use(bodyParser.urlencoded({ extended: false }))
// Parse incoming request bodies in a middleware before your handlers, available in req.body
app.use(bodyParser.json());
// Secures well known http header vulnerabilities https://expressjs.com/en/advanced/best-practice-security.html
app.use(helmet())
// Don't tell sniffers what our API is
app.disable('x-powered-by')
// timeout queries
app.timeout = (1000 * 60 * 1) / 2; // (1min /2) = 30s 


// Restful endpoints
const collectionRouter = require('./routes/collection-route')
app.use('/collections', collectionRouter)

const metadataRouter = require('./routes/metadata-route')
app.use('/metadata', metadataRouter)

const collectionStatsRouter = require('./routes/collection-stats-route')
app.use('/collection-stats', collectionStatsRouter)

const collectionRankRouter = require('./routes/collection-ranks-route')
app.use('/collection-ranks', collectionRankRouter)

const nftRouter = require('./routes/nft-route')
app.use('/nfts', nftRouter)

const walletRouter = require('./routes/wallet-route')
app.use('/wallets', walletRouter)

const searchRouter = require('./routes/search-route')
app.use('/search', searchRouter)

const advertRouter = require('./routes/advert-route')
app.use('/adverts', advertRouter)

const primarySalesRouter = require('./routes/primary-sales-route')
app.use('/primary-sales', primarySalesRouter)

const userStatsRouter = require('./routes/user-stats-route')
app.use('/user-stats', userStatsRouter)

const skinnyUserStatsRouter = require('./routes/skinny-user-stats-route')
app.use('/skinny-user-stats', skinnyUserStatsRouter)

const userFungibleRouter = require('./routes/user-fungible-route')
app.use('/user-fungible', userFungibleRouter)

const fungiblePriceLookupRouter = require('./routes/fungible-price-lookup')
app.use('/fungible-price-lookup', fungiblePriceLookupRouter)

const calendarRouter = require('./routes/calendar-route')
app.use('/calendar', calendarRouter)

const sitewideStatsRouter = require('./routes/sitewide-stats-route')
app.use('/site-stats', sitewideStatsRouter)

const cacheRoute = require('./routes/cache-route')
app.use('/cache', cacheRoute)

const healthRouter = require('./routes/health-route')
app.use('/health', healthRouter)

const marketplaceRoute = require('./routes/marketplace-route')
app.use('/marketplace', marketplaceRoute)

const walletActivitiesRoute = require('./routes/wallet-activities-route')
app.use('/wallet-activities', walletActivitiesRoute)

// END Restful endpoints

// On API start
app.listen(process.env.PUBLIC_API_PORT, '0.0.0.0')
logger.infoLog(`Public API Listening ${process.env.PUBLIC_API_PORT}`)
