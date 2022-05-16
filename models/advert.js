const client = require('../utils/expressUtils')
const pgClient = client.ReturnPool()

let advert = {
  id: 0,
  title: `Ad Title`,
  advertise_description: ``,
  advertise_uri: '',
  advertImage: '',
  advertType: 'large'
}

async function getAdvert(id = 0) {

  const query = {
    name: 'fetch-advert',
    text: 'SELECT * FROM tbl_advertise_card WHERE advertise_card_id = $1', //fn_getCardByID 
    values: [id]
  }

  let dbData = await pgClient.query(query).then(res => {
    return res.rows[0]
  }).catch(e => console.error(e.stack))

  return { ...advert, ...dbData }

}

function getAdverts() {
  adverts = []
  for (let advertCount = 0; advertCount < 7; advertCount++) {
    adverts.push(getAdvert(advertCount))
  }
  return adverts
}

module.exports = {
  getAdvert,
  getAdverts
}