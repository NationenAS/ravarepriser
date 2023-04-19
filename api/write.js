const { getCommo } = require("./commo-now")
const fs = require("fs")

export default async function handler(req, res) {
  
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    
    // Enable cache
    res.setHeader('Cache-Control', 's-maxage=7200') // 1 hour

    
    // Fetch
    let c = await getCommo()
    
    // Write
    fs.writeFileSync('./commo.json', JSON.stringify(c))

    // Send
    res.send("Success.")

}