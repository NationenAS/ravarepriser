const { getEl } = require("./entsoe-now")
const { getCommo } = require("./commo-now")

export default async function handler(req, res) {
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  // Enable cache
  res.setHeader('Cache-Control', 's-maxage=3600') // 1 hour

  
  // ----- //

  // Fetch
  let c = await getCommo()
  let e = await getEl(c)
  let combined = [...e, ...c]
  var output = combined.reduce((obj, item) => Object.assign(obj, { [item.name]: item.data }), {})

  // Send
  res.send(output)

}