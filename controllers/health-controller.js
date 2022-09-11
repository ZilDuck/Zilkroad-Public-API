// No cache - need live feed
module.exports = {
    getHealth: async function(req, res) 
    {
        res.send("OK")
    }
}